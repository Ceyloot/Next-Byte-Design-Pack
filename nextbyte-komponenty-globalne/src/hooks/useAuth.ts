import { useAuthContext } from '@/contexts/AuthContext';

// Main hook - returns full auth context
export const useAuth = () => {
  return useAuthContext();
};

// Convenience hooks for specific values
export const useAuthUser = () => {
  const { user } = useAuthContext();
  return user;
};

export const useAuthSession = () => {
  const { session } = useAuthContext();
  return session;
};

export const useAuthId = () => {
  const { user } = useAuthContext();
  return user?.id;
};

export const useAuthEmail = () => {
  const { user } = useAuthContext();
  return user?.email;
};

export const useAuthIsLoading = () => {
  const { isLoading } = useAuthContext();
  return isLoading;
};
