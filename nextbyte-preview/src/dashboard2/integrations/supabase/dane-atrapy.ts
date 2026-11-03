/**
 * DANE ATRAPY — jedyne źródło treści dla kopii Panelu Głównego.
 *
 * Kafelki w tej kopii mają NIETKNIĘTĄ logikę z platformy: liczenie wypalania
 * Byte, progi kwartylowe mapy aktywności, grupowanie spraw po terminie,
 * rozwijanie wydarzeń cyklicznych. Podmieniony jest wyłącznie dół — zamiast
 * sieci stoi ten plik. Dzięki temu wykres pokazuje prawdziwy przebieg
 * policzony z poniższych wierszy, a nie narysowaną falę.
 *
 * Nic tu nie dotyka Supabase ani żadnego konta. Chcesz inne liczby na
 * ekranie — zmieniasz je tutaj, w jednym miejscu.
 */

// Zestaw referencyjny mieszka osobno — patrz nagłówek przy TABELE.
import * as REF from '@d2/piec/dane-referencyjne';

const DZIEN = 86_400_000;
const teraz = Date.now();

/** ISO sprzed `ile` dni (z godziną, bo kod sortuje po `created_at`). */
const temuDni = (ile: number, godzina = 11) => {
  const d = new Date(teraz - ile * DZIEN);
  d.setHours(godzina, 0, 0, 0);
  return d.toISOString();
};

