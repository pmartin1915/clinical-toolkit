import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child throws error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary toolName="Test Tool">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Tool Error')).toBeInTheDocument();
    expect(screen.getByText(/couldn't load properly/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('allows retrying after error', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = useState(true);
      
      return (
        <ErrorBoundary>
          <div>
            <button onClick={() => setShouldThrow(!shouldThrow)}>
              Toggle Error
            </button>
            <ThrowError shouldThrow={shouldThrow} />
          </div>
        </ErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // Should show error initially
    expect(screen.getByText(/Component Error/)).toBeInTheDocument();
    
    // Click retry
    await user.click(screen.getByText('Retry'));
    
    // Should still show error (because component still throws)
    expect(screen.getByText(/Component Error/)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('renders page-level error UI appropriately', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Page Error')).toBeInTheDocument();
    expect(screen.getByText(/couldn't load properly/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('renders critical error UI appropriately', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary level="critical">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Critical System Error')).toBeInTheDocument();
    expect(screen.getByText(/cannot continue safely/)).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('uses custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Component Error')).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});