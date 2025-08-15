/**
 * Comprehensive OAuth Error Handler
 * Handles all OAuth-related errors with proper user feedback and recovery mechanisms
 */

import { AuthError } from '@supabase/supabase-js';
import { enhancedSessionManager } from './enhanced-session-manager';
import { performanceTracker } from './performance-tracker';

export interface OAuthErrorContext {
  provider: 'google' | 'email';
  operation: 'signin' | 'signup' | 'refresh' | 'revoke';
  sessionId?: string;
  userId?: string;
  userAgent: string;
  ipAddress: string;
  timestamp: number;
}

export interface ErrorRecoveryAction {
  type: 'retry' | 'redirect' | 'manual' | 'contact_support';
  message: string;
  action?: () => void;
  retryDelay?: number;
  maxRetries?: number;
}

export interface OAuthErrorDetails {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryAction: ErrorRecoveryAction;
  shouldLog: boolean;
  shouldNotifyUser: boolean;
}

class OAuthErrorHandler {
  private static instance: OAuthErrorHandler;
  private readonly retryAttempts: Map<string, number> = new Map();
  private readonly errorCounts: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): OAuthErrorHandler {
    if (!OAuthErrorHandler.instance) {
      OAuthErrorHandler.instance = new OAuthErrorHandler();
    }
    return OAuthErrorHandler.instance;
  }

  /**
   * Main error handling method
   */
  async handleOAuthError(
    error: Error | AuthError | any,
    context: OAuthErrorContext
  ): Promise<OAuthErrorDetails> {
    const startTime = Date.now();

    try {
      // Classify the error
      const errorDetails = this.classifyError(error, context);

      // Log error if required
      if (errorDetails.shouldLog) {
        await this.logError(error, context, errorDetails);
      }

      // Track error metrics
      this.trackErrorMetrics(errorDetails.code, context);

      // Handle specific error recovery
      await this.executeRecoveryAction(errorDetails, context);

      performanceTracker.recordMetric(
        'oauth_error_handling',
        Date.now() - startTime
      );
      return errorDetails;
    } catch (handlingError) {
      console.error('Error handler failed:', handlingError);
      return this.getFallbackErrorDetails();
    }
  }

  /**
   * Classify OAuth errors into specific categories
   */
  private classifyError(
    error: any,
    context: OAuthErrorContext
  ): OAuthErrorDetails {
    const errorMessage =
      error?.message || error?.error_description || 'Unknown error';
    const errorCode = error?.error || error?.code || 'unknown_error';

    // Google OAuth specific errors
    if (context.provider === 'google') {
      return this.classifyGoogleOAuthError(errorCode, errorMessage, context);
    }

    // Supabase Auth errors
    if (error instanceof AuthError) {
      return this.classifySupabaseAuthError(error, context);
    }

    // Network and connectivity errors
    if (this.isNetworkError(error)) {
      return this.getNetworkErrorDetails(error, context);
    }

    // Session and token errors
    if (this.isSessionError(errorCode, errorMessage)) {
      return this.getSessionErrorDetails(errorCode, errorMessage, context);
    }

    // Default error handling
    return this.getGenericErrorDetails(errorCode, errorMessage, context);
  }

  /**
   * Handle Google OAuth specific errors
   */
  private classifyGoogleOAuthError(
    code: string,
    message: string,
    context: OAuthErrorContext
  ): OAuthErrorDetails {
    switch (code) {
      case 'access_denied':
        return {
          code: 'google_access_denied',
          message: 'User denied Google OAuth access',
          userMessage:
            'Acesso negado. Para continuar, você precisa autorizar o acesso à sua conta Google.',
          severity: 'medium',
          recoveryAction: {
            type: 'retry',
            message: 'Tentar novamente',
            retryDelay: 1000,
            maxRetries: 3,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'invalid_request':
        return {
          code: 'google_invalid_request',
          message: 'Invalid OAuth request parameters',
          userMessage: 'Erro na solicitação de autenticação. Tente novamente.',
          severity: 'high',
          recoveryAction: {
            type: 'retry',
            message: 'Tentar novamente',
            retryDelay: 2000,
            maxRetries: 2,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'invalid_client':
        return {
          code: 'google_invalid_client',
          message: 'Invalid OAuth client configuration',
          userMessage: 'Erro de configuração. Entre em contato com o suporte.',
          severity: 'critical',
          recoveryAction: {
            type: 'contact_support',
            message: 'Entrar em contato com suporte',
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'invalid_grant':
        return {
          code: 'google_invalid_grant',
          message: 'Invalid or expired authorization grant',
          userMessage: 'Sessão expirada. Faça login novamente.',
          severity: 'medium',
          recoveryAction: {
            type: 'redirect',
            message: 'Fazer login novamente',
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'temporarily_unavailable':
        return {
          code: 'google_temporarily_unavailable',
          message: 'Google OAuth service temporarily unavailable',
          userMessage:
            'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
          severity: 'medium',
          recoveryAction: {
            type: 'retry',
            message: 'Tentar novamente',
            retryDelay: 30_000,
            maxRetries: 3,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      default:
        return this.getGenericGoogleErrorDetails(code, message, context);
    }
  }

  /**
   * Handle Supabase Auth errors
   */
  private classifySupabaseAuthError(
    error: AuthError,
    _context: OAuthErrorContext
  ): OAuthErrorDetails {
    switch (error.message) {
      case 'Invalid login credentials':
        return {
          code: 'supabase_invalid_credentials',
          message: error.message,
          userMessage: 'Credenciais inválidas. Verifique seu email e senha.',
          severity: 'medium',
          recoveryAction: {
            type: 'manual',
            message: 'Verificar credenciais',
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'Email not confirmed':
        return {
          code: 'supabase_email_not_confirmed',
          message: error.message,
          userMessage: 'Email não confirmado. Verifique sua caixa de entrada.',
          severity: 'medium',
          recoveryAction: {
            type: 'manual',
            message: 'Confirmar email',
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      case 'Too many requests':
        return {
          code: 'supabase_rate_limit',
          message: error.message,
          userMessage:
            'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
          severity: 'medium',
          recoveryAction: {
            type: 'retry',
            message: 'Tentar novamente',
            retryDelay: 60_000,
            maxRetries: 1,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };

      default:
        return {
          code: 'supabase_auth_error',
          message: error.message,
          userMessage: 'Erro de autenticação. Tente novamente.',
          severity: 'medium',
          recoveryAction: {
            type: 'retry',
            message: 'Tentar novamente',
            retryDelay: 2000,
            maxRetries: 2,
          },
          shouldLog: true,
          shouldNotifyUser: true,
        };
    }
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'CONNECTION_REFUSED',
      'DNS_ERROR',
      'OFFLINE',
    ];

    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toUpperCase() || '';

    return (
      networkErrorCodes.includes(errorCode) ||
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('offline') ||
      error?.name === 'NetworkError'
    );
  }

  /**
   * Check if error is session-related
   */
  private isSessionError(code: string, message: string): boolean {
    const sessionErrorPatterns = [
      'session',
      'token',
      'expired',
      'invalid_token',
      'unauthorized',
      'forbidden',
    ];

    const lowerMessage = message.toLowerCase();
    const lowerCode = code.toLowerCase();

    return sessionErrorPatterns.some(
      (pattern) => lowerMessage.includes(pattern) || lowerCode.includes(pattern)
    );
  }

  /**
   * Get network error details
   */
  private getNetworkErrorDetails(
    error: any,
    _context: OAuthErrorContext
  ): OAuthErrorDetails {
    return {
      code: 'network_error',
      message: error.message || 'Network connectivity error',
      userMessage:
        'Problema de conexão. Verifique sua internet e tente novamente.',
      severity: 'medium',
      recoveryAction: {
        type: 'retry',
        message: 'Tentar novamente',
        retryDelay: 3000,
        maxRetries: 3,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  }

  /**
   * Get session error details
   */
  private getSessionErrorDetails(
    _code: string,
    message: string,
    _context: OAuthErrorContext
  ): OAuthErrorDetails {
    return {
      code: 'session_error',
      message: `Session error: ${message}`,
      userMessage: 'Sessão expirada. Faça login novamente.',
      severity: 'medium',
      recoveryAction: {
        type: 'redirect',
        message: 'Fazer login novamente',
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  }

  /**
   * Get generic Google error details
   */
  private getGenericGoogleErrorDetails(
    code: string,
    message: string,
    _context: OAuthErrorContext
  ): OAuthErrorDetails {
    return {
      code: `google_${code}`,
      message: `Google OAuth error: ${message}`,
      userMessage: 'Erro na autenticação com Google. Tente novamente.',
      severity: 'medium',
      recoveryAction: {
        type: 'retry',
        message: 'Tentar novamente',
        retryDelay: 2000,
        maxRetries: 2,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  }

  /**
   * Get generic error details
   */
  private getGenericErrorDetails(
    code: string,
    message: string,
    _context: OAuthErrorContext
  ): OAuthErrorDetails {
    return {
      code: code || 'unknown_error',
      message: message || 'Unknown authentication error',
      userMessage: 'Erro de autenticação. Tente novamente.',
      severity: 'medium',
      recoveryAction: {
        type: 'retry',
        message: 'Tentar novamente',
        retryDelay: 2000,
        maxRetries: 2,
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  }

  /**
   * Get fallback error details when error handler fails
   */
  private getFallbackErrorDetails(): OAuthErrorDetails {
    return {
      code: 'error_handler_failure',
      message: 'Error handler failed',
      userMessage: 'Erro interno. Entre em contato com o suporte.',
      severity: 'critical',
      recoveryAction: {
        type: 'contact_support',
        message: 'Entrar em contato com suporte',
      },
      shouldLog: true,
      shouldNotifyUser: true,
    };
  }

  /**
   * Execute recovery action based on error type
   */
  private async executeRecoveryAction(
    errorDetails: OAuthErrorDetails,
    context: OAuthErrorContext
  ): Promise<void> {
    const { recoveryAction } = errorDetails;

    switch (recoveryAction.type) {
      case 'retry':
        await this.handleRetryAction(errorDetails, context);
        break;

      case 'redirect':
        await this.handleRedirectAction(errorDetails, context);
        break;

      case 'manual':
        // Manual actions are handled by UI
        break;

      case 'contact_support':
        await this.handleSupportAction(errorDetails, context);
        break;
    }
  }

  /**
   * Handle retry action
   */
  private async handleRetryAction(
    errorDetails: OAuthErrorDetails,
    context: OAuthErrorContext
  ): Promise<void> {
    const retryKey = `${context.provider}_${context.operation}_${context.sessionId || 'anonymous'}`;
    const currentRetries = this.retryAttempts.get(retryKey) || 0;
    const maxRetries = errorDetails.recoveryAction.maxRetries || 3;

    if (currentRetries >= maxRetries) {
      // Max retries reached, escalate to support
      await this.handleSupportAction(errorDetails, context);
      return;
    }

    // Increment retry count
    this.retryAttempts.set(retryKey, currentRetries + 1);

    // Set retry delay
    const delay = errorDetails.recoveryAction.retryDelay || 2000;
    setTimeout(() => {
      // Emit retry event for UI to handle
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('oauth-retry', {
            detail: { errorDetails, context, attempt: currentRetries + 1 },
          })
        );
      }
    }, delay);
  }

  /**
   * Handle redirect action
   */
  private async handleRedirectAction(
    errorDetails: OAuthErrorDetails,
    context: OAuthErrorContext
  ): Promise<void> {
    // Clear session if exists
    if (context.sessionId) {
      await enhancedSessionManager.forceSessionTimeout(
        context.sessionId,
        'error_recovery_redirect'
      );
    }

    // Emit redirect event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('oauth-redirect', {
          detail: { errorDetails, context },
        })
      );
    }
  }

  /**
   * Handle support action
   */
  private async handleSupportAction(
    errorDetails: OAuthErrorDetails,
    context: OAuthErrorContext
  ): Promise<void> {
    // Log critical error for support team
    await this.logCriticalError(errorDetails, context);

    // Emit support event for UI to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('oauth-support-needed', {
          detail: { errorDetails, context },
        })
      );
    }
  }

  /**
   * Track error metrics
   */
  private trackErrorMetrics(
    errorCode: string,
    context: OAuthErrorContext
  ): void {
    const metricKey = `oauth_error_${errorCode}`;
    const currentCount = this.errorCounts.get(metricKey) || 0;
    this.errorCounts.set(metricKey, currentCount + 1);

    performanceTracker.recordMetric(metricKey, 1);
    performanceTracker.recordMetric(`oauth_error_${context.provider}`, 1);
    performanceTracker.recordMetric(`oauth_error_${context.operation}`, 1);
  }

  /**
   * Log error details
   */
  private async logError(
    error: any,
    context: OAuthErrorContext,
    errorDetails: OAuthErrorDetails
  ): Promise<void> {
    try {
      const logEntry = {
        error_code: errorDetails.code,
        error_message: errorDetails.message,
        user_message: errorDetails.userMessage,
        severity: errorDetails.severity,
        provider: context.provider,
        operation: context.operation,
        session_id: context.sessionId,
        user_id: context.userId,
        user_agent: context.userAgent,
        ip_address: context.ipAddress,
        timestamp: new Date(context.timestamp).toISOString(),
        stack_trace: error?.stack,
        recovery_action: errorDetails.recoveryAction.type,
      };

      // Use existing security audit framework
      await this.logToSecurityAudit(logEntry);
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  }

  /**
   * Log critical errors
   */
  private async logCriticalError(
    errorDetails: OAuthErrorDetails,
    context: OAuthErrorContext
  ): Promise<void> {
    try {
      const criticalLogEntry = {
        ...errorDetails,
        context,
        requires_immediate_attention: true,
        escalation_level: 'critical',
        timestamp: new Date().toISOString(),
      };

      await this.logToSecurityAudit(criticalLogEntry);
    } catch (logError) {
      console.error('Critical error logging failed:', logError);
    }
  }

  /**
   * Log to security audit system
   */
  private async logToSecurityAudit(logEntry: any): Promise<void> {
    // Implementation would integrate with existing security audit framework
    console.error('OAuth Error:', logEntry);
  }

  /**
   * Clear retry attempts for successful operations
   */
  clearRetryAttempts(
    provider: string,
    operation: string,
    sessionId?: string
  ): void {
    const retryKey = `${provider}_${operation}_${sessionId || 'anonymous'}`;
    this.retryAttempts.delete(retryKey);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
}

export const oauthErrorHandler = OAuthErrorHandler.getInstance();
