/**
 * OAuth Error Handling System
 *
 * Comprehensive error handling for OAuth authentication with user-friendly messages,
 * retry mechanisms, error reporting, and network connectivity handling.
 *
 * Features:
 * - User-friendly error messages in PT-BR
 * - Automatic retry with exponential backoff
 * - Error categorization and logging
 * - Network connectivity detection
 * - Fallback authentication flows
 * - Error recovery strategies
 */

import { toast } from 'sonner';

// Error types and categories
export enum AuthErrorType {
  OAUTH_PROVIDER = 'oauth_provider',
  NETWORK = 'network',
  SESSION = 'session',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

export enum AuthErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuthError {
  type: AuthErrorType;
  code: string;
  message: string;
  details?: Record<string, any>;
  severity: AuthErrorSeverity;
  timestamp: number;
  userMessage: string;
  actionable: boolean;
  retryable: boolean;
  fallbackAvailable: boolean;
}

// Error messages in Portuguese
const ERROR_MESSAGES = {
  // OAuth Provider Errors
  oauth_popup_blocked: {
    user: 'O navegador bloqueou a janela de autenticação. Permita pop-ups para este site.',
    technical: 'OAuth popup window was blocked by browser',
    action:
      'Clique no ícone de bloqueio na barra de endereços e permita pop-ups',
  },
  oauth_cancelled: {
    user: 'Autenticação cancelada. Tente novamente para fazer login.',
    technical: 'User cancelled OAuth flow',
    action: 'Clique em "Entrar com Google" novamente',
  },
  oauth_failed: {
    user: 'Falha na autenticação com Google. Verifique sua conta e tente novamente.',
    technical: 'OAuth authentication failed',
    action: 'Verifique se sua conta Google está ativa e tente novamente',
  },
  oauth_timeout: {
    user: 'Tempo esgotado para autenticação. Tente novamente.',
    technical: 'OAuth flow timed out',
    action: 'Tente fazer login novamente',
  },

  // Network Errors
  network_offline: {
    user: 'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
    technical: 'No network connection detected',
    action: 'Verifique sua conexão com a internet',
  },
  network_slow: {
    user: 'Conexão lenta detectada. Aguarde um momento.',
    technical: 'Slow network connection detected',
    action: 'Aguarde enquanto tentamos conectar',
  },
  network_error: {
    user: 'Erro de rede. Verifique sua conexão.',
    technical: 'Network request failed',
    action: 'Verifique sua conexão e tente novamente',
  },

  // Session Errors
  session_expired: {
    user: 'Sua sessão expirou. Faça login novamente.',
    technical: 'Session token expired',
    action: 'Clique para fazer login novamente',
  },
  session_invalid: {
    user: 'Sessão inválida. Faça login novamente.',
    technical: 'Invalid session token',
    action: 'Faça login novamente',
  },
  session_conflict: {
    user: 'Muitas sessões ativas. Faça logout de outros dispositivos.',
    technical: 'Too many concurrent sessions',
    action: 'Gerencie suas sessões ativas',
  },

  // Permission Errors
  permission_denied: {
    user: 'Acesso negado. Você não tem permissão para esta ação.',
    technical: 'Insufficient permissions',
    action: 'Entre em contato com o administrador',
  },
  role_required: {
    user: 'Função necessária não encontrada. Entre em contato com o administrador.',
    technical: 'Required role not assigned',
    action: 'Solicite as permissões necessárias',
  },

  // Server Errors
  server_error: {
    user: 'Erro no servidor. Tente novamente em alguns minutos.',
    technical: 'Internal server error',
    action: 'Aguarde alguns minutos e tente novamente',
  },
  service_unavailable: {
    user: 'Serviço temporariamente indisponível.',
    technical: 'Service unavailable',
    action: 'Tente novamente em alguns minutos',
  },

  // Generic
  unknown_error: {
    user: 'Erro inesperado. Tente novamente.',
    technical: 'Unknown error occurred',
    action: 'Tente novamente ou entre em contato com o suporte',
  },
};

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 10_000, // 10 seconds
  BACKOFF_FACTOR: 2,
};

