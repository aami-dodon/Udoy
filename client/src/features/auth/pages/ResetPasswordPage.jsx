import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import ResetPasswordForm from '../components/ResetPasswordForm.jsx';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h5" component="h1">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a new password for your account.
          </Typography>
          <ResetPasswordForm token={token} />
        </Stack>
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
