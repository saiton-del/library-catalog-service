import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await fetchJson('/api/users/profile');
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const result = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(result.user);
    setCheckingAuth(false);
    return result.user;
  }, []);

  const register = useCallback(async (details) => {
    const result = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: details,
    });
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setCheckingAuth(false);
    }
  }, []);

  const value = useMemo(() => ({ user, checkingAuth, login, register, logout, refreshUser }), [user, checkingAuth, login, register, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
