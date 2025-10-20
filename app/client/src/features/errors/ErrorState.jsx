import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@components/ui';
import { LucideIcon } from '../../../../shared/icons';

const ACTION_VARIANT_MAP = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  outline: 'outline',
  link: 'link',
  accent: 'secondary',
  default: 'primary',
  destructive: 'primary',
};

const TONE_CONFIG = {
  danger: {
    icon: 'OctagonAlert',
    badgeVariant: 'accent',
    badgeLabel: 'Needs attention',
    spotlightClass: 'bg-ecru/45',
    iconContainerClass: 'bg-ecru/25 text-black-olive',
  },
  warning: {
    icon: 'AlertTriangle',
    badgeVariant: 'accent',
    badgeLabel: 'Heads up',
    spotlightClass: 'bg-ecru/40',
    iconContainerClass: 'bg-ecru/20 text-black-olive',
  },
  success: {
    icon: 'CircleCheckBig',
    badgeVariant: 'subtle',
    badgeLabel: 'All clear',
    spotlightClass: 'bg-mint-sage/35',
    iconContainerClass: 'bg-mint-sage/25 text-evergreen',
  },
  info: {
    icon: 'Info',
    badgeVariant: 'subtle',
    badgeLabel: 'For your awareness',
    spotlightClass: 'bg-porcelain-tint/80',
    iconContainerClass: 'bg-porcelain-tint text-evergreen',
  },
  neutral: {
    icon: 'Compass',
    badgeVariant: 'subtle',
    badgeLabel: 'Update',
    spotlightClass: 'bg-porcelain-tint/70',
    iconContainerClass: 'bg-porcelain text-evergreen',
  },
};

const resolveToneConfig = (tone) => {
  if (!tone) return TONE_CONFIG.neutral;

  return TONE_CONFIG[tone] ?? TONE_CONFIG.neutral;
};

function ErrorState({ statusCode, title, description, badgeTone, actions, children }) {
  const tone = resolveToneConfig(badgeTone);

  return (
    <main className="relative min-h-screen overflow-hidden bg-porcelain">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-20 top-32 h-72 w-72 rounded-full blur-3xl ${tone.spotlightClass}`} />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-mint-sage/30 blur-3xl" />
      </div>
      <div className="container relative z-10 flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-3xl rounded-3xl border border-porcelain-shade bg-white/90 p-12 text-center shadow-uplift backdrop-blur-lg">
          <div className="flex flex-col items-center gap-6">
            <span className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-gentle ${tone.iconContainerClass}`}>
              <LucideIcon name={tone.icon} size="lg" />
            </span>
            <Badge variant={tone.badgeVariant} className="tracking-[0.35em]">
              {tone.badgeLabel}
            </Badge>
            {statusCode ? (
              <p className="font-display text-5xl font-semibold text-black-olive">{statusCode}</p>
            ) : null}
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-semibold text-black-olive md:text-4xl">{title}</h1>
              <p className="text-base text-neutral-600">{description}</p>
            </div>
          </div>

          {children ? (
            <div className="mt-8 space-y-3 rounded-2xl bg-porcelain-tint/70 p-6 text-left text-sm text-neutral-600 shadow-gentle">
              {children}
            </div>
          ) : null}

          {actions?.length ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {actions.map(({ label, to, onClick, variant = 'primary', external }, index) => {
                const buttonVariant = ACTION_VARIANT_MAP[variant] || ACTION_VARIANT_MAP.primary;

                if (to) {
                  if (external) {
                    return (
                      <Button key={label || index} variant={buttonVariant} asChild>
                        <a href={to} rel="noopener noreferrer">
                          {label}
                        </a>
                      </Button>
                    );
                  }

                  return (
                    <Button key={label || index} variant={buttonVariant} asChild>
                      <Link to={to}>{label}</Link>
                    </Button>
                  );
                }

                return (
                  <Button key={label || index} type="button" variant={buttonVariant} onClick={onClick}>
                    {label}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

ErrorState.propTypes = {
  statusCode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  badgeTone: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'neutral', null]),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(Object.keys(ACTION_VARIANT_MAP)),
      external: PropTypes.bool,
    })
  ),
  children: PropTypes.node,
};

ErrorState.defaultProps = {
  statusCode: null,
  badgeTone: 'danger',
  actions: [],
  children: null,
};

export default ErrorState;
