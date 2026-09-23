import React, { useState, useEffect } from 'react';
import { DEFAULT_PATTERN } from '@/hooks/useProfilePatterns';
import { ThemePreviewMini } from '@/components/ui/ThemePreviewMini';
import { useNavigationMode } from '@/contexts/NavigationModeContext';
import { usePillNavbarAccess } from '@/hooks/usePillNavbarAccess';
import { useUserThemes } from '@/hooks/useUserThemes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAvatarDecorations } from '@/hooks/useAvatarDecorations';
import { useProfilePatterns } from '@/hooks/useProfilePatterns';
import { usePatternLocations, PATTERN_LOCATIONS, type PatternLocationKey } from '@/hooks/usePatternLocations';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Lock, Palette, Loader2, Check, ShieldCheck, Sun, Frame, Image, Grid3X3, PanelLeft, Settings2, ChevronDown } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useUserRoles';
import AnimatedTabs from '@/components/ui/AnimatedTabs';
import { NextByteCard, NextByteInfoSection } from '@/components/ui/nextbyte-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PatternBackground } from '@/components/ui/background-patterns';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Pattern location settings component
const PatternLocationSettings = () => {
  const { locations, toggleLocation } = usePatternLocations();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-6">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group">
        <Settings2 className="w-4 h-4" />
        <span className="font-medium">Zaawansowane</span>
        <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform duration-200", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="rounded-xl border border-border/40 nb-szklo nb-szklo-plynne p-4 space-y-1">
          <p className="text-xs text-muted-foreground mb-3">Wybierz, gdzie wzory mają się wyświetlać w tle:</p>
          {(Object.entries(PATTERN_LOCATIONS) as [PatternLocationKey, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/20 transition-colors">
              <span className="text-sm">{label}</span>
              <Switch
                checked={locations[key]}
                onCheckedChange={() => toggleLocation(key)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function AppearanceTab() {
  const { navMode, setNavMode } = useNavigationMode();
  const { canUsePillNavbar, isLoading } = usePillNavbarAccess();
  const { user } = useAuthContext();
  const {
    purchasedThemes,
    shopThemes,
    activeTheme,
    isActive: isThemeActive,
    isPurchased,
    activateTheme,
    isActivating,
    loading: themesLoading,
  } = useUserThemes(user?.id);
  const { value: isAdmin } = useIsAdmin();

  // Personalization hooks
  const { purchasedDecorations, setActiveDecoration, isActive: isDecorationActive } = useAvatarDecorations(user?.id || '');
  const {
    patterns,
    purchasedPatterns,
    activePatternId,
    setActivePattern,
    isActive: isPatternActive,
  } = useProfilePatterns(user?.id || '');

  const isDefaultPatternActive = activePatternId === null;
  const purchasedPatternObjects = patterns.filter(p => purchasedPatterns.includes(p.id));

  /* Tła (obrazkowe tapety) usunięte z platformy decyzją Michała 04.08.2026 —
     „rezygnujemy z tego". Wzory i motywy zostają. */
  const [activeTab, setActiveTab] = useState<'navigation' | 'decorations' | 'patterns' | 'themes'>('navigation');

  return (
    <div className="py-4 space-y-3">
      <div className="w-full">
        <AnimatedTabs
          tabs={[
            { value: 'navigation', label: 'Nawigacja', icon: <PanelLeft className="w-3.5 h-3.5" /> },
            { value: 'decorations', label: 'Dekoracje', icon: <Frame className="w-3.5 h-3.5" /> },
            { value: 'patterns', label: 'Wzory', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
            { value: 'themes', label: 'Motywy', icon: <Palette className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as any)}
          layoutId="appearance-settings-tabs"
          mobileColumns={3}
          className="mb-4"
        />

        {/* Navigation tab */}
        {activeTab === 'navigation' && (<div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Styl nawigacji</h3>
            <div className="grid grid-cols-2 gap-2.5 max-w-xs">
              {/* Sidebar */}
              <button
                onClick={() => setNavMode('sidebar')}
                className={cn(
                  'relative rounded-lg border p-2 transition-all duration-150 text-left',
                  navMode === 'sidebar'
                    ? 'ring-1.5 ring-primary border-primary/40'
                    : 'border-border/40 hover:border-border/60'
                )}
              >
                <div className="aspect-[4/3] rounded bg-background border border-border/30 overflow-hidden mb-1.5 flex">
                  <div className="w-[28%] h-full bg-primary/30 border-r border-primary/40 p-1 space-y-0.5">
                    <div className="w-full h-1.5 rounded-full bg-primary/80" />
                    <div className="w-3/4 h-1 rounded-full bg-primary/50" />
                    <div className="w-full h-1 rounded-full bg-primary/50" />
                    <div className="w-2/3 h-1 rounded-full bg-primary/40" />
                  </div>
                  <div className="flex-1 p-1.5 space-y-1">
                    <div className="w-3/4 h-1.5 rounded-sm bg-foreground/[0.12]" />
                    <div className="w-full h-1 rounded-sm bg-foreground/[0.06]" />
                    <div className="w-1/2 h-1 rounded-sm bg-foreground/[0.06]" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-foreground">Pasek boczny</span>
                {navMode === 'sidebar' && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>

              {/* Pill Navbar */}
              <button
                onClick={() => canUsePillNavbar && setNavMode('pillnav')}
                disabled={!canUsePillNavbar && !isLoading}
                className={cn(
                  'relative rounded-lg border p-2 transition-all duration-150 text-left',
                  !canUsePillNavbar && !isLoading && 'opacity-40 cursor-not-allowed',
                  navMode === 'pillnav'
                    ? 'ring-1.5 ring-primary border-primary/40'
                    : canUsePillNavbar
                      ? 'border-border/40 hover:border-border/60'
                      : 'border-border/20'
                )}
              >
                {!canUsePillNavbar && !isLoading && (
                  <div className="absolute inset-0 rounded-lg flex items-center justify-center z-10">
                    <div className="flex items-center gap-1 text-muted-foreground bg-background/80 px-2 py-1 rounded text-[10px]">
                      <Lock className="w-3 h-3" />
                      <span>Niedostępne</span>
                    </div>
                  </div>
                )}
                <div className="aspect-[4/3] rounded bg-background border border-border/30 overflow-hidden mb-1.5 flex flex-col">
                  <div className="px-2 pt-1.5 pb-1 flex justify-center">
                    <div className="w-[85%] h-3 rounded-full bg-primary/35 border border-primary/50 flex items-center justify-center gap-1 px-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/90" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    </div>
                  </div>
                  <div className="flex-1 px-1.5 pb-1.5 space-y-1">
                    <div className="w-3/4 h-1.5 rounded-sm bg-foreground/[0.12]" />
                    <div className="w-full h-1 rounded-sm bg-foreground/[0.06]" />
                    <div className="w-1/2 h-1 rounded-sm bg-foreground/[0.06]" />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-foreground">Pill Navbar</span>
                {navMode === 'pillnav' && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>)}

        {/* Decorations tab */}
        {activeTab === 'decorations' && (<div>
          <NextByteInfoSection
            title={`Twoje dekoracje (${purchasedDecorations.length})`}
            icon={<Frame className="w-4 h-4" />}
          >
            {purchasedDecorations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych dekoracji</p>
                <p className="text-sm text-muted-foreground">Odwiedź sklep, aby zakupić nowe dekoracje!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {purchasedDecorations?.map((purchase: any) => {
                  const decoration = purchase.avatar_decorations;
                  if (!decoration) return null;
                  const active = isDecorationActive(decoration.id);
                  return (
                    <NextByteCard 
                      key={purchase.id}
                      className={`p-4 relative transition-all duration-300 hover:scale-105 ${
                        active ? 'ring-2 ring-primary shadow-lg shadow-primary/30' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
                          {decoration.preview_url || decoration.decoration_url ? (
                            <img src={decoration.preview_url || decoration.decoration_url} alt={decoration.name} className="w-full h-full object-contain" />
                          ) : (
                            <Frame className="w-10 h-10 text-primary/50" />
                          )}
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-sm font-medium line-clamp-2 mb-2">{decoration.name}</p>
                        </div>
                        <Button onClick={() => setActiveDecoration(active ? null : decoration.id)} size="sm" variant="obwodka" className="w-full">
                          {active ? 'Dezaktywuj' : 'Aktywuj'}
                        </Button>
                      </div>
                    </NextByteCard>
                  );
                })}
              </div>
            )}
          </NextByteInfoSection>
        </div>)}

        {/* Patterns tab */}
        {activeTab === 'patterns' && (<div>
          <NextByteInfoSection
            title={`Twoje wzory (${purchasedPatternObjects.length + 1})`}
            icon={<Grid3X3 className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Default Tech Grid — always available */}
              <NextByteCard
                className={cn(
                  "overflow-hidden transition-all duration-300 hover:scale-105",
                  isDefaultPatternActive && "ring-2 ring-primary shadow-lg shadow-primary/30"
                )}
              >
                <div className="relative aspect-video bg-background overflow-hidden">
                  <PatternBackground
                    pattern_type={DEFAULT_PATTERN.pattern_type}
                    pattern_color={DEFAULT_PATTERN.pattern_color}
                    pattern_size={DEFAULT_PATTERN.pattern_size}
                    pattern_opacity={DEFAULT_PATTERN.pattern_opacity}
                    background_color={DEFAULT_PATTERN.background_color}
                    fade={DEFAULT_PATTERN.fade}
                  />
                  {isDefaultPatternActive && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground"><Check className="w-3 h-3 mr-1" />Aktywne</Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="border-primary/30 bg-background/60 text-xs">Domyślny</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-medium line-clamp-1">{DEFAULT_PATTERN.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{DEFAULT_PATTERN.description}</p>
                  </div>
                  <Button onClick={() => setActivePattern(null)} size="sm" variant="obwodka" className="w-full" disabled={isDefaultPatternActive}>
                    {isDefaultPatternActive ? 'Aktywne' : 'Aktywuj'}
                  </Button>
                </div>
              </NextByteCard>

              {/* Purchased patterns */}
              {purchasedPatternObjects.map((pattern) => {
                const active = isPatternActive(pattern.id);
                return (
                  <NextByteCard
                    key={pattern.id}
                    className={cn(
                      "overflow-hidden transition-all duration-300 hover:scale-105",
                      active && "ring-2 ring-primary shadow-lg shadow-primary/30"
                    )}
                  >
                    <div className="relative aspect-video bg-background overflow-hidden">
                      <PatternBackground
                        pattern_type={pattern.pattern_type}
                        pattern_color={pattern.pattern_color}
                        pattern_size={pattern.pattern_size}
                        pattern_opacity={pattern.pattern_opacity}
                        background_color={pattern.background_color}
                        fade={pattern.fade}
                      />
                      {active && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary text-primary-foreground"><Check className="w-3 h-3 mr-1" />Aktywne</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-medium line-clamp-1">{pattern.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{pattern.description}</p>
                      </div>
                      <Button onClick={() => setActivePattern(active ? null : pattern.id)} size="sm" variant="obwodka" className="w-full">
                        {active ? 'Dezaktywuj' : 'Aktywuj'}
                      </Button>
                    </div>
                  </NextByteCard>
                );
              })}
            </div>
            <PatternLocationSettings />
          </NextByteInfoSection>
        </div>)}

        {/* Themes tab */}
        {activeTab === 'themes' && (<div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-primary" />
              Motyw kolorystyczny
            </h3>
            {themesLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : (
              <ThemeGrid
                purchasedThemes={purchasedThemes}
                isThemeActive={isThemeActive}
                activateTheme={activateTheme}
                isActivating={isActivating}
                activeTheme={activeTheme}
                isAdmin={isAdmin}
                shopThemes={shopThemes}
                isPurchased={isPurchased}
              />
            )}
          </div>
        </div>)}
      </div>
    </div>
  );
}

// Sub-component for theme grid with live color previews
function ThemeGrid({
  purchasedThemes,
  isThemeActive,
  activateTheme,
  isActivating,
  activeTheme,
  isAdmin,
  shopThemes,
  isPurchased,
}: {
  purchasedThemes: any[];
  isThemeActive: (id: string) => boolean;
  activateTheme: (id: string | null) => void;
  isActivating: boolean;
  activeTheme: any;
  isAdmin: boolean;
  shopThemes: any[];
  isPurchased: (id: string) => boolean;
}) {
  const unpurchasedThemes = isAdmin ? shopThemes.filter(t => !isPurchased(t.id)) : [];
  const [colors, setColors] = useState<Record<string, { primary: string; bg: string; card: string; accent: string }>>({});

  useEffect(() => {
    const allThemeIds = [
      ...purchasedThemes.map(p => p.theme_id),
      ...unpurchasedThemes.map(t => t.id),
    ];
    const load = async () => {
      const result: Record<string, any> = {};
      for (const themeId of allThemeIds) {
        const { data } = await supabase
          .from('color_settings')
          .select('css_variable, hsl_value')
          .eq('theme_id', themeId);
        if (data) {
          const map = Object.fromEntries(data.map((d: any) => [d.css_variable, d.hsl_value]));
          result[themeId] = {
            primary: map['--primary'] || '210 100% 50%',
            bg: map['--background'] || '0 0% 0%',
            card: map['--card'] || '0 0% 5%',
            accent: map['--accent'] || '210 100% 50%',
          };
        }
      }
      setColors(result);
    };
    if (allThemeIds.length > 0) load();
  }, [purchasedThemes, unpurchasedThemes.length]);

  /* 08.09.2026: te dwa hooki stały POD wczesnym `return` dla pustej listy motywów.
     Gdy lista zmieniała się z 0 na 1 przy zamontowanym komponencie (zakup w drugiej
     karcie + refetch), React rzucał „Rendered more hooks" i cała zakładka padała. */
  const [currentDomTheme, setCurrentDomTheme] = useState(() => 
    document.documentElement.getAttribute('data-theme') || ''
  );
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentDomTheme(document.documentElement.getAttribute('data-theme') || '');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (purchasedThemes.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl border border-border/30 bg-card/20">
        <Palette className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych motywów</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Odwiedź sklep, aby kupić motyw</p>
      </div>
    );
  }

  const isDefaultDarkActive = !activeTheme && !currentDomTheme.includes('light');

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {/* Default dark */}
        <button
          onClick={() => !isActivating && activateTheme(null)}
          disabled={isActivating}
          className={cn(
            'relative rounded-lg border p-2 transition-all duration-150 text-left',
            isDefaultDarkActive
              ? 'ring-1.5 ring-primary border-primary/40'
              : 'border-border/40 hover:border-border/60'
          )}
        >
          <ThemePreviewMini
            bg="hsl(0,0%,3%)"
            primary="hsl(207 90% 72%)"
            card="hsl(0 0% 7%)"
            accent="hsl(207 90% 72%)"
          />
          <span className="text-[11px] font-medium text-foreground leading-tight">Domyślny Ciemny</span>
          {isDefaultDarkActive && (
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-2 h-2 text-primary-foreground" />
            </div>
          )}
        </button>

        {/* Light theme option */}
        <LightThemeButton
          activateTheme={activateTheme}
          isActivating={isActivating}
          activeTheme={activeTheme}
        />

        {purchasedThemes.filter((p: any) => p.theme?.name !== 'nextbyte-light' && p.theme?.name !== 'light-apple' && p.theme?.name !== 'dark-theme').map((purchase: any) => {
          const theme = purchase.theme;
          const active = isThemeActive(theme.id);
          const c = colors[theme.id];

          return (
            <button
              key={purchase.id}
              onClick={() => !isActivating && activateTheme(active ? null : theme.id)}
              disabled={isActivating}
              className={cn(
                'relative rounded-lg border p-2 transition-all duration-150 text-left',
                active
                  ? 'ring-1.5 ring-primary border-primary/40'
                  : 'border-border/40 hover:border-border/60'
              )}
            >
              <ThemePreviewMini
                bg={c ? `hsl(${c.bg})` : 'hsl(0 0% 5%)'}
                primary={c ? `hsl(${c.primary})` : 'hsl(var(--primary))'}
                card={c ? `hsl(${c.card})` : 'hsl(var(--card))'}
                accent={c ? `hsl(${c.accent})` : 'hsl(var(--primary))'}
              />
              <span className="text-[11px] font-medium text-foreground truncate block">{theme.display_name}</span>
              {active && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin-only: all unpurchased themes for testing */}
      {isAdmin && unpurchasedThemes.length > 0 && (
        <>
          <div className="border-t border-border/20 my-3" />
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[10px] font-medium text-yellow-500/80">Admin — test</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {unpurchasedThemes.map((theme: any) => {
              const c = colors[theme.id];
              return (
                <button
                  key={theme.id}
                  onClick={async () => {
                    const { data } = await supabase
                      .from('color_settings')
                      .select('css_variable, hsl_value')
                      .eq('theme_id', theme.id);
                    if (data) {
                      data.forEach((d: any) => {
                        document.documentElement.style.setProperty(d.css_variable, d.hsl_value);
                      });
                      const bg = data.find((d: any) => d.css_variable === '--background');
                      if (bg) document.body.style.background = `hsl(${bg.hsl_value})`;
                    }
                  }}
                  className={cn(
                    'relative rounded-lg border p-2 transition-all duration-150 text-left',
                    'border-border/30 hover:border-border/50'
                  )}
                >
                  <ThemePreviewMini
                    bg={c ? `hsl(${c.bg})` : 'hsl(0 0% 5%)'}
                    primary={c ? `hsl(${c.primary})` : 'hsl(var(--primary))'}
                    card={c ? `hsl(${c.card})` : 'hsl(var(--card))'}
                    accent={c ? `hsl(${c.accent})` : 'hsl(var(--primary))'}
                  />
                  <span className="text-[11px] font-medium text-foreground truncate block">{theme.display_name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

// Light theme button
function LightThemeButton({
  activateTheme,
  isActivating,
  activeTheme,
}: {
  activateTheme: (id: string | null) => void;
  isActivating: boolean;
  activeTheme: any;
}) {
  const [lightThemeId, setLightThemeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLightTheme = async () => {
      const { data } = await supabase
        .from('color_themes')
        .select('id')
        .eq('name', 'nextbyte-light')
        .eq('is_active', true)
        .maybeSingle();
      if (data) setLightThemeId(data.id);
    };
    fetchLightTheme();
  }, []);

  if (!lightThemeId) return null;

  const domTheme = document.documentElement.getAttribute('data-theme') || '';
  const isActive = activeTheme?.theme_id === lightThemeId || (!activeTheme && domTheme.includes('light'));

  return (
    <button
      onClick={() => !isActivating && activateTheme(isActive ? null : lightThemeId)}
      disabled={isActivating}
      className={cn(
        'relative rounded-lg border p-2 transition-all duration-150 text-left',
        isActive
          ? 'ring-1.5 ring-primary border-primary/40'
          : 'border-border/40 hover:border-border/60'
      )}
    >
      <ThemePreviewMini
        bg="hsl(228 33% 97%)"
        primary="hsl(213 60% 50%)"
        card="hsl(228 25% 93%)"
        accent="hsl(213 60% 50%)"
        isLight
      />
      <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
        <Sun className="w-3 h-3" />
        Domyślny Jasny
      </span>
      {isActive && (
        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-2 h-2 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

// Re-export shared component
export { ThemePreviewMini } from '@/components/ui/ThemePreviewMini';
