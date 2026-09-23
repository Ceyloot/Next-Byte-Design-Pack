import type { KitAccent } from './kit';

// ─────────────────────────────────────────────────────────────────────────────
// AKCENT MODUŁU — jeden kolor na całą chmurę: cyjan.
//
// Kit wymaga kompletu trzech wartości, nie jednej: bazowa niesie stan aktywny i poświatę,
// jasna musi być czytelna jako ikona na czarnym tle, głęboka jest drugim przystankiem
// gradientu przycisku głównego. Podmiana samej bazowej dałaby cyjanowy przycisk
// z fioletową ikoną — patrz komentarz w engineKit.
//
// Dobrane tak, żeby nie kolidowało z zajętymi tożsamościami modułów:
//   Studio Zdjęć / Generator Dokumentów — fiolet #ab30e8
//   Galeria Realizacji                  — bursztyn #f19d27
//
// Wartości zapisane wprost, bez liczenia w locie (ta sama zasada, co w kicie):
//   base  hsl(187 80% 48%)   light hsl(189 85% 76%)   deep  hsl(200 80% 35%)
// ─────────────────────────────────────────────────────────────────────────────

export interface CloudAccent extends KitAccent {
  /**
   * Mnożnik mocy tła. Krycie i jasność to dwie różne rzeczy: ta sama wartość opacity
   * daje inny efekt dla jasnej i ciemnej barwy. Luminancja względna fioletu Studia
   * (#ab30e8) = 0,166, naszego cyjanu (#18c5dc) = 0,453 — cyjan jest 2,7× jaśniejszy,
   * więc przy krycia 1:1 zalałby ekran mimo liczb zgodnych ze Studiem.
   *
   * 0,166 / 0,453 = 0,37. Policzone raz i wpisane, nigdy wołane w renderze.
   */
  glow: number;
}

export const ACCENT_NEXTCLOUD: CloudAccent = {
  base: '#18c5dc',
  light: '#8ee6f6',
  deep: '#1271a1',
  glow: 0.37,
};

/**
 * Zamienia krycie 0–1 na dwucyfrowy sufiks szesnastkowy doklejany do koloru (#rrggbbAA).
 * Używane zamiast rgba(), bo akcent przychodzi jako hex i nie chcemy go rozbierać
 * na składowe w każdym komponencie.
 */
export const alpha = (hex: string, opacity: number): string => {
  const clamped = Math.max(0, Math.min(1, opacity));
  return hex + Math.round(clamped * 255).toString(16).padStart(2, '0');
};
