import * as React from "react"
import { cn } from "@/lib/utils"
import { PlynnyKursor, scalRefy, useDotyk } from "./plynny-kursor"

/**
 * PŁYNNY KURSOR JEST TU, A NIE TYLKO W `pola.tsx`.
 *
 * Pierwsze wdrożenie objęło wyłącznie komponenty biblioteki (`Pole`,
 * `Szukajka`) — 19 plików. Zmierzone 13.08.2026: `Input` importują **348
 * plików**, `Textarea` 176. Czyli „na całej platformie" było wtedy nieprawdą:
 * pokrycie wynosiło około trzech procent miejsc, w których się pisze.
 *
 * Wyłączone tam, gdzie karetki nie ma albo stoi gdzie indziej niż szerokość
 * tekstu: pola liczbowe, daty, kolor, plik, zakres, a także `disabled`
 * i `readOnly`.
 */
const TYPY_BEZ_KARETKI = new Set([
  "number", "date", "datetime-local", "month", "week", "time",
  "color", "range", "file", "checkbox", "radio", "submit", "button", "image", "reset", "hidden",
])

export interface InputProps extends React.ComponentProps<"input"> {
  /** Wyłącza płynną karetkę w tym jednym polu (maski, edytory kodu). */
  plynnyKursor?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, plynnyKursor = true, style, ...props }, ref) => {
    const wewnRef = React.useRef<HTMLInputElement>(null)
    const dotyk = useDotyk()
    const plynny =
      !dotyk &&
      plynnyKursor &&
      !props.disabled &&
      !props.readOnly &&
      !TYPY_BEZ_KARETKI.has(type ?? "text")

    return (
      <div className="relative w-full group/input">
        {/* Wirująca obwódka usunięta 04.08.2026 — patrz `textarea.tsx`. */}
        <input
          type={type}
          className={cn(
            "relative flex h-10 w-full rounded-md border border-input bg-[hsl(var(--background)/var(--nb-szklo-krycie,1))] px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-300",
            className
          )}
          /* `!dotyk` — na telefonie karetka zostaje systemowa, razem z uchwytami
             zaznaczenia. Warunek MUSI być ten sam, którym bramkuje się nakładka
             (`useDotyk` w plynny-kursor.tsx), inaczej pole schowa karetkę,
             a nakładka jej nie narysuje — i nie ma żadnej. */
          // Prawdziwa karetka znika, naszą rysuje nakładka. Przez `style`,
          // bo `caret-transparent` w Tailwindzie przegrywa z regułami motywu.
          /* Znacznik dla karetki GLOBALNEJ: to pole rysuje kreskę samo,
             więc globalna ma je pominąć — inaczej byłyby dwie naraz. */
          data-plynny-kursor={plynny ? 'wlasny' : undefined}
          style={plynny ? { caretColor: "transparent", ...style } : style}
          ref={scalRefy<HTMLInputElement>(ref, wewnRef)}
          {...props}
        />
        {plynny && <PlynnyKursor polaRef={wewnRef} wartosc={props.value ?? props.defaultValue} />}
      </div>
    )
  }
)
Input.displayName = "Input"
export { Input }
