// 📊 Audit Logging & Performance Monitoring - Smart Search + NLP Integration
// NeonPro - Sistema de Auditoria e Monitoramento de Performance
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { 
  SearchAuditLog, 
  SearchAnalytics, 
  SearchOptimizationMetrics,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchIntent,
  SearchContext 
} from '@/lib/types/search-types';

export interface PerformanceMetrics {
  queryProcessingTime: number;
  nlpProcessingTime: number;
  searchExecutionTime: number;
  resultFormattingTime: number;
  totalResponseTime: number;
  cacheHitRatio: number;
  memoryUsage: number;
  cpuUsage?: number;
  indexSize: number;
  throughput: number; // queries per second
}

export interface ComplianceMetrics {
  lgpdCompliantQueries: number;
  dataAccessAttempts: number;
  unauthorizedAccess: number;
  sensitiveDataExposure: number;
  consentValidations: number;
  dataMinimizationScore: number; // 0-100
  auditCoverage: number; // 0-100
}

export interface UserBehaviorMetrics {
  userId: string;
  sessionId: string;
  queryCount: number;
  avgQueryLength: number;
  avgResultsViewed: number;
  searchPatterns: string[];
  preferredSearchModes: Record<string, number>;
  clickThroughRate: number;
  sessionDuration: number;
  abandonment: {
    totalQueries: number;
    abandonedQueries: number;
    abandonmentRate: number;
    reasonsForAbandonment: string[];
  };
}

export interface SystemHealthMetrics {
  timestamp: Date;
  systemLoad: number;
  availableMemory: number;
  diskUsage: number;
  networkLatency: number;
  errorRate: number;
  serviceUptime: number;
  degradedServices: string[];
  activeConnections: number;
}

