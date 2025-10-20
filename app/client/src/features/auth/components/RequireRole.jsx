import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider.jsx';
import RequireAuth from './RequireAuth.jsx';

export default function RequireRole({ roles, children }) {
  return (
    <RequireAuth>
      <RoleGate roles={roles}>{children}</RoleGate>
    </RequireAuth>
  );
}

function RoleGate({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  const required = Array.isArray(roles) ? roles : [roles];
  const hasRole = required.some((role) => user?.roles?.includes(role));

  if (!hasRole) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return children;
}

RequireRole.propTypes = {
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  children: PropTypes.node.isRequired,
};

RoleGate.propTypes = RequireRole.propTypes;
