/**
 * Subscription Error Boundary Component
 *
 * React Error Boundary specifically designed for subscription-related components:
 * - Catches JavaScript errors in subscription components
 * - Provides user-friendly error messages
 * - Integrates with centralized error handling
 * - Supports error recovery and retry mechanisms
 * - Performance monitoring integration
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */

"use client";

import type { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { subscriptionErrorHandler } from "@/lib/subscription-error-handler";
import type { ErrorSeverity, SubscriptionErrorFactory } from "@/types/subscription-errors";

interface SubscriptionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRecovering: boolean;
  userMessage: string;
  canRetry: boolean;
}
interface SubscriptionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
  componentName?: string;
  enableRecovery?: boolean;
  customErrorMessage?: string;
}

export class SubscriptionErrorBoundary extends Component<
  SubscriptionErrorBoundaryProps,
  SubscriptionErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: SubscriptionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
      userMessage: "",
      canRetry: true,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SubscriptionErrorBoundaryState> {
    return {
      hasError: true,
      error,
      userMessage: "Something went wrong with the subscription system.",
      canRetry: true,
    };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error using centralized error handler
    const subscriptionError = SubscriptionErrorFactory.createError(
      "validation",
      `React Error Boundary: ${error.message}`,
      {
        additionalContext: {
          componentName: this.props.componentName || "SubscriptionComponent",
          errorInfo: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        },
      },
    );

    // Handle error through centralized system
    subscriptionErrorHandler.handleError(subscriptionError, async () => {
      // This is just for logging, no recovery operation
      return Promise.resolve();
    });

    // Update state
    this.setState({
      error,
      errorInfo,
      userMessage: this.getUserFriendlyMessage(error),
      canRetry: this.canRetryError(error),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  private getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "Connection issue detected. Please check your internet connection.";
    }

    if (message.includes("auth") || message.includes("unauthorized")) {
      return "Authentication required. Please log in to continue.";
    }

    if (message.includes("subscription") || message.includes("payment")) {
      return "Issue with subscription service. Please try again shortly.";
    }

    return this.props.customErrorMessage || "An unexpected error occurred. Please try again.";
  }

  private canRetryError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Don't retry auth errors or critical system errors
    if (message.includes("auth") || message.includes("critical")) {
      return false;
    }

    return this.state.retryCount < (this.props.maxRetries || 3);
  }
  private handleRetry = async (): Promise<void> => {
    if (!this.state.canRetry || this.state.isRecovering) {
      return;
    }

    this.setState({ isRecovering: true });

    try {
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset error state to trigger re-render
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1,
        isRecovering: false,
        userMessage: "",
        canRetry: true,
      });
    } catch (retryError) {
      this.setState({
        isRecovering: false,
        userMessage: "Retry failed. Please refresh the page.",
        canRetry: false,
      });
    }
  };

  private handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Subscription System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">{this.state.userMessage}</AlertDescription>
            </Alert>
            {this.props.showDetails && this.state.error && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}{" "}
            <div className="flex flex-col gap-2">
              {this.state.canRetry && (
                <Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRecovering}
                  variant="default"
                  className="w-full"
                >
                  {this.state.isRecovering ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  )}
                </Button>
              )}

              <Button onClick={this.handleRefresh} variant="outline" className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }

  componentWillUnmount() {
    // Clean up any retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
  }
} // Specialized Error Boundary for different subscription contexts
export const SubscriptionStatusErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <SubscriptionErrorBoundary
    componentName="SubscriptionStatus"
    maxRetries={2}
    customErrorMessage="Unable to load subscription status. Please try again."
    enableRecovery={true}
  >
    {children}
  </SubscriptionErrorBoundary>
);

export const SubscriptionPaymentErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <SubscriptionErrorBoundary
    componentName="SubscriptionPayment"
    maxRetries={1}
    customErrorMessage="Payment processing error. Please try again or contact support."
    enableRecovery={false}
    showDetails={false}
  >
    {children}
  </SubscriptionErrorBoundary>
);

// Higher-order component for easy wrapping
export function withSubscriptionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Partial<SubscriptionErrorBoundaryProps>,
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <SubscriptionErrorBoundary {...options}>
      <WrappedComponent {...props} />
    </SubscriptionErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withSubscriptionErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}
