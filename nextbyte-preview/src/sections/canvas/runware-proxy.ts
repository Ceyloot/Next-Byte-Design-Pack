/**
 * Proxy do Runware jako wtyczka Vite.
 *
 * Powód istnienia: Canvas to czysty SPA, a klucz API nie może trafić do
 * przeglądarki — zmienna `VITE_*` ląduje w bundlu i widać ją w zakładce
 * Network. Klucz czytamy więc po stronie serwera deweloperskiego z
 * `.env.local` (bez przedrostka `VITE_`), a przeglądarka rozmawia wyłącznie
 * z `/api/canvas/generuj` na własnym origin.
 *
 * Przy wdrożeniu ten sam kontrakt (żądanie i odpowiedź niżej) przenosi się
 * do funkcji serwerowej — Canvas nie wymaga wtedy żadnej zmiany.
 */
import type { Plugin, ViteDevServer, PreviewServer } from 'vite'
import { loadEnv } from 'vite'

const SCIEZKA = '/api/canvas/generuj'
const SCIEZKA_OPISU = '/api/canvas/rozpoznaj'
const ENDPOINT = 'https://api.runware.ai/v1'

/** Żądanie z przeglądarki */
export interface ZadanieGeneracji {
  /** gotowe polecenie — złożone przez `zbudujPolecenie` */
  polecenie: string
  /** obrazy wejściowe jako data URI; pierwszy jest tym edytowanym */
  obrazy: string[]
  szerokosc: number
  wysokosc: number
}

/** Żądanie rozpoznania obiektu pod pineską */
export interface ZadanieRozpoznania {
  /** wycinek wokół pineski albo całe zdjęcie — zależnie od trybu */
  wycinek: string
  /**
   * `obiekt` (domyślnie) nazywa jedną rzecz w centrum kadru.
   * `scena` robi inwentarz: co w ogóle jest na zdjęciu.
   */
  tryb?: 'obiekt' | 'scena'
}

/** Odpowiedź rozpoznania — krótkie nazwy po polsku */
export interface WynikRozpoznania {
  nazwy: string[]
  kosztUSD: number
  /** surowa odpowiedź modelu — do diagnozy, gdy `nazwy` wyjdą puste */
  surowy?: string
}

/** Odpowiedź do przeglądarki */
export interface WynikGeneracji {
  obrazUrl: string
  /** realny koszt w USD prosto z API — nie szacunek */
  kosztUSD: number
  model: string
  seed?: number
}

/**
 * Nano Banana nie przyjmuje dowolnych wymiarów — tylko tę listę par.
 * Zwrócił ją sam model w komunikacie błędu przy pierwszej próbie.
 */
const DOZWOLONE: [number, number][] = [
  [1024, 1024],
  [1264, 848], [848, 1264],
  [1200, 896], [896, 1200],
  [1152, 928], [928, 1152],
  [1376, 768], [768, 1376],
  [1584, 672], [672, 1584],
  [2048, 512], [512, 2048],
  [3072, 384], [384, 3072],
]

/**
 * Najbliższy dozwolony format do proporcji warstwy.
 *
 * Dobieramy po proporcji, nie po rozmiarze: pionowe zdjęcie 1453×2182
 * wysłane jako kwadrat wraca przycięte, a to najbardziej bolesny błąd,
 * bo wygląda na kaprys modelu, a nie na pomyłkę w żądaniu.
 */
export function dopasujWymiary(szerokosc: number, wysokosc: number): { width: number; height: number } {
  const cel = szerokosc / wysokosc
  const [width, height] = DOZWOLONE.reduce((naj, para) =>
    Math.abs(para[0] / para[1] - cel) < Math.abs(naj[0] / naj[1] - cel) ? para : naj,
  )
  return { width, height }
}

function czytajCialo(req: { on: (z: string, f: (c?: unknown) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    let dane = ''
    req.on('data', (c: unknown) => { dane += String(c) })
    req.on('end', () => resolve(dane))
    req.on('error', () => reject(new Error('Nie udało się odczytać żądania')))
  })
}

