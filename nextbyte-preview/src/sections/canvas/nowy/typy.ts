import type { PytanieORole } from '../role-z-polecenia'
import type { Pineska, Warstwa } from '../typy'

/**
 * NOWY SYSTEM PROMPTOWANIA — typy (zarys v0).
 *
 * Założenie: struktura siedzi w danych (zdjęcia z rolami, pinezki z rolami), a prompt jest z nich generowany krótko:
 * [ROLES] + [REQUEST = słowa użytkownika bez zmian] + [KEEP] + [FORBID].
 */

/** Co użytkownik chce zrobić — rozpoznane z czasownika w zdaniu (regex, bez wywołań AI). */
export type RodzajZadania = 'zamien' | 'przenies' | 'wstaw' | 'usun' | 'edycja'

/**
 * Rola pinezki w zadaniu:
 *  cel     — rzecz/osoba, którą zmieniamy (zamieniana, usuwana),
 *  zrodlo  — rzecz/osoba, którą bierzemy (z innego zdjęcia albo z innego miejsca tego samego),
 *  miejsce — punkt, w którym coś ma wylądować,
 *  obszar  — miejsce, do którego odnosi się polecenie (edycja swobodna).
 */
export type RolaPinezki = 'cel' | 'zrodlo' | 'miejsce' | 'obszar'

export interface PinezkaZRola {
  /** numer widoczny dla użytkownika (chip w czacie, numer na pinezce) */
  numer: number
  pineska: Pineska
  rola: RolaPinezki
  /** numer obrazu w wysyłce do modelu (1 = baza) */
  obraz: number
}

export interface PrzygotowaneZadanie {
  rodzaj: RodzajZadania
  /** zdjęcie edytowane i zwracane (Image 1) */
  baza: Warstwa
  /** pozostałe zdjęcia (Image 2…), każde jako referencja */
  referencje: Warstwa[]
  pinezki: PinezkaZRola[]
  prompt: string
  /** jedno zdanie po polsku: co system zrozumiał (do podglądu w czacie) */
  opis: string
}

export type Przygotowanie =
  | { ok: true; zadanie: PrzygotowaneZadanie }
  | { ok: false; pytanie: PytanieORole }
  | { ok: false; blad: string }
