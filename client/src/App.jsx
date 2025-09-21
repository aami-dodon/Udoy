import React from 'react';
import { Box } from '@mui/material';

import AppRoutes from './routes.jsx';
import Navbar from './common/Navbar.jsx';

const App = () => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box component="main" flexGrow={1}>
        <AppRoutes />
      </Box>
    </Box>
  );
};

export default App;
