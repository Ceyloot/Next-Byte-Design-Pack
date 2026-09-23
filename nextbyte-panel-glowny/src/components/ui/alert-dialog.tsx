import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[300] nb-zaslona",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * Czysty, transparentny popup w stylu NextByte.
 * Bez kolorowych gradientów, bez orbów. Tylko szkło + cienka biała ramka.
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  React.useEffect(() => {
    return () => {
      /* Timer przeżywa odmontowanie, więc w testach potrafi odpalić się PO
         zburzeniu jsdom: „document is not defined" jako Uncaught Exception
         wywalało cały bieg CI mimo 1403 zielonych testów (PR #370, 07.09).
         Strażnik na `document` kosztuje nic, a w przeglądarce nic nie zmienia. */
      setTimeout(() => {
        if (typeof document === 'undefined') return
        document.body.style.pointerEvents = ''
      }, 120)
    }
  }, [])

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[301] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-3xl overflow-hidden",
          "nb-szklo nb-szklo-plynne nb-szklo-tafla",
          "border border-border/40",
          "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]",
          "nb-centered-anim",
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 px-7 pt-7 pb-6", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * Footer = rząd outlinowanych pigułek (jak „Nowy folder / Nowa notatka").
 */
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 pb-6 pt-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-semibold tracking-tight text-foreground", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-[13.5px] text-foreground/55 leading-relaxed", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

/**
 * Action = outlinowana pigułka, czerwona (destrukcyjna).
 * data-destructive="false" -> primary (niebieska).
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl text-sm font-medium transition-colors",
      "bg-transparent border text-[#ff5b5b] border-[#ff5b5b]/40 hover:bg-[#ff5b5b]/10 hover:border-[#ff5b5b]/70",
      "data-[destructive=false]:text-primary data-[destructive=false]:border-primary/40 data-[destructive=false]:hover:bg-primary/10 data-[destructive=false]:hover:border-primary/70",
      "disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl text-sm font-medium transition-colors mt-0",
      "bg-transparent border text-primary border-primary/40 hover:bg-primary/10 hover:border-primary/70",
      "disabled:opacity-50 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
