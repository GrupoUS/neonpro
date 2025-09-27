/**
 * Anomaly Detection and Fraud Prevention Service
 *
 * Advanced AI-powered anomaly detection and fraud prevention systems
 * for Brazilian aesthetic clinic financial operations with LGPD compliance.
 */

// Browser-compatible UUID generation
const randomUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
import { z } from 'zod'
import { Billing } from '../billing-service.js'

/**
 * Anomaly Detection Types
 */
export interface AnomalyRule {
  id: string
  name: string
  description: string
  type: 'statistical' | 'ml' | 'rule_based'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  config: Record<string, any>
  lastUpdated: string
}

export interface AnomalyAlert {
  id: string
  ruleId: string
  ruleName: string
  type: 'billing' | 'payment' | 'revenue' | 'pattern' | 'behavior'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  description: string
  detectedAt: string
  affectedEntities: Array<{
    type: 'billing' | 'patient' | 'professional' | 'clinic'
    id: string
    name?: string
  }>
  metadata: Record<string, any>
  recommendedAction: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolvedAt?: string
  resolutionNotes?: string
}

export interface FraudDetectionResult {
  id: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  indicators: Array<{
    indicator: string
    value: any
    threshold: number
    triggered: boolean
    weight: number
  }>
  description: string
  recommendedAction: string
  requiresReview: boolean
  requiresInvestigation: boolean
  createdAt: string
  entityId: string
  entityType: 'billing' | 'payment' | 'patient' | 'professional'
}

export interface DetectionConfig {
  enableStatisticalAnalysis: boolean
  enableMLDetection: boolean
  enableRuleBasedDetection: boolean
  sensitivity: 'low' | 'medium' | 'high'
  autoResolutionThreshold: number
  escalationRules: Array<{
    condition: string
    action: 'alert' | 'block' | 'review'
    recipients: string[]
  }>
  notificationSettings: {
    email: boolean
    sms: boolean
    webhook: boolean
    inApp: boolean
  }
  retentionPolicy: {
    alerts: number // days
    resolvedAlerts: number // days
    auditLogs: number // days
  }
}

/**
 * Pattern Analysis Types
 */
export interface BehaviorPattern {
  id: string
  entityType: 'patient' | 'professional' | 'clinic'
  entityId: string
  patternType: 'billing_frequency' | 'payment_behavior' | 'service_preference' | 'timing_pattern'
  baseline: {
    average: number
    stdDev: number
    min: number
    max: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  currentDeviation: number
  deviationSignificance: number
  lastUpdated: string
  sampleSize: number
}

export interface NetworkAnalysis {
  nodes: Array<{
    id: string
    type: 'patient' | 'professional' | 'clinic' | 'billing'
    attributes: Record<string, any>
  }>
  edges: Array<{
    source: string
    target: string
    type: 'patient_billing' | 'professional_billing' | 'clinic_billing' | 'payment'
    weight: number
    attributes: Record<string, any>
  }>
  anomalies: Array<{
    type: 'suspicious_connection' | 'circular_billing' | 'unusual_network'
    description: string
    confidence: number
    affectedNodes: string[]
  }>
}

/**
 * Anomaly Detection Configuration Schema
 */
const detectionConfigSchema = z.object({
  enableStatisticalAnalysis: z.boolean().default(true),
  enableMLDetection: z.boolean().default(true),
  enableRuleBasedDetection: z.boolean().default(true),
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
  autoResolutionThreshold: z.number().min(0).max(1).default(0.95),
  escalationRules: z.array(z.object({
    condition: z.string(),
    action: z.enum(['alert', 'block', 'review']),
    recipients: z.array(z.string()),
  })).default([]),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    webhook: z.boolean().default(true),
    inApp: z.boolean().default(true),
  }).default(),
  retentionPolicy: z.object({
    alerts: z.number().default(365),
    resolvedAlerts: z.number().default(90),
    auditLogs: z.number().default(1825), // 5 years
  }).default(),
})

/**
 * Statistical Analysis Configuration
 */
const statisticalConfigSchema = z.object({
  zScoreThreshold: z.number().default(2.5),
  iqrMultiplier: z.number().default(1.5),
  minSampleSize: z.number().default(10),
  windowSize: z.number().default(30), // days
  seasonalityDetection: z.boolean().default(true),
  trendDetection: z.boolean().default(true),
})

/**
 * ML Detection Configuration
 */
const mlConfigSchema = z.object({
  modelType: z.enum(['isolation_forest', 'one_class_svm', 'autoencoder', 'lstm_autoencoder']),
  contaminationRate: z.number().min(0).max(1).default(0.1),
  featureSelection: z.array(z.string()).default([
    'amount',
    'time_of_day',
    'day_of_week',
    'billing_type',
    'payment_method',
    'patient_history',
    'professional_history',
  ]),
  retrainInterval: z.number().default(7), // days
  confidenceThreshold: z.number().default(0.8),
})

