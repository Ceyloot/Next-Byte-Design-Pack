/**
 * ════════════════════════════════════════════════════════════════════════
 *  KRÓTKI OPIS URZĄDZENIA — do listy subskrypcji push
 * ════════════════════════════════════════════════════════════════════════
 *
 * Po co: `push_subscriptions` trzymała wyłącznie adres punktu końcowego, więc
 * na liście subskrybentów nie dało się powiedzieć, KTÓRE to urządzenie. Człowiek
 * pisze „nie dostaję powiadomień", a my nie wiemy, czy chodzi o telefon, czy
 * o laptopa, na którym kiedyś kliknął „pozwól".
 *
 * ŚWIADOMIE PROSTE. Rozpoznawanie przeglądarek z `userAgent` to studnia bez dna
 * — każda podszywa się pod poprzednie i biblioteka do tego waży więcej niż cały
 * ten moduł. Nam wystarczy odpowiedź na pytanie „telefon czy komputer i czyj",
 * bo tylko to jest przydatne przy wsparciu.
 *
 * KOLEJNOŚĆ SPRAWDZEŃ MA ZNACZENIE i to jest jedyna trudna rzecz tutaj:
 *   · Edge ma w nazwie „Chrome" — musi iść PRZED Chrome,
 *   · Chrome ma w nazwie „Safari" — musi iść PRZED Safari,
 *   · iPad od iPadOS 13 podaje się za Maca; poznajemy go po tym, że Mac
 *     z dotykiem to w praktyce iPad.
 * Odwrotna kolejność zwracałaby „Safari" dla wszystkiego, co nie jest Firefoksem.
 */

/** Nazwa przeglądarki. */
const przegladarka = (ua: string): string => {
  if (/Edg\//.test(ua)) return 'Edge';          // przed Chrome — zawiera „Chrome"
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\/|FxiOS/.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS/.test(ua)) return 'Chrome'; // przed Safari — zawiera „Safari"
  if (/Safari\//.test(ua)) return 'Safari';
  return 'przeglądarka';
};

/** Rodzaj urządzenia. */
const urzadzenie = (ua: string, maDotyk: boolean): string => {
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'Android' : 'tablet Android';
  // iPadOS 13+ podaje się za Maca. Mac z ekranem dotykowym nie istnieje.
  if (/Macintosh/.test(ua)) return maDotyk ? 'iPad' : 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'urządzenie';
};

/**
 * Opis w jednej linii, np. „iPhone · Safari (aplikacja)".
 *
 * Dopisek „(aplikacja)" jest ważniejszy, niż wygląda: na iOS powiadomienia
 * DZIAŁAJĄ wyłącznie po dodaniu do ekranu początkowego. Subskrypcja z Safari
 * bez tego dopisku to sygnał, że coś jest nie tak.
 */
export const opiszUrzadzenie = (): string => {
  if (typeof navigator === 'undefined') return 'nieznane';
  const ua = navigator.userAgent || '';
  const maDotyk = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;

  const wTrybieAplikacji =
    (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return `${urzadzenie(ua, maDotyk)} · ${przegladarka(ua)}${wTrybieAplikacji ? ' (aplikacja)' : ''}`;
};
