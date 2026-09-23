import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, MoreHorizontal, LogOut, Crown, User, Settings, Sparkles, BriefcaseBusiness, UsersRound } from 'lucide-react';
import { useSiteAsset } from '@/hooks/useSiteAsset';
import { getAssetUrl } from '@/lib/assetUtils';
import { useIsAdmin, useHasManagementRole } from '@/hooks/useUserRoles';
import { useWallet } from '@/hooks/useWallet';
import { useOptionalGlobalDialogs } from '@/contexts/GlobalDialogsContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from '@/components/notifications/NotificationBell';

// Primary nav items shown directly in pill
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: logoAsset } = useSiteAsset('sidebar_logo');
  const [isLime, setIsLime] = useState(() => document.documentElement.getAttribute('data-theme') === 'lime-green');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLime(document.documentElement.getAttribute('data-theme') === 'lime-green');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const { value: isAdmin } = useIsAdmin();
  const { value: hasManagementRole } = useHasManagementRole();
  const { balance, loading: balanceLoading } = useWallet();
  const { signOut } = useAuthContext();
  const { isSubscribed } = useSubscriptionContext();
  const dialogs = useOptionalGlobalDialogs();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<'ai' | 'work' | 'community' | null>(null);
  const [openCategory, setOpenCategory] = useState<'ai' | 'work' | 'community' | null>(null);
  // Prostokąt przycisku jest jedynym źródłem pozycji menu — panel leży
  // w portalu przy `<body>`, więc nie ma rodzica, względem którego mógłby
  // się ustawić sam.
  const kotwiceKategorii = useRef<Record<string, HTMLDivElement | null>>({});
  const navRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = useCallback(() => {
    const activeUrl = PRIMARY_URLS.find(url => location.pathname === url || location.pathname.startsWith(url + '/'));
    if (activeUrl && navRefs.current[activeUrl] && navContainerRef.current) {
      const el = navRefs.current[activeUrl]!;
      const container = navContainerRef.current;
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    } else {
      setIndicatorStyle(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const canShowItem = (item: MenuItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managementOnly && !hasManagementRole) return false;
    return item.available;
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
          ref={(el) => { navRefs.current[item.url] = el; }}
          to={item.url}
          className={cn(
            'relative z-10 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
            isActive(item.url)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium text-xs">
        {item.title}
      </TooltipContent>
    </Tooltip>
  );

  // ── Mobile: hamburger sheet ──
  if (isMobile) {
    return (
      <>
        <div
          className="sticky top-0 z-50 px-3 pb-2 bg-gradient-to-b from-background via-background/80 to-transparent"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
        >
          <nav className="flex items-center justify-between rounded-2xl border border-border/40 nb-szklo nb-szklo-plynne nb-szklo-tafla shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)] px-3 py-2">
            {/* `no-scrollbar` NIE ISTNIAŁO — zmierzone: zero reguł CSS pod tą
                nazwą, więc poziomy pasek przewijania był widoczny i zjadał
                18 z 68 px wysokości nawigacji. Platforma ma na to
                `scrollbar-hide` (index.css). */}
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
              {navCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { setMobileCategory(category.id); setMobileOpen(true); }}
                  className={cn(
                    /* `px-2` zamiast `px-3` — zmierzone przy 375 px: trzy
                       kategorie zajmowały 297 px w pasie o szerokości 281,
                       więc „SPOŁECZNOŚĆ" wychodziła 16 px za krawędź i dało
                       się do niej dojechać tylko przewinięciem, o którym nic
                       nie mówiło (pas jest `scrollbar-hide`). Węższe wcięcie
                       oddaje 24 px, czyli mieści się z zapasem, a 8 px
                       poziomego wcięcia przy wysokości 36 px to dalej
                       wygodny cel dla palca. Przewijanie zostaje jako
                       zabezpieczenie na dłuższe nazwy. */
                    'flex shrink-0 items-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-bold tracking-wide transition-all',
                    isCategoryActive(category.items)
                      ? 'border-primary/35 bg-primary/10 text-primary shadow-[0_0_18px_-8px_hsl(var(--primary)/0.65)]'
                      : 'border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/25 hover:text-foreground'
                  )}
                >
                  <category.icon className="h-3.5 w-3.5" />
                  {category.label}
                </button>
              ))}
            </div>

            {/*
              BEZ TEGO NA TELEFONIE NIE DA SIĘ WYJŚĆ Z KONTA.

              Prawa strona paska była pusta — na desktopie stoją tu dzwonek,
              saldo Byte i menu konta, na telefonie nie było NICZEGO. W trybie
              pigułki (a to pełnoprawny tryb do wyboru w Ustawieniach) telefon
              nie miał więc dojścia do konta, Premium, ustawień ani wylogowania,
              bo pigułka zastępuje pasek boczny, który normalnie je niesie.

              Dzwonek i saldo zostają na desktopie: na 375 px zabrałyby miejsce
              trzem kategoriom. Saldo jest jedną pozycją niżej, w menu konta.
            */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Konto"
                  className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 transition-colors hover:border-primary/40"
                >
                  <User className="h-4 w-4 text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px] nb-szklo nb-szklo-plynne border-border/50">
                <DropdownMenuItem onClick={handleByteClick} className="cursor-pointer">
                  <span className="mr-2 text-sm text-primary">⟠</span>
                  Byte
                  <span className="ml-auto font-bold text-primary">
                    {balanceLoading ? '—' : balance.toFixed(0)}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/konto')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> Konto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/premium')} className="cursor-pointer">
                  <Crown className={cn('w-4 h-4 mr-2', isSubscribed ? 'text-success' : 'text-warning')} /> Premium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> Ustawienia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Wyloguj się
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b border-border/50">
              <SheetTitle className="text-left gradient-text text-lg">
                {navCategories.find((category) => category.id === mobileCategory)?.label || 'Nawigacja'}
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-180px)]">
              {(navCategories.find((category) => category.id === mobileCategory)?.items || allItems).map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive(item.url)
                      ? 'bg-primary/10 border border-primary/25 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
            <div className="border-t border-border/50 p-3 flex flex-col gap-1">
              <button onClick={() => { setMobileOpen(false); navigate('/konto'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full">
                <User className="w-4 h-4" /> Konto
              </button>
              <button onClick={() => { setMobileOpen(false); navigate('/premium'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full">
                <Crown className="w-4 h-4" /> Premium
              </button>
              <button onClick={() => { setMobileOpen(false); handleSettingsClick(); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full">
                <Settings className="w-4 h-4" /> Ustawienia
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full">
                <LogOut className="w-4 h-4" /> Wyloguj się
              </button>
            </div>
          </SheetContent>
        </Sheet>
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
          className={cn(
            'relative z-10 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold tracking-wide transition-all duration-200',
            active || otwarte
              ? 'border-primary/35 bg-primary/10 text-primary shadow-[0_0_22px_-10px_hsl(var(--primary)/0.75)]'
              : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/30 hover:text-foreground'
          )}
        >
          <category.icon className="h-4 w-4" />
          {category.label}
        </button>

        {otwarte && kotwica && createPortal(
          <div
            className="fixed z-[60] w-72 pt-3 animate-in fade-in duration-200"
            style={{
              left: kotwica.getBoundingClientRect().left + kotwica.offsetWidth / 2 - 144,
              top: kotwica.getBoundingClientRect().bottom,
            }}
            onMouseEnter={() => setOpenCategory(category.id)}
            onMouseLeave={() => setOpenCategory(null)}
          >
            <div className="overflow-hidden rounded-2xl border border-primary/15 p-2 shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)] nb-szklo nb-szklo-plynne nb-szklo-tafla">
              {category.items.map((item) => (
                <button
                  key={item.url}
                  onClick={() => { navigate(item.url); setOpenCategory(null); }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                    isActive(item.url) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                  )}
                >
                  <span className="nb-ikona-kafel flex h-8 w-8 items-center justify-center rounded-lg border group-hover:border-primary/30 group-hover:bg-primary/10">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.title}</span>
                    {item.badge && <span className="text-[10px] font-medium text-primary/75">{item.badge}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  // ── Desktop: pill navbar ──
  return (
    <div className="sticky top-0 z-50 px-4 pt-4 pb-3">
      <nav className="max-w-5xl mx-auto flex items-center justify-between rounded-2xl border border-border/40 nb-szklo nb-szklo-plynne nb-szklo-tafla shadow-[0_18px_44px_-12px_hsl(var(--background)/0.9)] px-5 py-2.5">
        {/* Left: Logo */}
        <Link to="/panel-glowny" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-muted/50 border border-primary/10 overflow-hidden p-1 flex-shrink-0">
            {getAssetUrl(logoAsset) ? (
              <img src={getAssetUrl(logoAsset)!} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 rounded-lg">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary text-base leading-tight">NextByte</span>
            {isLime && (
              <span className="text-[8px] font-semibold uppercase tracking-widest text-primary/50 leading-none">Motyw Beta</span>
            )}
          </div>
        </Link>

        {/* Center: quick actions + grouped categories */}
        <div ref={navContainerRef} className="relative flex items-center gap-1">
          {/* Animated active indicator */}
          {indicatorStyle && (
            <motion.div
              className="absolute top-0 bottom-0 rounded-xl bg-primary/10 border border-primary/25 shadow-sm shadow-primary/10"
              layoutId="pill-nav-indicator"
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ height: '100%' }}
            />
          )}
          {primaryItems.map((item) => navLink(item))}

          <div className="mx-1 h-6 w-px bg-border/50" />
          {navCategories.map((category) => categoryMenu(category))}

          {/* More dropdown */}
          {moreItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="min-w-[200px] nb-szklo nb-szklo-plynne border-border/50">
                {moreItems.map((item) => (
                  <DropdownMenuItem
                    key={item.url}
                    onClick={() => navigate(item.url)}
                    className={cn(
                      'flex items-center gap-2.5 cursor-pointer',
                      isActive(item.url) && 'text-primary bg-primary/5'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {item.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Right: Byte balance + avatar dropdown */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={handleByteClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <span className="text-sm text-primary">⟠</span>
            {balanceLoading ? (
              <div className="w-10 h-3.5 bg-primary/20 rounded animate-pulse" />
            ) : (
              <span className="font-medium text-foreground">
                Byte <span className="font-bold text-primary">{balance.toFixed(0)}</span>
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center hover:border-primary/40 transition-all">
                <User className="w-4 h-4 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px] nb-szklo nb-szklo-plynne border-border/50">
              <DropdownMenuItem onClick={() => navigate('/konto')} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" /> Konto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/premium')} className="cursor-pointer">
                <Crown className={cn('w-4 h-4 mr-2', isSubscribed ? 'text-success' : 'text-warning')} /> Premium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" /> Ustawienia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}
