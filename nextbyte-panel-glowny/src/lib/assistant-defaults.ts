/**
 * Domyślna nazwa Personalnego Asystenta.
 *
 * Uwaga: to jest WYŁĄCZNIE fallback wyświetlany, gdy użytkownik nie nadał
 * własnej nazwy (`webhook_settings.agent_name` puste/NULL). Nazwy zapisane
 * przez użytkowników nie są tym nadpisywane — zmiana tej stałej nie rusza
 * niczyich danych.
 *
 * Musi pozostać zgodne z fallbackiem w promptcie systemowym
 * (`supabase/functions/chat-ai/index.ts`, blok `isNextByteMode`), inaczej
 * interfejs i sam asystent przedstawiałyby się różnymi imionami.
 */
export const DEFAULT_AGENT_NAME = 'Aurora';
