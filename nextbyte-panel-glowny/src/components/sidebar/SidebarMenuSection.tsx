import React, { useState, useMemo, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Plakietka } from '@/components/ui/plakietka';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MenuItem, MenuTier } from './menuData';
import { ChevronDown, ChevronRight, BookOpen, Shield, ShieldAlert, Lock } from 'lucide-react';
import { usePurchasedCourses } from '@/hooks/usePurchasedCourses';
import { useFeaturePermissions, useUserPermissions } from '@/hooks/useFeaturePermissions';
import { cn } from '@/lib/utils';

interface SidebarMenuSectionProps {
  title: string;
  items: MenuItem[];
  isAdmin: boolean;
  hasManagementRole: boolean;
  isSalesperson?: boolean;
  isLoading?: boolean;
  pendingInvitationsCount?: number;
  pendingDashboardActionsCount?: number;
}

/** Returns Tailwind classes per visual tier — replaces 5-color border chaos. */
/*
  MATERIAŁ POZYCJI IDZIE Z BIBLIOTEKI (04.08.2026).
  Michał: „cały look składał się z naszych komponentów".

  BYŁO: cztery warianty, każdy z własnymi `!bg-foreground/[0.0x]`,
  `!border-foreground/1x` i `shadow-[inset_…]` wpisanymi z ręki — razem
  22 takie klasy w pasku, wszystkie z `!important`, żeby przebić style
  `SidebarMenuButton`. Menu miało przez to własny język materiału obok
  tego, którym jedzie reszta platformy, i nie reagowało na tokeny Zarządu.

  JEST: `.nb-wiersz-int` / `.nb-wiersz-akt` z `index.css` — te same reguły
  co element listy w kafelku, liczone od `--nb-wrs-wypelnienie`. Tier
  decyduje już WYŁĄCZNIE o sile tekstu, bo tylko to go naprawdę różniło:
  wypełnienia i obwódki miał identyczne we wszystkich trzech odmianach
  (sprawdzone przed zmianą — `muted` i `standard` różniły się jedną setną
  alfy tekstu, a `primary` samą grubością).
*/
/*
  PRZEPROJEKTOWANIE 14.08.2026 — Michał: „pasek wygląda jak z 2013,
  zaprojektuj go, aby nie było wstydu i był mega intuicyjny".

  Trzy zmiany, które robią różnicę epoki (pełna diagnoza przy
  `.nb-nav-pozycja` w index.css):
    • ikony wyszły z kwadratowych pudełek z obwódką — stoją gołe w linii
      z tekstem, jak w Linear/Notion/Claude;
    • wiersze bez ramek — lista, nie siatka pudełek;
    • stan aktywny to pigułka `primary` z ikoną w primary — „tu jesteś"
      widać kolorem, tym samym, którym wykres aktywności mówi „tu żyłeś".
*/
/*
  DYSCYPLINA TRZECH BARW (Michał: „nie rozdrabniać się na x kolorów, max 3
  w danym motywie — to ma być top 1 na świecie, nie przedszkole").

  Próba z kolorem per sekcja (sky/fuchsia/amber/emerald/violet) została COFNIĘTA
  i miała dwa realne defekty, nie tylko estetyczny:
    ① paleta Tailwinda nie podąża za motywem — platforma ma 9 motywów z bazy,
       a `text-sky-400` jest w każdym identyczny, więc na 8 z nich kłóci się
       z akcentem;
    ② pięć barw na 21 pozycji odbiera kolorowi znaczenie: skoro wszystko jest
       kolorowe, aktywna pozycja przestaje się wyróżniać.

  Zostają TRZY barwy, wszystkie z motywu — dokładnie tak, jak robi to Linear,
  Notion i Claude:
    • `--foreground` w skali krycia — tekst i ikony spoczynkowe (spokój),
    • `--primary` — WYŁĄCZNIE stan aktywny i akcenty (znaczenie),
    • `--destructive` — wyłącznie alarmy (plakietki zaległości).
  Hierarchię sekcji niosą typografia i odstępy, nie barwniki.
*/
const tierClasses = (tier: MenuTier | undefined, isActive: boolean): string => {
  if (isActive) return 'nb-nav-pozycja-akt !text-foreground font-medium';
  switch (tier) {
    case 'primary':
      return 'nb-nav-pozycja !text-foreground hover:!text-foreground';
    case 'muted':
      return 'nb-nav-pozycja !text-foreground/[0.70] hover:!text-foreground';
    case 'standard':
    default:
      return 'nb-nav-pozycja !text-foreground/[0.88] hover:!text-foreground';
  }
};

