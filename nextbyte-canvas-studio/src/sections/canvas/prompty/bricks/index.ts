/**
 * SEKCJA 3 — BRICKS (RULES)
 * =========================
 * 7 bricków złożonych z tekstów „Studio Zdjęć — prompty systemowe” (PDF, 28.09.2026):
 * każda zasada występuje RAZ (wcześniej „ONE photograph” padało 4×, światło i cienie 3×).
 * Pozycje PDF w komentarzu każdego pliku. Numer = kolejność w prompcie.
 */
import type { Brick, BrickId } from '../types'
import { STUDIO_REFERENCJA } from './01-studio-referencja'
import { STUDIO_USUNIECIE } from './02-studio-usuniecie'
import { STUDIO_MIEJSCE } from './03-studio-miejsce'
import { STUDIO_SCENA } from './04-studio-scena'
import { STUDIO_JEDNO_ZDJECIE } from './05-studio-jedno-zdjecie'
import { STUDIO_CZLOWIEK } from './06-studio-czlowiek'
import { STUDIO_KONTROLA } from './07-studio-kontrola'

export const BRICKS: Record<BrickId, Brick> = {
  'studio-referencja': STUDIO_REFERENCJA,
  'studio-usuniecie': STUDIO_USUNIECIE,
  'studio-miejsce': STUDIO_MIEJSCE,
  'studio-scena': STUDIO_SCENA,
  'studio-jedno-zdjecie': STUDIO_JEDNO_ZDJECIE,
  'studio-czlowiek': STUDIO_CZLOWIEK,
  'studio-kontrola': STUDIO_KONTROLA,
}

/** Wszystkie bricki w kolejności numerów. */
export const BRICK_LIST: Brick[] = Object.values(BRICKS).sort((a, b) => a.numer - b.numer)

export function getBrick(id: BrickId): Brick {
  return BRICKS[id]
}
