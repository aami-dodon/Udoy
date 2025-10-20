import ErrorState from './ErrorState.jsx';

function ServerErrorPage() {
  return (
    <ErrorState
      statusCode="500"
      title="Something went wrong on our end."
      description="We’re experiencing a hiccup behind the scenes and are already working on a fix."
      badgeTone="danger"
      actions={[
        { label: 'Back to home', to: '/', variant: 'primary' },
      ]}
    >
      <p className="text-sm text-neutral-600">
        Our engineers have been notified and will steady things shortly. You can return home or retry in a few moments.
      </p>
      <p className="text-sm text-neutral-600">
        If the problem sticks around, drop us a note with the steps you took so we can diagnose it faster.
      </p>
    </ErrorState>
  );
}

export default ServerErrorPage;
