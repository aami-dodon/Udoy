const tokens = {
  colors: {
    brand: {
      evergreen: '#2F5233',
      evergreenSoft: '#3D6A42',
      evergreenDeep: '#224029',
      ecru: '#D4A373',
      ecruBright: '#E2B786',
      mintSage: '#A3B18A',
    },
    base: {
      porcelain: '#F5F5F4',
      porcelainTint: '#ECEBE8',
      porcelainShade: '#E2E1DD',
      blackOlive: '#1C1C1C',
    },
    neutral: {
      50: '#F8F8F7',
      100: '#E7E7E5',
      200: '#D1D0CC',
      300: '#B6B4AD',
      400: '#96948B',
      500: '#77756B',
      600: '#5D5B52',
      700: '#424038',
      800: '#2F2D27',
      900: '#1C1C1C',
    },
    support: {
      sky: '#F3E7DA',
      forest: '#254D32',
    },
  },
  typography: {
    fontFamily: {
      sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      display: ['"Playfair Display"', '"Times New Roman"', 'serif'],
    },
    letterSpacing: {
      tight: '-0.03em',
      relaxed: '0.02em',
    },
  },
  layout: {
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    container: {
      base: '1.5rem',
      xl: '4.5rem',
    },
    shadow: {
      soft: '0 30px 80px -40px rgba(47, 82, 51, 0.55)',
      subtle: '0 15px 40px -25px rgba(28, 28, 28, 0.4)',
    },
  },
  gradients: {
    hero: 'linear-gradient(135deg, rgba(47, 82, 51, 0.95) 0%, rgba(28, 28, 28, 0.92) 100%)',
    spotlight: 'linear-gradient(140deg, rgba(212, 163, 115, 0.2) 0%, rgba(163, 177, 138, 0.35) 100%)',
  },
};

module.exports = tokens;
