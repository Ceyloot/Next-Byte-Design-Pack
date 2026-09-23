import React, { createContext, useContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

/**
 * WERSJA BEZ SUPABASE — tylko podgląd wyglądu Panelu Głównego, bez żadnych
 * połączeń do backendu. Zachowuje ten sam kształt kontekstu (włącznie z
 * typami `User`/`Session`, żeby zawężanie typu u konsumentów dalej działało),
 * żeby komponenty korzystające z `useAuthContext` (nawigacja, ustawienia,
 * itd.) działały bez zmian — po prostu zawsze widzą "brak zalogowanego
 * użytkownika".
 */
interface SignOutOptions {
  preserveRememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: (options?: SignOutOptions) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STATIC_VALUE: AuthContextType = {
  user: null,
  session: null,
  isLoading: false,
  signOut: async () => {},
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={STATIC_VALUE}>{children}</AuthContext.Provider>
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
