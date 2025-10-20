import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card.jsx';

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg">Checking your session…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-neutral-600">
            We&apos;re validating your credentials. This will only take a moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <LoadingState />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};
