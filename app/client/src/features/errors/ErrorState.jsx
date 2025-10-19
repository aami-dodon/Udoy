import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ACTION_VARIANT_CLASS = {
  primary: 'btn btn--primary',
  accent: 'btn btn--accent',
  ghost: 'btn btn--ghost',
  secondary: 'btn btn--secondary',
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
                const className = ACTION_VARIANT_CLASS[variant] || ACTION_VARIANT_CLASS.accent;

                if (to) {
                  if (external) {
                    return (
                      <a
                        key={label || index}
                        href={to}
                        className={className}
                        rel="noopener noreferrer"
                      >
                        {label}
                      </a>
                    );
                  }

                  return (
                    <Link key={label || index} to={to} className={className}>
                      {label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={label || index}
                    type="button"
                    className={className}
                    onClick={onClick}
                  >
                    {label}
                  </button>
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
      variant: PropTypes.oneOf(['primary', 'accent', 'ghost', 'secondary']),
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
