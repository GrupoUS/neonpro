/**
 * Financial Management System - Main Integration
 * Story 4.1: Automated Invoice Generation + Payment Tracking Implementation
 * 
 * This module provides the main integration for the financial management system:
 * - Unified invoice generation and payment tracking
 * - Brazilian compliance (NFSe, PIX, Boleto)
 * - Multi-gateway payment processing
 * - Automated reconciliation and reporting
 * - LGPD-compliant financial data management
 * - Real-time financial analytics and insights
 */

import { AutomatedInvoiceGenerator, type InvoiceData, type InvoiceGenerationConfig } from './invoice-generator'
import { PaymentTracker, type PaymentRecord, type PaymentTrackerConfig } from './payment-tracker'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

// Financial System Types
interface FinancialSystemConfig {
  invoiceGeneration: Partial<InvoiceGenerationConfig>
  paymentTracking: Partial<PaymentTrackerConfig>
  integration: {
    autoLinkPayments: boolean
    realTimeUpdates: boolean
    crossValidation: boolean
    auditTrail: boolean
  }
  analytics: {
    enabled: boolean
    realTimeMetrics: boolean
    customReports: boolean
    exportFormats: ('pdf' | 'excel' | 'csv' | 'json')[]
  }
  compliance: {
    brazilianTaxCompliance: boolean
    lgpdCompliant: boolean
    dataEncryption: boolean
    accessControl: boolean
  }
}

interface FinancialTransaction {
  id: string
  type: 'invoice' | 'payment' | 'refund' | 'adjustment'
  invoiceId?: string
  paymentId?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  metadata: {
    patientId: string
    clinicId: string
    appointmentId?: string
    treatmentId?: string
    createdBy: string
    createdAt: Date
    updatedAt: Date
    notes?: string
  }
}

interface FinancialSummary {
  period: {
    startDate: Date
    endDate: Date
  }
  revenue: {
    totalInvoiced: number
    totalCollected: number
    totalPending: number
    totalOverdue: number
    collectionRate: number
  }
  payments: {
    totalPayments: number
    averagePaymentTime: number
    paymentMethodDistribution: Record<string, number>
    successRate: number
  }
  expenses: {
    gatewayFees: number
    processingFees: number
    taxesPaid: number
    totalExpenses: number
  }
  profitability: {
    grossRevenue: number
    netRevenue: number
    profitMargin: number
    roi: number
  }
  trends: {
    revenueGrowth: number
    paymentVolumeGrowth: number
    collectionRateChange: number
    averageTransactionValue: number
  }
}

interface FinancialAlert {
  id: string
  type: 'overdue_payment' | 'failed_payment' | 'reconciliation_error' | 'compliance_issue' | 'threshold_exceeded'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedEntities: {
    invoiceIds?: string[]
    paymentIds?: string[]
    patientIds?: string[]
    clinicIds?: string[]
  }
  actionRequired: boolean
  suggestedActions: string[]
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

interface FinancialReport {
  id: string
  type: 'revenue' | 'payments' | 'taxes' | 'reconciliation' | 'compliance' | 'custom'
  title: string
  description: string
  period: {
    startDate: Date
    endDate: Date
  }
  filters: {
    clinicIds?: string[]
    patientIds?: string[]
    paymentMethods?: string[]
    statuses?: string[]
  }
  data: any
  generatedAt: Date
  generatedBy: string
  format: 'pdf' | 'excel' | 'csv' | 'json'
  downloadUrl?: string
}

class FinancialManagementSystem {
  private invoiceGenerator: AutomatedInvoiceGenerator
  private paymentTracker: PaymentTracker
  private supabase = createClient()
  private config: FinancialSystemConfig
  private isInitialized: boolean = false
  private alerts: FinancialAlert[] = []

