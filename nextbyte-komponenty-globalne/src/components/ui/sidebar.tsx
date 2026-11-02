import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useSlotTla } from "@/contexts/TloZakladkiContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
/* 16rem → 15rem (256 → 240 px). Michał: „aby nie zabierał tyle miejsca".

   Szerokość podyktowana POMIAREM, nie gustem. Pierwsza próba (14rem)
   przycięła dwie etykiety — „Personalny Asystent" zabrakło 22 px,
   „Panel Handlowca" 14 px. Zamiast skracać nazwy modułów albo zostawić
   wielokropek w menu, oddajemy 16 px z 32: pasek jest węższy, a każda
   pozycja nadal czytelna w całości. Razem z ciaśniejszym wnętrzem
   pozycji (padding 10→8, gap 8→6) najdłuższa etykieta ma 6 px zapasu. */
const SIDEBAR_WIDTH = "15rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
/* 4.25rem = 68 px (07.09.2026): 12 px wyściółki listy + wiersz 44 px (8 + pole
   ikony 28 + 8) + 12 px wyściółki — ten sam wiersz co w pasku rozwiniętym,
   więc ikona przy zwijaniu nie rusza się ani o piksel, a w szynie stoi
   DOKŁADNIE w środku (przy 56 px była 6 px w prawo od osi tafli). */
const SIDEBAR_WIDTH_ICON = "4.25rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  hoverExpanded: boolean
  setHoverExpanded: (value: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

/** Jak `useSidebar`, ale bez wyjątku poza dostawcą — dla komponentów, które
 *  mogą stać zarówno w powłoce aplikacji, jak i poza nią. */
function useSidebarOptional(): SidebarContext | null {
  return React.useContext(SidebarContext)
}

// Helper to read cookie value
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)
    const [hoverExpanded, setHoverExpanded] = React.useState(false)
    // Read initial state from cookie
    const getInitialOpen = React.useCallback(() => {
      const cookieValue = getCookieValue(SIDEBAR_COOKIE_NAME)
      if (cookieValue !== null) {
        return cookieValue === 'true'
      }
      return defaultOpen
    }, [defaultOpen])

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(getInitialOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    // On mobile, always report "expanded" when the sheet is open so labels are visible.
    const baseState = open ? "expanded" : "collapsed"
    const state = isMobile ? (openMobile ? "expanded" : "collapsed") : (hoverExpanded ? "expanded" : baseState)

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        hoverExpanded,
        setHoverExpanded,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, hoverExpanded]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

/**
 * PRZEŚWIT WZORU PRZEZ PASTYLKĘ (07.09.2026).
 *
 * Pod taflą wzór użytkownika fizycznie JEST (rysuje go powłoka pod całym
 * ekranem), ale szkło rozmywa go 8,8 px — a siatka z linii 1 px co 60 px po
 * takim rozmyciu przestaje istnieć. Dla oka pastylka była „pusta”, a wzór
 * „urywał się” na pasku, choć fizyka szkła działała poprawnie.
 *
 * Tu kładziemy w tafli OSTRĄ kopię samego wzoru (slot „wzor”, bez poświat
 * strony), przesuniętą o odstęp pastylki od ekranu, więc kafelki wzoru
 * trafiają dokładnie w te same miejsca co pod szkłem. 55 % krycia = wzór
 * przygaszony przez szybę, nie namalowany na niej. Poświaty strony zostają
 * pod szkłem — one rozmycie znoszą dobrze.
 */
