import {
  UtensilsCrossed,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  HelpCircle,
  StickyNote,
  PenTool,
  FileText,
  Settings,
  GraduationCap,
  Shield,
  Newspaper,
  MessageSquare,
  Building2,
  CheckSquare,
  Sparkles,
  ShoppingBag,
  ShoppingBasket,
  Users,
  Camera,
  Bot,
  // CreditCard usunięty po przeniesieniu /subskrypcje do huba /plan
  Workflow,
  Repeat,
  Video,
  Briefcase,
  Skull,
  Wand2,
  Brain,
  Cloud,
} from 'lucide-react';

/**
 * Visual hierarchy tier — replaces the old 5-color badge chaos.
 *  - 'primary'  : pełny kolor primary, większy (najczęstsze)
 *  - 'standard' : codzienny look
 *  - 'muted'    : sporadyczne (60% opacity)
 */
export type MenuTier = 'primary' | 'standard' | 'muted';

export interface MenuItem {
  title: string;
  icon: any;
  url: string;
  badge: string | null;
  isActive: boolean;
  available: boolean;
  adminOnly?: boolean;
  managementOnly?: boolean;
  salesOnly?: boolean;
  children?: MenuItem[];
  expandable?: boolean;
  tier?: MenuTier;
}

// Pojedynczy element - Panel Główny (bez kategorii)
export const dashboardItem: MenuItem = {
  title: 'Panel Główny',
  icon: LayoutDashboard,
  url: '/panel-glowny',
  badge: null,
  isActive: false,
  available: true,
  tier: 'primary',
};

// ── Kategoria AI ──
export const aiMenuItems: MenuItem[] = [
  {
    title: 'Personalny Asystent',
    icon: Sparkles,
    url: '/asystent-nextbyte',
    badge: null,
    isActive: false,
    available: true,
    tier: 'primary',
  },
  {
    title: 'Chat AI',
    icon: MessageSquare,
    url: '/chat-ai',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Pętle AI',
    icon: Repeat,
    url: '/petle',
    badge: 'NEW',
    isActive: false,
    available: true,
    tier: 'standard',
    adminOnly: true,
  },
  {
    title: 'PromptEx',
    icon: Wand2,
    url: '/prompt-ex',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Pamięć AI',
    icon: Brain,
    url: '/pamiec',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  
  {
    title: 'Automatyzacje',
    icon: Workflow,
    url: '/automatyzacje',
    badge: 'AI',
    isActive: false,
    available: true,
    tier: 'muted',
  },
  {
    title: 'Red Zone',
    icon: Skull,
    url: '/red-zone-v2',
    badge: null,
    isActive: false,
    available: true,
    managementOnly: true,
    tier: 'muted',
  },
];

// ── Kategoria STUDIO KREACJI ──
export const creationStudioItems: MenuItem[] = [
  {
    title: 'Studio Zdjęć',
    icon: Camera,
    url: '/studio-zdjec',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    // Studio Video — dostęp sterowany z Panelu Admina → Uprawnienia zakładek
    // (feature_permissions / FeatureGuard). Bez twardej flagi managementOnly, bo
    // ta nadpisywała ustawienie „wszyscy" w SidebarMenuSection (filtr roli działał
    // PRZED sprawdzeniem feature_permissions). Widoczność ⇒ panel, nie kod.
    title: 'Studio Video',
    icon: Video,
    url: '/studio-video',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
];

// ── Kategoria PRACA (dawniej GŁÓWNE + Firma) ──
export const mainMenuItems: MenuItem[] = [
  {
    title: 'Kalendarz',
    icon: CalendarDays,
    url: '/kalendarz',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Zadania',
    icon: CheckSquare,
    url: '/zadania',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Notatki',
    icon: StickyNote,
    url: '/notatki',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Tablice',
    icon: PenTool,
    url: '/tablice',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    /*
      NextCloud — eksplorator plików (moduł Kajetana, przeniesiony 1:1
      10.09.2026). Pozycja po Tablicach, bo to ta sama rodzina: rzeczy, które
      się tworzy i trzyma. Dane siedzą LOKALNIE w przeglądarce (localStorage
      + IndexedDB), więc zakładka działa bez żadnego wpisu w bazie.
    */
    title: 'NextCloud',
    icon: Cloud,
    url: '/nextcloud',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    // Talerz — planer posiłków (zdjęcie → AI → kalorie). Pozycja po Tablicach
    // zgodnie z decyzją Michała (11.08).
    title: 'Talerz',
    icon: UtensilsCrossed,
    url: '/talerz',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Listy Zakupowe',
    icon: ShoppingBasket,
    url: '/listy-zakupowe',
    badge: null,
    isActive: false,
    available: true,
    tier: 'muted',
  },
  // /subskrypcje przeniesione do huba /plan (Etap A.1 IA v1.3)

  {
    title: 'Firma',
    icon: Building2,
    url: '/firma',
    badge: null,
    isActive: false,
    available: true,
    tier: 'primary',
  },
];

// ── Kategoria SPOŁECZNOŚĆ ──
export const communityItems: MenuItem[] = [
  {
    title: 'Panel Twórcy',
    icon: Sparkles,
    url: '/panel-tworcy',
    badge: null,
    isActive: false,
    available: true,
    tier: 'standard',
  },
  {
    title: 'Analityka',
    icon: BarChart3,
    url: '/analityka',
    badge: null,
    isActive: false,
    available: true,
    tier: 'muted',
  },
  {
    title: 'Sklep',
    icon: ShoppingBag,
    url: '/sklep',
    badge: null,
    isActive: false,
    available: true,
    tier: 'muted',
  },
  {
    title: 'Akademia',
    icon: GraduationCap,
    url: '/akademia',
    badge: null,
    isActive: false,
    available: true,
    expandable: true,
    children: [],
    tier: 'muted',
  },
  {
    title: 'Aktualności',
    icon: Newspaper,
    url: '/aktualnosci',
    badge: null,
    isActive: false,
    available: true,
    tier: 'muted',
  },
];

// ── Kategoria ZARZĄDZANIE (role-gated, widoczna tylko gdy user ma uprawnienia) ──
export const toolsItems: MenuItem[] = [
  {
    title: 'Panel Handlowca',
    icon: Briefcase,
    url: '/handlowiec',
    badge: null,
    isActive: false,
    available: true,
    salesOnly: true,
    tier: 'standard',
  },
  {
    title: 'Zarząd',
    icon: Shield,
    url: '/zarzad',
    badge: null,
    isActive: false,
    available: true,
    managementOnly: true,
    tier: 'standard',
  },
  {
    title: 'Admin Panel',
    icon: Settings,
    url: '/admin-panel',
    badge: null,
    isActive: false,
    available: true,
    adminOnly: true,
    tier: 'standard',
  },
];
