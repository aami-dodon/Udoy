import PropTypes from 'prop-types';
import ErrorState from './ErrorState.jsx';

function GenericErrorPage({ onRetry }) {
  const actions = [];

  if (typeof onRetry === 'function') {
    actions.push({ label: 'Try again', onClick: onRetry, variant: 'primary' });
  }

  actions.push({ label: 'Back to home', to: '/', variant: 'ghost' });

  return (
    <ErrorState
      title="An unexpected error occurred."
      description="Something broke while rendering this experience."
      badgeTone="danger"
      actions={actions}
    >
      <p className="text-body-xs text-subdued">
        We’ve logged the issue so the team can investigate. Please retry your last action or head back to the dashboard.
      </p>
    </ErrorState>
  );
}

GenericErrorPage.propTypes = {
  onRetry: PropTypes.func,
};

GenericErrorPage.defaultProps = {
  onRetry: undefined,
};

export default GenericErrorPage;
