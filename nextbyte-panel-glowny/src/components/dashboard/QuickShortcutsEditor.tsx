import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, ChevronRight, ArrowLeft, MessageSquare, FileText, SearchX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Szukajka } from '@/components/ui/pola';
import { Button } from '@/components/ui/button';
import { klasyKafelka, SZKLO } from '@/components/ui/tile';
import { Szkielet, PustyStan } from '@/components/ui/stany';
import { cn } from '@/lib/utils';
import {
  dashboardItem,
  aiMenuItems,
  creationStudioItems,
  mainMenuItems,
  communityItems,
  toolsItems,
  type MenuItem,
} from '@/components/sidebar/menuData';
import { useIsAdmin, useHasManagementRole, useIsSalesperson } from '@/hooks/useUserRoles';
import { useFeaturePermissions, useFilteredFeatures } from '@/hooks/useFeaturePermissions';
import { useUserCompanies, type UserCompany } from '@/hooks/useUserCompanies';
import { useCompanyCustomPages } from '@/hooks/useCompanyCustomPages';
import { useCompanyTools } from '@/hooks/useCompanyTools';
import { useMyToolPermissions } from '@/hooks/useMyToolPermissions';
import { useMyPagePermissions } from '@/hooks/useMyPagePermissions';
import {
  useUserQuickShortcuts,
  type QuickShortcut,
  type QuickShortcutInput,
} from '@/hooks/useUserQuickShortcuts';
import { ShortcutIcon } from './ShortcutIcon';
import { barwaDla } from './KafelekPodrozy';

interface Target {
  title: string;
  icon: string;
  url: string;
  source: 'platform' | 'company';
  company_id?: string | null;
}

const COMPANY_BASE_ITEMS: Array<{
  title: string;
  icon: string;
  url: string;
  requires?: 'canManageBytes' | 'isAdmin';
  toolPath?: string;
}> = [
  { title: 'Panel', icon: 'LayoutDashboard', url: 'panel' },
  { title: 'Pracownicy', icon: 'Users', url: 'pracownicy', toolPath: 'pracownicy' },
  { title: 'Finanse', icon: 'DollarSign', url: 'finanse', requires: 'canManageBytes' },
  { title: 'Narzędzia', icon: 'Briefcase', url: 'narzedzia' },
  { title: 'Dokumenty', icon: 'FileText', url: 'dokumenty' },
  { title: 'Zasoby', icon: 'Package', url: 'zasoby', requires: 'canManageBytes' },
  { title: 'Personalizacja', icon: 'Palette', url: 'personalizacja', requires: 'isAdmin' },
  { title: 'Ustawienia', icon: 'Settings', url: 'ustawienia', requires: 'isAdmin' },
  { title: 'Subskrypcja', icon: 'Crown', url: 'subskrypcja', requires: 'isAdmin' },
];

function usePlatformTargets(): Target[] {
  const { value: isAdmin } = useIsAdmin();
  const { value: hasManagement } = useHasManagementRole();
  const { value: isSales } = useIsSalesperson();
  const { data: allFeatures } = useFeaturePermissions();
  const { features: visibleFeatures } = useFilteredFeatures();

  return useMemo(() => {
    const all: MenuItem[] = [
      dashboardItem,
      ...aiMenuItems,
      ...creationStudioItems,
      ...mainMenuItems,
      ...communityItems,
      ...toolsItems,
    ];

    const managedPaths = new Set((allFeatures || []).map((f) => f.feature_path));
    const visiblePaths = new Set(visibleFeatures.map((f) => f.feature_path));

    // Pozycje jawnie wykluczone z Szybkiej Podróży (na życzenie usera).
    const EXCLUDED = new Set(['/automatyzacje', '/analityka', '/listy-zakupowe', '/subskrypcje']);

    return all
      .filter((it) => it.available !== false)
      .filter((it) => !EXCLUDED.has(it.url))
      .filter((it) => !it.adminOnly || isAdmin)
      .filter((it) => !it.managementOnly || hasManagement || isAdmin)
      .filter((it) => !it.salesOnly || isSales || isAdmin)
      .filter((it) => {
        // Admins always see everything (parity with sidebar).
        if (isAdmin) return true;
        // If the route is managed via admin's feature_permissions table —
        // it must also be visible there. Untracked routes pass through.
        if (managedPaths.has(it.url)) return visiblePaths.has(it.url);
        return true;
      })
      .map<Target>((it) => ({
        title: it.title,
        icon: (it.icon?.displayName || it.icon?.name || 'LayoutDashboard') as string,
        url: it.url,
        source: 'platform',
      }));
  }, [isAdmin, hasManagement, isSales, allFeatures, visibleFeatures]);
}

