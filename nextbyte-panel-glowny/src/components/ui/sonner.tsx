import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton={true}
      duration={1000}
      pauseWhenPageIsHidden={true}
      gap={8}
      visibleToasts={5}
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        right: '16px',
      }}
      toastOptions={{
        duration: 2000,
        classNames: {
          /* `!pr-9`: przycisk „×" siedzi w prawym górnym rogu WEWNĄTRZ toastu,
             więc treść i przycisk akcji („Cofnij") muszą kończyć się przed nim
             (Michał 03.09.2026: „× nachodzi na cofanie"). */
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:!pr-9 nb-szklo-menu group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-primary/20 group-[.toaster]:shadow-[inset_0_1px_0_0_hsl(var(--foreground)/var(--nb-kaf-refleks,0.06)),0_12px_40px_-12px_hsl(0_0%_0%/0.45),0_0_40px_hsl(var(--primary)/0.10)]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          title: "group-[.toast]:font-semibold",
          actionButton:
            "group-[.toast]:bg-primary/20 group-[.toast]:text-foreground group-[.toast]:border group-[.toast]:border-primary/40 group-[.toast]:rounded-lg group-[.toast]:hover:bg-primary/30",
          cancelButton:
            "group-[.toast]:bg-foreground/10 group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:hover:bg-foreground/20",
          closeButton:
            "group-[.toast]:!bg-foreground/10 group-[.toast]:!text-muted-foreground group-[.toast]:hover:!bg-foreground/20 group-[.toast]:!border-border/50 group-[.toast]:!rounded-full group-[.toast]:!w-5 group-[.toast]:!h-5 group-[.toast]:!top-2 group-[.toast]:!right-2 group-[.toast]:!left-auto group-[.toast]:!transform-none",
          success: "group-[.toaster]:border-primary/40 group-[.toaster]:shadow-[inset_0_1px_0_0_hsl(var(--foreground)/var(--nb-kaf-refleks,0.06)),0_12px_40px_-12px_hsl(0_0%_0%/0.45),0_0_40px_hsl(var(--primary)/0.20)]",
          error: "group-[.toaster]:border-destructive/40 group-[.toaster]:shadow-[inset_0_1px_0_0_hsl(var(--foreground)/var(--nb-kaf-refleks,0.06)),0_12px_40px_-12px_hsl(0_0%_0%/0.45),0_0_40px_hsl(var(--destructive)/0.20)]",
          warning: "group-[.toaster]:border-primary/30 group-[.toaster]:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.3),0_0_40px_hsl(var(--primary)/0.15)]",
          info: "group-[.toaster]:border-primary/35 group-[.toaster]:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.3),0_0_40px_hsl(var(--primary)/0.18)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
