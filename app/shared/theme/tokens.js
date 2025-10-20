const primary = {
  50: '#fffbea',
  100: '#fff3c4',
  200: '#ffe380',
  300: '#ffd042',
  400: '#ffbd1a',
  500: '#f59f00',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
};

const neutral = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

const accent = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
  950: '#4c0519',
};

const info = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

const success = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
};

const warning = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
};

const danger = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
};

const surface = {
  base: '#f9fafb',
  muted: '#f4f4f5',
  raised: '#ffffff',
  subtle: '#fff6d6',
  overlay: 'rgba(24, 24, 27, 0.52)',
  inverted: '#111827',
};

const typography = {
  fonts: {
    sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
    display: ['"Fraunces"', '"DM Sans"', 'serif'],
    mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
  },
  scale: {
    'display-3xl': { size: '4.5rem', lineHeight: '1.05', letterSpacing: '-0.04em', weight: '700' },
    'display-2xl': { size: '3.75rem', lineHeight: '1.06', letterSpacing: '-0.035em', weight: '700' },
    'display-xl': { size: '3rem', lineHeight: '1.08', letterSpacing: '-0.03em', weight: '700' },
    'display-lg': { size: '2.5rem', lineHeight: '1.1', letterSpacing: '-0.025em', weight: '600' },
    'heading-2xl': { size: '2.25rem', lineHeight: '1.18', weight: '600' },
    'heading-xl': { size: '2rem', lineHeight: '1.2', weight: '600' },
    'heading-lg': { size: '1.75rem', lineHeight: '1.28', weight: '600' },
    'heading-md': { size: '1.5rem', lineHeight: '1.32', weight: '600' },
    'heading-sm': { size: '1.25rem', lineHeight: '1.35', weight: '600' },
    'body-lg': { size: '1.125rem', lineHeight: '1.65', weight: '400' },
    'body-base': { size: '1rem', lineHeight: '1.7', weight: '400' },
    'body-sm': { size: '0.875rem', lineHeight: '1.6', weight: '400' },
    'body-xs': { size: '0.75rem', lineHeight: '1.45', letterSpacing: '0.04em', weight: '500' },
    eyebrow: { size: '0.75rem', lineHeight: '1.5', letterSpacing: '0.2em', weight: '600' },
  },
};

const layout = {
  container: {
    padding: {
      DEFAULT: '1.5rem',
      sm: '2rem',
      lg: '2.5rem',
    },
  },
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  spacing: {
    '0': '0px',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '4.5': '1.125rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '7.5': '1.875rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '13': '3.25rem',
    '14': '3.5rem',
    '16': '4rem',
    '18': '4.5rem',
    '20': '5rem',
    '22': '5.5rem',
    '24': '6rem',
    '26': '6.5rem',
    '30': '7.5rem',
    '34': '8.5rem',
    '40': '10rem',
    '42': '10.5rem',
    '48': '12rem',
    '56': '14rem',
    '64': '16rem',
    '80': '20rem',
    '96': '24rem',
    '108': '27rem',
  },
  maxWidth: {
    'content-xs': '24rem',
    'content-sm': '32rem',
    'content-md': '44rem',
    'content-lg': '64rem',
    'content-xl': '80rem',
    'content-2xl': '90rem',
    page: '96rem',
    dashboard: '110rem',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.75rem',
    '3xl': '2.25rem',
    pill: '9999px',
  },
};

const shadows = {
  strong: '0 32px 60px -30px rgba(17, 24, 39, 0.35)',
  soft: '0 20px 40px -24px rgba(17, 24, 39, 0.18)',
  brand: '0 24px 45px -24px rgba(245, 159, 0, 0.35)',
  accent: '0 20px 38px -22px rgba(241, 70, 104, 0.3)',
  focus: '0 0 0 4px rgba(245, 159, 0, 0.28)',
  outline: '0 0 0 1px rgba(24, 24, 27, 0.14)',
};

const motion = {
  transition: {
    fast: '160ms',
    normal: '240ms',
    slow: '420ms',
    slower: '680ms',
  },
  easing: {
    emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
    exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
  },
};

const tokens = {
  colors: {
    primary,
    brand: primary,
    accent,
    neutral,
    info,
    success,
    warning,
    danger,
    surface,
  },
  typography,
  layout,
  shadows,
  motion,
};

const colors = tokens.colors;

export default tokens;
export { colors, typography, layout, shadows, motion };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = tokens;
  module.exports.default = tokens;
}
