import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { useAuth } from './AuthProvider.jsx';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await auth.login(formState);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      const message = submitError?.response?.data?.message || 'Unable to log in with the provided credentials.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-porcelain">
      <Card className="w-full max-w-md border-none bg-white shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-evergreen">Welcome back</CardTitle>
          <CardDescription className="text-sm text-neutral-600">
            Sign in to manage your learning journey, monitor wards, or administer Udoy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formState.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={formState.password}
                onChange={handleChange}
              />
            </div>
            {error ? (
              <p className="rounded-lg bg-rose-100/80 px-3 py-2 text-sm text-rose-700">{error}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-neutral-700">
          <div className="flex w-full justify-between">
            <Link to="/register" className="text-evergreen hover:underline">
              Create an account
            </Link>
            <Link to="/forgot-password" className="text-evergreen hover:underline">
              Forgot password?
            </Link>
          </div>
          <p className="text-xs text-neutral-500">
            Need help? Write to{' '}
            <a className="text-evergreen hover:underline" href="mailto:support@udoy.in">
              support@udoy.in
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
