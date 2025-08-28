"use client";

import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Phone } from "lucide-react";
import {
  createHealthcareError,
  ErrorCategory,
  ErrorSeverity,
} from "@neonpro/shared/errors/error-utils";
import type {
  HealthcareError,
  ErrorContext,
} from "@neonpro/shared/errors/healthcare-error-types";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: HealthcareError) => void;
  context?: ErrorContext;
}

interface State {
  hasError: boolean;
  healthcareError?: HealthcareError;
}

export class HealthcareErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const healthcareError = createHealthcareError(error, {
      ...this.props.context,
      endpoint: window.location.pathname,
      userAgent: navigator.userAgent,
    });

    this.setState({ healthcareError });

    // Log to compliance system for healthcare apps
    this.logToComplianceSystem(healthcareError, errorInfo);

    // Alert if patient data is involved
    if (healthcareError.patientImpact) {
      this.triggerDataSecurityAlert(healthcareError);
    }

    // Performance monitoring
    this.logToPerformanceMonitoring(healthcareError, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(healthcareError);
  }
  private logToComplianceSystem(error: HealthcareError, errorInfo: ErrorInfo) {
    // TODO: Implement actual compliance logging
    console.error("[COMPLIANCE LOG]", {
      errorId: error.id,
      category: error.category,
      severity: error.severity,
      patientImpact: error.patientImpact,
      complianceRisk: error.complianceRisk,
      context: error.context,
      timestamp: error.timestamp,
      componentStack: errorInfo.componentStack,
    });
  }

  private triggerDataSecurityAlert(error: HealthcareError) {
    // TODO: Implement actual security alert system
    console.error("[SECURITY ALERT] Patient data involved in error", {
      errorId: error.id,
      patientId: error.context.patientId,
      severity: error.severity,
      timestamp: error.timestamp,
    });
  }

  private logToPerformanceMonitoring(
    error: HealthcareError,
    errorInfo: ErrorInfo,
  ) {
    // TODO: Implement performance monitoring integration
    console.error("[PERFORMANCE MONITOR]", {
      errorId: error.id,
      category: error.category,
      severity: error.severity,
      endpoint: error.context.endpoint,
      timestamp: error.timestamp,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, healthcareError: undefined });
    window.location.reload();
  };

  private handleEscalation = () => {
    // TODO: Implement escalation mechanism
    console.log(
      "[ESCALATION] Error escalated:",
      this.state.healthcareError?.id,
    );
    alert(
      "Erro reportado para a equipe técnica. Aguarde resolução ou entre em contato com o suporte.",
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <HealthcareErrorFallback
          error={this.state.healthcareError}
          onRetry={this.handleRetry}
          onEscalate={this.handleEscalation}
        />
      );
    }

    return this.props.children;
  }
} /**
 * Healthcare Error Fallback Component
 * Displays user-friendly error messages with appropriate actions
 */
interface HealthcareErrorFallbackProps {
  error?: HealthcareError;
  onRetry: () => void;
  onEscalate: () => void;
}

function HealthcareErrorFallback({
  error,
  onRetry,
  onEscalate,
}: HealthcareErrorFallbackProps) {
  const getSeverityColor = (severity?: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "border-red-500 bg-red-50";
      case ErrorSeverity.HIGH:
        return "border-orange-500 bg-orange-50";
      case ErrorSeverity.MEDIUM:
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const getErrorMessage = (error?: HealthcareError) => {
    if (!error) {
      return "Ocorreu um erro inesperado no sistema.";
    }

    if (error.patientImpact) {
      return "Erro relacionado aos dados do paciente. A equipe de segurança foi notificada automaticamente.";
    }

    if (error.category === ErrorCategory.COMPLIANCE) {
      return "Erro de conformidade LGPD detectado. O responsável pela proteção de dados foi notificado.";
    }

    if (
      error.category === ErrorCategory.AUTHENTICATION ||
      error.category === ErrorCategory.AUTHORIZATION
    ) {
      return "Problema de autenticação detectado. Por favor, faça login novamente.";
    }

    if (error.category === ErrorCategory.DATABASE) {
      return "Problema de conectividade com o banco de dados. Tentando reconectar automaticamente.";
    }

    return "Ocorreu um erro no sistema. Nossa equipe foi notificada e está trabalhando na resolução.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full ${getSeverityColor(error?.severity)}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Sistema Indisponível</CardTitle>
          </div>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detalhes Técnicos</AlertTitle>
              <AlertDescription>
                <div className="text-sm space-y-1 mt-2">
                  <p>
                    <strong>ID do Erro:</strong> {error.id}
                  </p>
                  <p>
                    <strong>Categoria:</strong> {error.category}
                  </p>
                  <p>
                    <strong>Horário:</strong>{" "}
                    {error.timestamp.toLocaleString("pt-BR")}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 flex-col sm:flex-row">
            <Button onClick={onRetry} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>

            {error?.severity === ErrorSeverity.CRITICAL && (
              <Button
                onClick={onEscalate}
                variant="destructive"
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Reportar Erro Crítico
              </Button>
            )}
          </div>

          {error?.patientImpact && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-800">
                Aviso de Segurança
              </AlertTitle>
              <AlertDescription className="text-red-700">
                Este erro pode ter afetado dados de pacientes. A equipe de
                segurança foi notificada automaticamente e está investigando. Se
                você estava acessando informações sensíveis, por favor documente
                as ações realizadas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
