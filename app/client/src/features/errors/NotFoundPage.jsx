import ErrorState from './ErrorState.jsx';

function NotFoundPage() {
  return (
    <ErrorState
      statusCode="404"
      title="Oops! We can’t find that page."
      description="The page you’re looking for may have been moved, renamed, or never existed."
      badgeTone="warning"
      actions={[
        { label: 'Back to home', to: '/', variant: 'accent' },
      ]}
    >
      <p className="text-body-xs text-subdued">
        Double-check the URL or return home to continue exploring the Udoy platform.
      </p>
    </ErrorState>
  );
}

export default NotFoundPage;
