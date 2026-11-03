/**
 * Typy bazy w kopii Panelu Głównego są celowo rozluźnione.
 *
 * Oryginał ma tu plik generowany z Supabase — kilkadziesiąt tysięcy linii
 * opisujących schemat, który tej kopii nie dotyczy. Przeniesienie go
 * ciągnęłoby za sobą kształt prawdziwej bazy do paczki, która ma być
 * wyłącznie wyglądem.
 */
export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[]
export type Database = any
export type Tables<_T extends string = string> = any
export type TablesInsert<_T extends string = string> = any
export type TablesUpdate<_T extends string = string> = any
export type Enums<_T extends string = string> = any
