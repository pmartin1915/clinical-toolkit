import React, { type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  toolName?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to monitoring service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would report to a service like Sentry
    console.log('Reporting error to monitoring service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      toolName: this.props.toolName,
      level: this.props.level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on error level
      const { level = 'component', toolName } = this.props;
      const { error } = this.state;

      if (level === 'critical') {
        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full text-center">
              <div className="text-red-500 mb-6">
                <AlertTriangle size={64} className="mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Critical System Error
              </h1>
              <p className="text-gray-600 mb-6">
                The application has encountered a critical error and cannot continue safely.
                Please refresh the page or contact support if the problem persists.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <Home size={16} className="mr-2" />
                  Go to Dashboard
                </button>
              </div>
              {import.meta.env.DEV && error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Developer Details
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-[400px] bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="text-orange-500 mb-4">
                <AlertTriangle size={48} className="mx-auto" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Page Error
              </h2>
              <p className="text-gray-600 mb-6">
                This page encountered an error and couldn't load properly.
                You can try refreshing or go back to the dashboard.
              </p>
              <div className="space-y-2">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <Home size={16} className="mr-2" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Component level error (default)
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                {toolName ? `${toolName} Error` : 'Component Error'}
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                This clinical tool encountered an error and couldn't load properly.
                Your data is safe, but this tool may not function correctly.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={this.handleRetry}
                  className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Retry
                </button>
                {import.meta.env.DEV && (
                  <details className="inline">
                    <summary className="text-sm text-yellow-800 cursor-pointer hover:text-yellow-900">
                      Details
                    </summary>
                    <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-32">
                      {error?.message}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}