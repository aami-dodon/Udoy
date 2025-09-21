import React, { useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth.js';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
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
    </Stack>
  );
};

export default LoginForm;
