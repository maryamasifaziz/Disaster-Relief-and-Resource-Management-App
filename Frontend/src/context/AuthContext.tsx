import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { attachToken } from '@/src/api/client';
import { authService } from '@/src/api/services';
import { tokenStorage } from '@/src/storage/tokenStorage';
import { AuthUser } from '@/src/types/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    address?: string;
    phone_number?: string;
    role_id?: number;
  }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isBootstrapping: true,
  isSubmitting: false,
  login: async () => {},
  register: async () => {},
  refreshProfile: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const [storedToken, storedUser] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser(),
      ]);
      if (storedToken && storedUser) {
        attachToken(storedToken);
        setToken(storedToken);
        setUser(storedUser);
      }
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleAuthSuccess = useCallback(async (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    attachToken(authToken);
    await tokenStorage.save(authToken, authUser);
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      setIsSubmitting(true);
      try {
        const { data } = await authService.login(payload);
        await handleAuthSuccess(data.user, data.token);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      address?: string;
      phone_number?: string;
      role_id?: number;
    }) => {
      setIsSubmitting(true);
      try {
        const { data } = await authService.register(payload);
        await handleAuthSuccess(data.user, data.token);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleAuthSuccess]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const { data } = await authService.profile();
    setUser(data.user);
    await tokenStorage.save(token, data.user);
  }, [token]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    attachToken(undefined);
    await tokenStorage.clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isBootstrapping,
      isSubmitting,
      login,
      register,
      refreshProfile,
      logout,
    }),
    [user, token, isBootstrapping, isSubmitting, login, register, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

