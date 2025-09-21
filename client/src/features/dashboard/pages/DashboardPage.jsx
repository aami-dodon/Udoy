import React from 'react';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth.js';
import { ROLES } from '@shared/constants/index.js';

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
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/profile" variant="outlined">
              Manage Profile
            </Button>
            {user.role === ROLES.ADMIN && (
              <Button component={RouterLink} to="/admin/users" variant="contained">
                User Management
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