/**
 * Rule-Based Detection Configuration
 */
const ruleConfigSchema = z.object({
  velocityThresholds: z.object({
    billingPerHour: z.number().default(5),
    billingPerDay: z.number().default(20),
    amountThreshold: z.number().default(10000),
    discountThreshold: z.number().default(0.3), // 30%
  }).default(),
  patternDetection: z.object({
    duplicateBilling: z.boolean().default(true),
    roundAmounts: z.boolean().default(true),
    unusualTiming: z.boolean().default(true),
    geolocation: z.boolean().default(false),
  }).default(),
  customRules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    condition: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    action: z.enum(['alert', 'block', 'review']),
  })).default([]),
})

/**
 * Anomaly Detection Service
 */
export class AnomalyDetectionService {
  private config: DetectionConfig
  private statisticalConfig: z.infer<typeof statisticalConfigSchema>
  private mlConfig: z.infer<typeof mlConfigSchema>
  private ruleConfig: z.infer<typeof ruleConfigSchema>

  private alerts: Map<string, AnomalyAlert> = new Map()
  private rules: Map<string, AnomalyRule> = new Map()
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map()
  private mlModels: Map<string, any> = new Map()

  private isInitialized = false

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = detectionConfigSchema.parse(config)
    this.statisticalConfig = statisticalConfigSchema.parse({})
    this.mlConfig = mlConfigSchema.parse({})
    this.ruleConfig = ruleConfigSchema.parse({})

