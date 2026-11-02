import React from 'react';
import LiquidGlass from '@/components/ui/szklo-apple';
import { Tile, TileHeader, TileAction } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTokenyKomponentow } from './useTokenyKomponentow';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  ZARZĄDZANIE SZKŁEM — suwaki jak w demie biblioteki
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „zobacz, że on w repozytorium mógł zarządzać tym szkłem — czemu ja
 * nie mam tego w opcjach w Bibliotece komponentów NextByte, np. po prawej
 * przycisk »zarządzaj szkłem«".
 *
 * Demo `liquid-glass-react` ma panel z pięcioma suwakami i trybem mapy, dzięki
 * któremu materiał dobiera się patrząc, a nie zgadując. Tutaj jest to samo,
 * z tymi samymi zakresami co w oryginale — plus dwie rzeczy, których tam nie ma:
 *
 *  ① PODGLĄD NAD TYM, CO MAMY POD SPODEM W PLATFORMIE — siatka i plamy koloru,
 *    a nie fotografia skateparku. Materiał dobrany nad zdjęciem wygląda inaczej
 *    niż nad tłem aplikacji, więc suwaki ustawione na cudzym tle nic nie mówią.
 *  ② PRZYCISK KOPIOWANIA GOTOWEGO KODU. Bez tego dobieranie kończy się
 *    przepisywaniem sześciu liczb ze zrzutu ekranu.
 *
 * Zakresy suwaków 1:1 z `liquid-glass-example/src/pages/index.tsx`.
 */

const DOMYSLNE = {
  displacementScale: 64,
  blurAmount: 0.06,
  saturation: 130,
  aberrationIntensity: 2,
  elasticity: 0,
  cornerRadius: 16,
  overLight: false,
  mode: 'standard' as Tryb,
};

type Tryb = 'standard' | 'polar' | 'prominent' | 'shader';

/** Etykiety trybów mapy — po ludzku, nie nazwami z API. */
const TRYBY: { klucz: Tryb; nazwa: string; opis: string }[] = [
  { klucz: 'standard', nazwa: 'Zwykły', opis: 'mapa z obrazka, przewidywalna' },
  { klucz: 'polar', nazwa: 'Biegunowy', opis: 'załamanie od środka' },
  { klucz: 'prominent', nazwa: 'Mocny', opis: 'wyraźniejsza krawędź' },
  { klucz: 'shader', nazwa: 'Liczony', opis: 'SDF na canvasie — bez 41 KB base64' },
];

const Suwak: React.FC<{
  etykieta: string;
  opis: string;
  wartosc: number;
  min: number;
  max: number;
  krok: number;
  format?: (v: number) => string;
  naZmiane: (v: number) => void;
}> = ({ etykieta, opis, wartosc, min, max, krok, format, naZmiane }) => (
  <div>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-card-foreground">{etykieta}</span>
      <span className="text-[13px] tabular-nums text-primary">
        {format ? format(wartosc) : wartosc}
      </span>
    </div>
    <Slider
      value={[wartosc]}
      min={min}
      max={max}
      step={krok}
      onValueChange={([v]) => naZmiane(v)}
      className="mt-2"
      aria-label={etykieta}
    />
    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{opis}</p>
  </div>
);

