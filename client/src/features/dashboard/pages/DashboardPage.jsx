import React from 'react';
import { Container, Paper, Stack, Typography } from '@mui/material';

import { useAuth } from '../../../hooks/useAuth.js';

const roleMessages = {
  student: 'Explore your enrolled courses and continue learning.',
  teacher: 'Create engaging lessons and manage your classrooms.',
  admin: 'Monitor platform activity and support learners and teachers.'
};

const DashboardPage = () => {
  const { user } = useAuth();
  const message = roleMessages[user.role] || 'Welcome back!';

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            Welcome, {user.name}!
          </Typography>
          <Typography variant="body1">Role: {user.role}</Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
