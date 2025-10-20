import PropTypes from 'prop-types';
import ErrorState from './ErrorState.jsx';

function GenericErrorPage({ onRetry }) {
  const actions = [];

  if (typeof onRetry === 'function') {
    actions.push({ label: 'Try again', onClick: onRetry, variant: 'primary' });
    actions.push({ label: 'Back to home', to: '/', variant: 'outline' });
  } else {
    actions.push({ label: 'Back to home', to: '/', variant: 'primary' });
  }

  return (
    <ErrorState
      title="An unexpected error occurred."
      description="Something broke while rendering this experience."
      badgeTone="danger"
      actions={actions}
    >
      <p className="text-sm text-neutral-600">
        We’ve logged the issue so the team can investigate. Try your last action again, or choose a different area to continue working.
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-600">
        <li>Refresh the page to reload a clean state.</li>
        <li>If you were uploading content, confirm it saved before retrying.</li>
        <li>Reach out to support with the time and steps if the error repeats.</li>
      </ul>
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
