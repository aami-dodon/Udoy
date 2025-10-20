const sharedPreset = require('../shared/theme/tailwind.preset');
const tokens = require('../shared/theme/tokens');

const { colors, layout } = tokens;
const { surface, neutral, primary, accent, danger } = colors;

module.exports = {
  // Consume the shared theme so the brand palette, typography, spacing, and
  // form styles stay consistent with the rest of the platform.
  presets: [sharedPreset],
  content: ['./index.html', './src/**/*.{js,jsx}', '../shared/components/ui/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: neutral[200],
        input: neutral[200],
        ring: primary[500],
        background: surface.base,
        foreground: neutral[900],
        primary: {
          DEFAULT: primary[500],
          foreground: surface.raised,
        },
        secondary: {
          DEFAULT: neutral[100],
          foreground: neutral[700],
        },
        muted: {
          DEFAULT: surface.muted,
          foreground: neutral[600],
        },
        accent: {
          DEFAULT: accent[500],
          foreground: surface.raised,
        },
        destructive: {
          DEFAULT: danger[500],
          foreground: surface.raised,
        },
        card: {
          DEFAULT: surface.raised,
          foreground: neutral[900],
        },
        popover: {
          DEFAULT: surface.raised,
          foreground: neutral[900],
        },
      },
      borderRadius: {
        lg: layout.radius.lg,
        md: layout.radius.md,
        sm: layout.radius.sm,
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
