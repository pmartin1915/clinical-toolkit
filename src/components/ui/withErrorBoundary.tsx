import React, { type ComponentType, type ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface WithErrorBoundaryOptions {
  level?: 'page' | 'component' | 'critical';
  toolName?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function withErrorBoundary<T extends object>(
  Component: ComponentType<T>,
  options: WithErrorBoundaryOptions = {}
) {
  const WrappedComponent = (props: T) => {
    const handleError = (error: Error, errorInfo: ErrorInfo) => {
      // Log error with component context
      console.error(`Error in ${Component.name || 'Unknown Component'}:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        toolName: options.toolName,
        timestamp: new Date().toISOString()
      });

      // Call custom error handler
      if (options.onError) {
        options.onError(error, errorInfo);
      }
    };

    return (
      <ErrorBoundary
        level={options.level}
        toolName={options.toolName || Component.name}
        fallback={options.fallback}
        onError={handleError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Convenience HOCs for different error levels
export function withClinicalToolErrorBoundary<T extends object>(
  Component: ComponentType<T>,
  toolName: string
) {
  return withErrorBoundary(Component, {
    level: 'component',
    toolName,
    onError: (error, errorInfo) => {
      // Track clinical tool errors specifically
      console.warn(`Clinical tool error in ${toolName}:`, {
        error: error.message,
        timestamp: new Date().toISOString(),
        componentStack: errorInfo.componentStack
      });
    }
  });
}

export function withPageErrorBoundary<T extends object>(
  Component: ComponentType<T>,
  pageName: string
) {
  return withErrorBoundary(Component, {
    level: 'page',
    toolName: pageName,
    onError: (error, errorInfo) => {
      // Track page errors specifically
      console.error(`Page error in ${pageName}:`, {
        error: error.message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        componentStack: errorInfo.componentStack
      });
    }
  });
}

export function withCriticalErrorBoundary<T extends object>(
  Component: ComponentType<T>
) {
  return withErrorBoundary(Component, {
    level: 'critical',
    onError: (error, errorInfo) => {
      // Track critical errors that require immediate attention
      console.error('CRITICAL ERROR:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        componentStack: errorInfo.componentStack
      });

      // In production, you would send this to your monitoring service
      if (import.meta.env.PROD) {
        // Example: send to error tracking service
        // errorTrackingService.reportCriticalError(error, errorInfo);
      }
    }
  });
}