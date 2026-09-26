import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Image as IkonaObrazu, Video, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ListaWyboru, ListaPrzycisk, ListaTresc, ListaPozycja } from '@/components/ui/lista-wyboru';
import { ModelSelector, type SpeedMode } from '@/components/chat/ModelSelector';
import { usePhotoStudioUnifiedModels } from '@/hooks/usePhotoStudioUnifiedModels';
import { useStudioVideoModels } from '@/hooks/useStudioVideoModels';
import { availableDurations, availableQualities, videoByteCost, type VideoDuration } from '@/components/studio-video/constants';
import { useEffectiveByteCost } from '@/hooks/useEffectiveByteCost';
import { useWallet } from '@/hooks/useWallet';
import { getModelCostForQuality, type QualityTier } from '@/lib/photo-studio/modelQualityTiers';
import { usePersistedTabState } from '@/hooks/usePersistedTabState';
import { IkonaByte } from '@/lib/byte';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SZYBKI KREATOR — jedno miejsce, z którego zaczyna się robotę
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, z makiety: „nowy element chatu i tam się wybiera chat ai, zdjęcia,
 * video i po napisaniu tworzy w danym miejscu, to taki szybki dostęp".
 * Wzorzec podpatrzony w ElevenLabs, ale świadomie przerobiony.
 *
 * CO BIERZEMY Z ELEVENLABS
 *   • jedno pole startu, a przełącznik trybu zmienia CAŁY kontekst —
 *     podpowiedź w polu, opcje pod spodem, cel i cenę,
 *   • opcje w linii pod polem, nie w osobnym ekranie ustawień,
 *   • saldo widoczne w chwili decyzji, a nie po fakcie.
 *
 * CZEGO NIE BIERZEMY — I DLACZEGO
 *   • DZIEWIĘCIU kafli narzędzi w rzędzie. To katalog przebrany za kreator;
 *     u nas od katalogu jest pasek boczny i „Szybka podróż". Michał sam
 *     zgłaszał: „zamiast wszystkich opcji na ekranie".
 *   • Podpowiedzi w rodzaju „Surreal Dreamscape" — generyczne hasła, których
 *     nikt nie klika drugi raz. Panel zna OSTATNIE rzeczy użytkownika
 *     („Wróć do roboty" obok), więc podpowiedź z jego własnej pracy jest
 *     warta więcej niż cudza inspiracja.
 *   • Braku informacji, gdzie wyląduje wynik. Kreator mówi to wprost.
 *
 * DLACZEGO KREATOR NIE GENERUJE SAM
 * Przekazuje prompt do modułu, a zadanie startuje MODUŁ — własnym cennikiem,
 * własną walidacją i własnym pobraniem Byte. Gdyby kreator liczył cenę po
 * swojemu, powtórzyłby błąd, który już nas kosztował: panele Zarządu miały
 * własne mapy stawek i zaniżały koszt czternastokrotnie. Jedno źródło prawdy
 * o cenie zostaje tam, gdzie jest pobranie.
 *
 * Cena pokazana tutaj jest więc PODGLĄDEM z tych samych hooków, z których
 * liczy moduł (`useEffectiveByteCost`, wiersze modeli z bazy) — nie z
 * własnej tabelki.
 */

type Tryb = 'czat' | 'obraz' | 'wideo' | 'notatka';

interface OpisTrybu {
  klucz: Tryb;
  etykieta: string;
  ikona: React.ElementType;
  sciezka: string;
  podpowiedz: string;
  /** Dokąd trafi wynik, w miejscowniku — „w Studiu Zdjęć", nie „w Studio Zdjęć". */
  gdzie: string;
  /**
   * Czy kliknięcie od razu TWORZY i pobiera Byte.
   *
   * Od 24.08.2026 — TAK we wszystkich trybach. Michał: „zrób aby od razu
   * wysyłało wiadomość i pobierało byte w każdej opcji proszę".
   *
   * Zgłaszałem wcześniej zastrzeżenie i zostawiam je zapisane, bo dotyczy
   * pieniędzy: kreator pokazuje cenę BAZOWĄ modelu, a studia liczą cenę
   * z modelu, rozdzielczości i długości RAZEM. Przy nietypowych ustawieniach
   * kwota pobrana może więc być wyższa niż ta na przycisku.
   *
   * Michał zdecydował po wysłuchaniu tego zastrzeżenia. Ryzyko ograniczamy
   * dwiema rzeczami:
   *   • kwotę na przycisku zaokrąglamy W GÓRĘ (nigdy w dół),
   *   • start w studiach czeka, aż model i cennik faktycznie wejdą w stan,
   *     więc pobranie idzie po WYBRANYM modelu, nie po domyślnym.
   *
   * Pole zostaje w typie, mimo że wszystkie tryby mają dziś `true` — kolejny
   * tryb bez własnego startu ma się wyróżniać jawnie, a nie po cichu
   * obiecywać „Utwórz" i tego nie robić.
   */
  tworzySam: boolean;
}

const TRYBY: OpisTrybu[] = [
  { klucz: 'czat', etykieta: 'Czat', ikona: MessageSquare, sciezka: '/chat-ai',
    podpowiedz: 'Napisz wiadomość…', gdzie: 'Chat AI', tworzySam: true },
  { klucz: 'obraz', etykieta: 'Obraz', ikona: IkonaObrazu, sciezka: '/studio-zdjec',
    podpowiedz: 'Opisz obraz, który ma powstać…', gdzie: 'Studiu Zdjęć', tworzySam: true },
  { klucz: 'wideo', etykieta: 'Wideo', ikona: Video, sciezka: '/studio-video',
    podpowiedz: 'Opisz scenę wideo…', gdzie: 'Studiu Video', tworzySam: true },
  { klucz: 'notatka', etykieta: 'Notatka', ikona: FileText, sciezka: '/notatki',
    podpowiedz: 'Zacznij notatkę…', gdzie: 'Notatkach', tworzySam: true },
];

/* Proporcje — trzy, które pokrywają realne zastosowania: kwadrat na miniaturki,
   poziom na okładki, pion na media społecznościowe. Pełna lista jest w Studiu;
   tu wybieramy szybko, a nie konfigurujemy.

   PRZEKAZUJEMY KLUCZ, NIE PIKSELE. Pierwsza wersja wysyłała `szer`/`wys`,
   a Studio przeliczało je z powrotem na proporcję — i 1344×768 skracało się
   do „7:4", czyli wartości, której lista Studia nie zna. Selektor cicho
   wracał wtedy do „Auto" i wybór użytkownika przepadał bez śladu.
   Klucze są tu CELOWO takie same jak w `ASPECT_RATIOS` Studia; rozjazd
   między tymi listami to ta sama usterka jeszcze raz. */
const PROPORCJE = [
  { klucz: '1:1', etykieta: '1:1' },
  { klucz: '16:9', etykieta: '16:9' },
  { klucz: '9:16', etykieta: '9:16' },
];

/* 0,22 s, nie 0,4. `AnimatePresence mode="wait"` czeka na wyjście STAREJ
   treści, zanim wpuści nową — czas trwania liczy się więc podwójnie.
   Zmierzone przy 0,4: pasek opcji przełączał się 0,8 s, co przy zmianie
   trybu czuć jako zacięcie. Rząd opcji to nie okno; ma nadążać za palcem. */
const sprezyna = { type: 'spring' as const, duration: 0.22, bounce: 0 };

/** Wspólny wygląd małej kontrolki w pasku opcji. */
const klasaChipa = (aktywny: boolean) =>
  cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]',
    'font-medium transition-colors duration-200',
    aktywny
      ? 'border-primary/40 bg-primary/10 text-primary'
      : 'border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground'
  );