class AuthErrorHandler {
  private errorLog: AuthError[] = [];

  /**
   * Create standardized auth error
   */
  createError(
    type: AuthErrorType,
    code: string,
    originalError?: Error | any,
    metadata?: Record<string, any>
  ): AuthError {
    const errorConfig = ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown_error;

    const authError: AuthError = {
      type,
      code,
      message: originalError?.message || errorConfig.technical,
      details: {
        originalError: originalError?.toString(),
        stack: originalError?.stack,
        ...metadata,
      },
      severity: this.determineSeverity(type, code),
      timestamp: Date.now(),
      userMessage: errorConfig.user,
      actionable: Boolean(errorConfig.action),
      retryable: this.isRetryable(type, code),
      fallbackAvailable: this.hasFallback(type, code),
    };

    this.logError(authError);
    return authError;
  }

  /**
   * Handle OAuth-specific errors
   */
  handleOAuthError(error: any): AuthError {
    let code = 'oauth_failed';

    if (error?.message?.includes('popup')) {
      code = 'oauth_popup_blocked';
    } else if (error?.message?.includes('cancelled')) {
      code = 'oauth_cancelled';
    } else if (error?.message?.includes('timeout')) {
      code = 'oauth_timeout';
    }

    return this.createError(AuthErrorType.OAUTH_PROVIDER, code, error);
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any): AuthError {
    let code = 'network_error';

    if (!navigator.onLine) {
      code = 'network_offline';
    } else if (error?.code === 'TIMEOUT') {
      code = 'network_slow';
    }

    return this.createError(AuthErrorType.NETWORK, code, error);
  }

  /**
   * Handle session errors
   */
  handleSessionError(error: any): AuthError {
    let code = 'session_invalid';

    if (error?.message?.includes('expired')) {
      code = 'session_expired';
    } else if (error?.message?.includes('concurrent')) {
      code = 'session_conflict';
    }

    return this.createError(AuthErrorType.SESSION, code, error);
  }

  /**
   * Display user-friendly error message
   */
  displayError(error: AuthError): void {
    const _errorConfig =
      ERROR_MESSAGES[error.code] || ERROR_MESSAGES.unknown_error;

    // Choose appropriate toast type based on severity
    const toastOptions = {
      duration: this.getToastDuration(error.severity),
      action: error.actionable
        ? {
            label: 'Como resolver',
            onClick: () => this.showErrorDetails(error),
          }
        : undefined,
    };

    switch (error.severity) {
      case AuthErrorSeverity.LOW:
        toast.info(error.userMessage, toastOptions);
        break;
      case AuthErrorSeverity.MEDIUM:
        toast.warning(error.userMessage, toastOptions);
        break;
      case AuthErrorSeverity.HIGH:
      case AuthErrorSeverity.CRITICAL:
        toast.error(error.userMessage, toastOptions);
        break;
    }
  }

  /**
   * Show detailed error information
   */
  showErrorDetails(error: AuthError): void {
    const errorConfig =
      ERROR_MESSAGES[error.code] || ERROR_MESSAGES.unknown_error;

    toast.info(errorConfig.action || 'Entre em contato com o suporte', {
      duration: 8000,
    });
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    errorType: AuthErrorType,
    maxRetries: number = RETRY_CONFIG.MAX_RETRIES
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry
          const delay = Math.min(
            RETRY_CONFIG.BASE_DELAY *
              RETRY_CONFIG.BACKOFF_FACTOR ** (attempt - 1),
            RETRY_CONFIG.MAX_DELAY
          );

          toast.info(`Tentativa ${attempt + 1} de ${maxRetries + 1}...`, {
            duration: delay,
          });

          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        return await operation();
      } catch (error) {
        lastError = error;

        const authError = this.createError(errorType, 'retry_failed', error, {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
        });

        if (!authError.retryable || attempt === maxRetries) {
          this.displayError(authError);
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      const error = this.createError(AuthErrorType.NETWORK, 'network_offline');
      this.displayError(error);
      return false;
    }

    try {
      // Test connectivity with a simple request
      await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return true;
    } catch (error) {
      const authError = this.handleNetworkError(error);
      this.displayError(authError);
      return false;
    }
  }