/** `YYYY-MM-DD` dnia sprzed `ile` dni, w czasie lokalnym. */
const dzienTemu = (ile: number) => {
  const d = new Date(teraz - ile * DZIEN);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const UZYTKOWNIK = {
  id: 'podglad-0000-0000-0000-000000000001',
  email: 'podglad@nextbyte.local',
  imie: 'Artur',
};

export const SALDO_BYTE = 1942;

/* ── Portfel ──────────────────────────────────────────────────────────────
   Z tych wierszy `useByteBurn` liczy tempo wypalania i rysuje przebieg
   salda. Ujemne kwoty to zużycie, dodatnie to doładowania. Rozkład jest
   nierówny celowo — równe słupki dałyby linię prostą, a panel ma pokazywać,
   jak wygląda prawdziwy tydzień pracy. */
const ZUZYCIE_DNI = [
  [0, [-24, -12]],
  [1, [-38]],
  [2, [-16, -9, -31]],
  [3, [-52]],
  [4, [-18]],
  [5, [-27, -14]],
  [6, [-41]],
  [8, [-33]],
  [9, [-21, -17]],
  [11, [-45]],
  [13, [-29]],
  [16, [-37, -11]],
  [19, [-48]],
  [23, [-26]],
  [28, [-34, -19]],
  [35, [-42]],
  [44, [-23]],
  [58, [-39]],
  [71, [-30]],
  [85, [-25]],
] as const;

export const WALLET_TRANSACTIONS = [
  ...ZUZYCIE_DNI.flatMap(([dni, kwoty]) =>
    kwoty.map((amount, i) => ({
      amount,
      transaction_type: 'spend',
      created_at: temuDni(dni, 9 + i * 3),
      user_id: UZYTKOWNIK.id,
    })),
  ),
  { amount: 500, transaction_type: 'purchase', created_at: temuDni(12, 15), user_id: UZYTKOWNIK.id },
  { amount: 1000, transaction_type: 'purchase', created_at: temuDni(47, 10), user_id: UZYTKOWNIK.id },
].sort((a, b) => a.created_at.localeCompare(b.created_at));

export const USER_WALLETS = [
  { user_id: UZYTKOWNIK.id, balance: SALDO_BYTE, bytes: SALDO_BYTE },
];

/* ── Mapa aktywności ──────────────────────────────────────────────────────
   RPC `aktywnosc_dzienna` oddaje jeden wiersz na dzień z liczbą zdarzeń.
   Weekendy słabsze, kilka dni zupełnie pustych, jeden dzień-rekord — tyle
   wystarczy, żeby progi kwartylowe miały co rozróżniać i mapa nie wyszła
   jednolitą plamą. */
export const AKTYWNOSC_DZIENNA = Array.from({ length: 182 }, (_, i) => {
  const wstecz = 181 - i;
  const d = new Date(teraz - wstecz * DZIEN);
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  // Deterministyczny szum — ten sam wykres przy każdym odświeżeniu.
  const szum = Math.abs(Math.sin(wstecz * 12.9898) * 43758.5453) % 1;
  let liczba = weekend ? Math.floor(szum * 5) : Math.floor(szum * 18) + 1;
  if (szum < 0.12) liczba = 0;
  if (wstecz === 23) liczba = 106; // dzień-rekord
  return { dzien: dzienTemu(wstecz), liczba };
}).filter((w) => w.liczba > 0);

/* ── Skrzynka spraw ───────────────────────────────────────────────────────
   Trzy horyzonty naraz: jedna rzecz po terminie, jedna na dziś, reszta
   w przyszłości. Pusta skrzynka pokazałaby stan „nic nie czeka", a tu
   chodzi o to, żeby widzieć kafelek pełny. */
export const USER_TASKS = [
  { id: 't1', user_id: UZYTKOWNIK.id, title: 'Odebrać materiały z sesji', due_date: temuDni(2, 12), status: 'todo', completed: false, priority: 'high' },
  { id: 't2', user_id: UZYTKOWNIK.id, title: 'Zatwierdzić opisy do katalogu', due_date: temuDni(0, 17), status: 'todo', completed: false, priority: 'medium' },
  { id: 't3', user_id: UZYTKOWNIK.id, title: 'Przejrzeć zgłoszenia z formularza', due_date: temuDni(-1, 10), status: 'todo', completed: false, priority: 'medium' },
  { id: 't4', user_id: UZYTKOWNIK.id, title: 'Wysłać podsumowanie miesiąca', due_date: temuDni(-4, 9), status: 'todo', completed: false, priority: 'low' },
];

export const COMPANY_TASKS = [
  { id: 'ct1', title: 'Domknąć wycenę dla Mostostalu', due_date: temuDni(-2, 14), status: 'in_progress', company_id: 'f1', priority: 'high' },
  { id: 'ct2', title: 'Przygotować grafik na przyszły tydzień', due_date: temuDni(-5, 11), status: 'todo', company_id: 'f1', priority: 'medium' },
];

export const MANAGEMENT_TASKS = [
  { id: 'mt1', title: 'Przegląd uprawnień w zespole', due_date: temuDni(-3, 13), status: 'todo', priority: 'medium' },
];

/* ── Kalendarz ────────────────────────────────────────────────────────────
   Rozrzucone po bieżącym miesiącu, żeby siatka dni miała kropki w kilku
   miejscach, a nie wszystkie w jednym tygodniu. */
const miesiacTeraz = new Date(teraz);
const wMiesiacu = (dzien: number, godzina: number) =>
  new Date(miesiacTeraz.getFullYear(), miesiacTeraz.getMonth(), dzien, godzina, 0, 0).toISOString();

export const CALENDAR_EVENTS = [
  { id: 'e1', user_id: UZYTKOWNIK.id, title: 'Sesja zdjęciowa — katalog', start_time: wMiesiacu(4, 10), end_time: wMiesiacu(4, 14), all_day: false, color: null },
  { id: 'e2', user_id: UZYTKOWNIK.id, title: 'Przegląd projektu', start_time: wMiesiacu(9, 12), end_time: wMiesiacu(9, 13), all_day: false, color: null },
  { id: 'e3', user_id: UZYTKOWNIK.id, title: 'Montaż materiału wideo', start_time: wMiesiacu(12, 9), end_time: wMiesiacu(12, 17), all_day: false, color: null },
  { id: 'e4', user_id: UZYTKOWNIK.id, title: 'Rozmowa z klientem', start_time: wMiesiacu(17, 15), end_time: wMiesiacu(17, 16), all_day: false, color: null },
  { id: 'e5', user_id: UZYTKOWNIK.id, title: 'Oddanie materiałów', start_time: wMiesiacu(21, 11), end_time: wMiesiacu(21, 12), all_day: false, color: null },
  { id: 'e6', user_id: UZYTKOWNIK.id, title: 'Planowanie kolejnego miesiąca', start_time: wMiesiacu(26, 10), end_time: wMiesiacu(26, 12), all_day: false, color: null },
];

/* ── Wróć do roboty ───────────────────────────────────────────────────────
   Ostatnie rzeczy użytkownika: rozmowy z Chat AI i notatki. Tytuły są
   różnej długości celowo — kafelek ma pokazać, jak zachowuje się przy
   krótkim i przy przyciętym wierszu. */
/* `last_message_at`, nie `updated_at` — kafelek sortuje rozmowy po ostatniej
   wiadomości, a `conversation_mode` decyduje, czy wiersz prowadzi do Chat AI,
   czy do Asystenta NextByte. */
export const CHAT_CONVERSATIONS = [
  { id: 'c1', user_id: UZYTKOWNIK.id, title: 'Opisy produktów do sklepu', last_message_at: temuDni(0, 16), created_at: temuDni(3), conversation_mode: 'chat' },
  { id: 'c2', user_id: UZYTKOWNIK.id, title: 'Scenariusz na film instruktażowy o montażu', last_message_at: temuDni(0, 13), created_at: temuDni(5), conversation_mode: 'chat' },
  { id: 'c3', user_id: UZYTKOWNIK.id, title: 'Burza mózgów — nazwa linii', last_message_at: temuDni(2, 10), created_at: temuDni(6), conversation_mode: 'chat' },
  { id: 'c4', user_id: UZYTKOWNIK.id, title: 'Jak rozliczyć fakturę za podwykonawcę', last_message_at: temuDni(4, 9), created_at: temuDni(9), conversation_mode: 'nextbyte_assistant' },
];

export const USER_NOTES = [
  { id: 'n1', user_id: UZYTKOWNIK.id, title: 'Ustalenia ze spotkania', content: 'Terminy i kto za co odpowiada.', updated_at: temuDni(1, 12), created_at: temuDni(8) },
  { id: 'n2', user_id: UZYTKOWNIK.id, title: 'Lista ujęć', content: 'Plan zdjęciowy na czwartek.', updated_at: temuDni(3, 15), created_at: temuDni(11) },
];

/* ── Chmury ───────────────────────────────────────────────────────────────
   Liczby w bajtach. Prywatna zapełniona w ~34%, systemowa w ~61% — dwa
   różne stopnie wypełnienia, żeby było widać, że pasek faktycznie reaguje. */
export const CHMURA_LIMIT_PRYWATNA = 50 * 1024 ** 3;
export const CHMURA_ZAJETE_PRYWATNA = Math.round(CHMURA_LIMIT_PRYWATNA * 0.34);
export const CHMURA_LIMIT_SYSTEMOWA = 200 * 1024 ** 3;
export const CHMURA_ZAJETE_SYSTEMOWA = Math.round(CHMURA_LIMIT_SYSTEMOWA * 0.61);

/* ── Skróty ───────────────────────────────────────────────────────────────
   Sześć slotów dolnego pasa. `slot_index` jest numerem MIEJSCA, nie
   kolejności: kafelek wkłada wiersz dokładnie w ten slot, a puste slotu
   pokazują „Dodaj". Zostawiamy jeden wolny (indeks 5), żeby było widać oba
   stany naraz — zajęty i do uzupełnienia. */
export const USER_QUICK_SHORTCUTS = [
  { user_id: UZYTKOWNIK.id, slot_index: 0, title: 'Chat AI', icon: 'MessageSquare', url: '/chat-ai', source: 'platform', company_id: null },
  { user_id: UZYTKOWNIK.id, slot_index: 1, title: 'Studio Zdjęć', icon: 'Image', url: '/studio-zdjec', source: 'platform', company_id: null },
  { user_id: UZYTKOWNIK.id, slot_index: 2, title: 'Studio Wideo', icon: 'Video', url: '/studio-wideo', source: 'platform', company_id: null },
  { user_id: UZYTKOWNIK.id, slot_index: 3, title: 'Notatki', icon: 'FileText', url: '/notatki', source: 'platform', company_id: null },
  { user_id: UZYTKOWNIK.id, slot_index: 4, title: 'Kalendarz', icon: 'Calendar', url: '/kalendarz', source: 'platform', company_id: null },
];

/** Tabele, dla których mamy treść. Reszta oddaje pustą listę. */
/*
 * ════════════════════════════════════════════════════════════════════════
 *  DWA ZESTAWY DANYCH, JEDEN WŁĄCZNIK
 * ════════════════════════════════════════════════════════════════════════
 *
 * `referencja` odwzorowuje konto ze zrzutu platformy: saldo 57 ⟠, jedno
 * zadanie bez terminu, dwa skróty z sześciu, 0,4 GB z 1 GB. Tego używamy
 * przy dopasowywaniu układu, bo tylko wtedy liczby na ekranie zgadzają
 * się z referencją co do jednej.
 *
 * `pelny` to konto zapracowane — siedem spraw, pełna skrzynka, gęsta mapa
 * aktywności. Potrzebne, bo układ, który wygląda dobrze przy jednym
 * zadaniu, potrafi się rozsypać przy dwudziestu. Pusty i pełny to dwa
 * różne testy i oba muszą przechodzić.
 *
 * Przełącznik jest w adresie: `?dane=pelny`.
 */
const zestaw: 'referencja' | 'pelny' =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('dane') === 'pelny'
    ? 'pelny'
    : 'referencja';

export const UZYWANY_ZESTAW = zestaw;

export const TABELE: Record<string, unknown[]> = zestaw === 'pelny'
  ? {
      wallet_transactions: WALLET_TRANSACTIONS,
      user_wallets: USER_WALLETS,
      user_tasks: USER_TASKS,
      company_tasks: COMPANY_TASKS,
      management_tasks: MANAGEMENT_TASKS,
      calendar_events: CALENDAR_EVENTS,
      chat_conversations: CHAT_CONVERSATIONS,
      user_notes: USER_NOTES,
      user_quick_shortcuts: USER_QUICK_SHORTCUTS,
    }
  : {
      wallet_transactions: REF.WALLET_TRANSACTIONS_REF,
      user_wallets: REF.USER_WALLETS_REF,
      user_tasks: REF.USER_TASKS_REF,
      company_tasks: [],
      management_tasks: [],
      calendar_events: REF.CALENDAR_EVENTS_REF,
      chat_conversations: REF.ROZMOWY_REF,
      photo_studio_generations: REF.OBRAZY_REF,
      studio_video_generations: REF.FILMY_REF,
      user_notes: REF.NOTATKI_REF,
      user_quick_shortcuts: REF.SKROTY_REF,
    };

/** Funkcje bazy, których kafelki używają wprost. */
export const RPC: Record<string, (args?: Record<string, unknown>) => unknown> = zestaw === 'pelny'
  ? {
      aktywnosc_dzienna: () => AKTYWNOSC_DZIENNA,
      nextcloud_limit_miejsca: () => CHMURA_LIMIT_PRYWATNA,
      nextcloud_zajete_miejsce: () => CHMURA_ZAJETE_PRYWATNA,
      nextcloud_lustro_systemowe: () => ({ limit: CHMURA_LIMIT_SYSTEMOWA, zajete: CHMURA_ZAJETE_SYSTEMOWA }),
    }
  : {
      aktywnosc_dzienna: () => REF.AKTYWNOSC_REF,
      nextcloud_limit_miejsca: () => REF.CHMURA_REF.limit,
      nextcloud_zajete_miejsce: () => REF.CHMURA_REF.zajete,
      nextcloud_lustro_systemowe: () => ({ limit: REF.CHMURA_REF.limit, zajete: REF.CHMURA_REF.zajete }),
    };

/* ── Pamięć AI ────────────────────────────────────────────────────────────
   PLACEHOLDER. Paczka panelu nie zna tego kafelka — nie ma w niej ani
   komponentu, ani tabeli, z której miałby czytać. Liczby poniżej są
   przepisane z makiety, żeby układ miał czym żyć; przy podpinaniu
   prawdziwej Pamięci AI to jest pierwsze miejsce do wymiany. */
export const PAMIEC_AI = {
  faktow: 8,
  siegnieciaAI: 1,
  kategorie: [
    { nazwa: 'Praca', ile: 5 },
    { nazwa: 'Zainteresowania', ile: 3 },
  ],
  najczesciejUzywany: { nazwa: 'Zawód', ile: 1 },
};

/* ── Dzienne Byte ─────────────────────────────────────────────────────────
   PLACEHOLDER, tak jak wyżej. Kafelek zachęca do planu Premium, więc jego
   treść zależy od planu konta — a tego kopia nie czyta. */
export const DZIENNE_BYTE = {
  ile: 5,
  odPlanu: 'Premium',
  odblokowane: false,
};

/** Wersja platformy w stopce. */
export const WERSJA_PLATFORMY = 'Beta 5.0.0';
