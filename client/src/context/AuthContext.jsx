import { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const defaultUser = {
  id: 'student-1',
  name: 'Amelia Learner',
  role: 'student'
};

/**
 * Provides authenticated user context for the LMS.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Child components receiving auth state.
 * @returns {JSX.Element} Context provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);

  const value = useMemo(
    () => ({
      user,
      login: (nextUser) => setUser(nextUser),
      logout: () => setUser(null)
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Access the authentication context.
 * @returns {{user: object|null, login: Function, logout: Function}} Auth API.
 */
export function useAuth() {
  return useContext(AuthContext);
}
