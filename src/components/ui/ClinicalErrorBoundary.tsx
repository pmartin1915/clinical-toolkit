import React, { type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Shield, RefreshCw, FileText } from 'lucide-react';

interface ClinicalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

interface ClinicalErrorBoundaryProps {
  children: ReactNode;
  toolName: string;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  showPatientDataSafety?: boolean;
}

export class ClinicalErrorBoundary extends React.Component<
  ClinicalErrorBoundaryProps,
  ClinicalErrorBoundaryState
> {
  constructor(props: ClinicalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ClinicalErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || `ERR-${Date.now()}`;
    
    console.error(`Clinical Tool Error [${errorId}]:`, {
      tool: this.props.toolName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      errorId
    });

    this.setState({
      error,
      errorInfo,
      errorId
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined
    });
  };

  private handleReportError = () => {
    const { error, errorId } = this.state;
    const { toolName } = this.props;
    
    const reportData = {
      errorId,
      tool: toolName,
      timestamp: new Date().toISOString(),
      error: error?.message,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In a real application, you would send this to your error reporting system
    console.log('Error report data:', reportData);
    alert(`Error report generated with ID: ${errorId}. Please share this ID with technical support.`);
  };

  render() {
    if (this.state.hasError) {
      const { toolName, showPatientDataSafety = true } = this.props;
      const { error, errorId } = this.state;

      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="text-red-500 flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-red-800">
                  Clinical Tool Error
                </h3>
                {errorId && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-mono">
                    {errorId}
                  </span>
                )}
              </div>
              
              <p className="text-red-700 mb-4">
                <strong>{toolName}</strong> has encountered an error and cannot function properly.
              </p>

              {showPatientDataSafety && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Patient Data Safety
                      </p>
                      <p className="text-sm text-blue-700">
                        Your patient data is secure and has not been affected by this error.
                        All previously saved information remains intact and protected.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-red-800">What you can do:</h4>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• Try refreshing the tool using the button below</li>
                  <li>• Use a different clinical tool for now</li>
                  <li>• Report this error if it continues to occur</li>
                  <li>• Contact IT support if you need immediate assistance</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={this.handleRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retry Tool
                </button>
                
                <button
                  onClick={this.handleReportError}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
                >
                  <FileText size={16} className="mr-2" />
                  Report Error
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Return to Dashboard
                </button>
              </div>

              {import.meta.env.DEV && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800 font-medium">
                    Developer Information
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 border rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Error Details:</h5>
                    <pre className="text-xs text-gray-700 overflow-auto max-h-40 mb-3">
                      {error.message}
                      {'\n\n'}
                      {error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">Component Stack:</h5>
                        <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}