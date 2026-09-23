import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { pl } from 'date-fns/locale';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, format, isSameMonth, isBefore, isAfter,
} from 'date-fns';
import type { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { useRecurringEvents, type RecurringEvent } from '@/hooks/useRecurringEvents';
import { Calendar } from '@/components/ui/calendar';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  KALENDARZ MIESIĄCA — prawa kolumna Panelu Głównego
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał, z makiety 02.09.2026: „po prawo kalendarz widok miesięczny".
 * Wybrał pełny miesiąc zamiast paska tygodnia — jego decyzja, tu wprost.
 *
 * ── PIERWSZA WERSJA MILCZAŁA I WYGLĄDAŁA NA ZEPSUTĄ ──────────────────────
 * Michał: „nie pokazuje nic w kalendarzu". Sprawdzone w bazie: 93 wydarzenia,
 * z czego dwanaście w sierpniu, cztery w lipcu — i ZERO we wrześniu. Kropki
 * nie miały czego oznaczać, więc kalendarz był poprawny i bezużyteczny naraz:
 * pusta siatka niczym nie różni się od siatki, której zapytanie padło.
 *
 * ── I DRUGI RAZ, Z INNEGO POWODU ────────────────────────────────────────
 * Michał: „nie pokazują mi się wydarzenia a mam" — i miał rację, bo pełny
 * Kalendarz pokazywał 13 września „Rozliczyć i Wysłać VAT-8", a widżet nie.
 * Zmierzone: to wydarzenie ma `start_time` = 12.12.2025 i `is_series_master`,
 * `recurrence_type: monthly`, bez daty końca. Instancji NIE MA w bazie —
 * `useRecurringEvents` generuje je w pamięci. Moje okno `gte/lte` na
 * `start_time` odcinało wzorzec sprzed roku, więc żadna instancja nie
 * powstawała.
 *
 * Widżet pobiera teraz DOKŁADNIE to, co Kalendarz — wzorce serii bez okna
 * dat (jest ich mało z natury: u Michała trzy) plus zwykłe wydarzenia
 * w oknie — i rozwija je TĄ SAMĄ funkcją. Jedno źródło prawdy o tym, co
 * i kiedy się powtarza; gdyby reguła się zmieniła, zmieni się w obu naraz.
 *
 * Trzy rzeczy, które to naprawiają, wszystkie z jednego zapytania:
 *   · KROPKA pod dniem z wydarzeniem, a po najechaniu TYTUŁY (do trzech
 *     i „+N") — kalendarz mówi, co jest, nie tylko że coś jest.
 *   · PUSTY MIESIĄC mówi to wprost i pokazuje, GDZIE są wydarzenia:
 *     „Nic w tym miesiącu · ← sierpień". Jeden klik i widać znaczniki.
 *   · KLIK W DZIEŃ otwiera Kalendarz na tym dniu — strona rozumie
 *     `?date=YYYY-MM-DD` (deep-link ze Spotlighta), więc bez zmian po jej stronie.
 *
 * ── JEDNO ZAPYTANIE, SZERSZE OKNO ─────────────────────────────────────────
 * Pobieramy widoczną siatkę ±2 miesiące (`id, title, start_time`, limit 300).
 * Z tego samego wyniku wychodzą kropki, podpowiedzi i „najbliższy miesiąc
 * z wydarzeniami". Trzy osobne zapytania robiłyby to samo trzy razy.
 *
 * SZKŁO: kafelek jest szybą, kalendarz wchodzi w trybie `bezSzyby`.
 */

const WEEK_START = 1 as const;
const MAKS_TYTULOW_W_PODPOWIEDZI = 3;

/* `rodzaj` (03.09.2026, Michał: „tu zadania by się przydały oprócz wydarzeń").
   Zadanie z terminem jest w kalendarzu równie ważne co spotkanie — pełny
   Kalendarz pokazuje je od dawna jako pozycję całodniową (`useEventManager`),
   a widżet na pulpicie milczał o nich. */
type Rodzaj = 'wydarzenie' | 'zadanie';
type Wydarzenie = { id: string; title: string; start: Date; rodzaj: Rodzaj; zrobione?: boolean };

const kluczDnia = (d: Date) => format(d, 'yyyy-MM-dd');

/** Polska odmiana: 1 wydarzenie, 2 wydarzenia, 5 wydarzeń. */
const odmienPl = (n: number, formy: [string, string, string]) => {
  if (n === 1) return formy[0];
  const dziesiatki = n % 10;
  const setki = n % 100;
  if (dziesiatki >= 2 && dziesiatki <= 4 && (setki < 10 || setki >= 20)) return formy[1];
  return formy[2];
};

const KropkaDnia: React.FC<DayContentProps & { poDniu: Map<string, Wydarzenie[]> }> = ({ date, poDniu }) => {
  const dzisiejsze = poDniu.get(kluczDnia(date));
  const tresc = (
    <span className="relative flex h-full w-full items-center justify-center">
      {date.getDate()}
      {dzisiejsze && (
        /* Dwa znaczniki, rozróżniane KSZTAŁTEM, nie tylko kolorem: kółko to
           wydarzenie, kwadracik (jak pole wyboru w Zadaniach) to zadanie.
           Kolor sam by nie wystarczył osobie nieodróżniającej barw. */
        <span aria-hidden="true" className="absolute bottom-[3px] left-1/2 flex -translate-x-1/2 items-center gap-[2px]">
          {dzisiejsze.some((w) => w.rodzaj === 'wydarzenie') && (
            <span data-kropka className="h-1 w-1 rounded-full bg-primary" />
          )}
          {dzisiejsze.some((w) => w.rodzaj === 'zadanie') && (
            <span data-kropka-zadanie className="h-1 w-1 rounded-[1px] bg-foreground/55" />
          )}
        </span>
      )}
    </span>
  );
  if (!dzisiejsze) return tresc;

  const pokazane = dzisiejsze.slice(0, MAKS_TYTULOW_W_PODPOWIEDZI);
  const reszta = dzisiejsze.length - pokazane.length;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{tresc}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] text-xs">
        <ul className="space-y-0.5">
          {pokazane.map((w) => (
            <li key={w.id} className="flex gap-1.5">
              {/* Zadanie nie ma godziny — ma termin na dzień. Wpisywanie tam
                  „00:00" sugerowałoby północ, której nikt nie ustawiał. */}
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {w.rodzaj === 'zadanie' ? 'zadanie' : format(w.start, 'HH:mm')}
              </span>
              <span className={cn('truncate', w.zrobione && 'text-muted-foreground line-through')}>{w.title}</span>
            </li>
          ))}
          {reszta > 0 && <li className="text-muted-foreground">+{reszta} więcej</li>}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
};

export const KalendarzMiesiaca: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAuthId();
  const [miesiac, setMiesiac] = useState<Date>(() => startOfMonth(new Date()));

  /* Widoczna siatka (razem z dniami sąsiednich miesięcy, bo `showOutsideDays`
     je rysuje) — to zakres kropek. Zapytanie idzie szerzej, ±2 miesiące,
     żeby z tego samego wyniku wskazać najbliższy miesiąc z wydarzeniami. */
  const siatka = useMemo(() => ({
    od: startOfWeek(startOfMonth(miesiac), { weekStartsOn: WEEK_START }),
    do: endOfWeek(endOfMonth(miesiac), { weekStartsOn: WEEK_START }),
  }), [miesiac]);

  /* Rozwijamy serie na okno szersze niż siatka, bo z tego samego wyniku
     wskazujemy najbliższy miesiąc z wydarzeniami. */
  const oknoSerii = useMemo(() => ({
    od: subMonths(siatka.od, 2),
    do: addMonths(siatka.do, 2),
  }), [siatka]);

  /*
    DWA ZAPYTANIA, BO DWIE RÓŻNE NATURY.

    · WZORCE SERII — bez okna dat. Wzorzec „co miesiąc 13-go" może mieć
      `start_time` sprzed roku i nadal rodzić instancje na dziś; filtr po
      dacie startu odciąłby go i to był właśnie ten błąd. Jest ich mało
      z definicji (u Michała trzy), więc pełne pobranie jest tanie.
    · ZWYKŁE WYDARZENIA — w oknie ±2 miesiące. Tych bywa tysiące i tu okno
      jest konieczne; panel główny nie ściąga całych tablic.

    Kalendarz robi to jednym `.or('is_series_master.eq.true,recurrence_type.is.null')`
    BEZ żadnego okna. Świadomie nie kopiuję tego: on jest stroną kalendarza
    i stać go na komplet, widżet ma być tani.

    BEZ FILTRA `is_completed` — Kalendarz też go nie ma. Widżet ma pokazywać
    to samo co strona, do której prowadzi; własny filtr robiłby z niego
    drugą, cichszą prawdę.
  */
  const { data: surowe = [], isSuccess: dane } = useQuery({
    queryKey: ['kalendarz-miesiaca', userId, kluczDnia(oknoSerii.od)],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<RecurringEvent[]> => {
      const [serie, zwykle] = await Promise.all([
        supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', userId!)
          .eq('is_series_master', true)
          .limit(100),
        supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', userId!)
          .is('recurrence_type', null)
          .gte('start_time', oknoSerii.od.toISOString())
          .lte('start_time', oknoSerii.do.toISOString())
          .order('start_time', { ascending: true })
          .limit(300),
      ]);
      if (serie.error) throw serie.error;
      if (zwykle.error) throw zwykle.error;
      return [...(serie.data ?? []), ...(zwykle.data ?? [])] as RecurringEvent[];
    },
  });

  /*
    ZADANIA Z TERMINEM (03.09.2026, prośba Michała).

    Pełny Kalendarz bierze je z `user_tasks` po `due_date` i rysuje jako
    pozycje całodniowe (`useEventManager`). Widżet pobiera je tym samym
    warunkiem, w tym samym oknie co wydarzenia — bez filtra po statusie,
    bo Kalendarz też go nie ma, a zadanie zrobione w terminie nadal
    tłumaczy, czemu ten dzień był zajęty. Zrobione poznać po przekreśleniu
    w podpowiedzi.
  */
  const { data: zadania = [] } = useQuery({
    queryKey: ['kalendarz-miesiaca-zadania', userId, kluczDnia(oknoSerii.od)],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('id, title, due_date, status')
        .eq('user_id', userId!)
        .not('due_date', 'is', null)
        .gte('due_date', oknoSerii.od.toISOString())
        .lte('due_date', oknoSerii.do.toISOString())
        .order('due_date', { ascending: true })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
  });

  /* Ta sama funkcja, której używa pełny Kalendarz — wraz z obsługą dat
     wykluczonych z serii i limitem instancji. */
  const rozwiniete = useRecurringEvents(surowe, {
    startDate: oknoSerii.od,
    endDate: oknoSerii.do,
  });

  const wydarzenia = useMemo<Wydarzenie[]>(
    () => {
      const zWydarzen: Wydarzenie[] = rozwiniete.map((w) => ({
        /* Instancje serii dzielą `id` z wzorcem, więc klucz Reacta musi
           nieść też datę — inaczej dwanaście powtórzeń to jeden element. */
        id: `${w.id}-${w.start_time}`,
        title: w.title ?? '',
        start: new Date(w.start_time),
        rodzaj: 'wydarzenie' as const,
      }));
      const zZadan: Wydarzenie[] = (zadania as Array<{ id: string; title: string | null; due_date: string; status: string | null }>)
        .map((z) => ({
          id: `zadanie-${z.id}`,
          title: z.title ?? 'Zadanie bez nazwy',
          start: new Date(z.due_date),
          rodzaj: 'zadanie' as const,
          zrobione: z.status === 'done' || z.status === 'completed',
        }));
      return [...zWydarzen, ...zZadan].sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [rozwiniete, zadania],
  );

  const poDniu = useMemo(() => {
    const mapa = new Map<string, Wydarzenie[]>();
    for (const w of wydarzenia) {
      if (isBefore(w.start, siatka.od) || isAfter(w.start, siatka.do)) continue;
      const k = kluczDnia(w.start);
      mapa.set(k, [...(mapa.get(k) ?? []), w]);
    }
    return mapa;
  }, [wydarzenia, siatka]);

  const wTymMiesiacu = wydarzenia.filter((w) => isSameMonth(w.start, miesiac)).length;
  /* Podtytuł rozbity na rodzaje (03.09.2026): sama liczba nie mówi, czy to
     spotkania, czy terminy zadań, a to zupełnie inny rodzaj dnia. */
  const podtytulMiesiaca = useMemo(() => {
    const wMiesiacu = wydarzenia.filter((w) => isSameMonth(w.start, miesiac));
    const ileWydarzen = wMiesiacu.filter((w) => w.rodzaj === 'wydarzenie').length;
    const ileZadan = wMiesiacu.length - ileWydarzen;
    const czesci: string[] = [];
    if (ileWydarzen > 0) czesci.push(`${ileWydarzen} ${odmienPl(ileWydarzen, ['wydarzenie', 'wydarzenia', 'wydarzeń'])}`);
    if (ileZadan > 0) czesci.push(`${ileZadan} ${odmienPl(ileZadan, ['zadanie', 'zadania', 'zadań'])}`);
    return czesci.length > 0 ? czesci.join(' · ') : undefined;
  }, [wydarzenia, miesiac]);

  /* Gdy miesiąc jest pusty — najbliższy z wydarzeniami w tył i w przód,
     z tego samego wyniku. Wydarzenia są posortowane rosnąco.

     DOPIERO PO ODPOWIEDZI BAZY. Przed nią lista jest pusta i miesiąc
     wyglądałby na pusty przy KAŻDYM wejściu na pulpit — napis „Brak
     wydarzeń" mrugałby na ułamek sekundy także tym, którzy mają ich
     dwanaście. Wyszło w teście: wiersz istniał 15 ms po renderze, zanim
     jakiekolwiek dane mogły dojść. */
  const sasiedni = useMemo(() => {
    if (!dane || wTymMiesiacu > 0) return null;
    const przed = [...wydarzenia].reverse().find((w) => isBefore(w.start, startOfMonth(miesiac)));
    const po = wydarzenia.find((w) => isAfter(w.start, endOfMonth(miesiac)));
    return {
      przed: przed ? startOfMonth(przed.start) : null,
      po: po ? startOfMonth(po.start) : null,
    };
  }, [dane, wydarzenia, wTymMiesiacu, miesiac]);

  const otworzKalendarz = (dzien?: Date) =>
    navigate(dzien ? `/kalendarz?date=${kluczDnia(dzien)}` : '/kalendarz');

  return (
    <Tile zwarty className="h-full">
      <TileHeader
        ikona={CalendarDays}
        tytul="Kalendarz"
        podtytul={podtytulMiesiaca}
        poPrawej={
          <button
            type="button"
            onClick={() => otworzKalendarz()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Otwórz
            <ArrowRight className="h-3 w-3" />
          </button>
        }
      />
      <TooltipProvider>
        <Calendar
          bezSzyby
          locale={pl}
          weekStartsOn={WEEK_START}
          month={miesiac}
          onMonthChange={(m) => setMiesiac(startOfMonth(m))}
          onDayClick={(d) => otworzKalendarz(d)}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
            DayContent: (props) => <KropkaDnia {...props} poDniu={poDniu} />,
          }}
          classNames={{
            /* Ciaśniej niż w pełnym Kalendarzu: kolumna o szerokości jednej
               trzeciej, siatka 7×6 musi się zmieścić bez suwaka. */
            row: 'grid grid-cols-7 gap-1 w-full mb-0.5',
            day: 'w-full aspect-square p-0 inline-flex items-center justify-center rounded-md text-[11px] font-medium text-foreground transition-colors hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
            head_cell: 'text-muted-foreground text-[10px] font-medium uppercase tracking-wider text-center py-1',
            caption_label: 'text-sm font-semibold text-foreground capitalize',
            day_today: 'bg-primary/20 text-primary font-bold border border-primary/50',
            day_outside: 'text-muted-foreground/40',
          }}
        />
      </TooltipProvider>

      {/* Pusty miesiąc mówi, że jest pusty, i pokazuje, gdzie iść. Bez tego
          wiersza pusta siatka wygląda jak siatka po nieudanym zapytaniu. */}
      {sasiedni && (
        <p
          data-pusty-miesiac
          className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground"
        >
          <span>Nic w tym miesiącu</span>
          {sasiedni.przed && (
            <button
              type="button"
              onClick={() => setMiesiac(sasiedni.przed!)}
              className="inline-flex items-center gap-1 text-primary/80 transition-colors hover:text-primary"
            >
              <ChevronLeft className="h-3 w-3" />
              <span className="capitalize">{format(sasiedni.przed, 'LLLL', { locale: pl })}</span>
            </button>
          )}
          {sasiedni.po && (
            <button
              type="button"
              onClick={() => setMiesiac(sasiedni.po!)}
              className="inline-flex items-center gap-1 text-primary/80 transition-colors hover:text-primary"
            >
              <span className="capitalize">{format(sasiedni.po, 'LLLL', { locale: pl })}</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </p>
      )}
    </Tile>
  );
};

export default KalendarzMiesiaca;