const PrzeswitWzoru = () => {
  const wzor = useSlotTla("wzor")
  if (!wzor) return null
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute h-svh w-screen opacity-55"
      style={{ left: "calc(-1 * var(--nb-pastylka-odstep, 0.75rem))", top: "calc(-1 * var(--nb-pastylka-odstep, 0.75rem))" }}
    >
      {wzor}
    </div>
  )
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile, setOpen, open, hoverExpanded, setHoverExpanded } = useSidebar()
    const hoverEnterTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const hoverLeaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = React.useCallback(() => {
      // Cancel any pending collapse
      if (hoverLeaveTimeoutRef.current) {
        clearTimeout(hoverLeaveTimeoutRef.current)
        hoverLeaveTimeoutRef.current = null
      }
      if (!open && !isMobile) {
        /* 120 ms zamiast 200: przy 200 ms trzeba bylo „przytrzymac" mysz nad
           szyna, zeby cokolwiek sie stalo (Michal: „nie jest takie plynne
           i latwe najechac"). Ponizej ~100 ms pasek zaczyna wyskakiwac przy
           samym przejezdzaniu myszka przez ekran, wiec 120 ms to kompromis. */
        hoverEnterTimeoutRef.current = setTimeout(() => {
          setHoverExpanded(true)
        }, 120)
      }
    }, [open, isMobile, setHoverExpanded])

    const handleMouseLeave = React.useCallback(() => {
      // Cancel any pending expand
      if (hoverEnterTimeoutRef.current) {
        clearTimeout(hoverEnterTimeoutRef.current)
        hoverEnterTimeoutRef.current = null
      }
      if (hoverExpanded) {
        /* Wyjscie WOLNIEJSZE niz wejscie (350 ms): mysz czesto na chwile
           wyjezdza poza pasek przy siegnieciu do dalszej pozycji, a zwijanie
           w polowie ruchu jest irytujace. Wejscie ma byc szybkie, wyjscie
           wybaczajace. */
        hoverLeaveTimeoutRef.current = setTimeout(() => {
          setHoverExpanded(false)
        }, 350)
      }
    }, [hoverExpanded, setHoverExpanded])

    React.useEffect(() => {
      return () => {
        if (hoverEnterTimeoutRef.current) clearTimeout(hoverEnterTimeoutRef.current)
        if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current)
      }
    }, [])

    /* STRAŻNIK ZWIJANIA NIEZALEŻNY OD `mouseleave` (07.09.2026, Michał: „pasek
       boczny się nie chowa w trybie chowania po zjechaniu myszką"). `mouseleave`
       potrafi nie dojść: okno podręczne albo podpowiedź w portalu przejmuje
       wskaźnik, ruch przez pasek przewijania, wyjście poza okno przeglądarki.
       Tu co ruch wskaźnika sprawdzamy GEOMETRIĘ: wskaźnik poza taflą (z 8 px
       zapasu) przez 350 ms = zwinięcie, dokładnie jak przy zwykłym zjechaniu. */
    const taflaRef = React.useRef<HTMLDivElement | null>(null)
    React.useEffect(() => {
      if (!hoverExpanded || isMobile) return
      const naRuch = (e: PointerEvent) => {
        const el = taflaRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const wewnatrz = e.clientX >= r.left - 8 && e.clientX <= r.right + 8 && e.clientY >= r.top - 8 && e.clientY <= r.bottom + 8
        if (wewnatrz) {
          if (hoverLeaveTimeoutRef.current) { clearTimeout(hoverLeaveTimeoutRef.current); hoverLeaveTimeoutRef.current = null }
          return
        }
        if (!hoverLeaveTimeoutRef.current) {
          hoverLeaveTimeoutRef.current = setTimeout(() => { setHoverExpanded(false); hoverLeaveTimeoutRef.current = null }, 350)
        }
      }
      const naWyjscieZOkna = () => setHoverExpanded(false)
      document.addEventListener('pointermove', naRuch, { passive: true })
      window.addEventListener('blur', naWyjscieZOkna)
      return () => {
        document.removeEventListener('pointermove', naRuch)
        window.removeEventListener('blur', naWyjscieZOkna)
      }
    }, [hoverExpanded, isMobile, setHoverExpanded])

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          {/*
            ── PRÓBA `forceMount` COFNIĘTA (19.08) — ZAPIS, ŻEBY NIE WRÓCIĆ ──
            Pasek udostępnia gniazdo dla paneli narzędzi (`PanelPaskaContext`),
            a Radix odmontowuje treść zamkniętej szuflady — więc na telefonie
            gniazda nie ma i Chat AI wraca do własnej szuflady (dwa hamburgery).
            Naprawa przez `forceMount` na treści I portalu FIZYCZNIE ZADZIAŁAŁA
            (treść została w DOM), ale zmierzone skutki były nie do przyjęcia:
            zamknięta szuflada stawała na `x=0`, nakładka miała krycie 1,
            a `body` dostawało `pointer-events: none` — czyli cała aplikacja
            mobilna przestawała się klikać.

            Powód: klasy animacji `data-[state=closed]` odsuwają arkusz JEDNYM
            przebiegiem przy odmontowaniu; przy trwałym montażu nie ma czego
            odsunąć, a blokada tła Radiksa zostaje włączona.

            Jednolita szuflada na telefonie wymaga więc innego podejścia
            (np. gniazdo poza arkuszem albo własny arkusz sterowany stanem),
            a nie tego przełącznika.
          */}
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] nb-szklo nb-szklo-plynne border-r border-border/50 p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                paddingTop: 'env(safe-area-inset-top, 0px)',
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="relative flex h-full w-full flex-col">
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.03] pointer-events-none" />
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              {/* Content */}
              <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    // state from context already includes hoverExpanded
    const collapsibleState = open ? "expanded" : "collapsed"

    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop - always uses actual open state, not hover */}
        <div
          data-gap-collapsible={!open ? collapsible : ""}
          className={cn(
            /* TEN SAM czas i krzywa co tafla paska niżej (300 ms, ease-out).
               Rozpórka szła 200 ms liniowo, więc treść dojeżdżała na miejsce
               100 ms przed pastylką — widoczne jako szarpnięcie przy zwijaniu. */
            "relative h-svh bg-transparent transition-[width] duration-300 ease-out",
            /* PASTYLKA (`floating`, 07.09.2026): odstęp od krawędzi ekranu
               jest DOKŁADANY do szerokości, nie odejmowany od niej — menu
               zachowuje 100 % swojej szerokości, a treść odsuwa się o 2×12 px.
               Wcześniejszy przepis shadcn (`p-2` wewnątrz tej samej
               szerokości) ściskał pozycje menu o 16 px. */
            !open && collapsible === "offcanvas" ? "w-0" : !open && collapsible === "icon"
              ? (variant === "floating" || variant === "inset"
                ? "w-[calc(var(--sidebar-width-icon)_+_theme(spacing.6))]"
                : "w-[--sidebar-width-icon]")
              : (variant === "floating" || variant === "inset"
                ? "w-[calc(var(--sidebar-width)_+_theme(spacing.6))]"
                : "w-[--sidebar-width]"),
            "group-data-[side=right]:rotate-180",
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-3 !w-[calc(var(--sidebar-width)_+_theme(spacing.6))] group-data-[collapsible=icon]:!w-[calc(var(--sidebar-width-icon)_+_theme(spacing.6))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            /* Rozwijanie po najechaniu MUSI być płynne (Michał, 13.08: „jak
               jest pasek boczny schowany to po najechaniu nie ma płynnej
               animacji rozwijania"). Przejście szerokości deklarujemy tu
               jawnie z `ease-out`: lista klas wyżej animuje `[left,right,width]`
               liniowo, a przy skoku 3rem→15rem liniowy przebieg czyta się jak
               szarpnięcie. `will-change` trzyma warstwę na kompozytorze, żeby
               szkło paska nie przeliczało się w trakcie ruchu. */
            "transition-[width,left,right] duration-300 ease-out will-change-[width]",
            hoverExpanded && (variant === "floating" || variant === "inset"
              ? "!w-[calc(var(--sidebar-width)_+_theme(spacing.6))] z-50"
              : "!w-[--sidebar-width] z-50 shadow-2xl shadow-black/30"),
            className
          )}
          /*
            ── NASŁUCH NAJECHANIA MUSI SIEDZIEĆ NA TYM ELEMENCIE ──────────
            Wcześniej stał na OPAKOWANIU wyżej i to był błąd, który zgłosił
            Michał: „po najechaniu jak się rozwija, to mimo że myszka jest na
            nim, to się chowa".

            Opakowanie jest zwykłym elementem w układzie i jego szerokość bierze
            się z rozpórki — czyli 48 px szyny. Ten element jest `fixed`, więc
            NIE POWIĘKSZA opakowania: gdy pasek rozwijał się do 264 px, pole
            najechania dalej miało 48 px. Przesunięcie myszy w głąb rozwiniętego
            paska było dla opakowania WYJŚCIEM i po 200 ms panel się zwijał.

            Tutaj pole najechania rośnie razem z paskiem, bo to jest ten sam
            element, który rośnie.
          */
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
          ref={taflaRef}
        >
          <div
            data-sidebar="sidebar"
            /*
              Materiał wspólny (04.08.2026) zamiast własnego `bg-card/40 +
              blur 24px`; rant z materiału, nie z `--border` (prawie czerń).

              ZAŁAMANIE DOŁOŻONE 06.08.2026. Michał: „czy w chat ai możemy
              zrobić, że ten pasek konwersacji wizualnie jest jakby
              przedłużeniem paska bocznego".

              Zmierzone na żywo, oba panele naraz:
                pasek boczny   → backdrop-filter: saturate(1.3) blur(8.8px)
                kolumna rozmów → backdrop-filter: url(#nb-refrakcja-delikatne)
                                 saturate(1.3) blur(8.8px)

              Ta sama gęstość szkła, to samo zerowe wypełnienie, ta sama krawędź
              (foreground/0.14) — i jedna jedyna różnica: kolumna załamuje
              światło, pasek nie. Załamanie wchodzi WYŁĄCZNIE na parze
              `.nb-szklo.nb-szklo-plynne`, a tu stało samo `nb-szklo`. To ono
              robi krawędź, po której oko rozpoznaje szybę, więc dwie stykające
              się płaszczyzny czytały się jak dwa różne materiały — mimo że nie
              ma między nimi szczeliny (pasek 0→239, kolumna 240→528).

              Poprawka siedzi w KOMPONENCIE BIBLIOTEKI, nie w Chat AI: pasek
              boczny jest jeden na całą platformę, więc „przedłużenie" ma
              wynikać z materiału, a nie z łatki na jednym ekranie.
            */
            className={cn(
              "nb-szklo nb-szklo-plynne relative flex h-full w-full flex-col border-r",
              /* PASTYLKA: pełny promień kafelka (`rounded-2xl`, ten sam co
                 `klasyKafelka`), obwódka z materiału zamiast `border-r`,
                 przycięcie do rogów — bez niego przewijana lista i dok wyjeżdżały
                 z zaokrąglonych rogów. Cień jest czystą czernią z niską alfą
                 (fizycznie ten sam na jasnym i ciemnym motywie, jak w kafelku).

                 `overflow-clip`, NIE `overflow-hidden` (07.09.2026). Michał
                 w Chat AI: logo ucięte u góry, pusty pas pod dokiem. To
                 zawartość tafli PRZESUNIĘTA w górę: `hidden` nadal tworzy
                 kontener przewijania, który `scrollIntoView` / fokus potrafi
                 przewinąć programowo (lista rozmów, karetka w polu). `clip`
                 tylko przycina — nie da się go przewinąć niczym. */
              "group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:border-r-0",
              "group-data-[variant=floating]:overflow-clip",
              /* BEZ CIENIA (07.09.2026). Cień o rozmyciu 48 px kładł ciemną
                 obwódkę na 12 px szczeliny między taflą a treścią i na
                 skraju treści — wzór użytkownika „urywał się” tuż za paskiem
                 (Michał: „tło nie kończy się po lewej krawędzi ekranu”). */
            )}
          >
            {variant === "floating" && <PrzeswitWzoru />}
            {/* Tinta koloru idzie z materiału (`[data-sidebar="sidebar"].nb-szklo::before`
                w index.css), tak jak na kafelkach — nie z nakładki tylko tutaj. */}
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {/* Content */}
            <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        // `gap-2` → `gap-0.5`: grupy niosą już własne `mb-*`, więc odstęp
        // liczył się DWA RAZY. Zmierzone 04.08: sam ten gap kosztował ~30 px.
        "flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  // SHADCN-OWE `bg-sidebar-accent` USUNIĘTE (04.08.2026).
  //
  // Ten wariant malował tło pozycji na czterech stanach naraz (hover, active,
  // data-active, data-state=open) tokenem `--sidebar-accent`, którego platforma
  // nie używa nigdzie indziej — na motywie Ciemnym to `204 50% 15%`, czyli
  // NIEPRZEZROCZYSTY granat na szkle. Dopóki `tierClasses` miało `!important`,
  // konflikt był niewidoczny; po przejściu na materiał z biblioteki
  // (`.nb-wiersz-akt`) utility Tailwinda zaczęło wygrywać z warstwą components
  // i aktywna pozycja dostała `rgb(19, 42, 57)` zamiast przezroczystej tafli.
  // Zmierzone na żywo — stąd ta zmiana.
  //
  // Zostaje `data-[active=true]:font-medium` (grubość to nie materiał) oraz
  // cała geometria. Kolory niesie teraz wyłącznie miejsce użycia.
  /*
    IKONY NIE MOGĄ SKAKAĆ PRZY ROZWIJANIU (Michał, 13.08: „jak najedzie się na
    ikonę narzędzia przy schowanym to po rozwinięciu nie skacze i nie jest
    w innym miejscu").

    Poprzednio zwinięty pasek dawał `!size-8`, czyli wysokość 32 px, podczas
    gdy rozwinięty liczył ją z paddingu i tekstu (~36 px). Cztery piksele
    różnicy na POZYCJĘ kumulują się w dół listy — przy dwudziestu pozycjach
    dolne ikony jechały o kilkadziesiąt pikseli i wyglądało to jak przeskok.

    Teraz wysokość jest STAŁA (`h-9`) w obu stanach, a zwijanie rusza wyłącznie
    szerokość. Ikona ma ten sam padding po lewej niezależnie od stanu, więc
    zostaje dokładnie tam, gdzie była — zmienia się tylko to, co obok niej.
  */
  "peer/menu-button flex h-9 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,padding,opacity] duration-200 ease-out focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium group-data-[collapsible=icon]:!w-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>span:last-child]:transition-[opacity] [&>span:last-child]:duration-200 group-data-[collapsible=icon]:[&>span:last-child]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "peer-data-[size=sm]/menu-button:top-1",
      "peer-data-[size=default]/menu-button:top-1.5",
      "peer-data-[size=lg]/menu-button:top-2.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  useSidebarOptional,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
