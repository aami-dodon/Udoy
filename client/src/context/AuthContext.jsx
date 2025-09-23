import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { getAccount, loginRequest, signupRequest } from '../features/auth/services/authService.js';
import { updateAccountRequest } from '../features/account/services/accountService.js';

const TOKEN_KEY = 'udoy_token';

export const AuthContext = createContext({
  user: null,
  token: '',
  loading: false,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  updateAccount: async () => ({})
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
        const account = await getAccount(token);
        setUser(account);
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
    const response = await signupRequest(payload);
    return response;
  }, []);

  const logout = useCallback(() => {
    persistToken('');
    setUser(null);
  }, [persistToken]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }
    const account = await getAccount(token);
    setUser(account);
    return account;
  }, [token]);

  const updateAccount = useCallback(
    async (payload) => {
      if (!token) {
        throw new Error('Not authenticated');
      }
      const result = await updateAccountRequest(token, payload);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshUser,
      updateAccount
    }),
    [loading, login, logout, refreshUser, signup, token, updateAccount, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
