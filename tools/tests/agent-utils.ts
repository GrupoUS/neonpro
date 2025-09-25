/**
 * Agent Utility Functions with MCP Integration
 * Simple utilities that @.claude/agents/code-review/ can use for validation
 * Following KISS and YAGNI principles
 */

/**
 * MCP Tool Integration for advanced agent capabilities
 */
export const mcpTools = {
  /**
   * Sequential thinking tool for complex problem analysis
   */
  sequentialThinking: async (problem: string): Promise<string> => {
    console.log('🧠 Using sequential thinking MCP tool for:', problem)
    // This would integrate with the actual MCP tool
    return `Sequential analysis completed for: ${problem}`
  },

  /**
   * Archon task management integration
   */
  archonTaskManagement: {
    createTask: async (title: string, description: string) => {
      console.log('📋 Creating Archon task:', title)
      // This would integrate with the actual Archon MCP tool
      return { id: `task-${Date.now()}`, title, status: 'created' }
    },
    
    updateTask: async (taskId: string, status: string) => {
      console.log('📝 Updating Archon task:', taskId, 'to', status)
      // This would integrate with the actual Archon MCP tool
      return { id: taskId, status, updatedAt: new Date().toISOString() }
    },
    
    searchTasks: async (query: string) => {
      console.log('🔍 Searching Archon tasks:', query)
      // This would integrate with the actual Archon MCP tool
      return [{ id: 'sample-task', title: 'Sample Task', status: 'todo' }]
    }
  },

  /**
   * Serena codebase analysis integration
   */
  serenaAnalysis: {
    findSymbol: async (symbolPath: string, filePath?: string) => {
      console.log('🔍 Finding symbol with Serena:', symbolPath)
      // This would integrate with the actual Serena MCP tool
      return { name: symbolPath, location: filePath || 'unknown' }
    },
    
    searchForPattern: async (pattern: string, _options?: any) => {
      console.log('🔍 Searching pattern with Serena:', pattern)
      // This would integrate with the actual Serena MCP tool
      return [{ file: 'sample.ts', matches: [pattern] }]
    },
    
    getSymbolsOverview: async (filePath: string) => {
      console.log('📊 Getting symbols overview with Serena:', filePath)
      // This would integrate with the actual Serena MCP tool
      return { symbols: [], imports: [], exports: [] }
    }
  },

  /**
   * Context7 documentation integration
   */
  context7Docs: {
    resolveLibrary: async (libraryName: string) => {
      console.log('📚 Resolving library with Context7:', libraryName)
      // This would integrate with the actual Context7 MCP tool
      return { id: `/org/${libraryName}`, name: libraryName }
    },
    
    getLibraryDocs: async (libraryId: string, topic?: string) => {
      console.log('📖 Getting library docs with Context7:', libraryId)
      // This would integrate with the actual Context7 MCP tool
      return { content: `Documentation for ${libraryId}`, topic }
    }
  },

  /**
   * Desktop Commander integration for file operations
   */
  desktopCommander: {
    readFile: async (filePath: string) => {
      console.log('📄 Reading file with Desktop Commander:', filePath)
      // This would integrate with the actual Desktop Commander MCP tool
      return { content: `Content of ${filePath}`, path: filePath }
    },
    
    writeFile: async (filePath: string, content: string) => {
      console.log('✍️  Writing file with Desktop Commander:', filePath)
      // This would integrate with the actual Desktop Commander MCP tool
      return { success: true, path: filePath }
    },
    
    listDirectory: async (dirPath: string) => {
      console.log('📁 Listing directory with Desktop Commander:', dirPath)
      // This would integrate with the actual Desktop Commander MCP tool
      return { files: ['file1.ts', 'file2.ts'], directories: ['dir1', 'dir2'] }
    }
  }
}

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
 * Complete validation report for agents with MCP integration
 */
