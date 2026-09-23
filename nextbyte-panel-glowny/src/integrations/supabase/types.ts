/*
  Typy bazy — WERSJA OKROJONA DO EKSPORTU.

  Na platformie ten plik jest generowany z całego schematu bazy (setki tabel
  wszystkich modułów). Paczka ma pokazywać jeden moduł, więc schemat nie
  wychodzi: `Database` to `any`, a zapytania są po prostu nietypowane.
  Przy wpinaniu zmian z powrotem wraca oryginalny plik platformy.
*/
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
