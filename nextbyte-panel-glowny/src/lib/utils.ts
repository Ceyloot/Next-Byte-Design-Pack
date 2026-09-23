import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * twMerge musi ZNAĆ nazwane rozmiary pisma systemu wyglądu (tailwind.config.ts: text-etykieta / meta / tresc /
 * tytul / liczba / przycisk). Bez tego traktuje nieznane `text-*` jak KOLOR i `cn('text-meta', 'text-success')`
 * wyrzuca `text-meta` jako „nadpisany kolor” — zmierzone 17.09.2026: etykiety Status rosły do 16 px, bo rozmiar
 * ginął w merge'u (Kajetan: „etykiety nie są dostosowane wymiarem do napisów”).
 * To samo dla promieni (rounded-pole/rekord/sekcja/okno), cieni (shadow-aureola/okno) i czasów (duration-szybko/okno).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-etykieta', 'text-meta', 'text-tresc', 'text-tytul', 'text-liczba', 'text-przycisk'],
      rounded: ['rounded-pole', 'rounded-rekord', 'rounded-sekcja', 'rounded-okno'],
      shadow: ['shadow-aureola', 'shadow-okno'],
      duration: ['duration-szybko', 'duration-okno'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
