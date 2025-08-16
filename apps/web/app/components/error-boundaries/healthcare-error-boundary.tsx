'use client';

import type React from 'react';
import { Component, type ReactNode } from 'react';
import { healthcareMonitoring } from '@/lib/monitoring/healthcare-monitoring';

interface HealthcareErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level: 'critical' | 'high' | 'medium';
  context: string;
  patientId?: string;
  enableEmergencyAccess?: boolean;
}

interface HealthcareErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  emergencyMode: boolean;
}

/**
 * Healthcare Error Boundary for Patient Data Protection
 * Constitutional patient safety protocols with emergency access
 */
export class HealthcareErrorBoundary extends Component<
  HealthcareErrorBoundaryProps,
  HealthcareErrorBoundaryState
> {
  constructor(props: HealthcareErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      emergencyMode: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<HealthcareErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log healthcare error with constitutional validation
    this.logHealthcareError(error, errorInfo);

    // Trigger emergency protocols if critical
    if (this.props.level === 'critical') {
      this.activateEmergencyProtocols(error);
    }
  } /**
   * Log healthcare error with constitutional audit trail
   */
  private async logHealthcareError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await healthcareMonitoring.monitorPatientSafety(
        'error_boundary_triggered',
        this.props.patientId || 'unknown',
        'system',
        {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context: this.props.context,
          level: this.props.level,
          timestamp: new Date().toISOString(),
        },
      );

      // Trigger alert based on error severity
      const severity = this.props.level === 'critical' ? 'critical' : 'high';
      await healthcareMonitoring.triggerEmergencyAlert(
        `Healthcare system error in ${this.props.context}: ${error.message}`,
        severity === 'critical' ? 'medical_emergency' : 'critical',
        {
          error: error.message,
          context: this.props.context,
          patientId: this.props.patientId,
          requiresImmediateAttention: this.props.level === 'critical',
        },
      );
    } catch (monitoringError) {
      console.error('Failed to log healthcare error:', monitoringError);
    }
  }

  /**
   * Activate emergency protocols for critical errors
   */
  private activateEmergencyProtocols(error: Error) {
    this.setState({ emergencyMode: true });

    // Constitutional emergency access for medical staff
    if (this.props.enableEmergencyAccess) {
      this.enableEmergencyAccess();
    }

    // Notify medical staff immediately
    this.notifyEmergencyContacts(error);
  } /**
   * Enable emergency access for medical staff
   */
  private enableEmergencyAccess() {
    // Constitutional emergency access protocol
    try {
      localStorage.setItem('healthcare_emergency_mode', 'true');
      localStorage.setItem('emergency_timestamp', new Date().toISOString());

      // Enable emergency access patterns
      if (typeof window !== 'undefined') {
        (window as any).healthcareEmergencyMode = true;
      }
    } catch (error) {
      console.error('Failed to enable emergency access:', error);
    }
  }

  /**
   * Notify emergency contacts for critical system failures
   */
  private notifyEmergencyContacts(error: Error) {
    // Browser notification for immediate medical staff alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGÊNCIA SISTEMA MÉDICO', {
        body: `Falha crítica no sistema: ${error.message}`,
        icon: '/medical-emergency.ico',
        requireInteraction: true,
        tag: 'medical-emergency',
      });
    }

    // Send emergency SMS/WhatsApp to medical staff (production implementation)
    if (process.env.NODE_ENV === 'production') {
      this.sendEmergencyNotification(error);
    }
  }

  /**
   * Send emergency notification to medical staff
   */
  private async sendEmergencyNotification(error: Error) {
    try {
      const response = await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system_critical',
          message: error.message,
          context: this.props.context,
          patientId: this.props.patientId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emergency notification');
      }
    } catch (notificationError) {
      console.error('Emergency notification failed:', notificationError);
    }
  } /**
   * Retry healthcare operation with patient data recovery
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });

    // Attempt patient data recovery
    this.recoverPatientData();
  };

  /**
   * Recover patient data from auto-save
   */
  private recoverPatientData() {
    try {
      if (this.props.patientId) {
        const autoSaveKey = `patient_autosave_${this.props.patientId}`;
        const savedData = localStorage.getItem(autoSaveKey);

        if (savedData) {
          // Restore patient data from auto-save
          const data = JSON.parse(savedData);
          console.log('Recovering patient data:', data);

          // Trigger data restoration event
          window.dispatchEvent(
            new CustomEvent('patientDataRecovery', {
              detail: { patientId: this.props.patientId, data },
            }),
          );
        }
      }
    } catch (recoveryError) {
      console.error('Patient data recovery failed:', recoveryError);
    }
  }

  /**
   * Activate emergency medical override
   */
  private handleEmergencyOverride = () => {
    this.setState({ emergencyMode: true });
    this.enableEmergencyAccess();

    // Constitutional emergency access - bypass normal restrictions
    const emergencyData = {
      timestamp: new Date().toISOString(),
      context: this.props.context,
      patientId: this.props.patientId,
      authorizedBy: 'emergency_protocol',
    };

    // Store emergency access log
    localStorage.setItem('emergency_access_log', JSON.stringify(emergencyData));

    // Redirect to emergency access interface
    if (typeof window !== 'undefined') {
      window.location.href = '/emergency-access';
    }
  };
  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default healthcare error UI with emergency protocols
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {this.props.level === 'critical'
                    ? 'ERRO CRÍTICO DO SISTEMA MÉDICO'
                    : 'Falha no Sistema'}
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-red-700">
                {this.props.level === 'critical'
                  ? 'Ocorreu uma falha crítica no sistema médico. Os protocolos de emergência foram ativados automaticamente.'
                  : 'Ocorreu um erro no sistema. Seus dados estão protegidos.'}
              </p>

              {this.props.patientId && (
                <p className="text-xs text-red-600 mt-2">
                  Paciente: {this.props.patientId} | Contexto:{' '}
                  {this.props.context}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Tentar Novamente (Recuperar Dados)
              </button>

              {this.props.enableEmergencyAccess &&
                this.props.level === 'critical' && (
                  <button
                    onClick={this.handleEmergencyOverride}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    🚨 ACESSO DE EMERGÊNCIA MÉDICA
                  </button>
                )}

              <div className="text-xs text-gray-500 text-center">
                Erro reportado automaticamente • Equipe técnica notificada
                {this.state.emergencyMode && (
                  <div className="mt-1 text-red-600 font-medium">
                    ⚡ MODO EMERGÊNCIA ATIVADO
                  </div>
                )}
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-600">
                  Detalhes do Erro (Dev)
                </summary>
                <pre className="mt-2 text-red-800 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Healthcare Error Boundary Hook for functional components
export function useHealthcareErrorBoundary() {
  return {
    triggerError: (error: Error) => {
      throw error;
    },
    reportError: async (error: Error, context: string, patientId?: string) => {
      await healthcareMonitoring.monitorPatientSafety(
        'manual_error_report',
        patientId || 'unknown',
        'user',
        {
          error: error.message,
          context,
          timestamp: new Date().toISOString(),
        },
      );
    },
  };
}

export default HealthcareErrorBoundary;