export const validateFile = async (code: string, filename?: string, useMcp: boolean = false) => {
  const stats = analyzeFile.getStats(code)
  const qualityScore = analyzeFile.getQualityScore(code)
  const recommendations = analyzeFile.getRecommendations(code)

  // Enhanced validation with MCP tools if enabled
  let mcpResults: any = null
  if (useMcp) {
    try {
      // Use MCP tools for deeper analysis
      const patternSearch = await mcpTools.serenaAnalysis.searchForPattern('function.*\\(', { limit: 10 })
      const symbolsOverview = filename ? await mcpTools.serenaAnalysis.getSymbolsOverview(filename) : null
      
      mcpResults = {
        patternSearch,
        symbolsOverview,
        mcpEnabled: true
      }
    } catch (error) {
      console.warn('MCP integration failed, falling back to basic validation:', error)
      mcpResults = { mcpEnabled: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  return {
    filename: filename || 'unknown',
    stats,
    qualityScore,
    recommendations,
    mcpResults,
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
    },
    timestamp: new Date().toISOString(),
    version: '2.0.0-mcp'
  }
}

/**
 * Enhanced agent validation with MCP-powered analysis
 */
export const validateWithMcp = async (code: string, filename?: string) => {
  console.log('🤖 Starting MCP-powered validation for:', filename || 'unknown')
  
  try {
    // Use sequential thinking for complex analysis
    const analysis = await mcpTools.sequentialThinking(`Analyze code quality and security for ${filename || 'unknown file'}`)
    
    // Perform basic validation
    const basicResults = validateFile(code, filename)
    
    // Use Archon for task management if issues found
    const results = await basicResults
    if (results.summary.totalIssues > 0) {
      await mcpTools.archonTaskManagement.createTask(
        `Fix issues in ${filename || 'unknown file'}`,
        `Found ${(await basicResults).summary.totalIssues} issues requiring attention`
      )
    }
    
    // Use Serena for deeper code analysis
    const complexFunctions = await mcpTools.serenaAnalysis.searchForPattern('function.*\\{[\\s\\S]*?\\}', { limit: 5 })
    
    return {
      ...basicResults,
      mcpAnalysis: analysis,
      complexFunctionsFound: complexFunctions.length,
      enhanced: true
    }
  } catch (error) {
    console.error('MCP validation failed, falling back to basic:', error)
    return validateFile(code, filename)
  }
}

/**
 * Agent workflow orchestration with MCP
 */
export const agentWorkflow = {
  /**
   * Complete code review workflow
   */
  codeReview: async (filePath: string) => {
    console.log('🔍 Starting code review workflow for:', filePath)
    
    try {
      // Read file using Desktop Commander
      const fileContent = await mcpTools.desktopCommander.readFile(filePath)
      
      // Validate with MCP integration
      const validation = await validateWithMcp(fileContent.content, filePath)
      
      // Create task if issues found
      if (validation.summary.totalIssues > 0) {
        await mcpTools.archonTaskManagement.createTask(
          `Review and fix: ${filePath}`,
          `Found ${validation.summary.totalIssues} issues in ${filePath}`
        )
      }
      
      return {
        success: true,
        validation,
        filePath,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Code review workflow failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath,
        timestamp: new Date().toISOString()
      }
    }
  },
  
  /**
   * Healthcare compliance workflow
   */
  healthcareCompliance: async (filePath: string) => {
    console.log('🏥 Starting healthcare compliance workflow for:', filePath)
    
    try {
      const fileContent = await mcpTools.desktopCommander.readFile(filePath)
      const validation = await validateWithMcp(fileContent.content, filePath)
      
      // Check for healthcare-specific compliance
      const healthcareIssues = [
        ...(validateSecurity.hasHardcodedSecrets(fileContent.content) ? ['Hardcoded secrets found'] : []),
        ...(validateHealthcare.hasSensitiveData(fileContent.content) ? ['Sensitive patient data detected'] : []),
        ...(validateSecurity.hasXssVulnerability(fileContent.content) ? ['XSS vulnerability in healthcare UI'] : [])
      ]
      
      return {
        success: true,
        healthcareIssues,
        validation,
        compliant: healthcareIssues.length === 0,
        filePath,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Healthcare compliance workflow failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath,
        timestamp: new Date().toISOString()
      }
    }
  }
}