export function runwareProxy(): Plugin {
  let klucz = ''
  let model = 'google:nano-banana@2-lite'
  let modelOpisu = 'runware:150@2'

  const obsluz = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(SCIEZKA, async (req, res) => {
      const odpowiedz = (status: number, dane: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(dane))
      }

      if (req.method !== 'POST') return odpowiedz(405, { blad: 'Tylko POST' })
      if (!klucz) {
        return odpowiedz(503, {
          blad: 'Brak RUNWARE_API_KEY w .env.local — dopisz klucz i zrestartuj serwer deweloperski.',
        })
      }

      try {
        const zadanie = JSON.parse(await czytajCialo(req)) as ZadanieGeneracji
        if (!zadanie.polecenie?.trim()) return odpowiedz(400, { blad: 'Puste polecenie' })
        if (!zadanie.obrazy?.length) return odpowiedz(400, { blad: 'Brak obrazu wejściowego' })

        const { width, height } = dopasujWymiary(zadanie.szerokosc, zadanie.wysokosc)

        const runware = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([
            {
              taskType: 'imageInference',
              taskUUID: crypto.randomUUID(),
              model,
              positivePrompt: zadanie.polecenie,
              // Edycja, nie generacja od zera: zdjęcie z płótna idzie jako
              // referencja. API przyjmuje data URI, więc nie ma uploadu.
              inputs: { referenceImages: zadanie.obrazy },
              width,
              height,
              numberResults: 1,
              outputType: 'URL',
              outputFormat: 'JPG',
              outputQuality: 95,
              deliveryMethod: 'sync',
              includeCost: true,
            },
          ]),
        })

        const tresc = (await runware.json()) as {
          data?: { imageURL?: string; cost?: number; seed?: number }[]
          errors?: { message?: string }[]
        }

        const blad = tresc.errors?.[0]?.message
        if (blad) return odpowiedz(502, { blad })

        const wynik = tresc.data?.[0]
        if (!wynik?.imageURL) return odpowiedz(502, { blad: 'Runware nie zwrócił obrazu' })

        const gotowe: WynikGeneracji = {
          obrazUrl: wynik.imageURL,
          kosztUSD: wynik.cost ?? 0,
          model,
          seed: wynik.seed,
        }
        odpowiedz(200, gotowe)
      } catch (e) {
        odpowiedz(500, { blad: e instanceof Error ? e.message : 'Nieznany błąd proxy' })
      }
    })
  }

  const obsluzRozpoznanie = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(SCIEZKA_OPISU, async (req, res) => {
      const odpowiedz = (status: number, dane: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(dane))
      }
      if (req.method !== 'POST') return odpowiedz(405, { blad: 'Tylko POST' })
      if (!klucz) return odpowiedz(503, { blad: 'Brak RUNWARE_API_KEY w .env.local' })

      try {
        const { wycinek, tryb = 'obiekt' } = JSON.parse(await czytajCialo(req)) as ZadanieRozpoznania
        if (!wycinek) return odpowiedz(400, { blad: 'Brak wycinka' })

        const polecenieOpisu =
          tryb === 'scena'
            ? // Bez przykładowej listy: model potrafi ją przepisać zamiast
              // patrzeć na zdjęcie. Przy pierwszym teście oddał pięć z sześciu
              // pozycji wprost z przykładu — czyli inwentarz byłby fikcją.
              // Format opisujemy więc słowami, nie próbką.
              'Wymień obiekty faktycznie widoczne na tym konkretnym zdjęciu. Odpowiedz wyłącznie ' +
              'listą po polsku, oddzieloną przecinkami, od sześciu do dziesięciu pozycji. ' +
              'Każda pozycja to jeden lub dwa rzeczowniki w mianowniku, bez przymiotników ' +
              'i bez zdań. Nie zgaduj i nie dopisuj rzeczy typowych dla takich scen — ' +
              'wymieniaj tylko to, co widzisz.'
            : 'Nazwij główny obiekt w centrum kadru. Odpowiedz wyłącznie listą trzech ' +
              'propozycji po polsku, oddzielonych przecinkami. Każda propozycja to jeden ' +
              'lub dwa rzeczowniki w mianowniku. Bez wstępu, bez wyjaśnień, bez kropki. ' +
              'Przykład poprawnej odpowiedzi: ganek, weranda, taras.'

        const runware = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([
            {
              taskType: 'caption',
              taskUUID: crypto.randomUUID(),
              model: modelOpisu,
              inputs: { image: wycinek },
              // Prosimy o same rzeczowniki, bo nazwa pineski ma być uchwytem
              // („ganek”), a nie opisem sceny („drewniany ganek o zachodzie”).
              prompt: polecenieOpisu,
              includeCost: true,
            },
          ]),
        })

        const tresc = (await runware.json()) as {
          data?: { text?: string; cost?: number }[]
          errors?: { message?: string }[]
        }
        const blad = tresc.errors?.[0]?.message
        if (blad) return odpowiedz(502, { blad })

        const tekst = tresc.data?.[0]?.text ?? ''

        // Model bywa posłuszny („ganek, weranda, taras”), a bywa gadatliwy
        // („Na zdjęciu widoczny jest drewniany ganek…”). Najpierw próbujemy
        // listy, a gdy nic z niej nie zostanie — skracamy zdanie do kilku
        // pierwszych słów, zamiast oddawać pustkę.
        const oczysc = (t: string) =>
          t
            .trim()
            .toLowerCase()
            .replace(/^[-•\d.\s]+/, '')
            .replace(/[.]+$/, '')
            // Cudzysłowy (proste, drukarskie i „polskie”) — model lubi w nie
            // ubierać nazwy, a do chipa ma trafić samo słowo.
            .replace(/^["'„”“»«]+|["'„”“»«]+$/g, '')
            .trim()

        /**
         * Nazwa uchwytu to rzeczownik, nie urywek zdania.
         *
         * Gdy pineska trafi w puste niebo, model zamiast nazwy potrafi oddać
         * „którymś mógłby się zająć”. Taki śmieć wpisany do chipa jest gorszy
         * niż brak propozycji, bo trafia potem do polecenia — więc wszystko,
         * co wygląda na fragment zdania, odrzucamy.
         */
        const STOPKI =
          /\b(się|by|mógł|mogł|który|która|które|którym|jest|są|nie|oraz|jako|tego|tym|ten|ta|to|na|w|z|do|i)\b/

        const wyglądaNaNazwe = (t: string) => {
          const slowa = t.split(/\s+/)
          return slowa.length <= 2 && t.length > 1 && t.length <= 28 && !STOPKI.test(t)
        }

        const nazwy = tekst
          // Rozdzielamy też po myślnikach i punktorach: model raz oddaje
          // „ganek, weranda”, a raz „- Ganek - Weranda”.
          .split(/[,;\n]|\s[-–•]\s|^\s*[-–•]\s*/g)
          .map(oczysc)
          .filter(wyglądaNaNazwe)
          // Bez odsiania powtórek karta pokazuje trzy razy to samo słowo.
          .filter((t, i, lista) => lista.indexOf(t) === i)
          .slice(0, tryb === 'scena' ? 10 : 3)

        const wynik: WynikRozpoznania = {
          nazwy,
          kosztUSD: tresc.data?.[0]?.cost ?? 0,
          // Surowa odpowiedź zostaje w ciele: bez niej „brak propozycji”
          // niczym się nie różni od awarii i nie ma jak tego zdiagnozować.
          surowy: tekst,
        }
        odpowiedz(200, wynik)
      } catch (e) {
        odpowiedz(500, { blad: e instanceof Error ? e.message : 'Nieznany błąd proxy' })
      }
    })
  }

  return {
    name: 'nb-runware-proxy',
    configResolved(config) {
      // Bez przedrostka: `loadEnv` z pustym prefiksem widzi też zmienne,
      // których Vite celowo nie wpuszcza do kodu klienta.
      const env = loadEnv(config.mode, config.root, '')
      klucz = env.RUNWARE_API_KEY ?? ''
      model = env.RUNWARE_MODEL || model
      modelOpisu = env.RUNWARE_MODEL_OPISU || modelOpisu
    },
    configureServer: server => {
      obsluz(server)
      obsluzRozpoznanie(server)
    },
    configurePreviewServer: server => {
      obsluz(server)
      obsluzRozpoznanie(server)
    },
  }
}
