import { cn } from "@/lib/utils"

/*
  JEDNA ANIMACJA ŁADOWANIA W CAŁEJ PLATFORMIE.

  Ten `Skeleton` przyszedł z shadcn z `animate-pulse` — przygaszaniem
  i rozjaśnianiem całej belki naraz. Nasz `Szkielet` (`ui/stany.tsx`) używa
  PRZESUWANEGO PASMA ŚWIATŁA. Obie animacje żyły obok siebie: pasmo w 51
  miejscach, pulsowanie w 28 — czyli na sąsiednich ekranach ładowanie
  wyglądało inaczej, a na paru ekranach naraz.

  Pulsowanie czyta się jak element, który miga — czyli jak usterka. Pasmo ma
  KIERUNEK, więc mózg widzi „coś tu leci". Różnica jest w tym, co człowiek
  myśli, a nie w tym, co ładniejsze.

  Materiał jest przepisany z `Szkielet`, a nie importowany, bo to dwa różne
  kontrakty: tam komponent sam generuje wiersze, tu jest gołym prostokątem
  o rozmiarze z `className`. Wspólne jest to, co ma być wspólne — wygląd.
  Zmieniając jedno, zmień drugie: klatka `nb-polysk` (index.css) jest jedna.
*/
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-foreground/[0.06]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[nb-polysk_1.6s_ease-in-out_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.09] before:to-transparent",
        /* Kto prosił o mniej ruchu, dostaje samą powierzchnię bez pasma —
           kształt zostaje, animacja znika. */
        "motion-reduce:before:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
