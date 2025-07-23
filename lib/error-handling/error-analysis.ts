  /**
   * 🔍 Analyze error to determine category, severity and recovery action
   */
  private analyzeError(message: string, stack?: string): {
    category: ErrorContext['category'];
    severity: ErrorContext['severity'];
    recoveryAction: string;
  } {
    const fullText = `${message} ${stack || ''}`;
    
    // Check against known patterns
    for (const pattern of KNOWN_ERROR_PATTERNS) {
      if (pattern.pattern.test(fullText)) {
        // Track pattern frequency
        const patternKey = pattern.description;
        const currentCount = errorPatternsCache.get(patternKey) || 0;
        errorPatternsCache.set(patternKey, currentCount + 1);
        
        return {
          category: pattern.category,
          severity: pattern.severity,
          recoveryAction: pattern.recoveryAction,
        };
      }
    }

    // Default fallback analysis
    let category: ErrorContext['category'] = 'unknown';
    let severity: ErrorContext['severity'] = 'medium';
    
    // Basic categorization based on keywords
    if (/database|sql|query|connection/i.test(fullText)) {
      category = 'database';
    } else if (/auth|token|session|login/i.test(fullText)) {
      category = 'auth';
    } else if (/api|fetch|request|response/i.test(fullText)) {
      category = 'api';
    } else if (/validation|invalid|required/i.test(fullText)) {
      category = 'validation';
      severity = 'low';
    } else if (/network|timeout|refused/i.test(fullText)) {
      category = 'network';
    }

    return {
      category,
      severity,
      recoveryAction: 'log_and_monitor',
    };
  }

  /**
   * 🆔 Generate unique error ID for deduplication
   */
  private generateErrorId(message: string, route?: string): string {
    const baseString = `${message}_${route || 'unknown'}`;
    // Simple hash function for error ID
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `err_${Math.abs(hash).toString(36)}_${Date.now()}`;
  }