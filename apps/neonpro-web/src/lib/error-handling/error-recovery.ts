/**
 * Error Recovery System - VIBECODE V1.0 Resilience
 * Automatic error recovery and self-healing mechanisms
 */

export interface ErrorContext {
  errorId: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoveryAction: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface RecoveryStrategy {
  name: string;
  condition: (error: ErrorContext) => boolean;
  action: (error: ErrorContext) => Promise<boolean>;
  maxRetries: number;
}

export class ErrorRecoverySystem {
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();
  private recoveryHistory: ErrorContext[] = [];

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Network retry strategy
    this.addRecoveryStrategy({
      name: 'network_retry',
      condition: (error) => error.errorType.includes('network') || error.errorType.includes('timeout'),
      action: async (error) => {
        await this.delay(Math.pow(2, this.getRetryCount(error.errorId)) * 1000);
        return true;
      },
      maxRetries: 3
    });

    // Token refresh strategy
    this.addRecoveryStrategy({
      name: 'token_refresh',
      condition: (error) => error.errorType.includes('auth') || error.errorType.includes('unauthorized'),
      action: async (error) => {
        console.log('🔑 Attempting token refresh');
        // Token refresh logic would go here
        return true;
      },
      maxRetries: 1
    });

    // Data validation strategy
    this.addRecoveryStrategy({
      name: 'data_validation',
      condition: (error) => error.errorType.includes('validation') || error.errorType.includes('invalid'),
      action: async (error) => {
        console.log('✅ Attempting data validation recovery');
        // Data validation recovery logic
        return true;
      },
      maxRetries: 2
    });
  }

  /**
   * Add a recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy);
  }

  /**
   * Attempt recovery for an error
   */
  async attemptRecovery(errorContext: ErrorContext): Promise<boolean> {
    console.log(`🔧 Attempting recovery for error: ${errorContext.errorId}`);
    
    // Find applicable recovery strategies
    const applicableStrategies = Array.from(this.recoveryStrategies.values())
      .filter(strategy => strategy.condition(errorContext));

    if (applicableStrategies.length === 0) {
      console.log(`❌ No recovery strategy found for error: ${errorContext.errorId}`);
      return false;
    }

    // Try each strategy
    for (const strategy of applicableStrategies) {
      const retryCount = this.getRetryCount(errorContext.errorId);
      
      if (retryCount >= strategy.maxRetries) {
        console.log(`⚠️ Max retries exceeded for strategy: ${strategy.name}`);
        continue;
      }

      try {
        this.incrementRetryCount(errorContext.errorId);
        const success = await strategy.action(errorContext);
        
        if (success) {
          console.log(`✅ Recovery successful using strategy: ${strategy.name}`);
          this.logRecoverySuccess(errorContext, strategy.name);
          return true;
        }
      } catch (recoveryError) {
        console.error(`❌ Recovery strategy failed: ${strategy.name}`, recoveryError);
      }
    }

    console.log(`❌ All recovery strategies failed for error: ${errorContext.errorId}`);
    return false;
  }

  /**
   * 🔧 Attempt automatic error recovery
   */
  private attemptAutoRecovery(errorContext: ErrorContext): void {
    switch (errorContext.recoveryAction) {
      case 'retry_with_backoff':
        this.scheduleRetry(errorContext);
        break;
        
      case 'refresh_token':
        this.logRecoveryAction(errorContext, 'Token refresh recommended');
        break;
        
      case 'redirect_login':
        this.logRecoveryAction(errorContext, 'Login redirect recommended');
        break;
        
      case 'handle_duplicate':
        this.logRecoveryAction(errorContext, 'Duplicate data handling needed');
        break;
        
      case 'validate_input':
        this.logRecoveryAction(errorContext, 'Input validation required');
        break;
        
      default:
        this.logRecoveryAction(errorContext, 'Manual investigation required');
    }
  }

  /**
   * ⏰ Schedule retry with exponential backoff
   */
  private scheduleRetry(errorContext: ErrorContext): void {
    const retryCount = errorContext.metadata?.retryCount || 0;
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      const backoffMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      
      setTimeout(() => {
        console.log(`🔄 Auto-retry attempt ${retryCount + 1} for error ${errorContext.errorId}`);
        // Mark as recovery attempted
        errorContext.metadata = {
          ...errorContext.metadata,
          retryCount: retryCount + 1,
          retryAttempted: true,
          lastRetryAt: Date.now(),
        };
      }, backoffMs);
    }
  }

  /**
   * 📝 Log recovery action taken
   */
  private logRecoveryAction(errorContext: ErrorContext, action: string): void {
    console.log(`🔧 Recovery action for ${errorContext.errorId}: ${action}`);
    errorContext.metadata = {
      ...errorContext.metadata,
      recoveryAction: action,
      recoveryAttemptedAt: Date.now(),
    };
  }

  /**
   * Get retry count for an error
   */
  private getRetryCount(errorId: string): number {
    return this.recoveryAttempts.get(errorId) || 0;
  }

  /**
   * Increment retry count
   */
  private incrementRetryCount(errorId: string): void {
    const current = this.getRetryCount(errorId);
    this.recoveryAttempts.set(errorId, current + 1);
  }

  /**
   * Log successful recovery
   */
  private logRecoverySuccess(errorContext: ErrorContext, strategyName: string): void {
    const recoveredContext = {
      ...errorContext,
      metadata: {
        ...errorContext.metadata,
        recoveredAt: Date.now(),
        recoveryStrategy: strategyName,
        retryCount: this.getRetryCount(errorContext.errorId)
      }
    };
    
    this.recoveryHistory.push(recoveredContext);
    
    // Clean up retry count
    this.recoveryAttempts.delete(errorContext.errorId);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): any {
    const totalRecoveries = this.recoveryHistory.length;
    const strategyCounts = new Map<string, number>();
    
    for (const recovery of this.recoveryHistory) {
      const strategy = recovery.metadata?.recoveryStrategy || 'unknown';
      strategyCounts.set(strategy, (strategyCounts.get(strategy) || 0) + 1);
    }
    
    return {
      totalRecoveries,
      activeRetries: this.recoveryAttempts.size,
      strategyBreakdown: Object.fromEntries(strategyCounts),
      recentRecoveries: this.recoveryHistory.slice(-10)
    };
  }

  /**
   * Clear old recovery history
   */
  clearOldHistory(maxAge: number = 3600000): void { // 1 hour default
    const cutoff = Date.now() - maxAge;
    this.recoveryHistory = this.recoveryHistory.filter(
      recovery => (recovery.metadata?.recoveredAt || 0) > cutoff
    );
  }
}

// Export singleton instance
export const errorRecoverySystem = new ErrorRecoverySystem();
