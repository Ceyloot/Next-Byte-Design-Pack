import { cn } from '@/lib/utils';
import { PlynnyKursor, scalRefy, useDotyk } from '@/components/ui/plynny-kursor';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  MessageSquare,
  CalendarDays,
  StickyNote,
  CheckSquare,
  ChevronRight,
  FileText,
  Loader2,
  Command,
  Crown,
  Brain,
  Settings,
  Pin,
  LayoutGrid,
  CornerDownLeft,
  ArrowUpDown,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { DefinicjaSzklaPigulki, REFLEKS_PIGULKI } from './szklo-pigulka';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { useRecentRoutes } from '@/hooks/useRecentRoutes';
import { ROUTE_META, getRouteMeta } from '@/components/sidebar/menuMeta';

/* ── Types ── */

interface SpotlightResult {
  id: string;
  type: 'note' | 'task' | 'event' | 'chat' | 'page' | 'hub';
  title: string;
  description: string;
  url: string;
  icon: string;
  meta?: string;
}

interface Shortcut {
  label: string;
  icon: React.ReactNode;
  url: string;
}

/* ── Static quick-nav pages ── */

/**
 * Znosi polskie znaki diakrytyczne i sprowadza do malych liter.
 *
 * Po co: filtr uzywal `toLowerCase().includes(q)`, wiec wpisanie „pamiec" NIE
 * znajdowalo „Pamiec AI", „zdjec" nie znajdowalo „Studio Zdjec", a „haslo" nie
 * znajdowalo „haslo" w opisie Ustawien. Ludzie pisza szybko i bez ogonkow —
 * zwlaszcza w wyszukiwarce, ktora ma byc skrotem.
 *
 * NFD rozklada a c e n o s z z na litere + znak diakrytyczny, ale UWAGA:
 * „l" (U+0142) NIE ma postaci rozkladanej, bo kreska jest czescia znaku, nie
 * osobnym modyfikatorem. Dlatego wymaga jawnej podmiany.
 */
function bezOgonkow(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0141/g, 'L')
    .toLowerCase();
}

/**
 * Czy tekst zawiera WSZYSTKIE slowa zapytania, w dowolnej kolejnosci.
 * Wczesniej bylo jedno `includes` calego zapytania, wiec „studio zdjec"
 * dzialalo, ale „zdjec studio" nie znajdowalo nic.
 */
function pasuje(tekst: string, slowa: string[]): boolean {
  if (slowa.length === 0) return true;
  const h = bezOgonkow(tekst);
  return slowa.every((w) => h.includes(w));
}

const quickPages: SpotlightResult[] = [
  { id: 'hub-plan', type: 'hub', title: 'Plan i Bytes', description: 'Subskrypcja, portfel, faktury, pakiety Byte', url: '/plan', icon: '👑' },
  { id: 'hub-pamiec', type: 'hub', title: 'Pamięć AI', description: 'Fakty AI, PromptEx, pamięć projektów', url: '/pamiec', icon: '🧠' },
  { id: 'hub-ustawienia', type: 'hub', title: 'Ustawienia', description: 'Konto, asystent, hasło, bezpieczeństwo, wygląd', url: '/ustawienia', icon: '⚙️' },
  { id: 'p-asystent', type: 'page', title: 'Personalny Asystent', description: 'Twój osobisty asystent AI', url: '/asystent-nextbyte', icon: '✨' },
  { id: 'p-chat', type: 'page', title: 'Chat AI', description: 'Rozmowy z AI', url: '/chat-ai', icon: '💬' },
  { id: 'p-kalendarz', type: 'page', title: 'Kalendarz', description: 'Twoje wydarzenia i terminy', url: '/kalendarz', icon: '📅' },
  { id: 'p-zadania', type: 'page', title: 'Zadania', description: 'Lista zadań do wykonania', url: '/zadania', icon: '☑️' },
  { id: 'p-notatki', type: 'page', title: 'Notatki', description: 'Twoje notatki i dokumenty', url: '/notatki', icon: '📝' },
  { id: 'p-studio', type: 'page', title: 'Studio Zdjęć', description: 'Generuj obrazy AI', url: '/studio-zdjec', icon: '📸' },
];

