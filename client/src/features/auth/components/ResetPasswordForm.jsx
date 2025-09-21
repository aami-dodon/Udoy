import React, { useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';

import { resetPasswordRequest } from '../services/authService.js';

const ResetPasswordForm = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!token) {
    return <Alert severity="error">Reset token missing.</Alert>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      await resetPasswordRequest({ token, password });
      setSuccess('Password reset successfully. You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        label="New Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
        required
      />
      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        fullWidth
        required
      />
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </Stack>
  );
};

export default ResetPasswordForm;
