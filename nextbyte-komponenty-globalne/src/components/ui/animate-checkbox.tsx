import React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { KLASY_POLA_WYBORU } from "./checkbox"

export function AnimatedCheckbox({
  className,
  checked: checkedProp,
  onCheckedChange: setCheckedProp,
  disabled,
  defaultChecked,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  const [_checked, _setChecked] =
    React.useState<CheckboxPrimitive.CheckedState>(defaultChecked ?? false)

  const checked = checkedProp ?? _checked

  const setChecked = React.useCallback(
    (
      value:
        | CheckboxPrimitive.CheckedState
        | ((value: CheckboxPrimitive.CheckedState) => boolean),
    ) => {
      const checkedState = typeof value === "function" ? value(checked) : value
      if (setCheckedProp) {
        setCheckedProp(checkedState)
      } else {
        _setChecked(checkedState)
      }
    },
    [setCheckedProp, checked],
  )

  /*
    ── TEN SAM MATERIAŁ CO ZWYKŁY CHECKBOX ─────────────────────────────────
    Michał: „ikona zaznaczania zgody w logowaniu i rejestracji, ten checkbox
    jest w ogóle przebudowany".

    Miał rację i to była luka w mojej wcześniejszej robocie: przebudowałem
    `ui/checkbox`, który stoi w 79 miejscach, ale trzy pola zgody w Auth.tsx
    (regulamin, marketing, „zapamiętaj na 30 dni") idą przez TEN komponent
    i zostały z gołym shadcn — ostry niebieski kwadracik 16 px w jedynym
    miejscu, które nowy użytkownik widzi PRZED wejściem do platformy.

    Klasy pochodzą teraz ze wspólnej stałej `KLASY_POLA_WYBORU`, więc oba
    warianty nie mają jak się rozjechać. Zostaje to, co ten komponent wnosi
    naprawdę: RYSOWANY ptaszek zamiast wstawianego.

    ── DLACZEGO ZNIKŁO SKALOWANIE ──────────────────────────────────────────
    Opakowanie miało `whileHover: scale 1.05` i `whileTap: scale 0.95`.
    Skalowany transform unieważnia `backdrop-filter` u przodka, a te pola
    stoją w szklanej karcie logowania — czyli każde najechanie na checkbox
    gasiło szkło pod całym formularzem. Odczucie klikalności niosą teraz
    przejścia na kolorze i krawędzi, które kompozytora nie ruszają.
  */
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(value) => setChecked(!!value)}
      disabled={disabled}
      data-tap-target="off"
      className={cn(KLASY_POLA_WYBORU, "flex items-center justify-center", className)}
      {...props}
    >
      <motion.svg
        className="h-[13px] w-[13px]"
        viewBox="0 0 12 12"
        fill="none"
        initial={false}
      >
          <motion.path
            d="M2.5 6L4.5 8L9.5 3"
            stroke="currentColor"
          strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={checked ? "checked" : "unchecked"}
            variants={{
              checked: {
                pathLength: 1,
                strokeDasharray: "1 1",
                opacity: 1,
                transition: {
                  pathLength: { duration: 0.2, ease: "easeInOut", delay: 0.1 },
                  strokeDasharray: { duration: 0.2, ease: "easeInOut", delay: 0.1 },
                  opacity: { duration: 0.1, ease: "easeInOut" },
                },
              },
              unchecked: {
                pathLength: 0,
                strokeDasharray: "0 1",
                opacity: 0,
                transition: {
                  pathLength: { duration: 0.3, ease: "easeInOut" },
                  strokeDasharray: { duration: 0.3, ease: "easeInOut", delay: 0.1 },
                  opacity: { duration: 0.3, ease: "easeInOut", delay: 0.1 },
                },
              },
            }}
          />
      </motion.svg>
    </CheckboxPrimitive.Root>
  )
}
