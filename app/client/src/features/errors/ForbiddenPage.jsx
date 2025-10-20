import ErrorState from './ErrorState.jsx';

function ForbiddenPage() {
  return (
    <ErrorState
      statusCode="403"
      title="You don’t have permission to view this area."
      description="This workspace is reserved for team members with elevated privileges or pending approvals."
      badgeTone="warning"
      actions={[
        { label: 'Back to home', to: '/', variant: 'primary' },
      ]}
    >
      <p className="text-sm text-neutral-600">
        If you believe this is an error, connect with your Udoy administrator and request the relevant role assignment.
      </p>
      <p className="text-sm text-neutral-600">
        We’ll keep your progress safe in the meantime—you’ll regain full access as soon as permissions are updated.
      </p>
    </ErrorState>
  );
}

export default ForbiddenPage;
