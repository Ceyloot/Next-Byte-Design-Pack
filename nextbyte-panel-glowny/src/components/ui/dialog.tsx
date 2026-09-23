import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
      className={cn(
        "fixed inset-0 z-[200] nb-zaslona data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:pointer-events-none",
        className
      )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const dialogContentVariants = cva(
  /*
    ZAOKRĄGLENIE NA KAŻDYM EKRANIE, NIE DOPIERO OD `sm` (04.08.2026).

    Michał, ze zrzutu z telefonu: „na telefonie fatalnie wygląda".
    Zmierzone: `border-radius: 0px` przy 375 px. Powodem było `sm:rounded-lg`
    — zaokrąglenie włączało się DOPIERO od 640 px, więc na telefonie każde
    okno platformy było kanciastym blokiem od krawędzi do krawędzi.
    To wzorzec z gotowca shadcn, gdzie okno na telefonie ma być pełnoekranowe;
    u nas okna są kartami unoszącymi się nad stroną, więc kant tam nie pasuje.

    Do tego margines: `w-full` znaczyło dosłownie całą szerokość, więc
    z materiału nie było nic widać — szkło potrzebuje kawałka strony dookoła,
    żeby dało się je rozpoznać jako szkło.
  */
  /* `[&>*]:min-w-0` — bez tego dziecko szersze od toru ROZPYCHA całe okno.
     Zmierzone przy 375 px: rząd pól kodu wychodził 17 px poza krawędź,
     bo element siatki ma domyślnie `min-width: auto` i nie da się go
     ścisnąć poniżej własnej treści. */
  "fixed left-[50%] top-[50%] z-[201] grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-3xl border border-border p-6 outline-none nb-centered-anim [&>*]:min-w-0 shadow-[0_24px_60px_-12px_hsl(var(--background)/0.85),0_0_0_1px_hsl(var(--primary)/0.14)]",
  {
    variants: {
      variant: {
        default: "nb-szklo nb-szklo-plynne nb-szklo-tafla",
        glass: "nb-szklo nb-szklo-plynne nb-szklo-tafla",
        /**
         * BEZ WŁASNEGO MATERIAŁU — dla okien, których zawartość sama jest
         * powierzchnią (np. spotlight na cały ekran). Nakładka okna już rozmywa
         * platformę; `nb-szklo` na treści dokłada DRUGIE rozmycie tego samego
         * obrazu i całość robi się mleczna zamiast szklana. Sprawdzone
         * 04.08.2026 na pełnoekranowym ⌘K: klasa `backdrop-blur-none`
         * z Tailwinda tego nie cofa, bo `.nb-szklo` ustawia `backdrop-filter`
         * bezpośrednio, a nie przez zmienne Tailwinda.
         */
        czyste: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Hide the default top-right close (X) button. Use when wrapping with a custom header that provides its own close. */
  hideCloseButton?: boolean;
  /**
   * Klasa doklejana do zasłony (nie do okna). Potrzebna, gdy pojedyncze okno
   * ma mieć inne tło niż reszta platformy — np. rozmycie pod jednorazową
   * ofertą, którego nie chcemy włączać wszystkim setkom okien naraz.
   */
  overlayClassName?: string;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant, hideCloseButton, onInteractOutside, overlayClassName, ...props }, ref) => {
  // Ensure body cleanup when dialog unmounts
  React.useEffect(() => {
    return () => {
      // Force cleanup on unmount
      document.body.style.pointerEvents = '';
      document.body.classList.remove('pointer-events-none');
    };
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        translate="no"
        // Znacznik dla wyjątku w łatkach jasnego motywu — patrz index.css,
        // sekcja „Okna BEZ własnego materiału".
        data-nb-czyste={variant === "czyste" ? "" : undefined}
        className={cn(dialogContentVariants({ variant }), "notranslate", className)}
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest('[data-keep-dialog-open]')) {
            event.preventDefault();
            return;
          }
          onInteractOutside?.(event);
        }}
        {...props}
      >
        {/*
          ŚWIATŁO SZKŁA — to ono odróżnia materiał od ciemnego prostokąta.

          Michał: „nie przypomina ani trochę liquid glass, porównuj
          z biblioteką komponentów".

          Porównane linijka po linijce z `ListaTresc` (panel listy wyboru,
          nasz wzorzec Apple). Okno miało ten SAM `backdrop-filter`
          i to samo wypełnienie — zmierzone `url(#nb-refrakcja-delikatne)
          saturate(1.3) blur(8.8px)` oraz `rgba(8,8,8,0.6)`. Różniło się
          tym, czego w panelu jest najwięcej widać, a w oknie nie było wcale:

            • POŁYSK — jasny róg u góry po lewej, gasnący w 42% wysokości.
              Bez niego tafla jest równomierna, a równomierna szyba nie
              istnieje: szkło zawsze łapie światło z jednej strony.
            • ŚWIETLNA KRAWĘDŹ u góry — cienka kreska w kolorze akcentu,
              wtopiona po bokach. To ona robi „fazę", po której oko
              rozpoznaje krawędź szyby.

          Oba są `pointer-events-none` i `aria-hidden`, więc nie wchodzą
          w drogę treści ani czytnikom ekranu.
        */}
        {variant !== "czyste" && (
          <>
            <span
              aria-hidden="true"
              /* `rounded-[inherit]`, nie `rounded-3xl`: połysk ma dokładnie
                 promień okna, także gdy ktoś nada oknu inny promień z zewnątrz. */
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                background:
                  'linear-gradient(150deg, hsl(var(--foreground) / 0.07) 0%, transparent 42%, transparent 100%)',
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-50"
              style={{ background: 'linear-gradient(90deg,transparent,hsl(var(--primary)),transparent)' }}
            />
          </>
        )}
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            translate="no"
            className="notranslate absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-[202]"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
