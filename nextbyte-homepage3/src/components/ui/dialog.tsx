import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════════
   DIALOG — modale z dowolną treścią
   ═══════════════════════════════════════════════════════════════════ */

const Dialog        = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose   = DialogPrimitive.Close
const DialogPortal  = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-border bg-card p-6",
        "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className={cn(
        "absolute right-4 top-4 rounded-lg p-1.5",
        "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
        "disabled:pointer-events-none",
      )}>
        <X className="h-4 w-4" />
        <span className="sr-only">Zamknij</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div className={cn("mb-4 flex flex-col gap-1.5 pr-6", className)} {...props} />
)

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-heading text-lg font-semibold text-card-foreground", className)}
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

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div
    className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
)

export {
  Dialog, DialogTrigger, DialogClose, DialogPortal, DialogOverlay,
  DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
}

/* ═══════════════════════════════════════════════════════════════════
   ALERT DIALOG — modalne potwierdzenia destruktywnych akcji
   ═══════════════════════════════════════════════════════════════════ */

const AlertDialog        = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal  = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-border bg-card p-6",
        "shadow-[0_2px_4px_0_rgb(0_0_0/0.08),0_16px_40px_-16px_rgb(0_0_0/0.4),inset_0_1px_0_0_rgb(255_255_255/0.06)]",
        "focus:outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
)

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("font-heading text-lg font-semibold text-card-foreground", className)}
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className, ...props
}) => (
  <div
    className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    {...props}
  />
)

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold",
      "border border-destructive/40 bg-destructive/[0.06] text-destructive",
      "hover:border-destructive/70 hover:bg-destructive/[0.12]",
      "focus:outline-none focus:ring-2 focus:ring-destructive/60 focus:ring-offset-2 focus:ring-offset-card",
      "transition-colors duration-150",
      className,
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
      "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold",
      "border border-border bg-foreground/[0.02] text-foreground",
      "hover:bg-foreground/[0.06]",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
      "transition-colors duration-150",
      className,
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
}
