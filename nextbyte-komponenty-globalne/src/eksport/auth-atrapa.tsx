import React, { createContext, useContext } from 'react';

/**
 * Atrapa kontekstu logowania. Paczka nie ma backendu, więc zawsze jest gość:
 * `user` i `session` = null. Kształt zgodny z platformowym `AuthContext`.
 */
interface AuthContextType {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  bezPolaczenia: boolean;
  signOut: (options?: unknown) => Promise<void>;
}

const GOSC: AuthContextType = {
  user: null,
  session: null,
  isLoading: false,
  bezPolaczenia: false,
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(GOSC);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthContext.Provider value={GOSC}>{children}</AuthContext.Provider>
);

export const useAuthContext = () => useContext(AuthContext);
