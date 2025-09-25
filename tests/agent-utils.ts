/**
 * Agent Utility Functions
 * Simple utilities that @.claude/agents/code-review/ can use for validation
 * Following KISS and YAGNI principles
 */

/**
 * Basic code quality validation for agents
 */
export const validateCodeQuality = {
  /**
   * Check for console statements in code
   */
  hasConsoleStatements: (code: string): boolean => {
    return /console\.(log|warn|error|info|debug)/.test(code)
  },

  /**
   * Check for TODO/FIXME comments
   */
  hasTodoComments: (code: string): boolean => {
    return /\/\/\s*(TODO|FIXME|HACK|XXX)/.test(code)
  },

  /**
   * Check for TypeScript interface usage
   */
  hasInterfaces: (code: string): boolean => {
    return /interface\s+\w+/.test(code)
  },

  /**
   * Check for type annotations
   */
  hasTypeAnnotations: (code: string): boolean => {
    return /:\s*\w+/.test(code)
  },

  /**
   * Check function complexity (basic)
   */
  isFunctionComplex: (code: string): boolean => {
    const ifCount = (code.match(/if\s*\(/g) || []).length
    const lines = code.split('\n').length
    return ifCount > 3 || lines > 20
  }
}

/**
 * Security validation helpers for agents
 */
export const validateSecurity = {
  /**
   * Check for potential XSS vulnerabilities
   */
  hasXssVulnerability: (code: string): boolean => {
    return /innerHTML\s*=/.test(code)
  },

  /**
   * Check for eval usage
   */
  hasEvalUsage: (code: string): boolean => {
    return /eval\s*\(/.test(code)
  },

  /**
   * Check for hardcoded secrets
   */
  hasHardcodedSecrets: (code: string): boolean => {
    return /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"][^'"]+['"]/.test(code)
  },

  /**
   * Check for SQL injection patterns
   */
  hasSqlInjection: (code: string): boolean => {
    return /\+\s*['"].*\$\{.*\}.*['"]/.test(code) || /SELECT.*FROM.*WHERE.*\+/.test(code)
  },

  /**
   * Check for path traversal vulnerabilities
   */
  hasPathTraversal: (code: string): boolean => {
    return /\+\s*(filename|filepath|path)/.test(code) && /fs\.(readFile|writeFile)/.test(code)
  }
}

/**
 * Healthcare domain specific validation
 */
export const validateHealthcare = {
  /**
   * Check for patient data handling
   */
  hasPatientData: (code: string): boolean => {
    return /(patient|medical|healthcare|clinical)/i.test(code) && /interface\s+Patient/.test(code)
  },

  /**
   * Check for authentication patterns
   */
  hasAuthentication: (code: string): boolean => {
    return /(authenticate|login|signin|auth)/.test(code)
  },

  /**
   * Check for sensitive data handling
   */
  hasSensitiveData: (code: string): boolean => {
    return /(sensitiveData|medicalRecord|patientData|healthData)/.test(code)
  }
}

/**
 * Performance validation helpers
 */
export const validatePerformance = {
  /**
   * Check for potential memory leaks
   */
  hasMemoryLeaks: (code: string): boolean => {
    return /addEventListener/.test(code) && !/removeEventListener/.test(code)
  },

  /**
   * Check for inefficient loops
   */
  hasInefficientLoops: (code: string): boolean => {
    return /for\s*\(.*;.*;.*\)/.test(code) && /\.push\(/.test(code)
  },

  /**
   * Check for large functions
   */
  hasLargeFunctions: (code: string): boolean => {
    const lines = code.split('\n')
    return lines.length > 30
  }
}

/**
 * Import and export analysis
 */
export const validateImports = {
  /**
   * Check for React imports
   */
  hasReactImports: (code: string): boolean => {
    return /import\s+.*\breact\b/i.test(code)
  },

  /**
   * Check for relative imports
   */
  hasRelativeImports: (code: string): boolean => {
    return /import\s+.*\.\//.test(code)
  },

  /**
   * Check for named exports
   */
  hasNamedExports: (code: string): boolean => {
    return /export\s+(const|function|class)/.test(code)
  },

  /**
   * Check for default exports
   */
  hasDefaultExports: (code: string): boolean => {
    return /export\s+default/.test(code)
  }
}

/**
 * Basic file analysis utilities
 */
export const analyzeFile = {
  /**
   * Get basic file statistics
   */
  getStats: (code: string) => {
    const lines = code.split('\n')
    const words = code.split(/\s+/).filter(word => word.length > 0)
    const functions = (code.match(/function\s+\w+/g) || []).length
    const classes = (code.match(/class\s+\w+/g) || []).length
    const interfaces = (code.match(/interface\s+\w+/g) || []).length
    
    return {
      lineCount: lines.length,
      wordCount: words.length,
      functionCount: functions,
      classCount: classes,
      interfaceCount: interfaces,
      complexity: functions + classes * 2 + interfaces
    }
  },

  /**
   * Simple code quality score (0-100)
   */
  getQualityScore: (code: string): number => {
    const stats = analyzeFile.getStats(code)
    let score = 100

    // Deduct for complexity
    if (stats.complexity > 10) score -= 10
    if (stats.complexity > 20) score -= 10

    // Deduct for console statements
    if (validateCodeQuality.hasConsoleStatements(code)) score -= 15

    // Deduct for TODO comments
    if (validateCodeQuality.hasTodoComments(code)) score -= 10

    // Deduct for security issues
    if (validateSecurity.hasXssVulnerability(code)) score -= 20
    if (validateSecurity.hasEvalUsage(code)) score -= 25
    if (validateSecurity.hasHardcodedSecrets(code)) score -= 30

    // Deduct for performance issues
    if (validatePerformance.hasMemoryLeaks(code)) score -= 15
    if (validatePerformance.hasInefficientLoops(code)) score -= 10

    return Math.max(0, score)
  },

  /**
   * Get recommendations for improvement
   */
  getRecommendations: (code: string): string[] => {
    const recommendations: string[] = []

    if (validateCodeQuality.hasConsoleStatements(code)) {
      recommendations.push('Remove console.log statements from production code')
    }

    if (validateCodeQuality.hasTodoComments(code)) {
      recommendations.push('Address TODO and FIXME comments')
    }

    if (validateSecurity.hasXssVulnerability(code)) {
      recommendations.push('Replace innerHTML with textContent to prevent XSS')
    }

    if (validateSecurity.hasEvalUsage(code)) {
      recommendations.push('Avoid using eval() - use safer alternatives')
    }

    if (validateSecurity.hasHardcodedSecrets(code)) {
      recommendations.push('Move hardcoded secrets to environment variables')
    }

    if (validatePerformance.hasMemoryLeaks(code)) {
      recommendations.push('Add event listener cleanup to prevent memory leaks')
    }

    if (validateCodeQuality.isFunctionComplex(code)) {
      recommendations.push('Consider breaking down complex functions')
    }

    return recommendations
  }
}

/**
 * Complete validation report for agents
 */
export const validateFile = (code: string, filename?: string) => {
  const stats = analyzeFile.getStats(code)
  const qualityScore = analyzeFile.getQualityScore(code)
  const recommendations = analyzeFile.getRecommendations(code)

  return {
    filename: filename || 'unknown',
    stats,
    qualityScore,
    recommendations,
    validation: {
      codeQuality: validateCodeQuality,
      security: validateSecurity,
      healthcare: validateHealthcare,
      performance: validatePerformance,
      imports: validateImports
    },
    summary: {
      totalIssues: recommendations.length,
      criticalIssues: recommendations.filter(r => 
        r.includes('XSS') || r.includes('eval') || r.includes('secrets')
      ).length,
      warningIssues: recommendations.filter(r => 
        !r.includes('XSS') && !r.includes('eval') && !r.includes('secrets')
      ).length
    }
  }
}