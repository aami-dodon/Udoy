/**
 * Udoy shared Tailwind preset.
 *
 * This file exposes design tokens that every application can consume by
 * adding the preset to their Tailwind config (see `app/client/tailwind.config.js`).
 *
 * Token naming cheatsheet for feature code:
 * - Colors: use `bg-brand-700`, `text-accent-400`, `border-neutral-600`, or
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
const plugin = loadPresetPlugin('tailwindcss/plugin');

const brand = {
  50: '#eef4ff',
  100: '#d8e4ff',
  200: '#b2c9ff',
  300: '#89a9ff',
  400: '#6083ff',
  500: '#3a62f4',
  600: '#274ad7',
  700: '#1d38a8',
  800: '#152b7e',
  900: '#0f1f59',
  950: '#080f2b',
};

const accent = {
  50: '#ecfdf8',
  100: '#d1faed',
  200: '#a7f3de',
  300: '#6ee7ca',
  400: '#34d3b3',
  500: '#12b090',
  600: '#0b9177',
  700: '#0a725d',
  800: '#0a5747',
  900: '#083b31',
  950: '#03211c',
};

const neutral = {
  50: '#f8fbff',
  100: '#eef2f7',
  200: '#d9e0ea',
  300: '#c1ccdc',
  400: '#9aabbe',
  500: '#73869c',
  600: '#536178',
  700: '#3a4658',
  800: '#242d3b',
  900: '#161b26',
  950: '#0d1017',
};

const surface = {
  base: '#0b1220',
  muted: '#121b2f',
  raised: '#152139',
  subtle: '#1c2943',
  overlay: 'rgba(8, 15, 33, 0.7)',
  inverted: '#ffffff',
};

const info = {
  50: '#eff6ff',
  100: '#d6e4ff',
  200: '#afc7ff',
  300: '#86a8ff',
  400: '#5982ff',
  500: '#3262f5',
  600: '#244bd8',
  700: '#1b39aa',
  800: '#152a7f',
  900: '#0f1d59',
  950: '#080f2f',
};

const success = {
  50: '#e9fdf3',
  100: '#c6f7de',
  200: '#96ecc1',
  300: '#5fdba1',
  400: '#34c988',
  500: '#1fab6f',
  600: '#148e5b',
  700: '#11704a',
  800: '#0d5136',
  900: '#093627',
  950: '#041f17',
};

const warning = {
  50: '#fff7ed',
  100: '#ffebce',
  200: '#ffd094',
  300: '#ffb35a',
  400: '#ff9433',
  500: '#ff7a1a',
  600: '#e35f10',
  700: '#b7470d',
  800: '#8a340f',
  900: '#5e230b',
  950: '#341205',
};

const danger = {
  50: '#fff1f1',
  100: '#ffd9dc',
  200: '#ffadb6',
  300: '#ff7c8f',
  400: '#ff516f',
  500: '#f82d55',
  600: '#d01646',
  700: '#a01137',
  800: '#6f0d26',
  900: '#430818',
  950: '#24030c',
};

const radius = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.75rem',
  '3xl': '2.25rem',
  pill: '9999px',
};

const animationKeyframes = {
  'pulse-soft': {
    '0%, 100%': { opacity: '0.5' },
    '50%': { opacity: '1' },
  },
  'slide-up-fade': {
    '0%': { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  shimmer: {
    '0%': { transform: 'translateX(-50%)' },
    '100%': { transform: 'translateX(150%)' },
  },
};

const themePlugin = plugin(({ addBase, addComponents, addUtilities, theme }) => {
  const cardBase = {
    backgroundColor: theme('colors.surface.raised'),
    borderRadius: theme('borderRadius.2xl'),
    border: `1px solid ${theme('colors.neutral.800')}`,
    boxShadow: theme('boxShadow.soft'),
    padding: theme('spacing.8'),
    backdropFilter: 'blur(18px)',
  };

  const alertBase = {
    display: 'grid',
    gap: theme('spacing.2'),
    padding: theme('spacing.4'),
    borderRadius: theme('borderRadius.xl'),
    borderWidth: '1px',
    borderStyle: 'solid',
    alignItems: 'center',
  };

  const fontStack = (family) => {
    const value = theme(`fontFamily.${family}`);
    return Array.isArray(value) ? value.join(', ') : value;
  };

  addBase({
    ':root': {
      colorScheme: 'dark',
      '--shadow-color-strong': '0 25px 65px -20px rgba(8, 15, 33, 0.65)',
      '--shadow-color-soft': '0 18px 45px -22px rgba(8, 15, 33, 0.55)',
      '--transition-fast': '150ms',
      '--transition-normal': '240ms',
      '--transition-slow': '420ms',
    },
    '*': {
      boxSizing: 'border-box',
    },
    'html, body': {
      minHeight: '100%',
      backgroundColor: theme('colors.surface.base'),
      color: theme('colors.neutral.100'),
      fontFamily: fontStack('sans'),
      textRendering: 'optimizeLegibility',
    },
    body: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
    'h1, h2, h3, h4, h5, h6': {
      color: theme('colors.neutral.50'),
      fontFamily: fontStack('display'),
      fontWeight: theme('fontWeight.semibold'),
      margin: 0,
    },
    h1: {
      fontSize: theme('fontSize.display-lg')[0],
      lineHeight: theme('fontSize.display-lg')[1].lineHeight,
      letterSpacing: theme('fontSize.display-lg')[1].letterSpacing,
    },
    h2: {
      fontSize: theme('fontSize.heading-xl')[0],
      lineHeight: theme('fontSize.heading-xl')[1].lineHeight,
    },
    h3: {
      fontSize: theme('fontSize.heading-lg')[0],
      lineHeight: theme('fontSize.heading-lg')[1].lineHeight,
    },
    h4: {
      fontSize: theme('fontSize.heading-md')[0],
      lineHeight: theme('fontSize.heading-md')[1].lineHeight,
    },
    h5: {
      fontSize: theme('fontSize.heading-sm')[0],
      lineHeight: theme('fontSize.heading-sm')[1].lineHeight,
    },
    h6: {
      fontSize: theme('fontSize.body-sm')[0],
      lineHeight: theme('fontSize.body-sm')[1].lineHeight,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    p: {
      margin: 0,
      fontSize: theme('fontSize.body-base')[0],
      lineHeight: theme('fontSize.body-base')[1].lineHeight,
      color: theme('colors.neutral.200'),
    },
    'a, button': {
      fontFamily: fontStack('sans'),
    },
    a: {
      color: theme('colors.accent.300'),
      fontWeight: theme('fontWeight.medium'),
      textDecoration: 'none',
      transition: `color var(--transition-fast) ease`,
    },
    'a:hover': {
      color: theme('colors.accent.200'),
    },
    ul: {
      paddingLeft: theme('spacing.6'),
      margin: 0,
    },
    'ul li': {
      marginBottom: theme('spacing.2'),
    },
    ol: {
      paddingLeft: theme('spacing.6'),
      margin: 0,
    },
    blockquote: {
      borderLeft: `4px solid ${theme('colors.brand.500')}`,
      backgroundColor: theme('colors.surface.muted'),
      borderRadius: theme('borderRadius.lg'),
      padding: theme('spacing.4'),
      color: theme('colors.neutral.100'),
    },
    code: {
      fontFamily: fontStack('mono'),
      backgroundColor: theme('colors.surface.muted'),
      color: theme('colors.accent.200'),
      padding: `0 ${theme('spacing.2')}`,
      borderRadius: theme('borderRadius.sm'),
      fontSize: theme('fontSize.body-sm')[0],
    },
    pre: {
      fontFamily: fontStack('mono'),
      backgroundColor: theme('colors.surface.muted'),
      padding: theme('spacing.5'),
      borderRadius: theme('borderRadius.xl'),
      overflow: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: theme('colors.surface.raised'),
      borderRadius: theme('borderRadius.2xl'),
      overflow: 'hidden',
    },
    'thead th': {
      textAlign: 'left',
      backgroundColor: theme('colors.surface.muted'),
      color: theme('colors.neutral.100'),
      padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
      fontSize: theme('fontSize.body-sm')[0],
      fontWeight: theme('fontWeight.semibold'),
    },
    'tbody td': {
      padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
      borderBottom: `1px solid ${theme('colors.neutral.800')}`,
      color: theme('colors.neutral.200'),
      fontSize: theme('fontSize.body-sm')[0],
    },
    'tbody tr:hover td': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    img: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: theme('borderRadius.xl'),
    },
    'button, [role="button"], input, select, textarea': {
      outlineOffset: theme('outlineOffset.2'),
    },
    'button:focus-visible, [role="button"]:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible': {
      outline: `${theme('outlineWidth.2')} solid ${theme('colors.accent.400')}`,
    },
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: theme('borderRadius.full'),
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
        scrollBehavior: 'auto !important',
      },
    },
  });

  addComponents({
    '.app-shell': {
      minHeight: '100vh',
      backgroundImage: theme('backgroundImage.mesh'),
      backgroundColor: theme('colors.surface.base'),
      color: theme('colors.neutral.100'),
      fontFamily: fontStack('sans'),
      display: 'flex',
      flexDirection: 'column',
    },
    '.page-container': {
      width: '100%',
      marginInline: 'auto',
      paddingInline: 'clamp(1.25rem, 4vw, 2.75rem)',
      paddingBlock: theme('spacing.16'),
      maxWidth: theme('maxWidth.page'),
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.10'),
    },
    '.page-section': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.6'),
    },
    '.stack-sm': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.3'),
    },
    '.stack-md': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.5'),
    },
    '.stack-lg': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.8'),
    },
    '.stack-xl': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.10'),
    },
    '.card': {
      ...cardBase,
    },
    '.card--muted': {
      ...cardBase,
      backgroundColor: theme('colors.surface.muted'),
    },
    '.card--brand': {
      ...cardBase,
      borderColor: theme('colors.brand.500'),
      boxShadow: theme('boxShadow.brand'),
    },
    '.card--inset': {
      ...cardBase,
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: theme('colors.neutral.700'),
    },
    '.card__header': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.3'),
    },
    '.card__title': {
      fontSize: theme('fontSize.heading-lg')[0],
      lineHeight: theme('fontSize.heading-lg')[1].lineHeight,
      fontWeight: theme('fontWeight.semibold'),
      color: theme('colors.neutral.50'),
    },
    '.card__subtitle': {
      fontSize: theme('fontSize.body-sm')[0],
      lineHeight: theme('fontSize.body-sm')[1].lineHeight,
      color: theme('colors.neutral.300'),
    },
    '.card__body': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.5'),
    },
    '.divider': {
      height: '1px',
      width: '100%',
      backgroundColor: theme('colors.neutral.800'),
    },
    '.badge': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingInline: theme('spacing.3'),
      paddingBlock: '0.25rem',
      borderRadius: theme('borderRadius.pill'),
      borderWidth: '1px',
      borderStyle: 'solid',
      fontSize: theme('fontSize.body-xs')[0],
      fontWeight: theme('fontWeight.medium'),
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      gap: theme('spacing.2'),
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      color: theme('colors.neutral.300'),
    },
    '.badge--info': {
      backgroundColor: 'rgba(89, 130, 255, 0.15)',
      borderColor: 'rgba(89, 130, 255, 0.4)',
      color: theme('colors.info.200'),
    },
    '.badge--success': {
      backgroundColor: 'rgba(31, 171, 111, 0.15)',
      borderColor: 'rgba(31, 171, 111, 0.45)',
      color: theme('colors.success.200'),
    },
    '.badge--warning': {
      backgroundColor: 'rgba(255, 148, 51, 0.15)',
      borderColor: 'rgba(255, 148, 51, 0.4)',
      color: theme('colors.warning.200'),
    },
    '.badge--danger': {
      backgroundColor: 'rgba(248, 45, 85, 0.18)',
      borderColor: 'rgba(248, 45, 85, 0.4)',
      color: theme('colors.danger.200'),
    },
    '.badge--neutral': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.16)',
      color: theme('colors.neutral.200'),
    },
    '.btn': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme('borderRadius.lg'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'transparent',
      fontWeight: theme('fontWeight.semibold'),
      fontSize: theme('fontSize.body-sm')[0],
      lineHeight: theme('fontSize.body-sm')[1].lineHeight,
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.3'),
      gap: theme('spacing.2'),
      transitionProperty: 'color, background-color, border-color, transform, box-shadow',
      transitionDuration: 'var(--transition-normal)',
      boxShadow: theme('boxShadow.soft'),
      color: theme('colors.neutral.100'),
      backgroundColor: theme('colors.surface.muted'),
    },
    '.btn:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme('boxShadow.brand'),
    },
    '.btn:active': {
      transform: 'translateY(0)',
      boxShadow: theme('boxShadow.soft'),
    },
    '.btn:disabled': {
      opacity: '0.6',
      cursor: 'not-allowed',
      boxShadow: 'none',
      transform: 'none',
    },
    '.btn--primary': {
      backgroundColor: theme('colors.brand.500'),
      color: theme('colors.surface.inverted'),
      boxShadow: theme('boxShadow.brand'),
    },
    '.btn--primary:hover': {
      backgroundColor: theme('colors.brand.400'),
    },
    '.btn--accent': {
      backgroundColor: theme('colors.accent.500'),
      color: theme('colors.surface.inverted'),
      boxShadow: theme('boxShadow.accent'),
    },
    '.btn--accent:hover': {
      backgroundColor: theme('colors.accent.400'),
    },
    '.btn--secondary': {
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: theme('colors.neutral.700'),
      color: theme('colors.neutral.100'),
    },
    '.btn--ghost': {
      backgroundColor: 'transparent',
      borderColor: 'rgba(255, 255, 255, 0.16)',
      color: theme('colors.neutral.200'),
      boxShadow: 'none',
    },
    '.btn--ghost:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      boxShadow: 'none',
    },
    '.btn--danger': {
      backgroundColor: theme('colors.danger.500'),
      color: theme('colors.surface.inverted'),
      boxShadow: theme('boxShadow.focus'),
    },
    '.btn--icon': {
      width: theme('spacing.11'),
      height: theme('spacing.11'),
      paddingInline: 0,
      paddingBlock: 0,
    },
    '.btn--sm': {
      paddingInline: theme('spacing.4'),
      paddingBlock: theme('spacing.2'),
      fontSize: theme('fontSize.body-xs')[0],
    },
    '.btn--lg': {
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.3'),
      fontSize: theme('fontSize.body-base')[0],
    },
    '.field': {
      display: 'grid',
      gap: theme('spacing.2'),
    },
    '.field__label': {
      fontSize: theme('fontSize.body-sm')[0],
      fontWeight: theme('fontWeight.medium'),
      color: theme('colors.neutral.200'),
    },
    '.field__hint': {
      fontSize: theme('fontSize.body-xs')[0],
      color: theme('colors.neutral.400'),
    },
    '.field__error': {
      fontSize: theme('fontSize.body-xs')[0],
      color: theme('colors.danger.300'),
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.2'),
    },
    '.input, .textarea, .select': {
      width: '100%',
      backgroundColor: theme('colors.surface.muted'),
      borderRadius: theme('borderRadius.xl'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme('colors.neutral.800'),
      paddingInline: theme('spacing.4'),
      paddingBlock: theme('spacing.3'),
      color: theme('colors.neutral.100'),
      transition: `border-color var(--transition-fast) ease, box-shadow var(--transition-fast) ease, background-color var(--transition-fast) ease`,
    },
    '.input::placeholder, .textarea::placeholder': {
      color: theme('colors.neutral.500'),
    },
    '.input:focus, .textarea:focus, .select:focus': {
      borderColor: theme('colors.accent.400'),
      boxShadow: `0 0 0 3px rgba(52, 211, 179, 0.35)`,
      backgroundColor: theme('colors.surface.raised'),
    },
    '.form-grid': {
      display: 'grid',
      gap: theme('spacing.4'),
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(18rem, 100%), 1fr))',
    },
    '.toggle': {
      position: 'relative',
      width: '3rem',
      height: '1.5rem',
      borderRadius: theme('borderRadius.pill'),
      backgroundColor: theme('colors.neutral.800'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.toggle::after': {
      content: '""',
      position: 'absolute',
      top: '0.125rem',
      left: '0.125rem',
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: theme('borderRadius.full'),
      backgroundColor: theme('colors.surface.inverted'),
      transition: `transform var(--transition-fast) ease`,
    },
    '.toggle[data-state="on"]': {
      backgroundColor: theme('colors.accent.500'),
    },
    '.toggle[data-state="on"]::after': {
      transform: 'translateX(1.5rem)',
    },
    '.alert': {
      ...alertBase,
      backgroundColor: 'rgba(89, 130, 255, 0.08)',
      borderColor: 'rgba(89, 130, 255, 0.35)',
      color: theme('colors.info.200'),
    },
    '.alert--info': {
      ...alertBase,
      backgroundColor: 'rgba(89, 130, 255, 0.08)',
      borderColor: 'rgba(89, 130, 255, 0.35)',
      color: theme('colors.info.200'),
    },
    '.alert--success': {
      ...alertBase,
      backgroundColor: 'rgba(31, 171, 111, 0.12)',
      borderColor: 'rgba(31, 171, 111, 0.35)',
      color: theme('colors.success.100'),
    },
    '.alert--warning': {
      ...alertBase,
      backgroundColor: 'rgba(255, 122, 26, 0.12)',
      borderColor: 'rgba(255, 122, 26, 0.4)',
      color: theme('colors.warning.200'),
    },
    '.alert--danger': {
      ...alertBase,
      backgroundColor: 'rgba(248, 45, 85, 0.12)',
      borderColor: 'rgba(248, 45, 85, 0.4)',
      color: theme('colors.danger.100'),
    },
    '.toast': {
      ...alertBase,
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: 'rgba(255, 255, 255, 0.08)',
      boxShadow: theme('boxShadow.raised'),
      minWidth: '18rem',
    },
    '.empty-state': {
      display: 'grid',
      placeItems: 'center',
      gap: theme('spacing.4'),
      padding: theme('spacing.12'),
      borderRadius: theme('borderRadius.2xl'),
      border: `1px dashed ${theme('colors.neutral.800')}`,
      backgroundColor: theme('colors.surface.muted'),
      textAlign: 'center',
    },
    '.empty-state__icon': {
      width: theme('spacing.16'),
      height: theme('spacing.16'),
      borderRadius: theme('borderRadius.full'),
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, rgba(58, 98, 244, 0.35), rgba(18, 176, 144, 0.35))',
      color: theme('colors.surface.inverted'),
      fontSize: theme('fontSize.heading-lg')[0],
      boxShadow: theme('boxShadow.brand'),
    },
    '.grid-auto-fit': {
      display: 'grid',
      gap: theme('spacing.6'),
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(20rem, 100%), 1fr))',
    },
    '.data-table': {
      ...cardBase,
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    '.data-table__toolbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme('spacing.4'),
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.4'),
      backgroundColor: theme('colors.surface.muted'),
      borderBottom: `1px solid ${theme('colors.neutral.800')}`,
    },
    '.data-table__heading': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.1'),
    },
    '.data-table__title': {
      fontSize: theme('fontSize.heading-sm')[0],
      lineHeight: theme('fontSize.heading-sm')[1].lineHeight,
      fontWeight: theme('fontWeight.semibold'),
      color: theme('colors.neutral.50'),
    },
    '.data-table__meta': {
      fontSize: theme('fontSize.body-xs')[0],
      color: theme('colors.neutral.400'),
    },
    '.data-table__table': {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    '.data-table__table thead th': {
      textAlign: 'left',
      fontSize: theme('fontSize.body-xs')[0],
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: theme('colors.neutral.300'),
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.3'),
      borderBottom: `1px solid ${theme('colors.neutral.800')}`,
      backgroundColor: theme('colors.surface.base'),
    },
    '.data-table__table tbody tr': {
      transition: 'background-color var(--transition-fast) ease, transform var(--transition-fast) ease',
    },
    '.data-table__table tbody tr:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      transform: 'translateY(-1px)',
    },
    '.data-table__table tbody td': {
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.4'),
      borderBottom: `1px solid ${theme('colors.neutral.800')}`,
      fontSize: theme('fontSize.body-sm')[0],
      color: theme('colors.neutral.100'),
    },
    '.data-table__table tbody tr:last-child td': {
      borderBottom: 'none',
    },
    '.data-table__cell--muted': {
      color: theme('colors.neutral.400'),
    },
    '.data-table__actions': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.2'),
    },
    '.data-table__action': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme('spacing.1'),
      paddingInline: theme('spacing.3'),
      paddingBlock: '0.375rem',
      borderRadius: theme('borderRadius.md'),
      borderWidth: '1px',
      borderStyle: 'solid',
      fontSize: theme('fontSize.body-xs')[0],
      fontWeight: theme('fontWeight.medium'),
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      transition: 'background-color var(--transition-fast) ease, color var(--transition-fast) ease, border-color var(--transition-fast) ease',
    },
    '.data-table__action:focus-visible': {
      outline: `${theme('outlineWidth.2')} solid ${theme('colors.accent.400')}`,
      outlineOffset: theme('outlineOffset.2'),
    },
    '.data-table__action--edit': {
      backgroundColor: 'rgba(18, 176, 144, 0.12)',
      borderColor: 'rgba(18, 176, 144, 0.35)',
      color: theme('colors.accent.200'),
    },
    '.data-table__action--edit:hover': {
      backgroundColor: 'rgba(18, 176, 144, 0.2)',
      borderColor: 'rgba(18, 176, 144, 0.45)',
    },
    '.data-table__action--modify': {
      backgroundColor: 'rgba(58, 98, 244, 0.12)',
      borderColor: 'rgba(58, 98, 244, 0.35)',
      color: theme('colors.brand.200'),
    },
    '.data-table__action--modify:hover': {
      backgroundColor: 'rgba(58, 98, 244, 0.2)',
      borderColor: 'rgba(58, 98, 244, 0.45)',
    },
    '.data-table__action--delete': {
      backgroundColor: 'rgba(248, 45, 85, 0.12)',
      borderColor: 'rgba(248, 45, 85, 0.4)',
      color: theme('colors.danger.200'),
    },
    '.data-table__action--delete:hover': {
      backgroundColor: 'rgba(248, 45, 85, 0.2)',
      borderColor: 'rgba(248, 45, 85, 0.5)',
    },
    '.table-card': {
      ...cardBase,
      padding: 0,
      overflow: 'hidden',
    },
    '.table-card table': {
      borderRadius: 0,
    },
    '.modal': {
      position: 'fixed',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: theme('colors.surface.overlay'),
      zIndex: theme('zIndex.overlay'),
      padding: theme('spacing.6'),
    },
    '.modal__panel': {
      ...cardBase,
      width: 'min(36rem, 100%)',
      animation: `${theme('animation.slide-up-fade')}`,
    },
    '.drawer': {
      position: 'fixed',
      insetBlock: 0,
      insetInlineEnd: 0,
      width: 'min(26rem, 100%)',
      backgroundColor: theme('colors.surface.raised'),
      boxShadow: theme('boxShadow.raised'),
      zIndex: theme('zIndex.overlay'),
      padding: theme('spacing.8'),
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.6'),
    },
    '.tooltip': {
      position: 'relative',
      display: 'inline-flex',
    },
    '.tooltip__content': {
      position: 'absolute',
      insetInline: '50%',
      transform: 'translateX(-50%) translateY(-0.5rem)',
      backgroundColor: theme('colors.neutral.900'),
      color: theme('colors.surface.inverted'),
      paddingInline: theme('spacing.3'),
      paddingBlock: theme('spacing.2'),
      borderRadius: theme('borderRadius.md'),
      fontSize: theme('fontSize.body-xs')[0],
      whiteSpace: 'nowrap',
      boxShadow: theme('boxShadow.soft'),
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity var(--transition-fast) ease, transform var(--transition-fast) ease',
    },
    '.tooltip:hover .tooltip__content': {
      opacity: 1,
      transform: 'translateX(-50%) translateY(-0.75rem)',
    },
    '.navbar': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme('spacing.6'),
      paddingBlock: theme('spacing.4'),
    },
    '.navbar__brand': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.3'),
      fontSize: theme('fontSize.heading-sm')[0],
      color: theme('colors.surface.inverted'),
    },
    '.navbar__menu': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.4'),
    },
    '.sidebar': {
      width: '18rem',
      backgroundColor: theme('colors.surface.subtle'),
      borderRight: `1px solid ${theme('colors.neutral.800')}`,
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.2'),
      padding: theme('spacing.6'),
    },
    '.sidebar__section': {
      display: 'grid',
      gap: theme('spacing.3'),
    },
    '.sidebar__item': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.3'),
      paddingInline: theme('spacing.3'),
      paddingBlock: theme('spacing.2'),
      borderRadius: theme('borderRadius.lg'),
      color: theme('colors.neutral.300'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.sidebar__item:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: theme('colors.surface.inverted'),
    },
    '.sidebar__item--active': {
      backgroundColor: 'rgba(58, 98, 244, 0.16)',
      color: theme('colors.surface.inverted'),
    },
    '.breadcrumbs': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme('spacing.2'),
      alignItems: 'center',
      fontSize: theme('fontSize.body-sm')[0],
      color: theme('colors.neutral.400'),
    },
    '.tabs': {
      display: 'inline-flex',
      gap: theme('spacing.2'),
      padding: theme('spacing.1'),
      borderRadius: theme('borderRadius.pill'),
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    '.tab': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.2'),
      borderRadius: theme('borderRadius.pill'),
      color: theme('colors.neutral.300'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.tab--active': {
      backgroundColor: theme('colors.surface.inverted'),
      color: theme('colors.brand.700'),
      boxShadow: theme('boxShadow.soft'),
    },
    '.pagination': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme('spacing.2'),
    },
    '.pagination__item': {
      width: theme('spacing.10'),
      height: theme('spacing.10'),
      borderRadius: theme('borderRadius.full'),
      display: 'grid',
      placeItems: 'center',
      color: theme('colors.neutral.300'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.pagination__item:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      color: theme('colors.surface.inverted'),
    },
    '.pagination__item--active': {
      backgroundColor: theme('colors.brand.500'),
      color: theme('colors.surface.inverted'),
      boxShadow: theme('boxShadow.brand'),
    },
    '.search-bar': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.3'),
      paddingInline: theme('spacing.4'),
      paddingBlock: theme('spacing.2'),
      backgroundColor: theme('colors.surface.muted'),
      borderRadius: theme('borderRadius.xl'),
      border: `1px solid ${theme('colors.neutral.800')}`,
    },
    '.search-bar input': {
      border: 'none',
      background: 'transparent',
      color: theme('colors.neutral.100'),
      width: '100%',
      padding: 0,
    },
    '.search-bar input:focus': {
      outline: 'none',
    },
    '.progress-bar': {
      width: '100%',
      height: '0.6rem',
      borderRadius: theme('borderRadius.pill'),
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      overflow: 'hidden',
    },
    '.progress-bar__value': {
      height: '100%',
      backgroundImage: 'linear-gradient(90deg, rgba(58, 98, 244, 0.95), rgba(18, 176, 144, 0.95))',
      borderRadius: theme('borderRadius.pill'),
    },
    '.timeline': {
      position: 'relative',
      paddingLeft: theme('spacing.8'),
      display: 'grid',
      gap: theme('spacing.6'),
    },
    '.timeline::before': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: theme('spacing.2'),
      width: '2px',
      backgroundColor: theme('colors.neutral.800'),
    },
    '.timeline__item': {
      position: 'relative',
      paddingLeft: theme('spacing.4'),
    },
    '.timeline__item::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: `-${theme('spacing.6')}`,
      top: 0,
      width: theme('spacing.3'),
      height: theme('spacing.3'),
      borderRadius: theme('borderRadius.full'),
      backgroundImage: 'linear-gradient(135deg, rgba(58, 98, 244, 0.9), rgba(18, 176, 144, 0.9))',
      boxShadow: theme('boxShadow.brand'),
    },
    '.calendar-grid': {
      display: 'grid',
      gap: theme('spacing.3'),
      gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))',
    },
    '.calendar-grid__day': {
      display: 'grid',
      gap: theme('spacing.2'),
      alignContent: 'start',
      padding: theme('spacing.3'),
      borderRadius: theme('borderRadius.lg'),
      backgroundColor: theme('colors.surface.muted'),
      minHeight: '8rem',
    },
    '.accordion': {
      ...cardBase,
      padding: 0,
      overflow: 'hidden',
    },
    '.accordion__item': {
      borderBottom: `1px solid ${theme('colors.neutral.800')}`,
    },
    '.accordion__trigger': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.4'),
      cursor: 'pointer',
      color: theme('colors.neutral.100'),
    },
    '.accordion__content': {
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.4'),
      color: theme('colors.neutral.300'),
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    '.rating': {
      display: 'inline-flex',
      gap: theme('spacing.2'),
      color: theme('colors.warning.300'),
    },
    '.dashboard-widget': {
      ...cardBase,
      backgroundImage: 'linear-gradient(135deg, rgba(58, 98, 244, 0.25), rgba(18, 176, 144, 0.25))',
    },
    '.course-card': {
      ...cardBase,
      display: 'grid',
      gap: theme('spacing.4'),
      borderColor: 'rgba(89, 130, 255, 0.35)',
    },
    '.course-card__meta': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme('spacing.3'),
      color: theme('colors.neutral.300'),
      fontSize: theme('fontSize.body-xs')[0],
    },
    '.lesson-module': {
      ...cardBase,
      backgroundColor: theme('colors.surface.subtle'),
      display: 'grid',
      gap: theme('spacing.3'),
    },
    '.quiz-option': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.3'),
      paddingInline: theme('spacing.4'),
      paddingBlock: theme('spacing.3'),
      borderRadius: theme('borderRadius.xl'),
      border: `1px solid ${theme('colors.neutral.800')}`,
      transition: `background-color var(--transition-fast) ease, border-color var(--transition-fast) ease`,
      cursor: 'pointer',
    },
    '.quiz-option:hover': {
      backgroundColor: 'rgba(89, 130, 255, 0.12)',
      borderColor: theme('colors.brand.500'),
    },
    '.quiz-option--correct': {
      backgroundColor: 'rgba(31, 171, 111, 0.12)',
      borderColor: theme('colors.success.400'),
    },
    '.quiz-option--incorrect': {
      backgroundColor: 'rgba(248, 45, 85, 0.12)',
      borderColor: theme('colors.danger.400'),
    },
    '.profile-avatar': {
      width: theme('spacing.12'),
      height: theme('spacing.12'),
      borderRadius: theme('borderRadius.full'),
      backgroundImage: 'linear-gradient(135deg, rgba(58, 98, 244, 0.4), rgba(18, 176, 144, 0.4))',
      color: theme('colors.surface.inverted'),
      display: 'grid',
      placeItems: 'center',
      fontWeight: theme('fontWeight.semibold'),
    },
    '.certificate-card': {
      ...cardBase,
      border: `1px solid rgba(18, 176, 144, 0.4)`,
      backgroundImage: 'linear-gradient(160deg, rgba(18, 176, 144, 0.12), rgba(58, 98, 244, 0.12))',
    },
    '.discussion-thread': {
      ...cardBase,
      display: 'grid',
      gap: theme('spacing.5'),
    },
    '.discussion-thread__message': {
      display: 'grid',
      gap: theme('spacing.2'),
      padding: theme('spacing.4'),
      borderRadius: theme('borderRadius.lg'),
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    '.skeleton': {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    '.skeleton::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      transform: 'translateX(-50%)',
      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.25), rgba(255,255,255,0))',
      animation: `${theme('animation.shimmer')}`,
    },
    '.spinner': {
      width: theme('spacing.12'),
      height: theme('spacing.12'),
      borderRadius: theme('borderRadius.full'),
      borderWidth: '3px',
      borderStyle: 'solid',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderTopColor: theme('colors.accent.400'),
      animation: `${theme('animation.spin-slow')}`,
    },
  });

  addUtilities(
    {
      '.text-subdued': {
        color: theme('colors.neutral.400'),
      },
      '.text-on-surface': {
        color: theme('colors.neutral.100'),
      },
      '.text-accent': {
        color: theme('colors.accent.300'),
      },
      '.backdrop-blur-panel': {
        backdropFilter: 'blur(18px)',
      },
      '.grid-fit-sm': {
        display: 'grid',
        gap: theme('spacing.4'),
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
      },
      '.grid-fit-md': {
        display: 'grid',
        gap: theme('spacing.5'),
        gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
      },
      '.grid-fit-lg': {
        display: 'grid',
        gap: theme('spacing.6'),
        gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
      },
      '.flex-center': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      '.flex-between': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      '.text-balance': {
        textWrap: 'balance',
      },
      '.text-pretty': {
        textWrap: 'pretty',
      },
      '.max-w-readable': {
        maxWidth: theme('maxWidth.content-lg'),
      },
      '.max-w-narrow': {
        maxWidth: theme('maxWidth.content-md'),
      },
      '.hero-gradient': {
        backgroundImage: 'radial-gradient(circle at top, rgba(58, 98, 244, 0.35), transparent 55%), radial-gradient(circle at 20% 80%, rgba(18, 176, 144, 0.25), transparent 60%)',
      },
      '.shadow-soft': {
        boxShadow: theme('boxShadow.soft'),
      },
      '.shadow-brand': {
        boxShadow: theme('boxShadow.brand'),
      },
      '.shadow-focus': {
        boxShadow: theme('boxShadow.focus'),
      },
      '.shadow-raised': {
        boxShadow: theme('boxShadow.raised'),
      },
      '.z-overlay': {
        zIndex: theme('zIndex.overlay'),
      },
      '.z-modal': {
        zIndex: theme('zIndex.modal'),
      },
      '.z-tooltip': {
        zIndex: theme('zIndex.tooltip'),
      },
    },
    ['responsive'],
  );
});

module.exports = {
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
        lg: '2.5rem',
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand,
        accent,
        neutral,
        surface,
        info,
        success,
        warning,
        danger,
        clay: neutral,
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-3xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-2xl': ['3.75rem', { lineHeight: '1.06', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-xl': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '600' }],
        'heading-2xl': ['2.25rem', { lineHeight: '1.18', fontWeight: '600' }],
        'heading-xl': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['1.75rem', { lineHeight: '1.28', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.32', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body-base': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'body-xs': ['0.75rem', { lineHeight: '1.45', letterSpacing: '0.04em' }],
        eyebrow: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.2em' }],
      },
      lineHeight: {
        cozy: '1.7',
        snug: '1.4',
        tight: '1.2',
      },
      spacing: {
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        '4.5': '1.125rem',
        '7.5': '1.875rem',
        11: '2.75rem',
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
        'content-xs': '24rem',
        'content-sm': '32rem',
        'content-md': '44rem',
        'content-lg': '64rem',
        'content-xl': '80rem',
        'content-2xl': '90rem',
        page: '96rem',
        dashboard: '110rem',
      },
      borderRadius: radius,
      boxShadow: {
        soft: 'var(--shadow-color-soft)',
        brand: '0 25px 50px -25px rgba(58, 98, 244, 0.55)',
        focus: '0 0 0 4px rgba(18, 176, 144, 0.35)',
        raised: 'var(--shadow-color-strong)',
        accent: '0 22px 45px -24px rgba(18, 176, 144, 0.55)',
        outline: '0 0 0 1px rgba(255, 255, 255, 0.12)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '240ms',
        slow: '420ms',
        slower: '680ms',
      },
      transitionTimingFunction: {
        emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 260ms var(--transition-fast) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'spin-slow': 'spin 1.4s linear infinite',
      },
      keyframes: animationKeyframes,
      backgroundImage: {
        mesh: 'radial-gradient(circle at 20% 20%, rgba(58, 98, 244, 0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(18, 176, 144, 0.18), transparent 55%), linear-gradient(160deg, rgba(4, 8, 20, 1), rgba(4, 12, 28, 1))',
      },
      backdropBlur: {
        xs: '4px',
        md: '12px',
        xl: '24px',
      },
      outlineWidth: {
        2: '2px',
        3: '3px',
      },
      outlineOffset: {
        1: '1px',
        2: '2px',
        3: '3px',
      },
      borderWidth: {
        1.5: '1.5px',
        3: '3px',
      },
      opacity: {
        8: '0.08',
        12: '0.12',
        16: '0.16',
        24: '0.24',
      },
      zIndex: {
        background: '0',
        sticky: '90',
        dropdown: '100',
        overlay: '400',
        modal: '500',
        popover: '600',
        tooltip: '700',
      },
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
    themePlugin,
  ],
};
