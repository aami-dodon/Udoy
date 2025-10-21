import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authApi from './api.js';
import { setAuthHeader } from '@/lib/http.js';

const AuthContext = createContext({
  status: 'loading',
  loading: true,
  user: null,
  session: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshSession: async () => {},
  updateUser: () => {},
});

function buildState({ status = 'unauthenticated', user = null, session = null, loading = false, error = null } = {}) {
  return {
    status,
    user,
    session,
    loading,
    error,
  };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => buildState({ status: 'loading', loading: true }));

  const applyTokens = useCallback((tokens) => {
    if (tokens?.accessToken) {
      setAuthHeader(tokens.accessToken);
    } else {
      setAuthHeader(null);
    }
  }, []);

  const hydrateSession = useCallback(async () => {
    setState(buildState({ status: 'loading', loading: true }));
    try {
      const sessionResponse = await authApi.fetchSession();
      let nextUser = sessionResponse.user;
      let nextSession = sessionResponse.session;

      try {
        const refreshed = await authApi.refresh();
        applyTokens(refreshed.tokens);
        nextUser = refreshed.user || nextUser;
        nextSession = refreshed.session || nextSession;
      } catch (refreshError) {
        const statusCode = refreshError?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          setAuthHeader(null);
          setState(buildState({ status: 'unauthenticated', loading: false }));
          return;
        }
      }

      setState(
        buildState({
          status: 'authenticated',
          user: nextUser,
          session: nextSession,
          loading: false,
        })
      );
    } catch (error) {
      setAuthHeader(null);
      setState(buildState({ status: 'unauthenticated', loading: false }));
    }
  }, [applyTokens]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials);
      applyTokens(response.tokens);
      setState(
        buildState({
          status: 'authenticated',
          user: response.user,
          session: response.session,
          loading: false,
        })
      );
      return response;
    },
    [applyTokens]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthHeader(null);
      setState(buildState({ status: 'unauthenticated', loading: false }));
    }
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    return response;
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await authApi.refresh();
    applyTokens(response.tokens);
    setState(
      buildState({
        status: 'authenticated',
        user: response.user,
        session: response.session,
        loading: false,
      })
    );
    return response;
  }, [applyTokens]);

  const updateUser = useCallback((nextUser) => {
    setState((current) =>
      buildState({
        status: current.status,
        user: { ...current.user, ...nextUser },
        session: current.session,
        loading: current.loading,
        error: current.error,
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      status: state.status,
      loading: state.loading,
      user: state.user,
      session: state.session,
      isAuthenticated: state.status === 'authenticated' && Boolean(state.user),
      login,
      logout,
      register,
      refreshSession,
      updateUser,
      resendVerification: authApi.resendVerification,
      verifyEmail: authApi.verifyEmail,
      requestPasswordReset: authApi.requestPasswordReset,
      resetPassword: authApi.resetPassword,
      guardianApproval: authApi.guardianApproval,
    }),
    [login, logout, register, refreshSession, state, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
