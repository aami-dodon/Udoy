import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';

import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx';

const ForgotPasswordPage = () => (
  <Container maxWidth="sm" sx={{ py: 6 }}>
    <Paper elevation={3} sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h5" component="h1">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the email associated with your account and we will send you instructions to reset your password.
        </Typography>
        <ForgotPasswordForm />
      </Stack>
    </Paper>
  </Container>
);

export default ForgotPasswordPage;
