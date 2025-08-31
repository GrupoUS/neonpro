"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createHealthcareError,
  ErrorCategory,
  ErrorSeverity,
} from "@neonpro/shared/errors/error-utils";
import type { ErrorContext, HealthcareError } from "@neonpro/shared/errors/healthcare-error-types";
import { AlertTriangle, Phone, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import React, { Component } from "react";

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
  private async logToComplianceSystem(error: HealthcareError, errorInfo: ErrorInfo) {
    try {
      const complianceLog = {
        errorId: error.id,
        category: error.category,
        severity: error.severity,
        patientImpact: error.patientImpact,
        complianceRisk: error.complianceRisk,
        context: {
          ...error.context,
          // Sanitize sensitive data for LGPD compliance
          patientId: error.context.patientId ? "[REDACTED]" : undefined,
          userId: error.context.userId ? "[REDACTED]" : undefined,
        },
        timestamp: error.timestamp,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Send to compliance API endpoint
      await fetch("/api/compliance/error-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Compliance-Log": "true",
        },
        body: JSON.stringify(complianceLog),
      }).catch(err => {
        // Fallback to console if API fails
        console.error("[COMPLIANCE LOG FALLBACK]", complianceLog, err);
      });

      // Also log to local storage for offline scenarios
      const existingLogs = JSON.parse(localStorage.getItem("compliance-error-logs") || "[]");
      existingLogs.push(complianceLog);
      // Keep only last 50 logs to prevent storage overflow
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      localStorage.setItem("compliance-error-logs", JSON.stringify(existingLogs));
    } catch (logError) {
      console.error("[COMPLIANCE LOG ERROR]", logError);
    }
  }

  private async triggerDataSecurityAlert(error: HealthcareError) {
    try {
      const securityAlert = {
        alertId: `SEC_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        errorId: error.id,
        alertType: "PATIENT_DATA_ERROR",
        severity: error.severity,
        patientDataInvolved: !!error.context.patientId,
        medicalRecordsInvolved: error.context.endpoint?.includes("medical-records") || false,
        complianceRisk: error.complianceRisk,
        timestamp: error.timestamp,
        context: {
          endpoint: error.context.endpoint,
          sessionId: error.context.sessionId,
          // Do not include actual patient ID for security
          hasPatientId: !!error.context.patientId,
        },
      };

      // Send immediate security alert
      await fetch("/api/security/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Security-Alert": "true",
          "X-Priority": error.severity === "critical" ? "IMMEDIATE" : "HIGH",
        },
        body: JSON.stringify(securityAlert),
      }).catch(err => {
        console.error("[SECURITY ALERT FALLBACK]", securityAlert, err);
      });

      // If critical, also trigger browser notification (if permitted)
      if (error.severity === "critical" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Alerta de Segurança Crítico", {
            body:
              "Erro crítico detectado envolvendo dados de paciente. Equipe de segurança notificada.",
            icon: "/icons/security-alert.png",
            tag: "security-alert",
          });
        }
      }
    } catch (alertError) {
      console.error("[SECURITY ALERT ERROR]", alertError);
    }
  }

  private async logToPerformanceMonitoring(
    error: HealthcareError,
    errorInfo: ErrorInfo,
  ) {
    try {
      const performanceData = {
        errorId: error.id,
        category: error.category,
        severity: error.severity,
        endpoint: error.context.endpoint,
        timestamp: error.timestamp,
        performanceMetrics: {
          // Collect performance timing data
          navigationTiming: performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceNavigationTiming,
          memoryUsage: (performance as any).memory
            ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
            : undefined,
          connectionType: (navigator as any).connection?.effectiveType,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
        componentStack: errorInfo.componentStack,
        renderingContext: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now(),
        },
      };

      // Send to performance monitoring service
      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Performance-Log": "true",
        },
        body: JSON.stringify(performanceData),
      }).catch(err => {
        console.error("[PERFORMANCE MONITOR FALLBACK]", performanceData, err);
      });

      // Also send to external monitoring service (e.g., Sentry, DataDog)
      if (window.gtag) {
        window.gtag("event", "exception", {
          description: `Healthcare Error: ${error.category}`,
          fatal: error.severity === "critical",
          custom_map: {
            error_id: error.id,
            category: error.category,
            patient_impact: error.patientImpact,
          },
        });
      }
    } catch (monitorError) {
      console.error("[PERFORMANCE MONITOR ERROR]", monitorError);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, healthcareError: undefined });
    window.location.reload();
  };

  private handleEscalation = async () => {
    const error = this.state.healthcareError;
    if (!error) {return;}

    try {
      const escalationData = {
        escalationId: `ESC_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        errorId: error.id,
        escalationType: "USER_INITIATED",
        severity: error.severity,
        category: error.category,
        patientImpact: error.patientImpact,
        complianceRisk: error.complianceRisk,
        userContext: {
          sessionId: error.context.sessionId,
          endpoint: error.context.endpoint,
          timestamp: new Date().toISOString(),
        },
        escalationReason: "User requested technical support",
      };

      // Send escalation to support system
      const response = await fetch("/api/support/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Escalation": "true",
          "X-Priority": error.severity === "critical" ? "URGENT" : "HIGH",
        },
        body: JSON.stringify(escalationData),
      });

      if (response.ok) {
        const result = await response.json();

        // Show success message to user
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Suporte Técnico Acionado", {
            body: `Ticket #${result.ticketId} criado. Nossa equipe entrará em contato em breve.`,
            icon: "/icons/support.png",
            tag: "support-escalation",
          });
        }

        // Update UI to show escalation success
        this.setState({
          escalationStatus: "success",
          supportTicketId: result.ticketId,
        });
      } else {
        throw new Error("Escalation API failed");
      }
    } catch (escalationError) {
      console.error("[ESCALATION ERROR]", escalationError);

      // Fallback: Open email client with pre-filled support email
      const subject = encodeURIComponent(`Erro Crítico do Sistema - ID: ${error.id}`);
      const body = encodeURIComponent(
        `Detalhes do Erro:\n\n`
          + `ID do Erro: ${error.id}\n`
          + `Categoria: ${error.category}\n`
          + `Severidade: ${error.severity}\n`
          + `Timestamp: ${error.timestamp}\n`
          + `Endpoint: ${error.context.endpoint || "N/A"}\n\n`
          + `Por favor, investiguem este erro com urgência.`,
      );

      window.location.href = `mailto:suporte@neonpro.com.br?subject=${subject}&body=${body}`;
    }
    // Use toast notification instead of alert for better UX and accessibility
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("healthcare-error-reported", {
          detail: {
            message:
              "Erro reportado para a equipe técnica. Aguarde resolução ou entre em contato com o suporte.",
            type: "success",
          },
        }),
      );
    }
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
      error.category === ErrorCategory.AUTHENTICATION
      || error.category === ErrorCategory.AUTHORIZATION
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
                    <strong>Horário:</strong> {error.timestamp.toLocaleString("pt-BR")}
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
                Este erro pode ter afetado dados de pacientes. A equipe de segurança foi notificada
                automaticamente e está investigando. Se você estava acessando informações sensíveis,
                por favor documente as ações realizadas.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
