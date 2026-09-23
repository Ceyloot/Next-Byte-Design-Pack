/**
 * Model kanwy generatywnej.
 *
 * Nazwy pól są celowo takie same jak w `canvasStore.ts` z NextByteArt
 * (`layerId`, `normalizedX`…), mimo że reszta repo mówi po polsku. Dzięki
 * temu przeniesienie tamtejszej integracji z modelem nie wymaga tłumaczenia
 * struktur — a to jest ważniejsze niż spójność słownika w jednym folderze.
 */

export type Narzedzie = 'wybor' | 'pineska' | 'reka' | 'ramka'

export type ZrodloObrazu = 'dysk' | 'schowek' | 'upuszczenie' | 'adres' | 'wynik'

export interface Warstwa {
  id: string
  type: 'image'
  src: string
  x: number
  y: number
  width: number
  height: number
  /** oryginalna rozdzielczość — model dostaje pełną jakość, nie podgląd */
  naturalWidth: number
  naturalHeight: number
  rotation: number
  name: string
  visible: boolean
  locked: boolean
  /** skąd obraz trafił na płótno — przydaje się przy diagnozie */
  zrodlo: ZrodloObrazu
  /**
   * Co widać na zdjęciu — rozpoznane w tle zaraz po wrzuceniu.
   * Służy za zapas nazw dla pinesek i za kontekst dla polecenia.
   */
  obiekty?: string[]
}

/**
 * Pineska = zaznaczony obiekt na zdjęciu.
 *
 * To nie jest komentarz ani rola w scenariuszu, tylko **nazwany uchwyt**:
 * wbijasz ją w laptopa, nazywasz „laptop”, i od tej chwili możesz o nim
 * mówić w poleceniu jako o konkretnej rzeczy, zamiast opisywać słowami,
 * który z siedmiu obiektów na zdjęciu masz na myśli.
 */
export interface Pineska {
  id: string
  layerId: string
  /** współrzędne 0–1 względem warstwy, żeby przeżyły skalowanie obrazu */
  normalizedX: number
  normalizedY: number
  /** nazwa obiektu — to ona trafia do polecenia jako chip */
  label: string
  /**
   * Propozycje nazwy z rozpoznawania obrazu. Puste, dopóki model nie jest
   * podpięty; pole istnieje, żeby podpięcie nie wymagało zmiany modelu.
   */
  sugestie?: string[]
  /** true, gdy trwa rozpoznawanie — pineska pokazuje wtedy pulsowanie */
  analizowana?: boolean
  /**
   * Pineska chroniąca zamiast wskazującej.
   *
   * Domyślnie pineska jest uchwytem: nazywa obiekt, o którym mówisz
   * w poleceniu. Z tą flagą znaczy coś przeciwnego — „tego nie ruszaj” —
   * i trafia do polecenia jako obszar chroniony.
   */
  chroniona?: boolean
}

let licznik = 0
export function nowyId(prefiks = 'w'): string {
  licznik += 1
  return `${prefiks}${Date.now().toString(36)}${licznik.toString(36)}`
}

export interface Widok {
  x: number
  y: number
  zoom: number
}

/** Pozycja pineski w układzie płótna — z powrotem z 0–1 na piksele. */
export function pozycjaPineski(p: Pineska, warstwa: Warstwa): { x: number; y: number } {
  return {
    x: warstwa.x + p.normalizedX * warstwa.width,
    y: warstwa.y + p.normalizedY * warstwa.height,
  }
}

/**
 * Nazwa pokazywana, gdy użytkownik jeszcze nic nie wpisał.
 *
 * `label` bywa nieobecne w projektach zapisanych przed wprowadzeniem tego
 * pola, więc nie zakładamy, że jest stringiem — inaczej stary wpis
 * w localStorage wywraca cały widok.
 */
export function etykietaPineski(p: Pineska, numer: number): string {
  return (p.label ?? '').trim() || `obiekt ${numer}`
}

