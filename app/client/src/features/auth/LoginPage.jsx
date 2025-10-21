import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@components/ui';
import { useAuth } from './AuthProvider.jsx';
import { SupportContactMessage } from './components/SupportContactMessage.jsx';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().trim().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';
  const [serverError, setServerError] = useState('');

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await auth.login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to log in with the provided credentials.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Udoy Platform
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sign in to continue your Udoy journey
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Access personalised learning dashboards, support coaching approvals, and steward your communities with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Role-aware navigation</p>
              <p className="text-sm text-muted-foreground">Experience Udoy exactly as your permissions allow—nothing more, nothing less.</p>
            </div>
            <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Secure by design</p>
              <p className="text-sm text-muted-foreground">Adaptive MFA, session rotation, and audit trails guard every interaction.</p>
            </div>
          </div>
        </div>
        <Card className="w-full max-w-md justify-self-center">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input autoComplete="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {serverError}
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <div className="flex w-full flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex w-full flex-wrap justify-between gap-3">
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create an account
                </Link>
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <p>
                Need to verify your email first?{' '}
                <Link to="/verify-token" className="font-semibold text-primary hover:underline">
                  Enter verification token
                </Link>
                .
              </p>
            </div>
            <SupportContactMessage />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
