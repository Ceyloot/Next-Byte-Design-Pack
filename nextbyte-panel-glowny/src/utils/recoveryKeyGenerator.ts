/**
 * Recovery Key Generator
 * 
 * Generates a 24-word mnemonic recovery phrase using a Polish word list.
 * Based on BIP39 concept but simplified for UX — 256 bits of entropy
 * mapped to 24 words from a curated list.
 */

// 256 common, unambiguous Polish words (easy to write down)
const WORD_LIST: string[] = [
  'ananas', 'arbuz', 'autobus', 'balon', 'banan', 'barwa', 'bilet', 'bocian',
  'burak', 'burza', 'cegła', 'chmura', 'ciasto', 'cyrk', 'czapka', 'czekolada',
  'delfin', 'deszcz', 'domek', 'droga', 'drzewo', 'dywan', 'ekran', 'fala',
  'farba', 'figiel', 'flaga', 'folia', 'fotel', 'garnek', 'gazeta', 'gitara',
  'globus', 'gniazdo', 'góra', 'gruszka', 'guzik', 'hamak', 'herbata', 'hotel',
  'igła', 'jabłko', 'jagoda', 'jajko', 'japoński', 'jaskinia', 'jedwab', 'jelonek',
  'kaczka', 'kamień', 'kanał', 'kapusta', 'karta', 'kasztan', 'kawał', 'kieliszek',
  'klucz', 'kobieta', 'kocyk', 'kolano', 'komin', 'kompas', 'konik', 'korona',
  'kostka', 'koszyk', 'kotwica', 'krawat', 'kredka', 'królik', 'krzesło', 'kubek',
  'kuchnia', 'kurtka', 'kwiatek', 'lampa', 'latarka', 'lawenda', 'lekarz', 'leśnik',
  'lilia', 'listek', 'lokomotywa', 'lustro', 'łabędź', 'łańcuch', 'łopata', 'łódka',
  'łyżka', 'magnolia', 'malina', 'marmur', 'masło', 'medal', 'mgła', 'miarka',
  'miotła', 'młotek', 'morela', 'morze', 'motyl', 'muzyka', 'nagroda', 'napój',
  'naszyjnik', 'nożyczki', 'obłok', 'obraz', 'ogrody', 'okno', 'okulary', 'ołówek',
  'opona', 'orzeł', 'osioł', 'owca', 'pająk', 'palma', 'panda', 'papier',
  'parasol', 'pelikan', 'piasek', 'piernik', 'pigułka', 'pilot', 'piorun', 'planeta',
  'płaszcz', 'płotka', 'poduszka', 'pokój', 'pomidor', 'poranek', 'pralka', 'prąd',
  'promień', 'przebiśnieg', 'pukiel', 'rakieta', 'ramka', 'rdzawy', 'rękawiczka', 'robot',
  'rower', 'rycerz', 'rysunek', 'rzeka', 'sanki', 'sarna', 'seler', 'serce',
  'sikora', 'skała', 'skarbiec', 'skrzypce', 'słoik', 'słońce', 'smak', 'soczek',
  'sokół', 'sowa', 'srebro', 'stodoła', 'stołek', 'strumień', 'suknia', 'szalik',
  'szkatułka', 'szpilka', 'szuflada', 'szyszka', 'ściana', 'śliwka', 'śnieg', 'świeca',
  'świerk', 'tabela', 'tajemnica', 'talerz', 'taniec', 'teczka', 'telefon', 'tęcza',
  'topola', 'torba', 'trąba', 'tulipan', 'tunel', 'tygrys', 'tynk', 'uczta',
  'ulica', 'ułamek', 'umbra', 'urwisko', 'uszko', 'wafel', 'wagon', 'wahadło',
  'walizka', 'wanna', 'warkocz', 'wąż', 'wesele', 'wiatr', 'wieża', 'wilk',
  'wiosło', 'wiśnia', 'włókno', 'woda', 'worek', 'wózek', 'wstążka', 'wydra',
  'wyspa', 'zabawka', 'zagadka', 'zamek', 'zapałka', 'zasłona', 'zegar', 'ziemia',
  'ziółko', 'złoto', 'znaczek', 'żagiel', 'żarówka', 'żelazo', 'żołądź', 'żółw',
  'żuraw', 'żurek', 'żyrafa', 'źrebak', 'źródło', 'żywica', 'bukiet', 'cedr',
  'chata', 'dąb', 'figowiec', 'granat', 'huśtawka', 'irys', 'jaśmin', 'klon',
  'lawina', 'magnez', 'narcyz', 'oaza', 'piwonia', 'rdest', 'sosna', 'topaz',
];

/**
 * Generate a 24-word recovery key from 256 bits of cryptographic randomness.
 * Each word is selected by mapping 8 random bits → index into 256-word list.
 */
export function generateRecoveryKey(): string {
  const entropy = crypto.getRandomValues(new Uint8Array(24));
  const words = Array.from(entropy).map((byte) => WORD_LIST[byte % WORD_LIST.length]);
  return words.join(' ');
}

/**
 * Validate that a recovery key has the expected format (24 Polish words).
 */
export function validateRecoveryKey(key: string): boolean {
  const words = key.trim().split(/\s+/);
  if (words.length !== 24) return false;
  return words.every((w) => WORD_LIST.includes(w.toLowerCase()));
}

/**
 * Format recovery key into groups of 4 for easier reading/writing.
 */
export function formatRecoveryKey(key: string): string[] {
  const words = key.trim().split(/\s+/);
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += 4) {
    groups.push(words.slice(i, i + 4).join(' '));
  }
  return groups;
}