    this.initialize()
  }

  /**
   * Initialize the anomaly detection system
   */
  private initialize(): void {
    this.setupDefaultRules()
    this.initializeMLModels()
    this.isInitialized = true
  }

  /**
   * Setup default detection rules
   */
  private setupDefaultRules(): void {
    const defaultRules: AnomalyRule[] = [
      {
        id: 'unusual_billing_amount',
        name: 'Valor de Cobrança Incomum',
        description: 'Detecta valores de cobrança significativamente diferentes da média',
        type: 'statistical',
        severity: 'medium',
        enabled: true,
        config: {
          threshold: 3, // standard deviations
          minAmount: 100,
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'rapid_billing_velocity',
        name: 'Velocidade Rápida de Cobrança',
        description: 'Detecta múltiplas cobranças em curto período de tempo',
        type: 'rule_based',
        severity: 'high',
        enabled: true,
        config: {
          maxPerHour: 3,
          maxPerDay: 10,
          timeWindow: 60, // minutes
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'suspicious_discount_pattern',
        name: 'Padrão Suspeito de Descontos',
        description: 'Detecta padrões incomuns de descontos que podem indicar fraude',
        type: 'ml',
        severity: 'medium',
        enabled: true,
        config: {
          maxDiscountRate: 0.5,
          frequencyThreshold: 0.2,
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'unusual_payment_timing',
        name: 'Timing Incomum de Pagamento',
        description: 'Detecta pagamentos fora do horário comercial normal',
        type: 'rule_based',
        severity: 'low',
        enabled: true,
        config: {
          businessHours: {
            start: 8,
            end: 18,
            timezone: 'America/Sao_Paulo',
          },
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'duplicate_billing_detection',
        name: 'Detecção de Cobrança Duplicada',
        description: 'Detecta possíveis cobranças duplicadas para o mesmo paciente',
        type: 'rule_based',
        severity: 'high',
        enabled: true,
        config: {
          timeWindow: 24, // hours
          similarityThreshold: 0.9,
        },
        lastUpdated: new Date().toISOString(),
      },
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  /**
   * Initialize ML models
   */
  private initializeMLModels(): void {
    // In a real implementation, this would load or train ML models
    console.warn('Initializing ML models for anomaly detection...')

    // Mock model initialization
    this.mlModels.set('isolation_forest', {
      type: 'isolation_forest',
      trained: true,
      accuracy: 0.92,
      lastTrained: new Date().toISOString(),
    })

    this.mlModels.set('billing_anomaly_detector', {
      type: 'ensemble',
      trained: true,
      accuracy: 0.88,
      lastTrained: new Date().toISOString(),
    })
  }

  /**
   * Main anomaly detection entry point
   */
  async detectAnomalies(
    billing: Billing,
    historicalData: Billing[] = [],
  ): Promise<{
    alerts: AnomalyAlert[]
    fraudResults: FraudDetectionResult[]
    behaviorAnalysis?: BehaviorPattern[]
    networkAnalysis?: NetworkAnalysis
  }> {
    try {
      const alerts: AnomalyAlert[] = []
      const fraudResults: FraudDetectionResult[] = []

      // Run different types of detection
      if (this.config.enableStatisticalAnalysis) {
        const statisticalAlerts = await this.runStatisticalDetection(billing, historicalData)
        alerts.push(...statisticalAlerts)
      }

      if (this.config.enableMLDetection) {
        const mlAlerts = await this.runMLDetection(billing, historicalData)
        alerts.push(...mlAlerts)
      }

      if (this.config.enableRuleBasedDetection) {
        const ruleAlerts = await this.runRuleBasedDetection(billing, historicalData)
        alerts.push(...ruleAlerts)
      }

      // Run fraud detection
      const fraudResult = await this.runFraudDetection(billing, historicalData)
      if (fraudResult) {
        fraudResults.push(fraudResult)
      }

      // Analyze behavior patterns
      const behaviorAnalysis = await this.analyzeBehaviorPatterns(billing, historicalData)

      // Analyze network patterns
      const networkAnalysis = await this.analyzeNetworkPatterns(billing, historicalData)

      // Store alerts and send notifications
      for (const alert of alerts) {
        this.alerts.set(alert.id, alert)
        await this.sendAlertNotification(alert)
      }

      return {
        alerts,
        fraudResults,
        behaviorAnalysis,
        networkAnalysis,
      }
    } catch {
      console.error('Anomaly detection failed:', error)
      throw error
    }
  }

  /**
   * Statistical anomaly detection
   */
  private async runStatisticalDetection(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = []

    // Z-score analysis for billing amounts
    const amountAlert = this.detectAmountAnomaly(billing, historicalData)
    if (amountAlert) alerts.push(amountAlert)

    // IQR-based outlier detection
    const iqrAlert = this.detectIQROutlier(billing, historicalData)
    if (iqrAlert) alerts.push(iqrAlert)

    // Time-based anomaly detection
    const timeAlert = this.detectTimeAnomaly(billing, historicalData)
    if (timeAlert) alerts.push(timeAlert)

    return alerts
  }

  /**
   * Detect amount anomalies using Z-score
   */
  private detectAmountAnomaly(
    billing: Billing,
    historicalData: Billing[],
  ): AnomalyAlert | null {
    if (historicalData.length < this.statisticalConfig.minSampleSize) {
      return null
    }

    const amounts = historicalData
      .filter(b => b.paymentStatus === 'paid')
      .map(b => b.total)

    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
      amounts.length
    const stdDev = Math.sqrt(variance)

    const zScore = Math.abs((billing.total - mean) / stdDev)

    if (zScore > this.statisticalConfig.zScoreThreshold) {
      return {
        id: randomUUID(),
        ruleId: 'unusual_billing_amount',
        ruleName: 'Valor de Cobrança Incomum',
        type: 'billing',
        severity: zScore > 4 ? 'high' : 'medium',
        confidence: Math.min(zScore / 5, 1),
        description: `Valor de cobrança R$ ${billing.total.toFixed(2)} está ${
          zScore.toFixed(2)
        } desvios padrão acima da média (R$ ${mean.toFixed(2)})`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'billing',
            id: billing.id,
          },
          {
            type: 'patient',
            id: billing.patientId,
          },
        ],
        metadata: {
          zScore,
          mean,
          stdDev,
          amount: billing.total,
        },
        recommendedAction: 'Revisar cobrança para possível erro ou atividade suspeita',
        status: 'open',
      }
    }

    return null
  }

  /**
   * Detect outliers using Interquartile Range (IQR)
   */
  private detectIQROutlier(
    billing: Billing,
    historicalData: Billing[],
  ): AnomalyAlert | null {
    if (historicalData.length < this.statisticalConfig.minSampleSize) {
      return null
    }

    const amounts = historicalData
      .filter(b => b.paymentStatus === 'paid')
      .map(b => b.total)
      .sort((a, b) => a - b)

    const q1Index = Math.floor(amounts.length * 0.25)
    const q3Index = Math.floor(amounts.length * 0.75)
    const q1 = amounts[q1Index]
    const q3 = amounts[q3Index]
    const iqr = q3 - q1

    const lowerBound = q1 - this.statisticalConfig.iqrMultiplier * iqr
    const upperBound = q3 + this.statisticalConfig.iqrMultiplier * iqr

    if (billing.total < lowerBound || billing.total > upperBound) {
      const deviation = billing.total < lowerBound
        ? (lowerBound - billing.total) / lowerBound
        : (billing.total - upperBound) / upperBound

      return {
        id: randomUUID(),
        ruleId: 'unusual_billing_amount',
        ruleName: 'Outlier por IQR',
        type: 'billing',
        severity: Math.abs(deviation) > 0.5 ? 'high' : 'medium',
        confidence: Math.min(Math.abs(deviation), 1),
        description: `Valor de cobrança R$ ${
          billing.total.toFixed(2)
        } está fora do intervalo normal (R$ ${lowerBound.toFixed(2)} - R$ ${
          upperBound.toFixed(2)
        })`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'billing',
            id: billing.id,
          },
        ],
        metadata: {
          iqr,
          q1,
          q3,
          lowerBound,
          upperBound,
          amount: billing.total,
          deviation,
        },
        recommendedAction:
          'Investigar cobrança que se desvia significativamente dos valores típicos',
        status: 'open',
      }
    }

    return null
  }

  /**
   * Detect time-based anomalies
   */
  private detectTimeAnomaly(
    billing: Billing,
    historicalData: Billing[],
  ): AnomalyAlert | null {
    const billingTime = new Date(billing.createdAt)
    const hour = billingTime.getHours()
    const dayOfWeek = billingTime.getDay()

    // Check if billing is outside business hours
    const isOutsideHours = hour < 8 || hour > 18
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (isOutsideHours || isWeekend) {
      // Check if this is unusual for this entity
      const similarBillings = historicalData.filter(b =>
        b.patientId === billing.patientId ||
        b.professionalId === billing.professionalId
      )

      const outsideHoursCount = similarBillings.filter(b => {
        const time = new Date(b.createdAt)
        const h = time.getHours()
        const dow = time.getDay()
        return h < 8 || h > 18 || dow === 0 || dow === 6
      }).length

      const outsideHoursRate = similarBillings.length > 0
        ? outsideHoursCount / similarBillings.length
        : 0

      if (outsideHoursRate < 0.1 && similarBillings.length >= 5) {
        return {
          id: randomUUID(),
          ruleId: 'unusual_payment_timing',
          ruleName: 'Timing Incomum de Cobrança',
          type: 'billing',
          severity: 'medium',
          confidence: 0.8,
          description: `Cobrança criada fora do horário comercial (${hour}:${
            String(billingTime.getMinutes()).padStart(2, '0')
          })`,
          detectedAt: new Date().toISOString(),
          affectedEntities: [
            {
              type: 'billing',
              id: billing.id,
            },
            {
              type: 'patient',
              id: billing.patientId,
            },
          ],
          metadata: {
            hour,
            dayOfWeek,
            isWeekend,
            outsideHoursRate,
            totalSimilarBillings: similarBillings.length,
          },
          recommendedAction: 'Verificar se cobrança fora de horário é legítima',
          status: 'open',
        }
      }
    }

    return null
  }

  /**
   * ML-based anomaly detection
   */
  private async runMLDetection(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = []

    // Prepare features for ML model
    const features = this.extractFeatures(billing, historicalData)

    // Get anomaly score from ML model
    const anomalyScore = await this.getMLAnomalyScore(features)

    if (anomalyScore > (1 - this.mlConfig.contaminationRate)) {
      alerts.push({
        id: randomUUID(),
        ruleId: 'ml_anomaly_detector',
        ruleName: 'Detecção por Machine Learning',
        type: 'billing',
        severity: anomalyScore > 0.9 ? 'high' : 'medium',
        confidence: anomalyScore,
        description: `Modelo de ML detectou anomalia com score ${anomalyScore.toFixed(3)}`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'billing',
            id: billing.id,
          },
        ],
        metadata: {
          anomalyScore,
          features,
          modelType: this.mlConfig.modelType,
        },
        recommendedAction: 'Investigar anomalia detectada por modelo de ML',
        status: 'open',
      })
    }

    return alerts
  }

  /**
   * Extract features for ML models
   */
  private extractFeatures(billing: Billing, historicalData: Billing[]): number[] {
    const billingTime = new Date(billing.createdAt)
    const hour = billingTime.getHours()
    const dayOfWeek = billingTime.getDay()

    // Calculate historical statistics
    const patientHistory = historicalData.filter(b => b.patientId === billing.patientId)
    const professionalHistory = historicalData.filter(b =>
      b.professionalId === billing.professionalId
    )

    const avgPatientAmount = patientHistory.length > 0
      ? patientHistory.reduce((sum, b) => sum + b.total, 0) / patientHistory.length
      : 0

    const avgProfessionalAmount = professionalHistory.length > 0
      ? professionalHistory.reduce((sum, b) => sum + b.total, 0) / professionalHistory.length
      : 0

    // Normalize features
    return [
      billing.total / 10000, // Normalize by 10k
      hour / 24,
      dayOfWeek / 7,
      billing.items.length / 10,
      (billing.discounts || 0) / billing.total,
      avgPatientAmount / 10000,
      avgProfessionalAmount / 10000,
      billingTime.getTime() / (1000 * 60 * 60 * 24), // Days since epoch
    ]
  }

  /**
   * Get ML anomaly score
   */
  private async getMLAnomalyScore(features: number[]): Promise<number> {
    // In a real implementation, this would use actual ML models
    // For now, we'll simulate with a simple scoring function

    // Simple anomaly score based on feature deviations
    const score = features.reduce((acc, feature, index) => {
      const expected = [0.5, 0.5, 0.5, 0.3, 0.1, 0.5, 0.5, 0.5][index] || 0.5
      const deviation = Math.abs(feature - expected)
      return acc + deviation
    }, 0) / features.length

    return Math.min(score, 1)
  }

  /**
   * Rule-based anomaly detection
   */
  private async runRuleBasedDetection(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = []

    // Velocity detection
    const velocityAlert = this.detectBillingVelocity(billing, historicalData)
    if (velocityAlert) alerts.push(velocityAlert)

    // Duplicate detection
    const duplicateAlert = this.detectDuplicateBilling(billing, historicalData)
    if (duplicateAlert) alerts.push(duplicateAlert)

    // Discount pattern detection
    const discountAlert = this.detectSuspiciousDiscounts(billing)
    if (discountAlert) alerts.push(discountAlert)

    return alerts
  }

  /**
   * Detect billing velocity anomalies
   */
  private detectBillingVelocity(
    billing: Billing,
    historicalData: Billing[],
  ): AnomalyAlert | null {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const billingsLastHour = historicalData.filter(
      b => new Date(b.createdAt) >= oneHourAgo,
    ).length

    const billingsLastDay = historicalData.filter(
      b => new Date(b.createdAt) >= oneDayAgo,
    ).length

    if (billingsLastHour > this.ruleConfig.velocityThresholds.billingPerHour) {
      return {
        id: randomUUID(),
        ruleId: 'rapid_billing_velocity',
        ruleName: 'Velocidade Rápida de Cobrança',
        type: 'billing',
        severity: 'high',
        confidence: Math.min(
          billingsLastHour / this.ruleConfig.velocityThresholds.billingPerHour,
          1,
        ),
        description:
          `${billingsLastHour} cobranças na última hora (limite: ${this.ruleConfig.velocityThresholds.billingPerHour})`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'clinic',
            id: billing.clinicId,
          },
        ],
        metadata: {
          billingsLastHour,
          threshold: this.ruleConfig.velocityThresholds.billingPerHour,
          timeWindow: '1h',
        },
        recommendedAction: 'Investigar atividade incomum de cobranças',
        status: 'open',
      }
    }

    if (billingsLastDay > this.ruleConfig.velocityThresholds.billingPerDay) {
      return {
        id: randomUUID(),
        ruleId: 'rapid_billing_velocity',
        ruleName: 'Alta Frequência Diária de Cobrança',
        type: 'billing',
        severity: 'medium',
        confidence: Math.min(billingsLastDay / this.ruleConfig.velocityThresholds.billingPerDay, 1),
        description:
          `${billingsLastDay} cobranças nas últimas 24 horas (limite: ${this.ruleConfig.velocityThresholds.billingPerDay})`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'clinic',
            id: billing.clinicId,
          },
        ],
        metadata: {
          billingsLastDay,
          threshold: this.ruleConfig.velocityThresholds.billingPerDay,
          timeWindow: '24h',
        },
        recommendedAction: 'Monitorar volume elevado de cobranças',
        status: 'open',
      }
    }

    return null
  }

  /**
   * Detect duplicate billing
   */
  private detectDuplicateBilling(
    billing: Billing,
    historicalData: Billing[],
  ): AnomalyAlert | null {
    const timeWindow = this.ruleConfig.duplicateBillingDetection?.timeWindow || 24
    const cutoffDate = new Date(Date.now() - timeWindow * 60 * 60 * 1000)

    const similarBillings = historicalData.filter(b => {
      if (new Date(b.createdAt) < cutoffDate) return false
      if (b.patientId !== billing.patientId) return false
      if (b.professionalId !== billing.professionalId) return false

      // Check for similar amounts (within 5%)
      const amountDiff = Math.abs(b.total - billing.total) / billing.total
      return amountDiff < 0.05
    })

    if (similarBillings.length > 0) {
      return {
        id: randomUUID(),
        ruleId: 'duplicate_billing_detection',
        ruleName: 'Possível Cobrança Duplicada',
        type: 'billing',
        severity: 'high',
        confidence: 0.9,
        description:
          `Encontradas ${similarBillings.length} cobranças similares nas últimas ${timeWindow} horas`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'billing',
            id: billing.id,
          },
          {
            type: 'patient',
            id: billing.patientId,
          },
        ],
        metadata: {
          similarBillings: similarBillings.map(b => b.id),
          timeWindow,
          similarityThreshold: 0.05,
        },
        recommendedAction: 'Verificar possíveis cobranças duplicadas',
        status: 'open',
      }
    }

    return null
  }

  /**
   * Detect suspicious discounts
   */
  private detectSuspiciousDiscounts(billing: Billing): AnomalyAlert | null {
    const discountRate = billing.discounts / billing.total
    const maxDiscount = this.ruleConfig.velocityThresholds?.discountThreshold || 0.3

    if (discountRate > maxDiscount) {
      return {
        id: randomUUID(),
        ruleId: 'suspicious_discount_pattern',
        ruleName: 'Desconto Suspeito',
        type: 'billing',
        severity: 'medium',
        confidence: Math.min(discountRate / maxDiscount, 1),
        description: `Desconto de ${(discountRate * 100).toFixed(1)}% aplicado (limite: ${
          (maxDiscount * 100).toFixed(1)
        }%)`,
        detectedAt: new Date().toISOString(),
        affectedEntities: [
          {
            type: 'billing',
            id: billing.id,
          },
          {
            type: 'professional',
            id: billing.professionalId,
          },
        ],
        metadata: {
          discountRate,
          maxDiscount,
          discountAmount: billing.discounts,
          totalAmount: billing.total,
        },
        recommendedAction: 'Justificar desconto acima do limite permitido',
        status: 'open',
      }
    }

    return null
  }

  /**
   * Fraud detection analysis
   */
  private async runFraudDetection(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<FraudDetectionResult | null> {
    const indicators: FraudDetectionResult['indicators'] = []
    let totalRiskScore = 0

    // Check various fraud indicators
    indicators.push(
      this.checkVelocityRisk(billing, historicalData),
      this.checkAmountRisk(billing, historicalData),
      this.checkTimeRisk(billing),
      this.checkDiscountRisk(billing),
      this.checkHistoryRisk(billing, historicalData),
    )

    // Calculate weighted risk score
    const validIndicators = indicators.filter(ind => ind.triggered)
    totalRiskScore = validIndicators.reduce(
      (sum, ind) => sum + (ind.weight * (ind.triggered ? 1 : 0)),
      0,
    )

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (totalRiskScore < 0.3) riskLevel = 'low'
    else if (totalRiskScore < 0.6) riskLevel = 'medium'
    else if (totalRiskScore < 0.8) riskLevel = 'high'
    else riskLevel = 'critical'

    // Only return result if there's significant risk
    if (riskLevel !== 'low') {
      return {
        id: randomUUID(),
        riskScore: totalRiskScore,
        riskLevel,
        indicators,
        description: this.generateFraudDescription(validIndicators, riskLevel),
        recommendedAction: this.getFraudRecommendation(riskLevel),
        requiresReview: riskLevel === 'medium' || riskLevel === 'high',
        requiresInvestigation: riskLevel === 'critical',
        createdAt: new Date().toISOString(),
        entityId: billing.id,
        entityType: 'billing',
      }
    }

    return null
  }

  /**
   * Check velocity risk indicator
   */
  private checkVelocityRisk(
    billing: Billing,
    historicalData: Billing[],
  ): FraudDetectionResult['indicators'][0] {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentBillings = historicalData.filter(
      b => b.patientId === billing.patientId && new Date(b.createdAt) >= oneDayAgo,
    ).length

    return {
      indicator: 'Velocidade de Cobrança',
      value: recentBillings,
      threshold: 3,
      triggered: recentBillings > 3,
      weight: 0.3,
    }
  }

  /**
   * Check amount risk indicator
   */
  private checkAmountRisk(
    billing: Billing,
    historicalData: Billing[],
  ): FraudDetectionResult['indicators'][0] {
    const patientHistory = historicalData.filter(b => b.patientId === billing.patientId)
    const avgAmount = patientHistory.length > 0
      ? patientHistory.reduce((sum, b) => sum + b.total, 0) / patientHistory.length
      : billing.total

    const amountRatio = billing.total / avgAmount

    return {
      indicator: 'Valor Incomum',
      value: billing.total,
      threshold: avgAmount * 3,
      triggered: amountRatio > 3,
      weight: 0.25,
    }
  }

  /**
   * Check time risk indicator
   */
  private checkTimeRisk(billing: Billing): FraudDetectionResult['indicators'][0] {
    const hour = new Date(billing.createdAt).getHours()
    const isNightTime = hour < 6 || hour > 22

    return {
      indicator: 'Horário Incomum',
      value: hour,
      threshold: 22,
      triggered: isNightTime,
      weight: 0.15,
    }
  }

  /**
   * Check discount risk indicator
   */
  private checkDiscountRisk(billing: Billing): FraudDetectionResult['indicators'][0] {
    const discountRate = billing.discounts / billing.total

    return {
      indicator: 'Desconto Elevado',
      value: discountRate,
      threshold: 0.3,
      triggered: discountRate > 0.3,
      weight: 0.2,
    }
  }

  /**
   * Check history risk indicator
   */
  private checkHistoryRisk(
    billing: Billing,
    historicalData: Billing[],
  ): FraudDetectionResult['indicators'][0] {
    const patientHistory = historicalData.filter(b => b.patientId === billing.patientId)
    const overduePayments = patientHistory.filter(b => b.paymentStatus === 'overdue').length

    return {
      indicator: 'Histórico de Pagamentos',
      value: overduePayments,
      threshold: 0,
      triggered: overduePayments > 0,
      weight: 0.1,
    }
  }

  /**
   * Generate fraud description
   */
  private generateFraudDescription(
    indicators: FraudDetectionResult['indicators'],
    riskLevel: string,
  ): string {
    const triggeredIndicators = indicators.filter(ind => ind.triggered)

    if (triggeredIndicators.length === 0) return ''

    const indicatorNames = triggeredIndicators.map(ind => ind.indicator)

    return `Risco ${riskLevel} de fraude detectado. Indicadores acionados: ${
      indicatorNames.join(', ')
    }`
  }

  /**
   * Get fraud recommendation based on risk level
   */
  private getFraudRecommendation(riskLevel: string): string {
    switch (riskLevel) {
      case 'low':
        return 'Monitorar transação'
      case 'medium':
        return 'Revisão manual necessária'
      case 'high':
        return 'Investigação urgente requerida'
      case 'critical':
        return 'Bloquear transação e investigar imediatamente'
      default:
        return 'Monitorar transação'
    }
  }

  /**
   * Analyze behavior patterns
   */
  private async analyzeBehaviorPatterns(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = []

    // Analyze patient billing frequency
    const patientPattern = await this.analyzeEntityBehavior(
      'patient',
      billing.patientId,
      'billing_frequency',
      historicalData,
    )
    if (patientPattern) patterns.push(patientPattern)

    // Analyze professional billing patterns
    const professionalPattern = await this.analyzeEntityBehavior(
      'professional',
      billing.professionalId,
      'billing_frequency',
      historicalData,
    )
    if (professionalPattern) patterns.push(professionalPattern)

    return patterns
  }

  /**
   * Analyze individual entity behavior
   */
  private async analyzeEntityBehavior(
    entityType: 'patient' | 'professional',
    entityId: string,
    patternType: 'billing_frequency',
    historicalData: Billing[],
  ): Promise<BehaviorPattern | null> {
    const entityData = historicalData.filter(b => {
      if (entityType === 'patient') return b.patientId === entityId
      if (entityType === 'professional') return b.professionalId === entityId
      return false
    })

    if (entityData.length < 5) return null

    // Calculate billing frequency pattern
    const dailyBillings = this.calculateDailyFrequency(entityData)
    const avgFrequency = dailyBillings.reduce((sum, count) => sum + count, 0) /
      dailyBillings.length
    const variance =
      dailyBillings.reduce((sum, count) => sum + Math.pow(count - avgFrequency, 2), 0) /
      dailyBillings.length
    const stdDev = Math.sqrt(variance)

    // Calculate current deviation
    const recentBillings = entityData.filter(b => {
      const daysSince = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7
    }).length

    const currentFrequency = recentBillings / 7
    const deviation = Math.abs(currentFrequency - avgFrequency) / (stdDev || 1)

    return {
      id: randomUUID(),
      entityType,
      entityId,
      patternType,
      baseline: {
        average: avgFrequency,
        stdDev,
        min: Math.min(...dailyBillings),
        max: Math.max(...dailyBillings),
        trend: 'stable', // Simplified
      },
      currentDeviation: deviation,
      deviationSignificance: Math.min(deviation / 2, 1),
      lastUpdated: new Date().toISOString(),
      sampleSize: entityData.length,
    }
  }

  /**
   * Calculate daily billing frequency
   */
  private calculateDailyFrequency(billings: Billing[]): number[] {
    const dailyCount = new Map<string, number>()

    billings.forEach(billing => {
      const date = new Date(billing.createdAt).toISOString().split('T')[0]
      dailyCount.set(date, (dailyCount.get(date) || 0) + 1)
    })

    return Array.from(dailyCount.values())
  }

  /**
   * Analyze network patterns
   */
  private async analyzeNetworkPatterns(
    billing: Billing,
    historicalData: Billing[],
  ): Promise<NetworkAnalysis> {
    // Build network graph from billing relationships
    const nodes = new Map<string, any>()
    const edges = new Map<string, any>()

    // Add nodes
    nodes.set(`patient_${billing.patientId}`, {
      id: `patient_${billing.patientId}`,
      type: 'patient',
      attributes: {},
    })

    nodes.set(`professional_${billing.professionalId}`, {
      id: `professional_${billing.professionalId}`,
      type: 'professional',
      attributes: {},
    })

    nodes.set(`clinic_${billing.clinicId}`, {
      id: `clinic_${billing.clinicId}`,
      type: 'clinic',
      attributes: {},
    })

    // Add edges
    const edgeKey = `${billing.patientId}-${billing.professionalId}`
    edges.set(edgeKey, {
      source: `patient_${billing.patientId}`,
      target: `professional_${billing.professionalId}`,
      type: 'patient_billing',
      weight: 1,
      attributes: { totalAmount: billing.total },
    })

    // Analyze historical data for network patterns
    historicalData.forEach(hBilling => {
      // Add nodes if not present
      ;[
        `patient_${hBilling.patientId}`,
        `professional_${hBilling.professionalId}`,
        `clinic_${hBilling.clinicId}`,
      ].forEach(nodeId => {
        if (!nodes.has(nodeId)) {
          const [type, _id] = nodeId.split('_')
          nodes.set(nodeId, {
            id: nodeId,
            type,
            attributes: {},
          })
        }
      })

      // Update or add edges
      const hEdgeKey = `${hBilling.patientId}-${hBilling.professionalId}`
      const existingEdge = edges.get(hEdgeKey)

      if (existingEdge) {
        existingEdge.weight += 1
        existingEdge.attributes.totalAmount += hBilling.total
      } else {
        edges.set(hEdgeKey, {
          source: `patient_${hBilling.patientId}`,
          target: `professional_${hBilling.professionalId}`,
          type: 'patient_billing',
          weight: 1,
          attributes: { totalAmount: hBilling.total },
        })
      }
    })

    // Detect network anomalies
    const anomalies = this.detectNetworkAnomalies(
      Array.from(nodes.values()),
      Array.from(edges.values()),
    )

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
      anomalies,
    }
  }

  /**
   * Detect network anomalies
   */
  private detectNetworkAnomalies(nodes: any[], edges: any[]): NetworkAnalysis['anomalies'] {
    const anomalies: NetworkAnalysis['anomalies'] = []

    // Find nodes with unusually high connectivity
    const nodeDegrees = new Map<string, number>()
    edges.forEach(edge => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1)
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1)
    })

    const avgDegree = Array.from(nodeDegrees.values()).reduce((sum, deg) => sum + deg, 0) /
      nodeDegrees.size
    const stdDev = this.calculateStandardDeviation(Array.from(nodeDegrees.values()))

    const highDegreeNodes = Array.from(nodeDegrees.entries())
      .filter(([, degree]) => degree > avgDegree + 2 * stdDev)
      .map(([nodeId]) => nodeId)

    if (highDegreeNodes.length > 0) {
      anomalies.push({
        type: 'suspicious_connection',
        description: `${highDegreeNodes.length} nós com conectividade incomumente alta`,
        confidence: 0.7,
        affectedNodes: highDegreeNodes,
      })
    }

    return anomalies
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: AnomalyAlert): Promise<void> {
    // In a real implementation, this would send notifications via email, SMS, webhook, etc.
    console.warn(`Anomaly Alert: ${alert.description} (${alert.severity})`)

    // Check escalation rules
    const escalationRule = this.config.escalationRules.find(rule =>
      this.evaluateCondition(rule.condition, alert)
    )

    if (escalationRule) {
      console.warn(
        `Escalating alert: ${escalationRule.action} to ${escalationRule.recipients.join(', ')}`,
      )
    }
  }

  /**
   * Evaluate escalation condition
   */
  private evaluateCondition(condition: string, alert: AnomalyAlert): boolean {
    // Simplified condition evaluation
    // In a real implementation, this would use a proper expression evaluator
    try {
      // Example: "severity === 'high' || severity === 'critical'"
      // eslint-disable-next-line no-eval
      return eval(condition.replace(/severity/g, `"${alert.severity}"`))
    } catch {
      console.error('Condition evaluation failed:', error)
      return false
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): AnomalyAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.status === 'open')
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): AnomalyAlert | null {
    return this.alerts.get(alertId) || null
  }

  /**
   * Update alert status
   */
  updateAlertStatus(
    alertId: string,
    status: AnomalyAlert['status'],
    resolutionNotes?: string,
    assignedTo?: string,
  ): boolean {
    const alert = this.alerts.get(alertId)
    if (!alert) return false

    alert.status = status
    alert.assignedTo = assignedTo

    if (status === 'resolved') {
      alert.resolvedAt = new Date().toISOString()
    }

    if (resolutionNotes) {
      alert.resolutionNotes = resolutionNotes
    }

    return true
  }

  /**
   * Get detection rules
   */
  getRules(): AnomalyRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<AnomalyRule>): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) return false

    this.rules.set(ruleId, {
      ...rule,
      ...updates,
      lastUpdated: new Date().toISOString(),
    })

    return true
  }

  /**
   * Get configuration
   */
  getConfiguration(): DetectionConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfiguration(updates: Partial<DetectionConfig>): DetectionConfig {
    this.config = detectionConfigSchema.parse({
      ...this.config,
      ...updates,
    })

    return this.config
  }

  /**
   * Get service health status
   */
  getHealthStatus(): any {
    return {
      initialized: this.isInitialized,
      alertsCount: this.alerts.size,
      rulesCount: this.rules.size,
      modelsLoaded: this.mlModels.size,
      activeAlerts: this.getActiveAlerts().length,
      configuration: this.config,
    }
  }
}