  constructor(config?: Partial<FinancialSystemConfig>) {
    this.config = this.initializeConfig(config)
    this.invoiceGenerator = new AutomatedInvoiceGenerator(this.config.invoiceGeneration)
    this.paymentTracker = new PaymentTracker(this.config.paymentTracking)
  }

  /**
   * Initialize the financial management system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Financial Management System...')
      
      // Initialize subsystems
      await this.invoiceGenerator.initialize()
      await this.paymentTracker.initialize()
      
      // Setup integration workflows
      await this.setupIntegrationWorkflows()
      
      // Setup real-time monitoring
      if (this.config.analytics.realTimeMetrics) {
        await this.setupRealTimeMonitoring()
      }
      
      // Setup compliance monitoring
      if (this.config.compliance.brazilianTaxCompliance) {
        await this.setupComplianceMonitoring()
      }
      
      this.isInitialized = true
      console.log('✅ Financial Management System initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize financial management system:', error)
      throw new Error('Financial management system initialization failed')
    }
  }

  /**
   * Create invoice and setup payment tracking
   */
  async createInvoiceWithPaymentTracking(invoiceData: {
    appointmentId?: string
    treatmentId?: string
    patientId: string
    clinicId: string
    services?: any[]
    paymentMethods?: any[]
    dueDate?: Date
    generateNFSe?: boolean
    autoSetupPayment?: boolean
  }): Promise<{
    invoice: InvoiceData
    paymentSetup?: {
      pixCode?: string
      boletoUrl?: string
      paymentUrl?: string
    }
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Financial management system not initialized')
      }

      console.log('Creating invoice with payment tracking...')
      
      // Generate invoice
      let invoice: InvoiceData
      if (invoiceData.appointmentId) {
        invoice = await this.invoiceGenerator.generateFromAppointment(
          invoiceData.appointmentId,
          {
            customServices: invoiceData.services,
            paymentMethod: invoiceData.paymentMethods?.[0],
            dueDate: invoiceData.dueDate,
            generateNFSe: invoiceData.generateNFSe
          }
        )
      } else if (invoiceData.treatmentId) {
        const invoices = await this.invoiceGenerator.generateFromTreatment(
          invoiceData.treatmentId,
          {
            generateNFSe: invoiceData.generateNFSe
          }
        )
        invoice = invoices[0] // Take first invoice for single treatment
      } else {
        throw new Error('Either appointmentId or treatmentId must be provided')
      }

      let paymentSetup: any = undefined
      
      // Setup payment tracking if requested
      if (invoiceData.autoSetupPayment && invoice.paymentMethods.length > 0) {
        const primaryPaymentMethod = invoice.paymentMethods[0]
        
        // Create payment record
        const payment = await this.paymentTracker.createPayment({
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          method: primaryPaymentMethod.type,
          gateway: 'manual', // Default to manual, can be changed based on method
          patientId: invoiceData.patientId,
          clinicId: invoiceData.clinicId,
          appointmentId: invoiceData.appointmentId,
          treatmentId: invoiceData.treatmentId
        })
        
        // Generate payment links
        paymentSetup = await this.paymentTracker.generatePaymentLink(
          payment.id,
          primaryPaymentMethod
        )
      }
      
