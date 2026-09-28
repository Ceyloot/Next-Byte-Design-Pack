import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, MoreHorizontal, LogOut, Crown, User, Settings, Sparkles, BriefcaseBusiness, UsersRound, PanelLeft, LayoutGrid, Search } from 'lucide-react';
import { useIsAdmin, useHasManagementRole } from '@/hooks/useUserRoles';
import { useFeaturePermissions, useUserPermissions } from '@/hooks/useFeaturePermissions';
import { useWallet } from '@/hooks/useWallet';
import { useOptionalGlobalDialogs } from '@/contexts/GlobalDialogsContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { UchwytPaska } from '@/components/DokowaniePaska';
import { useNavigationMode } from '@/contexts/NavigationModeContext';
import {
  dashboardItem,
  aiMenuItems,
  mainMenuItems,
  communityItems,
  toolsItems,
  type MenuItem,
} from '@/components/sidebar/menuData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NextByteSpotlightInline } from '@/components/ui/nextbyte-spotlight';

// Primary nav items shown directly in pill
/** Podpisy pod ikonami w kapsule na telefonie — pełne nazwy się nie mieszczą. */
const KROTKIE_NAZWY: Record<string, string> = {
  '/panel-glowny': 'Panel',
  '/chat-ai': 'Chat AI',
  '/asystent-nextbyte': 'Asystent',
  '/kalendarz': 'Kalendarz',
  '/zadania': 'Zadania',
  '/notatki': 'Notatki',
};

/**
 * Połysk tafli — ten sam zestaw, co wysuwany pasek boczny na telefonie
 * (`SheetContent` w ui/sheet.tsx + nakładka w ui/sidebar.tsx). Artur: „efekt
 * daj mu ten sam, co ma navbar boczny", a obramówkę zdjąć.
 *   1. ukośny odblask od lewego górnego rogu (foreground 7% → 0 na 42%),
 *   2. mgiełka akcentu góra/dół (primary 2% → 3%),
 *   3. świetlna nitka akcentu na górnej krawędzi zamiast rantu.
 */
function PolyskPaska() {
  /* Tintę akcentu (5 % → 7 %) daje sam materiał (`::before` kafelka), więc tu
     zostaje tylko nitka na górnej krawędzi — dokładnie jak w pasku bocznym. */
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
  );
}

/**
 * MATERIAŁ PASKA = MATERIAŁ JEGO MENU (26.09.2026, Artur: „taki sam ma być
 * motyw co w dropdownie" → wybór: pasek jak menu). Dokładnie te same klasy
 * co `DropdownMenuContent` + `nb-szklo-nawigacja`: tafla z refrakcją,
 * wypełnienie z `--popover` (0.55 ciemne / 0.50 jasne), rozmycie 16 px,
 * nasycenie 180%, ranty materiału i ten sam cień. Bez tinty kafelka.
 */
/** Zakładki paska — 1:1 z górnym paskiem podglądu (PreviewSection.tsx, `HorizontalNav`). */
const ZAKLADKA = 'flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 py-2 xl:px-3 xl:py-1.5 text-[12px] font-medium transition-all duration-150';
const ZAKLADKA_AKT = 'border-primary/40 bg-primary/20 text-primary shadow-sm shadow-primary/10';
const ZAKLADKA_NIEAKT = 'border-transparent text-foreground/55 hover:bg-foreground/[0.06] hover:text-foreground';

/** Materiał paska bocznego (ui/sidebar: `nb-szklo nb-szklo-plynne` + wypełnienie i tinta kafelka). */
const SZKLO_PASKA_BOCZNEGO = 'border nb-szklo nb-szklo-plynne nb-kafelek';

const SZKLO_PASKA = 'border-0 nb-szklo nb-szklo-plynne nb-szklo-tafla nb-szklo-nawigacja shadow-2xl shadow-primary/10';