/**
 * Doprowadza wczytany projekt do bieżącego kształtu modelu.
 *
 * Pineski z wcześniejszej wersji miały `role` i `description` zamiast
 * `label`; warstwy nie miały `zrodlo`. Migrujemy przy odczycie, bo wersja
 * zapisu nie jest warta osobnego pola, a użytkownik nie powinien tracić
 * pracy przy każdej zmianie modelu.
 */
export function wczytajProjekt(dane: unknown): { warstwy: Warstwa[]; pineski: Pineska[]; tekst: string } {
  const surowe = (dane ?? {}) as Record<string, unknown>
  const warstwy = Array.isArray(surowe.warstwy) ? (surowe.warstwy as Record<string, unknown>[]) : []
  const pineski = Array.isArray(surowe.pineski) ? (surowe.pineski as Record<string, unknown>[]) : []

  return {
    warstwy: warstwy
      .filter(w => typeof w?.src === 'string')
      .map(w => ({
        id: String(w.id ?? nowyId('w')),
        type: 'image' as const,
        src: String(w.src),
        x: Number(w.x) || 0,
        y: Number(w.y) || 0,
        width: Number(w.width) || 200,
        height: Number(w.height) || 150,
        naturalWidth: Number(w.naturalWidth) || Number(w.width) || 200,
        naturalHeight: Number(w.naturalHeight) || Number(w.height) || 150,
        rotation: Number(w.rotation) || 0,
        name: String(w.name ?? 'Zdjęcie'),
        visible: w.visible !== false,
        locked: w.locked === true,
        zrodlo: (['dysk', 'schowek', 'upuszczenie', 'adres', 'wynik'] as const).includes(w.zrodlo as ZrodloObrazu)
          ? (w.zrodlo as ZrodloObrazu)
          : 'dysk',
        obiekty: Array.isArray(w.obiekty) ? (w.obiekty as string[]) : undefined,
      })),
    pineski: pineski
      .filter(p => typeof p?.layerId === 'string')
      .map(p => ({
        id: String(p.id ?? nowyId('p')),
        layerId: String(p.layerId),
        normalizedX: Number(p.normalizedX) || 0,
        normalizedY: Number(p.normalizedY) || 0,
        // `description` to nazwa z poprzedniej wersji modelu.
        label: String(p.label ?? p.description ?? ''),
        sugestie: Array.isArray(p.sugestie) ? (p.sugestie as string[]) : undefined,
        chroniona: p.chroniona === true,
      })),
    tekst: typeof surowe.tekst === 'string' ? surowe.tekst : typeof surowe.opis === 'string' ? surowe.opis : '',
  }
}


/**
 * Położenie pineski opisane słowami.
 *
 * Model nie przelicza „46%, 67%” na miejsce w kadrze — procenty są dla
 * niego szumem. „w dolnej części, pośrodku” trafia dużo celniej, bo tak
 * opisują sceny podpisy, na których był trenowany.
 */
export function opiszPolozenie(normalizedX: number, normalizedY: number): string {
  // Pięć pasów zamiast trzech: przy siatce 3×3 „na dole po lewej” obejmowało
  // jedną dziewiątą kadru i model trafiał w zupełnie inne miejsce.
  const pas = (v: number, nazwy: [string, string, string, string, string]) =>
    v < 0.18 ? nazwy[0] : v < 0.4 ? nazwy[1] : v < 0.6 ? nazwy[2] : v < 0.82 ? nazwy[3] : nazwy[4]

  const pion = pas(normalizedY, [
    'przy górnej krawędzi',
    'w górnej części',
    'w połowie wysokości',
    'w dolnej części',
    'przy dolnej krawędzi',
  ])
  const poziom = pas(normalizedX, [
    'przy lewej krawędzi',
    'w lewej części',
    'pośrodku szerokości',
    'w prawej części',
    'przy prawej krawędzi',
  ])
  return `${pion}, ${poziom}`
}

/**
 * Kolejność zdjęć wysyłanych do modelu.
 *
 * Pierwsze jest to, które edytujemy — w jego kadrze i proporcjach wróci
 * wynik. Dalej idą pozostałe zdjęcia z pineskami, bo skoro coś na nich
 * zaznaczono, to polecenie się na nie powołuje („weź tę altanę stamtąd”).
 * Bez nich model dostawał tylko jeden obraz i nie miał skąd wziąć obiektu.
 */
