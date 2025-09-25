/**
 * AI Agents Health Monitoring Configuration
 * Healthcare-compliant health checks and monitoring for AI agents
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: HealthCheck[]
  overallScore: number
  recommendations: string[]
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  duration: number
  message: string
  details?: Record<string, any>
  critical: boolean
}

export interface AIAgentHealthMetrics {
  uptime: number
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
  errorRate: {
    total: number
    rate: number
    critical: number
  }
  usage: {
    totalRequests: number
    activeSessions: number
    tokensUsed: number
    cost: number
  }
  providers: {
    [key: string]: {
      status: 'online' | 'offline' | 'degraded'
      latency: number
      errorRate: number
      lastUsed: string
    }
  }
  rag: {
    vectorStoreSize: number
    retrievalAccuracy: number
    cacheHitRate: number
  }
}

export interface HealthAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  component: string
  message: string
  timestamp: string
  resolved: boolean
  actionRequired: boolean
}

// Health check thresholds
export const HEALTH_THRESHOLDS = {
  responseTime: {
    warning: 5000,  // 5 seconds
    critical: 10000, // 10 seconds
  },
  errorRate: {
    warning: 0.05,  // 5%
    critical: 0.10, // 10%
  },
  uptime: {
    warning: 0.95,  // 95%
    critical: 0.90, // 90%
  },
  tokenUsage: {
    warning: 1000000,  // 1M tokens
    critical: 2000000, // 2M tokens
  },
  cacheHitRate: {
    warning: 0.50,  // 50%
    critical: 0.30, // 30%
  },
} as const

// Health check configuration
export const HEALTH_CHECK_CONFIG = {
  enabled: true,
  interval: 30000, // 30 seconds
  timeout: 10000, // 10 seconds
  checks: [
    {
      name: 'agent_responsiveness',
      critical: true,
      timeout: 5000,
    },
    {
      name: 'provider_connectivity',
      critical: true,
      timeout: 3000,
    },
    {
      name: 'rag_functionality',
      critical: false,
      timeout: 10000,
    },
    {
      name: 'database_connectivity',
      critical: true,
      timeout: 3000,
    },
    {
      name: 'memory_usage',
      critical: false,
      timeout: 2000,
    },
    {
      name: 'compliance_validation',
      critical: true,
      timeout: 5000,
    },
  ],
  alerts: {
    critical: {
      enabled: true,
      channels: ['email', 'sms', 'slack'],
      escalationDelay: 300000, // 5 minutes
    },
    warning: {
      enabled: true,
      channels: ['email', 'slack'],
      escalationDelay: 600000, // 10 minutes
    },
    info: {
      enabled: true,
      channels: ['slack'],
      escalationDelay: 1800000, // 30 minutes
    },
  },
}

// Health monitoring service
export class AIAgentHealthMonitor {
  private checks: Map<string, (config: any) => Promise<HealthCheck>> = new Map()
  private alerts: HealthAlert[] = []
  private metrics: AIAgentHealthMetrics | null = null
  
  constructor() {
    this.initializeHealthChecks()
  }
  
  private initializeHealthChecks() {
    // Agent responsiveness check
    this.checks.set('agent_responsiveness', async (config) => {
      const start = Date.now()
      try {
        // Test agent responsiveness
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/ai/health`, {
          method: 'GET',
          timeout: 5000,
        })
        
        if (response.ok) {
          const data = await response.json()
          return {
            name: 'agent_responsiveness',
            status: 'pass',
            duration: Date.now() - start,
            message: 'Agent service is responsive',
            details: data,
            critical: true,
          }
        } else {
          return {
            name: 'agent_responsiveness',
            status: 'fail',
            duration: Date.now() - start,
            message: `Agent service returned ${response.status}`,
            critical: true,
          }
        }
      } catch (error) {
        return {
          name: 'agent_responsiveness',
          status: 'fail',
          duration: Date.now() - start,
          message: `Agent service unreachable: ${error}`,
          critical: true,
        }
      }
    })
    
    // Provider connectivity check
    this.checks.set('provider_connectivity', async (config) => {
      const start = Date.now()
      const providers = ['openai', 'anthropic', 'google']
      const results = await Promise.allSettled(
        providers.map(provider => this.testProviderConnectivity(provider))
      )
      
      const passed = results.filter(r => r.status === 'fulfilled').length
      const total = results.length
      
      return {
        name: 'provider_connectivity',
        status: passed === total ? 'pass' : passed > 0 ? 'warn' : 'fail',
        duration: Date.now() - start,
        message: `${passed}/${total} providers are reachable`,
        details: { providers, results },
        critical: true,
      }
    })
    
    // RAG functionality check
    this.checks.set('rag_functionality', async (config) => {
      const start = Date.now()
      try {
        // Test RAG functionality if enabled
        if (process.env.RAG_AGENT_ENABLED === 'false') {
          return {
            name: 'rag_functionality',
            status: 'pass',
            duration: Date.now() - start,
            message: 'RAG functionality is disabled',
            critical: false,
          }
        }
        
        // Perform a simple RAG test
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/ai/rag/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: 'test query' }),
          timeout: 10000,
        })
        
        if (response.ok) {
          return {
            name: 'rag_functionality',
            status: 'pass',
            duration: Date.now() - start,
            message: 'RAG functionality is working',
            critical: false,
          }
        } else {
          return {
            name: 'rag_functionality',
            status: 'warn',
            duration: Date.now() - start,
            message: `RAG functionality returned ${response.status}`,
            critical: false,
          }
        }
      } catch (error) {
        return {
          name: 'rag_functionality',
          status: 'warn',
          duration: Date.now() - start,
          message: `RAG functionality test failed: ${error}`,
          critical: false,
        }
      }
    })
    
    // Database connectivity check
    this.checks.set('database_connectivity', async (config) => {
      const start = Date.now()
      try {
        // Test database connectivity
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/ai/database/health`, {
          method: 'GET',
          timeout: 3000,
        })
        
        if (response.ok) {
          return {
            name: 'database_connectivity',
            status: 'pass',
            duration: Date.now() - start,
            message: 'Database is connected',
            critical: true,
          }
        } else {
          return {
            name: 'database_connectivity',
            status: 'fail',
            duration: Date.now() - start,
            message: `Database connectivity failed: ${response.status}`,
            critical: true,
          }
        }
      } catch (error) {
        return {
          name: 'database_connectivity',
          status: 'fail',
          duration: Date.now() - start,
          message: `Database is unreachable: ${error}`,
          critical: true,
        }
      }
    })
    
    // Memory usage check
    this.checks.set('memory_usage', async (config) => {
      const start = Date.now()
      try {
        // Check memory usage (if available)
        const memoryUsage = process.memoryUsage()
        const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
        const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
        const usagePercentage = (heapUsedMB / heapTotalMB) * 100
        
        let status: 'pass' | 'warn' | 'fail' = 'pass'
        if (usagePercentage > 90) status = 'fail'
        else if (usagePercentage > 75) status = 'warn'
        
        return {
          name: 'memory_usage',
          status,
          duration: Date.now() - start,
          message: `Memory usage: ${heapUsedMB}MB/${heapTotalMB}MB (${usagePercentage.toFixed(1)}%)`,
          details: { heapUsedMB, heapTotalMB, usagePercentage },
          critical: false,
        }
      } catch (error) {
        return {
          name: 'memory_usage',
          status: 'warn',
          duration: Date.now() - start,
          message: `Memory usage check failed: ${error}`,
          critical: false,
        }
      }
    })
    
    // Compliance validation check
    this.checks.set('compliance_validation', async (config) => {
      const start = Date.now()
      try {
        // Check compliance settings
        const requiredCompliance = [
          'AI_LGPD_COMPLIANCE',
          'AI_CONSENT_VALIDATION',
          'AI_AUDIT_LOGGING',
          'AI_DATA_ANONYMIZATION',
        ]
        
        const missing = requiredCompliance.filter(key => process.env[key] !== 'true')
        
        if (missing.length === 0) {
          return {
            name: 'compliance_validation',
            status: 'pass',
            duration: Date.now() - start,
            message: 'All compliance requirements are met',
            critical: true,
          }
        } else {
          return {
            name: 'compliance_validation',
            status: process.env.NODE_ENV === 'production' ? 'fail' : 'warn',
            duration: Date.now() - start,
            message: `Missing compliance settings: ${missing.join(', ')}`,
            critical: true,
          }
        }
      } catch (error) {
        return {
          name: 'compliance_validation',
          status: 'fail',
          duration: Date.now() - start,
          message: `Compliance validation failed: ${error}`,
          critical: true,
        }
      }
    })
  }
  
  private async testProviderConnectivity(provider: string): Promise<boolean> {
    // Simulate provider connectivity test
    // In a real implementation, this would test actual API connectivity
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1) // 90% success rate
      }, 100)
    })
  }
  
  async performHealthCheck(): Promise<HealthStatus> {
    const checks: HealthCheck[] = []
    const startTime = Date.now()
    
    for (const [name, checkFunction] of this.checks) {
      try {
        const result = await checkFunction(HEALTH_CHECK_CONFIG)
        checks.push(result)
      } catch (error) {
        checks.push({
          name,
          status: 'fail',
          duration: Date.now() - startTime,
          message: `Health check failed: ${error}`,
          critical: true,
        })
      }
    }
    
    // Calculate overall status
    const criticalFailures = checks.filter(c => c.critical && c.status === 'fail').length
    const allPassed = checks.every(c => c.status === 'pass')
    const warnings = checks.filter(c => c.status === 'warn').length
    
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (allPassed) {
      status = 'healthy'
    } else if (criticalFailures === 0) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    // Calculate overall score (0-100)
    const passedScore = checks.filter(c => c.status === 'pass').length * 100 / checks.length
    const warningScore = checks.filter(c => c.status === 'warn').length * 50 / checks.length
    const overallScore = Math.round(passedScore + warningScore)
    
    // Generate recommendations
    const recommendations: string[] = []
    if (criticalFailures > 0) {
      recommendations.push(`Address ${criticalFailures} critical failure(s) immediately`)
    }
    if (warnings > 0) {
      recommendations.push(`Review ${warnings} warning(s) for optimization`)
    }
    if (overallScore < 80) {
      recommendations.push('Overall system health needs attention')
    }
    
    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      checks,
      overallScore,
      recommendations,
    }
    
    // Generate alerts if needed
    await this.generateAlerts(healthStatus)
    
    return healthStatus
  }
  
  private async generateAlerts(healthStatus: HealthStatus): Promise<void> {
    const criticalChecks = healthStatus.checks.filter(c => c.critical && c.status === 'fail')
    const warningChecks = healthStatus.checks.filter(c => c.status === 'warn')
    
    // Generate critical alerts
    for (const check of criticalChecks) {
      const alert: HealthAlert = {
        id: `critical_${Date.now()}_${check.name}`,
        type: 'critical',
        component: check.name,
        message: `Critical failure: ${check.message}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        actionRequired: true,
      }
      
      this.alerts.push(alert)
      await this.sendAlert(alert)
    }
    
    // Generate warning alerts
    for (const check of warningChecks) {
      const alert: HealthAlert = {
        id: `warning_${Date.now()}_${check.name}`,
        type: 'warning',
        component: check.name,
        message: `Warning: ${check.message}`,
        timestamp: new Date().toISOString(),
        resolved: false,
        actionRequired: false,
      }
      
      this.alerts.push(alert)
      await this.sendAlert(alert)
    }
  }
  
  private async sendAlert(alert: HealthAlert): Promise<void> {
    // In a real implementation, this would send alerts via email, SMS, Slack, etc.
    console.log(`ALERT [${alert.type.toUpperCase()}]: ${alert.message}`)
    
    // For healthcare compliance, log all alerts
    if (process.env.AI_AUDIT_LOGGING === 'true') {
      // Log to audit system
      console.log(`AUDIT: Health alert generated - ${alert.id}`)
    }
  }
  
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }
  
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }
  
  async getMetrics(): Promise<AIAgentHealthMetrics> {
    // In a real implementation, this would collect actual metrics
    return {
      uptime: 0.999,
      responseTime: {
        p50: 1200,
        p95: 3500,
        p99: 8000,
      },
      errorRate: {
        total: 1250,
        rate: 0.02,
        critical: 5,
      },
      usage: {
        totalRequests: 62500,
        activeSessions: 150,
        tokensUsed: 1250000,
        cost: 45.50,
      },
      providers: {
        openai: {
          status: 'online',
          latency: 1200,
          errorRate: 0.01,
          lastUsed: new Date().toISOString(),
        },
        anthropic: {
          status: 'online',
          latency: 1800,
          errorRate: 0.02,
          lastUsed: new Date().toISOString(),
        },
        google: {
          status: 'degraded',
          latency: 3500,
          errorRate: 0.08,
          lastUsed: new Date(Date.now() - 300000).toISOString(),
        },
      },
      rag: {
        vectorStoreSize: 8500,
        retrievalAccuracy: 0.92,
        cacheHitRate: 0.75,
      },
    }
  }
}

// Export singleton instance
export const aiAgentHealthMonitor = new AIAgentHealthMonitor()

// Health check endpoint handler
export async function handleHealthCheck(): Promise<HealthStatus> {
  return await aiAgentHealthMonitor.performHealthCheck()
}

// Metrics endpoint handler
export async function handleMetricsRequest(): Promise<AIAgentHealthMetrics> {
  return await aiAgentHealthMonitor.getMetrics()
}

// Alerts endpoint handler
export async function handleAlertsRequest(): Promise<{ alerts: HealthAlert[] }> {
  return {
    alerts: aiAgentHealthMonitor.getActiveAlerts(),
  }
}

export default aiAgentHealthMonitor