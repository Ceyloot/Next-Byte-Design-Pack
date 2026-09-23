import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Settings, LogOut, Crown, ChevronDown, LayoutDashboard, Rocket } from 'lucide-react';
import { miniChatBus } from '@/lib/miniChatBus';
import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserAvatar } from '@/components/UserAvatar';
import { PasekKart } from '@/components/sidebar/PasekKart';
import { ShortcutIcon } from '@/components/dashboard/ShortcutIcon';
import { useUserQuickShortcuts } from '@/hooks/useUserQuickShortcuts';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Materiał z systemu zamiast ręcznie sklejonego szkła; łuna hover zdjęta —
// przycisk w nagłówku ma być cichy, sygnał niesie obwódka.
//
// `nb-wglebienie`, NIE `nb-szklo`: przycisk leży NA szklanym pasku, więc
// własnego rozmycia mieć nie może (zmierzone: `backdrop-filter: none`, bo pod
// spodem jest już rozmyty pasek). `nb-szklo` dawało tu samo wypełnienie plus —
// błędnie — cień unoszenia tafli. Kontrolka na szybie jest w nią wciśnięta.
/* `h-9 w-9` + `data-tap-target="off"` na przycisku — DOKŁADNIE ta sama
   wysokość co pastylka kart po prawej (Michał: „aby przycisk szybkich akcji
   miał tę samą wysokość co ta pastylka z 4 zakładkami").

   Bez wyłączenia reguły dotyku obie kontrolki dostawały `min-height: 44px`
   i rozpychały 48-pikselowy pasek. Teraz wysokość ustala pasek, nie reguła:
   36 px wizualnie, w wierszu o wyściółce 6 px — razem równo 48. */
const iconBtn =
  'h-9 w-9 p-2 border border-primary/20 rounded-xl nb-wglebienie hover:border-primary/60 transition-colors duration-200 [&_svg]:text-foreground';

const QuickTravelButton: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { shortcuts } = useUserQuickShortcuts();
  const items = (shortcuts || []).filter(Boolean) as NonNullable<typeof shortcuts[0]>[];

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" data-tap-target="off" className={iconBtn} aria-label="Szybka podróż">
          <Rocket className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      {/*
        ══════════════════════════════════════════════════════════════════════
         SZYBKA PODRÓŻ — TAFLA BYŁA SZKŁEM, ZAWARTOŚĆ NIE (06.08.2026)
        ══════════════════════════════════════════════════════════════════════

        Michał: „menu szybkiej podróży […] ogarnąć ładny liquid glass
        przebudować".

        Zmierzone na żywo, zanim cokolwiek ruszyłem — sama tafla była
        POPRAWNA: refrakcja `url(#nb-refrakcja-delikatne)`, rozmycie 8.8 px,
        wypełnienie `rgba(8,8,8,0.60)`, krawędź `rgba(245,245,245,0.26)`.
        Czyli materiał platformy co do wartości.

        Psuło ją WNĘTRZE. Sześć kafelków skrótu niosło `bg-card/40`, czyli
        `rgba(8,8,8,0.40)` NA WIERZCHU tafli 0.60. Składa się to do
        0.60 + 0.40·(1−0.60) = 0.76 — trzy czwarte czerni dokładnie w tych
        miejscach, w których spoczywa oko. Reszta menu mogła być szkłem
        idealnym; użytkownik i tak patrzy na pozycje, a te były płytą.

        Na szybie element NIE MALUJE własnego wypełnienia — zapala się
        dopiero pod palcem. Menu konta w tym samym pliku robiło to
        poprawnie od początku (`hover:bg-muted/60`, w spoczynku nic), więc
        siatka skrótów była tu jedynym odstępstwem.

        DLACZEGO NIE `klasyKafelka` Z BIBLIOTEKI: kafelek skrótu z Panelu
        Głównego (`QuickShortcutsPanel`) ma 104 px wysokości i własne, gęste
        wypełnienie — jedno i drugie jest tam słuszne, bo stoi na stronie,
        nie na szybie. W popoverze 256 px nie zmieściłby się ani razu, a
        wypełnienie odtworzyłoby dokładnie tę wadę, którą tu usuwamy.
        Wspólny zostaje JĘZYK: odznaka ikony na `primary/10` z obrączką,
        tytuł pod spodem, akcent przy najechaniu — te same trzy elementy,
        w skali menu.

        `border-primary/20` i drugie `nb-szklo` zeszły jako martwe:
        `PopoverContent` niesie komplet `nb-szklo nb-szklo-plynne
        nb-szklo-tafla` z definicji, a krawędź materiału stoi poza warstwami
        i tak wygrywała z tą klasą (pomiar pokazał foreground/0.26, nie
        primary/0.20).
      */}
      <PopoverContent side="bottom" align="start" sideOffset={8} className="z-[100] w-64 p-2">
        <div className="mb-1 border-b border-border/40 px-2 py-1.5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Szybka podróż</p>
        </div>
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Brak skrótów. Dodaj je na Panelu Głównym.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {items.map((s) => (
              <button
                key={s.slot_index}
                onClick={() => go(s.url)}
                className="group flex flex-col items-start gap-2 rounded-xl border border-foreground/10 p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:ring-primary/40">
                  <ShortcutIcon name={s.icon} className="h-4 w-4" />
                </span>
                {/* Dwie linie zamiast ucięcia: „Personalny Asystent" mieścił się
                    jako „Personalny As…". `line-clamp-2` ustawia własny `display`,
                    więc NIE dokładamy tu `block` ani `truncate` — zjadłyby go. */}
                <span className="line-clamp-2 w-full text-xs font-medium leading-tight text-foreground">
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};


const ASSISTANT_HIDDEN_PATHS = ['/asystent-nextbyte', '/chat-ai', '/u/', '/login'];

const AssistantButton: React.FC = () => {
  const location = useLocation();
  const hidden = ASSISTANT_HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));
  if (hidden) return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      className={iconBtn}
      data-tap-target="off"
      aria-label="Otwórz Personalnego Asystenta"
      onClick={() => miniChatBus.open()}
    >
      <Sparkles className="h-4 w-4 text-primary" />
    </Button>
  );
};

