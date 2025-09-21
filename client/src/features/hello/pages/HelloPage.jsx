import React, { useEffect, useState } from 'react';
import { Container, CircularProgress, Alert, Box } from '@mui/material';
import HelloMessage from '../components/HelloMessage.jsx';
import { fetchJson } from '../../../utils/api.js';

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

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        {loading && <CircularProgress />}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && <HelloMessage message={message} />}
      </Box>
    </Container>
  );
};

export default HelloPage;