export class SearchAuditLogger {
  private auditQueue: SearchAuditLog[] = [];
  private performanceBuffer: PerformanceMetrics[] = [];
  private complianceTracker: ComplianceTracker;
  private performanceMonitor: PerformanceMonitor;
  private alertManager: AlertManager;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.complianceTracker = new ComplianceTracker();
    this.performanceMonitor = new PerformanceMonitor();
    this.alertManager = new AlertManager();
    this.startBatchProcessor();
    this.startPerformanceMonitoring();
  }

  /**
   * Log search audit event
   */
  public async logSearchEvent(
    query: SearchQuery,
    response: SearchResponse,
    userContext: {
      ipAddress?: string;
      userAgent?: string;
      sessionMetadata?: any;
    }
  ): Promise<void> {
    const auditLog: SearchAuditLog = {
      id: this.generateAuditId(),
      userId: query.userId,
      sessionId: query.sessionId,
      query: query.query,
      intent: response.analytics.intent,
      context: response.analytics.context,
      results: response.results.map(result => ({
        entityId: result.id,
        entityType: result.entityType,
        score: result.score,
        clicked: false // Will be updated later
      })),
      performance: {
        searchTime: response.searchTime,
        indexTime: 0, // TODO: Implement
        totalTime: response.searchTime
      },
      compliance: await this.complianceTracker.analyzeCompliance(query, response),
      timestamp: new Date(),
      ipAddress: userContext.ipAddress || 'unknown',
      userAgent: userContext.userAgent || 'unknown'
    };

    // Add to queue
    this.auditQueue.push(auditLog);

    // Check for immediate compliance alerts
    await this.checkComplianceAlerts(auditLog);

    // Flush if queue is full
    if (this.auditQueue.length >= this.batchSize) {
      await this.flushAuditLogs();
    }
  }

  /**
   * Log click-through event
   */
  public async logClickEvent(
    auditId: string,
    resultId: string,
    userId: string
  ): Promise<void> {
    // Find and update the audit log
    const auditLog = this.auditQueue.find(log => log.id === auditId);
    if (auditLog) {
      const result = auditLog.results.find(r => r.entityId === resultId);
      if (result) {
        result.clicked = true;
      }
    }

    // Also log as separate event for real-time analytics
    await this.logEvent('click_through', {
      auditId,
      resultId,
      userId,
      timestamp: new Date()
    });
  }

  /**
   * Log performance metrics
   */
  public async logPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    // Add to buffer
    this.performanceBuffer.push({
      ...metrics,
      timestamp: new Date() as any
    });

    // Check for performance alerts
    await this.checkPerformanceAlerts(metrics);

    // Keep buffer size manageable
    if (this.performanceBuffer.length > 1000) {
      this.performanceBuffer = this.performanceBuffer.slice(-500);
    }
  }

  /**
   * Log compliance event
   */
  public async logComplianceEvent(
    eventType: 'data_access' | 'consent_check' | 'data_minimization' | 'unauthorized_attempt',
    details: {
      userId: string;
      dataType: string;
      action: string;
      authorized: boolean;
      sensitiveData?: boolean;
      consentStatus?: string;
      metadata?: any;
    }
  ): Promise<void> {
    await this.complianceTracker.recordEvent(eventType, details);

    // Log critical compliance events immediately
    if (!details.authorized || details.sensitiveData) {
      await this.alertManager.sendComplianceAlert({
        type: eventType,
        severity: details.authorized ? 'medium' : 'high',
        details,
        timestamp: new Date()
      });
    }
  }

  /**
   * Log user behavior metrics
   */
  public async logUserBehavior(
    userId: string,
    sessionId: string,
    behavior: {
      action: 'search' | 'click' | 'abandon' | 'refine' | 'session_end';
      query?: string;
      resultId?: string;
      reason?: string;
      metadata?: any;
    }
  ): Promise<void> {
    await this.logEvent('user_behavior', {
      userId,
      sessionId,
      action: behavior.action,
      timestamp: new Date(),
      ...behavior
    });
  }

  /**
   * Log system health metrics
   */
  public async logSystemHealth(metrics: SystemHealthMetrics): Promise<void> {
    await this.logEvent('system_health', metrics);

    // Check for system health alerts
    if (metrics.errorRate > 0.05 || metrics.systemLoad > 0.9) {
      await this.alertManager.sendSystemAlert({
        type: 'system_health',
        severity: metrics.errorRate > 0.1 ? 'high' : 'medium',
        metrics,
        timestamp: new Date()
      });
    }
  }

  /**
   * Generate comprehensive audit report
   */
  public async generateAuditReport(
    startDate: Date,
    endDate: Date,
    options: {
      includePerformance?: boolean;
      includeCompliance?: boolean;
      includeUserBehavior?: boolean;
      userId?: string;
      format?: 'json' | 'csv' | 'pdf';
    } = {}
  ): Promise<any> {
    const report = {
      period: { startDate, endDate },
      summary: await this.getAuditSummary(startDate, endDate, options.userId),
      performance: options.includePerformance ? 
        await this.getPerformanceReport(startDate, endDate) : null,
      compliance: options.includeCompliance ? 
        await this.getComplianceReport(startDate, endDate) : null,
      userBehavior: options.includeUserBehavior ? 
        await this.getUserBehaviorReport(startDate, endDate, options.userId) : null,
      generatedAt: new Date()
    };

    return this.formatReport(report, options.format || 'json');
  }

  /**
   * Get real-time search analytics
   */
  public async getRealTimeAnalytics(): Promise<{
    currentQueries: number;
    avgResponseTime: number;
    errorRate: number;
    popularSearches: Array<{ query: string; count: number }>;
    systemHealth: 'healthy' | 'degraded' | 'critical';
    alerts: Array<{ type: string; message: string; timestamp: Date }>;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      currentQueries: await this.getActiveQueriesCount(),
      avgResponseTime: await this.getAverageResponseTime(oneHourAgo, now),
      errorRate: await this.getErrorRate(oneHourAgo, now),
      popularSearches: await this.getPopularSearches(oneHourAgo, now),
      systemHealth: await this.getSystemHealthStatus(),
      alerts: await this.getRecentAlerts(oneHourAgo, now)
    };
  }

  /**
   * Private helper methods
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async flushAuditLogs(): Promise<void> {
    if (this.auditQueue.length === 0) return;

    try {
      // In production, this would write to database
      console.log(`Flushing ${this.auditQueue.length} audit logs`);
      
      // Mock database write
      await this.writeToDatabase(this.auditQueue);
      
      // Clear queue
      this.auditQueue = [];
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Keep logs in queue for retry
    }
  }

  private async writeToDatabase(logs: SearchAuditLog[]): Promise<void> {
    // Mock implementation - replace with actual database write
    console.log('Writing audit logs to database:', logs.length);
  }

  private async checkComplianceAlerts(auditLog: SearchAuditLog): Promise<void> {
    if (!auditLog.compliance.lgpdCompliant) {
      await this.alertManager.sendComplianceAlert({
        type: 'lgpd_violation',
        severity: 'high',
        details: { auditId: auditLog.id, userId: auditLog.userId },
        timestamp: new Date()
      });
    }

    if (auditLog.compliance.sensitiveDataAccessed.length > 0) {
      await this.alertManager.sendComplianceAlert({
        type: 'sensitive_data_access',
        severity: 'medium',
        details: { 
          auditId: auditLog.id, 
          userId: auditLog.userId,
          sensitiveData: auditLog.compliance.sensitiveDataAccessed
        },
        timestamp: new Date()
      });
    }
  }

  private async checkPerformanceAlerts(metrics: PerformanceMetrics): Promise<void> {
    if (metrics.totalResponseTime > 5000) { // 5 seconds
      await this.alertManager.sendPerformanceAlert({
        type: 'slow_response',
        severity: 'medium',
        metrics,
        timestamp: new Date()
      });
    }

    if (metrics.cacheHitRatio < 0.5) { // Less than 50%
      await this.alertManager.sendPerformanceAlert({
        type: 'low_cache_efficiency',
        severity: 'low',
        metrics,
        timestamp: new Date()
      });
    }
  }

  private async logEvent(type: string, data: any): Promise<void> {
    // Mock implementation for generic event logging
    console.log(`[${type}]`, data);
  }

  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.auditQueue.length > 0) {
        await this.flushAuditLogs();
      }
    }, this.flushInterval);
  }

  private startPerformanceMonitoring(): void {
    // Start continuous performance monitoring
    this.performanceMonitor.start();
  }

  private async getAuditSummary(
    startDate: Date, 
    endDate: Date, 
    userId?: string
  ): Promise<any> {
    // Mock implementation
    return {
      totalQueries: 1000,
      uniqueUsers: 50,
      avgResponseTime: 250,
      errorRate: 0.02,
      complianceScore: 98.5
    };
  }

  private async getPerformanceReport(startDate: Date, endDate: Date): Promise<any> {
    return this.performanceMonitor.generateReport(startDate, endDate);
  }

  private async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    return this.complianceTracker.generateReport(startDate, endDate);
  }

  private async getUserBehaviorReport(
    startDate: Date, 
    endDate: Date, 
    userId?: string
  ): Promise<any> {
    // Mock implementation
    return {
      searchPatterns: [],
      clickThroughRates: {},
      abandonmentReasons: []
    };
  }

  private formatReport(report: any, format: string): any {
    switch (format) {
      case 'csv':
        return this.convertToCSV(report);
      case 'pdf':
        return this.convertToPDF(report);
      default:
        return report;
    }
  }

  private convertToCSV(report: any): string {
    // Mock CSV conversion
    return 'CSV content';
  }

  private convertToPDF(report: any): Buffer {
    // Mock PDF conversion
    return Buffer.from('PDF content');
  }

  // Mock methods for real-time analytics
  private async getActiveQueriesCount(): Promise<number> { return 5; }
  private async getAverageResponseTime(start: Date, end: Date): Promise<number> { return 250; }
  private async getErrorRate(start: Date, end: Date): Promise<number> { return 0.02; }
  private async getPopularSearches(start: Date, end: Date): Promise<Array<{ query: string; count: number }>> {
    return [
      { query: 'pacientes', count: 50 },
      { query: 'agendamentos', count: 35 },
      { query: 'procedimentos', count: 28 }
    ];
  }
  private async getSystemHealthStatus(): Promise<'healthy' | 'degraded' | 'critical'> { return 'healthy'; }
  private async getRecentAlerts(start: Date, end: Date): Promise<Array<{ type: string; message: string; timestamp: Date }>> {
    return [];
  }
}

/**
 * Compliance Tracker for LGPD and healthcare regulations
 */
