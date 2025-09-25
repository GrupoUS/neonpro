/**
 * Ottomator Agent Bridge Service
 *
 * Bridges communication between the Node.js backend and Python ottomator-agents.
 * Provides a unified interface for RAG-based healthcare data queries.
 */

import { ChildProcess, spawn } from 'child_process'
import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../lib/logger'

export interface OttomatorQuery {
  _query: string
  sessionId: string
  _userId: string
  _context?: {
    patientId?: string
    clinicId?: string
    previousQueries?: string[]
    userRole?: string
  }
}

export interface OttomatorResponse {
  success: boolean
  response?: {
    content: string
    type: 'text' | 'structured' | 'chart' | 'table'
    sources?: Array<{
      title: string
      url?: string
      confidence: number
    }>
    actions?: Array<{
      type: 'button' | 'link' | 'form'
      label: string
      action: string
      data?: any
    }>
  }
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    processingTimeMs: number
    tokensUsed?: number
    model?: string
  }
}

export interface OttomatorAgentConfig {
  pythonPath: string
  agentPath: string
  maxConcurrentQueries: number
  queryTimeout: number
  healthCheckInterval: number
  enableLogging: boolean
}

export class OttomatorAgentBridge extends EventEmitter {
  private config: OttomatorAgentConfig
  private agentProcess: ChildProcess | null = null
  private isHealthy = false
  private queryQueue: Array<{
    _query: OttomatorQuery
    resolve: (response: OttomatorResponse) => void
    reject: (error: Error) => void
    timestamp: number
  }> = []
  private activeQueries = new Map<string, any>()
  private healthCheckTimer: NodeJS.Timeout | null = null

  constructor(config?: Partial<OttomatorAgentConfig>) {
    super()

    this.config = {
      pythonPath: config?.pythonPath || 'python3',
      agentPath: config?.agentPath ||
        path.join(process.cwd(), 'agents', 'ag-ui-rag-agent'),
      maxConcurrentQueries: config?.maxConcurrentQueries || 5,
      queryTimeout: config?.queryTimeout || 30000,
      healthCheckInterval: config?.healthCheckInterval || 30000,
      enableLogging: config?.enableLogging ?? true,
      ...config,
    }

    this.startHealthCheck()
  }

  /**
   * Initialize the ottomator agent bridge
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Ottomator Agent Bridge', {
        agentPath: this.config.agentPath,
        pythonPath: this.config.pythonPath,
      })

      // Check if agent files exist
      await this.validateAgentFiles()

      // Start the Python agent process
      await this.startAgentProcess()

      // Wait for agent to be ready
      await this.waitForAgentReady()

      this.isHealthy = true
      this.emit('ready')

      logger.info('Ottomator Agent Bridge initialized successfully')
    } catch {
      logger.error('Failed to initialize Ottomator Agent Bridge', { error })
      throw error
    }
  }

  /**
   * Process a query through the ottomator agent
   */
  async processQuery(_query: OttomatorQuery): Promise<OttomatorResponse> {
    if (!this.isHealthy) {
      throw new Error('Ottomator agent is not healthy')
    }

    if (this.activeQueries.size >= this.config.maxConcurrentQueries) {
      throw new Error('Maximum concurrent queries exceeded')
    }

    return new Promise((resolve, _reject) => {
      const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timeout = setTimeout(() => {
        this.activeQueries.delete(queryId)
        reject(new Error('Query timeout'))
      }, this.config.queryTimeout)

      this.activeQueries.set(queryId, { resolve, reject, timeout })

      // Send query to Python agent
      this.sendQueryToAgent(queryId, _query).catch(async (error) => {
        clearTimeout(timeout)
        this.activeQueries.delete(queryId)
        reject(error)
      })
    })
  }

  /**
   * Check if the agent is healthy
   */
  isAgentHealthy(): boolean {
    return this.isHealthy
  }

