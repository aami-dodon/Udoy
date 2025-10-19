import ErrorState from './ErrorState.jsx';

function ForbiddenPage() {
  return (
    <ErrorState
      statusCode="403"
      title="You don’t have permission to view this page."
      description="Your account lacks the privileges required to access this content."
      badgeTone="warning"
      actions={[
        { label: 'Back to home', to: '/', variant: 'accent' },
      ]}
    >
      <p className="text-body-xs text-subdued">
        If you believe this is a mistake, reach out to your administrator to request the appropriate access.
      </p>
    </ErrorState>
  );
}

export default ForbiddenPage;
