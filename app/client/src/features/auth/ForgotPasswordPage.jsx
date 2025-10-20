import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card.jsx';
import { Input } from '@components/ui/input.jsx';
import { Label } from '@components/ui/label.jsx';
import { useAuth } from './AuthProvider.jsx';
import { SupportContactMessage } from './components/SupportContactMessage.jsx';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ submitting: false, error: '', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ submitting: true, error: '', message: '' });

    try {
      const response = await auth.requestPasswordReset(email);
      setStatus({ submitting: false, error: '', message: response?.message || 'If the account exists, we will send a reset link.' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to initiate the password reset flow right now.';
      setStatus({ submitting: false, error: message, message: '' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-porcelain">
      <Card className="w-full max-w-md border-none bg-white shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-evergreen">Reset your password</CardTitle>
          <CardDescription className="text-sm text-neutral-600">
            Enter the email address associated with your Udoy account. We&apos;ll email a secure link to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {status.error ? (
              <p className="rounded-lg bg-rose-100/80 px-3 py-2 text-sm text-rose-700">{status.error}</p>
            ) : null}
            {status.message ? (
              <p className="rounded-lg bg-mint-sage/20 px-3 py-2 text-sm text-evergreen">{status.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={status.submitting}>
              {status.submitting ? 'Sending instructions…' : 'Email reset link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-neutral-700">
          <div className="flex w-full justify-between gap-3">
            <Link to="/login" className="text-evergreen hover:underline">
              Return to login
            </Link>
            <Link to="/register" className="text-evergreen hover:underline">
              Create an account
            </Link>
          </div>
          <SupportContactMessage />
        </CardFooter>
      </Card>
    </div>
  );
}
