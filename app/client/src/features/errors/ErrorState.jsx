import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui';

const ACTION_VARIANT_MAP = {
  primary: 'default',
  accent: 'accent',
  ghost: 'ghost',
  secondary: 'secondary',
  default: 'default',
  destructive: 'destructive',
  outline: 'outline',
  link: 'link',
};

function ErrorState({ statusCode, title, description, badgeTone, actions, children }) {
  const badgeClass = badgeTone ? `badge badge--${badgeTone}` : 'badge badge--neutral';

  return (
    <main className="page-shell page-shell--center">
      <section className="page-container flex-center">
        <div className="card card--muted stack-lg max-w-content-sm text-center text-balance">
          <div className="stack-sm">
            {statusCode ? (
              <span className={`${badgeClass} mx-auto w-fit`}>{statusCode}</span>
            ) : (
              <span className={`${badgeClass} mx-auto w-fit`}>Error</span>
            )}
            <h1 className="text-heading-lg text-on-surface font-semibold">{title}</h1>
            <p className="text-body-sm text-subdued">{description}</p>
          </div>

          {children ? <div className="stack-sm text-left">{children}</div> : null}

          {actions?.length ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {actions.map(({ label, to, onClick, variant = 'accent', external }, index) => {
                const buttonVariant = ACTION_VARIANT_MAP[variant] || ACTION_VARIANT_MAP.accent;

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
      </section>
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
