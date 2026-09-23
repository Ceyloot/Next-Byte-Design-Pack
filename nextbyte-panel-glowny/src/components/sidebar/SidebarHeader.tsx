import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bot, PanelLeftClose, PanelLeft, Sun, Moon } from 'lucide-react';
import { SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { useSiteAsset } from '@/hooks/useSiteAsset';
import { getAssetUrl } from '@/lib/assetUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const useIsLimeTheme = () => {
  const [isLime, setIsLime] = useState(() => document.documentElement.getAttribute('data-theme') === 'lime-green');
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLime(document.documentElement.getAttribute('data-theme') === 'lime-green');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return isLime;
};

/**
 * Detects if the current theme is "light" by checking background lightness.
 */
const useIsLightTheme = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      // Parse HSL: "H S% L%" — if lightness > 50% it's light
      const match = bg.match(/(\d+(?:\.\d+)?)%\s*$/);
      setIsLight(match ? Number(match[1]) > 50 : false);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });
    window.addEventListener('themeChanged', check);
    return () => { observer.disconnect(); window.removeEventListener('themeChanged', check); };
  }, []);

  return isLight;
};

export function AppSidebarHeader() {
  const { data: logoAsset } = useSiteAsset('sidebar_logo');
  const { state, toggleSidebar, isMobile, hoverExpanded, open, setOpen, setHoverExpanded } = useSidebar();
  const isLime = useIsLimeTheme();
  const isLight = useIsLightTheme();
  const { user } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  const isCollapsed = state === 'collapsed';

  const handleToggleClick = () => {
    if (hoverExpanded) {
      setHoverExpanded(false);
      setOpen(true);
    } else {
      toggleSidebar();
    }
  };

  const handleThemeToggle = useCallback(async () => {
    if (isToggling) return;
    window.dispatchEvent(new CustomEvent('themeChanged'));
    if (!user) return;
    setIsToggling(true);
    try {
      // Find the two default themes by known names
      const { data: defaults } = await supabase
        .from('color_themes')
        .select('id, name')
        .in('name', ['dark-theme', 'future-theme', 'nextbyte-light'])
        .eq('is_active', true);

      if (!defaults || defaults.length < 2) {
        setIsToggling(false);
        return;
      }

      const darkTheme = defaults.find(t => t.name === 'dark-theme')!;
      const lightTheme = defaults.find(t => t.name === 'future-theme') || defaults.find(t => t.name === 'nextbyte-light')!;
      const targetTheme = isLight ? darkTheme : lightTheme;

      // Deactivate all user themes first
      await supabase
        .from('user_purchased_themes' as any)
        .update({ is_active: false } as any)
        .eq('user_id', user.id);

      // Check if target theme entry exists
      const { data: existing } = await supabase
        .from('user_purchased_themes' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('theme_id', targetTheme.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_purchased_themes' as any)
          .update({ is_active: true } as any)
          .eq('user_id', user.id)
          .eq('theme_id', targetTheme.id);
      } else {
        await supabase
          .from('user_purchased_themes' as any)
          .insert({ user_id: user.id, theme_id: targetTheme.id, is_active: true } as any);
      }

      // Clear cache and trigger re-apply
      try {
        localStorage.removeItem('nextbyte_theme_colors');
        localStorage.removeItem('nextbyte_theme_colors_name');
        localStorage.removeItem('nextbyte_theme_expiry');
      } catch {}
      window.dispatchEvent(new CustomEvent('themeChanged'));
    } catch (err) {
      console.error('[ThemeToggle] Error:', err);
    } finally {
      setIsToggling(false);
    }
  }, [user, isToggling, isLight]);

  return (
    <SidebarHeader className="px-3 py-3 relative z-10">
      {/* Glass separator beneath header */}
      <div className="pointer-events-none absolute bottom-0 inset-x-3 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      {/* MAPOWANIE 1:1 (07.09.2026): ten sam wiersz w obu stanach — znak
          40 px w tym samym miejscu, napis i przełączniki tylko gasną w szynie
          (wracają po najechaniu, bo szyna rozwija się sama). Wcześniej
          zwinięcie zmniejszało znak do 32 px i układało przełączniki w kolumnę
          pod nim, więc nagłówek zmieniał wysokość i wszystko niżej skakało. */}
      <div className="flex items-center justify-between">
        <Link
          to="/panel-glowny"
          className="flex items-center hover:opacity-90 transition-opacity min-w-0 space-x-2.5"
        >
          {/*
            ── ZNAK Z EKRANU LOGOWANIA ──────────────────────────────────────
            Decyzja Michała (17.08): kafelek i napis mają wyglądać tak, jak
            w prawej kolumnie `/login` (Auth.tsx:1052-1062). Ten tutaj był
            RĘCZNIE ULEPIONYM duplikatem tamtego pomysłu — neutralna szarość
            zamiast tintu marki, własny cień zamiast materiału z biblioteki
            i `object-cover`, które przycinało literę N zamiast ją pokazać.

            Cztery różnice, które składały się na „gorzej wygląda":
              1. halo OKRĄGŁE i szersze (blur-2xl scale-150) zamiast
                 prostokątnego blur-xl scale-125 — stąd miękkość
              2. tint marki `from-primary/20 to-primary/5` + `border-primary/30`
                 zamiast `foreground/[0.08]` + `border-foreground/15`
              3. `object-contain` — logo w całości, z oddechem; `object-cover`
                 kadrowało je do wypełnienia kwadratu
              4. napis solidnym `text-foreground` wersalikami, nie `gradient-text`

            KLASY PRZEPISANE Z `/login` CO DO JEDNEJ — i to jest celowe,
            mimo że `from-primary/20` wygląda w kodzie na mocny niebieski.

            Bo on się NIE WYKONA. Kafelek na `/login` leży w karcie, która sama
            jest szybą (Auth.tsx:636 `nb-szklo nb-szklo-plynne`), więc łapie
            strażnika zagnieżdżenia z index.css:2570 — a ten nie tylko zdejmuje
            rozmycie, on PODMIENIA `background-image` na własne, ciche
            (primary/0.03 → foreground/0.012). Stąd stonowany wygląd oryginału.
            Pasek boczny też jest szybą, więc tutaj dzieje się dokładnie to samo
            i znak wychodzi identyczny.

            MOJA POMYŁKA PO DRODZE, zapisana, żeby nie wrócić: zmierzyłem te
            klasy na stendzie w `document.body` — gdzie strażnik nie łapie —
            zobaczyłem żywy tint 0.2, uznałem że na `/login` tak właśnie jest
            i „poprawiłem" kafelek na sam `nb-kafelek`. Wyszedł jaskrawy
            niebieski kwadrat, którego Michał nigdy nie chciał. Pomiar był
            poprawny, tylko środowisko pomiaru nie odpowiadało badanemu
            miejscu — a to znaczy, że nie mierzyłem tego, co myślałem.
          */}
          <div className="relative flex-shrink-0 w-10 h-10">
            <div className={`absolute inset-0 rounded-full blur-2xl scale-150 transition-opacity ${isLight ? 'bg-primary/10 opacity-60' : 'bg-primary/20'}`} />
            <div className="nb-szklo nb-szklo-plynne nb-kafelek relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden p-1.5">
              {getAssetUrl(logoAsset) ? (
                <img
                  src={getAssetUrl(logoAsset)!}
                  alt="NextByte Logo"
                  className={`w-full h-full object-contain rounded-xl transition-all duration-200 ${isLight ? 'brightness-0 opacity-85' : ''}`}
                />
              ) : (
                <Bot className="text-primary w-4 h-4" />
              )}
            </div>
          </div>
          {/* `whitespace-nowrap`: w szynie link ma 4 px szerokości i bez tego
              napis łamał się litera po literze na 8 wierszy (zmierzone: 180 px
              wysokości), podnosząc cały nagłówek. Ma wyjechać w bok pod
              obcięcie tafli, nie rosnąć w dół. */}
          {(
            <div className={`min-w-0 whitespace-nowrap transition-opacity duration-150 ${isCollapsed ? 'opacity-0' : ''}`}>
              {/* Wersaliki, solidny kolor i `text-lg` — dokładnie jak `/login`
                  (Auth.tsx:1060), zamiast dotychczasowego `gradient-text`
                  „NextByte". Rozmiar sprawdzony, nie przyjęty: przy 18 px
                  wiersz nagłówka zajmuje 197 z 214 px i żadna litera się nie
                  przycina, więc nie ma powodu schodzić do `text-base`. */}
              <h2 className="text-lg font-bold text-foreground leading-tight tracking-tight">NEXTBYTE</h2>
              {isLime && (
                <span className="text-[8px] font-semibold uppercase tracking-widest text-primary/60 block">
                  Motyw Beta
                </span>
              )}
            </div>
          )}
        </Link>

        <div className={`flex items-center gap-1 transition-opacity duration-150 ${isCollapsed ? 'opacity-0 pointer-events-none' : ''}`}>
          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleThemeToggle}
                disabled={isToggling}
                className="nb-ikona-kafel group flex items-center justify-center w-7 h-7 rounded-lg border text-foreground/70 hover:text-primary transition-all duration-300"
                aria-label={isLight ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw'}
              >
                {isLight ? (
                  <Moon className="w-3.5 h-3.5" strokeWidth={2} />
                ) : (
                  <Sun className="w-3.5 h-3.5" strokeWidth={2} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'bottom'} className="hidden md:block">
              {isLight ? 'Ciemny motyw' : 'Jasny motyw'}
            </TooltipContent>
          </Tooltip>

          {/* Collapse/expand sidebar */}
          {!isMobile && open && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="nb-ikona-kafel group flex items-center justify-center w-7 h-7 rounded-lg border text-foreground/70 hover:text-primary transition-all duration-300"
                  aria-label="Zwiń pasek boczny"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Zwiń menu
              </TooltipContent>
            </Tooltip>
          )}
          {!isMobile && !open && hoverExpanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleClick}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary transition-all duration-300 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/var(--nb-kaf-refleks,0.06)),0_0_12px_-2px_hsl(var(--primary)/0.45)]"
                  aria-label="Rozwiń pasek boczny"
                >
                  <PanelLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Rozwiń menu
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </SidebarHeader>
  );
}
