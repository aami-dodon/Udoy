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

const tokens = require('./tokens');
const { colors, typography, layout, shadows, motion } = tokens;
const { primary, accent, neutral, info, success, warning, danger, surface } = colors;
const radius = layout.radius;

const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');
  const chunkSize = normalized.length === 3 ? 1 : 2;
  const expanded = chunkSize === 1 ? normalized.split('').map((char) => char + char).join('') : normalized;
  const parts = expanded.match(new RegExp(`.{${2}}`, 'g')).map((part) => parseInt(part, 16));
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
};

const alpha = (palette, shade, value) => hexToRgba(palette[shade], value);

const fontSizeScale = Object.fromEntries(
  Object.entries(typography.scale).map(([token, config]) => {
    const meta = {};
    if (config.lineHeight) meta.lineHeight = config.lineHeight;
    if (config.letterSpacing) meta.letterSpacing = config.letterSpacing;
    if (config.weight) meta.fontWeight = config.weight;
    return [token, [config.size, meta]];
  })
);

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
    border: `1px solid ${theme('colors.neutral.200')}`,
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

  const resolveFontSize = (key) => {
    const value = theme('fontSize')[key];
    return Array.isArray(value) ? value : [value, {}];
  };

  const [displayLgFontSize, displayLgMeta] = resolveFontSize('display-lg');
  const [headingXlFontSize, headingXlMeta] = resolveFontSize('heading-xl');
  const [headingLgFontSize, headingLgMeta] = resolveFontSize('heading-lg');
  const [headingMdFontSize, headingMdMeta] = resolveFontSize('heading-md');
  const [headingSmFontSize, headingSmMeta] = resolveFontSize('heading-sm');
  const [bodyBaseFontSize, bodyBaseMeta] = resolveFontSize('body-base');
  const [bodySmFontSize, bodySmMeta] = resolveFontSize('body-sm');
  const [bodyXsFontSize, bodyXsMeta] = resolveFontSize('body-xs');

  addBase({
    ':root': {
      colorScheme: 'light',
      '--shadow-color-strong': shadows.strong,
      '--shadow-color-soft': shadows.soft,
      '--transition-fast': motion.transition.fast,
      '--transition-normal': motion.transition.normal,
      '--transition-slow': motion.transition.slow,
      '--transition-slower': motion.transition.slower,
    },
    '*': {
      boxSizing: 'border-box',
    },
    'html, body': {
      minHeight: '100%',
      backgroundColor: theme('colors.surface.base'),
      color: theme('colors.neutral.800'),
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
      color: theme('colors.neutral.900'),
      fontFamily: fontStack('display'),
      fontWeight: theme('fontWeight.semibold'),
      margin: 0,
    },
    h1: {
      fontSize: displayLgFontSize,
      ...(displayLgMeta.lineHeight ? { lineHeight: displayLgMeta.lineHeight } : {}),
      ...(displayLgMeta.letterSpacing ? { letterSpacing: displayLgMeta.letterSpacing } : {}),
    },
    h2: {
      fontSize: headingXlFontSize,
      ...(headingXlMeta.lineHeight ? { lineHeight: headingXlMeta.lineHeight } : {}),
    },
    h3: {
      fontSize: headingLgFontSize,
      ...(headingLgMeta.lineHeight ? { lineHeight: headingLgMeta.lineHeight } : {}),
    },
    h4: {
      fontSize: headingMdFontSize,
      ...(headingMdMeta.lineHeight ? { lineHeight: headingMdMeta.lineHeight } : {}),
    },
    h5: {
      fontSize: headingSmFontSize,
      ...(headingSmMeta.lineHeight ? { lineHeight: headingSmMeta.lineHeight } : {}),
    },
    h6: {
      fontSize: bodySmFontSize,
      ...(bodySmMeta.lineHeight ? { lineHeight: bodySmMeta.lineHeight } : {}),
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
    p: {
      margin: 0,
      fontSize: bodyBaseFontSize,
      ...(bodyBaseMeta.lineHeight ? { lineHeight: bodyBaseMeta.lineHeight } : {}),
      color: theme('colors.neutral.700'),
    },
    'a, button': {
      fontFamily: fontStack('sans'),
    },
    a: {
      color: theme('colors.accent.600'),
      fontWeight: theme('fontWeight.medium'),
      textDecoration: 'none',
      transition: `color var(--transition-fast) ease`,
    },
    'a:hover': {
      color: theme('colors.accent.700'),
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
      borderLeft: `4px solid ${theme('colors.brand.400')}`,
      backgroundColor: theme('colors.surface.muted'),
      borderRadius: theme('borderRadius.lg'),
      padding: theme('spacing.4'),
      color: theme('colors.neutral.800'),
    },
    code: {
      fontFamily: fontStack('mono'),
      backgroundColor: theme('colors.neutral.100'),
      color: theme('colors.accent.600'),
      padding: `0 ${theme('spacing.2')}`,
      borderRadius: theme('borderRadius.sm'),
      fontSize: bodySmFontSize,
    },
    pre: {
      fontFamily: fontStack('mono'),
      backgroundColor: theme('colors.surface.muted'),
      padding: theme('spacing.5'),
      borderRadius: theme('borderRadius.xl'),
      overflow: 'auto',
      color: theme('colors.neutral.800'),
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      backgroundColor: theme('colors.surface.raised'),
      borderRadius: theme('borderRadius.2xl'),
      overflow: 'hidden',
      border: `1px solid ${theme('colors.neutral.200')}`,
    },
    'thead th': {
      textAlign: 'left',
      backgroundColor: theme('colors.surface.muted'),
      color: theme('colors.neutral.700'),
      padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
      fontSize: bodySmFontSize,
      fontWeight: theme('fontWeight.semibold'),
    },
    'tbody td': {
      padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
      borderBottom: `1px solid ${theme('colors.neutral.200')}`,
      color: theme('colors.neutral.700'),
      fontSize: bodySmFontSize,
    },
    'tbody tr:hover td': {
      backgroundColor: theme('colors.surface.subtle'),
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
      backgroundColor: alpha(primary, 600, 0.22),
      borderRadius: theme('borderRadius.full'),
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: alpha(primary, 600, 0.32),
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
      color: theme('colors.neutral.800'),
      fontFamily: fontStack('sans'),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingInline: 'clamp(1.5rem, 5vw, 3.5rem)',
      paddingBlock: theme('spacing.12'),
      boxSizing: 'border-box',
      gap: theme('spacing.10'),
    },
    '.app-shell__content': {
      width: '100%',
      maxWidth: theme('maxWidth.page'),
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.12'),
      minHeight: '100%',
      marginInline: 'auto',
    },
    '.page-shell': {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      gap: theme('spacing.10'),
      minHeight: '100%',
    },
    '.page-shell--center': {
      justifyContent: 'center',
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
    '.icon': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      flexShrink: 0,
    },
    '.icon--thin': {
      strokeWidth: '1',
    },
    '.icon--regular': {
      strokeWidth: '1.5',
    },
    '.icon--bold': {
      strokeWidth: '2',
    },
    '.icon--xs': {
      width: theme('spacing.4'),
      height: theme('spacing.4'),
    },
    '.icon--sm': {
      width: theme('spacing.5'),
      height: theme('spacing.5'),
    },
    '.icon--base': {
      width: theme('spacing.6'),
      height: theme('spacing.6'),
    },
    '.icon--md': {
      width: theme('spacing.7'),
      height: theme('spacing.7'),
    },
    '.icon--lg': {
      width: theme('spacing.8'),
      height: theme('spacing.8'),
    },
    '.icon--xl': {
      width: theme('spacing.10'),
      height: theme('spacing.10'),
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
      borderColor: theme('colors.brand.400'),
      boxShadow: theme('boxShadow.brand'),
    },
    '.card--inset': {
      ...cardBase,
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: theme('colors.neutral.300'),
    },
    '.card__header': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.3'),
    },
    '.card__title': {
      fontSize: headingLgFontSize,
      ...(headingLgMeta.lineHeight ? { lineHeight: headingLgMeta.lineHeight } : {}),
      fontWeight: theme('fontWeight.semibold'),
      color: theme('colors.neutral.900'),
    },
    '.card__subtitle': {
      fontSize: bodySmFontSize,
      ...(bodySmMeta.lineHeight ? { lineHeight: bodySmMeta.lineHeight } : {}),
      color: theme('colors.neutral.600'),
    },
    '.card__body': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.5'),
    },
    '.divider': {
      height: '1px',
      width: '100%',
      backgroundColor: theme('colors.neutral.200'),
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
      fontSize: bodyXsFontSize,
      fontWeight: theme('fontWeight.medium'),
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      gap: theme('spacing.2'),
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: theme('colors.neutral.200'),
      color: theme('colors.brand.700'),
    },
    '.badge--info': {
      backgroundColor: alpha(info, 500, 0.12),
      borderColor: alpha(info, 500, 0.35),
      color: theme('colors.info.600'),
    },
    '.badge--success': {
      backgroundColor: alpha(success, 500, 0.12),
      borderColor: alpha(success, 500, 0.32),
      color: theme('colors.success.600'),
    },
    '.badge--warning': {
      backgroundColor: alpha(warning, 500, 0.14),
      borderColor: alpha(warning, 500, 0.34),
      color: theme('colors.warning.600'),
    },
    '.badge--danger': {
      backgroundColor: alpha(danger, 500, 0.12),
      borderColor: alpha(danger, 500, 0.35),
      color: theme('colors.danger.600'),
    },
    '.badge--neutral': {
      backgroundColor: alpha(neutral, 500, 0.12),
      borderColor: theme('colors.neutral.200'),
      color: theme('colors.neutral.700'),
    },
    '.btn': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme('borderRadius.lg'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme('colors.neutral.200'),
      fontWeight: theme('fontWeight.semibold'),
      fontSize: bodySmFontSize,
      ...(bodySmMeta.lineHeight ? { lineHeight: bodySmMeta.lineHeight } : {}),
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.3'),
      gap: theme('spacing.2'),
      transitionProperty: 'color, background-color, border-color, transform, box-shadow',
      transitionDuration: 'var(--transition-normal)',
      boxShadow: theme('boxShadow.soft'),
      color: theme('colors.neutral.800'),
      backgroundColor: theme('colors.surface.raised'),
    },
    '.btn:hover': {
      transform: 'translateY(-1px)',
      boxShadow: theme('boxShadow.brand'),
      borderColor: theme('colors.neutral.300'),
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
      backgroundColor: theme('colors.brand.600'),
      borderColor: theme('colors.brand.600'),
      color: theme('colors.surface.raised'),
      boxShadow: theme('boxShadow.brand'),
    },
    '.btn--primary:hover': {
      backgroundColor: theme('colors.brand.500'),
      borderColor: theme('colors.brand.500'),
    },
    '.btn--accent': {
      backgroundColor: theme('colors.accent.500'),
      borderColor: theme('colors.accent.500'),
      color: theme('colors.surface.raised'),
      boxShadow: theme('boxShadow.accent'),
    },
    '.btn--accent:hover': {
      backgroundColor: theme('colors.accent.400'),
      borderColor: theme('colors.accent.400'),
    },
    '.btn--secondary': {
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: theme('colors.neutral.200'),
      color: theme('colors.neutral.800'),
    },
    '.btn--ghost': {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: theme('colors.brand.700'),
      boxShadow: 'none',
    },
    '.btn--ghost:hover': {
      backgroundColor: theme('colors.surface.subtle'),
      borderColor: 'transparent',
      boxShadow: 'none',
    },
    '.btn--danger': {
      backgroundColor: theme('colors.danger.500'),
      borderColor: theme('colors.danger.500'),
      color: theme('colors.surface.raised'),
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
      fontSize: bodyXsFontSize,
    },
    '.btn--lg': {
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.3'),
      fontSize: bodyBaseFontSize,
    },
    '.field': {
      display: 'grid',
      gap: theme('spacing.2'),
    },
    '.field__label': {
      fontSize: bodySmFontSize,
      fontWeight: theme('fontWeight.medium'),
      color: theme('colors.neutral.700'),
    },
    '.field__hint': {
      fontSize: bodyXsFontSize,
      color: theme('colors.neutral.500'),
    },
    '.field__error': {
      fontSize: bodyXsFontSize,
      color: theme('colors.danger.300'),
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.2'),
    },
    '.input, .textarea, .select': {
      width: '100%',
      backgroundColor: theme('colors.surface.raised'),
      borderRadius: theme('borderRadius.xl'),
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme('colors.neutral.200'),
      paddingInline: theme('spacing.4'),
      paddingBlock: theme('spacing.3'),
      color: theme('colors.neutral.800'),
      transition: `border-color var(--transition-fast) ease, box-shadow var(--transition-fast) ease, background-color var(--transition-fast) ease`,
    },
    '.input::placeholder, .textarea::placeholder': {
      color: theme('colors.neutral.500'),
    },
    '.input:focus, .textarea:focus, .select:focus': {
      borderColor: theme('colors.brand.400'),
      boxShadow: `0 0 0 3px ${alpha(primary, 600, 0.24)}`,
      backgroundColor: theme('colors.surface.subtle'),
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
      backgroundColor: theme('colors.neutral.300'),
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
      backgroundColor: theme('colors.surface.raised'),
      boxShadow: theme('boxShadow.soft'),
      transition: `transform var(--transition-fast) ease`,
    },
    '.toggle[data-state="on"]': {
      backgroundColor: theme('colors.brand.500'),
    },
    '.toggle[data-state="on"]::after': {
      transform: 'translateX(1.5rem)',
    },
    '.alert': {
      ...alertBase,
      backgroundColor: alpha(info, 500, 0.12),
      borderColor: alpha(info, 500, 0.35),
      color: theme('colors.info.700'),
    },
    '.alert--info': {
      ...alertBase,
      backgroundColor: alpha(info, 500, 0.12),
      borderColor: alpha(info, 500, 0.35),
      color: theme('colors.info.700'),
    },
    '.alert--success': {
      ...alertBase,
      backgroundColor: alpha(success, 500, 0.12),
      borderColor: alpha(success, 500, 0.32),
      color: theme('colors.success.700'),
    },
    '.alert--warning': {
      ...alertBase,
      backgroundColor: alpha(warning, 500, 0.14),
      borderColor: alpha(warning, 500, 0.34),
      color: theme('colors.warning.700'),
    },
    '.alert--danger': {
      ...alertBase,
      backgroundColor: alpha(danger, 500, 0.12),
      borderColor: alpha(danger, 500, 0.3),
      color: theme('colors.danger.700'),
    },
    '.toast': {
      ...alertBase,
      backgroundColor: theme('colors.surface.raised'),
      borderColor: theme('colors.neutral.200'),
      boxShadow: theme('boxShadow.raised'),
      minWidth: '18rem',
      color: theme('colors.neutral.800'),
    },
    '.empty-state': {
      display: 'grid',
      placeItems: 'center',
      gap: theme('spacing.4'),
      padding: theme('spacing.12'),
      borderRadius: theme('borderRadius.2xl'),
      border: `1px dashed ${theme('colors.neutral.300')}`,
      backgroundColor: theme('colors.surface.subtle'),
      textAlign: 'center',
    },
    '.empty-state__icon': {
      width: theme('spacing.16'),
      height: theme('spacing.16'),
      borderRadius: theme('borderRadius.full'),
      display: 'grid',
      placeItems: 'center',
      background: `linear-gradient(135deg, ${alpha(primary, 500, 0.32)}, ${alpha(accent, 500, 0.28)})`,
      color: theme('colors.brand.700'),
      fontSize: headingLgFontSize,
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
      borderBottom: `1px solid ${theme('colors.neutral.200')}`,
    },
    '.data-table__heading': {
      display: 'flex',
      flexDirection: 'column',
      gap: theme('spacing.1'),
    },
    '.data-table__title': {
      fontSize: headingSmFontSize,
      ...(headingSmMeta.lineHeight ? { lineHeight: headingSmMeta.lineHeight } : {}),
      fontWeight: theme('fontWeight.semibold'),
      color: theme('colors.neutral.900'),
    },
    '.data-table__meta': {
      fontSize: bodyXsFontSize,
      color: theme('colors.neutral.400'),
    },
    '.data-table__table': {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    '.data-table__table thead th': {
      textAlign: 'left',
      fontSize: bodyXsFontSize,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: theme('colors.neutral.600'),
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.3'),
      borderBottom: `1px solid ${theme('colors.neutral.200')}`,
      backgroundColor: theme('colors.surface.base'),
    },
    '.data-table__table tbody tr': {
      transition: 'background-color var(--transition-fast) ease, transform var(--transition-fast) ease',
    },
    '.data-table__table tbody tr:hover': {
      backgroundColor: theme('colors.surface.subtle'),
      transform: 'translateY(-1px)',
    },
    '.data-table__table tbody td': {
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.4'),
      borderBottom: `1px solid ${theme('colors.neutral.200')}`,
      fontSize: bodySmFontSize,
      color: theme('colors.neutral.700'),
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
      fontSize: bodyXsFontSize,
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
      backgroundColor: alpha(accent, 500, 0.14),
      borderColor: alpha(accent, 500, 0.35),
      color: theme('colors.accent.600'),
    },
    '.data-table__action--edit:hover': {
      backgroundColor: alpha(accent, 500, 0.2),
      borderColor: alpha(accent, 500, 0.45),
    },
    '.data-table__action--modify': {
      backgroundColor: alpha(primary, 500, 0.16),
      borderColor: alpha(primary, 500, 0.38),
      color: theme('colors.brand.600'),
    },
    '.data-table__action--modify:hover': {
      backgroundColor: alpha(primary, 500, 0.22),
      borderColor: alpha(primary, 500, 0.45),
    },
    '.data-table__action--delete': {
      backgroundColor: alpha(danger, 500, 0.16),
      borderColor: alpha(danger, 500, 0.42),
      color: theme('colors.danger.600'),
    },
    '.data-table__action--delete:hover': {
      backgroundColor: alpha(danger, 500, 0.24),
      borderColor: alpha(danger, 500, 0.5),
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
      color: theme('colors.surface.raised'),
      paddingInline: theme('spacing.3'),
      paddingBlock: theme('spacing.2'),
      borderRadius: theme('borderRadius.md'),
      fontSize: bodyXsFontSize,
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
      fontSize: headingSmFontSize,
      color: theme('colors.brand.700'),
    },
    '.navbar__menu': {
      display: 'flex',
      alignItems: 'center',
      gap: theme('spacing.4'),
    },
    '.sidebar': {
      width: '18rem',
      backgroundColor: theme('colors.surface.subtle'),
      borderRight: `1px solid ${theme('colors.neutral.200')}`,
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
      color: theme('colors.neutral.600'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.sidebar__item:hover': {
      backgroundColor: theme('colors.surface.subtle'),
      color: theme('colors.brand.700'),
    },
    '.sidebar__item--active': {
      backgroundColor: alpha(primary, 500, 0.18),
      color: theme('colors.brand.700'),
    },
    '.breadcrumbs': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme('spacing.2'),
      alignItems: 'center',
      fontSize: bodySmFontSize,
      color: theme('colors.neutral.400'),
    },
    '.tabs': {
      display: 'inline-flex',
      gap: theme('spacing.2'),
      padding: theme('spacing.1'),
      borderRadius: theme('borderRadius.pill'),
      backgroundColor: theme('colors.surface.subtle'),
    },
    '.tab': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingInline: theme('spacing.5'),
      paddingBlock: theme('spacing.2'),
      borderRadius: theme('borderRadius.pill'),
      color: theme('colors.neutral.600'),
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
      color: theme('colors.neutral.600'),
      transition: `background-color var(--transition-fast) ease`,
    },
    '.pagination__item:hover': {
      backgroundColor: theme('colors.surface.subtle'),
      color: theme('colors.brand.700'),
    },
    '.pagination__item--active': {
      backgroundColor: theme('colors.brand.500'),
      color: theme('colors.surface.raised'),
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
      border: `1px solid ${theme('colors.neutral.200')}`,
    },
    '.search-bar input': {
      border: 'none',
      background: 'transparent',
      color: theme('colors.neutral.700'),
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
      backgroundColor: theme('colors.surface.subtle'),
      overflow: 'hidden',
    },
    '.progress-bar__value': {
      height: '100%',
      backgroundImage: `linear-gradient(90deg, ${alpha(primary, 500, 0.95)}, ${alpha(accent, 500, 0.95)})`,
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
      backgroundColor: theme('colors.neutral.200'),
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
      backgroundImage: `linear-gradient(135deg, ${alpha(primary, 500, 0.9)}, ${alpha(accent, 500, 0.9)})`,
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
      backgroundColor: theme('colors.surface.raised'),
      minHeight: '8rem',
    },
    '.accordion': {
      ...cardBase,
      padding: 0,
      overflow: 'hidden',
    },
    '.accordion__item': {
      borderBottom: `1px solid ${theme('colors.neutral.200')}`,
    },
    '.accordion__trigger': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.4'),
      cursor: 'pointer',
      color: theme('colors.neutral.700'),
    },
    '.accordion__content': {
      paddingInline: theme('spacing.6'),
      paddingBlock: theme('spacing.4'),
      color: theme('colors.neutral.600'),
      backgroundColor: theme('colors.surface.subtle'),
    },
    '.rating': {
      display: 'inline-flex',
      gap: theme('spacing.2'),
      color: theme('colors.warning.500'),
    },
    '.dashboard-widget': {
      ...cardBase,
      backgroundImage: `linear-gradient(135deg, ${alpha(primary, 500, 0.25)}, ${alpha(accent, 500, 0.25)})`,
    },
    '.course-card': {
      ...cardBase,
      display: 'grid',
      gap: theme('spacing.4'),
      borderColor: alpha(primary, 600, 0.28),
    },
    '.course-card__meta': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: theme('spacing.3'),
      color: theme('colors.neutral.600'),
      fontSize: bodyXsFontSize,
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
      border: `1px solid ${theme('colors.neutral.200')}`,
      transition: `background-color var(--transition-fast) ease, border-color var(--transition-fast) ease`,
      cursor: 'pointer',
    },
    '.quiz-option:hover': {
      backgroundColor: alpha(primary, 500, 0.16),
      borderColor: theme('colors.brand.500'),
    },
    '.quiz-option--correct': {
      backgroundColor: alpha(success, 500, 0.16),
      borderColor: theme('colors.success.400'),
    },
    '.quiz-option--incorrect': {
      backgroundColor: alpha(danger, 500, 0.16),
      borderColor: theme('colors.danger.400'),
    },
    '.profile-avatar': {
      width: theme('spacing.12'),
      height: theme('spacing.12'),
      borderRadius: theme('borderRadius.full'),
      backgroundImage: `linear-gradient(135deg, ${alpha(primary, 500, 0.4)}, ${alpha(accent, 500, 0.4)})`,
      color: theme('colors.brand.700'),
      display: 'grid',
      placeItems: 'center',
      fontWeight: theme('fontWeight.semibold'),
    },
    '.certificate-card': {
      ...cardBase,
      border: `1px solid ${alpha(primary, 500, 0.4)}`,
      backgroundImage: `linear-gradient(160deg, ${alpha(primary, 500, 0.14)}, ${alpha(accent, 500, 0.14)})`,
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
      backgroundColor: alpha(primary, 500, 0.12),
    },
    '.skeleton': {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: theme('colors.surface.subtle'),
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
      borderColor: alpha(primary, 700, 0.2),
      borderTopColor: theme('colors.brand.500'),
      animation: `${theme('animation.spin-slow')}`,
    },
  });

  addUtilities(
    {
      '.text-subdued': {
        color: theme('colors.neutral.400'),
      },
      '.text-on-surface': {
        color: theme('colors.neutral.900'),
      },
      '.text-accent': {
        color: theme('colors.accent.600'),
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
        backgroundImage: `radial-gradient(circle at 20% 0%, ${alpha(primary, 500, 0.45)}, transparent 55%), radial-gradient(circle at 80% 120%, ${alpha(accent, 500, 0.35)}, transparent 65%), linear-gradient(180deg, ${surface.base}, #eef1f8)`,
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
      padding: { ...layout.container.padding },
    },
    screens: { ...layout.breakpoints },
    extend: {
      colors: {
        primary,
        brand: primary,
        accent,
        neutral,
        surface,
        info,
        success,
        warning,
        danger,
        clay: neutral,
      },
      fontFamily: { ...typography.fonts },
      fontSize: fontSizeScale,
      lineHeight: {
        cozy: '1.7',
        snug: '1.4',
        tight: '1.2',
      },
      spacing: { ...layout.spacing },
      maxWidth: { ...layout.maxWidth },
      borderRadius: radius,
      boxShadow: {
        soft: 'var(--shadow-color-soft)',
        brand: shadows.brand,
        focus: shadows.focus,
        raised: 'var(--shadow-color-strong)',
        accent: shadows.accent,
        outline: shadows.outline,
      },
      transitionDuration: {
        fast: motion.transition.fast,
        normal: motion.transition.normal,
        slow: motion.transition.slow,
        slower: motion.transition.slower,
      },
      transitionTimingFunction: {
        emphasized: motion.easing.emphasized,
        entrance: motion.easing.entrance,
        exit: motion.easing.exit,
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'slide-up-fade': 'slide-up-fade 260ms var(--transition-fast) both',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'spin-slow': 'spin 1.4s linear infinite',
      },
      keyframes: animationKeyframes,
      backgroundImage: {
        mesh: `radial-gradient(circle at 15% 20%, ${alpha(primary, 500, 0.28)}, transparent 48%), radial-gradient(circle at 85% 30%, ${alpha(accent, 500, 0.24)}, transparent 56%), linear-gradient(180deg, ${surface.base} 0%, #f1f3f8 100%)`,
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