/*
 * WIERSZE LIST = WIERSZE PASKA BOCZNEGO (26.09.2026, Artur: „dropdowny nie
 * mają tych fajnych funkcji"). Te same klasy co `SidebarMenuSection`:
 * `nb-nav-pozycja(-akt)` na wierszu, `nb-nav-ikona(-akt)` na kafelku ikony
 * 28 px, etykiety sekcji jak w pasku (10 px, wersaliki, 0.14em). Aktywna
 * pozycja świeci tak samo jak „Panel Główny" w pasku bocznym.
 */
const KLASA_ETYKIETY_LISTY = 'px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/[0.38]';

function WierszListy({
  ikona: Ikona, tytul, aktywna = false, grozna = false, onSelect, dodatek, className,
}: {
  ikona: React.ElementType; tytul: string; aktywna?: boolean; grozna?: boolean;
  onSelect: () => void; dodatek?: React.ReactNode; className?: string;
}) {
  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn(
        'gap-0 rounded-xl px-2 py-1.5 text-[13px]',
        aktywna ? 'nb-nav-pozycja-akt !text-foreground font-medium' : 'nb-nav-pozycja !text-foreground/[0.88] hover:!text-foreground',
        grozna && '!text-destructive',
        className,
      )}
    >
      <span className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        aktywna ? 'nb-nav-ikona-akt text-primary' : 'nb-nav-ikona text-foreground/60',
        grozna && '!text-destructive',
      )}>
        <Ikona strokeWidth={1.75} className="h-[17px] w-[17px]" />
      </span>
      <span className="ml-2 min-w-0 flex-1 truncate">{tytul}</span>
      {dodatek}
    </DropdownMenuItem>
  );
}

/** Znak Byte jako ikona wiersza — ten sam kafelek co reszta. */
const IkonaByteWiersza: React.FC<{ strokeWidth?: number; className?: string }> = ({ className }) => (
  <span className={cn('text-[15px] leading-none text-primary', className)}>⟠</span>
);

const PRIMARY_URLS = [
  '/panel-glowny',
  '/chat-ai',
  '/asystent-nextbyte',
  '/kalendarz',
  '/zadania',
  '/notatki',
];