class ComplianceTracker {
  private events: Array<{
    type: string;
    details: any;
    timestamp: Date;
  }> = [];

  async analyzeCompliance(
    query: SearchQuery, 
    response: SearchResponse
  ): Promise<SearchAuditLog['compliance']> {
    const sensitiveDataAccessed = this.identifySensitiveData(response.results);
    const dataAccessLogged = true; // Always log in our system
    const lgpdCompliant = await this.checkLGPDCompliance(query, response);

    return {
      dataAccessLogged,
      sensitiveDataAccessed,
      lgpdCompliant
    };
  }

  async recordEvent(type: string, details: any): Promise<void> {
    this.events.push({
      type,
      details,
      timestamp: new Date()
    });

    // Keep only last 10000 events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }

  async generateReport(startDate: Date, endDate: Date): Promise<ComplianceMetrics> {
    const relevantEvents = this.events.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );

    return {
      lgpdCompliantQueries: relevantEvents.filter(e => e.type === 'lgpd_compliant').length,
      dataAccessAttempts: relevantEvents.filter(e => e.type === 'data_access').length,
      unauthorizedAccess: relevantEvents.filter(e => e.type === 'unauthorized_attempt').length,
      sensitiveDataExposure: relevantEvents.filter(e => e.type === 'sensitive_data_access').length,
      consentValidations: relevantEvents.filter(e => e.type === 'consent_check').length,
      dataMinimizationScore: this.calculateDataMinimizationScore(relevantEvents),
      auditCoverage: this.calculateAuditCoverage(relevantEvents)
    };
  }

