/**
 * Kształt konta i sesji — tyle, ile kopia Panelu Głównego naprawdę czyta.
 *
 * Oryginał bierze te typy z `@supabase/supabase-js`. Ta paczka nie ma
 * biblioteki Supabase i mieć nie powinna: wciągnięcie klienta po same typy
 * oznaczałoby trzymanie w kopii wyglądowej całej warstwy sieciowej.
 */
export interface User {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
  [k: string]: unknown
}

export interface Session {
  user: User
  access_token: string
  refresh_token?: string
  expires_at?: number
  [k: string]: unknown
}
