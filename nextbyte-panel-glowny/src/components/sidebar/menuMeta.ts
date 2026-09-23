import {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  HelpCircle,
  StickyNote,
  PenTool,
  FileText,
  Settings,
  GraduationCap,
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
  CreditCard,
  Workflow,
  Briefcase,
  Skull,
  Shield,
  User,
  Crown,
  Brain,
  Wand2,
  Video,
} from 'lucide-react';

/**
 * Centralised metadata for every route — used by Favorites/Recent
 * to render a known title + icon for any visited URL.
 */
export interface RouteMeta {
  title: string;
  icon: any;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/panel-glowny': { title: 'Panel Główny', icon: LayoutDashboard },
  '/asystent-nextbyte': { title: 'Personalny Asystent', icon: Sparkles },
  '/red-zone-v2': { title: 'Red Zone', icon: Skull },
  '/chat-ai': { title: 'Chat AI', icon: MessageSquare },
  '/studio-zdjec': { title: 'Studio Zdjęć', icon: Camera },
  '/studio-video': { title: 'Studio Video', icon: Video },
  '/automatyzacje': { title: 'Automatyzacje', icon: Workflow },
  '/kalendarz': { title: 'Kalendarz', icon: CalendarDays },
  '/zadania': { title: 'Zadania', icon: CheckSquare },
  '/notatki': { title: 'Notatki', icon: StickyNote },
  '/tablice': { title: 'Tablice', icon: PenTool },
  '/listy-zakupowe': { title: 'Listy Zakupowe', icon: ShoppingBasket },
  '/subskrypcje': { title: 'Subskrypcje', icon: CreditCard },
  '/plan': { title: 'Plan i Bytes', icon: Crown },
  '/pamiec': { title: 'Pamięć AI', icon: Brain },
  '/ustawienia': { title: 'Ustawienia', icon: Settings },
  '/prompt-ex': { title: 'PromptEx', icon: Wand2 },
  '/firma': { title: 'Firma', icon: Building2 },
  '/panel-tworcy': { title: 'Panel Twórcy', icon: Sparkles },
  '/analityka': { title: 'Analityka', icon: BarChart3 },
  '/roadmapa': { title: 'Roadmapa', icon: Newspaper },
  '/aktualnosci': { title: 'Aktualności', icon: FileText },
  '/sklep': { title: 'Sklep', icon: ShoppingBag },
  '/akademia': { title: 'Akademia', icon: GraduationCap },
  '/wsparcie': { title: 'Pomoc i Wsparcie', icon: HelpCircle },
  '/handlowiec': { title: 'Panel Handlowca', icon: Briefcase },
  '/zarzad': { title: 'Zarząd', icon: Shield },
  '/admin-panel': { title: 'Admin Panel', icon: Settings },
  '/konto': { title: 'Konto', icon: User },
  '/premium': { title: 'Premium', icon: Crown },
};

export const getRouteMeta = (path: string): RouteMeta => {
  if (ROUTE_META[path]) return ROUTE_META[path];
  // Fallback for nested paths — find best matching prefix
  const prefix = Object.keys(ROUTE_META)
    .filter((p) => path.startsWith(p + '/'))
    .sort((a, b) => b.length - a.length)[0];
  if (prefix) return ROUTE_META[prefix];
  return { title: path.replace('/', '') || 'Strona', icon: FileText };
};
