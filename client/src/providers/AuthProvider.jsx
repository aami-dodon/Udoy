import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { apiClient } from '../lib/apiClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('udoy_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('udoy_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('udoy_token', token);
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('udoy_token');
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('udoy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('udoy_user');
    }
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      login: ({ token: nextToken, user: userPayload }) => {
        setToken(nextToken);
        setUser(userPayload);
      },
      logout: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
