import React, { useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';

import { forgotPasswordRequest } from '../services/authService.js';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await forgotPasswordRequest(email);
      const baseMessage = response?.message || 'If the account exists, a reset link has been sent to your email.';
      const extra = response?.supportEmail
        ? ` If you do not receive the email soon, please contact ${response.supportEmail}.`
        : '';
      setSuccess(`${baseMessage}${extra}`);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
        required
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </Stack>
  );
};

export default ForgotPasswordForm;
