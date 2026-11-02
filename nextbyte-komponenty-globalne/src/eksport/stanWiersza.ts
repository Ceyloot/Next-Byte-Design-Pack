/**
 * Typ stanu wiersza listy (pionowy świecący pasek na początku rekordu).
 * Na platformie leży przy module firmowym; tu tylko kształt danych dla `ui/pasek-stanu-wiersza`.
 * Trzy barwy: problem (czerwony, blokuje) → uwaga (żółty, czeka na nas) → dobrze (zielony, nic do roboty).
 */
export type TonWiersza = 'dobrze' | 'uwaga' | 'problem';

export interface StanWiersza {
  ton: TonWiersza;
  /** Co konkretnie świeci — do kartki po najechaniu; pusta lista przy zielonym. */
  powody: string[];
}
