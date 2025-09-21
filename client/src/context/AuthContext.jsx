import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { getProfile, loginRequest, signupRequest } from '../features/auth/services/authService.js';

const TOKEN_KEY = 'udoy_token';

export const AuthContext = createContext({
  user: null,
  token: '',
  loading: false,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const bootstrap = async () => {
      try {
        const profile = await getProfile(token);
        setUser(profile);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const persistToken = useCallback((value) => {
    setToken(value);
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: nextUser, token: nextToken } = await loginRequest(credentials);
    persistToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, [persistToken]);

  const signup = useCallback(async (payload) => {
    const { user: nextUser, token: nextToken } = await signupRequest(payload);
    persistToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, [persistToken]);

  const logout = useCallback(() => {
    persistToken('');
    setUser(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout
    }),
    [loading, login, logout, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
