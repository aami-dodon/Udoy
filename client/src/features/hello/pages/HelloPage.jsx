import React, { useEffect, useState } from 'react';
import { Container, CircularProgress, Alert, Box, Stack, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import HelloMessage from '../components/HelloMessage.jsx';
import { fetchJson } from '../../../utils/api.js';
import { useAuth } from '../../../hooks/useAuth.js';

const HelloPage = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const data = await fetchJson('/api/hello');
        setMessage(data.message);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessage();
  }, []);

  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={3} alignItems="center">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          {loading && <CircularProgress />}
          {!loading && error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && <HelloMessage message={message} />}
        </Box>
        {!loading && !error && (
          <Stack direction="row" spacing={2}>
            {isAuthenticated ? (
              <Button component={RouterLink} to="/dashboard" variant="contained">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" variant="contained">
                  Login
                </Button>
                <Button component={RouterLink} to="/signup" variant="outlined">
                  Sign Up
                </Button>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default HelloPage;
