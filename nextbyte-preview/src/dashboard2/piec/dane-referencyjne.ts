/**
 * DANE Z REFERENCJI — przepisane ze zrzutu i zapisanej strony platformy
 * („Panel Główny: zarządzaj swoimi projektami | NextByte", Beta 5.0.0).
 *
 * Po co osobny plik zamiast zmiany `dane-atrapy.ts`: tamten zestaw jest
 * bogaty (siedem spraw, pełna skrzynka, cztery rozmowy) i dobrze pokazuje
 * kafelki „pełne". Referencja pokazuje konto PRAWIE PUSTE — jedno zadanie
 * bez terminu, dwa skróty z sześciu, 0,4 GB z 1 GB. To są dwa różne testy
 * układu i oba są potrzebne, więc stoją obok siebie.
 *
 * Liczby nie są zaokrąglone „na oko" — wyliczone tak, żeby kafelek
 * policzył dokładnie to, co widać w referencji:
 *   saldo 57 ⟠, zużycie 5 ⟠/dzień  →  „Wystarczy na ~11 dni"
 *   (57 / 5 = 11,4; kafelek obcina w dół)
 */

const DZIEN = 86_400_000;
const teraz = Date.now();

const temuDni = (ile: number, godzina = 11) => {
  const d = new Date(teraz - ile * DZIEN);
  d.setHours(godzina, 0, 0, 0);
  return d.toISOString();
};

const dzienTemu = (ile: number) => {
  const d = new Date(teraz - ile * DZIEN);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const SALDO = 57;

/** Dokładnie 5 ⟠ dziennie przez ostatnie 7 dni — stąd prognoza „~11 dni". */
export const WALLET_TRANSACTIONS_REF = Array.from({ length: 7 }, (_, i) => ({
  amount: -5,
  transaction_type: 'spend',
  created_at: temuDni(i, 12),
})).reverse();

export const USER_WALLETS_REF = [{ balance: SALDO, bytes: SALDO }];

/**
 * Mapa aktywności — 71 dni aktywnych w pół roku, tak jak w referencji.
 *
 * Dni wybierane deterministycznie: bierzemy co któryś dzień według stałego
 * wzoru, aż uzbiera się dokładnie 71. Losowanie dałoby inną liczbę przy
 * każdym odświeżeniu, a podpis pod mapą mówi konkretną wartość i musi się
 * zgadzać z tym, co widać.
 */
export const AKTYWNE_DNI = 71;

export const AKTYWNOSC_REF = (() => {
  /* Kandydaci: co drugi dzień roboczy plus rzadkie weekendy — rytm pracy,
     nie szum. Potem lista jest PRZYCINANA DO DOKŁADNIE 71 pozycji, bo
     podpis nad mapą mówi konkretną liczbę i musi się zgadzać z tym, co
     widać. Pierwsza wersja brała „ile wyjdzie" i wychodziło 69. */
  const kandydaci: { dzien: string; liczba: number }[] = [];
  for (let wstecz = 181; wstecz >= 0; wstecz--) {
    const d = new Date(teraz - wstecz * DZIEN);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    if (!(weekend ? wstecz % 11 === 0 : wstecz % 2 === 0)) continue;
    const szum = Math.abs(Math.sin(wstecz * 12.9898) * 43758.5453) % 1;
    kandydaci.push({
      dzien: dzienTemu(wstecz),
      liczba: weekend ? 1 + Math.floor(szum * 3) : 2 + Math.floor(szum * 14),
    });
  }
  // Bierzemy najświeższe 71 dni — mapa ma być gęstsza przy dzisiaj.
  return kandydaci.slice(-AKTYWNE_DNI);
})();

/** Jedno zadanie, bez terminu, oznaczone jako pilne. */
export const USER_TASKS_REF = [
  { id: 'r1', title: 'zadanie', due_date: null, status: 'todo', completed: false, priority: 'high' },
];

/** Kalendarz w referencji jest pusty — „Nic zaplanowanego w najbliższych tygodniach". */
export const CALENDAR_EVENTS_REF: unknown[] = [];

/** Dwa sloty zajęte z sześciu. Pozostałe cztery pokazują „Dodaj skrót". */
export const SKROTY_REF = [
  { slot_index: 0, title: 'Co trzeb aw kambipo zrobić jeszcze?', icon: 'MessageSquare', url: '/chat-ai', source: 'platform', company_id: null },
  { slot_index: 1, title: 'Kalendarz', icon: 'Calendar', url: '/kalendarz', source: 'platform', company_id: null },
];

/** PrivateCloud: 0,4 GB zajęte z 1,0 GB. */
export const CHMURA_REF = {
  zajete: Math.round(0.4 * 1024 ** 3),
  limit: 1024 ** 3,
};

export const PAMIEC_AI_REF = {
  faktow: 8,
  siegnieciaAI: 1,
  kategorie: [
    { nazwa: 'Praca', ile: 5 },
    { nazwa: 'Zainteresowania', ile: 3 },
  ],
  najczesciejUzywany: { nazwa: 'Zawód', ile: 1 },
};

export const DZIENNE_BYTE_REF = { ile: 5, odPlanu: 'Premium', odblokowane: false };

export const WERSJA = 'Beta 5.0.0';

/* ── Ostatnio ─────────────────────────────────────────────────────────────
   Pasek „Ostatnio" to jedyne miejsce na pulpicie, gdzie widać własną pracę.
   W referencji konto jest prawie puste, ale PUSTY pasek nie powie nic
   o układzie — a to sekcja, od której zależy, czy ekran wygląda na biurko,
   czy na raport. Dlatego sześć pozycji z czterech modułów: trzeba widzieć,
   jak kafelki różnych barw wyglądają obok siebie. */
export const ROZMOWY_REF = [
  { id: 'c1', title: 'Opisy do katalogu jesiennego', last_message_at: temuDni(0, 16) },
  { id: 'c2', title: 'Scenariusz na film o montażu', last_message_at: temuDni(1, 13) },
];

export const OBRAZY_REF = [
  { id: 'o1', title: 'Packshot — seria biała', created_at: temuDni(0, 11) },
  { id: 'o2', title: 'Tło pod baner', created_at: temuDni(3, 15) },
];

export const FILMY_REF = [
  { id: 'v1', title: 'Rolka: montaż w 15 minut', created_at: temuDni(1, 9) },
];

export const NOTATKI_REF = [
  { id: 'n1', title: 'Ustalenia ze spotkania', updated_at: temuDni(2, 12) },
];