  private identifySensitiveData(results: SearchResult[]): string[] {
    const sensitiveTypes = ['medical_record', 'patient', 'prescription'];
    return results
      .filter(result => sensitiveTypes.includes(result.entityType))
      .map(result => result.entityType);
  }

  private async checkLGPDCompliance(
    query: SearchQuery, 
    response: SearchResponse
  ): Promise<boolean> {
    // Check if user has permission to access returned data
    // Check if data minimization is applied
    // Check if purpose limitation is respected
    // Mock implementation
    return true;
  }

  private calculateDataMinimizationScore(events: any[]): number {
    // Mock calculation
    return 95;
  }

  private calculateAuditCoverage(events: any[]): number {
    // Mock calculation
    return 98;
  }
}

/**
 * Performance Monitor for search operations
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
  }

  stop(): void {
    this.isRunning = false;
  }

  async generateReport(startDate: Date, endDate: Date): Promise<SearchOptimizationMetrics> {
    const relevantMetrics = this.metrics.filter(m => {
      const timestamp = (m as any).timestamp;
      return timestamp >= startDate && timestamp <= endDate;
    });

    if (relevantMetrics.length === 0) {
      return this.getEmptyMetrics();
    }

    return {
      averageSearchTime: this.calculateAverage(relevantMetrics, 'totalResponseTime'),
      cacheHitRate: this.calculateAverage(relevantMetrics, 'cacheHitRatio'),
      indexEfficiency: this.calculateIndexEfficiency(relevantMetrics),
      userSatisfactionScore: 8.5, // Mock value
      querySuccessRate: 0.98, // Mock value
      mostFrequentQueries: [
        { query: 'pacientes', count: 150, averageResults: 25, successRate: 0.95 },
        { query: 'agendamentos', count: 120, averageResults: 18, successRate: 0.98 },
        { query: 'procedimentos', count: 90, averageResults: 12, successRate: 0.92 }
      ],
      performanceByIntent: {
        'patient_lookup': { averageTime: 200, successRate: 0.98, userSatisfaction: 9.0 },
        'appointment_search': { averageTime: 150, successRate: 0.99, userSatisfaction: 8.8 },
        'medical_record_search': { averageTime: 300, successRate: 0.95, userSatisfaction: 8.5 },
        'procedure_search': { averageTime: 250, successRate: 0.96, userSatisfaction: 8.7 },
        'financial_search': { averageTime: 180, successRate: 0.97, userSatisfaction: 8.6 },
        'compliance_search': { averageTime: 400, successRate: 0.94, userSatisfaction: 8.2 },
        'similar_cases': { averageTime: 500, successRate: 0.90, userSatisfaction: 8.0 },
        'treatment_history': { averageTime: 350, successRate: 0.93, userSatisfaction: 8.3 },
        'analytics_search': { averageTime: 600, successRate: 0.89, userSatisfaction: 7.8 },
        'general_search': { averageTime: 220, successRate: 0.91, userSatisfaction: 7.9 }
      },
      indexStatistics: {
        'patients': { documentsCount: 10000, sizeInMB: 50, lastOptimized: new Date(), queryPerformance: 9.2 },
        'appointments': { documentsCount: 50000, sizeInMB: 25, lastOptimized: new Date(), queryPerformance: 9.5 },
        'procedures': { documentsCount: 5000, sizeInMB: 15, lastOptimized: new Date(), queryPerformance: 8.8 },
        'payments': { documentsCount: 30000, sizeInMB: 20, lastOptimized: new Date(), queryPerformance: 9.0 }
      }
    };
  }

  private async collectSystemMetrics(): Promise<void> {
    // Mock system metrics collection
    const metrics: PerformanceMetrics = {
      queryProcessingTime: Math.random() * 100,
      nlpProcessingTime: Math.random() * 50,
      searchExecutionTime: Math.random() * 200,
      resultFormattingTime: Math.random() * 30,
      totalResponseTime: Math.random() * 500,
      cacheHitRatio: 0.7 + Math.random() * 0.3,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100,
      indexSize: 1000 + Math.random() * 500,
      throughput: 10 + Math.random() * 20
    };

    this.metrics.push({ ...metrics, timestamp: new Date() } as any);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  private calculateAverage(metrics: PerformanceMetrics[], field: keyof PerformanceMetrics): number {
    const values = metrics.map(m => m[field] as number);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateIndexEfficiency(metrics: PerformanceMetrics[]): number {
    // Mock calculation
    return 85 + Math.random() * 10;
  }

  private getEmptyMetrics(): SearchOptimizationMetrics {
    return {
      averageSearchTime: 0,
      cacheHitRate: 0,
      indexEfficiency: 0,
      userSatisfactionScore: 0,
      querySuccessRate: 0,
      mostFrequentQueries: [],
      performanceByIntent: {} as any,
      indexStatistics: {}
    };
  }
}

/**
 * Alert Manager for critical events
 */
class AlertManager {
  async sendComplianceAlert(alert: {
    type: string;
    severity: string;
    details: any;
    timestamp: Date;
  }): Promise<void> {
    console.warn(`[COMPLIANCE ALERT] ${alert.type}:`, alert);
    // In production, this would send to monitoring system
  }

  async sendPerformanceAlert(alert: {
    type: string;
    severity: string;
    metrics: PerformanceMetrics;
    timestamp: Date;
  }): Promise<void> {
    console.warn(`[PERFORMANCE ALERT] ${alert.type}:`, alert);
    // In production, this would send to monitoring system
  }

  async sendSystemAlert(alert: {
    type: string;
    severity: string;
    metrics?: SystemHealthMetrics;
    timestamp: Date;
  }): Promise<void> {
    console.warn(`[SYSTEM ALERT] ${alert.type}:`, alert);
    // In production, this would send to monitoring system
  }
}

export { 
  SearchAuditLogger, 
  ComplianceTracker, 
  PerformanceMonitor, 
  AlertManager,
  type PerformanceMetrics,
  type ComplianceMetrics,
  type UserBehaviorMetrics,
  type SystemHealthMetrics
};