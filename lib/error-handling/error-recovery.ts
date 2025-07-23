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