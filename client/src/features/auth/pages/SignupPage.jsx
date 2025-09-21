import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import SignupForm from '../components/SignupForm.jsx';

const SignupPage = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the form below to create your account. We will send a verification link to your email to activate it.
          </Typography>
          <SignupForm />
          <Typography variant="body2">
            Already have an account? <RouterLink to="/login">Log in</RouterLink>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SignupPage;
