/* ═══════════════════════════════════════════════════════════════
   ŻYWE ŹRÓDŁA — co się zmieniło na stronie / w filmie od ostatniego razu

   Źródło z linku to migawka z dnia dodania. Dokumentacje, cenniki,
   regulaminy i artykuły się zmieniają, a notatnik dalej odpowiada ze
   starej wersji. Tu źródło pamięta datę sprawdzenia; „Odśwież" pobiera
   je ponownie i pokazuje, które fragmenty doszły, a które zniknęły.

   Porównanie po zdaniach (nie po znakach): znaczniki czasu i białe znaki
   są zdejmowane, więc przesunięcie napisów o sekundę nie jest „zmianą".
   ═══════════════════════════════════════════════════════════════ */

const MIN_DL = 25; // krótsze kawałki to nawigacja, przyciski, śmieci — nie treść

function zdania(tekst) {
  return String(tekst || '')
    .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g, ' ')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((z) => z.replace(/\s+/g, ' ').trim())
    .filter((z) => z.length >= MIN_DL);
}

/**
 * @returns {{ dodane: string[], usuniete: string[], bezZmian: boolean, procent: number }}
 *   procent — jaka część nowej treści to nowe zdania (0–100)
 */
export function porownaj(stary, nowy) {
  const a = zdania(stary);
  const b = zdania(nowy);
  const zbA = new Set(a.map((z) => z.toLowerCase()));
  const zbB = new Set(b.map((z) => z.toLowerCase()));
  const dodane = [...new Set(b.filter((z) => !zbA.has(z.toLowerCase())))];
  const usuniete = [...new Set(a.filter((z) => !zbB.has(z.toLowerCase())))];
  return {
    dodane,
    usuniete,
    bezZmian: dodane.length === 0 && usuniete.length === 0,
    procent: b.length ? Math.round((dodane.length / b.length) * 100) : 0,
  };
}

/** Czy źródło da się odświeżyć — tylko to, co ma adres (strona, YouTube). */
export function odswiezalne(z) {
  return !!(z && ((z.type === 'youtube' && z.videoId) || z.url));
}

export function ileTemu(iso) {
  if (!iso) return 'nigdy';
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'przed chwilą';
  if (min < 60) return `${min} min temu`;
  const godz = Math.round(min / 60);
  if (godz < 24) return `${godz} godz. temu`;
  const dni = Math.round(godz / 24);
  return dni === 1 ? 'wczoraj' : `${dni} dni temu`;
}
