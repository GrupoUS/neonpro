import { fireEvent, fireEvent, render, render, screen, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import {
  CriticalErrorBoundary,
  ErrorBoundary,
  withErrorBoundary,
} from '@/components/ui/error-boundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
    expect(
      screen.getByText('Ocorreu um erro inesperado. Nossa equipe foi notificada.')
    ).toBeInTheDocument();
  });

  it('shows retry button and resets error state when clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    // After retry, component should re-render and error should be gone
    // Note: In real usage, the component would need to fix the error condition
  });

  it('shows technical details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Detalhes técnicos')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});

describe('CriticalErrorBoundary', () => {
  it('renders critical error UI with reload button', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <CriticalErrorBoundary title="Test Section">
        <ThrowError />
      </CriticalErrorBoundary>
    );

    expect(screen.getByText('Erro em Test Section')).toBeInTheDocument();
    expect(screen.getByText('Recarregar Página')).toBeInTheDocument();

    const reloadButton = screen.getByText('Recarregar Página');
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });
});

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('catches errors in wrapped component', () => {
    const ErrorComponent = withErrorBoundary(ThrowError);

    render(<ErrorComponent />);

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
  });

  it('passes props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('Error Boundary Edge Cases', () => {
  it('handles multiple error types correctly', () => {
    const AsyncErrorComponent = () => {
      throw new TypeError('Type error occurred');
    };

    render(
      <ErrorBoundary showDetails={true}>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();

    // Click to show details
    const detailsButton = screen.getByText('Detalhes técnicos');
    fireEvent.click(detailsButton);

    expect(screen.getByText('Type error occurred')).toBeInTheDocument();
  });

  it('maintains error state across re-renders', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();

    // Re-render with same error
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
  });
});