const SidebarMenuSectionComponent = ({
  title,
  items,
  isAdmin,
  hasManagementRole,
  isSalesperson = false,
  isLoading = false,
  pendingInvitationsCount = 0,
  pendingDashboardActionsCount = 0,
}: SidebarMenuSectionProps) => {
  const location = useLocation();
  const { purchasedCourses } = usePurchasedCourses();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { data: features, isLoading: featuresLoading } = useFeaturePermissions();
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();

  const isCollapsed = state === 'collapsed' && !isMobile;

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    if (location.pathname.startsWith('/akademia/kurs/') || location.pathname === '/akademia') {
      return ['Akademia'];
    }
    return [];
  });

  const isActive = (url: string) => {
    if (url === '#') return false;
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev =>
      prev.includes(itemTitle) ? prev.filter(item => item !== itemTitle) : [...prev, itemTitle]
    );
  };

  const isExpanded = (itemTitle: string) => expandedItems.includes(itemTitle);

  const loading = isLoading || featuresLoading || permissionsLoading || !features || !userPermissions;

  const filteredItems = useMemo(() => {
    // Podczas ładowania uprawnień NIE renderujemy żadnych elementów, które mogłyby
    // być ograniczone rolą lub dynamicznymi feature_permissions.
    // Zapobiega to „mignięciu" pozycji zastrzeżonych zanim baza zdąży odpowiedzieć.
    if (loading) {
      return [];
    }

    return items.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.managementOnly && !hasManagementRole) return false;
      if (item.salesOnly && !isAdmin && !isSalesperson) return false;

      const featurePermission = features.find(f => f.feature_path === item.url);
      if (featurePermission && !featurePermission.is_visible) return false;

      if (featurePermission) {
        switch (featurePermission.access_level) {
          case 'all':
            return true;
          case 'management_admin':
            if (!userPermissions.isManagement) return false;
            break;
          case 'admin_only':
            if (!userPermissions.isAdmin) return false;
            break;
        }
      }

      return true;
    }).map(item => {
      const featurePermission = features.find(f => f.feature_path === item.url);
      const _accessLevel = featurePermission?.access_level as ('all' | 'management_admin' | 'admin_only' | undefined);

      if (item.title === 'Akademia' && item.expandable) {
        const courseChildren: MenuItem[] = purchasedCourses.map(course => ({
          title: course.title,
          icon: BookOpen,
          url: `/akademia/kurs/${course.id}`,
          badge: null,
          isActive: false,
          available: true,
        }));
        return { ...item, children: courseChildren, _accessLevel } as MenuItem & { _accessLevel?: typeof _accessLevel };
      }
      return { ...item, _accessLevel } as MenuItem & { _accessLevel?: typeof _accessLevel };
    });
  }, [items, isAdmin, hasManagementRole, isSalesperson, purchasedCourses, features, userPermissions, loading]);

  if (filteredItems.length === 0) return null;

  const renderRoleShield = (item: MenuItem & { _accessLevel?: 'all' | 'management_admin' | 'admin_only' }) => {
    // 1) Twarde flagi z menuData (adminOnly / managementOnly / salesOnly)
    if (item.adminOnly || item.managementOnly || item.salesOnly) {
      const tooltipLabel = item.adminOnly
        ? 'Tylko Admin'
        : item.managementOnly
        ? 'Tylko Zarząd'
        : 'Tylko Handlowiec';
      const Icon = item.adminOnly ? ShieldAlert : Shield;
      const colorClass = item.adminOnly ? 'text-warning/90' : 'text-primary/70';
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', colorClass)} />
          </TooltipTrigger>
          <TooltipContent side="right">{tooltipLabel}</TooltipContent>
        </Tooltip>
      );
    }
    // 2) Dynamiczne ograniczenia z panelu admina (feature_permissions.access_level)
    if (item._accessLevel === 'admin_only' || item._accessLevel === 'management_admin') {
      const isAdminOnly = item._accessLevel === 'admin_only';
      const Icon = isAdminOnly ? Lock : Shield;
      const tooltipLabel = isAdminOnly
        ? 'Ograniczone: tylko Admin (Panel Admina → Uprawnienia)'
        : 'Ograniczone: Admin i Zarząd (Panel Admina → Uprawnienia)';
      const colorClass = isAdminOnly ? 'text-warning/80' : 'text-foreground/50';
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', colorClass)} />
          </TooltipTrigger>
          <TooltipContent side="right">{tooltipLabel}</TooltipContent>
        </Tooltip>
      );
    }
    return null;
  };

  /* Plakietka z biblioteki zamiast `Badge` z własnymi kolorami (04.08.2026).
     Michał: „cały look składał się z naszych komponentów".
     Poprzednia wersja powtarzała paletę akcentu ręcznie (`bg-primary/15
     text-primary border-primary/30`) — czyli dokładnie to, co `intencja
     ="akcent"` niesie z jednego miejsca. `h-4` zostaje: pasek ma ciaśniejszy
     rytm niż karty, dla których liczone są rozmiary `mala`/`srednia`. */
  const renderBadge = (item: MenuItem) => {
    if (!item.badge) return null;
    return (
      <Plakietka intencja="akcent" className="h-4 px-1.5 text-[10px]">
        {item.badge}
      </Plakietka>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const itemIsActive = item.available && isActive(item.url);
    const isDisabled = !item.available;
    const hasChildren = item.expandable && item.children && item.children.length > 0;
    const expanded = isExpanded(item.title);

    const baseClasses = cn(
      // BEZ `border` (14.08.2026) — nowy wygląd nie rysuje obwódek na wierszach,
      // a przezroczysta ramka 1 px i tak przesuwała treść: zmierzone ikony na
      // 29 px przy nagłówkach sekcji na 28 px. Zdjęcie jej zrównuje oś co do
      // piksela i zdejmuje 2 px z wysokości każdego wiersza.
      /* `rounded-xl`, nie `rounded-sm`. Dwa piksele zaokrąglenia w platformie,
         która wszędzie indziej używa 12–16, sprawiały, że aktywna pozycja
         czytała się jak zaznaczony tekst, a nie jak element nawigacji. */
      /* `duration-300`, NIE `duration-250`. Tailwind generuje tylko czasy
         ze swojej skali (75/100/150/200/300/500/700/1000) — `duration-250`
         nie powstaje w ogóle, więc zostawał domyślny czas `transition-all`,
         czyli 150 ms, i utility nadpisywało 0,25 s ustawione w klasie CSS.
         Zmierzone: przejście wychodziło 0,15 s mimo deklaracji w `index.css`.
         Ta sama pułapka co z kryciem: klasa spoza skali nie jest błędem,
         tylko po cichu nie istnieje. */
      'w-full flex items-center rounded-xl border text-[13px] transition-all duration-300 group',
      // px-2.5 → px-2: odzyskane 4 px na tekst przy węższym pasku (patrz
      // komentarz przy SIDEBAR_WIDTH w `ui/sidebar.tsx`).
      /* MAPOWANIE 1:1 (07.09.2026, Michał: „by 1:1 było mapowanie zawartości
         w zwiniętym i rozwiniętym”): wiersz ma TĘ SAMĄ wyściółkę i to samo
         pole ikony w obu stanach; w szynie gaśnie tylko etykieta. Wcześniej
         zwinięcie zmieniało wyściółkę, rozmiar ikony i wyśrodkowanie, więc
         każda ikona skakała w bok i w górę podczas animacji szerokości. */
      'px-2 py-1.5',
      isDisabled
        ? 'text-muted-foreground/50 cursor-not-allowed opacity-60'
        : tierClasses(item.tier, itemIsActive),
      item.tier === 'primary' && !itemIsActive && 'font-medium'
    );

    const menuItemContent = (
      <SidebarMenuItem key={item.title}>
        {hasChildren ? (
          <>
            <div className={baseClasses}>
              <Link
                to={item.available ? item.url : '#'}
                className="flex items-center flex-1 min-w-0"
                onClick={isDisabled ? (e) => e.preventDefault() : handleLinkClick}
              >
                <span className={cn(
                  'flex items-center justify-center flex-shrink-0 rounded-lg',
                  'w-7 h-7',
                  /* Materiał w OBU stanach paska. Zwinięty miał go od dawna,
                     bo ikona jest wtedy jedynym celem kliknięcia; rozwinięty
                     dostaje teraz — patrz `.nb-nav-ikona` w index.css. */
                  itemIsActive ? 'nb-nav-ikona-akt' : 'nb-nav-ikona',
                  itemIsActive ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground/90'
                )}>
                  <item.icon strokeWidth={1.75} className="w-[17px] h-[17px]" />
                </span>
                {/* ml-2.5 → ml-2: ostatnie 2 px, których brakowało najdłuższej
                    etykiecie („Personalny Asystent") po zwężeniu paska. */}
                <span className={cn('truncate ml-2 transition-opacity duration-150', isCollapsed && 'opacity-0')}>{item.title}</span>
              </Link>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {renderRoleShield(item)}
                  {renderBadge(item)}
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className="p-0.5 hover:bg-background/40 rounded transition-colors"
                    aria-label={expanded ? 'Zwiń menu' : 'Rozwiń menu'}
                  >
                    {expanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {expanded && !isCollapsed && (
              <div className="ml-3 mt-1 space-y-0.5 border-l border-border/40 pl-3">
                {item.children!.map((child) => {
                  const childIsActive = child.available && isActive(child.url);
                  return (
                    <SidebarMenuItem key={child.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={childIsActive}
                        className={cn(
                          // Bez `border` i na tej samej rodzinie `nb-nav-*` co
                          // pozycje nadrzędne — inaczej dziecko rysowałoby ramkę,
                          // której rodzic już nie ma.
                          'w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                          childIsActive
                            ? 'nb-nav-pozycja-akt !text-foreground'
                            : 'nb-nav-pozycja !text-foreground/[0.70] hover:!text-foreground'
                        )}
                      >
                        <Link to={child.url} className="flex items-center flex-1" onClick={handleLinkClick}>
                          <child.icon strokeWidth={1.75} className="w-3.5 h-3.5 mr-2.5 flex-shrink-0" />
                          <span className="truncate" title={child.title}>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <SidebarMenuButton asChild isActive={itemIsActive} className={baseClasses}>
            <Link
              to={item.available ? item.url : '#'}
              className="flex items-center flex-1 min-w-0 justify-between"
              onClick={isDisabled ? (e) => e.preventDefault() : handleLinkClick}
            >
              <div className="flex items-center min-w-0 flex-1">
                <span className={cn(
                  'flex items-center justify-center flex-shrink-0 rounded-lg',
                  'w-7 h-7',
                  /* Materiał w OBU stanach paska. Zwinięty miał go od dawna,
                     bo ikona jest wtedy jedynym celem kliknięcia; rozwinięty
                     dostaje teraz — patrz `.nb-nav-ikona` w index.css. */
                  itemIsActive ? 'nb-nav-ikona-akt' : 'nb-nav-ikona',
                  itemIsActive ? 'text-primary' : 'text-foreground/60 group-hover:text-foreground/90'
                )}>
                  <item.icon strokeWidth={1.75} className="w-[17px] h-[17px]" />
                </span>
                {/* ml-2.5 → ml-2: ostatnie 2 px, których brakowało najdłuższej
                    etykiecie („Personalny Asystent") po zwężeniu paska. */}
                <span className={cn('truncate ml-2 transition-opacity duration-150', isCollapsed && 'opacity-0')}>{item.title}</span>
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {item.title === 'Panel Główny' && pendingDashboardActionsCount > 0 && (
                    <Plakietka intencja="krytyczna" kropka zywa className="h-4 px-1.5 text-[10px]">
                      {pendingDashboardActionsCount}
                    </Plakietka>
                  )}
                  {item.title === 'Firma' && pendingInvitationsCount > 0 && (
                    <Plakietka intencja="krytyczna" className="h-4 px-1.5 text-[10px]">
                      {pendingInvitationsCount}
                    </Plakietka>
                  )}
                  {renderRoleShield(item)}
                  {renderBadge(item)}
                </div>
              )}
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>{menuItemContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return menuItemContent;
  };

  const tourSlug = title
    ? title.toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : undefined;

  /*
    RYTM SEKCJI — ODCHUDZONY 04.08.2026.
    Michał: „poukładać, aby nie zabierał tyle miejsca, był minimalistyczny".

    ZMIERZONE PRZED: 21 pozycji menu, z czego 15 mieści się na ekranie —
    413 px zostaje pod krawędzią. Same nagłówki sekcji zjadały 190 px,
    czyli prawie połowę tego, co wypadało poza widok. Sześć nagłówków
    na 21 pozycji to jeden opis na trzy linki — koszt większy niż korzyść.

    Nagłówek zajmował cztery warstwy odstępu naraz: `mb-3` grupy, `pt-2`
    i `mb-1.5` pojemnika oraz własną wysokość etykiety. Teraz niesie go
    jedna: etykieta stoi w linii z cienką kreską, bez podwójnych marginesów.

    ── NAGŁÓWEK DOPIERO OD TRZECH POZYCJI ────────────────────────────────
    Reguła, nie widzimisię: opis kosztuje tyle samo miejsca co pozycja menu,
    więc przy dwóch linkach płacimy 50% za etykietę, która i tak powtarza
    to, co widać z ikon („Studio Zdjęć", „Studio Video" — nikt nie potrzebuje
    nad tym napisu STUDIO KREACJI). Krótsze grupy dostają samą kreskę, czyli
    ten sam podział wizualny za jedną trzecią wysokości.

    Reguła sama się skaluje: gdy do grupy dojdzie trzeci moduł, nagłówek
    wróci bez niczyjej interwencji. Liczymy po `filteredItems`, a nie po
    `items` — grupa przycięta uprawnieniami do dwóch pozycji też traci opis.
  */
  const naglowekWarty = filteredItems.length >= 3;

  return (
    <SidebarGroup
      /* `px-0` (14.08.2026) — Michał, liniami na zrzucie: „zależy mi, by wszystko
         tam było idealnie wyrównane i symetrycznie ułożone".
         Zmierzone: nagłówek, wyszukiwarka i stopka trzymały oś 12 px, ale wiersze
         menu stały na 20 — bo `SidebarGroup` z biblioteki niesie własne `p-2`
         ponad padding paska. Zdejmuję je TYLKO w poziomie (pion zostaje, bo
         odpowiada za rytm sekcji), więc pigułka menu ląduje w tej samej osi co
         pole wyszukiwania i karta konta, a ikony i nagłówki sekcji trzymają
         wspólną oś wewnętrzną. */
      className={cn('px-0', title ? 'mb-1.5' : 'mb-0.5')}
      data-tour={tourSlug ? `sidebar-group-${tourSlug}` : undefined}
    >
      {title && naglowekWarty ? (
        /* WSPÓLNA OŚ LEWA (14.08.2026). Michał: „zależy mi, by wszystko tam było
           idealnie wyrównane i symetrycznie ułożone".
           Zmierzone przed: ikony pozycji zaczynały się na 29 px od krawędzi
           paska, a nagłówki sekcji na 32 px — trzy piksele w bok, czyli jedyny
           element łamiący pion. `px-3` → `px-2` zrównuje nagłówek z wierszem
           menu (ten sam padding poziomy), a kreska separatora idzie za nim,
           żeby jej końce nie wisiały nad niczym. */
        /* Ten sam blok 36 px w OBU stanach paska: w szynie zamiast etykiety
           stoi kreska tej samej wysokości, więc pozycje niżej nie przesuwają
           się w pionie przy zwijaniu (mapowanie 1:1). */
        <div className="mb-1 px-2 pt-4">
          {isCollapsed ? (
            <div className="flex h-4 items-center" aria-hidden>
              <div className="h-px w-7 bg-foreground/[0.12]" />
            </div>
          ) : (
            <SidebarGroupLabel className="text-foreground/[0.38] text-[10px] font-medium uppercase tracking-[0.14em] px-0 h-4 leading-4">
              {title}
            </SidebarGroupLabel>
          )}
        </div>
      ) : title ? (
        /* Sama kreska — dla grup krótkich (< 3 pozycji) i dla paska zwiniętego
           do ikon, gdzie etykieta i tak by się nie zmieściła. Ten sam podział
           wizualny, jedna trzecia wysokości. */
        /* Krótka grupa: 16 px w obu stanach. W szynie kreska (jedyny sygnał
           podziału, bo etykiet nie ma), w pasku rozwiniętym sam odstęp. */
        <div className="flex h-4 items-center px-2" aria-hidden>
          {isCollapsed && <div className="h-px w-7 bg-foreground/[0.12]" />}
        </div>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {filteredItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const SidebarMenuSection = memo(SidebarMenuSectionComponent);
