import type { Pineska, Warstwa } from '../typy'
import { zlozPrompt } from './prompt'
import { etykietaPinezki, rozstrzygnijRole } from './role'
import type { Przygotowanie } from './typy'


const NAZWY: Record<string, string> = { zamien: 'Zamiana', przenies: 'Przeniesienie', wstaw: 'Wstawienie', usun: 'Usunięcie', edycja: 'Edycja' }

/**
 * Wejście: to, co jest na ekranie. Wyjście: gotowe zadanie (zdjęcia w kolejności wysyłki + prompt) albo pytanie o bazę, albo błąd.
 * Żadnych wywołań AI — role i prompt powstają z danych i czasownika w zdaniu.
 */
export function przygotujNowySystem(w: {
  tekst: string
  pineski: Pineska[]
  warstwy: Warstwa[]
  zaznaczone: string[]
  wybrana: string | null
  odpowiedzBazaId: string | null
}): Przygotowanie {
  const wynik = rozstrzygnijRole(w)
  if (!wynik.ok) return wynik
  const kolejnosc = [wynik.baza, ...wynik.referencje]
  const numerObrazu = (layerId: string) => Math.max(1, kolejnosc.findIndex(x => x.id === layerId) + 1)
  const pinezki = wynik.pinezki.map(p => ({ ...p, obraz: numerObrazu(p.pineska.layerId) }))
  const prompt = zlozPrompt({ rodzaj: wynik.rodzaj, tekst: w.tekst, pinezki, liczbaReferencji: wynik.referencje.length })
  const opisPinesek = pinezki.map(p => `${p.numer} „${etykietaPinezki(p.pineska, p.numer)}” (${p.rola})`).join(', ')
  return {
    ok: true,
    zadanie: {
      rodzaj: wynik.rodzaj,
      baza: wynik.baza,
      referencje: wynik.referencje,
      pinezki,
      prompt,
      opis: `${NAZWY[wynik.rodzaj]}: baza „${wynik.baza.name}”${wynik.referencje.length ? `, ${wynik.referencje.length} ref.` : ''}${opisPinesek ? `; pinezki ${opisPinesek}` : ''}.`,
    },
  }
}
