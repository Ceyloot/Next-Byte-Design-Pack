// ─────────────────────────────────────────────────────────────────────────────
// MATEMATYKA KOLORU — JEDNO ŹRÓDŁO.
//
// ⚠️ To repo ma chroniczny problem z kopiowaniem matematyki (CLAUDE.md: geometria miała dwie kopie
// rozjeżdżające się w 21% wejść, rabaty trzy). Samą luminancję ma dziś w trzech miejscach
// (`documentSkins.ts`, `SkinCreator.tsx`, `DocumentCanvasEditor.tsx`) — każda liczy „czarny czy
// biały tekst na tym tle", żadna nie liczy ratio ani progu.
//
// Ten moduł jest kanonicznym źródłem dla SILNIKA dokumentów. `documentValidator.ts` bierze
// luminancję i kontrast STĄD, zamiast mieć własną kopię — inaczej wyprowadzanie skórki z marki
// firmy (`brandDna.ts`) i walidator kontrastu liczyłyby ten sam wzór dwa razy, a to jest dokładnie
// ten wzorzec, który już raz kosztował 21% rozjazdu.
// ─────────────────────────────────────────────────────────────────────────────

export type Rgb = [number, number, number];

/** Hex → RGB. Przyjmuje `#abc`, `abc`, `#aabbcc`, `aabbcc`. Null gdy niepoprawny. */
export const hexToRgb = (hex: string): Rgb | null => {
  let s = String(hex || '').trim().replace('#', '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgbToHex = ([r, g, b]: Rgb): string =>
  '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

const channelLum = (c: number): number => {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
};

/** Relatywna luminancja sRGB (0..1) wg WCAG. Null dla niepoprawnego hexa. */
export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(channelLum) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrast WCAG, zawsze ≥1: `(L1+0.05)/(L2+0.05)`. Null gdy którykolwiek hex niepoprawny. */
export function contrastRatio(hexA: string, hexB: string): number | null {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  if (la == null || lb == null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Mieszanie dwóch barw w przestrzeni sRGB. `t` = ile jest `a` (1 = czysty `a`, 0 = czysty `b`).
 *
 * Świadomie liniowo po sRGB, a nie po luminancji: wyprowadzamy tu barwy POCHODNE marki
 * (tekst słabszy, linie, wypełnienia), a nie przejścia gradientu. Mieszanie po sRGB zachowuje
 * podton marki — a podton jest w tym projekcie wartością, nie szumem (D.1: `#888d8f` u Vidomontu
 * łamie achromatyczność i został wyzerowany, u NextByte'a ten sam podton jest zgodny z marką).
 */
export function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const k = Math.max(0, Math.min(1, t));
  return rgbToHex([
    ra[0] * k + rb[0] * (1 - k),
    ra[1] * k + rb[1] * (1 - k),
    ra[2] * k + rb[2] * (1 - k),
  ]);
}

/**
 * Dociąga kolor do progu kontrastu wobec tła — **przesuwając go w stronę tuszu albo papieru**,
 * nigdy w losową stronę.
 *
 * To jest odpowiednik ręcznych napraw z F.3 (`#b9b9b9` → `#8f8f8f`, bo 1,96:1 < 3:1) wykonany
 * automatycznie. ⚠️ Kluczowe: przesuwamy po osi papier↔tusz **marki**, więc wynik zostaje w jej
 * palecie. Naiwne „przyciemnij do czerni" wypłukałoby podton i dało barwę, której marka nie ma.
 *
 * Zwraca oryginał, gdy próg jest już spełniony albo gdy nie da się go osiągnąć (wtedy walidator
 * to pokaże — lepiej jawna porażka niż cicha podmiana na coś obcego).
 */
export function ensureContrast(kolor: string, tlo: string, prog: number, tusz: string): string {
  const teraz = contrastRatio(kolor, tlo);
  if (teraz == null || teraz >= prog) return kolor;
  // 24 kroki po 4% w stronę tuszu — dość gęsto, by nie przeskoczyć progu o więcej niż trzeba.
  let najlepszy = kolor;
  for (let i = 1; i <= 24; i++) {
    const kandydat = mix(tusz, kolor, i * 0.04);
    const r = contrastRatio(kandydat, tlo);
    najlepszy = kandydat;
    if (r != null && r >= prog) return kandydat;
  }
  return najlepszy;   // nie dało się — oddajemy najlepsze przybliżenie, walidator zgłosi brak
}

/**
 * Znajduje mieszaninę `tusz`↔`tlo`, która ma wobec `tlo` zadany kontrast.
 *
 * ⚠️ Po co to zamiast stałej proporcji. Mieszanie liniowe przy ustalonym `t` daje **ten sam
 * kontrast** niezależnie od jasności papieru — a zmierzone marki (D.1) pokazują, że tak być nie
 * powinno: `rule` na białej kartce ma 1,53:1, ta sama linia na czarnej ma **3,72:1**. Nie jest to
 * niekonsekwencja projektanta, tylko właściwość widzenia — słaba linia na ciemnym tle znika
 * szybciej niż na jasnym. Wyprowadzanie po stałej proporcji dawało na skórce Noc linie o kontraście
 * 1,62 zamiast 3,72, czyli **ponad dwukrotnie za słabe**. Zmierzone, nie przewidziane.
 *
 * Szukamy bisekcją: kontrast rośnie monotonicznie z `t`, więc 30 kroków daje dokładność
 * poniżej rozdzielczości 8-bitowego kanału.
 */
export function mixDoKontrastu(tusz: string, tlo: string, cel: number): string {
  let lo = 0, hi = 1, wynik = mix(tusz, tlo, 0.5);
  for (let i = 0; i < 30; i++) {
    const t = (lo + hi) / 2;
    const kandydat = mix(tusz, tlo, t);
    const r = contrastRatio(kandydat, tlo) ?? 1;
    wynik = kandydat;
    if (r < cel) lo = t; else hi = t;
  }
  return wynik;
}

/** Czy tło jest ciemne (luminancja < 0,5) — ten sam próg, którego używa `printDocument` dla spadu. */
export const jestCiemne = (hex: string): boolean => {
  const l = relativeLuminance(hex);
  return l != null && l < 0.5;
};
