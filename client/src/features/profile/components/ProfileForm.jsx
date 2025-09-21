import React, { useEffect, useState } from 'react';
import { Alert, Button, Divider, Stack, TextField, Typography } from '@mui/material';

import { useAuth } from '../../../hooks/useAuth.js';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail('');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {};

    if (name && name !== user.name) {
      payload.name = name;
    }

    if (email) {
      payload.email = email;
    }

    if (newPassword) {
      payload.newPassword = newPassword;
    }

    if (!Object.keys(payload).length) {
      setError('Please change your name, email, or password before saving.');
      setLoading(false);
      return;
    }

    if ((email || newPassword) && !currentPassword) {
      setError('Current password is required to change email or password.');
      setLoading(false);
      return;
    }

    if (currentPassword) {
      payload.currentPassword = currentPassword;
    }

    try {
      const response = await updateProfile(payload);
      if (response.emailChangePending) {
        setSuccess(response.message || 'Profile updated. Please verify your new email.');
      } else {
        setSuccess(response.message || 'Profile updated successfully.');
      }
      setEmail('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      <Typography variant="body1">Current email: {user.email}</Typography>
      <Typography variant="body2" color="text.secondary">
        Status: {user.isVerified ? 'Verified' : 'Pending verification'} · {user.isActive ? 'Active' : 'Inactive'}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
      <TextField
        label="New Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        helperText="Leave blank to keep your current email"
        fullWidth
      />
      <Divider>Change Password</Divider>
      <TextField
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        helperText="Required if changing email or password"
      />
      <TextField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        helperText="Leave blank to keep your current password"
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </Stack>
  );
};

export default ProfileForm;
