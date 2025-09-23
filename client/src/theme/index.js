import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb'
    },
    secondary: {
      main: '#f59e0b'
    },
    background: {
      default: '#f4f6fb',
      paper: '#ffffff'
    }
  },
  typography: {
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem'
    },
    body1: {
      fontSize: '1rem'
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;