function CompanyTargetsList({
  company,
  search,
  onPick,
}: {
  company: UserCompany;
  search: string;
  onPick: (t: Target) => void;
}) {
  const { data: customPages } = useCompanyCustomPages(company.id);
  const { data: allTools } = useCompanyTools();
  const { data: toolPerms } = useMyToolPermissions(company.id);
  const { data: pagePerms } = useMyPagePermissions(company.id);

  const isOwnerOrAdmin = company.role === 'owner' || company.role === 'admin' || company.role === 'ghost_admin';
  const isFullToolAccess = isOwnerOrAdmin || !!toolPerms?.isFullAccess;
  const isFullPageAccess = isOwnerOrAdmin || !!pagePerms?.isFullAccess;

  const targets = useMemo<Target[]>(() => {
    const result: Target[] = [];

    COMPANY_BASE_ITEMS.forEach((it) => {
      if (it.requires === 'isAdmin' && !isOwnerOrAdmin) return;
      if (it.requires === 'canManageBytes' && !isOwnerOrAdmin) return;
      if (it.toolPath && !isFullToolAccess && !(toolPerms?.permissions || []).includes(it.toolPath)) return;
      result.push({
        title: it.title,
        icon: it.icon,
        url: `/firma/${company.slug}/${it.url}`,
        source: 'company',
        company_id: company.id,
      });
    });

    (allTools || []).forEach((tool) => {
      if (!isFullToolAccess && !(toolPerms?.permissions || []).includes(tool.path)) return;
      result.push({
        title: tool.display_name || tool.name,
        icon: tool.icon || 'Wrench',
        url: `/firma/${company.slug}/${tool.path}`,
        source: 'company',
        company_id: company.id,
      });
    });

    (customPages || []).forEach((page) => {
      if (!page.is_sidebar_visible) return;
      if (!isFullPageAccess && !(pagePerms?.pageIds || []).includes(page.id)) return;
      result.push({
        title: page.title,
        icon: page.icon || 'FileText',
        url: `/firma/${company.slug}/platforma/${page.slug}`,
        source: 'company',
        company_id: company.id,
      });
    });

    return result;
  }, [company.id, company.slug, isOwnerOrAdmin, isFullToolAccess, isFullPageAccess, toolPerms, pagePerms, customPages, allTools]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return targets;
    return targets.filter((t) => t.title.toLowerCase().includes(q));
  }, [targets, search]);

  return <TargetGrid items={filtered} onPick={onPick} />;
}

// URL roots for items that support deep-linking into sub-resources
const EXPANDABLE_URLS = new Set(['/chat-ai', '/notatki']);

