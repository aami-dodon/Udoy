import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const [serverFeedback, setServerFeedback] = useState(null);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values) => {
    setServerFeedback(null);
    try {
      const response = await auth.requestPasswordReset(values.email.trim());
      setServerFeedback({ type: 'success', message: response?.message || 'If the account exists, we will send a reset link.' });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to initiate the password reset flow right now.';
      setServerFeedback({ type: 'error', message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        <div className="space-y-4 text-left lg:flex-1">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Reset your password</h1>
          <p className="max-w-lg text-base text-muted-foreground">
            Enter the email associated with your Udoy account. We&apos;ll email a secure link to set a new password and restore access.
          </p>
          <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground shadow-sm">
            Tip: Reset links remain valid for 15 minutes. Start from your most trusted device to complete the flow without interruptions.
          </div>
        </div>
        <Card className="w-full max-w-md lg:flex-1">
          <CardHeader>
            <CardTitle className="text-2xl">Request a reset link</CardTitle>
            <CardDescription>We&apos;ll send an email if the address is registered with Udoy.</CardDescription>
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
                        <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                  {form.formState.isSubmitting ? 'Sending instructions…' : 'Email reset link'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
            <div className="flex w-full flex-wrap gap-3">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Return to login
              </Link>
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </div>
            <SupportContactMessage />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
