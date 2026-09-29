/**
 * SEKCJA 3 — BRICKS (cegiełki-zasady)
 * ====================================
 * Wyłącznie teksty ze „Studio Zdjęć — prompty systemowe” (PDF, staging 14f7246d8,
 * 28.09.2026) — numer pozycji w komentarzu każdego pliku. Zmiany względem PDF tylko
 * tam, gdzie reguła o osobie dotyczy dowolnego obiektu (person → subject) albo gdzie
 * trzeba wskazać obraz / pineskę Canvasu ({{IMAGE_TARGET}}, {{PIN_TARGET}}…).
 * Numer bricka wyznacza jego miejsce w złożonym prompcie (rosnąco).
 */
import type { Brick, BrickId } from '../types'
import { STUDIO_PRODUKT } from './01-studio-produkt'
import { STUDIO_OSOBA } from './02-studio-osoba'
import { STUDIO_UBRANIE } from './03-studio-ubranie'
import { STUDIO_TLO } from './04-studio-tlo'
import { STUDIO_STYL } from './05-studio-styl'
import { STUDIO_INNE } from './06-studio-inne'
import { STUDIO_TOZSAMOSC_REFERENCJI } from './07-studio-tozsamosc-referencji'
import { STUDIO_TOZSAMOSC_OSOBY } from './08-studio-tozsamosc-osoby'
import { STUDIO_USUNIECIE } from './09-studio-usuniecie'
import { STUDIO_MIEJSCE } from './10-studio-miejsce'
import { STUDIO_SCENA_ZOSTAJE } from './11-studio-scena-zostaje'
import { STUDIO_UKLAD_SCENY } from './12-studio-uklad-sceny'
import { STUDIO_JEDNO_ZDJECIE } from './13-studio-jedno-zdjecie'
import { STUDIO_PRZEOSWIETLENIE } from './14-studio-przeoswietlenie'
import { STUDIO_KAMERA } from './15-studio-kamera'
import { STUDIO_FILM } from './16-studio-film'
import { STUDIO_MONTAZ } from './17-studio-montaz'
import { STUDIO_ANATOMIA_BRICK } from './18-studio-anatomia'
import { STUDIO_REALIZM_SKORY } from './19-studio-realizm-skory'
import { STUDIO_KONTROLA } from './20-studio-kontrola'

export const BRICKS: Record<BrickId, Brick> = {
  'studio-produkt': STUDIO_PRODUKT,
  'studio-osoba': STUDIO_OSOBA,
  'studio-ubranie': STUDIO_UBRANIE,
  'studio-tlo': STUDIO_TLO,
  'studio-styl': STUDIO_STYL,
  'studio-inne': STUDIO_INNE,
  'studio-tozsamosc-referencji': STUDIO_TOZSAMOSC_REFERENCJI,
  'studio-tozsamosc-osoby': STUDIO_TOZSAMOSC_OSOBY,
  'studio-usuniecie': STUDIO_USUNIECIE,
  'studio-miejsce': STUDIO_MIEJSCE,
  'studio-scena-zostaje': STUDIO_SCENA_ZOSTAJE,
  'studio-uklad-sceny': STUDIO_UKLAD_SCENY,
  'studio-jedno-zdjecie': STUDIO_JEDNO_ZDJECIE,
  'studio-przeoswietlenie': STUDIO_PRZEOSWIETLENIE,
  'studio-kamera': STUDIO_KAMERA,
  'studio-film': STUDIO_FILM,
  'studio-montaz': STUDIO_MONTAZ,
  'studio-anatomia': STUDIO_ANATOMIA_BRICK,
  'studio-realizm-skory': STUDIO_REALIZM_SKORY,
  'studio-kontrola': STUDIO_KONTROLA,
}

/** Wszystkie bricki w kolejności numerów. */
export const BRICK_LIST: Brick[] = Object.values(BRICKS).sort((a, b) => a.numer - b.numer)

export function getBrick(id: BrickId): Brick {
  return BRICKS[id]
}
