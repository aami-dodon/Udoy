import { createTheme } from '@mui/material/styles';

import { BRAND_COLORS, BRAND_TYPOGRAPHY } from '@shared/theme/brand.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BRAND_COLORS.primary
    },
    secondary: {
      main: BRAND_COLORS.secondary
    },
    background: {
      default: BRAND_COLORS.background,
      paper: BRAND_COLORS.surface
    }
  },
  typography: {
    fontFamily: BRAND_TYPOGRAPHY.fontFamily,
    h4: {
      fontWeight: 600
    },
    body1: {
      lineHeight: 1.6
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    }
  }
});

export default theme;
