import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge, Button } from '@components/ui';
import { LucideIcon } from '@icons';

const ACTION_VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  outline: 'outline',
  link: 'link',
  accent: 'secondary',
  default: 'default',
  destructive: 'destructive',
};

const TONE_CONFIG = {
  danger: {
    icon: 'OctagonAlert',
    badgeVariant: 'destructive',
    badgeLabel: 'Needs attention',
    spotlightClass: 'bg-destructive/30',
    iconContainerClass: 'bg-destructive/15 text-destructive',
  },
  warning: {
    icon: 'AlertTriangle',
    badgeVariant: 'secondary',
    badgeLabel: 'Heads up',
    spotlightClass: 'bg-secondary/30',
    iconContainerClass: 'bg-secondary/20 text-secondary-foreground',
  },
  success: {
    icon: 'CircleCheckBig',
    badgeVariant: 'secondary',
    badgeLabel: 'All clear',
    spotlightClass: 'bg-secondary/25',
    iconContainerClass: 'bg-secondary/15 text-secondary-foreground',
  },
  info: {
    icon: 'Info',
    badgeVariant: 'muted',
    badgeLabel: 'For your awareness',
    spotlightClass: 'bg-muted/70',
    iconContainerClass: 'bg-muted text-foreground',
  },
  neutral: {
    icon: 'Compass',
    badgeVariant: 'muted',
    badgeLabel: 'Update',
    spotlightClass: 'bg-muted/60',
    iconContainerClass: 'bg-muted text-foreground',
  },
};

const resolveToneConfig = (tone) => {
  if (!tone) return TONE_CONFIG.neutral;

  return TONE_CONFIG[tone] ?? TONE_CONFIG.neutral;
};

function ErrorState({ statusCode, title, description, badgeTone, actions, children }) {
  const tone = resolveToneConfig(badgeTone);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-20 top-32 h-72 w-72 rounded-full blur-3xl ${tone.spotlightClass}`} />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      <div className="container relative z-10 flex min-h-screen items-center justify-center py-20">
        <div className="w-full max-w-3xl rounded-3xl border border-border bg-card/90 p-12 text-center shadow-uplift backdrop-blur-lg">
          <div className="flex flex-col items-center gap-6">
            <span className={`flex h-20 w-20 items-center justify-center rounded-2xl shadow-gentle ${tone.iconContainerClass}`}>
              <LucideIcon name={tone.icon} size="lg" />
            </span>
            <Badge variant={tone.badgeVariant} className="tracking-[0.35em]">
              {tone.badgeLabel}
            </Badge>
            {statusCode ? (
              <p className="font-display text-5xl font-semibold text-foreground">{statusCode}</p>
            ) : null}
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>
          </div>

          {children ? (
            <div className="mt-8 space-y-3 rounded-2xl bg-muted/60 p-6 text-left text-sm text-muted-foreground shadow-gentle">
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