export function kolejnoscObrazow(
  warstwaEdytowana: Warstwa | null,
  pineski: Pineska[],
  warstwy: Warstwa[],
): Warstwa[] {
  const wynik: Warstwa[] = []
  const dodaj = (w?: Warstwa) => {
    if (w && !wynik.some(x => x.id === w.id)) wynik.push(w)
  }
  dodaj(warstwaEdytowana ?? undefined)
  for (const p of pineski) dodaj(warstwy.find(w => w.id === p.layerId))
  return wynik
}

/**
 * Wycinek zdjęcia wokół pineski — to, co widać w podglądzie „Zaznaczono
 * obiekt” i na chipie. Robione w pamięci, bez zapisu: dataURL wycinków
 * przy kilkunastu pineskach wysadziłby localStorage.
 */
export function wytnijOkolice(
  src: string,
  normalizedX: number,
  normalizedY: number,
  bok = 96,
  udzial = 0.22,
): Promise<string> {
  return new Promise(resolve => {
    const obrazek = new Image()
    obrazek.onload = () => {
      const zrodloBok = Math.max(24, Math.min(obrazek.width, obrazek.height) * udzial)
      const sx = Math.max(0, Math.min(obrazek.width - zrodloBok, obrazek.width * normalizedX - zrodloBok / 2))
      const sy = Math.max(0, Math.min(obrazek.height - zrodloBok, obrazek.height * normalizedY - zrodloBok / 2))

      const plotno = document.createElement('canvas')
      plotno.width = bok
      plotno.height = bok
      const g = plotno.getContext('2d')
      if (!g) return resolve('')
      g.drawImage(obrazek, sx, sy, zrodloBok, zrodloBok, 0, 0, bok, bok)
      resolve(plotno.toDataURL('image/png'))
    }
    obrazek.onerror = () => resolve('')
    obrazek.src = src
  })
}

/**
 * Stan generacji — od planu do oceny.
 *
 * Fazy `planuje` i `sprawdza` istnieją, bo pętla z agentem trwa dłużej niż
 * sama generacja, a człowiek ma prawo wiedzieć, na co czeka. Bez nich
 * kręciołek przez pół minuty nie mówiłby nic.
 */
export type StanGeneracji =
  | { faza: 'bezczynny' }
  | { faza: 'planuje' }
  | { faza: 'trwa'; plan?: string }
  | { faza: 'sprawdza'; wynik: import('./dostawca').Generacja }
  | { faza: 'blad'; tresc: string }
  | {
      faza: 'gotowe'
      wynik: import('./dostawca').Generacja
      ocena?: import('./agent-proxy').Sprawdzenie
    }

/**
 * Zmniejszona kopia zdjęcia do analizy.
 *
 * Model opisujący dostawał dotąd oryginał — przy zdjęciu 1684×2528 to prawie
 * 5 MB w base64 i Runware odrzucał takie żądania błędem 500. Rozpoznanie
 * nazw nie potrzebuje pełnej rozdzielczości: 768 px wystarczy, żeby wymienić
 * obiekty, a żądanie robi się kilkadziesiąt razy lżejsze.
 */
export function zmniejszDoAnalizy(src: string, bok = 768): Promise<string> {
  return new Promise(resolve => {
    const obrazek = new Image()
    obrazek.crossOrigin = 'anonymous'
    obrazek.onload = () => {
      const skala = Math.min(1, bok / Math.max(obrazek.width, obrazek.height))
      const plotno = document.createElement('canvas')
      plotno.width = Math.round(obrazek.width * skala)
      plotno.height = Math.round(obrazek.height * skala)
      const g = plotno.getContext('2d')
      if (!g) return resolve('')
      g.drawImage(obrazek, 0, 0, plotno.width, plotno.height)
      resolve(plotno.toDataURL('image/jpeg', 0.85))
    }
    obrazek.onerror = () => resolve('')
    obrazek.src = src
  })
}
