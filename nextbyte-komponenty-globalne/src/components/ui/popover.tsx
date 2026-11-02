import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { useKontenerPortali } from "@/components/ui/kontener-portali"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

/** Punkt zaczepienia bez wyzwalacza — okienko otwierane z menu „Więcej" staje przy przycisku menu. */
const PopoverAnchor = PopoverPrimitive.Anchor

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  container?: HTMLElement | null;
  /**
   * OKIENKO (26.09.2026) — popover jako małe okno: nagłówek, przewijane ciało,
   * stopka (`PopoverNaglowek` / `PopoverCialo` / `PopoverStopka`).
   *
   * Różnice wobec zwykłego popovera:
   *  • szyba NIE jest animowana. Zwykły wariant wchodzi `zoom-in-95` + `fade-in`,
   *    a animowany `transform` na elemencie z `backdrop-filter` zabiera mu
   *    rozmycie na czas animacji (pomiar 04.08, notatka „szkło a animacja").
   *    Tu wjeżdża TREŚĆ (dziecko), a tafla stoi od pierwszej klatki;
   *  • wysokość z miejsca, które zostało (`--radix-popover-content-available-height`),
   *    więc długa lista nie wychodzi poza ekran telefonu;
   *  • szerokość 360 px, na telefonie ekran minus 16 px;
   *  • zamiast `shadow-md` (który ZJADAŁ ranty szkła — `box-shadow` to jedna
   *    właściwość) mocniejsze uniesienie przez zmienną materiału.
   */
  okienko?: boolean;
}

/**
 * Popover WEWNĄTRZ okna dialogowego — dwie poprawki zmierzone 13.09.2026 w trybie skupienia Doboru:
 *  1. `z-[250]` jak w `select.tsx`: okna stoją na z-[201], więc popover z z-50 otwierał się POD nimi
 *     (menu „…” istniało w DOM, ale nie było go widać);
 *  2. `pointer-events-auto`: modalne okno ustawia `body { pointer-events: none }`, a popover tego nie cofa,
 *     bo `react-dialog@1.1.14` i `react-popover@1.1.2` mają DWIE kopie `react-dismissable-layer` (1.1.10
 *     i 1.1.1 — `npm ls @radix-ui/react-dismissable-layer`) i nie widzą nawzajem swoich warstw. Klik trafiał
 *     w element pod popoverem. Docelowo: wyrównać wersje Radixa (decyzja właściciela), wtedy klasa jest zbędna.
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 4, container, okienko, style, onOpenAutoFocus, children, ...props }, ref) => (
  <PopoverPrimitive.Portal container={useKontenerPortali(container)}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={okienko ? 8 : sideOffset}
      collisionPadding={okienko ? 8 : undefined}
      /* Okienko przejmuje fokus JAKO CAŁOŚĆ, nie pierwszym przyciskiem w środku:
         po kliknięciu myszą pierwszy „Przywróć" w historii dostawał obwódkę
         fokusu i wyglądał na zaznaczony. Tab dalej prowadzi do środka. */
      onOpenAutoFocus={onOpenAutoFocus ?? (okienko ? (e) => { e.preventDefault(); (e.currentTarget as HTMLElement | null)?.focus?.(); } : undefined)}
      className={cn(
        okienko
          ? "group/okienko pointer-events-auto z-[250] flex w-[22.5rem] max-w-[calc(100vw-1rem)] max-h-[min(36rem,calc(var(--radix-popover-content-available-height,100dvh)_-_0.5rem))] flex-col overflow-hidden rounded-2xl border nb-szklo nb-szklo-plynne nb-szklo-tafla p-0 text-popover-foreground outline-none"
          : "pointer-events-auto z-[250] w-72 rounded-md border nb-szklo nb-szklo-plynne nb-szklo-tafla p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={okienko ? {
        ['--nb-cien-uniesienie' as string]: '0 2px 4px -2px hsl(0 0% 0% / 0.30), 0 18px 44px -14px hsl(0 0% 0% / 0.50)',
        ...style,
      } : style}
      {...props}
    >
      {okienko ? (
        <div className="flex min-h-0 flex-1 flex-col animate-in fade-in-0 duration-200 group-data-[side=bottom]/okienko:slide-in-from-top-1 group-data-[side=top]/okienko:slide-in-from-bottom-1 motion-reduce:animate-none">
          {children}
        </div>
      ) : children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

/** Nagłówek okienka: tytuł i JEDNO zdanie opisu. Bez ikony w pudełku — ikona była ozdobą, nie informacją. */
const PopoverNaglowek: React.FC<{
  tytul: React.ReactNode;
  opis?: React.ReactNode;
  /** element po prawej — np. plakietka stanu */
  akcja?: React.ReactNode;
  className?: string;
}> = ({ tytul, opis, akcja, className }) => (
  <div className={cn("flex shrink-0 items-start gap-3 border-b border-border/60 px-4 pb-3 pt-3.5", className)}>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-semibold leading-tight text-foreground">{tytul}</p>
      {opis && <p className="mt-1 text-[12px] leading-snug text-foreground/65">{opis}</p>}
    </div>
    {akcja && <div className="shrink-0">{akcja}</div>}
  </div>
)

/** Ciało okienka — przewija się samo, nagłówek i stopka zostają na miejscu. */
const PopoverCialo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("nb-pasek min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3", className)} {...props} />
)

/** Stopka okienka — akcje albo zdanie o skutkach, oddzielone od treści. */
const PopoverStopka: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex shrink-0 items-center gap-2 border-t border-border/60 bg-foreground/[0.02] px-4 py-3", className)} {...props} />
)

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverNaglowek, PopoverCialo, PopoverStopka }
