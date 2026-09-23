import { createPortal } from 'react-dom';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useMeasure from 'react-use-measure';
import {
  Bell, User, ChevronRight, CircleFadingArrowUp, Settings, LogOut,
  CheckCheck, Wallet, Activity, MessageSquare, Image as Obraz, Video,
  X, CheckCircle2, AlertCircle, Ban, LayoutGrid,
} from 'lucide-react';
import { useZadaniaWToku, type ZadanieWToku } from '@/hooks/useZadaniaWToku';
import { IkonaByte, SYMBOL_BYTE } from '@/lib/byte';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useSidebar } from '@/components/ui/sidebar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useByteBurn } from '@/hooks/useByteBurn';
import { useUnifiedNotifications, type UnifiedNotification } from '@/hooks/useUnifiedNotifications';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { PustyStan } from '@/components/ui/stany';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  PASEK KART W STOPCE PASKA BOCZNEGO
 * ════════════════════════════════════════════════════════════════════════
 *
 * Zastępuje trzy osobne kontrolki (awatar z imieniem, dzwonek, koło zębate)
 * jednym paskiem, który rozwija się w górę. Wzorzec zadany przez Michała:
 * „Motion Tabs Menu" z ui.unlumen.com.
 *
 * ── CO WZIĄŁEM Z REFERENCJI, A CZEGO NIE ────────────────────────────────
 * Wzięty MECHANIZM, nie kod:
 *   · pojemnik o animowanej wysokości, pasek ikon przyklejony do jego DOŁU —
 *     dzięki temu panel rośnie w GÓRĘ, a stopka zostaje na miejscu
 *   · etykieta aktywnej karty wjeżdża animacją szerokości
 *   · treść przesuwa się w bok zgodnie z KIERUNKIEM przejścia między kartami
 *   · zamykanie kliknięciem poza pojemnikiem
 *
 * Odrzucone świadomie:
 *   · animacja SZEROKOŚCI paska — w referencji pasek pływa swobodnie, u nas
 *     siedzi w kolumnie o stałej szerokości. Rosnąć nie ma dokąd, więc pasek
 *     zajmuje całą szerokość stopki, a animacja etykiety zostaje.
 *   · demonstracyjne dane (zadania, pomysły, „Sarah commented on…") — każda
 *     karta czyta prawdziwe dane platformy.
 *   · `bg-background` na panelu — patrz akapit o szkle niżej.
 *
 * ── SZKŁO: ODDAJEMY DECYZJĘ PLATFORMIE ──────────────────────────────────
 * Panel nosi `nb-szklo nb-szklo-plynne nb-kafelek` — pełny materiał
 * biblioteki, bez własnego wypełnienia.
 *
 * Trzeba wiedzieć, co się wtedy dzieje, żeby nie zgłupieć przy pomiarze:
 * pasek boczny SAM jest szybą, więc panel łapie strażnika zagnieżdżenia
 * (`index.css:2570`). Strażnik zdejmuje `backdrop-filter` i podmienia
 * wypełnienie na materiał dla szyby-w-szybie (krycie karty +0.10, welon
 * primary/0.03). To jest CELOWE i wspólne dla całej platformy — rozmywanie
 * już-rozmytego nic nie wnosi, a kosztuje klatki (zmierzone 39→101 fps przy
 * wprowadzaniu strażnika). Wysokość niesie krycie i rant, nie rozmycie.
 *
 * Dlatego NIE podajemy `bg-*` ani `border-*` z Tailwinda: przy zagnieżdżeniu
 * i tak przegrywają ze strażnikiem, a na wierzchu (gdyby panel kiedyś stanął
 * poza paskiem) kłóciłyby się z materiałem. Jedno źródło prawdy — biblioteka.
 */

type Karta = 'wtoku' | 'aktywnosc' | 'saldo' | 'profil';

/* Kolejność wskazana przez Michała: profil na samym prawym końcu — tam, gdzie
   ręka szuka konta w każdej innej aplikacji. */
const KARTY: { klucz: Karta; etykieta: string; ikona: React.ElementType }[] = [
  { klucz: 'wtoku', etykieta: 'W toku', ikona: Activity },
  { klucz: 'aktywnosc', etykieta: 'Aktywność', ikona: Bell },
  { klucz: 'saldo', etykieta: 'Saldo', ikona: IkonaByte },
  { klucz: 'profil', etykieta: 'Profil', ikona: User },
];

const sprezyna = { type: 'spring' as const, duration: 0.45, bounce: 0 };

const wariantyTresci = {
  wejscie: (kierunek: number) => ({ x: `${45 * kierunek}%`, opacity: 0 }),
  aktywna: { x: '0%', opacity: 1 },
  wyjscie: (kierunek: number) => ({ x: `${-45 * kierunek}%`, opacity: 0 }),
};

const wariantyListy = {
  ukryta: {},
  pokaz: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};

const wariantyPozycji = {
  ukryta: { opacity: 0, y: 6 },
  pokaz: { opacity: 1, y: 0, transition: { duration: 0.25, type: 'spring' as const, bounce: 0 } },
};

/* ── KARTA: POSTĘP ─────────────────────────────────────────────────────
   Saldo + realny przebieg salda z ostatnich 7 dni. Wykres rysuje SALDO,
   nie „zużycie dzienne" — bo zużycie policzone z różnicy sald kłamałoby
   w dniu doładowania (wpłata zamaskowałaby wydatek). `useByteBurn` liczy
   zużycie osobno i to jego liczbę pokazujemy pod wykresem. */
const KartaSaldo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { balance } = useWallet();
  const { burn, zuzycieDzienne, ladowanie } = useByteBurn(user?.id, balance, 7);

  /* Wykres pokazuje ZUŻYCIE, nie saldo — pierwsza wersja rysowała saldo
     i wyszła płaska jak deska (1806 → 1702 przez tydzień to różnica
     niewidoczna przy skali od zera). Zużycie dzienne ma prawdziwą zmienność
     i o nie prosił Michał. Liczy je `useByteBurn` z RUCHÓW, nie z różnicy
     sald — inaczej doładowanie zamaskowałoby wydatek z tego samego dnia. */
  const maks = Math.max(...zuzycieDzienne, 1);
  /*
    ── SŁUPEK MA POWIEDZIEĆ, CO POKAZUJE (10.09.2026) ────────────────────────
    Michał: „aby po najechaniu pokazywało się ładnie ile użycia jest w danym dniu".

    Było `title={...}` — czyli podpowiedź SYSTEMOWA: pojawia się po sekundzie,
    w stylu systemu operacyjnego zamiast platformy, i niesie samą liczbę.
    Przy siedmiu słupkach z etykietami „Pn/Wt/Śr" gołe „123 ⟠" nie mówi nawet,
    którego dnia dotyczy — trzeba było wodzić wzrokiem w dół.

    Dzień liczymy z PRAWDZIWEJ DATY, nie z przesunięcia indeksu w tablicy
    skrótów: poprzedni wzór (`(dzisiajIdx - (len-1-i) + 14) % 7`) dawał
    właściwą nazwę, ale nie miał z czego wziąć daty do podpowiedzi.
  */
  const DNI_KROTKO = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const DNI_PELNE = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  const sumaOkna = zuzycieDzienne.reduce((a, b) => a + b, 0);
  const dniWykresu = useMemo(() => zuzycieDzienne.map((wartosc, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (zuzycieDzienne.length - 1 - i));
    const idx = (data.getDay() + 6) % 7;
    return {
      wartosc,
      krotko: DNI_KROTKO[idx],
      pelne: DNI_PELNE[idx],
      data: data.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
      dzis: i === zuzycieDzienne.length - 1,
    };
  }), [zuzycieDzienne]);

  return (
    <motion.div variants={wariantyListy} initial="ukryta" animate="pokaz" className="flex flex-col gap-3">
      <motion.div variants={wariantyPozycji} className="flex items-end justify-between">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">Saldo portfela</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand-primary tabular-nums">
              {ladowanie ? '—' : balance.toFixed(0)}
            </span>
            <span className="text-sm text-brand-primary">{SYMBOL_BYTE}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/plan?tab=byte')}
          className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Wallet className="h-3 w-3" />
          Doładuj
        </button>
      </motion.div>

      {/* Wykres: wysokość słupka = saldo tamtego dnia względem najwyższego w oknie */}
      <motion.div variants={wariantyPozycji} className="flex h-16 items-end gap-1">
        {dniWykresu.map((dzien, i) => (
          <Tooltip key={i} delayDuration={80}>
            {/* Wyzwalaczem jest CAŁA KOLUMNA, nie sam słupek: przy zużyciu 0 słupek
                ma dwa piksele wysokości i trafienie w niego myszą jest loterią. */}
            <TooltipTrigger asChild>
              <div className="group flex flex-1 cursor-default flex-col items-center gap-1">
                <div className="flex h-11 w-full items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((dzien.wartosc / maks) * 44, 2)}px` }}
                    transition={{ ...sprezyna, delay: 0.05 + i * 0.05 }}
                    className={cn(
                      'w-full rounded-sm transition-colors',
                      dzien.wartosc === 0 ? 'bg-foreground/10 group-hover:bg-foreground/20'
                        : dzien.dzis ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
                        : 'bg-primary/45 group-hover:bg-primary/70'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[9px] leading-none transition-colors',
                  dzien.dzis ? 'font-medium text-foreground/80' : 'text-muted-foreground',
                  'group-hover:text-foreground',
                )}>
                  {dzien.krotko}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="px-2.5 py-1.5">
              <div className="text-[11px] font-medium">
                {dzien.dzis ? 'Dziś' : dzien.pelne}
                <span className="ml-1 font-normal text-muted-foreground">· {dzien.data}</span>
              </div>
              {dzien.wartosc === 0 ? (
                <div className="text-[11px] text-muted-foreground">bez zużycia</div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-semibold tabular-nums text-primary">
                    {Math.round(dzien.wartosc)} {SYMBOL_BYTE}
                  </span>
                  {/* Udział w tygodniu — sama liczba nie mówi, czy to dużo.
                      Pokazujemy go tylko wtedy, gdy jest z czego liczyć. */}
                  {sumaOkna > 0 && (
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {Math.round((dzien.wartosc / sumaOkna) * 100)}% tygodnia
                    </span>
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>

      <motion.div variants={wariantyPozycji} className="flex flex-col gap-1 border-t border-border/50 pt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Zużyte przez 7 dni</span>
          <span className="font-medium tabular-nums">{burn.zuzyteWOknie} {SYMBOL_BYTE}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Średnio dziennie</span>
          <span className="font-medium tabular-nums">{burn.naDzien} {SYMBOL_BYTE}</span>
        </div>
        {/* Prognozę pokazujemy TYLKO gdy jest z czego liczyć — „wystarczy na ∞ dni"
            przy zerowym zużyciu byłoby informacją bez treści. */}
        {burn.maPrognoze && burn.dniDoKonca !== null && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Wystarczy na</span>
            <span className="font-medium tabular-nums">{burn.dniDoKonca} dni</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


/* ── KARTA: W TOKU ─────────────────────────────────────────────────────
   Podgląd pracy, która trwa gdzie indziej: generowanie obrazu, wideo,
   zadania czatu w tle. Sens tej karty jest jeden — móc odejść do innej
   zakładki i nie zgadywać, czy tamto już się skończyło. */

const IKONY_ZRODEL: Record<ZadanieWToku['zrodlo'], React.ElementType> = {
  czat: MessageSquare,
  zdjecia: Obraz,
  wideo: Video,
};

const NAZWY_ZRODEL: Record<ZadanieWToku['zrodlo'], string> = {
  czat: 'Chat AI',
  zdjecia: 'Studio Zdjęć',
  wideo: 'Studio Video',
};

/* Karta NIE woła haka sama — dostaje dane od paska. Powód jest konkretny:
   dwa wywołania `useZadaniaWToku` to dwie subskrypcje realtime, a przy
   zamykaniu panelu jedna gasiła drugą (patrz komentarz w haku). Jedna
   instancja na górze to też jedno zapytanie zamiast dwóch. */
type DaneZadan = ReturnType<typeof useZadaniaWToku>;

const KartaWToku: React.FC<{ naZamknij: () => void; dane: DaneZadan }> = ({ naZamknij, dane }) => {
  const navigate = useNavigate();
  const { zadania, aktywne, zakonczone, odrzuc, odrzucZakonczone } = dane;

  const idzDo = (z: ZadanieWToku) => {
    naZamknij();
    navigate(z.dokad);
  };

  if (zadania.length === 0) {
    return (
      <PustyStan
        tytul="Nic się nie dzieje"
        opis="Gdy zaczniesz generować obraz, wideo albo puścisz zadanie w tle, zobaczysz tu jego postęp — nawet z innej zakładki."
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {aktywne.length > 0
            ? `${aktywne.length} ${aktywne.length === 1 ? 'zadanie trwa' : 'w toku'}`
            : 'Wszystko gotowe'}
        </span>
        {zakonczone.length > 0 && (
          <button
            type="button"
            onClick={odrzucZakonczone}
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Wyczyść zakończone
          </button>
        )}
      </div>

      <div className="max-h-[19rem] space-y-1.5 overflow-y-auto pr-0.5">
        {zadania.map((z) => {
          const IkonaZrodla = IKONY_ZRODEL[z.zrodlo];
          const trwa = z.stan === 'trwa';
          return (
            <div
              key={z.id}
              className={cn(
                'group relative w-full rounded-xl border transition-colors',
                trwa
                  ? 'border-primary/30 bg-primary/[0.06]'
                  : z.stan === 'blad'
                    ? 'border-destructive/25 bg-destructive/[0.05]'
                    : 'border-border/30 bg-card/20'
              )}
            >
              <button
                type="button"
                onClick={() => idzDo(z)}
                className="flex w-full items-start gap-2 rounded-xl p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div
                  className={cn(
                    'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    trwa ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-muted-foreground'
                  )}
                >
                  <IkonaZrodla className="h-3.5 w-3.5" />
                  {/* Puls zamiast paska, gdy źródło nie raportuje procentów —
                      udawany pasek postępu byłby zmyśloną liczbą. */}
                  {trwa && (
                    <span className="absolute inset-0 rounded-lg border border-primary/50 motion-safe:animate-ping" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                      {NAZWY_ZRODEL[z.zrodlo]}
                    </span>
                    {z.stan === 'gotowe' && <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />}
                    {z.stan === 'blad' && <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />}
                    {z.stan === 'anulowane' && <Ban className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  </div>
                  <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
                    {z.tytul}
                  </p>

                  {trwa && z.postep !== null && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={false}
                        animate={{ width: `${Math.min(100, Math.max(0, z.postep))}%` }}
                        transition={sprezyna}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  )}
                  {trwa && z.postep === null && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        animate={{ x: ['-100%', '250%'] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-1/3 rounded-full bg-primary"
                      />
                    </div>
                  )}
                  {z.opisPostepu && (
                    <p className="mt-1 truncate text-[10px] text-muted-foreground">{z.opisPostepu}</p>
                  )}
                  {z.blad && (
                    <p className="mt-1 line-clamp-2 text-[10px] text-destructive">{z.blad}</p>
                  )}
                </div>
              </button>

              {/* „X" chowa pozycję z TEJ listy — nie kasuje generowania z galerii
                  studia. Dostępny dopiero po zakończeniu: zamykanie trwającego
                  zadania sugerowałoby, że je przerywa, a tego nie robi. */}
              {!trwa && (
                <button
                  type="button"
                  aria-label="Ukryj z listy"
                  onClick={(e) => { e.stopPropagation(); odrzuc(z.id); }}
                  className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── KARTA: AKTYWNOŚĆ ──────────────────────────────────────────────────── */
const KartaAktywnosc: React.FC<{ naZamknij: () => void }> = ({ naZamknij }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUnifiedNotifications();

  /* Nieprzeczytane na górze. W popoverze lista jest długa i przewijana, więc
     kolejność czasowa wystarcza; w pasku widać naraz dwie pozycje, więc to,
     co wymaga uwagi, musi być pierwsze. Wewnątrz grup zostaje kolejność
     źródłowa (najnowsze najpierw) — nie mieszamy dwóch sortowań. */
  const posortowane = useMemo(
    () => [...notifications].sort((a, b) => Number(a.isRead) - Number(b.isRead)),
    [notifications]
  );

  const otworz = async (n: UnifiedNotification) => {
    await markAsRead(n);
    naZamknij();
    if (n.link) navigate(n.link);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystko przeczytane'}
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <CheckCheck className="h-3 w-3" />
            Oznacz wszystkie
          </button>
        )}
      </div>

      {/* Sufit wysokości + własne przewijanie: bez tego długa lista rozepchnęłaby
          stopkę na całą wysokość paska i zjadła menu nad nią. */}
      <div className="max-h-[19rem] space-y-1.5 overflow-y-auto pr-0.5">
        {posortowane.length === 0 ? (
          <PustyStan tytul="Brak powiadomień" opis="Tu pojawią się zaproszenia, wiadomości i zmiany w Twoich projektach." />
        ) : (
          posortowane.map((n) => (
            <NotificationRow
              key={n.id}
              kompaktowy
              notification={n}
              onOpen={() => otworz(n)}
              onMarkRead={() => { markAsRead(n); }}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* ── KARTA: PROFIL ─────────────────────────────────────────────────────── */
const KartaProfil: React.FC<{ naZamknij: () => void }> = ({ naZamknij }) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthContext();
  const { isSubscribed } = useSubscriptionContext();
  const { isMobile, setOpenMobile } = useSidebar();
  const { toast } = useToast();

  const idz = (sciezka: string) => {
    naZamknij();
    if (isMobile) setOpenMobile(false);
    navigate(sciezka);
  };

  const wyloguj = async () => {
    naZamknij();
    try {
      await signOut();
      navigate('/');
    } catch {
      toast({ title: 'Nie udało się wylogować', description: 'Spróbuj ponownie.', variant: 'destructive' });
      navigate('/');
    }
  };

  /* BEZ OPISÓW PO PRAWEJ. Pierwsza wersja dokładała e-mail przy „Konto"
     i „Subskrypcja aktywna" przy „Premium" — w kolumnie ~240 px zjadały tyle
     miejsca, że z głównych etykiet zostawało „K…" i „Prem…". Michał zobaczył
     to od razu: nazwa pozycji jest ważniejsza niż jej przypis. Stan Premium
     niesie sam znacznik ✓ przy etykiecie, więc nic nie ginie. */
  const pozycje = [
    { ikona: User, etykieta: 'Konto', akcja: () => idz('/konto') },
    {
      ikona: CircleFadingArrowUp,
      etykieta: isSubscribed ? 'Premium ✓' : 'Premium',
      akcja: () => idz('/plan?tab=subskrypcja'),
    },
    { ikona: Settings, etykieta: 'Ustawienia', akcja: () => idz('/ustawienia') },
    { ikona: LogOut, etykieta: 'Wyloguj się', akcja: wyloguj, niebezpieczna: true },
  ];

  return (
    <motion.div variants={wariantyListy} initial="ukryta" animate="pokaz" className="flex flex-col gap-0.5">
      {pozycje.map(({ ikona: Ikona, etykieta, akcja, niebezpieczna }) => (
        <motion.button
          key={etykieta}
          type="button"
          variants={wariantyPozycji}
          onClick={akcja}
          className={cn(
            'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2 text-sm font-medium transition-colors',
            niebezpieczna
              ? 'text-destructive hover:bg-destructive/10'
              : 'hover:bg-foreground/[0.06]'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Ikona className={cn('h-4 w-4 shrink-0', niebezpieczna ? 'text-destructive' : 'text-muted-foreground')} />
            <span className="truncate">{etykieta}</span>
          </div>
          {!niebezpieczna && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </motion.button>
      ))}
    </motion.div>
  );
};

/* ── PASEK ─────────────────────────────────────────────────────────────── */

interface PropsPaska {
  /**
   * Szyna ikon (zwiniety pasek). Karty nie maja sie gdzie rozwinac przy 56 px,
   * wiec pokazujemy same ikony w pionie, a klikniecie ROZWIJA pasek i otwiera
   * wybrana karte. Bez tego w szynie wisiala stara stopka — Michal: „pokazuje
   * na dole co innego niz robilismy".
   */
  zwiniety?: boolean;
  /**
   * Wariant PASKA GÓRNEGO. Ta sama pastylka, tylko rośnie W DÓŁ, bo stoi
   * pod górną krawędzią ekranu, a nie nad dolną.
   *
   * Trzy różnice wobec stopki, każda wymuszona miejscem:
   *   • panel NIE rozpycha paska — zjechałby cały ekran przy każdym otwarciu.
   *     Zamiast tego opada jako warstwa pływająca, zakotwiczona do prawej.
   *   • pasek ikon jest wciśnięty w szybę nagłówka (`nb-wglebienie`), nie
   *     jest własną szybą — na szkle nie kładzie się szkła.
   *   • karty są WSZYSTKIE CZTERY, razem z „Saldo" — a osobny kafelek
   *     `ByteBalance` znika z lewej strony paska. Michał: „nie ma tam ikony
   *     z byte, ona powinna stara z lewej strony zniknąć ten element".
   *     Ta sama decyzja, którą podjęła stopka paska bocznego: gdzie jest
   *     karta salda, tam nie ma osobnego kafelka z tą samą liczbą.
   */
  naGorze?: boolean;
}

export const PasekKart: React.FC<PropsPaska> = ({ zwiniety = false, naGorze = false }) => {
  const [wybrana, setWybrana] = useState<Karta | null>(null);
  const [kierunek, setKierunek] = useState(1);
  const [ostatniaWysokosc, setOstatniaWysokosc] = useState(0);
  const [refMiary, wymiary] = useMeasure();
  const refPojemnika = useRef<HTMLDivElement>(null);
  const { unreadCount } = useUnifiedNotifications();
  const daneZadan = useZadaniaWToku();
  const zadaniaAktywne = daneZadan.aktywne;
  const { setOpen } = useSidebar();

  /* ── PANEL PASKA GÓRNEGO IDZIE PORTALEM ──────────────────────────────
     Szyba NIE MOŻE być dzieckiem szyby: `backdrop-filter` przodka rozmywa
     tło raz, a dziecko nie ma już czego rozmywać — jego własny filtr
     przestaje działać. Pasek górny NIESIE materiał (`nb-szklo
     nb-szklo-plynne nb-szklo-pasek`), więc panel renderowany w środku
     wychodził PŁASKI. Michał, ze zrzutu: „nie ma to liquidglass".

     Portal do `body` wyprowadza panel spod tamtej szyby i przy okazji
     zdejmuje problem warstw: panel przestaje być zamknięty w kontekście
     układania paska, więc nie da się go przykryć treścią strony.

     Pozycję liczymy z prostokąta pastylki i odświeżamy przy przewijaniu
     oraz zmianie rozmiaru — element `fixed` nie jeździ sam za kotwicą. */
  const refPanelu = useRef<HTMLDivElement>(null);
  const [pozycjaPanelu, setPozycjaPanelu] = useState<{ gora: number; prawo: number } | null>(null);

  useEffect(() => {
    if (!naGorze || wybrana === null) return;
    const licz = () => {
      const r = refPojemnika.current?.getBoundingClientRect();
      if (r) setPozycjaPanelu({ gora: r.bottom + 8, prawo: Math.max(12, window.innerWidth - r.right) });
    };
    licz();
    window.addEventListener('resize', licz);
    window.addEventListener('scroll', licz, true);
    return () => {
      window.removeEventListener('resize', licz);
      window.removeEventListener('scroll', licz, true);
    };
  }, [naGorze, wybrana]);

  const karty = KARTY;

  const mniejRuchu = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const przejscie = mniejRuchu ? { duration: 0 } : sprezyna;

  // Klik poza pojemnikiem zamyka — ten sam odruch, co przy menu i popoverach.
  useEffect(() => {
    if (wybrana === null) return;
    const naKlik = (e: MouseEvent) => {
      const cel = e.target as Node;
      /* Panel wychodzi portalem, więc `refPojemnika` już go NIE zawiera —
         bez drugiego sprawdzenia klik w środek panelu zamykałby panel. */
      if (refPojemnika.current?.contains(cel)) return;
      if (refPanelu.current?.contains(cel)) return;
      setWybrana(null);
    };
    document.addEventListener('mousedown', naKlik);
    return () => document.removeEventListener('mousedown', naKlik);
  }, [wybrana]);

  // Escape zamyka panel, nie całą stronę.
  useEffect(() => {
    if (wybrana === null) return;
    const naKlawisz = (e: KeyboardEvent) => { if (e.key === 'Escape') setWybrana(null); };
    document.addEventListener('keydown', naKlawisz);
    return () => document.removeEventListener('keydown', naKlawisz);
  }, [wybrana]);

  /* Ostatnia znana wysokość treści. Bez tego panel „skacze" do zera w trakcie
     animacji wyjścia, bo mierzony element znika z drzewa zanim skończy się ruch. */
  useEffect(() => {
    if (wymiary.height > 0) setOstatniaWysokosc(wymiary.height);
  }, [wymiary.height]);
  const wysokoscTresci = wymiary.height > 0 ? wymiary.height : ostatniaWysokosc;

  const WYSOKOSC_PASKA = 48;

  const kliknij = (klucz: Karta) => {
    /* W szynie nie ma miejsca na panel — najpierw rozwijamy pasek, potem
       otwieramy karte. Jedno klikniecie zamiast „rozwin, potem kliknij". */
    if (zwiniety) {
      setOpen(true);
      setWybrana(klucz);
      return;
    }
    if (wybrana === null) return setWybrana(klucz);
    if (wybrana === klucz) return setWybrana(null);
    const stary = KARTY.findIndex((k) => k.klucz === wybrana);
    const nowy = KARTY.findIndex((k) => k.klucz === klucz);
    setKierunek(nowy > stary ? 1 : -1);
    setWybrana(klucz);
  };

  const tresc = useMemo(() => {
    switch (wybrana) {
      case 'wtoku': return <KartaWToku naZamknij={() => setWybrana(null)} dane={daneZadan} />;
      case 'aktywnosc': return <KartaAktywnosc naZamknij={() => setWybrana(null)} />;
      case 'saldo': return <KartaSaldo />;
      case 'profil': return <KartaProfil naZamknij={() => setWybrana(null)} />;
      default: return null;
    }
  }, [wybrana, daneZadan]);

  if (naGorze) {
    return (
      <div ref={refPojemnika} className="relative">
        {/* PASEK IKON — kompaktowy, mieści się w 48-pikselowym nagłówku.
            `nb-wglebienie`, nie `nb-szklo`: leży NA szklanym pasku, więc
            własnego rozmycia mieć nie może (pod spodem jest już rozmyta
            szyba). Ta sama zasada, którą stosują pozostałe przyciski
            nagłówka — patrz `iconBtn` w MobileHeader.tsx. */}
        <div className="nb-wglebienie relative flex h-9 items-center gap-0.5 rounded-xl border border-primary/20 p-0.5">
          {karty.map(({ klucz, etykieta, ikona: Ikona }) => {
            const aktywna = wybrana === klucz;
            return (
              <button
                key={klucz}
                type="button"
                aria-label={etykieta}
                aria-expanded={aktywna}
                onClick={() => kliknij(klucz)}
                /* Bez tego globalna reguła dotyku (`min-height: 44px`) rozdyma
                   przycisk do 44 px WEWNĄTRZ 36-pikselowej pastylki —
                   podświetlenie wybranej karty wychodziło wtedy poza obudowę.
                   Michał: „podświetlenie wybranego ma zły rozmiar".
                   Wysokość niesie pastylka, nie pojedynczy przycisk. */
                data-tap-target="off"
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  aktywna
                    ? 'bg-primary/[0.15] text-primary'
                    : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                )}
              >
                {klucz === 'wtoku' && zadaniaAktywne.length > 0 ? (
                  <span className="relative flex h-[15px] w-[15px] items-center justify-center">
                    <span aria-hidden className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping" />
                    <Ikona className="relative h-[15px] w-[15px] shrink-0 text-primary" />
                  </span>
                ) : (
                  <Ikona className="h-[15px] w-[15px] shrink-0" />
                )}

                {klucz === 'wtoku' && zadaniaAktywne.length > 0 && !aktywna && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.7)]">
                    {zadaniaAktywne.length}
                  </span>
                )}
                {klucz === 'aktywnosc' && unreadCount > 0 && !aktywna && (
                  <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* PANEL — patrz komentarz przy `refPanelu` wyżej: renderuje się
            portalem do `body`, bo wewnątrz szklanego paska tracił materiał. */}
        {createPortal(
          <AnimatePresence initial={false}>
            {wybrana !== null && pozycjaPanelu && (
              <motion.div
                ref={refPanelu}
                key="panel-gorny"
                /* ANIMUJEMY TREŚĆ, NIE SZYBĘ — i to jest sedno.

                   Szyba dostaje samo krycie. Powód zapisany w platformie:
                   animowany `transform` (scale, y) unieważnia
                   `backdrop-filter`, więc panel byłby PŁASKI przez cały ruch
                   i dopiero na końcu „zastygał" w szkło.

                   Wysokości też nie animujemy. Framer nie ruszał `height:
                   'auto'` w warstwie portalowanej (zmierzone: treść 206 px,
                   obudowa uparcie 0 px), a panel i tak niczego nie rozpycha —
                   pływa nad stroną. Ruch niesie WNĘTRZE: `.p-3` niżej zjeżdża
                   o 8 px w dół. Transform na wnętrzu jest bezpieczny, bo to
                   nie ono ma materiał. */
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={przejscie}
                style={{
                  position: 'fixed',
                  top: pozycjaPanelu.gora,
                  right: pozycjaPanelu.prawo,
                  width: 'min(20rem, calc(100vw - 1.5rem))',
                }}
                className="nb-szklo nb-szklo-plynne nb-szklo-tafla z-[60] overflow-hidden rounded-2xl"
              >
                {/* Nitka akcentu przy krawędzi, z której panel wyrasta. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                />
                <motion.div
                  initial={mniejRuchu ? false : { y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...przejscie, delay: mniejRuchu ? 0 : 0.04 }}
                  className="p-3"
                >
                  {tresc}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  }

  if (zwiniety) {
    /* JEDEN przycisk zamiast czterech ikon w pionie (Michał 07.09: „na dole
       są 4 ikony zamiast 1 (zarządzanie)"). Wiersz ma tę samą budowę co
       pozycje menu (pole ikony 28 px na tej samej osi), a lista kart otwiera
       się obok w oknie podręcznym; wybór rozwija pasek i otwiera kartę —
       to samo, co robiło kliknięcie ikony w szynie. Kropka i licznik
       z czterech ikon spływają na ten jeden przycisk. */
    const uwagi = zadaniaAktywne.length + unreadCount;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Zarządzanie: w toku, aktywność, saldo, profil"
            title="Zarządzanie"
            className="relative flex w-full items-center rounded-xl px-2 py-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground data-[state=open]:bg-foreground/[0.08] data-[state=open]:text-foreground"
          >
            <span className="nb-nav-ikona flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <LayoutGrid className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </span>
            {uwagi > 0 && (
              <span className="absolute left-6 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                {uwagi > 9 ? '9+' : uwagi}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" sideOffset={14} className="w-52 p-1.5">
          <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Zarządzanie</p>
          {KARTY.map(({ klucz, etykieta, ikona: Ikona }) => (
            <button
              key={klucz}
              type="button"
              onClick={() => kliknij(klucz)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] text-foreground/85 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Ikona className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{etykieta}</span>
              {klucz === 'wtoku' && zadaniaAktywne.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-primary-foreground">{zadaniaAktywne.length}</span>
              )}
              {klucz === 'aktywnosc' && unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div ref={refPojemnika}>
      <motion.div
        initial={false}
        animate={{ height: wybrana === null ? WYSOKOSC_PASKA : wysokoscTresci + WYSOKOSC_PASKA }}
        transition={przejscie}
        className="nb-szklo nb-szklo-plynne nb-kafelek relative overflow-hidden rounded-2xl"
      >
        {/* Akcentowa nitka na górnej krawędzi — ten sam idiom, którego używa
            reszta stopki (`GlassIconButton` w SidebarFooter.tsx) i nagłówek
            paska. Dzięki niej panel czyta się jako powierzchnia NextByte,
            a nie neutralny prostokąt. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />
        {/* Treść — miara na STABILNEJ owijce, nie na animowanym elemencie */}
        <div ref={refMiary}>
          <AnimatePresence mode="popLayout" initial={false} custom={kierunek}>
            {wybrana !== null && (
              <motion.div
                key={wybrana}
                variants={wariantyTresci}
                initial="wejscie"
                animate="aktywna"
                exit="wyjscie"
                custom={kierunek}
                transition={przejscie}
                className="p-3"
              >
                {tresc}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pasek ikon — przyklejony do DOŁU, dzięki czemu panel rośnie w górę */}
        <div className="absolute bottom-0 w-full p-1.5">
          <div className="flex h-9 items-center justify-between gap-1">
            {KARTY.map(({ klucz, etykieta, ikona: Ikona }) => {
              const aktywna = wybrana === klucz;
              return (
                <motion.button
                  key={klucz}
                  type="button"
                  initial={false}
                  aria-label={etykieta}
                  aria-expanded={aktywna}
                  whileTap={mniejRuchu ? undefined : { scaleY: 0.85, transition: { duration: 0.15 } }}
                  animate={{ flexGrow: aktywna ? 1 : 0, gap: aktywna ? '0.4rem' : 0 }}
                  transition={przejscie}
                  onClick={() => kliknij(klucz)}
                  className={cn(
                    'relative flex h-full min-w-9 cursor-pointer items-center justify-center rounded-xl px-2 text-sm font-medium transition-colors',
                    aktywna
                      ? 'border border-primary/40 bg-primary/[0.13] text-primary shadow-[0_0_14px_-4px_hsl(var(--primary)/0.55)]'
                      : 'border border-transparent text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                  )}
                >
                  {/*
                    IKONA ŻYJE, GDY COŚ SIĘ DZIEJE (prośba Michała).
                    Puls jest na karcie „W toku" i tylko wtedy, gdy naprawdę
                    trwa jakieś zadanie — animacja bez powodu to szum, który
                    człowiek po dniu przestaje widzieć, i wtedy nie zadziała
                    wtedy, kiedy ma. `motion-safe:` sprawia, że przy włączonej
                    redukcji ruchu zostaje sam pierścień, bez migania.
                  */}
                  {klucz === 'wtoku' && zadaniaAktywne.length > 0 ? (
                    <span className="relative flex h-[18px] w-[18px] items-center justify-center">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping"
                      />
                      <motion.span
                        aria-hidden
                        animate={mniejRuchu ? undefined : { scale: [1, 1.12, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative flex items-center justify-center text-primary"
                      >
                        <Ikona className="h-[18px] w-[18px] shrink-0" />
                      </motion.span>
                    </span>
                  ) : (
                    <Ikona className="h-[18px] w-[18px] shrink-0" />
                  )}

                  {/* Licznik trwających zadań — po otwarciu karty znika,
                      bo liczba stoi wtedy w nagłówku listy. */}
                  {klucz === 'wtoku' && zadaniaAktywne.length > 0 && !aktywna && (
                    <span className="absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.7)]">
                      {zadaniaAktywne.length}
                    </span>
                  )}

                  {/* Kropka liczby nieprzeczytanych — tylko gdy karta jest zwinięta,
                      bo po otwarciu liczba stoi już w nagłówku listy. */}
                  {klucz === 'aktywnosc' && unreadCount > 0 && !aktywna && (
                    <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
                  )}
                  <AnimatePresence initial={false}>
                    {aktywna && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ ...przejscie, delay: mniejRuchu ? 0 : 0.06 }}
                        className="overflow-hidden whitespace-nowrap tracking-tight"
                      >
                        {etykieta}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PasekKart;
