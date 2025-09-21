import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const HelloMessage = ({ message }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Udoy! This message comes directly from the backend API.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HelloMessage;
