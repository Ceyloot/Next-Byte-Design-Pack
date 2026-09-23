import React, { useState, useCallback, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import { AppSidebarHeader } from './sidebar/SidebarHeader';
import { SidebarMenuSection } from './sidebar/SidebarMenuSection';
import { MenuWsuwane } from './sidebar/MenuWsuwane';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { AppSidebarFooter } from './sidebar/SidebarFooter';
import { PinnedAgentsSection } from './sidebar/PinnedAgentsSection';
import { FavoritesSection } from './sidebar/FavoritesSection';
import { SidebarSearchTrigger } from './sidebar/SidebarSearchTrigger';
import {
  dashboardItem,
  aiMenuItems,
  creationStudioItems,
  mainMenuItems,
  communityItems,
  toolsItems,
} from './sidebar/menuData';
import { useIsAdmin, useHasManagementRole, useIsSalesperson } from '@/hooks/useUserRoles';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { NextByteSpotlightInline } from '@/components/ui/nextbyte-spotlight';
import { usePendingDashboardActions } from '@/hooks/usePendingDashboardActions';
import { usePanelPaska } from '@/contexts/PanelPaskaContext';

export function AppSidebar() {
  /* Stan zwiniecia potrzebny do wysciolki szukajki — w szynie 48 px inna niz
     w rozwinietym pasku. */
  const { state: stanPaska, isMobile: mobilny } = useSidebar();
  const isCollapsed = stanPaska === 'collapsed' && !mobilny;

  /* Czy pasek hostuje teraz panel narzędzia (Notatki, Chat AI, …).
     `tytul` z kontekstu jest ustawiony wyłącznie wtedy — patrz komentarz
     przy renderowaniu nagłówka niżej. */
  const { tytul: tytulPanelu } = usePanelPaska();
  const ukryjChromPaska = mobilny && !!tytulPanelu;

  const { value: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { value: hasManagementRole, isLoading: isManagementLoading } = useHasManagementRole();
  const { value: isSalesperson, isLoading: isSalesLoading } = useIsSalesperson();
  const { pendingCount: pendingDashboardActionsCount } = usePendingDashboardActions();

  const isLoading = isAdminLoading || isManagementLoading || isSalesLoading;

  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  // Cmd/Ctrl + K opens search globally
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Bez własnego przepisu (było: bg-background/50 + blur 40 px) —
          materiał niesie WEWNĘTRZNY panel w `ui/sidebar.tsx`; druga szyba
          na wierzchu robiłaby mleko z reguły „szkło na szkle". */}
      {/* Szerokość ustawia POWŁOKA (`AppShell`), nie ten komponent — patrz
          komentarz tam. Tu zostaje sama płynność zmiany. */}
      {/* PASTYLKA (07.09.2026, Michał: „pasek boczny jako pastylkę z boku
          z odstępami od krawędzi… liquid glass boczny panel nawigacji,
          na telefonie się nie zmienia nic"). `variant="floating"` w bibliotece
          daje odstęp 12 px, pełny promień i cień; na telefonie `Sidebar`
          renderuje `Sheet` i wariantu nie czyta. Linie „prawej krawędzi" niżej
          miały sens przy pasku przyklejonym do ekranu — na zaokrąglonej tafli
          stałyby w powietrzu, więc w pastylce są schowane. */}
      <Sidebar variant="floating" collapsible="icon" className="border-r-0 transition-[width] duration-300 ease-out">
        {/* Apple-glass right edge — primary glow rim + crisp hairline (tylko pasek przyklejony) */}
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent z-10 group-data-[variant=floating]:hidden" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-px bg-foreground/[0.06] z-10 group-data-[variant=floating]:hidden" />
        {/* Top inset highlight */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-foreground/[0.06] z-10 group-data-[variant=floating]:hidden" />
        {/* Poświata koloru: z materiału (index.css), nie z nakładki — patrz ui/sidebar. */}

        {/* ══════════════════════════════════════════════════════════════
            NA TELEFONIE, GDY PASEK HOSTUJE PANEL NARZĘDZIA — logo
            i globalna szukajka znikają.
            ══════════════════════════════════════════════════════════════

            Zmierzone 24.08.2026 na 390 px w Notatkach: chrom nad pierwszą
            pozycją listy zajmował 320 px z 844, czyli 38 % ekranu. Rozkład:
            logo 68 px, globalna szukajka 64 px, wiersz powrotu 44 px,
            nagłówek narzędzia 100 px, nagłówek sekcji 21 px.

            Logo jest tam zbędne — użytkownik przed chwilą wszedł w narzędzie
            i widzi jego nazwę w wierszu powrotu tuż niżej. Globalna szukajka
            DUBLUJE lupę w nagłówku narzędzia, dwa pola wyszukiwania stoją
            w odległości 70 px od siebie.

            Warunek jest wąski (`mobilny && tytulPanelu`): na desktopie oraz
            w zwykłym menu paska nic się nie zmienia, a zysk dostają wszystkie
            narzędzia hostujące panel, nie tylko Notatki. */}
        {!ukryjChromPaska && <AppSidebarHeader />}

        {/* `pb-2`, nie `pb-1` — pod szukajką stoi teraz wiersz powrotu, który
            ma własną powierzchnię. Przy jednym pikselu odstępu obie ramki
            zlewały się w jeden blok (Michał: „to jest za blisko").

            W SZYNIE wyściółka schodzi do `px-1`: przycisk szukajki ma 36 px,
            a szyna 48 — przy `px-3` (2×12 px) zostawało 24 px i ikona
            wychodziła poza krawędź. */}
        {!ukryjChromPaska && (
          <div className="relative z-10 px-3 pt-3 pb-2">
            <SidebarSearchTrigger onOpen={openSearch} />
          </div>
        )}


        {/* Wsuwanie obejmuje WYŁĄCZNIE środek — nagłówek nad nim i pasek kart
            pod nim stoją nieruchomo (wprost prośba Michała). */}
        <MenuWsuwane className="relative z-10">
          <SidebarContent
            /* `pl-3 pr-2`, nie `px-3` (14.08.2026) — Michał, liniami na zrzucie:
               „zależy mi, by wszystko tam było idealnie wyrównane".
               Ten kontener przewija się, więc pasek przewijania (zmierzone: 4 px)
               zjada miejsce TYLKO z prawej. Przy symetrycznym `px-3` wiersze menu
               kończyły się na 17 px od krawędzi, podczas gdy nagłówek, wyszukiwarka
               i stopka trzymały 13. Prawy padding schodzi więc o te 4 px, żeby
               oś prawa zgadzała się mimo scrollbara. */
            className="nb-pasek pl-3 pr-2 pt-2 pb-3 relative z-10 group-data-[collapsible=icon]:pr-3"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
            }}
          >
            {/* Smart favorites — pinned + recent */}
            <FavoritesSection />

            {/* Panel Główny — bez nagłówka */}
            <SidebarMenuSection
              title=""
              items={[dashboardItem]}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isLoading={isLoading}
              pendingDashboardActionsCount={pendingDashboardActionsCount}
            />

            {/* AI */}
            <SidebarMenuSection
              title="AI"
              items={aiMenuItems}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isLoading={isLoading}
            />

            <PinnedAgentsSection />

            {/* Studio Kreacji */}
            <SidebarMenuSection
              title="STUDIO KREACJI"
              items={creationStudioItems}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isLoading={isLoading}
            />

            {/* Praca (dawniej GŁÓWNE + Firma) */}
            <SidebarMenuSection
              title="PRACA"
              items={mainMenuItems}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isLoading={isLoading}
            />

            {/* Społeczność */}
            <SidebarMenuSection
              title="SPOŁECZNOŚĆ"
              items={communityItems}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isLoading={isLoading}
            />

            {/* Zarządzanie — role-gated; section auto-hidden when empty */}
            <SidebarMenuSection
              title="ZARZĄDZANIE"
              items={toolsItems}
              isAdmin={isAdmin}
              hasManagementRole={hasManagementRole}
              isSalesperson={isSalesperson}
              isLoading={isLoading}
            />
          </SidebarContent>
        </MenuWsuwane>

        <AppSidebarFooter />
      </Sidebar>

      {/* ── SPOTLIGHT NA CAŁY EKRAN (⌘/Ctrl + K) ────────────────────────────
          Wcześniej to samo okno miało `max-w-2xl` i domyślne szkło okna, więc
          na ekranie stała ramka z paskiem w środku — mniejsza kopia tego, co
          i tak jest na Panelu Głównym. Teraz treść wypełnia ekran, a szkłem
          jest NAKŁADKA okna (`nb-szklo nb-szklo-plynne` z dialog.tsx),
          czyli rozmyta platforma pod spodem. Dlatego sama zawartość jest
          przezroczysta i bez obwódki — dwie szyby jedna na drugiej dałyby
          mleczną plamę zamiast szkła.

          Pole siedzi w górnej ⅓, nie na środku: lista wyników rośnie w dół,
          a wyśrodkowane pole skakałoby po ekranie z każdą literą. */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          hideCloseButton
          variant="czyste"
          className="left-0 top-0 h-full w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button]:hidden"
        >
          {/* Klik w tło zamyka; klik w samo pole — nie.

              Materiał nakładki idzie ze `style`, nie z klas Tailwinda. Powód
              zmierzony 04.08.2026: `nb-szklo` na nakładce okna miało
              `backdrop-filter: none` w wyliczonym stylu na motywie jasnym —
              zjadała je warstwa łatek `!important` dla `[data-theme]` w index.css.
              Atrybut `style` jest ponad tym sporem.

              Przyciemnienie to CZYSTA CZERŃ z niską alfą, nie token motywu:
              `--background` na jasnym motywie jest prawie biały, więc
              „przyciemnienie" tłem rozjaśniłoby scenę i pole przestałoby się
              odcinać. Czerń o alfie 0,28 działa fizycznie tak samo na jasnym
              i na ciemnym — ten sam wybór co przy cieniu kafelka. */}
          <div
            className="flex h-full w-full justify-center overflow-y-auto px-4 pt-[14vh] pb-8"
            style={{
              background: 'rgba(0, 0, 0, 0.22)',
              /* Te same liczby co materiał `.nb-szklo` — welon to też szyba,
                 tylko z przyciemnieniem zamiast wypełnienia karty. */
              backdropFilter: 'saturate(130%) blur(7.2px)',
              WebkitBackdropFilter: 'saturate(130%) blur(7.2px)',
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div className="h-fit w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <NextByteSpotlightInline pelnyEkran />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
