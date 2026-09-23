import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuthId } from '@/hooks/useAuth';
import { useAssignedCompanyTasks } from '@/hooks/useAssignedCompanyTasks';
import { useAssignedManagementTasks } from '@/hooks/useAssignedManagementTasks';
import { Tile, TileHeader } from '@/components/ui/tile';
import { Plakietka } from '@/components/ui/plakietka';
import { Button } from '@/components/ui/button';
import { Inbox, AlertTriangle, CalendarClock, UserPlus, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  SKRZYNKA SPRAW — jedna lista zamiast czterech kart
 * ════════════════════════════════════════════════════════════════════════
 *
 * Michał: „chciałbym, aby użytkownik miał w Panelu Głównym wszystko, co dla
 * niego najważniejsze, i żeby był centrum wszystkiego".
 *
 * ── CO ZASTĘPUJE ────────────────────────────────────────────────────────
 * Do 03.08.2026 to samo siedziało w CZTERECH kartach ułożonych w siatkę 2×2:
 * zaproszenia, powiadomienia systemowe, zbliżające się terminy i eventy.
 * Komentarze w `Dashboard.tsx` opisywały kolejne rundy walki z tym układem —
 * bo karty raz miały treść, raz nie, i siatka rozpadała się na dziury.
 *
 * To był objaw, nie przyczyna. Przyczyną było dzielenie JEDNEJ rzeczy
 * („co czeka na mnie") na cztery pojemniki wg tego, z jakiej tabeli pochodzi.
 * Użytkownik nie myśli „sprawdzę powiadomienia, potem terminy" — myśli
 * „mam trzy rzeczy do ogarnięcia". Skrzynka pokazuje dokładnie to.
 *
 * ── DLACZEGO SORTOWANIE PO PILNOŚCI, A NIE PO ŹRÓDLE ────────────────────
 * Przy dużym ruchu każdy użytkownik będzie miał inny rozkład: jeden same
 * terminy, drugi same zaproszenia, trzeci nic poza powiadomieniem o wersji.
 * Sztywna kolejność sekcji zawsze komuś wypycha najważniejszą rzecz w dół.
 * Wspólna skala `pilnosc` (0–100) rozstrzyga to bez zgadywania — a nowe
 * źródło dokłada się jedną pozycją w `zrodla`, nie nową kartą w siatce.
 *
 * ── PUSTA SKRZYNKA TO DOBRY STAN ────────────────────────────────────────
 * Nie rysujemy wtedy wielkiego pustego kafla z ilustracją. Jedna linijka
 * „Nic nie czeka" i tyle — bo brak spraw ma zajmować mało miejsca, a nie
 * krzyczeć tak samo jak trzy przeterminowane zadania.
 */

type Intencja = 'krytyczna' | 'akcent' | 'neutralna';

interface Sprawa {
  klucz: string;
  ikona: LucideIcon;
  tytul: string;
  kontekst?: string;
  /** 0–100. Wyżej = pilniej. Patrz komentarz nad plikiem. */
  pilnosc: number;
  intencja: Intencja;
  etykieta?: string;
  link?: string;
}

/** Ile spraw pokazujemy, zanim schowamy resztę pod przyciskiem. */
/* TRZY WIERSZE, RESZTA PRZEWIJANA (07.09.2026). Michał: „daj max 3, reszta
   przewijana, by w nieskończoność nie rosła zawartość". Wcześniej 5 wierszy
   + „Pokaż pozostałe” rozciągało kartę i spychało kalendarz. Wiersz ma
   stałą wysokość 52 px, więc trzy wiersze z dwoma odstępami to 180 px —
   lista dostaje taki sufit i przewija się w środku karty. */
const WYSOKOSC_WIERSZA = 52;
const ODSTEP = 6;
const MAKS_WYSOKOSC_LISTY = 3 * WYSOKOSC_WIERSZA + 2 * ODSTEP;

const dzien = (iso: string) => format(new Date(iso), 'd MMM', { locale: pl });

export const SkrzynkaSpraw: React.FC = () => {
  const userId = useAuthId();

  const { data: zadaniaFirmowe = [] } = useAssignedCompanyTasks();
  const { data: zadaniaZarzadu = [] } = useAssignedManagementTasks();

  const { data: zaproszenia = [] } = useQuery({
    queryKey: ['pending-event-invitations', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: wiersze, error } = await supabase
        .from('event_invitations')
        .select('id, event_id, created_at')
        .eq('invitee_id', userId!)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      const lista = wiersze ?? [];
      if (lista.length === 0) return [];

      const { data: wydarzenia } = await supabase
        .from('calendar_events')
        .select('id, title, start_time')
        .in('id', Array.from(new Set(lista.map((r) => r.event_id))));
      const mapa = new Map((wydarzenia ?? []).map((e) => [e.id, e]));
      return lista.map((r) => ({ ...r, wydarzenie: mapa.get(r.event_id) }));
    },
    staleTime: 5 * 60 * 1000,
  });

  /*
    ── DWIE LUKI, KTÓRE TU BYŁY ──────────────────────────────────────────
    Skrzynka zbierała zadania FIRMOWE i ZARZĄDU, ale nie zbierała dwóch
    rzeczy, które człowiek uzna za najbardziej swoje:

      · `user_tasks` — zadania z modułu „Zadania" w menu bocznym. Mają
        termin, mają priorytet i nikt o nich nie mówił.
      · `calendar_events` — WŁASNE wydarzenia. Zaproszenia od innych były
        zbierane, ale spotkanie wpisane samodzielnie już nie.

    Efekt był taki, że można było mieć spotkanie za godzinę i zadanie po
    terminie, a panel mówił „Nic nie czeka. Żadnych terminów ani zaproszeń."
    To gorsze niż brak skrzynki: skrzynka, która milczy, uczy, żeby na nią
    nie patrzeć.

    Oba zapytania są WĄSKIE — tylko pozycje z terminem w oknie 14 dni,
    limit 20, kilka kolumn. Panel główny nie może ściągać całych tablic.
  */
  const oknoDni = 14;

  const { data: zadaniaMoje = [] } = useQuery({
    queryKey: ['skrzynka-zadania-osobiste', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const granica = new Date(Date.now() + oknoDni * 86400000).toISOString();
      const { data, error } = await supabase
        .from('user_tasks')
        .select('id, title, due_date, status')
        .eq('user_id', userId!)
        .not('due_date', 'is', null)
        .neq('status', 'done')
        .lte('due_date', granica)
        .order('due_date', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: wydarzenia = [] } = useQuery({
    queryKey: ['skrzynka-wydarzenia', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const teraz = new Date().toISOString();
      const granica = new Date(Date.now() + oknoDni * 86400000).toISOString();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, start_time, is_all_day, is_completed')
        .eq('user_id', userId!)
        .gte('start_time', teraz)
        .lte('start_time', granica)
        .order('start_time', { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data ?? []).filter((w) => !w.is_completed);
    },
  });

  const sprawy = useMemo((): Sprawa[] => {
    const lista: Sprawa[] = [];
    const dzis = new Date();

    /* ── TERMINY ──────────────────────────────────────────────────────
       Zadanie po terminie rośnie w pilności wraz z opóźnieniem, ale nie
       w nieskończoność: po miesiącu jest już na szczycie i dalsze rośnięcie
       tylko spychałoby świeże, wciąż ratowalne sprawy.

       Pierwsza wersja miała tu `100 - min(-dni, 29)`, czyli DOKŁADNIE
       ODWROTNIE, niż mówił ten komentarz — zadanie zaległe od dnia stało nad
       zaległym od czterech. Widać to było dopiero na zrzucie z podglądu,
       nie w kodzie: lista wyglądała na posortowaną, tylko w złą stronę.
       Stąd zakres 71–100: każdy przeterminowany jest nad wszystkim innym,
       a między sobą decyduje staż zaległości. */
    const zTerminem = [
      ...zadaniaFirmowe.map((t: any) => ({ ...t, skad: 'Firma' })),
      ...zadaniaZarzadu.map((t: any) => ({ ...t, skad: 'Zarząd' })),
      /* „Moje" — bez nazwy modułu, bo to jedyna kategoria, która nie przyszła
         od nikogo z zewnątrz. „Zadania · 4 wrz" brzmiałoby jak przypisanie. */
      ...zadaniaMoje.map((t: any) => ({ ...t, skad: 'Moje' })),
    ].filter((t) => t.due_date && t.status !== 'done');

    for (const t of zTerminem) {
      const dni = differenceInCalendarDays(new Date(t.due_date), dzis);
      if (dni > 14) continue; // dalsza przyszłość to nie jest „sprawa na dziś"
      const poTerminie = dni < 0;
      lista.push({
        klucz: `zadanie-${t.id}`,
        ikona: poTerminie ? AlertTriangle : CalendarClock,
        tytul: t.title,
        kontekst: `${t.skad} · ${dzien(t.due_date)}`,
        pilnosc: poTerminie ? 70 + Math.min(-dni, 30) : dni <= 1 ? 65 : 55 - dni,
        intencja: poTerminie ? 'krytyczna' : dni <= 1 ? 'akcent' : 'neutralna',
        /* Ten sam zapis co w `UpcomingDeadlinesCard` — dwie formy tej samej
           informacji („4 dni po terminie" vs „po terminie o 4 dni") na jednym
           ekranie czytają się jak dwa różne rodzaje ostrzeżenia. */
        etykieta: poTerminie
          ? `${-dni} ${-dni === 1 ? 'dzień' : 'dni'} po terminie`
          : dni === 0 ? 'dzisiaj' : dni === 1 ? 'jutro' : `za ${dni} dni`,
        link: '/zadania',
      });
    }

    /* ── WŁASNE WYDARZENIA ────────────────────────────────────────────
       Wydarzenie różni się od zadania jednym: ma GODZINĘ, a nie tylko dzień.
       Spotkanie o 15:00 jest sprawą inną niż zadanie „na dziś" i dlatego
       dostaje własną etykietę z zegarem — „dziś 15:00" zamiast „dzisiaj".
       Całodniowe wracają do formy dniowej, bo godzina 00:00 nic tam nie znaczy. */
    for (const w of wydarzenia as any[]) {
      const start = new Date(w.start_time);
      const dni = differenceInCalendarDays(start, dzis);
      const godzina = format(start, 'HH:mm');
      lista.push({
        klucz: `wydarzenie-${w.id}`,
        ikona: CalendarClock,
        tytul: w.title || 'Wydarzenie',
        kontekst: `Kalendarz · ${dzien(w.start_time)}`,
        /* Dzisiejsze wydarzenie stoi nad wszystkim, co nie jest po terminie:
           zadania „na dziś" da się zrobić wieczorem, spotkania o 15:00 nie. */
        pilnosc: dni === 0 ? 68 : dni === 1 ? 60 : 52 - dni,
        intencja: dni <= 1 ? 'akcent' : 'neutralna',
        etykieta: w.is_all_day
          ? (dni === 0 ? 'dzisiaj' : dni === 1 ? 'jutro' : `za ${dni} dni`)
          : (dni === 0 ? `dziś ${godzina}` : dni === 1 ? `jutro ${godzina}` : `${dzien(w.start_time)}, ${godzina}`),
        link: '/kalendarz',
      });
    }

    /* ── ZAPROSZENIA ──────────────────────────────────────────────────
       Wysoko, bo po drugiej stronie czeka człowiek. To jedyna kategoria,
       w której zwłoka kosztuje kogoś innego, nie tylko użytkownika. */
    for (const z of zaproszenia as any[]) {
      lista.push({
        klucz: `zaproszenie-${z.id}`,
        ikona: UserPlus,
        tytul: z.wydarzenie?.title || 'Zaproszenie na wydarzenie',
        kontekst: z.wydarzenie?.start_time ? dzien(z.wydarzenie.start_time) : undefined,
        pilnosc: 70,
        intencja: 'akcent',
        etykieta: 'czeka na odpowiedź',
        link: '/kalendarz',
      });
    }

    /* POWIADOMIENIA SYSTEMOWE CELOWO TU NIE MA — decyzja Michała z 03.08.2026.
       Tabela `system_notifications` niesie ogłoszenia produktowe („poznaj
       arsenał", „włącz 2FA"), a nie sprawy konkretnego człowieka. Skrzynka ma
       odpowiadać na pytanie „co CZEKA NA MNIE", a ogłoszenie nie czeka na
       nikogo — wisi tak samo dla wszystkich i nie da się go „załatwić".
       Wpuszczenie ich tutaj rozmywałoby licznik: „9 spraw" przestałoby znaczyć
       dziewięć rzeczy do zrobienia. */

    return lista.sort((a, b) => b.pilnosc - a.pilnosc);
  }, [zadaniaFirmowe, zadaniaZarzadu, zadaniaMoje, wydarzenia, zaproszenia]);

  const pilnych = sprawy.filter((s) => s.intencja === 'krytyczna').length;

  if (sprawy.length === 0) {
    /*
      PUSTY STAN WYPEŁNIA MIEJSCE, ALE NIE KRZYCZY.

      Do 26.08 był jednym paskiem: „Nic nie czeka" i tyle — słusznie, bo
      skrzynka stała w wąskiej kolumnie pod pięcioma innymi widżetami.
      Po przeniesieniu do prawej kolumny ten sam pasek zostawiał pod sobą
      kilkaset pikseli pustki, czyli dokładnie to, co mieliśmy usunąć.

      Brak spraw to nie jest błąd i nie dostaje ostrzegawczych barw. Dostaje
      spokojną kartę, która mówi, CO TU BĘDZIE — bo człowiek widzący ten
      ekran pierwszy raz nie wie, że to miejsce w ogóle się zapełnia — i dwa
      wyjścia, którymi da się je zapełnić. Pusty stan bez wyjścia jest ślepą
      uliczką; to ta sama zasada, co w `PustyStan` z biblioteki.
    */
    return (
      <Tile className="flex flex-col items-center justify-center gap-3 px-4 py-7 text-center">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/40 text-muted-foreground"
        >
          <Check className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-foreground">Nic nie czeka</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="cichy" size="sm">
            <Link to="/kalendarz">Zaplanuj wydarzenie</Link>
          </Button>
          <Button asChild variant="cichy" size="sm">
            <Link to="/zadania">Dodaj zadanie</Link>
          </Button>
        </div>
      </Tile>
    );
  }

  return (
    <Tile intencja={pilnych > 0 ? 'krytyczna' : 'akcent'} className="flex h-full min-h-0 flex-col">
      <TileHeader
        ikona={Inbox}
        /* „Czeka na Ciebie", nie „Wymaga Ciebie". Tamto jest kalką i po
           polsku brzmi obco — a przy pustym stanie piszemy „Nic nie czeka",
           więc nagłówek i jego brak mówiły dwoma różnymi językami. */
        tytul="Czeka na Ciebie"
        podtytul={
          pilnych > 0
            ? `${sprawy.length} ${sprawy.length === 1 ? 'sprawa' : 'spraw'}, w tym ${pilnych} po terminie`
            : `${sprawy.length} ${sprawy.length === 1 ? 'sprawa' : 'spraw'}`
        }
        intencja={pilnych > 0 ? 'krytyczna' : 'akcent'}
        poPrawej={
          <Plakietka intencja={pilnych > 0 ? 'krytyczna' : 'akcent'}>{sprawy.length}</Plakietka>
        }
      />

      {/* Lista bierze resztę wysokości karty i tylko ona się przewija.
          Bez tego przy ekranie 1280×720 (zwykły laptop) skrzynka + kafelek
          eventu miały razem 438 px w kolumnie o 326 px — a kolumna ma
          `overflow-hidden`, więc 129 px treści po prostu ZNIKAŁO: bez paska,
          bez sygnału, bez sposobu, żeby do tego dotrzeć. Panel wyglądał
          poprawnie tylko na wysokim monitorze. */}
      <ul className="nb-pasek -mr-1 min-h-0 space-y-1.5 overflow-y-auto pr-1" style={{ maxHeight: MAKS_WYSOKOSC_LISTY }}>
        {sprawy.map((s) => {
          const Ikona = s.ikona;
          const tresc = (
            <>
              <span
                className={
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border '
                  + (s.intencja === 'krytyczna'
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : s.intencja === 'akcent'
                      ? 'border-primary/25 bg-primary/10 text-primary'
                      : 'border-border bg-muted/50 text-muted-foreground')
                }
                aria-hidden="true"
              >
                <Ikona className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-card-foreground">{s.tytul}</span>
                {s.kontekst && (
                  <span className="block truncate text-[11px] text-muted-foreground">{s.kontekst}</span>
                )}
              </span>
              {s.etykieta && (
                <span className="shrink-0">
                  <Plakietka intencja={s.intencja === 'krytyczna' ? 'krytyczna' : 'neutralna'}>
                    {s.etykieta}
                  </Plakietka>
                </span>
              )}
            </>
          );

          return (
            <li key={s.klucz}>
              {/* Wiersz bez linku NIE udaje klikalnego — brak `hover` i kursora.
                  Kafelek, który wygląda na klikalny i nic nie robi, uczy
                  nieufności do całego panelu. */}
              {s.link ? (
                <Link
                  to={s.link}
                  className="flex items-center gap-2.5 rounded-xl border border-border p-2 transition-colors hover:border-primary/30"
                  style={{ height: WYSOKOSC_WIERSZA }}
                >
                  {tresc}
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-border p-2" style={{ height: WYSOKOSC_WIERSZA }}>{tresc}</div>
              )}
            </li>
          );
        })}
      </ul>

    </Tile>
  );
};