/**
 * STRONY W PANELU ⌘K (07.09.2026). `quickPages` wyżej ma dziewięć pozycji
 * z emoji — dobre dla paska na Panelu Głównym. Panel pełnoekranowy szuka
 * po WSZYSTKICH trasach z `ROUTE_META` (Tablice, Sklep, Akademia, PromptEx…
 * były dotąd nie do znalezienia), a kafelki „Szybki dostęp" biorą ikony
 * z tej samej mapy co pasek boczny — jedna rodzina, nie emoji obok ikon.
 * Panele administracyjne pominięte: zwykłe konto i tak ich nie otworzy.
 */
const TRASY_UKRYTE = new Set(['/admin-panel', '/zarzad', '/handlowiec', '/red-zone-v2']);
const OPISY_TRAS: Record<string, string> = Object.fromEntries(quickPages.map((p) => [p.url, p.description]));
const stronyPanelu: SpotlightResult[] = Object.entries(ROUTE_META)
  .filter(([url]) => !TRASY_UKRYTE.has(url))
  .map(([url, meta]) => ({
    id: `r${url}`, type: 'page' as const, title: meta.title,
    description: OPISY_TRAS[url] ?? '', url, icon: 'lucide',
  }));
/** Kolejność kafelków „Szybki dostęp" — najczęściej używane moduły. */
const SZYBKI_DOSTEP = ['/panel-glowny', '/asystent-nextbyte', '/chat-ai', '/studio-zdjec', '/studio-video', '/kalendarz', '/zadania', '/notatki', '/tablice', '/pamiec', '/prompt-ex', '/plan'];
const GRUPY_WYNIKOW: { typ: SpotlightResult['type'][]; etykieta: string }[] = [
  { typ: ['page', 'hub'], etykieta: 'Strony' },
  { typ: ['note'], etykieta: 'Notatki' },
  { typ: ['task'], etykieta: 'Zadania' },
  { typ: ['event'], etykieta: 'Kalendarz' },
  { typ: ['chat'], etykieta: 'Rozmowy' },
];
type FiltrTypu = 'all' | 'page' | 'note' | 'task' | 'event' | 'chat';