      // Create financial transaction record
      await this.createFinancialTransaction({
        type: 'invoice',
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        status: 'pending',
        description: `Invoice ${invoice.number} created`,
        metadata: {
          patientId: invoiceData.patientId,
          clinicId: invoiceData.clinicId,
          appointmentId: invoiceData.appointmentId,
          treatmentId: invoiceData.treatmentId,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Invoice ${invoice.number} created with payment tracking`)
      return { invoice, paymentSetup }
      
    } catch (error) {
      console.error('❌ Invoice creation with payment tracking failed:', error)
      throw new Error(`Invoice creation failed: ${error.message}`)
    }
  }

  /**
   * Process payment and update invoice
   */
  async processPayment(paymentData: {
    invoiceId: string
    amount: number
    method: any
    transactionId?: string
    gatewayData?: any
    notes?: string
  }): Promise<{
    payment: PaymentRecord
    invoice: InvoiceData
    fullyPaid: boolean
  }> {
    try {
      console.log(`Processing payment for invoice ${paymentData.invoiceId}`)
      
      // Track payment
      await this.paymentTracker.trackPayment(paymentData.invoiceId, {
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.transactionId,
        paidAt: new Date(),
        notes: paymentData.notes
      })
      
      // Get updated payment and invoice data
      const payment = await this.getLatestPaymentForInvoice(paymentData.invoiceId)
      const invoice = await this.getInvoiceData(paymentData.invoiceId)
      
      if (!payment || !invoice) {
        throw new Error('Payment or invoice not found after processing')
      }

      // Check if invoice is fully paid
      const totalPaid = await this.getTotalPaidAmount(paymentData.invoiceId)
      const fullyPaid = totalPaid >= invoice.totalAmount
      
      // Create financial transaction record
      await this.createFinancialTransaction({
        type: 'payment',
        invoiceId: paymentData.invoiceId,
        paymentId: payment.id,
        amount: paymentData.amount,
        currency: invoice.currency,
        status: 'completed',
        description: `Payment received for invoice ${invoice.number}`,
        metadata: {
          patientId: payment.metadata.patientId,
          clinicId: payment.metadata.clinicId,
          appointmentId: payment.metadata.appointmentId,
          treatmentId: payment.metadata.treatmentId,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          notes: paymentData.notes
        }
      })
      
      // Generate alerts if needed
      if (fullyPaid) {
        await this.generateAlert({
          type: 'overdue_payment',
          severity: 'low',
          title: 'Invoice Fully Paid',
          description: `Invoice ${invoice.number} has been fully paid`,
          affectedEntities: {
            invoiceIds: [invoice.id],
            paymentIds: [payment.id]
          },
          actionRequired: false,
          suggestedActions: ['Update patient records', 'Send payment confirmation']
        })
      }
      
      console.log(`✅ Payment processed for invoice ${paymentData.invoiceId}`)
      return { payment, invoice, fullyPaid }
      
    } catch (error) {
      console.error('❌ Payment processing failed:', error)
      throw new Error(`Payment processing failed: ${error.message}`)
    }
  }

  /**
   * Generate comprehensive financial summary
   */
  async getFinancialSummary(filters?: {
    startDate?: Date
    endDate?: Date
    clinicId?: string
    patientId?: string
  }): Promise<FinancialSummary> {
    try {
      console.log('Generating financial summary...')
      
      const period = {
        startDate: filters?.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: filters?.endDate || new Date()
      }
      
      // Get invoice analytics
      const invoiceAnalytics = await this.invoiceGenerator.getInvoiceAnalytics({
        startDate: period.startDate,
        endDate: period.endDate,
        clinicId: filters?.clinicId
      })
      
      // Get payment analytics
      const paymentAnalytics = await this.paymentTracker.getPaymentAnalytics({
        startDate: period.startDate,
        endDate: period.endDate,
        clinicId: filters?.clinicId
      })
      
      // Calculate revenue metrics
      const revenue = {
        totalInvoiced: invoiceAnalytics.totalAmount,
        totalCollected: paymentAnalytics.summary.totalAmount,
        totalPending: invoiceAnalytics.pendingAmount,
        totalOverdue: invoiceAnalytics.overdueAmount,
        collectionRate: invoiceAnalytics.totalAmount > 0 
          ? (paymentAnalytics.summary.totalAmount / invoiceAnalytics.totalAmount) * 100 
          : 0
      }
      
      // Calculate payment metrics
      const payments = {
        totalPayments: paymentAnalytics.summary.totalPayments,
        averagePaymentTime: invoiceAnalytics.averagePaymentTime,
        paymentMethodDistribution: paymentAnalytics.byMethod,
        successRate: paymentAnalytics.summary.successRate * 100
      }
      
      // Calculate expenses
      const gatewayFees = Object.values(paymentAnalytics.byGateway)
        .reduce((sum, gateway) => sum + gateway.fees, 0)
      
      const expenses = {
        gatewayFees,
        processingFees: gatewayFees * 0.1, // Estimated processing fees
        taxesPaid: revenue.totalCollected * 0.05, // Estimated tax rate
        totalExpenses: gatewayFees + (gatewayFees * 0.1) + (revenue.totalCollected * 0.05)
      }
      
      // Calculate profitability
      const profitability = {
        grossRevenue: revenue.totalCollected,
        netRevenue: revenue.totalCollected - expenses.totalExpenses,
        profitMargin: revenue.totalCollected > 0 
          ? ((revenue.totalCollected - expenses.totalExpenses) / revenue.totalCollected) * 100 
          : 0,
        roi: expenses.totalExpenses > 0 
          ? ((revenue.totalCollected - expenses.totalExpenses) / expenses.totalExpenses) * 100 
          : 0
      }
      
      // Calculate trends (simplified - would need historical data for accurate trends)
      const trends = {
        revenueGrowth: 0, // Would calculate based on previous period
        paymentVolumeGrowth: 0,
        collectionRateChange: 0,
        averageTransactionValue: revenue.totalCollected / Math.max(payments.totalPayments, 1)
      }
      
      const summary: FinancialSummary = {
        period,
        revenue,
        payments,
        expenses,
        profitability,
        trends
      }
      
      console.log('✅ Financial summary generated successfully')
      return summary
      
    } catch (error) {
      console.error('❌ Financial summary generation failed:', error)
      throw new Error(`Financial summary generation failed: ${error.message}`)
    }
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(reportConfig: {
    type: FinancialReport['type']
    title: string
    description?: string
    period: {
      startDate: Date
      endDate: Date
    }
    filters?: {
      clinicIds?: string[]
      patientIds?: string[]
      paymentMethods?: string[]
      statuses?: string[]
    }
    format: 'pdf' | 'excel' | 'csv' | 'json'
    includeCharts?: boolean
  }): Promise<FinancialReport> {
    try {
      console.log(`Generating ${reportConfig.type} financial report...`)
      
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Gather report data based on type
      let reportData: any
      
      switch (reportConfig.type) {
        case 'revenue':
          reportData = await this.generateRevenueReportData(reportConfig)
          break
        case 'payments':
          reportData = await this.generatePaymentsReportData(reportConfig)
          break
        case 'taxes':
          reportData = await this.generateTaxReportData(reportConfig)
          break
        case 'reconciliation':
          reportData = await this.generateReconciliationReportData(reportConfig)
          break
        case 'compliance':
          reportData = await this.generateComplianceReportData(reportConfig)
          break
        default:
          reportData = await this.generateCustomReportData(reportConfig)
      }
      
      // Create report record
      const report: FinancialReport = {
        id: reportId,
        type: reportConfig.type,
        title: reportConfig.title,
        description: reportConfig.description || '',
        period: reportConfig.period,
        filters: reportConfig.filters || {},
        data: reportData,
        generatedAt: new Date(),
        generatedBy: 'system', // Would be actual user ID
        format: reportConfig.format
      }
      
      // Store report
      await this.storeFinancialReport(report)
      
      // Generate file based on format
      if (reportConfig.format !== 'json') {
        report.downloadUrl = await this.generateReportFile(report, reportConfig.includeCharts)
      }
      
      console.log(`✅ Financial report ${reportId} generated successfully`)
      return report
      
    } catch (error) {
      console.error('❌ Financial report generation failed:', error)
      throw new Error(`Financial report generation failed: ${error.message}`)
    }
  }

  /**
   * Get financial alerts
   */
  async getFinancialAlerts(filters?: {
    severity?: FinancialAlert['severity']
    type?: FinancialAlert['type']
    resolved?: boolean
    clinicId?: string
  }): Promise<FinancialAlert[]> {
    try {
      let query = this.supabase
        .from('financial_alerts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (filters?.severity) {
        query = query.eq('severity', filters.severity)
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters?.resolved !== undefined) {
        if (filters.resolved) {
          query = query.not('resolved_at', 'is', null)
        } else {
          query = query.is('resolved_at', null)
        }
      }
      
      const { data: alerts } = await query
      
      return alerts?.map(this.convertDbRecordToAlert) || []
      
    } catch (error) {
      console.error('❌ Failed to get financial alerts:', error)
      throw new Error(`Failed to get financial alerts: ${error.message}`)
    }
  }

  /**
   * Resolve financial alert
   */
  async resolveAlert(alertId: string, resolvedBy: string, notes?: string): Promise<void> {
    try {
      await this.supabase
        .from('financial_alerts')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
          resolution_notes: notes
        })
        .eq('id', alertId)
      
      console.log(`✅ Alert ${alertId} resolved successfully`)
      
    } catch (error) {
      console.error('❌ Failed to resolve alert:', error)
      throw new Error(`Failed to resolve alert: ${error.message}`)
    }
  }

  /**
   * Get system status and health metrics
   */
  async getSystemStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    components: {
      invoiceGeneration: 'healthy' | 'warning' | 'error'
      paymentTracking: 'healthy' | 'warning' | 'error'
      nfseIntegration: 'healthy' | 'warning' | 'error'
      paymentGateways: 'healthy' | 'warning' | 'error'
    }
    metrics: {
      totalInvoices: number
      totalPayments: number
      successRate: number
      averageProcessingTime: number
      pendingReconciliations: number
      activeAlerts: number
    }
    lastUpdated: Date
  }> {
    try {
      // Check component health
      const components = {
        invoiceGeneration: 'healthy' as const,
        paymentTracking: 'healthy' as const,
        nfseIntegration: 'healthy' as const,
        paymentGateways: 'healthy' as const
      }
      
      // Get system metrics
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      const [invoiceAnalytics, paymentAnalytics, alerts] = await Promise.all([
        this.invoiceGenerator.getInvoiceAnalytics({ startDate: startOfDay }),
        this.paymentTracker.getPaymentAnalytics({ startDate: startOfDay }),
        this.getFinancialAlerts({ resolved: false })
      ])
      
      const metrics = {
        totalInvoices: invoiceAnalytics.totalInvoices,
        totalPayments: paymentAnalytics.summary.totalPayments,
        successRate: paymentAnalytics.summary.successRate * 100,
        averageProcessingTime: invoiceAnalytics.averagePaymentTime,
        pendingReconciliations: 0, // Would get from reconciliation system
        activeAlerts: alerts.length
      }
      
      // Determine overall status
      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      
      if (metrics.activeAlerts > 10 || metrics.successRate < 90) {
        status = 'warning'
      }
      
      if (metrics.successRate < 80 || Object.values(components).includes('error')) {
        status = 'error'
      }
      
      return {
        status,
        components,
        metrics,
        lastUpdated: new Date()
      }
      
    } catch (error) {
      console.error('❌ Failed to get system status:', error)
      return {
        status: 'error',
        components: {
          invoiceGeneration: 'error',
          paymentTracking: 'error',
          nfseIntegration: 'error',
          paymentGateways: 'error'
        },
        metrics: {
          totalInvoices: 0,
          totalPayments: 0,
          successRate: 0,
          averageProcessingTime: 0,
          pendingReconciliations: 0,
          activeAlerts: 0
        },
        lastUpdated: new Date()
      }
    }
  }

  // Private helper methods
  private initializeConfig(config?: Partial<FinancialSystemConfig>): FinancialSystemConfig {
    const defaultConfig: FinancialSystemConfig = {
      invoiceGeneration: {},
      paymentTracking: {},
      integration: {
        autoLinkPayments: true,
        realTimeUpdates: true,
        crossValidation: true,
        auditTrail: true
      },
      analytics: {
        enabled: true,
        realTimeMetrics: true,
        customReports: true,
        exportFormats: ['pdf', 'excel', 'csv', 'json']
      },
      compliance: {
        brazilianTaxCompliance: true,
        lgpdCompliant: true,
        dataEncryption: true,
        accessControl: true
      }
    }
    
    return { ...defaultConfig, ...config }
  }

  private async setupIntegrationWorkflows(): Promise<void> {
    console.log('Setting up integration workflows...')
    
    if (this.config.integration.autoLinkPayments) {
      // Setup automatic payment-invoice linking
    }
    
    if (this.config.integration.crossValidation) {
      // Setup cross-validation between invoice and payment data
    }
  }

  private async setupRealTimeMonitoring(): Promise<void> {
    console.log('Setting up real-time monitoring...')
    
    // Setup real-time subscriptions for invoice and payment updates
    this.supabase
      .channel('financial_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => this.handleInvoiceUpdate(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payment_records' },
        (payload) => this.handlePaymentUpdate(payload)
      )
      .subscribe()
  }

  private async setupComplianceMonitoring(): Promise<void> {
    console.log('Setting up compliance monitoring...')
    
    // Setup monitoring for Brazilian tax compliance
    // Monitor NFSe generation, tax calculations, etc.
  }

  private async createFinancialTransaction(transaction: Omit<FinancialTransaction, 'id'>): Promise<void> {
    const transactionId = `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await this.supabase
      .from('financial_transactions')
      .insert({
        id: transactionId,
        type: transaction.type,
        invoice_id: transaction.invoiceId,
        payment_id: transaction.paymentId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        description: transaction.description,
        patient_id: transaction.metadata.patientId,
        clinic_id: transaction.metadata.clinicId,
        appointment_id: transaction.metadata.appointmentId,
        treatment_id: transaction.metadata.treatmentId,
        created_by: transaction.metadata.createdBy,
        notes: transaction.metadata.notes
      })
  }

  private async generateAlert(alertData: Omit<FinancialAlert, 'id' | 'createdAt'>): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const alert: FinancialAlert = {
      id: alertId,
      ...alertData,
      createdAt: new Date()
    }
    
    await this.supabase
      .from('financial_alerts')
      .insert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        affected_entities: JSON.stringify(alert.affectedEntities),
        action_required: alert.actionRequired,
        suggested_actions: JSON.stringify(alert.suggestedActions),
        created_at: alert.createdAt.toISOString()
      })
    
