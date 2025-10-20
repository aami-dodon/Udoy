import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui';
import { useAuth } from './AuthProvider.jsx';
import { SupportContactMessage } from './components/SupportContactMessage.jsx';

const STATUS_COPY = {
  verifying: {
    title: 'Verifying…',
    description: 'We are securely validating your token. This may take a few seconds.',
  },
  success: {
    title: 'All set!',
    description: 'Your token was accepted. You may proceed to sign in and continue using Udoy.',
  },
  error: {
    title: 'We hit a snag',
    description: 'The token appears invalid or has expired. Request a new link to continue.',
  },
};

export default function VerifyTokenPage() {
  const { guardianApproval, verifyEmail, updateUser } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const type = params.get('type') || 'email';
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        if (type === 'guardian') {
          const response = await guardianApproval({ token, approve: true });
          setMessage(response?.message || 'Guardian approval recorded.');
        } else {
          const response = await verifyEmail(token);
          setMessage(response?.message || 'Email verified successfully.');
          if (response?.user) {
            updateUser(response.user);
          }
        }
        setStatus('success');
      } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Unable to process this verification token.';
        setMessage(errorMessage);
        setStatus('error');
      }
    }

    verify();
  }, [guardianApproval, token, type, updateUser, verifyEmail]);

  const copy = STATUS_COPY[status];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">Go to login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/forgot-password">Need another link?</Link>
              </Button>
            </div>
            <SupportContactMessage />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
