import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { resendVerificationRequest, verifyEmailRequest } from '../services/authService.js';
import { useAuth } from '../../../hooks/useAuth.js';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const initialEmail = params.get('email') || '';
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const { refreshUser, token: authToken } = useAuth();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token missing.');
        return;
      }

      try {
        const response = await verifyEmailRequest(token);
        setMessage(response.message || 'Email verified successfully.');
        setStatus('success');

        if (authToken) {
          try {
            await refreshUser();
          } catch (refreshError) {
            console.warn('Failed to refresh user after verification', refreshError);
          }
        }
      } catch (error) {
        setMessage(error.message || 'Failed to verify email.');
        setStatus('error');
      }
    };

    verify();
  }, [token, refreshUser, authToken]);

  const canResend = useMemo(
    () => Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  const handleResend = async () => {
    if (!canResend) {
      setResendError('Enter a valid email to resend verification.');
      return;
    }

    setResending(true);
    setResendMessage('');
    setResendError('');

    try {
      const response = await resendVerificationRequest(email);
      const extra = response?.supportEmail
        ? ` If you do not receive it soon, contact ${response.supportEmail}.`
        : '';
      setResendMessage(`${response?.message || 'Verification email sent.'}${extra}`);
    } catch (error) {
      setResendError(error.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" component="h1">
            Email Verification
          </Typography>
          {status === 'loading' && <CircularProgress />}
          {status !== 'loading' && (
            <Alert severity={status === 'success' ? 'success' : 'error'}>{message}</Alert>
          )}
          {resendError && <Alert severity="error">{resendError}</Alert>}
          {resendMessage && <Alert severity="success">{resendMessage}</Alert>}
          {status === 'error' && (
            <Stack spacing={2} width="100%" alignItems="stretch">
              <Typography variant="body2" color="text.secondary" align="center">
                Didn’t get the email? Enter your address below and we’ll send a new verification link.
              </Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleResend} disabled={resending}>
                {resending ? 'Resending…' : 'Resend verification email'}
              </Button>
            </Stack>
          )}
          <Button component={RouterLink} to="/login" variant="contained">
            Go to Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage;
