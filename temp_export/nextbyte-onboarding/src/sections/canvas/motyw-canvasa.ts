import { useCallback, useEffect, useState } from 'react'
import { odczytajAktualnyMotyw, przelaczNastepnyMotyw } from '@/sections/panel2/fundament/kolejka-motywow'

/**
 * Motyw Canvasa: domyślnie jasny („Przyszły”), z przełącznikiem na ciemny.
 *
 * Wybór zapamiętujemy osobno (`nb-canvas-motyw`), żeby Canvas pamiętał własny
 * nastrój, a wyjście z niego oddawało reszcie platformy motyw sprzed wejścia.
 */
const KLUCZ = 'nb-canvas-motyw'
const KLUCZ_PLATFORMY = 'nb-aktywny-motyw'
const DOZWOLONE = ['future-theme', 'dark-theme']

function ustaw(id: string) {
  document.documentElement.setAttribute('data-theme', id)
  try {
    localStorage.setItem(KLUCZ_PLATFORMY, id)
  } catch {}
  const pozycja = { id, jasny: id === 'future-theme' }
  // App.tsx nasłuchuje tych zdarzeń i trzyma stan motywu
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: pozycja }))
  window.dispatchEvent(new CustomEvent('nb-theme-change', { detail: pozycja }))
}

export function useMotywCanvasa() {
  const [jasny, setJasny] = useState(() => (typeof document !== 'undefined' ? odczytajAktualnyMotyw().jasny : true))

  useEffect(() => {
    let poprzedni: string | null = null
    let poprzedniZapis: string | null = null
    let zastosowany = false

    const naZmiane = (e: Event) => {
      const id = (e as CustomEvent<{ id?: string }>).detail?.id
      if (!id) return
      setJasny(id === 'future-theme')
      if (!DOZWOLONE.includes(id)) return
      try {
        localStorage.setItem(KLUCZ, id)
      } catch {}
    }

    // Efekty dzieci biegną przed efektami App, które na starcie ustawiają `data-theme` —
    // dlatego motyw Canvasa nakładamy dopiero po tej turze, inaczej zostałby nadpisany.
    const start = window.setTimeout(() => {
      poprzedni = document.documentElement.getAttribute('data-theme')
      let zapisany: string | null = null
      try {
        poprzedniZapis = localStorage.getItem(KLUCZ_PLATFORMY)
        zapisany = localStorage.getItem(KLUCZ)
      } catch {}
      const cel = zapisany && DOZWOLONE.includes(zapisany) ? zapisany : 'future-theme'
      if (cel !== poprzedni) ustaw(cel)
      setJasny(cel === 'future-theme')
      zastosowany = true
      window.addEventListener('nb-theme-change', naZmiane)
    }, 0)

    return () => {
      window.clearTimeout(start)
      window.removeEventListener('nb-theme-change', naZmiane)
      if (!zastosowany) return
      // Reszta platformy dostaje z powrotem swój motyw
      if (poprzedni && poprzedni !== document.documentElement.getAttribute('data-theme')) ustaw(poprzedni)
      try {
        if (poprzedniZapis) localStorage.setItem(KLUCZ_PLATFORMY, poprzedniZapis)
        else localStorage.removeItem(KLUCZ_PLATFORMY)
      } catch {}
    }
  }, [])

  const przelacz = useCallback(() => {
    przelaczNastepnyMotyw()
  }, [])

  return { jasny, przelacz }
}
