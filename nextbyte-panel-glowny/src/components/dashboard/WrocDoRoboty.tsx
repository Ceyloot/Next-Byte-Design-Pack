import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Szkielet, PustyStan } from '@/components/ui/stany';
import {
  LayoutGrid,
  History, MessageSquare, FileText, Image as ImageIcon, Video,
  StickyNote, Palette, CalendarDays, ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  WRÓĆ DO ROBOTY — jeden strumień zamiast dziesięciu list
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „to ma być centrum zarządzania".
 *
 * ── CZEGO BRAKOWAŁO ─────────────────────────────────────────────────────
 * Panel Główny po przebudowie pokazywał: co zaległe, event z nagrodami,
 * dziennik zdarzeń i skróty do modułów. Czyli obowiązki, gamifikację,
 * historię i nawigację — a ANI JEDNEJ rzeczy, nad którą człowiek faktycznie
 * pracuje. Żeby wrócić do wczorajszej notatki, trzeba było wejść w Notatki
 * i jej poszukać. Centrum zarządzania, z którego nie da się wrócić do pracy.
 *
 * ── DLACZEGO JEDEN STRUMIEŃ, A NIE LISTA NA MODUŁ ───────────────────────
 * Nikt nie myśli „chcę notatkę". Myśli „chcę wrócić do tego, nad czym
 * siedziałem we wtorek" — a we wtorek to była rozmowa, notatka i dwa obrazy.
 * Sortowanie po czasie ostatniej zmiany (nie utworzenia): notatka sprzed
 * miesiąca, którą wczoraj poprawiłeś, jest świeża — to do niej wracasz.
 *
 * ── PRZEBUDOWA 11.08.2026 (Michał: „lepiej wizualnie i pod kątem
 *    intuicyjności") — trzy decyzje:
 *
 * ① MINIATURY ZAMIAST IKON. Obrazy, tablice i filmy mają w bazie gotowe
 *    podglądy (`thumbnail_url` / klatka wejściowa), a kafelek pokazywał
 *    szarą ikonę i prompt „Transform the uploaded person…" — nie do
 *    rozpoznania. Obraz poznaje się PO OBRAZKU, nie po tytule.
 *
 * ② SERIE SKLEJONE. Pięć generacji z tej samej sesji to była jedna piąta
 *    listy — pięć identycznych wierszy. Sąsiadujące wpisy tego samego
 *    rodzaju o tym samym tytule zwijają się do jednego wiersza ze stosem
 *    miniatur i licznikiem „×5".
 *
 * ③ KOLORY TYPÓW Z WYSZUKIWARKI. Ta sama paleta co w typeConfig
 *    nextbyte-spotlight (notatka=amber, rozmowa=violet, wydarzenie=blue…)
 *    — oko uczy się jej RAZ na całą platformę.
 *
 * ── UCZCIWOŚĆ LINKÓW ────────────────────────────────────────────────────
 * Notatki, rozmowy i (od 11.08) dokumenty mają adres pojedynczego obiektu
 * i wchodzą prosto w treść — dokument prowadzi do SWOJEJ rozmowy przez
 * `conversation_id`. Obrazy/filmy/tablice głębokich adresów nie mają, więc
 * podpis mówi dokąd klik prowadzi („Studio Zdjęć"), a `title` dopowiada,
 * że otworzy się moduł. Kafelek, który obiecuje więcej, niż robi, uczy
 * nieufności do całego panelu.
 */

type Rodzaj = 'rozmowa' | 'notatka' | 'dokument' | 'obraz' | 'film' | 'tablica' | 'wydarzenie';

interface Rzecz {
  klucz: string;
  rodzaj: Rodzaj;
  tytul: string;
  kiedy: string;
  link: string;
  /** true, gdy link otwiera DOKŁADNIE tę rzecz, a nie tylko moduł. */
  dokladny: boolean;
  miniatura?: string;
}

/** Wiersz listy po sklejeniu serii — patrz decyzja ② w komentarzu wyżej. */
interface Pozycja extends Rzecz {
  ile: number;
  miniatury: string[];
}

/*
  TYP NIESIE KSZTAŁT IKONY, NIE BARWNIK (14.08.2026).

  Michał, o kafelkach Panelu Głównego: „czemu nie wyglądają globalnie tak dobrze
  jak ten u góry, z liquid glass bez jakiegoś jasnego czegoś w tle" — a wcześniej,
  o pasku bocznym: „nie rozdrabniać się na x kolorów, max 3 w danym motywie, żeby
  to nie wyglądało jak przedszkole".

  Było tu SIEDEM barw Tailwinda (violet, amber, sky, emerald, rose, cyan, blue),
  każda w pudełku z własnym tłem i obwódką — te same dwa defekty co w menu:
    ① paleta Tailwinda nie podąża za motywem, a platforma ma 9 motywów z bazy;
    ② siedem kolorów na jednej liście odbiera kolorowi znaczenie i kłóci się
       ze szkłem, bo każdy kafelek ikony kładzie na nim własną kolorową plamę.

  Zostaje neutralna skala `--foreground` — typ rozpoznaje się po KSZTAŁCIE ikony
  (dymek ≠ karteczka ≠ klatka filmu), dokładnie jak w Notion i Linear. Struktura
  pola (`kolor`/`tlo`) zostaje, bo używa jej też pasek filtrów niżej.
*/
const RODZAJE: Record<Rodzaj, {
  ikona: LucideIcon; etykieta: string; modul: string;
  kolor: string; tlo: string;
}> = {
  rozmowa: { ikona: MessageSquare, etykieta: 'Rozmowa', modul: 'Czat AI',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  notatka: { ikona: StickyNote, etykieta: 'Notatka', modul: 'Notatki',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  dokument: { ikona: FileText, etykieta: 'Dokument', modul: 'Czat AI',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  obraz: { ikona: ImageIcon, etykieta: 'Obraz', modul: 'Studio Zdjęć',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  film: { ikona: Video, etykieta: 'Film', modul: 'Studio Video',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  tablica: { ikona: Palette, etykieta: 'Tablica', modul: 'Tablice',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
  wydarzenie: { ikona: CalendarDays, etykieta: 'Wydarzenie', modul: 'Kalendarz',
    kolor: 'text-foreground/70', tlo: 'bg-foreground/[0.06] border-transparent' },
};

const WIDOCZNYCH = 14;

/** „14:32", „wczoraj", „3 dni temu", „12 lip" — im starsze, tym zgrubniej. */
const kiedyPoLudzku = (iso: string): string => {
  const d = new Date(iso);
  const minut = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minut < 60) return minut < 2 ? 'przed chwilą' : `${minut} min temu`;
  const godzin = Math.floor(minut / 60);
  if (godzin < 24) return `${godzin} godz. temu`;
  const dni = Math.floor(godzin / 24);
  if (dni === 1) return 'wczoraj';
  if (dni < 7) return `${dni} dni temu`;
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
};

/* GRUPY PO CZASIE (07.09.2026). Michał: „przerób to przepięknie, bez zbędnych
   rzeczy, każdy element przemyślany". Lista czternastu identycznych ramek
   nie mówiła, KIEDY co było — a to jest pytanie, z którym człowiek tu
   wraca („to z wczoraj"). Cztery koszyki wystarczą: dokładniejszy czas
   stoi i tak przy każdym wierszu. Nagłówek grupy jest w tym samym języku,
   co nagłówki sekcji paska bocznego. */
type Okres = 'dzis' | 'wczoraj' | 'tydzien' | 'wczesniej';
const OKRESY: Record<Okres, string> = { dzis: 'Dziś', wczoraj: 'Wczoraj', tydzien: 'Ten tydzień', wczesniej: 'Wcześniej' };
const okresDla = (iso: string): Okres => {
  const d = new Date(iso); const teraz = new Date();
  const poczatekDnia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dni = Math.round((poczatekDnia(teraz) - poczatekDnia(d)) / 86_400_000);
  if (dni <= 0) return 'dzis';
  if (dni === 1) return 'wczoraj';
  if (dni < 7) return 'tydzien';
  return 'wczesniej';
};
/** „14:32" dla dzisiejszych, „wczoraj 09:10", dalej „3 wrz". Krótko — stoi w prawej kolumnie. */
const czasWKolumnie = (iso: string, okres: Okres): string => {
  const d = new Date(iso);
  const godzina = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  if (okres === 'dzis') return godzina;
  if (okres === 'wczoraj') return godzina;
  if (okres === 'tydzien') return d.toLocaleDateString('pl-PL', { weekday: 'short' });
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
};

/** Sąsiadujące wpisy tego samego rodzaju o tym samym tytule → jeden wiersz. */
const sklejSerie = (rzeczy: Rzecz[]): Pozycja[] => {
  const wynik: Pozycja[] = [];
  for (const r of rzeczy) {
    const ostatnia = wynik[wynik.length - 1];
    if (ostatnia && ostatnia.rodzaj === r.rodzaj && ostatnia.tytul === r.tytul) {
      ostatnia.ile += 1;
      if (r.miniatura && ostatnia.miniatury.length < 3) ostatnia.miniatury.push(r.miniatura);
      continue;
    }
    wynik.push({ ...r, ile: 1, miniatury: r.miniatura ? [r.miniatura] : [] });
  }
  return wynik;
};

/** Miniatura z fallbackiem: zepsuty adres → kolorowa ikona typu, bez dziury. */
const Podglad: React.FC<{ p: Pozycja }> = ({ p }) => {
  const [padlo, setPadlo] = useState(false);
  const meta = RODZAJE[p.rodzaj];
  const Ikona = meta.ikona;

  if (p.miniatury.length === 0 || padlo) {
    return (
      <span
        aria-hidden="true"
        className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md border', meta.tlo, meta.kolor)}
      >
        <Ikona className="h-4 w-4" />
      </span>
    );
  }

  /* Stos: do trzech miniatur nachodzących na siebie — mówi „seria" szybciej
     niż jakikolwiek licznik. Licznik i tak stoi obok tytułu. */
  return (
    <span className="relative h-9 shrink-0" style={{ width: 36 + (p.miniatury.length - 1) * 10 }} aria-hidden="true">
      {p.miniatury.map((m, i) => (
        <img
          key={i}
          src={m}
          alt=""
          loading="lazy"
          onError={() => i === 0 && setPadlo(true)}
          className="absolute top-0 h-9 w-9 rounded-md border border-border object-cover"
          style={{ left: i * 10, zIndex: 3 - i }}
        />
      ))}
    </span>
  );
};

export const WrocDoRoboty: React.FC = () => {
  const userId = useAuthId();
  const [filtr, setFiltr] = useState<Rodzaj | null>(null);

  const { data: rzeczy = [], isLoading } = useQuery({
    queryKey: ['wroc-do-roboty', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<Rzecz[]> => {
      /* Każde źródło to jedno lekkie zapytanie po własnych wierszach — RLS
         i tak zawęża je do właściciela. Pobieramy po 6, bo do strumienia
         i tak wchodzi kilkanaście najświeższych. */
      const ZRODLA: Array<{
        tabela: string; rodzaj: Rodzaj; tytul: string; czas: string;
        /** dodatkowe kolumny: adresy miniatur / dane do zbudowania linku */
        dodatkowe?: string[];
        miniatura?: (w: any) => string | undefined;
        link: (id: string, wiersz?: any) => string;
        dokladny: boolean | ((w: any) => boolean);
      }> = [
        /* Rozmowy Asystenta i Czatu AI leżą w JEDNEJ tabeli i różnią się
           wyłącznie `conversation_mode`. Bez tego rozróżnienia kafelek wysyłał
           rozmowę Asystenta do Czatu AI — a tam jej nie ma na liście, bo lista
           filtruje po trybie (zmierzone 04.08.2026). */
        { tabela: 'chat_conversations', rodzaj: 'rozmowa', tytul: 'title', czas: 'last_message_at',
          dodatkowe: ['conversation_mode'],
          link: (id, w) => (w?.conversation_mode === 'nextbyte_assistant'
            ? `/asystent-nextbyte?rozmowa=${id}`
            : `/chat-ai?rozmowa=${id}`),
          dokladny: true },
        { tabela: 'user_notes', rodzaj: 'notatka', tytul: 'title', czas: 'updated_at',
          link: (id) => `/notatki/${id}`, dokladny: true },
        /* Dokument powstaje w rozmowie — `conversation_id` prowadzi PROSTO
           do niej. Przed 11.08 link szedł na goły /chat-ai i wiersz musiał
           przepraszać podpisem „otwórz Czat AI". */
        { tabela: 'chat_artifacts', rodzaj: 'dokument', tytul: 'title', czas: 'updated_at',
          dodatkowe: ['conversation_id'],
          link: (_id, w) => (w?.conversation_id ? `/chat-ai?rozmowa=${w.conversation_id}` : '/chat-ai'),
          dokladny: (w) => !!w?.conversation_id },
        { tabela: 'photo_studio_generations', rodzaj: 'obraz', tytul: 'prompt', czas: 'created_at',
          dodatkowe: ['thumbnail_url', 'image_url'],
          miniatura: (w) => w?.thumbnail_url || w?.image_url || undefined,
          link: () => '/studio-zdjec', dokladny: false },
        { tabela: 'studio_video_generations', rodzaj: 'film', tytul: 'prompt', czas: 'created_at',
          dodatkowe: ['input_image_url'],
          miniatura: (w) => w?.input_image_url || undefined,
          link: () => '/studio-video', dokladny: false },
        { tabela: 'whiteboards', rodzaj: 'tablica', tytul: 'title', czas: 'updated_at',
          dodatkowe: ['thumbnail_url'],
          miniatura: (w) => w?.thumbnail_url || undefined,
          link: () => '/tablice', dokladny: false },
      ];

      const wyniki = await Promise.all(ZRODLA.map(async (z) => {
        // Błąd jednego źródła NIE może wyczyścić całego strumienia.
        const { data, error } = await supabase
          .from(z.tabela as any)
          .select([`id`, z.tytul, z.czas, ...(z.dodatkowe ?? [])].join(', '))
          .eq('user_id', userId!)
          .order(z.czas, { ascending: false })
          .limit(6);
        if (error || !data) return [];
        return (data as any[])
          .filter((w) => w[z.czas])
          .map((w): Rzecz => ({
            klucz: `${z.rodzaj}-${w.id}`,
            rodzaj: z.rodzaj,
            tytul: String(w[z.tytul] ?? '').trim().slice(0, 70) || `Bez tytułu`,
            kiedy: w[z.czas],
            link: z.link(w.id, w),
            dokladny: typeof z.dokladny === 'function' ? z.dokladny(w) : z.dokladny,
            miniatura: z.miniatura?.(w),
          }));
      }));

      return wyniki.flat().sort((a, b) => +new Date(b.kiedy) - +new Date(a.kiedy));
    },
  });

  /* Filtry pokazujemy TYLKO dla rodzajów, które ten człowiek naprawdę ma.
     Pusty filtr „Filmy" u kogoś, kto nigdy nie tknął Studia Video, to
     przycisk, który zawsze prowadzi w pustkę. */
  const obecneRodzaje = useMemo(
    () => [...new Set(rzeczy.map((r) => r.rodzaj))],
    [rzeczy],
  );

  /* Serie sklejamy PO filtrze, a tniemy PO sklejeniu — inaczej pięć generacji
     zjadałoby pięć z czternastu miejsc jeszcze zanim zdążyły się zwinąć. */
  const widoczne = useMemo(
    () => sklejSerie(filtr ? rzeczy.filter((r) => r.rodzaj === filtr) : rzeczy).slice(0, WIDOCZNYCH),
    [rzeczy, filtr],
  );
  const grupy = useMemo(() => {
    const kolejnosc: Okres[] = ['dzis', 'wczoraj', 'tydzien', 'wczesniej'];
    const mapa = new Map<Okres, Pozycja[]>();
    for (const p of widoczne) {
      const o = okresDla(p.kiedy);
      if (!mapa.has(o)) mapa.set(o, []);
      mapa.get(o)!.push(p);
    }
    return kolejnosc.filter((o) => mapa.has(o)).map((o) => ({ okres: o, pozycje: mapa.get(o)! }));
  }, [widoczne]);

  /*
    LIMIT WYSOKOŚCI NA TELEFONIE (06.08.2026): lista ma `overflow-y-auto`,
    ale wewnętrzne przewijanie działa tylko przy zamkniętej wysokości rodzica.
    Zamyka ją układ Panelu dopiero od progu `ekran1` — poniżej domyka `60dvh`.
  */
  return (
    <Tile className="flex max-h-[60dvh] ekran1:max-h-none h-full flex-col">
      {/*
        ── KARTA BEZ NAGŁÓWKA — MÓWI ZAKŁADKAMI ─────────────────────────
        Michał: „czy tytuły możemy wywalić jak «Wróć do roboty / Twoje
        ostatnie rzeczy ze wszystkich modułów, od najświeższej» i zrobić te
        kafelki bardziej wizualnie z tablistami, aby kafelek sam w sobie
        mówił co i jak" — z dwiema referencjami, w których żadna karta nie
        ma pary nagłówek + zdanie opisu.

        Trzy wiersze na górze karty (ikona, tytuł, podtytuł) mówiły to samo,
        co widać dwa centymetry niżej: że to są ostatnie rzeczy i jakich są
        typów. Zakładki niosą to bez ani jednego zdania — „Wszystko" nazywa
        zbiór, a kolorowe ikony nazywają, z czego się składa. Te same ikony
        i te same kolory stoją potem przy każdej pozycji, więc rząd zakładek
        JEST legendą listy.

        Zwolnione ~52 px idą na pozycje: przy tej samej wysokości karty
        mieści się o dwie rzeczy więcej.
      */}

      {isLoading && <Szkielet wierszy={5} />}

      {!isLoading && rzeczy.length === 0 && (
        <PustyStan
          ikona={History}
          tytul="Jeszcze nic tu nie ma"
          opis="Gdy zaczniesz rozmawiać z AI, pisać notatki albo generować grafiki, wszystko wyląduje tutaj — żeby dało się wrócić jednym kliknięciem."
        />
      )}

      {/* WSZYSTKIE ZAKŁADKI WIDOCZNE NARAZ — bez przewijania (Michał, 11.08:
          „tab nie da się scrollować w boki, chciałbym aby każda zakładka była
          tam widoczna"). Poprzedni rząd miał ukryty scrollbar — na myszce bez
          trackpada to funkcja-widmo. Etykiety zeszły do IKON w kolorach typów:
          lista uczy tych samych ikon i kolorów dwa centymetry niżej, a osiem
          celów mieści się w kolumnie bez zwijania.
          13.08 (Michał: „po kliknięciu w zakładkę niech przy obrazie rozwija
          się napis co to jest a inne się chowają"): etykietę nosi WYŁĄCZNIE
          zakładka wybrana, reszta zostaje ikonami. „Wszystko" dostało własną
          ikonę, żeby nie było jedynym napisem w rzędzie ikon. Szerokość
          animujemy przez `max-w` — `width:auto` nie przechodzi płynnie. */}
      {obecneRodzaje.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFiltr(null)}
            aria-label="Wszystko"
            aria-pressed={filtr === null}
            title="Wszystko"
            className={cn(
              'flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border transition-all duration-200',
              filtr === null
                ? 'border-primary/40 bg-primary/10 px-3 text-primary'
                : 'w-8 justify-center border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap text-[12px] font-medium leading-none transition-all duration-200',
                filtr === null ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0',
              )}
            >
              Wszystko
            </span>
          </button>
          {obecneRodzaje.map((r) => {
            const meta = RODZAJE[r];
            const Ikona = meta.ikona;
            const wybrana = filtr === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setFiltr(wybrana ? null : r)}
                aria-label={meta.etykieta}
                aria-pressed={wybrana}
                title={meta.etykieta}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border transition-all duration-200',
                  wybrana
                    ? cn('border-primary/40 px-3', meta.tlo, meta.kolor)
                    : 'w-8 justify-center border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                <Ikona className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap text-[12px] font-medium leading-none transition-all duration-200',
                    wybrana ? 'max-w-[90px] opacity-100' : 'max-w-0 opacity-0',
                  )}
                >
                  {meta.etykieta}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Lista bierze RESZTĘ wysokości karty i tylko ona się przewija.
          Bez `min-h-0` dziecko flexa nie zejdzie poniżej swojej treści. */}
      {/* WIERSZE BEZ RAMEK (07.09.2026). Ramka wokół każdej pozycji robiła
          z listy ścianę pudełek, w której nic nie było ważniejsze od reszty.
          Teraz: cienka linia między wierszami, powierzchnia pojawia się pod
          kursorem, miniatura 36 px, tytuł i rodzaj po lewej, czas w prawej
          kolumnie — oko czyta w dół jedną osią, jak w skrzynce pocztowej. */}
      <div className="nb-pasek -mr-1 min-h-0 flex-1 overflow-y-auto pr-1">
        {grupy.map((g) => (
          <section key={g.okres} aria-label={OKRESY[g.okres]}>
            <h4 className="px-2 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/45 first:pt-1">
              {OKRESY[g.okres]}
            </h4>
            <ul className="divide-y divide-border/40">
              {g.pozycje.map((p) => {
                const meta = RODZAJE[p.rodzaj];
                return (
                  <li key={p.klucz}>
                    <Link
                      to={p.link}
                      title={p.dokladny ? undefined : `Otworzy moduł ${meta.modul}`}
                      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/[0.04]"
                    >
                      <Podglad p={p} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] text-card-foreground">{p.tytul}</span>
                          {p.ile > 1 && (
                            <span className="shrink-0 rounded-md bg-foreground/[0.07] px-1.5 py-px text-[10px] font-semibold tabular-nums text-foreground/70">
                              ×{p.ile}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {p.dokladny ? meta.etykieta : meta.modul}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground" title={kiedyPoLudzku(p.kiedy)}>
                        {czasWKolumnie(p.kiedy, g.okres)}
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-70"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Tile>
  );
};
