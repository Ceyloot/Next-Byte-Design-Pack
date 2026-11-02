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
          /* PRZYCISKI Z `!` — JAK „×" NIŻEJ (27.09.2026). Michał, ze zrzutem
             „Usunięto 1 obraz · Cofnij": „fatalnie wygląda to Cofnij". Na
             produkcji „Cofnij" był BIAŁY z czarnym tekstem, 24 px, róg 4 px —
             domyślny wygląd Sonnera. Przyczyna: Sonner wstrzykuje swój CSS
             w trakcie działania strony, a w buildzie produkcyjnym jego <style>
             ląduje PO naszym arkuszu (zmierzone: indeks 2 wobec 1 w <head>).
             Reguła `[data-sonner-toast][data-styled=true] [data-button]` ma tę
             samą specyficzność co nasze klasy, więc wygrywała kolejnością.
             W trybie deweloperskim kolejność jest odwrotna — dlatego
             w podglądzie wyglądało dobrze. „×" miał `!` od początku, więc
             jako jedyny trzymał wygląd. Teraz pigułka w barwie motywu,
             44 px celu dotyku przez `nb-cel-dotyku-wokol`. */
          actionButton:
            "nb-cel-dotyku-wokol group-[.toast]:!h-8 group-[.toast]:!rounded-full group-[.toast]:!px-3.5 group-[.toast]:!text-[13px] group-[.toast]:!font-semibold group-[.toast]:!bg-primary/15 group-[.toast]:!text-primary group-[.toast]:!border group-[.toast]:!border-solid group-[.toast]:!border-primary/35 group-[.toast]:hover:!bg-primary/25 group-[.toast]:focus-visible:!ring-2 group-[.toast]:focus-visible:!ring-primary/50 transition-colors",
          cancelButton:
            "nb-cel-dotyku-wokol group-[.toast]:!h-8 group-[.toast]:!rounded-full group-[.toast]:!px-3.5 group-[.toast]:!text-[13px] group-[.toast]:!font-medium group-[.toast]:!bg-foreground/[0.06] group-[.toast]:!text-foreground/75 group-[.toast]:!border group-[.toast]:!border-solid group-[.toast]:!border-border group-[.toast]:hover:!bg-foreground/10 transition-colors",
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
