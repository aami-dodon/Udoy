/**
 * Udoy shared Tailwind preset.
 *
 * This file exposes design tokens that every application can consume by
 * adding the preset to their Tailwind config (see `app/client/tailwind.config.js`).
 *
 * Token naming cheatsheet for feature code:
 * - Colors: use `bg-brand-700`, `text-accent-400`, `border-clay-600`, or
 *   `bg-success-500` to reference the shared palette.
 * - Typography: use the custom font-size utilities like `text-display-lg`,
 *   `text-heading-sm`, or `text-body-sm` for consistent type hierarchy.
 * - Spacing: use the extended spacing scale (e.g. `p-18`, `gap-22`, `h-30`)
 *   when you need rhythm beyond Tailwind's defaults.
 */

// Attempt to resolve plugins from the preset itself or the consuming app so
// each application can install the dependency locally.
const loadPresetPlugin = (moduleName) => {
  try {
    return require(moduleName);
  } catch (error) {
    return require(require.resolve(moduleName, { paths: [process.cwd()] }));
  }
};

const forms = loadPresetPlugin('@tailwindcss/forms');

const earthyBlue = {
  50: '#f1f5f8',
  100: '#dbe6ef',
  200: '#b9cedd',
  300: '#93b2c8',
  400: '#6f95b1',
  500: '#547a98',
  600: '#416281',
  700: '#334c65',
  800: '#243547',
  900: '#15212f',
  950: '#0b141d',
};

const goldenHighlight = {
  50: '#fff8ed',
  100: '#feeecf',
  200: '#fbda9f',
  300: '#f6c16a',
  400: '#eda03a',
  500: '#d97706',
  600: '#b35805',
  700: '#8c4209',
  800: '#6f340d',
  900: '#572a0f',
  950: '#321505',
};

const clayNeutral = {
  50: '#f6f5f3',
  100: '#e9e6e1',
  200: '#d3cec6',
  300: '#b9b1a4',
  400: '#a09386',
  500: '#87786d',
  600: '#6e6057',
  700: '#564a43',
  800: '#3d342f',
  900: '#26211f',
  950: '#151210',
};

const success = {
  50: '#ecf7f3',
  100: '#c7ebdf',
  200: '#93d7c2',
  300: '#5fc1a4',
  400: '#34a985',
  500: '#1e8f6c',
  600: '#167156',
  700: '#125844',
  800: '#0f4434',
  900: '#0a2d22',
  950: '#051c15',
};

const warning = {
  50: '#fff9eb',
  100: '#ffefc6',
  200: '#ffd588',
  300: '#ffb94a',
  400: '#ff9e1c',
  500: '#f07907',
  600: '#c65c04',
  700: '#994305',
  800: '#723205',
  900: '#532405',
  950: '#2f1302',
};

const danger = {
  50: '#fdf1f1',
  100: '#f9dada',
  200: '#f0aaaa',
  300: '#e87b7b',
  400: '#df4f4f',
  500: '#c92e2e',
  600: '#a52222',
  700: '#7d1919',
  800: '#5c1212',
  900: '#3a0b0b',
  950: '#220606',
};

module.exports = {
  theme: {
    extend: {
      colors: {
        brand: earthyBlue,
        accent: goldenHighlight,
        clay: clayNeutral,
        success,
        warning,
        danger,
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      fontSize: {
        'display-2xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-xl': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-xl': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body-base': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'eyebrow': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.2em' }],
      },
      lineHeight: {
        cozy: '1.7',
        snug: '1.4',
        tight: '1.2',
      },
      spacing: {
        '4.5': '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        42: '10.5rem',
        108: '27rem',
      },
      maxWidth: {
        'content-narrow': '40rem',
        'content-readable': '56rem',
        'content-wide': '72rem',
      },
      boxShadow: {
        elevated: '0 25px 50px -12px rgba(21, 33, 47, 0.45)',
        outline: '0 0 0 1px rgba(21, 33, 47, 0.12)',
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
};
