import React, { useMemo, useState } from 'react';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth.js';
import { resendVerificationRequest } from '../services/authService.js';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setResendMessage('');
    setResendError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidEmail = useMemo(
    () => Boolean(form.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );

  const showResendPrompt =
    isValidEmail && error.toLowerCase().includes('verify your email address');

  const handleResend = async () => {
    if (!isValidEmail) {
      setResendError('Enter a valid email before requesting a new verification link.');
      return;
    }

    setResending(true);
    setResendMessage('');
    setResendError('');

    try {
      const response = await resendVerificationRequest(form.email);
      const extra = response?.supportEmail
        ? ` If you do not receive it soon, contact ${response.supportEmail}.`
        : '';
      setResendMessage(`${response?.message || 'Verification email sent.'}${extra}`);
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {resendError && <Alert severity="error">{resendError}</Alert>}
      {resendMessage && <Alert severity="success">{resendMessage}</Alert>}
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        fullWidth
        required
        error={Boolean(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
        helperText={
          form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
            ? 'Enter a valid email address'
            : ' '
        }
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        fullWidth
        required
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Logging in...' : 'Login'}
      </Button>
      {showResendPrompt && (
        <Button variant="text" onClick={handleResend} disabled={resending}>
          {resending ? 'Sending verification email...' : 'Resend verification email'}
        </Button>
      )}
      <Typography variant="body2" align="center">
        <Link component={RouterLink} to="/forgot-password">
          Forgot your password?
        </Link>
      </Typography>
    </Stack>
  );
};

export default LoginForm;
