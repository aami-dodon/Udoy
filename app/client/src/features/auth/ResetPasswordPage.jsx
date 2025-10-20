import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { useAuth } from './AuthProvider.jsx';

export default function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialToken = params.get('token') || '';
  const [formState, setFormState] = useState({ token: initialToken, password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ submitting: false, error: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      setStatus({ submitting: false, error: 'Passwords do not match.', message: '' });
      return;
    }

    setStatus({ submitting: true, error: '', message: '' });

    try {
      const response = await auth.resetPassword({ token: formState.token, password: formState.password });
      setStatus({ submitting: false, error: '', message: response?.message || 'Password updated successfully.' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to reset the password with this token.';
      setStatus({ submitting: false, error: message, message: '' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-porcelain">
      <Card className="w-full max-w-md border-none bg-white shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-evergreen">Choose a new password</CardTitle>
          <CardDescription className="text-sm text-neutral-600">
            Paste the reset token from your email and set a new password to regain access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="token">Reset token</Label>
              <Input
                id="token"
                name="token"
                required
                value={formState.token}
                onChange={handleChange}
                placeholder="Paste token from email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Create a strong password"
                value={formState.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Re-enter your password"
                value={formState.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {status.error ? (
              <p className="rounded-lg bg-rose-100/80 px-3 py-2 text-sm text-rose-700">{status.error}</p>
            ) : null}
            {status.message ? (
              <p className="rounded-lg bg-mint-sage/20 px-3 py-2 text-sm text-evergreen">{status.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={status.submitting}>
              {status.submitting ? 'Updating password…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-neutral-700">
          <Link to="/login" className="text-evergreen hover:underline">
            Return to login
          </Link>
          <Link to="/forgot-password" className="text-evergreen hover:underline">
            Request a new token
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
