import ErrorState from './ErrorState.jsx';

function NotFoundPage() {
  return (
    <ErrorState
      statusCode="404"
      title="We can’t seem to find that page."
      description="The link may be out of date, renamed, or reserved for a future release."
      badgeTone="warning"
      actions={[
        { label: 'Back to home', to: '/', variant: 'primary' },
      ]}
    >
      <p className="text-sm text-neutral-600">
        Double-check the address or head back to the home page to continue exploring Udoy.
      </p>
      <p className="text-sm text-neutral-600">
        If you were following a saved link, it may have moved into a new space as we refresh the platform layout.
      </p>
    </ErrorState>
  );
}

export default NotFoundPage;