export function PillNavbar() {
  const location = useLocation();
  const { pozycja, setNavMode } = useNavigationMode();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { value: isAdmin } = useIsAdmin();
  const { value: hasManagementRole } = useHasManagementRole();
  const { balance, loading: balanceLoading } = useWallet();
  const { signOut, user } = useAuthContext();
  const [szukajOtwarte, setSzukajOtwarte] = useState(false);
  /* Ctrl/Cmd+K — w trybie paska bocznego obsługuje go AppSidebar, którego
     w trybie pigułki nie ma. */
  useEffect(() => {
    const naKlawisz = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSzukajOtwarte((v) => !v);
      }
    };
    window.addEventListener('keydown', naKlawisz);
    return () => window.removeEventListener('keydown', naKlawisz);
  }, []);
  const { isSubscribed } = useSubscriptionContext();
  const dialogs = useOptionalGlobalDialogs();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<'ai' | 'work' | 'community' | null>(null);
  // Prostokąt przycisku jest jedynym źródłem pozycji menu — panel leży
  // w portalu przy `<body>`, więc nie ma rodzica, względem którego mógłby
  // się ustawić sam.
  const kotwiceKategorii = useRef<Record<string, HTMLDivElement | null>>({});



  /* Ta sama widoczność co pasek boczny (SidebarMenuSection): oprócz flag
     z menuData liczą się `feature_permissions` z panelu admina — tylko ODCZYT,
     te same hooki co w pasku bocznym. Bez tego pigułka pokazywała pozycje
     ukryte przez admina (np. Talerz, Automatyzacje). */
  const { data: features } = useFeaturePermissions();
  const { data: userPermissions } = useUserPermissions();
  const canShowItem = (item: MenuItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managementOnly && !hasManagementRole) return false;
    if (!item.available) return false;
    if (!features || !userPermissions) return false;
    const fp = features.find((f) => f.feature_path === item.url);
    if (fp && !fp.is_visible) return false;
    if (fp?.access_level === 'management_admin' && !userPermissions.isManagement) return false;
    if (fp?.access_level === 'admin_only' && !userPermissions.isAdmin) return false;
    return true;
  };

  const allItems: MenuItem[] = [
    dashboardItem,
    ...aiMenuItems,
    ...mainMenuItems,
    ...communityItems,
    ...toolsItems,
  ].filter(canShowItem);

  const navCategories = [
    { id: 'ai' as const, label: 'AI', icon: Sparkles, items: aiMenuItems.filter(canShowItem) },
    { id: 'work' as const, label: 'PRACA', icon: BriefcaseBusiness, items: mainMenuItems.filter(canShowItem) },
    { id: 'community' as const, label: 'SPOŁECZNOŚĆ', icon: UsersRound, items: communityItems.filter(canShowItem) },
  ];

  const primaryItems = allItems.filter((i) => PRIMARY_URLS.includes(i.url));

  const moreItems = toolsItems.filter(canShowItem);

  const isActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + '/');
  const isCategoryActive = (items: MenuItem[]) => items.some((item) => isActive(item.url));

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleByteClick = () => {
    dialogs?.openBytePurchase({ requiredBytes: 0, itemName: 'Byte' });
  };

  const handleSettingsClick = () => {
    // IA v1.3 — przekierowanie do huba /ustawienia (SettingsDialog zostaje jako fallback)
    if (isMobile) setMobileOpen(false);
    navigate('/ustawienia');
  };

  const navLink = (item: MenuItem) => (
    <Tooltip key={item.url}>
      <TooltipTrigger asChild>
        <Link
          to={item.url}
          className={cn(ZAKLADKA, isActive(item.url) ? ZAKLADKA_AKT : ZAKLADKA_NIEAKT)}
        >
          <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
          {/* Podpisy od xl (1280 px), jak wcześniej. Poniżej 2xl krótkie nazwy
              („Asystent", „Panel") — pełne nie mieściły się obok prawej grupy
              (zmierzone 26.09 przy 1333 px: nachodziły o ~100 px). */}
          <span className="hidden xl:inline 2xl:hidden">{KROTKIE_NAZWY[item.url] ?? item.title}</span>
          <span className="hidden 2xl:inline">{item.title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium text-xs">
        {item.title}
      </TooltipContent>
    </Tooltip>
  );

  // ── Telefon: pasek zakładek + rozwijane menu ──
  /*
    ROZRÓŻNIENIE OD PASKA BOCZNEGO (26.09.2026, Artur: „musisz rozróżnić
    nawigację navbar i sidebar na telefonie").

    Wcześniej pigułka na telefonie była paskiem z trzema kategoriami, które
    otwierały TEN SAM wysuwany panel z lewej co tryb paska bocznego — dwa
    tryby, jedna nawigacja. Teraz:
      • pasek boczny = treść na cały ekran, zakładka przy boku, panel z boku;
      • pigułka      = pasek (ten sam kształt 16 px co pigułka na desktopie)
                       z pięcioma najczęstszymi miejscami (ikona + krótki
                       podpis) i „Menu" — zwykła rozwijana lista z resztą
                       modułów pogrupowaną jak na desktopie i kontem.
  */
  if (isMobile) {
    const naDole = pozycja === 'dol';
    const zakladki = primaryItems.slice(0, 5);
    const grupy = [
      ...navCategories,
      { id: 'narzedzia', label: 'NARZĘDZIA', icon: MoreHorizontal, items: moreItems },
    ].filter((g) => g.items.length > 0);
    const menuAktywne = !zakladki.some((z) => isActive(z.url)) && allItems.some((i) => isActive(i.url));

    return (
      <>
        {/* WYRÓWNANE DO KAFELKÓW (26.09.2026, Artur: „wyrównaj do kafelków,
            odstęp od góry i KONIECZNIE liquid glass"). Boki 16 px = `px-4`
            treści Dashboardu, od góry 12 px + notch. Materiał 1:1 z paska
            bocznego — patrz `SZKLO_PASKA`. */}
        <div
          className={cn('sticky z-50 px-4', naDole ? 'bottom-0 pt-3' : 'top-0 pb-0')}
          style={
            naDole
              ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }
              : { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }
          }
        >
          <nav
            aria-label="Nawigacja"
            className={cn('relative flex items-stretch gap-0.5 rounded-2xl p-1', SZKLO_PASKA)}
          >
            <PolyskPaska />
            {zakladki.map((item) => {
              const aktywna = isActive(item.url);
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  aria-current={aktywna ? 'page' : undefined}
                  data-tap-target="off"
                  className={cn(
                    'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors',
                    aktywna ? 'bg-primary/15 text-primary' : 'text-foreground/60 active:bg-foreground/[0.08]',
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  <span className="max-w-full truncate px-1 text-[10px] font-medium leading-none">
                    {KROTKIE_NAZWY[item.url] ?? item.title}
                  </span>
                </Link>
              );
            })}
            {/* „Menu" = zwykła rozwijana lista (Artur: „menu ma rozwijać dropdown
                zwykły"), ten sam komponent co menu konta na desktopie. */}
            <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Otwórz menu"
                  data-tap-target="off"
                  className={cn(
                    'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors',
                    menuAktywne || mobileOpen ? 'bg-primary/15 text-primary' : 'text-foreground/60 active:bg-foreground/[0.08]',
                  )}
                >
                  <LayoutGrid className="h-[18px] w-[18px]" />
                  <span className="text-[10px] font-medium leading-none">Menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side={naDole ? 'top' : 'bottom'}
                sideOffset={8}
                collisionPadding={12}
                className="isolate w-64 max-h-[70dvh] overflow-y-auto rounded-2xl border-0 p-1.5 nb-szklo-nawigacja nb-szklo-lista"
              >
                <PolyskPaska />
                <WierszListy
                  ikona={IkonaByteWiersza}
                  tytul="Byte"
                  onSelect={handleByteClick}
                  dodatek={<span className="ml-2 font-bold text-primary">{balanceLoading ? '—' : balance.toFixed(0)}</span>}
                />
                {grupy.map((grupa) => (
                  <React.Fragment key={grupa.id}>
                    <DropdownMenuLabel className={KLASA_ETYKIETY_LISTY}>{grupa.label}</DropdownMenuLabel>
                    {grupa.items.map((item) => (
                      <WierszListy
                        key={item.url}
                        ikona={item.icon}
                        tytul={item.title}
                        aktywna={isActive(item.url)}
                        onSelect={() => navigate(item.url)}
                      />
                    ))}
                  </React.Fragment>
                ))}
                <DropdownMenuLabel className={KLASA_ETYKIETY_LISTY}>Konto</DropdownMenuLabel>
                <WierszListy ikona={User} tytul="Konto" aktywna={isActive('/konto')} onSelect={() => navigate('/konto')} />
                <WierszListy ikona={Crown} tytul="Premium" aktywna={isActive('/premium')} onSelect={() => navigate('/premium')} />
                <WierszListy ikona={Settings} tytul="Ustawienia" aktywna={isActive('/ustawienia')} onSelect={handleSettingsClick} />
                {/* Powrót do paska bocznego — na telefonie nie ma uchwytu do przeciągania */}
                <WierszListy ikona={PanelLeft} tytul="Pasek boczny" onSelect={() => setNavMode('sidebar')} />
                <DropdownMenuSeparator />
                <WierszListy ikona={LogOut} tytul="Wyloguj się" grozna onSelect={handleLogout} />
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </>
    );
  }

  /*
    ════════════════════════════════════════════════════════════════════════
     SZYBA NIE MOŻE BYĆ DZIECKIEM SZYBY — DLATEGO PORTAL
    ════════════════════════════════════════════════════════════════════════

    Rozwijane menu wisiało wewnątrz `<nav>`, a `<nav>` ma własny
    `backdrop-filter`. Element z `backdrop-filter` staje się KORZENIEM TŁA
    dla całego swojego poddrzewa: dziecko próbkuje wtedy tylko to, co
    narysował rodzic, a nie stronę pod spodem.

    Zmierzone na Panelu Głównym: menu miało poprawny filtr
    `url(#nb-refrakcja-delikatne) saturate(1.3) blur(8.8px)` i poprawne
    wypełnienie `rgba(8,8,8,0.6)` — a mimo to nagłówek „Wróć do roboty"
    i pole wyszukiwania czytały się przez nie OSTRO. Bo rozmywało pustkę.

    Po drodze zdjąłem jeszcze `-translate-x-1/2`: każdy `transform` na
    przodku robi to samo. Zostało wyśrodkowanie marginesem, a wejście samą
    przezroczystością.

    Dokładnie z tego powodu wszystkie menu Radiksa na platformie mają
    materiał — one od zawsze lądują w portalu przy `<body>`. Tu jedynym
    menu pisanym z ręki było to, więc jedynym bez materiału też było to.

    Pozycja liczona z prostokąta przycisku (`fixed`), a `onMouseEnter`
    /`onMouseLeave` powtórzone na panelu — po wyjściu z drzewa `<nav>`
    najechanie na menu jest już opuszczeniem przycisku.
  */
  const categoryMenu = (category: typeof navCategories[number]) => {
    const active = isCategoryActive(category.items);
    const otwarte = openCategory === category.id;
    const kotwica = kotwiceKategorii.current[category.id];

    return (
      <div
        key={category.id}
        className="relative"
        ref={(el) => { kotwiceKategorii.current[category.id] = el; }}
        onMouseEnter={() => setOpenCategory(category.id)}
        onMouseLeave={() => setOpenCategory(null)}
      >
        <button
          aria-label={category.label}
          /* Tablet nie ma hovera — stuknięcie palcem/rysikiem przełącza menu.
             Myszy nie dotyczy: tam otwiera najechanie i klik niczego nie psuje. */
          onPointerUp={(e) => {
            if (e.pointerType !== 'mouse') setOpenCategory((o) => (o === category.id ? null : category.id));
          }}
          className={cn(ZAKLADKA, active || otwarte ? ZAKLADKA_AKT : ZAKLADKA_NIEAKT)}
        >
          <category.icon className="h-3.5 w-3.5 shrink-0" />
          {/* Poniżej xl sama ikona — z podpisami pasek nie mieści się w szerokości */}
          <span className="hidden xl:inline">{category.label.length <= 2 ? category.label : category.label.charAt(0) + category.label.slice(1).toLowerCase()}</span>
          <ChevronRight className={cn('hidden h-2.5 w-2.5 shrink-0 transition-transform duration-200 xl:block', otwarte ? 'rotate-90 text-primary' : 'opacity-40')} />
        </button>

        {otwarte && kotwica && createPortal(
          <div
            className={cn('fixed z-[60] w-72 animate-in fade-in duration-200', pozycja === 'dol' ? 'pb-4' : 'pt-4')}
            style={{
              left: Math.min(
                Math.max(8, kotwica.getBoundingClientRect().left + kotwica.offsetWidth / 2 - 144),
                window.innerWidth - 288 - 8,
              ),
              /* Pasek na dole — menu wychodzi W GÓRĘ, inaczej ucieka za ekran. */
              ...(pozycja === 'dol'
                ? { bottom: window.innerHeight - kotwica.getBoundingClientRect().top }
                : { top: kotwica.getBoundingClientRect().bottom }),
            }}
            onMouseEnter={() => setOpenCategory(category.id)}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <div className="relative isolate overflow-hidden rounded-2xl p-1.5 nb-szklo nb-szklo-plynne nb-szklo-tafla nb-szklo-nawigacja nb-szklo-lista">
              <PolyskPaska />
              <div className={KLASA_ETYKIETY_LISTY}>{category.label}</div>
              {category.items.map((item) => {
                const akt = isActive(item.url);
                return (
                  <button
                    key={item.url}
                    onClick={() => { navigate(item.url); setOpenCategory(null); }}
                    className={cn(
                      'group flex w-full items-center rounded-xl px-2 py-1.5 text-left text-[13px] transition-all duration-300',
                      akt ? 'nb-nav-pozycja-akt !text-foreground font-medium' : 'nb-nav-pozycja !text-foreground/[0.88] hover:!text-foreground',
                    )}
                  >
                    <span className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      akt ? 'nb-nav-ikona-akt text-primary' : 'nb-nav-ikona text-foreground/60 group-hover:text-foreground/90',
                    )}>
                      <item.icon strokeWidth={1.75} className="h-[17px] w-[17px]" />
                    </span>
                    <span className="ml-2 min-w-0 flex-1 truncate">{item.title}</span>
                    {item.badge && <span className="ml-2 text-[10px] font-medium text-primary/75">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  // ── Desktop: pasek 1:1 z górnym paskiem podglądu (nextbyte-preview) ──
  /*
    Artur, 26.09.2026: „wygląd górnego navbara 1:1 taki jak ten główny ogólny,
    ale z efektem jak sidebar". Wzór: `HorizontalNav` w
    nextbyte-preview/src/sections/PreviewSection.tsx —
      • po lewej sam uchwyt (sześć kropek), bez logo,
      • zakładki wyśrodkowane: ikona + podpis (+ strzałka przy kategoriach),
        aktywna = obwódka primary/40 na tle primary/20,
      • po prawej ciche, obrysowane kontrolki h-7 i awatar z inicjałami.
    Materiał — ten sam co pasek boczny (`SZKLO_PASKA_BOCZNEGO`).
  */
  const inicjaly = (() => {
    const m = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
    const z = `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.trim();
    return (z || (user?.email ?? '?').slice(0, 2)).toUpperCase();
  })();
  const KONTROLKA = 'flex items-center gap-1 px-2 h-7 rounded-lg border text-[12px] font-semibold transition-all duration-200 border-foreground/12 bg-foreground/[0.05] text-foreground/45 hover:text-foreground hover:border-foreground/20';
  const OKRAGLA = 'relative flex h-7 w-7 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.04] transition-all duration-200 hover:border-foreground/20 hover:bg-foreground/[0.08]';

  return (
    /* Ten sam kontener co treść Panelu Głównego (Dashboard.tsx: max-w-[1600px] px-4 md:px-6),
        więc krawędzie paska stoją w jednej linii z kafelkami pod nim. */
    <div className={cn('sticky z-50 mx-auto w-full max-w-[1600px] px-4 md:px-6', pozycja === 'dol' ? 'bottom-0 pb-4 md:pb-5' : 'top-0 pt-4 md:pt-5')}>
      <nav className={cn('relative flex h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 shadow-2xl', SZKLO_PASKA_BOCZNEGO)}>
        <PolyskPaska />

        {/* Lewo: uchwyt dokowania */}
        <div className="flex shrink-0 items-center pr-2">
          <UchwytPaska kropki />
        </div>

        {/* Środek: zakładki */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 h-full">
          {primaryItems.map((item) => navLink(item))}
          {navCategories.map((category) => categoryMenu(category))}
          {moreItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Narzędzia"
                  className="flex items-center rounded-xl border border-transparent px-2.5 py-2 text-foreground/55 transition-all duration-150 hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side={pozycja === 'dol' ? 'top' : 'bottom'} sideOffset={10} className="isolate min-w-[220px] rounded-2xl border-0 p-1.5 nb-szklo-nawigacja nb-szklo-lista">
                <PolyskPaska />
                <DropdownMenuLabel className={KLASA_ETYKIETY_LISTY}>Narzędzia</DropdownMenuLabel>
                {moreItems.map((item) => (
                  <WierszListy
                    key={item.url}
                    ikona={item.icon}
                    tytul={item.title}
                    aktywna={isActive(item.url)}
                    onSelect={() => navigate(item.url)}
                    dodatek={item.badge && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{item.badge}</span>
                    )}
                  />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Prawo: ustawienia, Byte, szukaj, dzwonek, awatar */}
        <div className="flex shrink-0 items-center gap-1.5 pl-2">
          <button type="button" onClick={handleSettingsClick} title="Ustawienia" className={KONTROLKA}>
            <Settings className="h-3 w-3 shrink-0" />
            <span className="hidden 2xl:inline">Ustawienia</span>
          </button>
          <button type="button" onClick={handleByteClick} title="Doładuj Byte" className={KONTROLKA}>
            <span className="text-[12px] leading-none text-primary">⟠</span>
            {balanceLoading
              ? <span className="h-1.5 w-6 rounded-full bg-foreground/25" />
              : <span className="text-foreground/80"><span className="hidden xl:inline">Byte </span><span className="font-bold text-primary">{balance.toFixed(0)}</span></span>}
          </button>
          <button type="button" onClick={() => setSzukajOtwarte(true)} title="Szukaj (Ctrl+K)" aria-label="Szukaj" className={OKRAGLA}>
            <Search className="h-3.5 w-3.5 text-primary" />
          </button>
          <NotificationBell className="!h-7 !w-7 !rounded-full !border-foreground/10 !bg-foreground/[0.04] !p-0 !shadow-none [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:!text-primary" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Konto"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/25 text-[11px] font-bold text-primary transition-colors hover:border-primary/60"
              >
                {inicjaly}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={pozycja === 'dol' ? 'top' : 'bottom'} sideOffset={10} className="isolate min-w-[200px] rounded-2xl border-0 p-1.5 nb-szklo-nawigacja nb-szklo-lista">
              <PolyskPaska />
              <DropdownMenuLabel className={KLASA_ETYKIETY_LISTY}>Konto</DropdownMenuLabel>
              <WierszListy ikona={User} tytul="Konto" aktywna={isActive('/konto')} onSelect={() => navigate('/konto')} />
              <WierszListy ikona={Crown} tytul="Premium" aktywna={isActive('/premium')} onSelect={() => navigate('/premium')} />
              <WierszListy ikona={Settings} tytul="Ustawienia" aktywna={isActive('/ustawienia')} onSelect={handleSettingsClick} />
              <DropdownMenuSeparator />
              <WierszListy ikona={LogOut} tytul="Wyloguj się" grozna onSelect={handleLogout} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Szukajka — ta sama co w pasku bocznym (AppSidebar), z tym samym welonem. */}
      <Dialog open={szukajOtwarte} onOpenChange={setSzukajOtwarte}>
        <DialogContent
          hideCloseButton
          variant="czyste"
          className="left-0 top-0 h-full w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:hidden"
        >
          <div
            className="flex h-full w-full justify-center overflow-y-auto px-4 pt-[14vh] pb-8"
            style={{ background: 'rgba(0, 0, 0, 0.22)', backdropFilter: 'saturate(130%) blur(7.2px)', WebkitBackdropFilter: 'saturate(130%) blur(7.2px)' }}
            onClick={() => setSzukajOtwarte(false)}
          >
            <div className="h-fit w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <NextByteSpotlightInline pelnyEkran />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
