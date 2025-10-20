import { Component, Suspense, lazy } from 'react';
import PropTypes from 'prop-types';

const LazyGenericErrorPage = lazy(() => import('../features/errors/GenericErrorPage.jsx'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled client error captured by boundary:', error, errorInfo);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Suspense
          fallback={(
            <div role="alert" className="flex h-screen items-center justify-center p-6 text-body-sm text-foreground">
              Something went wrong. Please try again.
            </div>
          )}
        >
          <LazyGenericErrorPage onRetry={this.handleRetry} />
        </Suspense>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
