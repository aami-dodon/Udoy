import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';

import ProfileForm from '../components/ProfileForm.jsx';

const ProfilePage = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your personal details and keep your account secure.
        </Typography>
        <ProfileForm />
      </Stack>
    </Paper>
  </Container>
);

export default ProfilePage;
