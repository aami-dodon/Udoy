import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your new password.'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match.',
      });
    }
  });

export default function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialToken = params.get('token') || '';
  const [serverFeedback, setServerFeedback] = useState(null);

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: initialToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setServerFeedback(null);
    try {
      const response = await auth.resetPassword({ token: values.token.trim(), password: values.password });
      setServerFeedback({ type: 'success', message: response?.message || 'Password updated successfully.' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to reset the password with this token.';
      setServerFeedback({ type: 'error', message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        <div className="space-y-4 text-left lg:flex-1">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Choose a new password</h1>
          <p className="max-w-lg text-base text-muted-foreground">
            Paste the reset token from your email and set a new password to regain access to your Udoy account.
          </p>
          <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground shadow-sm">
            For security, reset links expire quickly. If the link has expired, request a new one from the login page.
          </div>
        </div>
        <Card className="w-full max-w-md lg:flex-1">
          <CardHeader>
            <CardTitle className="text-2xl">Reset credentials</CardTitle>
            <CardDescription>Provide the token and your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset token</FormLabel>
                      <FormControl>
                        <Input placeholder="Paste token from email" {...field} />
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
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Create a strong password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Re-enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverFeedback ? (
                  <div
                    className={
                      serverFeedback.type === 'success'
                        ? 'rounded-lg border border-secondary/40 bg-secondary/20 px-3 py-2 text-sm text-secondary-foreground'
                        : 'rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'
                    }
                  >
                    {serverFeedback.message}
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Updating password…' : 'Update password'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
            <div className="flex w-full flex-wrap gap-3">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Return to login
              </Link>
              <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                Request a new token
              </Link>
            </div>
            <SupportContactMessage />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
