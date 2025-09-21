import React, { useMemo, useState } from 'react';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '@shared/constants/index.js';

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleOptions = useMemo(() => [ROLES.STUDENT, ROLES.TEACHER], []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    try {
      const response = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      if (response?.requiresVerification) {
        const extra = response.supportEmail
          ? ` If you do not receive the email within a few minutes, contact us at ${response.supportEmail}.`
          : '';
        setSuccess(`Sign up successful! Please check your email to verify your account.${extra}`);
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: ROLES.STUDENT
        });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        fullWidth
        required
      />
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
        helperText="Minimum 6 characters"
      />
      <TextField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        fullWidth
        required
        error={Boolean(form.confirmPassword) && form.password !== form.confirmPassword}
        helperText={
          form.confirmPassword && form.password !== form.confirmPassword
            ? 'Passwords must match'
            : 'Re-enter password'
        }
      />
      <TextField
        select
        label="Role"
        name="role"
        value={form.role}
        onChange={handleChange}
        fullWidth
        required
      >
        {roleOptions.map((role) => (
          <MenuItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Signing up...' : 'Sign Up'}
      </Button>
    </Stack>
  );
};

export default SignupForm;