export const SterowanieSzklem: React.FC = () => {
  const [ust, setUst] = React.useState(DOMYSLNE);
  const [skopiowane, setSkopiowane] = React.useState(false);
  const [opublikowano, setOpublikowano] = React.useState(false);

  /*
    ══════════════════════════════════════════════════════════════════════
     TE SUWAKI STERUJĄ PLATFORMĄ, NIE TYLKO PODGLĄDEM
    ══════════════════════════════════════════════════════════════════════

    Michał, 13.08.2026: panel „miał być takim ustawieniem na całą platformę”.
    I był — ale ręcznie: komentarz w `szklo-plynne.tsx` mówił „ustawienia
    dobrane przez Michała w panelu «Zarządzanie szkłem»”, a liczby trzeba było
    stamtąd przepisać do kodu i wdrożyć.

    Teraz cztery suwaki mają odpowiednik w tokenach i wędrują do bazy:

        Siła załamania  → --nb-szklo-sila
        Rozmycie        → --nb-szklo-rozmycie     (skala! patrz `naPiksele`)
        Nasycenie       → --nb-szklo-nasycenie
        Rozszczepienie  → --nb-szklo-aberracja

    Reszta (sprężystość, zaokrąglenie, mapa, „na jasnym tle”) zostaje lokalna:
    to parametry komponentu z dema, których materiał platformy nie ma.
  */
  const tokeny = useTokenyKomponentow('szklo-material');

  /* Demo trzyma rozmycie jako 0–1, platforma w pikselach. Przelicznik jest
     stąd, że tak dobrano materiał 04.08.2026: `blur 7.2px = 4 + 0.10×32`. */
  const naPiksele = (v: number) => 4 + v * 32;
  const zPikseli = (px: number) => Math.max(0, Math.min(1, (px - 4) / 32));

  /* Suwaki startują od tego, co NAPRAWDĘ jest opublikowane — inaczej panel
     pokazywałby wartości z dema i każdy zapis cofałby materiał platformy. */
  const wczytaneRef = React.useRef(false);
  React.useEffect(() => {
    if (wczytaneRef.current || tokeny.sandbox.length === 0) return;
    wczytaneRef.current = true;
    const w = (t: string, zap: number) => {
      const rekord = tokeny.sandbox.find(x => x.token === t);
      const v = rekord ? Number.parseFloat(rekord.wartosc) : NaN;
      return Number.isFinite(v) ? v : zap;
    };
    setUst(p => ({
      ...p,
      displacementScale: w('--nb-szklo-sila', p.displacementScale),
      blurAmount: zPikseli(w('--nb-szklo-rozmycie', naPiksele(p.blurAmount))),
      saturation: w('--nb-szklo-nasycenie', p.saturation),
      aberrationIntensity: w('--nb-szklo-aberracja', p.aberrationIntensity),
    }));
  }, [tokeny.sandbox]);

  /** Przepisuje stan suwaków na tokeny i publikuje na całą platformę. */
  const opublikujNaPlatforme = async () => {
    tokeny.ustaw('--nb-szklo-sila', String(Math.round(ust.displacementScale)));
    tokeny.ustaw('--nb-szklo-rozmycie', `${naPiksele(ust.blurAmount).toFixed(2)}px`);
    tokeny.ustaw('--nb-szklo-nasycenie', `${Math.round(ust.saturation)}%`);
    tokeny.ustaw('--nb-szklo-aberracja', String(ust.aberrationIntensity));
    const ok = await tokeny.publikuj();
    if (ok) { setOpublikowano(true); setTimeout(() => setOpublikowano(false), 2500); }
  };

  /* ── TŁO W RUCHU ──────────────────────────────────────────────────────
     Michał: „daj mi opcje scrolla, aby zobaczyć w ruchu to szkło, jak na tle
     jeździ".

     Refrakcji NIE DA SIĘ ocenić na nieruchomym obrazku — dopiero gdy pod szybą
     coś przejeżdża, widać, że krawędź wygina linie, a rozszczepienie koloru
     wędruje po brzegu. Dlatego tło jedzie, a szyba stoi: dokładnie odwrotnie
     niż przy przewijaniu strony, gdzie to karta wjeżdża na nieruchome tło.

     Kółko myszy nad podglądem przewija TŁO, a nie stronę — inaczej próba
     obejrzenia efektu wyrzucałaby z sekcji. */
  const tloRef = React.useRef<HTMLDivElement>(null);
  const [automat, setAutomat] = React.useState(false);

  /* ── PRAWDZIWE ZDJĘCIA POD SZYBĄ ──────────────────────────────────────
     Michał: „niby tak, ale kod 1:1 tak wygląda efekt" — i pokazał demo,
     gdzie karta leży na fotografii wnętrza katedry.
     To jest sedno sprawy: ten materiał był projektowany NAD ZDJĘCIAMI.
     Fotografia ma jasne i ciemne miejsca, ostre krawędzie i pełne kolory —
     rozmycie ma co mieszać, refrakcja co wyginać, aberracja co rozszczepiać.
     Nad ciemną siatką ten sam kod daje ten sam wynik co przy `blur: 0`,
     bo rozmycie gładkiej powierzchni daje tę samą powierzchnię.
     Dlatego podgląd bierze zdjęcia z WŁASNEGO Studia Zdjęć — porównanie
     z demem jest wtedy uczciwe, a nie „nasze ciemne tło kontra ich katedra". */
  const [zdjecia, setZdjecia] = React.useState<string[]>([]);
  React.useEffect(() => {
    let zywy = true;
    (async () => {
      const { data } = await supabase
        .from('photo_studio_generations')
        .select('image_url')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4);
      if (zywy && data?.length) setZdjecia(data.map((w: { image_url: string }) => w.image_url));
    })();
    return () => { zywy = false; };
  }, []);

  React.useEffect(() => {
    if (!automat) return;
    let klatka = 0;
    let kierunek = 1;
    const krok = () => {
      const el = tloRef.current;
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        if (el.scrollTop >= max - 1) kierunek = -1;
        if (el.scrollTop <= 0) kierunek = 1;
        el.scrollTop += kierunek * 1.4;
      }
      klatka = requestAnimationFrame(krok);
    };
    klatka = requestAnimationFrame(krok);
    return () => cancelAnimationFrame(klatka);
  }, [automat]);

  const zmien = <K extends keyof typeof DOMYSLNE>(klucz: K, wartosc: (typeof DOMYSLNE)[K]) =>
    setUst((s) => ({ ...s, [klucz]: wartosc }));

  const kod =
    `<LiquidGlass\n`
    + `  displacementScale={${ust.displacementScale}}\n`
    + `  blurAmount={${ust.blurAmount}}\n`
    + `  saturation={${ust.saturation}}\n`
    + `  aberrationIntensity={${ust.aberrationIntensity}}\n`
    + `  elasticity={${ust.elasticity}}\n`
    + `  cornerRadius={${ust.cornerRadius}}\n`
    + (ust.overLight ? `  overLight\n` : '')
    + (ust.mode !== 'standard' ? `  mode="${ust.mode}"\n` : '')
    + `>\n  {/* treść */}\n</LiquidGlass>`;

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(kod);
      setSkopiowane(true);
      window.setTimeout(() => setSkopiowane(false), 1600);
    } catch {
      /* Brak dostępu do schowka (np. bez HTTPS) — kod i tak widać niżej,
         więc nie ma po co pokazywać błędu. */
    }
  };

  return (
    <Tile>
      <TileHeader
        tytul="Zarządzanie szkłem"
        podtytul="cztery pierwsze suwaki zmieniają materiał CAŁEJ platformy — reszta dotyczy tylko podglądu"
        poPrawej={
          tokeny.rozne.length > 0
            ? <Plakietka intencja="uwaga">{tokeny.rozne.length} do opublikowania</Plakietka>
            : <Plakietka intencja="akcent">na żywo</Plakietka>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* ── PODGLĄD ───────────────────────────────────────────────────── */}
        <div
          className="relative h-[300px] overflow-hidden rounded-xl"
          onWheel={(e) => {
            const el = tloRef.current;
            if (!el) return;
            e.preventDefault();
            el.scrollTop += e.deltaY;
          }}
        >
          {/* WARSTWA PRZEWIJANA — trzy razy wyższa niż okno podglądu, żeby
              było co przesuwać. Pasy koloru rozstawione pionowo: przy każdym
              przejeździe pod szybą zmienia się to, co ma załamać. */}
          <div ref={tloRef} className="absolute inset-0 overflow-y-auto overscroll-contain">
            <div className="relative h-[900px] w-full">
          {/* TŁO MUSI MIEĆ DETAL, INACZEJ ROZMYCIA NIE WIDAĆ.
              Zgłoszone przez Michała: „rozmycie nie działa tak jak w tym kodzie".
              Kod działa — zmierzone: suwak 0,12 daje `blur(7.84px)`, czyli
              dokładnie wzór z oryginału `4 + blurAmount × 32`. Niewidoczny był
              EFEKT, bo pod szybą leżały same gładkie gradienty, a rozmycie
              gładkiego gradientu daje ten sam gradient.
              W demie repozytorium pod kartą jest fotografia — drobne, ostre
              detale, które przy rozmyciu mieszają się w mleko. Tutaj tę rolę
              pełnią: gęsta siatka, kropki i pasy z tekstem, czyli to, co
              naprawdę leży pod szkłem w platformie. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 28%, hsl(var(--primary)/0.75), transparent 45%),'
                + 'radial-gradient(circle at 80% 70%, hsl(var(--destructive)/0.60), transparent 46%)',
            }}
          />
          <div
            aria-hidden="true"
            className={zdjecia.length ? 'absolute inset-0 text-foreground/15' : 'absolute inset-0 text-foreground/45'}
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px),'
                + 'linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* ZDJĘCIA — jedno pod drugim, tak jak w demie repozytorium.
              Gdy ich nie ma (nowe konto, brak generacji), zostają gradienty
              i siatka — podgląd działa, tylko efekt jest słabszy, bo nad
              gładkim tłem nie ma czego rozmywać. */}
          {zdjecia.length > 0 && (
            <div aria-hidden="true" className="absolute inset-0 flex flex-col">
              {zdjecia.map((u, i) => (
                <img
                  key={i}
                  src={u}
                  alt=""
                  loading="lazy"
                  className="h-1/4 w-full flex-shrink-0 object-cover"
                />
              ))}
            </div>
          )}

          {/* Drobna kropka 6 px — to ona pierwsza znika pod rozmyciem, więc
              działa jak miarka: gdy przestaje być widoczna, rozmycie „ruszyło". */}
          <div
            aria-hidden="true"
            className="absolute inset-0 text-foreground/35"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '6px 6px',
            }}
          />

          {/* Pasy z tekstem — najuczciwszy test, bo pod szkłem w platformie
              leży właśnie treść, a nie abstrakcyjna tekstura. Litery zamazują
              się stopniowo i widać dokładnie, przy jakiej wartości szyba
              przestaje być przezroczysta. */}
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-around py-6">
            {['NextByte · szkło · refrakcja · aberracja', '1 234,56 ⟠ · Byte · saldo · panel',
              'liquid glass · displacement · blur · saturate', 'siatka · kropki · tekst · detal',
              'NextByte · szkło · refrakcja · aberracja', '1 234,56 ⟠ · Byte · saldo · panel'].map((w, i) => (
              <p key={i} className="whitespace-nowrap text-center text-[15px] font-semibold tracking-tight text-foreground/55">
                {w}
              </p>
            ))}
          </div>

            </div>
          </div>

          {/* SZYBA — stoi nieruchomo NAD przewijanym tłem.
              Pudełko o znanych wymiarach, bo `LiquidGlass` centruje się przez
              `transform: translate(-50%, -50%)` i musi mieć względem czego. */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="pointer-events-auto relative h-[180px] w-full">
            <LiquidGlass
              displacementScale={ust.displacementScale}
              blurAmount={ust.blurAmount}
              saturation={ust.saturation}
              aberrationIntensity={ust.aberrationIntensity}
              elasticity={ust.elasticity}
              cornerRadius={ust.cornerRadius}
              overLight={ust.overLight}
              mode={ust.mode}
              /* REAKCJA NA MYSZ TO DWA OSOBNE MECHANIZMY, nie jeden.
                 `elasticity` odpowiada za uciekanie szyby, ale białą smugę na
                 ramce robi `mouseOffset`: dwie warstwy z `mix-blend-mode:
                 screen/overlay` mają gradient, którego KĄT i JASNOŚĆ liczą się
                 z pozycji kursora (`135 + mouseOffset.x * 1.2` stopni).
                 To jest zachowanie oryginału — imituje odbicie światła
                 wędrujące po krawędzi szyby. Samo wyzerowanie `elasticity`
                 go nie gasi, bo to inna ścieżka.
                 Komponent przyjmuje `mouseOffset` z zewnątrz, więc przy
                 wyłączonej reakcji podajemy zero i ramka stoi. */
              mouseOffset={ust.elasticity > 0 ? undefined : { x: 0, y: 0 }}
              padding="20px"
              style={{ position: 'absolute', top: '50%', left: '50%', width: '78%' }}
            >
              <span className="block">
                <span className="block text-[15px] font-semibold text-foreground">Podgląd materiału</span>
                <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">
                  przesuń suwaki obok — szyba przelicza się od razu
                </span>
                <span className="mt-3 block text-[12px] tabular-nums text-foreground/80">1 234,56 ⟠</span>
              </span>
            </LiquidGlass>
            </div>
          </div>
        </div>

        {/* ── SUWAKI ────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Suwak
            etykieta="Siła załamania" opis="jak mocno krawędź wygina obraz pod spodem"
            wartosc={ust.displacementScale} min={0} max={200} krok={1}
            naZmiane={(v) => zmien('displacementScale', v)}
          />
          <Suwak
            etykieta="Rozmycie" opis="0 = widać wszystko ostro, 1 = mleczna szyba"
            wartosc={ust.blurAmount} min={0} max={1} krok={0.01}
            format={(v) => v.toFixed(2)}
            naZmiane={(v) => zmien('blurAmount', v)}
          />
          <Suwak
            etykieta="Nasycenie" opis="ile koloru przepuszcza szkło"
            wartosc={ust.saturation} min={100} max={300} krok={10}
            format={(v) => `${v}%`}
            naZmiane={(v) => zmien('saturation', v)}
          />
          <Suwak
            etykieta="Rozszczepienie" opis="kolorowa obwódka na brzegu — to po niej oko poznaje szkło"
            wartosc={ust.aberrationIntensity} min={0} max={20} krok={1}
            naZmiane={(v) => zmien('aberrationIntensity', v)}
          />
          {/* REAKCJA NA KURSOR — domyślnie WYŁĄCZONA (Michał: „wyłącz reakcję
              na myszkę"). Sprężystość jest efektowna przy pojedynczym przycisku,
              ale przy ocenie materiału przeszkadza: szyba ucieka spod wzroku
              dokładnie wtedy, gdy chce się jej przyjrzeć. Suwak pokazuje się
              dopiero po włączeniu, żeby nie sugerował, że coś się dzieje,
              kiedy nic się nie dzieje. */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-card-foreground">Reakcja na kursor</span>
              <span className="block text-[11px] leading-snug text-muted-foreground">
                szyba ucieka i odkształca się pod myszą
              </span>
            </span>
            <Switch
              checked={ust.elasticity > 0}
              onCheckedChange={(v) => zmien('elasticity', v ? 0.35 : 0)}
              aria-label="Reakcja na kursor"
            />
          </div>

          {ust.elasticity > 0 && (
            <Suwak
              etykieta="Siła reakcji" opis="jak bardzo szyba ucieka za kursorem"
              wartosc={ust.elasticity} min={0.05} max={1} krok={0.05}
              format={(v) => v.toFixed(2)}
              naZmiane={(v) => zmien('elasticity', v)}
            />
          )}
          <Suwak
            etykieta="Zaokrąglenie" opis="promień rogów w pikselach"
            wartosc={ust.cornerRadius} min={0} max={100} krok={1}
            format={(v) => `${v} px`}
            naZmiane={(v) => zmien('cornerRadius', v)}
          />

          <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-card-foreground">Na jasnym tle</span>
              <span className="block text-[11px] leading-snug text-muted-foreground">
                mocniejszy cień i rozmycie — dla szkła nad bielą
              </span>
            </span>
            <Switch
              checked={ust.overLight}
              onCheckedChange={(v) => zmien('overLight', v)}
              aria-label="Na jasnym tle"
            />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-card-foreground">Tło w ruchu</span>
              <span className="block text-[11px] leading-snug text-muted-foreground">
                przewija się samo — albo kręć kółkiem nad podglądem
              </span>
            </span>
            <Switch checked={automat} onCheckedChange={setAutomat} aria-label="Tło w ruchu" />
          </div>

          <div>
            <span className="block text-[13px] font-medium text-card-foreground">Mapa załamania</span>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {TRYBY.map((t) => (
                <button
                  key={t.klucz}
                  type="button"
                  onClick={() => zmien('mode', t.klucz)}
                  aria-pressed={ust.mode === t.klucz}
                  className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                    ust.mode === t.klucz
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="block text-[12px] font-medium text-card-foreground">{t.nazwa}</span>
                  <span className="block text-[10px] leading-snug text-muted-foreground">{t.opis}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Publikacja jest AKCJĄ GŁÓWNĄ — kopiowanie kodu zostaje jako druga
              droga (dla parametrów, których materiał platformy nie ma). */}
          <TileAction
            rodzaj="glowna"
            ikona={opublikowano ? Check : undefined}
            disabled={tokeny.zapisywanie || tokeny.sandbox.length === 0}
            onClick={() => { void opublikujNaPlatforme(); }}
            className="w-full justify-center"
          >
            {tokeny.zapisywanie ? 'Publikowanie…' : opublikowano ? 'Opublikowano' : 'Opublikuj na całą platformę'}
          </TileAction>
          {tokeny.sandbox.length === 0 && (
            <p className="text-[11px] leading-snug text-muted-foreground">
              Publikacja czeka na migrację tokenów materiału — do tego czasu suwaki
              zmieniają wyłącznie podgląd obok.
            </p>
          )}

          <div className="flex gap-2">
            <TileAction rodzaj="wtorna" ikona={skopiowane ? Check : Copy} onClick={kopiuj} className="flex-1 justify-center">
              {skopiowane ? 'Skopiowano' : 'Kopiuj kod'}
            </TileAction>
            <TileAction rodzaj="wtorna" ikona={RotateCcw} onClick={() => setUst(DOMYSLNE)} samaIkona aria-label="Przywróć domyślne" />
          </div>
        </div>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-foreground/[0.03] p-3 text-[11px] leading-relaxed text-muted-foreground">
        {kod}
      </pre>
    </Tile>
  );
};
