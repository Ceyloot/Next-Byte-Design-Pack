import { Toaster as Sonner, type ToasterProps } from "sonner"

/* ── Toaster — montuj raz w korzeniu aplikacji ───────────────────── *
 *  Używa zmiennych CSS motywu, więc reaguje na zmianę data-theme.    *
 *  Re-export `toast` z "sonner" wystarczy wszędzie indziej.          */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      style={
        {
          "--normal-bg":      "hsl(var(--popover))",
          "--normal-text":    "hsl(var(--popover-foreground))",
          "--normal-border":  "hsl(var(--border))",
          "--success-bg":     "hsl(var(--popover))",
          "--success-text":   "hsl(var(--popover-foreground))",
          "--success-border":  "hsl(var(--primary) / 0.4)",
          "--error-bg":       "hsl(var(--popover))",
          "--error-text":     "hsl(var(--destructive))",
          "--error-border":   "hsl(var(--destructive) / 0.4)",
          "--warning-bg":     "hsl(var(--popover))",
          "--warning-text":   "hsl(var(--popover-foreground))",
          "--border-radius":  "var(--radius)",
          "--font-family":    "var(--font-body), Inter, ui-sans-serif",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:border group-[.toaster]:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.28)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { toast } from "sonner"
