import * as React from "react"
import { RDZEN_STYL_2 } from '@/components/ui/style-przyciskow';
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AnimatedBorderInputProps
  extends React.ComponentProps<"input"> {
  label?: string
  icon?: React.ComponentType<{ className?: string }>
  endIcon?: React.ReactNode
  autoComplete?: string
}

const AnimatedBorderInput = React.forwardRef<HTMLInputElement, AnimatedBorderInputProps>(
  ({ className, label, icon: Icon, endIcon, id, autoComplete, ...props }, ref) => {
    return (
      <div className="space-y-3">
        {label && (
          <Label htmlFor={id} className="text-brand-text-secondary font-semibold text-sm">
            {label}
          </Label>
        )}
        <div className="relative group/gradient">          {/*
            FOKUS W JEZYKU PLATFORMY, NIE WIRUJACY PIERSCIEN (06.08.2026).

            Bylo tu `.animated-gradient-border-glow`: `conic-gradient` na PELNYM
            `hsl(var(--primary))` z `animation: spin-slow 4s linear infinite`.
            Michal: „zobacz jak fatalnie to wyglada po klikniciu". Trzy powody,
            dla ktorych to nie mogло zostac:
              • pelne nasycenie akcentu na obwodzie pola krzyczy glosniej niz
                glowne wezwanie do dzialania obok
              • zaden inny element platformy nie ma wirujacego rantu na focusie
                — fokus wszedzie indziej to `ring` w kolorze `--ring`
              • animacja chodzi BEZ KONCA dopoki pole jest aktywne, tuz pod
                tafla karty, wiec przegladarka przelicza ja w kazdej klatce

            Fokus robi teraz to samo, co reszta platformy: rant przechodzi
            w akcent, dochodzi miekki pierscien. Spokojnie i rozpoznawalnie.
          */}
          
          {/* Input container */}
          <div className="relative">
            {Icon && (
              <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-text-secondary group-focus-within/gradient:text-primary transition-colors z-10" />
            )}
            <Input
              id={id}
              name={id}
              ref={ref}
              autoComplete={autoComplete}
              className={cn(
                /*
                  POLE NA STYLU 2 Z BIBLIOTEKI — I DLACZEGO NIE NA `nb-wiersz`.

                  ① Było `bg-background/65`: 65% krycia w środku szklanej karty,
                     czyli prawie nieprzezroczysta płyta. To odpadło.

                  ② PIERWSZA PRÓBA BYŁA BŁĘDNA i Michał ją od razu złapał:
                     „nie widać ramek, gdzie kliknąć czy na telefonie dotknąć".
                     Dałem `nb-wiersz`, a to WGŁĘBIENIE BIERNE — rant z `--border`
                     (`210 12% 11%`, prawie czerń). Zmierzony kontrast rantu do
                     tła strony: 1,06 : 1. Dla porównania sąsiedni przycisk
                     Google na `RDZEN_STYL_2` miał 18,25 : 1. Pole było
                     praktycznie niewidoczne, a na dotyku nie ma kursora, który
                     by to nadrobił.

                  ③ Pole tekstowe i przycisk obwódkowy to ta sama klasa
                     afordancji — „tu możesz działać" — więc dostają ten sam
                     przepis. `nb-wiersz` zostaje dla rzeczy BIERNYCH: wierszy
                     listy, wymagań hasła, zgód.
                */
                "h-14 border text-foreground placeholder:text-muted-foreground rounded-xl font-medium transition-colors duration-200",
                RDZEN_STYL_2,
                /*
                  FOKUS — RANT W AKCENCIE + MIĘKKI PIERŚCIEŃ.

                  Poprzednie `focus:border-transparent focus:ring-0` zdejmowało
                  WSZYSTKO, bo cały sygnał brał na siebie wirujący pierścień
                  obok. Skoro tamten odpadł, fokus musiał dostać coś swojego —
                  inaczej po kliknięciu nie działo się nic.

                  `--ring` to ten sam token, którego platforma używa na fokusie
                  przycisków i kafelków. Bez animacji: sygnał ma być stanem,
                  nie ruchem.
                */
                /*
                  `focus:`, A NIE `focus-visible:` — I TO NIE JEST NIEDBALSTWO.

                  `:focus-visible` przeglądarka zapala wg heurystyki „czy
                  użytkownik nawiguje klawiaturą". Dla PRZYCISKU to sensowne:
                  klik myszą już sam siebie potwierdza. Dla POLA TEKSTOWEGO nie:
                  po kliknięciu w nie użytkownik zaczyna pisać i musi widzieć,
                  DOKĄD trafi tekst — zwłaszcza gdy pól jest kilka pod sobą.
                  Zmierzone: przy `focus-visible:` klik myszą nie zmieniał ani
                  rantu, ani cienia.
                */
                "focus:outline-none focus:border-primary/60",
                "focus:ring-2 focus:ring-ring/40 focus:ring-offset-0",
                Icon ? "pl-12" : "pl-4",
                endIcon ? "pr-12" : "pr-4",
                className
              )}
              {...props}
            />
            {endIcon && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
                {endIcon}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
AnimatedBorderInput.displayName = "AnimatedBorderInput"

export { AnimatedBorderInput }
