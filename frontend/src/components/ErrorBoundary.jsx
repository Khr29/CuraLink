import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Alert variant="destructive" className="max-w-md flex-col items-center text-center gap-3 py-8 px-6">
            <AlertTriangle className="mx-auto" size={32} />
            <AlertTitle className="text-xl">Something went wrong.</AlertTitle>
            <AlertDescription>
              We apologize for the inconvenience. Please try refreshing the page.
            </AlertDescription>
            <Button variant="gradient" className="mt-2" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