  /**
   * Shutdown the agent bridge
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Ottomator Agent Bridge')

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }

    if (this.agentProcess) {
      this.agentProcess.kill('SIGTERM')

      // Wait for graceful shutdown
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          if (this.agentProcess) {
            this.agentProcess.kill('SIGKILL')
          }
          resolve(void 0)
        }, 5000)

        this.agentProcess?.on('exit', () => {
          clearTimeout(timeout)
          resolve(void 0)
        })
      })
    }

    this.isHealthy = false
    this.emit('shutdown')
  }

  private async validateAgentFiles(): Promise<void> {
    const mainPyPath = path.join(this.config.agentPath, 'main.py')
    const requirementsPath = path.join(
      this.config.agentPath,
      'requirements.txt',
    )

    if (!fs.existsSync(mainPyPath)) {
      throw new Error(`Agent main.py not found at ${mainPyPath}`)
    }

    if (!fs.existsSync(requirementsPath)) {
      logger.warn(`Requirements file not found at ${requirementsPath}`)
    }

    logger.info('Agent files validated successfully')
  }

  private async startAgentProcess(): Promise<void> {
    return new Promise((resolve, _reject) => {
      const args = [path.join(this.config.agentPath, 'main.py')]

      logger.info('Starting Python agent process', {
        command: this.config.pythonPath,
        args,
        cwd: this.config.agentPath,
      })

      this.agentProcess = spawn(this.config.pythonPath, args, {
        cwd: this.config.agentPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONPATH: this.config.agentPath,
          AGENT_MODE: 'bridge',
        },
      })

      this.agentProcess.on('error', error => {
        logger.error('Agent process error', { error })
        this.isHealthy = false
        this.emit('error', error)
        reject(error)
      })

      this.agentProcess.on('exit', (code, _signal) => {
        logger.warn('Agent process exited', { code, signal })
        this.isHealthy = false
        this.emit('exit', { code, signal })
      })

      if (this.agentProcess.stdout) {
        this.agentProcess.stdout.on('data', data => {
          this.handleAgentOutput(data.toString())
        })
      }

      if (this.agentProcess.stderr) {
        this.agentProcess.stderr.on('data', data => {
          logger.error('Agent stderr', { output: data.toString() })
        })
      }

      // Give the process time to start
      setTimeout(() => {
        if (this.agentProcess && !this.agentProcess.killed) {
          resolve()
        } else {
          reject(new Error('Failed to start agent process'))
        }
      }, 2000)
    })
  }

  private async waitForAgentReady(): Promise<void> {
    // For now, assume agent is ready after process starts
    // In a real implementation, we would wait for a "ready" message
    return Promise.resolve()
  }

  private async sendQueryToAgent(
    queryId: string,
    query: OttomatorQuery,
  ): Promise<void> {
    if (!this.agentProcess || !this.agentProcess.stdin) {
      throw new Error('Agent process not available')
    }

    const message = {
      id: queryId,
      type: 'query',
      data: query,
      timestamp: Date.now(),
    }

    const messageStr = JSON.stringify(message) + '\n'
    this.agentProcess.stdin.write(messageStr)
  }

  private handleAgentOutput(output: string): void {
    const lines = output.trim().split('\n')

    for (const line of lines) {
      try {
        const message = JSON.parse(line)
        this.handleAgentMessage(message)
      } catch {
        void _error
        // Non-JSON agent output is handled as info below
        if (this.config.enableLogging) {
          logger.info('Agent output (non-JSON)', { output: line })
        }
      }
    }
  }

  private handleAgentMessage(message: any): void {
    if (message.type === 'response' && message.id) {
      const activeQuery = this.activeQueries.get(message.id)
      if (activeQuery) {
        clearTimeout(activeQuery.timeout)
        this.activeQueries.delete(message.id)
        activeQuery.resolve(message.data)
      }
    } else if (message.type === 'error' && message.id) {
      const activeQuery = this.activeQueries.get(message.id)
      if (activeQuery) {
        clearTimeout(activeQuery.timeout)
        this.activeQueries.delete(message.id)
        activeQuery.reject(new Error(message.error || 'Agent error'))
      }
    } else if (message.type === 'health') {
      this.isHealthy = message.status === 'healthy'
    }
  }

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  private performHealthCheck(): void {
    if (!this.agentProcess || this.agentProcess.killed) {
      this.isHealthy = false
      return
    }

    // Send health check message
    try {
      const healthMessage = {
        id: `health_${Date.now()}`,
        type: 'health_check',
        timestamp: Date.now(),
      }

      if (this.agentProcess.stdin) {
        this.agentProcess.stdin.write(JSON.stringify(healthMessage) + '\n')
      }
    } catch {
      logger.error('Health check failed', { error })
      this.isHealthy = false
    }
  }
}

// Singleton instance
let ottomatorBridge: OttomatorAgentBridge | null = null

export function getOttomatorBridge(
  config?: Partial<OttomatorAgentConfig>,
): OttomatorAgentBridge {
  if (!ottomatorBridge) {
    ottomatorBridge = new OttomatorAgentBridge(config)
  }
  return ottomatorBridge
}

export async function initializeOttomatorBridge(
  config?: Partial<OttomatorAgentConfig>,
): Promise<OttomatorAgentBridge> {
  const bridge = getOttomatorBridge(config)
  await bridge.initialize()
  return bridge
}