export const SzybkiKreator: React.FC = () => {
  const nawiguj = useNavigate();
  const [tryb, setTryb] = useState<Tryb>('czat');
  const [tresc, setTresc] = useState('');
  const [wysylka, setWysylka] = useState(false);

  /* Czat — tryb prędkości trzymamy tu, bo `ModelSelector` jest sterowany
     z zewnątrz. To ten sam komponent, którego używa Chat AI, więc lista
     modeli i ich ceny nie mogą się rozjechać z modułem. */
  const [trybPredkosci, setTrybPredkosci] = useState<SpeedMode>('pro');
  const kosztCzatu = useEffectiveByteCost(trybPredkosci);

  /* Obraz — jakość mapowana przez admina w `photo_studio_settings`. */
  const { data: modeleObrazu } = usePhotoStudioUnifiedModels();
  const [jakoscObrazu, setJakoscObrazu] = useState<'fast' | 'pro'>('fast');
  const [proporcje, setProporcje] = useState('1:1');
  /* TEN SAM klucz zapamiętanego stanu, którego używa Studio Zdjęć.

     Bez tego kreator brał `byte_cost_1k`, a Studio liczyło z jakości `2k` —
     zmierzone na żywo: przycisk obiecywał ≈3 ⟠, a pobrane zostało 4.
     Dokładnie ta rodzina błędów, którą platforma ma już opisaną przy
     panelach Zarządu: własna mapa stawek obok prawdziwej.
     Czytamy więc jakość, którą użytkownik naprawdę ma ustawioną, i liczymy
     TĄ SAMĄ funkcją co Studio. */
  const [jakoscTier] = usePersistedTabState<QualityTier>('photo-studio:studio:quality', '2k');
  const modelObrazu = jakoscObrazu === 'pro' ? modeleObrazu?.pro : modeleObrazu?.fast;

  /* Wideo — lista z bazy, pierwszy aktywny jako domyślny.
     Michał: „możliwość wyboru modelu". Wcześniej stała tu martwa plakietka
     z nazwą — pokazywała, czego użyjemy, ale nie dało się tego zmienić,
     więc tryb wideo był jedynym bez wyboru. */
  const { data: modeleWideo } = useStudioVideoModels();
  const [idModeluWideo, setIdModeluWideo] = useState<string | null>(null);
  const [listaWideoOtwarta, setListaWideoOtwarta] = useState(false);
  const modelWideo = useMemo(
    () => modeleWideo?.find((m) => m.id === idModeluWideo) ?? modeleWideo?.[0] ?? null,
    [modeleWideo, idModeluWideo]
  );

  const [dlugoscWideo, setDlugoscWideo] = useState<VideoDuration | null>(null);
  const dlugosciWideo = useMemo(() => availableDurations(modelWideo), [modelWideo]);
  /* Długość musi być z listy TEGO modelu — inaczej generator odrzuca żądanie
     („Błąd generacji: invalid_duration", zmierzone 24.08.2026). */
  const dlugosc = dlugoscWideo && dlugosciWideo.includes(dlugoscWideo)
    ? dlugoscWideo : dlugosciWideo[0];

  /** Koszt filmu — TĄ SAMĄ funkcją, którą liczy generator.
      Cennik modelu jest ZA SEKUNDĘ, nie za film: pierwsza wersja brała
      `pricing[q].base` jako całość i pokazywała 2 ⟠ tam, gdzie realnie
      wychodziło ponad 6. Przy wideo pomyłka rośnie wprost z długością. */
  const kosztWideo = (m: typeof modelWideo, sek: VideoDuration | undefined): number | null => {
    if (!m || !sek) return null;
    return videoByteCost(m, availableQualities(m)[0], sek, false);
  };

  const { balance: saldo } = useWallet();

  const opis = TRYBY.find((t) => t.klucz === tryb)!;

  /* ── KOSZT ────────────────────────────────────────────────────────────
     Zwracamy `null`, gdy jeszcze nie znamy ceny (modele się wczytują) —
     zero i „nie wiem" to dwie różne rzeczy, a pokazanie zera przy modelu
     płatnym byłoby kłamstwem w chwili decyzji. */
  const koszt = useMemo<number | null>(() => {
    if (tryb === 'notatka') return 0;
    if (tryb === 'czat') return kosztCzatu;
    if (tryb === 'obraz') {
      if (!modelObrazu) return null;
      return getModelCostForQuality(modelObrazu, jakoscTier);
    }
    if (!modelWideo) return null;
    return kosztWideo(modelWideo, dlugosc);
  }, [tryb, kosztCzatu, modelObrazu, modelWideo, jakoscTier, dlugosc]);

  /* ── ZAOKRĄGLANIE W GÓRĘ ──────────────────────────────────────────────
     Michał: „byte aby się do góry zaokrąglały do całości, a nie 1,25".
     Byte jest walutą, a nie wynikiem pomiaru — ułamek w cenie każe liczyć
     w pamięci zamiast czytać. W GÓRĘ, nie do najbliższej: użytkownik ma
     zobaczyć kwotę, która na pewno wystarczy, a nie taką, przy której może
     zabraknąć. Ta sama zasada przy saldzie po operacji. */
  const kosztPelny = koszt === null ? null : Math.ceil(koszt);
  const saldoPo = typeof saldo === 'number' && kosztPelny !== null
    ? Math.floor(saldo - kosztPelny) : null;

  const stac = kosztPelny === null || saldo === undefined || saldo === null || saldo >= kosztPelny;
  const gotowe = tresc.trim().length > 0 && stac && !wysylka;

  /* ── PRZEKAZANIE DO MODUŁU ────────────────────────────────────────────
     Parametry idą w adresie, nie w stanie nawigacji: adres przeżywa
     odświeżenie strony i da się go wkleić komuś innemu. `utworz=1` jest
     osobną flagą od samego promptu — moduł, który jeszcze nie umie
     wystartować sam, po prostu wypełni pole i nic nie pobierze. */
  const wyslij = () => {
    const t = tresc.trim();
    if (!t || !stac) return;
    setWysylka(true);

    /* `utworz=1` leci TYLKO do modułów, które startują same. Wysyłanie go
       do studiów byłoby obietnicą, której odbiorca nie spełnia — a przy
       przyszłej zmianie ktoś mógłby ją spełnić i pobrać Byte bez pytania. */
    const p = new URLSearchParams({ prompt: t });
    if (opis.tworzySam) p.set('utworz', '1');
    if (tryb === 'czat') p.set('model', trybPredkosci);
    if (tryb === 'obraz') {
      p.set('jakosc', jakoscObrazu);
      p.set('proporcje', proporcje);
    }
    if (tryb === 'wideo' && modelWideo) {
      p.set('model', String(modelWideo.id));
      if (dlugosc) p.set('dlugosc', String(dlugosc));
    }
    nawiguj(`${opis.sciezka}?${p.toString()}`);
  };

  const naKlawiszu = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); wyslij(); }
  };

  return (
    <div
      data-tour="szybki-kreator"
      className="nb-szklo nb-szklo-plynne nb-kafelek relative flex flex-col overflow-hidden rounded-2xl border"
    >
      {/* Nitka akcentu — ten sam idiom, co pastylka kart i nagłówek paska.
          `top-px`, NIE `top-0`: na `top-0` nitka siadała na tej samej linii
          co obwódka karty i ją zasłaniała na środku góry (widoczna została
          tylko przy narożnikach) — karta wyglądała inaczej niż reszta, która
          ma pełną, ciągłą krawędź. Nitka teraz leży JEDEN piksel niżej, pod
          obwódką: obwódka idzie w całości dookoła jak w innych kafelkach,
          a nitka jest osobną, węższą warstwą tuż pod nią — i rusza się z nią
          razem, bo obie są dziećmi tej samej karty. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-px z-10 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      {/* ── WYBÓR TRYBU ──────────────────────────────────────────────────
          Cztery, nie dziewięć. To są CZASOWNIKI platformy — rzeczy, które
          się TWORZY. Reszta modułów to miejsca, do których się wchodzi,
          i od tego jest pasek boczny. */}
      <div className="flex items-center gap-1 px-3 pt-3">
        {TRYBY.map(({ klucz, etykieta, ikona: Ikona }) => {
          const aktywny = tryb === klucz;
          return (
            <button
              key={klucz}
              type="button"
              onClick={() => setTryb(klucz)}
              aria-pressed={aktywny}
              data-tap-target="off"
              className={cn(
                'relative flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                aktywny
                  ? 'bg-primary/[0.13] text-primary'
                  : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
              )}
            >
              <Ikona className="h-3.5 w-3.5 shrink-0" />
              {etykieta}
            </button>
          );
        })}
      </div>

      {/* ── POLE ─────────────────────────────────────────────────────────
          Niecka (Poziom 2): własne, stonowane tło i cienka krawędź od
          `--foreground`, żeby pole odróżniało się od szyby kafelka —
          bez pełnego szkła na szkle, które dawało „mleko" zamiast materiału. */}
      <div className="mx-3 mt-1 rounded-xl border border-foreground/[0.07] bg-background/25">
        <Textarea
          value={tresc}
          onChange={(e) => setTresc(e.target.value)}
          onKeyDown={naKlawiszu}
          placeholder={opis.podpowiedz}
          rows={4}
          className={cn(
            'min-h-[104px] resize-none border-0 bg-transparent px-3 pt-2.5 text-sm',
            'shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
          )}
        />
      </div>

      {/* ── OPCJE ZALEŻNE OD TRYBU ───────────────────────────────────────
          Tylko to, co zmienia WYNIK. Pełna konfiguracja zostaje w module —
          stąd się zaczyna, a nie stroi. */}
      <div className="flex min-h-9 items-center gap-1.5 overflow-x-auto px-3 pt-2 pb-1 pasek-bez-suwaka">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tryb}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={sprezyna}
            className="flex items-center gap-1.5"
          >
            {tryb === 'czat' && (
              <ModelSelector selectedMode={trybPredkosci} onModeChange={setTrybPredkosci} />
            )}

            {tryb === 'obraz' && (
              <>
                <button type="button" onClick={() => setJakoscObrazu('fast')}
                  className={klasaChipa(jakoscObrazu === 'fast')}>
                  {modeleObrazu?.fast?.name ?? 'Szybki'}
                </button>
                <button type="button" onClick={() => setJakoscObrazu('pro')}
                  className={klasaChipa(jakoscObrazu === 'pro')}>
                  {modeleObrazu?.pro?.name ?? 'Pro'}
                </button>
                <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-border/50" />
                {PROPORCJE.map((p) => (
                  <button key={p.klucz} type="button" onClick={() => setProporcje(p.klucz)}
                    className={klasaChipa(proporcje === p.klucz)}>
                    {p.etykieta}
                  </button>
                ))}
              </>
            )}

            {tryb === 'wideo' && (
              /* `ListaWyboru` z biblioteki — ten sam komponent, którego
                 używa pasek narzędzi czatu. Własne menu znaczyłoby, że
                 zmiana wyglądu list w bibliotece omija to jedno miejsce. */
              <ListaWyboru open={listaWideoOtwarta} onOpenChange={setListaWideoOtwarta}>
                <ListaPrzycisk ikona={Video} zwarty className="rounded-full px-3">
                  {modelWideo?.name ?? 'Wczytuję modele…'}
                </ListaPrzycisk>
                <ListaTresc side="bottom" align="start">
                  {(modeleWideo ?? []).map((m) => {
                    const cena = kosztWideo(m, availableDurations(m)[0]);
                    return (
                      <ListaPozycja
                        key={m.id}
                        ikona={Video}
                        nazwa={m.name}
                        opis={cena === null ? undefined : `od ≈${Math.ceil(cena)} ⟠`}
                        wybrana={modelWideo?.id === m.id}
                        onWybor={() => {
                          setIdModeluWideo(String(m.id));
                          setListaWideoOtwarta(false);
                        }}
                      />
                    );
                  })}
                </ListaTresc>
              </ListaWyboru>
            )}

            {tryb === 'wideo' && dlugosciWideo.length > 1 && (
              <>
                <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 bg-border/50" />
                {dlugosciWideo.map((d) => (
                  <button key={d} type="button" onClick={() => setDlugoscWideo(d)}
                    className={klasaChipa(dlugosc === d)}>
                    {d} s
                  </button>
                ))}
              </>
            )}

            {tryb === 'notatka' && (
              <span className="text-[11px] text-muted-foreground">
                0 <IkonaByte className="inline h-3 w-3 align-[-2px]" />
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── STOPKA: CENA I START ─────────────────────────────────────────
          Cena PRZED kliknięciem, razem z saldem po operacji. ElevenLabs
          pokazuje samo „pozostało 208" — a pytanie brzmi „ile mnie to
          kosztuje i czy mi starczy", więc odpowiadamy na jedno i drugie. */}
      <div className="flex items-center justify-between gap-3 px-3 pt-1.5 pb-2.5">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
          {kosztPelny === null ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> liczę koszt…
            </span>
          ) : kosztPelny === 0 ? (
            <span>za darmo</span>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-x-1.5 tabular-nums">
              <span className="text-foreground">
                ≈{kosztPelny} <IkonaByte className="inline h-3 w-3 align-[-2px]" />
              </span>
              {saldoPo !== null && (
                <span className={cn(!stac && 'text-destructive')}>
                  {stac
                    ? `· zostanie ${saldoPo}`
                    : `· masz ${Math.floor(saldo as number)}, brakuje ${kosztPelny - Math.floor(saldo as number)}`}
                </span>
              )}
            </span>
          )}
        </div>

        {/* WARIANT `glass` Z BIBLIOTEKI, nie własny `bg-primary`.

            Stało tu pełne wypełnienie akcentem — jedyna taka plama koloru
            na całym panelu, dokładnie ten sam błąd, który platforma opisała
            już przy `destructive` („pełne czerwone wypełnienie wyłamywało
            się z reszty"). Michał: „napraw kolor przycisku".

            `glass` to w tutejszym języku STYL 1: „Główne wezwanie, DOKŁADNIE
            JEDNO na blok" — czyli opis tego przycisku co do joty. Zmiana
            rdzenia w `style-przyciskow.ts` rusza go teraz razem z resztą
            platformy, zamiast go omijać. */}
        <Button
          type="button"
          variant="glass"
          size="sm"
          onClick={wyslij}
          disabled={!gotowe}
          data-tap-target="off"
          className="h-8 shrink-0 gap-1.5 px-3.5 text-xs"
        >
          {wysylka ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
          {/* Czasownik zgodny z tym, co się STANIE — patrz `tworzySam`. */}
          <span className="hidden sm:inline">
            {opis.tworzySam ? 'Utwórz' : 'Otwórz'} w {opis.gdzie}
          </span>
          <span className="sm:hidden">{opis.tworzySam ? 'Utwórz' : 'Otwórz'}</span>
        </Button>
      </div>
    </div>
  );
};

export default SzybkiKreator;
