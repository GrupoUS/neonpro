import * as React from "react";
import { DefaultErrorFallback } from "./default-error-fallback";

interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: undefined });
      };

      if (this.props.fallback) {
        return React.createElement(this.props.fallback, {
          error: this.state.error!,
          resetError,
        });
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={resetError}
        />
      );
    }

    return this.props.children;
  }
}
