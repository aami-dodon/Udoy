const path = require('path');
const { createRequire } = require('module');

const requireWithFallback = (request) => {
  try {
    return require(request);
  } catch (error) {
    const localRequire = createRequire(path.resolve(__dirname, '../../client/tailwind.config.js'));
    return localRequire(request);
  }
};

const plugin = requireWithFallback('tailwindcss/plugin');
const tokens = require('./tokens');

const {
  colors: { brand, base, neutral, support },
  typography,
  layout,
  gradients,
} = tokens;

module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: layout.container.base,
        xl: layout.container.xl,
      },
    },
    extend: {
      colors: {
        evergreen: brand.evergreen,
        'evergreen-soft': brand.evergreenSoft,
        'evergreen-deep': brand.evergreenDeep,
        ecru: brand.ecru,
        'ecru-bright': brand.ecruBright,
        'mint-sage': brand.mintSage,
        porcelain: base.porcelain,
        'porcelain-tint': base.porcelainTint,
        'porcelain-shade': base.porcelainShade,
        'black-olive': base.blackOlive,
        neutral,
        support,
        border: base.porcelainShade,
        input: base.porcelainShade,
        ring: brand.ecru,
        background: base.porcelain,
        foreground: base.blackOlive,
        muted: {
          DEFAULT: base.porcelainTint,
          foreground: neutral[600],
        },
        accent: {
          DEFAULT: brand.ecru,
          foreground: base.blackOlive,
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: base.blackOlive,
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: base.blackOlive,
        },
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        display: typography.fontFamily.display,
      },
      letterSpacing: typography.letterSpacing,
      borderRadius: {
        lg: layout.radius.lg,
        md: layout.radius.md,
        sm: layout.radius.sm,
        xl: layout.radius.xl,
      },
      boxShadow: {
        uplift: layout.shadow.soft,
        gentle: layout.shadow.subtle,
      },
      backgroundImage: {
        'hero-gradient': gradients.hero,
        'spotlight-gradient': gradients.spotlight,
      },
    },
  },
  plugins: [
    requireWithFallback('tailwindcss-animate'),
    plugin(({ addBase }) => {
      addBase({
        ':root': {
          '--evergreen': brand.evergreen,
          '--porcelain': base.porcelain,
          '--mint-sage': brand.mintSage,
          '--ecru': brand.ecru,
          '--black-olive': base.blackOlive,
        },
        body: {
          color: base.blackOlive,
          backgroundColor: base.porcelain,
        },
      });
    }),
  ],
};