const MobileHeader: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.setProperty('--mobile-header-height', '48px');
  }, []);

  /*
    PASEK GÓRNY NA MATERIALE PLATFORMY (06.08.2026, zgłoszenie Michała
    powtórzone dwa razy: „pasek górny nie ma liquid glass").

    Dwie osobne wady, obie zmierzone:

    ① BRAK ZAŁAMANIA. Było `nb-szklo nb-szklo-tafla` — rozmycie i wypełnienie
       były, refrakcji nie, bo wchodzi wyłącznie na parze
       `.nb-szklo.nb-szklo-plynne`. Ten sam brak platforma ma już opisany
       przy `.nb-szklo-menu`.

    ② TAFLA ZASŁANIAŁA WSZYSTKO — i to była właściwa przyczyna. Zmierzone
       wypełnienie: `nb-szklo-tafla` daje `rgba(8,8,8,0.60)`, czyli 60% prawie
       czerni; bez niej wypełnienie wynosi 0. Sześćdziesiąt procent krycia nad
       ciemną stroną to z definicji ciemna płyta — rozmycie liczy się pod
       spodem i nie ma go jak zobaczyć.

       Tafla jest materiałem WARSTW PŁYWAJĄCYCH (okna, menu, dymki), gdzie ma
       zapewnić czytelność nad dowolną treścią. Pasek przyklejony to
       POWIERZCHNIA STRONY, jak pasek boczny — a ten niesie samo
       `nb-szklo nb-szklo-plynne` (wypełnienie 0) i dlatego czyta się jak szkło.
       Pasek dostaje więc dokładnie ten sam zestaw.
  */
  return (
    <div
      /* `nb-mobile-header` to WYŁĄCZNIE zaczep dla NextCloud — nic nie stylizuje.
         Moduł na telefonie prosi o pełny ekran (stawia `data-nc-pelny-ekran` na
         `<html>`) i chowa ten pasek: 49 px zajętych przez sterowanie CAŁĄ
         platformą, gdy człowiek jest w jednej aplikacji i szuka w niej pliku.
         Reguła celująca w tę klasę siedzi w `modules/nextcloud/styles/explorer.css`. */
      className="nb-mobile-header lg:hidden border-b border-border sticky top-0 z-40 nb-szklo nb-szklo-plynne nb-szklo-pasek"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 h-12">
        {/* Left */}
        <div className="flex items-center gap-2">
          <SidebarTrigger
            className="text-foreground h-8 w-8 p-1"
            data-tour="mobile-menu-trigger"
          />
          <QuickTravelButton />
        </div>

        {/*
          ── PRAWA STRONA: PASTYLKA ZAMIAST DWÓCH PRZYCISKÓW ───────────────
          Michał: „po prawej ta pastylka co na dole w pasku bocznym
          z animacją okna […] zamiast tych 2 przycisków".

          Zeszły stąd dzwonek i przycisk konta. Obie rzeczy są w pastylce
          jako karty: „Aktywność" to dzwonek z listą powiadomień, „Profil"
          to menu konta. Doszła trzecia, której w pasku nigdy nie było —
          „W toku", z licznikiem trwających zadań.

          To TEN SAM komponent co w stopce paska bocznego, w wariancie
          `naGorze` — nie kopia. Dzięki temu karta powiadomień istnieje
          w jednym egzemplarzu i zmiana w niej wchodzi w obu miejscach.
        */}
        <div className="flex items-center gap-2">
          <AssistantButton />
          <PasekKart naGorze />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