const defaultShortcuts: Shortcut[] = [
  { label: 'Asystent', icon: <Sparkles />, url: '/asystent-nextbyte' },
  { label: 'Chat', icon: <MessageSquare />, url: '/chat-ai' },
  { label: 'Plan', icon: <Crown />, url: '/plan' },
  { label: 'Pamięć', icon: <Brain />, url: '/pamiec' },
];

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  note: { label: 'Notatka', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20', icon: <StickyNote className="w-4 h-4" /> },
  task: { label: 'Zadanie', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: <CheckSquare className="w-4 h-4" /> },
  event: { label: 'Kalendarz', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/20', icon: <CalendarDays className="w-4 h-4" /> },
  chat: { label: 'Chat AI', color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/20', icon: <MessageSquare className="w-4 h-4" /> },
  page: { label: 'Strona', color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: <Sparkles className="w-4 h-4" /> },
  hub: { label: 'Hub', color: 'text-primary', bg: 'bg-primary/15 border-primary/30', icon: <Crown className="w-4 h-4" /> },
};

/* Filtr „gooey" (`spotlight-blob-inline`) USUNIĘTY 04.08.2026 razem z jego
   jedynym użyciem — powód przy kontenerze paska: `filter` na rodzicu izoluje
   dzieci i odcina im `backdrop-filter` od strony pod spodem. */

/* ── Sub-components ── */

/**
 * Skrót wyjeżdżający zza paska po najechaniu.
 *
 * Michał: „a ikony po najechaniu?" — i słusznie, bo miały trzy rzeczy naraz:
 *
 * ① BYŁY NIEOPISANE. Typ `Shortcut` ma pole `label` („Asystent", „Chat",
 *    „Plan", „Pamięć"), ale nikt go tu nie przekazywał. Zostawały cztery
 *    nieopisane kółka: żadnej podpowiedzi, żadnego `aria-label`. Trzeba było
 *    kliknąć, żeby się dowiedzieć, dokąd prowadzą.
 * ② NIE BYŁY PRZYCISKAMI. `<div onClick>` nie da się dosięgnąć klawiaturą
 *    ani czytnikiem ekranu — dla nich to był zwykły prostokąt.
 * ③ NIE BYŁY SZKŁEM. `bg-card` bez kanału alfa = pełna nieprzezroczystość,
 *    dokładnie ten sam błąd, który miała sama pigułka wyszukiwarki:
 *    `backdrop-blur-xl` obok tego rozmywał coś, czego nie było widać.
 *
 * Teraz: prawdziwy `<button>` z podpowiedzią, ten sam materiał co pasek
 * (`nb-szklo-pigulka`) i ten sam refleks krawędzi — bo to jedna rodzina
 * powierzchni, a nie pasek plus cztery guziki znikąd.
 */
const ShortcutButton = ({
  icon, label, url, onSelect,
}: { icon: React.ReactNode; label: string; url: string; onSelect: (url: string) => void }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={() => onSelect(url)}
        aria-label={label}
        className="nb-szklo nb-szklo-pigulka flex h-11 w-11 items-center justify-center rounded-full border border-border/30 text-primary transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-12 md:w-12"
        style={{ backgroundColor: 'hsl(var(--card) / 0.55)', boxShadow: REFLEKS_PIGULKI }}
      >
        <span className="[&_svg]:size-4.5 md:[&_svg]:size-5 [&_svg]:stroke-[1.5]">{icon}</span>
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

const ResultCard = ({
  result,
  isSelected,
  onSelect,
  onHover,
}: {
  result: SpotlightResult;
  isSelected: boolean;
  onSelect: (url: string) => void;
  onHover: () => void;
}) => {
  const config = typeConfig[result.type] || typeConfig.page;

  return (
    <motion.div
      onClick={() => onSelect(result.url)}
      onMouseEnter={onHover}
      className={cn(
        'flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200',
        isSelected
          ? 'bg-primary/[0.08] border border-primary/15 shadow-sm shadow-primary/5'
          : 'border border-transparent hover:bg-muted/[0.08]'
      )}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors',
        isSelected ? config.bg : 'bg-muted/10 border-border/10'
      )}>
        <span className={cn(isSelected ? config.color : 'text-muted-foreground')}>
          {result.icon === 'lucide' ? (
            React.createElement(getRouteMeta(result.url).icon as LucideIcon, { className: 'w-4 h-4', strokeWidth: 1.75 })
          ) : result.icon.length <= 2 ? (
            <span className="text-lg">{result.icon}</span>
          ) : (
            config.icon
          )}
        </span>
      </div>

      {/* Content — title + badge on first line, description below */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-semibold text-foreground truncate">{result.title}</span>
          <span className={cn(
            'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 border',
            config.bg, config.color
          )}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground/50 truncate mt-0.5 leading-relaxed">{result.description}</p>
      </div>

      {/* Arrow */}
      <ChevronRight className={cn(
        'w-4 h-4 flex-shrink-0 transition-all duration-200',
        isSelected ? 'text-primary opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
      )} />
    </motion.div>
  );
};

/* ── Inline Spotlight (embedded in page) ── */

/**
 * @param pelnyEkran  Tryb nakładki na cały ekran (Ctrl/⌘+K).
 *
 * Michał: „czy ten element mamy jako spotlight search w stylu glassmorphizm
 * i w popupie na cały ekran wyszukiwarkę też?".
 *
 * Do 04.08.2026 skrót ⌘K otwierał TEN SAM pasek co na Panelu Głównym, tyle że
 * w oknie o szerokości 672 px pośrodku ekranu — czyli nie spotlight, tylko
 * mniejsza kopia paska w ramce. W trybie pełnoekranowym pole jest wyższe,
 * tekst większy, a wyniki stoją w normalnym przepływie pod polem zamiast
 * wisieć jako `absolute` (w nakładce nie ma nad czym wisieć, a lista mogła
 * wyjść poza ekran zamiast się przewijać).
 */
const NextByteSpotlightInline: React.FC<{ pelnyEkran?: boolean }> = ({ pelnyEkran = false }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<SpotlightResult[]>([]);
  /** Szukanie po treści padło — mówimy o tym wprost, zamiast udawać zero wyników. */
  const [bladTresci, setBladTresci] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* Własny uchwyt do pola — `inputRef` należy do logiki wyszukiwarki
     (fokus po ⌘K), a karetka potrzebuje tego samego elementu. */
  const poleRef = useRef<HTMLInputElement>(null);
  /* BRAMKA DOTYKU (03.09.2026). Pola z biblioteki (`input`, `textarea`,
     `pola`) gaszą rysowaną karetkę na telefonie i oddają systemową — ta
     wyszukiwarka jako jedyna importowała `PlynnyKursor` bez `useDotyk`,
     więc na telefonie nie było ANI kreski, ANI uchwytów zaznaczenia: nie
     dało się palcem wejść w środek frazy i poprawić literówki. */
  const dotyk = useDotyk();
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const showResults = query.trim().length > 0;
  const [filtrTypu, setFiltrTypu] = useState<FiltrTypu>('all');
  const { pinned } = useRecentRoutes();

  /* PANEL ⌘K: wyniki po stronach z `ROUTE_META` + treść z edge, pogrupowane. */
  const wynikiPanelu = useMemo(() => {
    const slowa = bezOgonkow(query).split(/\s+/).filter(Boolean);
    const strony = slowa.length ? stronyPanelu.filter((p) => pasuje(`${p.title} ${p.description}`, slowa)) : [];
    const seen = new Set(strony.map((r) => r.url));
    const wszystkie = [...strony, ...apiResults.filter((r) => !seen.has(r.url))];
    const przefiltrowane = filtrTypu === 'all'
      ? wszystkie
      : wszystkie.filter((r) => (filtrTypu === 'page' ? r.type === 'page' || r.type === 'hub' : r.type === filtrTypu));
    const grupy = GRUPY_WYNIKOW
      .map((g) => ({ ...g, wyniki: przefiltrowane.filter((r) => g.typ.includes(r.type)) }))
      .filter((g) => g.wyniki.length > 0);
    const liczniki: Record<FiltrTypu, number> = {
      all: wszystkie.length,
      page: wszystkie.filter((r) => r.type === 'page' || r.type === 'hub').length,
      note: wszystkie.filter((r) => r.type === 'note').length,
      task: wszystkie.filter((r) => r.type === 'task').length,
      event: wszystkie.filter((r) => r.type === 'event').length,
      chat: wszystkie.filter((r) => r.type === 'chat').length,
    };
    return { grupy, plaskie: grupy.flatMap((g) => g.wyniki), liczniki };
  }, [query, apiResults, filtrTypu]);

  /* Bez zapytania: przypięte + szybki dostęp — te same pozycje, po których
     chodzą strzałki i Enter. */
  const pozycjeStartowe = useMemo<SpotlightResult[]>(() => {
    const przypiete = pinned
      .filter((url) => !TRASY_UKRYTE.has(url))
      .map((url) => ({ id: `pin${url}`, type: 'page' as const, title: getRouteMeta(url).title, description: OPISY_TRAS[url] ?? 'Przypięte', url, icon: 'lucide' }));
    const szybkie = SZYBKI_DOSTEP
      .filter((url) => ROUTE_META[url])
      .map((url) => ({ id: `q${url}`, type: 'page' as const, title: ROUTE_META[url].title, description: OPISY_TRAS[url] ?? '', url, icon: 'lucide' }));
    return [...przypiete, ...szybkie];
  }, [pinned]);


  const displayResults = useMemo(() => {
    if (!query.trim()) return quickPages;
    // Wszystkie słowa zapytania muszą wystąpić, w dowolnej kolejności, i bez
    // znaczenia dla ogonków — patrz `bezOgonkow` i `pasuje` niżej.
    const slowa = bezOgonkow(query).split(/\s+/).filter(Boolean);
    const localMatches = quickPages.filter((p) => pasuje(`${p.title} ${p.description}`, slowa));
    if (isSearching && apiResults.length === 0) return localMatches;
    // Dedupe by url, local first
    const seen = new Set(localMatches.map((r) => r.url));
    return [...localMatches, ...apiResults.filter((r) => !seen.has(r.url))];
  }, [query, isSearching, apiResults]);

  /* Po tej liście chodzą strzałki i Enter — w panelu ⌘K inna niż w pasku. */
  const nawigowalne = pelnyEkran ? (showResults ? wynikiPanelu.plaskie : pozycjeStartowe) : displayResults;

  // Search via edge function
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
      setApiResults([]);
      setIsSearching(false);
      setBladTresci(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('spotlight-search', {
          body: { query: debouncedQuery.trim() },
        });
        if (cancelled) return;
        // Awaria szukania po treści była dotąd CICHA: wynik czyszczono i user
        // widział same strony, wnioskując „moich notatek nie da się znaleźć".
        // Pole obiecuje notatki, zadania i kalendarz, więc gdy ta część padnie,
        // trzeba to powiedzieć.
        if (error) { setApiResults([]); setBladTresci(true); }
        else { setApiResults(data?.results || []); setBladTresci(false); }
      } catch { if (!cancelled) { setApiResults([]); setBladTresci(true); } }
      finally { if (!cancelled) setIsSearching(false); }
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = useCallback((url: string) => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();
    navigate(url);
  }, [navigate]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
        setQuery('');
        setApiResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Arrow keys
  useEffect(() => {
    if (!focused) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, nawigowalne.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && nawigowalne[selectedIndex]) {
        handleSelect(nawigowalne[selectedIndex].url);
      } else if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focused, nawigowalne, selectedIndex, handleSelect]);

  useEffect(() => { setSelectedIndex(0); }, [query, filtrTypu]);

  /* Panel ⌘K otwiera się gotowy do pisania: fokus i klawiatura od razu. */
  useEffect(() => {
    if (!pelnyEkran) return;
    const id = window.setTimeout(() => { inputRef.current?.focus(); setFocused(true); }, 30);
    return () => window.clearTimeout(id);
  }, [pelnyEkran]);

  // Global Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ══════════════════════════════════════════════════════════════════════
     PANEL PEŁNOEKRANOWY (⌘K) — przebudowa 07.09.2026
     ══════════════════════════════════════════════════════════════════════
     Michał: „ogarnij liquid glass panelu wyszukiwania, design, ui/ux".
     Do dziś ⌘K pokazywało SAMĄ pigułkę na rozmytej stronie — lista wyników
     wchodziła dopiero po pierwszej literze, a bez zapytania nie było nic:
     ani szybkiego dostępu, ani podpowiedzi, ani informacji, po czym szukamy.
     Teraz to jedna tafla tego samego materiału co `Okno` (szkło + refleks
     + cienie bez koloru): pole u góry, od razu „Przypięte" i „Szybki dostęp",
     wyniki pogrupowane po typie z filtrami, w stopce klawisze. */
  if (pelnyEkran) {
    const cienTafli = [
      '0 0 0 1px hsl(var(--border))',
      'inset 0 1px 0 0 hsl(var(--foreground) / 0.07)',
      '0 2px 4px -2px hsl(0 0% 0% / 0.4)',
      '0 12px 24px -8px hsl(0 0% 0% / 0.45)',
      '0 40px 80px -24px hsl(0 0% 0% / 0.55)',
    ].join(', ');
    const FILTRY: { klucz: FiltrTypu; etykieta: string }[] = [
      { klucz: 'all', etykieta: 'Wszystko' }, { klucz: 'page', etykieta: 'Strony' }, { klucz: 'note', etykieta: 'Notatki' },
      { klucz: 'task', etykieta: 'Zadania' }, { klucz: 'event', etykieta: 'Kalendarz' }, { klucz: 'chat', etykieta: 'Rozmowy' },
    ];
    const przypiete = pozycjeStartowe.filter((r) => r.id.startsWith('pin'));
    const szybkie = pozycjeStartowe.filter((r) => r.id.startsWith('q'));
    /* Jeden licznik dla WSZYSTKICH pozycji w kolejności renderowania — to po
       nim chodzą strzałki, więc kafelki i wiersze wyników dzielą jedną oś. */
    let biezacyIndeks = 0;
    const kafelek = (r: SpotlightResult) => {
      const i = biezacyIndeks++;
      const Ikona = getRouteMeta(r.url).icon as LucideIcon;
      const wybrany = selectedIndex === i;
      return (
        <button
          key={r.id}
          type="button"
          onClick={() => handleSelect(r.url)}
          onMouseEnter={() => setSelectedIndex(i)}
          className={cn(
            'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
            wybrany ? 'border-primary/30 bg-primary/[0.08]' : 'border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.05]',
          )}
        >
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', wybrany ? 'border-primary/30 text-primary' : 'border-border/50 text-muted-foreground group-hover:text-foreground')}>
            <Ikona className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-foreground">{r.title}</span>
            {r.description && <span className="block truncate text-[11px] text-muted-foreground">{r.description}</span>}
          </span>
        </button>
      );
    };

    return (
      <div ref={containerRef} className="mx-auto w-full max-w-2xl">
        <DefinicjaSzklaPigulki />
        <div
          className="nb-szklo nb-szklo-plynne nb-szklo-tafla flex max-h-[min(72vh,760px)] flex-col overflow-hidden rounded-3xl border border-border"
          style={{ boxShadow: cienTafli }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── pole ── */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-5">
            {isSearching ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" /> : <Search className="h-5 w-5 shrink-0 text-primary" />}
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <input
                ref={scalRefy<HTMLInputElement>(inputRef, poleRef)}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                data-plynny-kursor={dotyk ? undefined : 'wlasny'}
                style={dotyk ? undefined : { caretColor: 'transparent' }}
                placeholder="Szukaj stron, notatek, zadań, wydarzeń i rozmów…"
                className="w-full bg-transparent text-base text-foreground outline-none ring-0 placeholder:text-muted-foreground/50"
                aria-label="Szukaj w NextByte"
              />
              {!dotyk && <PlynnyKursor polaRef={poleRef} wartosc={query} />}
            </div>
            <kbd className="hidden shrink-0 items-center rounded-md border border-border/60 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">Esc</kbd>
          </div>

          {/* ── filtry typów (gdy jest zapytanie) ── */}
          {showResults && (
            <div className="nb-pasek flex shrink-0 gap-1.5 overflow-x-auto border-b border-border/60 px-4 py-2.5">
              {FILTRY.map((f) => {
                const n = wynikiPanelu.liczniki[f.klucz];
                const aktywny = filtrTypu === f.klucz;
                return (
                  <button
                    key={f.klucz}
                    type="button"
                    onClick={() => setFiltrTypu(f.klucz)}
                    disabled={!aktywny && n === 0}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors',
                      aktywny ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground',
                    )}
                  >
                    {f.etykieta}
                    <span className="tabular-nums text-[10px] opacity-70">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── ciało ── */}
          <div className="nb-pasek min-h-0 flex-1 overflow-y-auto p-3">
            {!showResults ? (
              <div className="space-y-4">
                {przypiete.length > 0 && (
                  <section>
                    <h3 className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"><Pin className="h-3 w-3" /> Przypięte</h3>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">{przypiete.map(kafelek)}</div>
                  </section>
                )}
                <section>
                  <h3 className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"><LayoutGrid className="h-3 w-3" /> Szybki dostęp</h3>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">{szybkie.map(kafelek)}</div>
                </section>
              </div>
            ) : isSearching && apiResults.length === 0 && wynikiPanelu.plaskie.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Przeszukuję Twoje notatki, zadania, kalendarz i rozmowy…</p>
              </div>
            ) : wynikiPanelu.plaskie.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground/40" />
                <p className="text-sm text-foreground">Nic nie pasuje do „{query.trim()}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Spróbuj krócej albo bez odmiany — szukam po wszystkich słowach, bez ogonków.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bladTresci && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Szukanie w notatkach, zadaniach, kalendarzu i rozmowach chwilowo nie odpowiada — poniżej tylko strony.
                  </div>
                )}
                {wynikiPanelu.grupy.map((g) => (
                  <section key={g.etykieta}>
                    <h3 className="mb-1 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      <span>{g.etykieta}</span><span className="tabular-nums">{g.wyniki.length}</span>
                    </h3>
                    <div className="space-y-0.5">
                      {g.wyniki.map((r) => {
                        const i = biezacyIndeks++;
                        return <ResultCard key={r.id} result={r} isSelected={selectedIndex === i} onSelect={handleSelect} onHover={() => setSelectedIndex(i)} />;
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* ── stopka ── */}
          <div className="flex shrink-0 items-center justify-between border-t border-border/60 bg-foreground/[0.02] px-4 py-2.5 text-[11px] text-muted-foreground">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="flex items-center gap-1"><kbd className="inline-flex h-5 items-center rounded border border-border/60 px-1"><ArrowUpDown className="h-3 w-3" /></kbd> wybierz</span>
              <span className="flex items-center gap-1"><kbd className="inline-flex h-5 items-center rounded border border-border/60 px-1"><CornerDownLeft className="h-3 w-3" /></kbd> otwórz</span>
              <span className="flex items-center gap-1"><kbd className="inline-flex h-5 items-center rounded border border-border/60 px-1 text-[10px]">Esc</kbd> zamknij</span>
            </div>
            <span className="truncate">{showResults ? `${wynikiPanelu.liczniki.all} wyników` : 'Strony · notatki · zadania · kalendarz · rozmowy'}</span>
          </div>
        </div>
      </div>
    );
  }

  /* Skróty (i tylko one) wymagają filtra zlewającego — patrz komentarz niżej. */
  const pokazSkroty = hovered && !query && !focused;

  return (
    <div
      ref={containerRef}
      className={cn('relative z-20 mx-auto w-full', pelnyEkran ? 'max-w-2xl' : 'max-w-lg')}
    >
      <DefinicjaSzklaPigulki />

      {/* Blob bar */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onClick={(e) => e.stopPropagation()}
        /* BEZ FILTRA „GOOEY" — wybór, nie przeoczenie.
           `filter` na rodzicu tworzy nowy kontekst malowania i IZOLUJE dzieci:
           `backdrop-filter` pigułki i skrótów przestaje wtedy sięgać do strony
           pod spodem, a sięga tylko do tego kontekstu. Zmierzone 04.08.2026:
           pigułka miała `backdrop-filter: blur(24px)`, który nie miał czego
           rozmywać.
           Efekt zlewania się skrótów z paskiem w kroplę był ładny, ale działał
           dokładnie w tej chwili, w której skróty są widoczne — czyli kasował
           szkło zawsze wtedy, gdy człowiek na nie patrzy. Płynność wejścia
           niesie animacja sprężynowa niżej, a nie filtr. */
        className="w-full flex items-center justify-end gap-4 z-20 group"
      >
        <motion.div layout className="flex items-center gap-4 w-full">
          {/* Search pill — shrinks via flex-1 + layout, stays on top (z-10) */}
          <motion.div
            layout
            /* Materiał: `nb-szklo-pigulka` — mapa przemieszczenia liczona
               z kształtu pigułki i maska zostawiająca środek tafli czysty
               (patrz `szklo-pigulka.tsx`). Refleks krawędzi w `style`, bo
               liczy się z tokenów motywu, a nie z zaszytej bieli. */
            className={cn(
              'nb-szklo nb-szklo-pigulka relative z-10 flex min-w-0 flex-1 items-center gap-3 rounded-full border transition-colors duration-300',
              pelnyEkran ? 'h-16 px-6' : 'h-12 px-4',
              focused ? 'border-primary/40 ring-1 ring-primary/10' : 'border-border/30',
            )}
            style={{
              // Półprzezroczyste tło, NIE `bg-card`. Wcześniej pigułka miała
              // wyliczone `rgb(8,8,8)` — pełną nieprzezroczystość, czyli szybę
              // zamalowaną na czarno. Rozmycie pod spodem nie miało wtedy
              // żadnego znaczenia, bo i tak nic nie prześwitywało.
              backgroundColor: 'hsl(var(--card) / 0.55)',
              boxShadow: REFLEKS_PIGULKI,
            }}
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
            )}
            {/* `relative` dla płynnej karetki — pozycję liczy od lewej krawędzi
                tego kontenera. Wyszukiwarka używa SUROWEGO `<input>`, a nie
                `Input` z biblioteki, więc ominęło ją pierwsze wdrożenie
                płynnego kursora; stąd nakładka wpięta tu ręcznie. */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <input
                ref={scalRefy<HTMLInputElement>(inputRef, poleRef)}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                data-plynny-kursor={dotyk ? undefined : 'wlasny'}
          style={dotyk ? undefined : { caretColor: 'transparent' }}
                placeholder="Szukaj w notatkach, zadaniach, kalendarzu..."
                className={cn(
                  'w-full bg-transparent text-foreground outline-none ring-0 placeholder:text-muted-foreground/40',
                  pelnyEkran ? 'text-base' : 'text-sm',
                )}
              />
              {!dotyk && <PlynnyKursor polaRef={poleRef} wartosc={query} />}
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/15 border border-border/15 text-[10px] text-muted-foreground/40 flex-shrink-0 whitespace-nowrap">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </motion.div>

          {/* Shortcut bubbles — emerge from behind the pill (lower z-index) */}
          {pokazSkroty &&
            defaultShortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.url}
                layout
                initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                animate={{ scale: 1, x: 0 }}
                exit={{
                  scale: 0.7,
                  x: -1 * (16 * (index + 1) + 64 * (index + 1)),
                }}
                transition={{
                  duration: 0.8,
                  type: 'spring',
                  bounce: 0.2,
                  delay: index * 0.05,
                }}
                className="rounded-full cursor-pointer flex-shrink-0 hidden sm:block"
                style={{ zIndex: defaultShortcuts.length - index }}
              >
                <ShortcutButton icon={shortcut.icon} label={shortcut.label} url={shortcut.url} onSelect={handleSelect} />
              </motion.div>
            ))}
        </motion.div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ originY: 0 }}
            className={cn(
              // `bg-card/98` NIE ROBIŁO NIC — i to jest cała przyczyna tego,
              // że przez listę wyników przebijała treść Panelu Głównego.
              //
              // Skala krycia Tailwinda idzie CO 5 (…/90, /95, /100). Wartość 98
              // nie generuje żadnej reguły, więc klasa wisiała w atrybucie, a
              // element zostawał bez tła. Zmierzone: computed background
              // `rgba(0, 0, 0, 0)` przy działającym `border-border/25` obok,
              // czyli plik był normalnie przetwarzany — martwa była sama wartość.
              //
              // Zamiast poprawiać na /95 bierzemy materiał z biblioteki: to ta
              // sama powierzchnia co menu, popovery i powiadomienia, więc lista
              // przestaje być osobnym bytem. Klasa niesie tło, rozmycie,
              // nasycenie i wersję zapasową dla przeglądarek bez backdrop-filter.
              'nb-szklo-menu z-30 mt-3 overflow-hidden rounded-2xl border border-border/25 shadow-2xl shadow-black/30',
              // W nakładce lista jest w przepływie: `absolute` kazałoby jej wisieć
              // nad pustką i przy długiej liście wyjechać poza dolną krawędź.
              pelnyEkran ? 'relative' : 'absolute left-0 right-0',
            )}
          >
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className={cn('scrollbar-thin overflow-y-auto p-1.5', pelnyEkran ? 'max-h-[52vh]' : 'max-h-[320px]')}>
              {isSearching && apiResults.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Przeszukuję Twoje dane...</p>
                </div>
              ) : displayResults.length === 0 && query.trim() ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-5 h-5 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nie znaleziono wyników</p>
                  <p className="text-xs text-muted-foreground/50 mt-1">Spróbuj innego zapytania</p>
                </div>
              ) : (
                <>
                  <div className="px-3 pt-2 pb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40 font-semibold">
                      {query.trim()
                        ? `Znaleziono ${displayResults.length} ${displayResults.length === 1 ? 'wynik' : displayResults.length < 5 ? 'wyniki' : 'wyników'}`
                        : 'Szybki dostęp'
                      }
                    </span>
                  </div>
                  {/* Pole obiecuje notatki, zadania i kalendarz. Gdy ta czesc
                      padnie, user musi to wiedziec — inaczej wnioskuje, ze jego
                      tresci sie nie da znalezc. */}
                  {bladTresci && query.trim() && (
                    <div className="mx-3 mb-1.5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1.5">
                      <span className="text-[11px] text-destructive">
                        Szukanie w notatkach, zadaniach i kalendarzu chwilowo nie odpowiada — poniżej tylko strony.
                      </span>
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {displayResults.map((result, i) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.15, ease: 'easeOut' }}
                      >
                        <ResultCard
                          result={result}
                          isSelected={selectedIndex === i}
                          onSelect={handleSelect}
                          onHover={() => setSelectedIndex(i)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/10 flex items-center justify-between bg-muted/5">
              <span className="text-[10px] text-muted-foreground/35 font-medium">
                {query ? 'NextByte Search' : 'NextByte Spotlight'}
              </span>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground/35">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted/15 border border-border/10 text-[9px]">↑↓</kbd>
                  nawiguj
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-muted/15 border border-border/10 text-[9px]">↵</kbd>
                  otwórz
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { NextByteSpotlightInline };