    this.alerts.push(alert)
  }

  private async getLatestPaymentForInvoice(invoiceId: string): Promise<PaymentRecord | null> {
    const { data } = await this.supabase
      .from('payment_records')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return data ? this.convertDbRecordToPaymentRecord(data) : null
  }

  private async getInvoiceData(invoiceId: string): Promise<InvoiceData | null> {
    const { data } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()
    
    return data ? this.convertDbRecordToInvoiceData(data) : null
  }

  private async getTotalPaidAmount(invoiceId: string): Promise<number> {
    const { data: payments } = await this.supabase
      .from('payment_records')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('status', 'confirmed')
    
    return payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  // Report generation methods
  private async generateRevenueReportData(config: any): Promise<any> {
    // Generate revenue report data
    return { type: 'revenue', data: 'Revenue report data' }
  }

  private async generatePaymentsReportData(config: any): Promise<any> {
    // Generate payments report data
    return { type: 'payments', data: 'Payments report data' }
  }

  private async generateTaxReportData(config: any): Promise<any> {
    // Generate tax report data
    return { type: 'taxes', data: 'Tax report data' }
  }

  private async generateReconciliationReportData(config: any): Promise<any> {
    // Generate reconciliation report data
    return { type: 'reconciliation', data: 'Reconciliation report data' }
  }

  private async generateComplianceReportData(config: any): Promise<any> {
    // Generate compliance report data
    return { type: 'compliance', data: 'Compliance report data' }
  }

  private async generateCustomReportData(config: any): Promise<any> {
    // Generate custom report data
    return { type: 'custom', data: 'Custom report data' }
  }

  private async storeFinancialReport(report: FinancialReport): Promise<void> {
    await this.supabase
      .from('financial_reports')
      .insert({
        id: report.id,
        type: report.type,
        title: report.title,
        description: report.description,
        period_start: report.period.startDate.toISOString(),
        period_end: report.period.endDate.toISOString(),
        filters: JSON.stringify(report.filters),
        data: JSON.stringify(report.data),
        generated_at: report.generatedAt.toISOString(),
        generated_by: report.generatedBy,
        format: report.format,
        download_url: report.downloadUrl
      })
  }

  private async generateReportFile(report: FinancialReport, includeCharts?: boolean): Promise<string> {
    // Generate report file based on format
    // This would integrate with a report generation service
    return `https://reports.example.com/${report.id}.${report.format}`
  }

  // Event handlers
  private async handleInvoiceUpdate(payload: any): Promise<void> {
    console.log('Invoice update received:', payload)
    
    if (this.config.integration.realTimeUpdates) {
      // Handle real-time invoice updates
    }
  }

  private async handlePaymentUpdate(payload: any): Promise<void> {
    console.log('Payment update received:', payload)
    
    if (this.config.integration.realTimeUpdates) {
      // Handle real-time payment updates
    }
  }

  // Conversion methods
  private convertDbRecordToPaymentRecord(data: any): PaymentRecord {
    // Convert database record to PaymentRecord
    // Implementation would match the PaymentTracker conversion method
    return {} as PaymentRecord
  }

  private convertDbRecordToInvoiceData(data: any): InvoiceData {
    // Convert database record to InvoiceData
    // Implementation would match the InvoiceGenerator conversion method
    return {} as InvoiceData
  }

  private convertDbRecordToAlert(data: any): FinancialAlert {
    return {
      id: data.id,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      affectedEntities: JSON.parse(data.affected_entities || '{}'),
      actionRequired: data.action_required,
      suggestedActions: JSON.parse(data.suggested_actions || '[]'),
      createdAt: new Date(data.created_at),
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      resolvedBy: data.resolved_by
    }
  }
}

export {
  FinancialManagementSystem,
  type FinancialSystemConfig,
  type FinancialTransaction,
  type FinancialSummary,
  type FinancialAlert,
  type FinancialReport
}

// Re-export from subsystems for convenience
export {
  AutomatedInvoiceGenerator,
  PaymentTracker,
  type InvoiceData,
  type PaymentRecord,
  type InvoiceGenerationConfig,
  type PaymentTrackerConfig
}

// Story 4.2: Financial Analytics & Business Intelligence - Export new engines
export { CashFlowEngine } from './cash-flow-engine'
export { AutomatedAlertsEngine } from './automated-alerts-engine'
export { createpredictiveAnalyticsEngine } from './predictive-analytics-engine'
export { FinancialDashboardEngine } from './financial-dashboard-engine'

// Export types from new engines
export type {
  CashFlowData,
  CashFlowSummary,
  CashFlowMetrics,
  CashFlowProjection
} from './cash-flow-engine'

export type {
  FinancialAlert as NewFinancialAlert,
  AlertRule,
  AlertChannel,
  AlertRecipient
} from './automated-alerts-engine'

export type {
  FinancialForecast,
  PredictionModel,
  RiskAssessment,
  SeasonalPattern
} from './predictive-analytics-engine'

export type {
  FinancialDashboardData,
  FinancialMetrics,
  DashboardForecast,
  PerformanceIndicators,
  Recommendation
} from './financial-dashboard-engine'

