import ErrorState from './ErrorState.jsx';

function ServerErrorPage() {
  return (
    <ErrorState
      statusCode="500"
      title="Something went wrong on our end."
      description="We’re experiencing technical difficulties and are working to resolve the issue."
      badgeTone="danger"
      actions={[
        { label: 'Back to home', to: '/', variant: 'accent' },
      ]}
    >
      <p className="text-body-xs text-subdued">
        If the issue persists, please contact the Udoy support team so we can help you get back on track.
      </p>
    </ErrorState>
  );
}

export default ServerErrorPage;
