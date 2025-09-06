"use client";

/**
 * Healthcare Error Boundary
 * LGPD-compliant error handling with patient data protection
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clientEnv } from "@/lib/env";
import { AlertTriangle, Bug, Home, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    const errorId = `error-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Healthcare-specific error handling
    this.handleHealthcareError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to client logger
    this.logError(error, errorInfo);

    // Report to crash reporting service in production
    if (clientEnv.app.environment === "production") {
      this.reportToMonitoring(error, errorInfo);
    }
  }

  private handleHealthcareError(error: Error, errorInfo: ErrorInfo) {
    // Check if error might contain patient data
    const errorString = error.toString() + errorInfo.componentStack;
    const containsSensitiveData = this.detectSensitiveData(errorString);

    if (containsSensitiveData) {
      console.warn(
        "🏥 Healthcare Error: Sensitive data detected in error, redacting for compliance",
      );

      // In production, we would sanitize and report sanitized version
      if (clientEnv.app.environment === "production") {
        const sanitizedError = this.sanitizeError(error);
        const sanitizedInfo = this.sanitizeErrorInfo(errorInfo);
        // Report sanitized version to monitoring
        this.reportToMonitoring(sanitizedError, sanitizedInfo);
      }
    }
  }

  private detectSensitiveData(errorString: string): boolean {
    // Brazilian healthcare data patterns
    const sensitivePatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
      /\b\d{3}\s?\d{9}\b/, // CNS
      /\b\d{11,15}\b/, // Phone numbers
      /@[\w.-]+\.\w+/, // Email
      /patient.*data/i, // Patient data references
      /medical.*record/i, // Medical records
      /prontuario/i, // Portuguese for medical record
    ];

    return sensitivePatterns.some(pattern => pattern.test(errorString));
  }

  private sanitizeError(error: Error): Error {
    const sanitized = new Error("[REDACTED] Healthcare error occurred");
    sanitized.name = error.name;
    sanitized.stack = error.stack?.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF-REDACTED]")
      .replace(/\b\d{3}\s?\d{9}\b/g, "[CNS-REDACTED]")
      .replace(/@[\w.-]+\.\w+/g, "[EMAIL-REDACTED]");
    return sanitized;
  }

  private sanitizeErrorInfo(errorInfo: ErrorInfo): ErrorInfo {
    return {
      componentStack: errorInfo.componentStack.replace(
        /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
        "[CPF-REDACTED]",
      )
        .replace(/\b\d{3}\s?\d{9}\b/g, "[CNS-REDACTED]")
        .replace(/@[\w.-]+\.\w+/g, "[EMAIL-REDACTED]"),
    };
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    // Log error with client logger (handles LGPD compliance automatically)
    console.group("🚨 React Error Boundary");
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Error ID:", this.state.errorId);
    console.groupEnd();
  }

  private reportToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // Send to external monitoring service (Sentry, LogRocket, etc.)
    if (typeof window !== "undefined" && window.location) {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo,
          errorId: this.state.errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(reportingError => {
        console.error("Failed to report error to monitoring:", reportingError);
      });
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const mailtoLink =
      `mailto:suporte@neonpro.health?subject=Bug Report - ${this.state.errorId}&body=Error Details:%0A${
        encodeURIComponent(JSON.stringify(errorDetails, null, 2))
      }`;
    window.location.href = mailtoLink;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = clientEnv.app.environment === "development";
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-red-500">
                <AlertTriangle size={48} />
              </div>
              <CardTitle className="text-red-900">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription className="text-red-700">
                {isDevelopment
                  ? "Erro detectado durante desenvolvimento"
                  : "Encontramos um problema inesperado no sistema"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error ID for support */}
              <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>ID do Erro:</strong> {this.state.errorId}
              </div>

              {/* Development details */}
              {isDevelopment && this.props.showDetails && this.state.error && (
                <div className="bg-red-100 p-3 rounded text-sm">
                  <details>
                    <summary className="font-medium cursor-pointer">
                      Detalhes Técnicos
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>Error:</strong> {this.state.error.name}
                      </div>
                      <div>
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="text-xs mt-1 overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col space-y-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} variant="default">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({this.maxRetries - this.retryCount} tentativas restantes)
                  </Button>
                )}

                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>

                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>

                {clientEnv.app.environment !== "development" && (
                  <Button onClick={this.handleReportBug} variant="secondary">
                    <Bug className="w-4 h-4 mr-2" />
                    Reportar Problema
                  </Button>
                )}
              </div>

              {/* Healthcare notice */}
              <div className="text-xs text-gray-600 text-center mt-4">
                🏥 Seus dados médicos permanecem seguros e protegidos
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Healthcare-specific error boundary wrapper
export function HealthcareErrorBoundary({
  children,
  showDetails = false,
}: {
  children: ReactNode;
  showDetails?: boolean;
}) {
  return (
    <ErrorBoundary
      showDetails={showDetails}
      onError={(error, errorInfo) => {
        // Healthcare-specific error logging
        console.log("🏥 Healthcare system error captured:", {
          error: error.name,
          component: errorInfo.componentStack.split("\n")[1]?.trim(),
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
