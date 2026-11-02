import * as React from "react"

import { cn } from "@/lib/utils"
import { PlynnyKursor, scalRefy, useDotyk } from "./plynny-kursor"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  disableAnimation?: boolean;
  /**
   * Płynna karetka — domyślnie włączona, tak jak w `Input`.
   * W polu wielolinijkowym pozycję liczy LUSTRO pola (kopia z tym samym
   * łamaniem wierszy), bo karetka wędruje także w pionie.
   */
  plynnyKursor?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disableAnimation, plynnyKursor = true, style, ...props }, ref) => {
    const wewnRef = React.useRef<HTMLTextAreaElement>(null)
    const dotyk = useDotyk();
    const plynny = !dotyk && plynnyKursor && !props.disabled && !props.readOnly

    return (
      <div className="relative group/textarea">
        {/*
          WIRUJĄCA OBWÓDKA USUNIĘTA (04.08.2026).
          Michał: „usuń to niebieskie animacje przy wpisywaniu, odchodzimy
          od tego". Był to `conic-gradient` w kolorze akcentu, obracany
          w kółko przy fokusie — element z innego języka wizualnego niż
          reszta platformy, w dodatku dwukrotnie źródło błędów (czarne tło,
          potem wylany gradient). Fokus niesie teraz sama obwódka pola
          z `RDZEN_POLA`, tak jak wszędzie indziej.
        */}
        <textarea
          className={cn(
            /*
              TŁO Z TOKENU, NIE PEŁNE `bg-background` (04.08.2026).
              Michał: „w glassmorphistycznym chatinput tło się czarne robi".

              `bg-background` to PEŁNY kolor tła aplikacji — na ciemnym motywie
              prawie czerń. Wstawione w polu, które leży na szkle, zamieniało
              całą górę wejścia w czarny prostokąt: szkło pod spodem było,
              ale nic przez nie nie przechodziło, bo pole je zasłaniało.

              Teraz krycie idzie z `--nb-szklo-krycie` — tego samego tokenu,
              którym jedzie materiał platformy. Na ciemnych motywach 0, czyli
              pole jest przezroczyste i widać przez nie taflę; na jasnych 0.72,
              bo tam ciemny tekst musi stać na jasnej powierzchni.
              Miejsce użycia dalej może nadpisać (`bg-transparent` w Studiu).
            */
            "relative flex min-h-[80px] w-full rounded-md border border-input bg-[hsl(var(--background)/var(--nb-szklo-krycie,1))] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-300",
            className
          )}
          /* Znacznik dla karetki GLOBALNEJ: to pole rysuje kreskę samo,
             więc globalna ma je pominąć — inaczej byłyby dwie naraz. */
          data-plynny-kursor={plynny ? 'wlasny' : undefined}
          style={plynny ? { caretColor: "transparent", ...style } : style}
          ref={scalRefy<HTMLTextAreaElement>(ref, wewnRef)}
          {...props}
        />
        {plynny && <PlynnyKursor polaRef={wewnRef} wartosc={props.value ?? props.defaultValue} />}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