  /**
   * Get fallback authentication options
   */
  getFallbackOptions(error: AuthError): string[] {
    const fallbacks: string[] = [];

    if (error.type === AuthErrorType.OAUTH_PROVIDER) {
      fallbacks.push('email_password');
    }

    if (error.type === AuthErrorType.NETWORK) {
      fallbacks.push('offline_mode');
    }

    return fallbacks;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.errorLog.forEach((error) => {
      const key = `${error.type}_${error.code}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Private methods

  private logError(error: AuthError): void {
    this.errorLog.push(error);

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth Error:', error);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  private determineSeverity(
    type: AuthErrorType,
    code: string
  ): AuthErrorSeverity {
    // Critical errors
    if (type === AuthErrorType.SERVER || code.includes('critical')) {
      return AuthErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (type === AuthErrorType.PERMISSION || type === AuthErrorType.SESSION) {
      return AuthErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (
      type === AuthErrorType.OAUTH_PROVIDER ||
      type === AuthErrorType.NETWORK
    ) {
      return AuthErrorSeverity.MEDIUM;
    }

    return AuthErrorSeverity.LOW;
  }

  private isRetryable(type: AuthErrorType, code: string): boolean {
    const nonRetryable = [
      'oauth_cancelled',
      'permission_denied',
      'role_required',
    ];

    return !nonRetryable.includes(code) && type !== AuthErrorType.PERMISSION;
  }

  private hasFallback(type: AuthErrorType, _code: string): boolean {
    return (
      type === AuthErrorType.OAUTH_PROVIDER || type === AuthErrorType.NETWORK
    );
  }

  private getToastDuration(severity: AuthErrorSeverity): number {
    switch (severity) {
      case AuthErrorSeverity.LOW:
        return 3000;
      case AuthErrorSeverity.MEDIUM:
        return 5000;
      case AuthErrorSeverity.HIGH:
        return 8000;
      case AuthErrorSeverity.CRITICAL:
        return 10_000;
      default:
        return 5000;
    }
  }

  private async sendToMonitoring(error: AuthError): Promise<void> {
    try {
      // Send to monitoring service (implement based on your monitoring setup)
      // Example: Sentry, LogRocket, DataDog, etc.
      console.log('Sending error to monitoring:', error);
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }
}

// Export singleton instance
export const authErrorHandler = new AuthErrorHandler();

// Export utility functions
export function handleAuthError(error: any, type?: AuthErrorType): AuthError {
  if (type) {
    return authErrorHandler.createError(type, 'unknown_error', error);
  }

  // Auto-detect error type
  if (error?.message?.includes('oauth') || error?.message?.includes('google')) {
    return authErrorHandler.handleOAuthError(error);
  }

  if (!navigator.onLine || error?.code === 'NETWORK_ERROR') {
    return authErrorHandler.handleNetworkError(error);
  }

  if (
    error?.message?.includes('session') ||
    error?.message?.includes('token')
  ) {
    return authErrorHandler.handleSessionError(error);
  }

  return authErrorHandler.createError(
    AuthErrorType.UNKNOWN,
    'unknown_error',
    error
  );
}

export function displayAuthError(error: any, type?: AuthErrorType): void {
  const authError = handleAuthError(error, type);
  authErrorHandler.displayError(authError);
}

export function withRetry<T>(
  operation: () => Promise<T>,
  type: AuthErrorType = AuthErrorType.UNKNOWN
): Promise<T> {
  return authErrorHandler.retry(operation, type);
}

export type { AuthError };