function TargetGrid({
  items,
  onPick,
  onExpand,
}: {
  items: Target[];
  onPick: (t: Target) => void;
  onExpand?: (t: Target) => void;
}) {
  if (items.length === 0) {
    return (
      <PustyStan
        ikona={SearchX}
        tytul="Brak dostępnych pozycji"
        opis="Nic nie pasuje do filtra. Wyczyść wyszukiwanie albo przejdź na inną zakładkę, aby wybrać pozycję do przypięcia."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => {
        const expandable = !!onExpand && t.source === 'platform' && EXPANDABLE_URLS.has(t.url);
        return (
          <div
            key={`${t.source}-${t.url}`}
            className={cn(
              klasyKafelka({ interaktywny: true, zwarty: true }),
              'group relative flex-row items-center gap-3 p-3 text-left',
            )}
          >
            <button
              type="button"
              onClick={() => onPick(t)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              {/* Ta sama barwa co na kafelku i w slocie: wybór staje się
                  wzrokowy, a nie tekstowy — kolor mówi „to ten moduł". */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all"
                style={{
                  borderColor: `hsl(${barwaDla(t.url)}/0.30)`,
                  background: `hsl(${barwaDla(t.url)}/0.12)`,
                  color: `hsl(${barwaDla(t.url)})`,
                }}
              >
                <ShortcutIcon name={t.icon} className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{t.title}</div>
                <div className="truncate text-[11px] text-muted-foreground/70">{t.url}</div>
              </div>
            </button>
            {expandable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand!(t);
                }}
                title={t.url === '/chat-ai' ? 'Wybierz konwersację' : 'Wybierz notatkę'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============= Sub-resource pickers (conversations / notes) =============

interface SubItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string | null;
  pin: QuickShortcutInput;
}

function SubResourcePicker({
  kind,
  search,
  onPick,
  activeSlot,
}: {
  kind: 'chat' | 'notes';
  search: string;
  onPick: (payload: QuickShortcutInput) => void;
  activeSlot: number;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<SubItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      setItems(null);
      if (kind === 'chat') {
        const { data } = await supabase
          .from('chat_conversations')
          .select('id, title, last_message_at, conversation_mode')
          .eq('user_id', user.id)
          .eq('chat_type', 'personalized_ai')
          .eq('is_archived', false)
          .or('conversation_mode.is.null,conversation_mode.neq.nextbyte_assistant')
          .order('last_message_at', { ascending: false })
          .limit(100);
        if (cancelled) return;
        setItems(
          (data || []).map((c: any) => ({
            id: c.id,
            title: c.title || 'Bez tytułu',
            subtitle: c.last_message_at ? new Date(c.last_message_at).toLocaleDateString('pl-PL') : undefined,
            icon: 'MessageSquare',
            pin: {
              slot_index: activeSlot,
              title: c.title || 'Konwersacja',
              icon: 'MessageSquare',
              url: `/chat-ai?conv=${c.id}`,
              source: 'platform',
              company_id: null,
            },
          }))
        );
      } else {
        const { data } = await supabase
          .from('user_notes')
          .select('id, title, icon, updated_at')
          .is('deleted_at', null)
          .eq('user_id', user.id)
          .eq('is_archived', false)
          .order('updated_at', { ascending: false })
          .limit(100);
        if (cancelled) return;
        setItems(
          (data || []).map((n: any) => ({
            id: n.id,
            title: n.title || 'Bez tytułu',
            subtitle: n.updated_at ? new Date(n.updated_at).toLocaleDateString('pl-PL') : undefined,
            icon: n.icon || 'FileText',
            pin: {
              slot_index: activeSlot,
              title: n.title || 'Notatka',
              icon: 'FileText',
              url: `/notatki/${n.id}`,
              source: 'platform',
              company_id: null,
            },
          }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, user, activeSlot]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, search]);

  if (!filtered) {
    // Szkielet w kształcie docelowej siatki kafelków — nic nie skoczy, gdy dane dojdą
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Szkielet key={i} wierszy={1} ksztalt="blok" className="[&>span]:h-16" />
        ))}
      </div>
    );
  }
  if (filtered.length === 0) {
    return kind === 'chat' ? (
      <PustyStan
        ikona={MessageSquare}
        tytul="Brak konwersacji"
        opis="Tu pojawią się Twoje rozmowy z Chat AI do przypięcia. Zacznij pierwszą konwersację w Chat AI, a potem wróć tutaj."
      />
    ) : (
      <PustyStan
        ikona={FileText}
        tytul="Brak notatek"
        opis="Tu pojawią się Twoje notatki do przypięcia. Utwórz pierwszą notatkę w module Notatki, a potem wróć tutaj."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onPick(it.pin)}
          className={cn(
            klasyKafelka({ interaktywny: true, zwarty: true }),
            'group flex-row items-center gap-3 p-3 text-left',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 transition-all group-hover:bg-primary/20 group-hover:ring-primary/30">
            {kind === 'chat' ? (
              <MessageSquare className="h-4 w-4" />
            ) : it.icon && it.icon.length <= 4 ? (
              <span className="text-base leading-none">{it.icon}</span>
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">{it.title}</div>
            {it.subtitle && (
              <div className="truncate text-[11px] text-muted-foreground/70">{it.subtitle}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

interface QuickShortcutsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlot?: number;
}

export function QuickShortcutsEditor({ open, onOpenChange, initialSlot = 0 }: QuickShortcutsEditorProps) {
  const { shortcuts, setSlot, clearSlot } = useUserQuickShortcuts();
  const { data: companies } = useUserCompanies();
  const platformTargets = usePlatformTargets();

  const [activeSlot, setActiveSlot] = useState(initialSlot);
  const [activeTab, setActiveTab] = useState<string>('platform');
  const [search, setSearch] = useState('');
  const [subView, setSubView] = useState<null | { kind: 'chat' | 'notes'; title: string }>(null);

  React.useEffect(() => {
    if (open) {
      setActiveSlot(initialSlot);
      setSearch('');
      setSubView(null);
    }
  }, [open, initialSlot]);

  const tabs = useMemo(() => {
    const base = [{ key: 'platform', label: 'Platforma' }];
    (companies || []).forEach((c) => {
      base.push({ key: `c:${c.id}`, label: c.name });
    });
    return base;
  }, [companies]);

  const filteredPlatform = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return platformTargets;
    return platformTargets.filter((t) => t.title.toLowerCase().includes(q));
  }, [platformTargets, search]);

  const handlePick = async (t: Target) => {
    const payload: QuickShortcutInput = {
      slot_index: activeSlot,
      title: t.title,
      icon: t.icon,
      url: t.url,
      source: t.source,
      company_id: t.company_id ?? null,
    };
    await setSlot(payload);
    const next = shortcuts.findIndex((s, i) => i > activeSlot && !s);
    if (next !== -1) setActiveSlot(next);
  };

  const handleSubPick = async (payload: QuickShortcutInput) => {
    await setSlot({ ...payload, slot_index: activeSlot });
    setSubView(null);
    setSearch('');
    const next = shortcuts.findIndex((s, i) => i > activeSlot && !s);
    if (next !== -1) setActiveSlot(next);
  };

  const handleExpand = (t: Target) => {
    if (t.url === '/chat-ai') setSubView({ kind: 'chat', title: 'Chat AI — konwersacje' });
    else if (t.url === '/notatki') setSubView({ kind: 'notes', title: 'Notatki — wybierz' });
    setSearch('');
  };

  const handleClearActive = async () => {
    if (shortcuts[activeSlot]) await clearSlot(activeSlot);
  };

  const activeCompany = activeTab.startsWith('c:')
    ? companies?.find((c) => `c:${c.id}` === activeTab)
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Materiał okna = SZKLO; stary przepis (bg-background/70 + backdrop-blur)
        // musiał zniknąć, bo klasa narzędziowa wygrywa z .nb-szklo.
        className={cn(
          'p-0 gap-0 overflow-hidden flex flex-col rounded-2xl',
          'w-[calc(100vw-1rem)] sm:w-[95vw] max-w-3xl',
          'h-[calc(100dvh-1rem)] max-h-[720px] sm:h-auto sm:max-h-[85vh]',
          'border-primary/25',
          SZKLO,
        )}
      >
        {/* NextByte glass accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <DialogHeader className="relative border-b border-border/30 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <DialogTitle className="text-base sm:text-lg">Szybka Podróż — edycja</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Wybierz slot u góry, a następnie kliknij pozycję z listy poniżej, aby ją przypiąć.
          </DialogDescription>
        </DialogHeader>

        {/* Slot strip */}
        <div className="relative px-4 pt-3 sm:px-6 sm:pt-4">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
            {shortcuts.map((s, i) => {
              const isActive = i === activeSlot;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlot(i)}
                  className={cn(
                    klasyKafelka({
                      interaktywny: true,
                      zwarty: true,
                      intencja: isActive ? 'akcent' : 'neutralna',
                    }),
                    'group relative h-16 sm:h-20 items-center justify-center gap-1 rounded-xl p-1.5 sm:p-2 text-center',
                    // Aktywny slot: mocniejsza obwódka + pierścień zamiast ręcznego cienia
                    isActive && 'border-primary/60 ring-2 ring-primary/40',
                  )}
                >
                  {s ? (
                    <>
                      {/* Slot pokazuje BARWĘ MODUŁU i poświatę od dołu — dokładnie
                          to, co powstanie z niego na panelu. Wcześniej każdy slot
                          był tym samym błękitem, więc rząd sześciu w oknie edycji
                          wyglądał inaczej niż rząd sześciu na pulpicie i trzeba
                          było czytać podpisy, żeby wiedzieć, co się edytuje. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-xl opacity-80"
                        style={{
                          background: `radial-gradient(120% 80% at 50% 112%, hsl(${barwaDla(s.url)}/0.34) 0%, hsl(${barwaDla(s.url)}/0.10) 42%, transparent 74%)`,
                        }}
                      />
                      <div
                        className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: `hsl(${barwaDla(s.url)}/0.35)`,
                          background: `hsl(${barwaDla(s.url)}/0.14)`,
                          color: `hsl(${barwaDla(s.url)})`,
                        }}
                      >
                        <ShortcutIcon name={s.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="relative line-clamp-1 px-0.5 text-[9px] sm:text-[10px] font-medium text-foreground">{s.title}</div>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60" />
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground/60">Slot {i + 1}</div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="text-[11px] sm:text-xs text-muted-foreground">
              Aktywny slot: <span className="font-medium text-foreground">{activeSlot + 1}</span>
            </div>
            {shortcuts[activeSlot] && (
              <Button variant="usun" size="sm" onClick={handleClearActive} className="h-7 gap-1 text-[11px] sm:text-xs">
                <X className="h-3 w-3" /> Usuń
              </Button>
            )}
          </div>
        </div>

        {/* Animated tabs */}
        <div className="relative mt-2 sm:mt-3">
          <div
            className="relative flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border/30 px-4 pb-px sm:px-6 scrollbar-none touch-pan-x overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'relative shrink-0 rounded-t-md px-2.5 py-2 text-xs sm:text-sm transition-colors whitespace-nowrap',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t.label}
                  {isActive && (
                    <motion.div
                      layoutId="quick-shortcut-tab-underline"
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative px-4 pt-3 sm:px-6">
          <Szukajka
            wartosc={search}
            onZmiana={setSearch}
            rozmiar="zwarte"
            placeholder="Filtruj pozycje..."
          />
        </div>

        {/* List */}
        <div
          className="relative flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 pt-3 sm:px-6 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="pb-4">
            {subView && (
              <div className="mb-3 flex items-center justify-between gap-2">
                <Button
                  variant="obwodka"
                  size="sm"
                  onClick={() => { setSubView(null); setSearch(''); }}
                  className="h-8 gap-1.5 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Wróć
                </Button>
                <div className="text-xs sm:text-sm font-medium text-foreground">{subView.title}</div>
                <div className="w-16" />
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={subView ? `sub:${subView.kind}` : activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {subView ? (
                  <SubResourcePicker
                    kind={subView.kind}
                    search={search}
                    onPick={handleSubPick}
                    activeSlot={activeSlot}
                  />
                ) : (
                  <>
                    {activeTab === 'platform' && (
                      <TargetGrid items={filteredPlatform} onPick={handlePick} onExpand={handleExpand} />
                    )}
                    {activeCompany && (
                      <CompanyTargetsList company={activeCompany} search={search} onPick={handlePick} />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative flex items-center justify-end gap-2 border-t border-border/30 px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="mr-auto flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-primary" />
            <span className="hidden sm:inline">Zmiany zapisują się automatycznie.</span>
            <span className="sm:hidden">Auto-zapis</span>
          </div>
          <Button variant="glass" size="sm" onClick={() => onOpenChange(false)}>
            Gotowe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
