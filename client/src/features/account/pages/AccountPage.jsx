import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';

import AccountSettingsForm from '../components/AccountSettingsForm.jsx';

const AccountPage = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your personal details and keep your account secure.
        </Typography>
        <AccountSettingsForm />
      </Stack>
    </Paper>
  </Container>
);

export default AccountPage;
