import React from 'react';
import { Container, Paper, Typography, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import LoginForm from '../components/LoginForm.jsx';

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Log In
          </Typography>
          <LoginForm />
          <Typography variant="body2">
            Don&apos;t have an account?{' '}
            <RouterLink to="/signup">Sign up now</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
