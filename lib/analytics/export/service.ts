// Analytics Export Service - STORY-SUB-002 Task 7
// Created: 2025-01-22
// High-performance export service with PDF, Excel, and CSV generation

import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import type {
  ExportConfig,
  ExportRequest,
  ExportResponse,
  ExportableData,
  PDFExportOptions,
  ExcelExportOptions,
  CSVExportOptions,
  ExportFormat,
  ReportType,
  DEFAULT_PDF_OPTIONS,
  DEFAULT_EXCEL_OPTIONS,
  DEFAULT_CSV_OPTIONS
} from './types'
import { AnalyticsService } from '../service'
import { createClient } from '@/app/utils/supabase/server'

// ============================================================================
// EXPORT SERVICE CLASS
// ============================================================================

export class AnalyticsExportService {
  private analyticsService: AnalyticsService
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.analyticsService = new AnalyticsService()
    this.supabase = createClient()
  }

  // ========================================================================
  // MAIN EXPORT METHODS
  // ========================================================================

  /**
   * Generate export based on configuration
   */
  async generateExport(request: ExportRequest): Promise<ExportResponse> {
    const startTime = Date.now()
    
    try {
      // Update status to processing
      await this.updateExportStatus(request.id, 'processing', {
        percentage: 0,
        currentStep: 'Fetching data',
        estimatedTimeRemaining: 30000
      })

      // Fetch analytics data
      const data = await this.fetchAnalyticsData(request.config)
      
      await this.updateExportStatus(request.id, 'processing', {
        percentage: 30,
        currentStep: 'Processing data',
        estimatedTimeRemaining: 20000
      })

      // Generate file based on format
      let fileBuffer: Buffer
      let fileName: string
      let mimeType: string

      switch (request.config.format) {
        case 'pdf':
          const pdfOptions = request.pdfOptions || DEFAULT_PDF_OPTIONS
          fileBuffer = await this.generatePDF(data, request.config, pdfOptions)
          fileName = `analytics-${request.config.reportType}-${Date.now()}.pdf`
          mimeType = 'application/pdf'
          break

        case 'excel':
          const excelOptions = request.excelOptions || DEFAULT_EXCEL_OPTIONS
          fileBuffer = await this.generateExcel(data, request.config, excelOptions)
          fileName = `analytics-${request.config.reportType}-${Date.now()}.xlsx`
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          break

        case 'csv':
          const csvOptions = request.csvOptions || DEFAULT_CSV_OPTIONS
          fileBuffer = await this.generateCSV(data, request.config, csvOptions)
          fileName = `analytics-${request.config.reportType}-${Date.now()}.csv`
          mimeType = 'text/csv'
          break

        case 'json':
          fileBuffer = Buffer.from(JSON.stringify(data, null, 2))
          fileName = `analytics-${request.config.reportType}-${Date.now()}.json`
          mimeType = 'application/json'
          break

        default:
          throw new Error(`Unsupported export format: ${request.config.format}`)
      }

      await this.updateExportStatus(request.id, 'processing', {
        percentage: 80,
        currentStep: 'Uploading file',
        estimatedTimeRemaining: 5000
      })

      // Upload file to storage
      const downloadUrl = await this.uploadFile(fileName, fileBuffer, mimeType)

      const processingTime = Date.now() - startTime
      
      // Complete export
      const response: ExportResponse = {
        id: request.id,
        status: 'completed',
        downloadUrl,
        fileName,
        fileSize: fileBuffer.length,
        createdAt: new Date(startTime),
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        progress: {
          percentage: 100,
          currentStep: 'Completed',
          estimatedTimeRemaining: 0
        }
      }

      await this.updateExportStatus(request.id, 'completed')
      
      // Send notification if requested
      if (request.notifyOnComplete && request.email) {
        await this.sendCompletionNotification(request.email, response)
      }

      // Log export metrics
      await this.logExportMetrics(request, processingTime, fileBuffer.length)

      return response

    } catch (error) {
      await this.updateExportStatus(request.id, 'failed')
      
      const response: ExportResponse = {
        id: request.id,
        status: 'failed',
        fileName: '',
        createdAt: new Date(startTime),
        expiresAt: new Date(),
        error: {
          code: 'EXPORT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      }

      return response
    }
  }

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  private async fetchAnalyticsData(config: ExportConfig): Promise<ExportableData> {
    const { reportType, dateRange, filters } = config
    const { startDate, endDate } = dateRange

    const data: ExportableData = {
      metadata: {
        generatedAt: new Date(),
        period: 'month', // Default period
        totalRecords: 0,
        dataFreshness: new Date(),
        queryExecutionTime: 0
      }
    }

    const queryStart = Date.now()

    try {
      switch (reportType) {
        case 'revenue':
          data.revenue = await this.analyticsService.getRevenueAnalytics('month', startDate, endDate, filters)
          break

        case 'conversion':
          data.conversion = await this.analyticsService.getConversionAnalytics('month', startDate, endDate, filters)
          break

        case 'trial':
          // Fetch trial predictions and metrics
          const trialMetrics = await this.analyticsService.getTrialMetrics(startDate, endDate, filters)
          data.trials = trialMetrics
          break

        case 'cohort':
          data.cohorts = await this.analyticsService.getCohortAnalysis(startDate, endDate, filters)
          break

        case 'forecast':
          data.forecasts = await this.analyticsService.getRevenueForecasts(startDate, endDate, filters)
          break

        case 'comprehensive':
          // Fetch all data types
          data.revenue = await this.analyticsService.getRevenueAnalytics('month', startDate, endDate, filters)
          data.conversion = await this.analyticsService.getConversionAnalytics('month', startDate, endDate, filters)
          data.cohorts = await this.analyticsService.getCohortAnalysis(startDate, endDate, filters)
          data.forecasts = await this.analyticsService.getRevenueForecasts(startDate, endDate, filters)
          break

        default:
          throw new Error(`Unsupported report type: ${reportType}`)
      }

      data.metadata.queryExecutionTime = Date.now() - queryStart
      data.metadata.totalRecords = this.calculateTotalRecords(data)

      return data

    } catch (error) {
      throw new Error(`Failed to fetch analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // ========================================================================
  // PDF GENERATION
  // ========================================================================

  private async generatePDF(
    data: ExportableData,
    config: ExportConfig,
    options: PDFExportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageSize.toLowerCase() as any
    })

    // Set up styling
    doc.setFont(options.styling.fontFamily)
    doc.setFontSize(options.styling.fontSize)

    let yPosition = options.margins.top

    // Add header
    if (options.header) {
      doc.setFontSize(options.header.fontSize)
      doc.text(options.header.text, this.getXPosition(options.header.alignment, doc), yPosition)
      yPosition += 15
    }

    // Add title
    doc.setFontSize(18)
    doc.setTextColor(options.styling.primaryColor)
    const title = config.customization?.title || `Analytics Report - ${config.reportType.toUpperCase()}`
    doc.text(title, options.margins.left, yPosition)
    yPosition += 15

    // Add subtitle
    if (config.customization?.subtitle) {
      doc.setFontSize(12)
      doc.setTextColor(options.styling.secondaryColor)
      doc.text(config.customization.subtitle, options.margins.left, yPosition)
      yPosition += 10
    }

    // Add metadata
    doc.setFontSize(10)
    doc.setTextColor('#666666')
    doc.text(`Generated: ${data.metadata.generatedAt.toLocaleString()}`, options.margins.left, yPosition)
    yPosition += 5
    doc.text(`Period: ${config.dateRange.startDate.toLocaleDateString()} - ${config.dateRange.endDate.toLocaleDateString()}`, options.margins.left, yPosition)
    yPosition += 15

    // Add content based on report type
    yPosition = await this.addPDFContent(doc, data, config, options, yPosition)

    // Add footer
    if (options.footer) {
      const pageHeight = doc.internal.pageSize.height
      let footerY = pageHeight - options.margins.bottom
      
      if (options.footer.includePageNumbers) {
        doc.text(`Page 1`, doc.internal.pageSize.width - options.margins.right - 20, footerY)
      }
      
      if (options.footer.includeTimestamp) {
        doc.text(`Generated: ${new Date().toLocaleString()}`, options.margins.left, footerY)
      }
      
      if (options.footer.customText) {
        doc.text(options.footer.customText, options.margins.left, footerY - 5)
      }
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  private async addPDFContent(
    doc: jsPDF,
    data: ExportableData,
    config: ExportConfig,
    options: PDFExportOptions,
    startY: number
  ): Promise<number> {
    let yPosition = startY

    // Add summary section
    if (config.includeSummary) {
      doc.setFontSize(14)
      doc.setTextColor(options.styling.primaryColor)
      doc.text('Executive Summary', options.margins.left, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setTextColor('#333333')
      doc.text(`Total Records: ${data.metadata.totalRecords}`, options.margins.left, yPosition)
      yPosition += 5
      doc.text(`Query Execution Time: ${data.metadata.queryExecutionTime}ms`, options.margins.left, yPosition)
      yPosition += 15
    }

    // Add data sections based on report type
    if (data.revenue) {
      yPosition = this.addRevenueSectionToPDF(doc, data.revenue, options, yPosition)
    }

    if (data.conversion) {
      yPosition = this.addConversionSectionToPDF(doc, data.conversion, options, yPosition)
    }

    if (data.cohorts) {
      yPosition = this.addCohortSectionToPDF(doc, data.cohorts, options, yPosition)
    }

    return yPosition
  }

  private addRevenueSectionToPDF(
    doc: jsPDF,
    revenue: any,
    options: PDFExportOptions,
    startY: number
  ): number {
    let yPosition = startY

    doc.setFontSize(14)
    doc.setTextColor(options.styling.primaryColor)
    doc.text('Revenue Analytics', options.margins.left, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor('#333333')
    
    if (revenue.mrr) {
      doc.text(`MRR Total: $${revenue.mrr.total.toLocaleString()}`, options.margins.left, yPosition)
      yPosition += 5
      doc.text(`MRR Growth: ${revenue.mrr.growth.toFixed(2)}%`, options.margins.left, yPosition)
      yPosition += 5
    }

    if (revenue.arr) {
      doc.text(`ARR Total: $${revenue.arr.total.toLocaleString()}`, options.margins.left, yPosition)
      yPosition += 5
      doc.text(`ARR Growth: ${revenue.arr.growth.toFixed(2)}%`, options.margins.left, yPosition)
      yPosition += 10
    }

    return yPosition
  }

  private addConversionSectionToPDF(
    doc: jsPDF,
    conversion: any,
    options: PDFExportOptions,
    startY: number
  ): number {
    let yPosition = startY

    doc.setFontSize(14)
    doc.setTextColor(options.styling.primaryColor)
    doc.text('Conversion Analytics', options.margins.left, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor('#333333')
    
    if (conversion.trialToPayment) {
      doc.text(`Trial to Payment: ${conversion.trialToPayment.average.toFixed(2)}%`, options.margins.left, yPosition)
      yPosition += 5
    }

    if (conversion.signupToTrial) {
      doc.text(`Signup to Trial: ${conversion.signupToTrial.average.toFixed(2)}%`, options.margins.left, yPosition)
      yPosition += 10
    }

    return yPosition
  }

  private addCohortSectionToPDF(
    doc: jsPDF,
    cohorts: any[],
    options: PDFExportOptions,
    startY: number
  ): number {
    let yPosition = startY

    doc.setFontSize(14)
    doc.setTextColor(options.styling.primaryColor)
    doc.text('Cohort Analysis', options.margins.left, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setTextColor('#333333')
    
    cohorts.slice(0, 5).forEach((cohort, index) => {
      doc.text(`Cohort ${cohort.period}: ${cohort.size} users, ${cohort.churnRate.toFixed(2)}% churn`, options.margins.left, yPosition)
      yPosition += 5
    })

    return yPosition + 10
  }

  private getXPosition(alignment: 'left' | 'center' | 'right', doc: jsPDF): number {
    const pageWidth = doc.internal.pageSize.width
    const margins = 20 // Default margin
    
    switch (alignment) {
      case 'left':
        return margins
      case 'center':
        return pageWidth / 2
      case 'right':
        return pageWidth - margins
      default:
        return margins
    }
  }

  // ========================================================================
  // EXCEL GENERATION
  // ========================================================================

  private async generateExcel(
    data: ExportableData,
    config: ExportConfig,
    options: ExcelExportOptions
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new()

    // Summary worksheet
    if (options.worksheets.summary) {
      const summaryData = this.prepareSummaryData(data, config)
      const summaryWS = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary')
    }

    // Revenue worksheet
    if (options.worksheets.revenue && data.revenue) {
      const revenueData = this.prepareRevenueData(data.revenue)
      const revenueWS = XLSX.utils.json_to_sheet(revenueData)
      XLSX.utils.book_append_sheet(workbook, revenueWS, 'Revenue')
    }

    // Conversion worksheet
    if (options.worksheets.conversion && data.conversion) {
      const conversionData = this.prepareConversionData(data.conversion)
      const conversionWS = XLSX.utils.json_to_sheet(conversionData)
      XLSX.utils.book_append_sheet(workbook, conversionWS, 'Conversion')
    }

    // Cohorts worksheet
    if (options.worksheets.cohorts && data.cohorts) {
      const cohortData = this.prepareCohortData(data.cohorts)
      const cohortWS = XLSX.utils.json_to_sheet(cohortData)
      XLSX.utils.book_append_sheet(workbook, cohortWS, 'Cohorts')
    }

    // Forecasts worksheet
    if (options.worksheets.forecasts && data.forecasts) {
      const forecastData = this.prepareForecastData(data.forecasts)
      const forecastWS = XLSX.utils.json_to_sheet(forecastData)
      XLSX.utils.book_append_sheet(workbook, forecastWS, 'Forecasts')
    }

    // Raw data worksheet
    if (options.worksheets.rawData && data.rawMetrics) {
      const rawWS = XLSX.utils.json_to_sheet(data.rawMetrics)
      XLSX.utils.book_append_sheet(workbook, rawWS, 'Raw Data')
    }

    // Apply formatting if enabled
    if (options.formatting.autoWidth) {
      // Auto-width columns (simplified implementation)
      Object.keys(workbook.Sheets).forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
        const colWidths: any[] = []
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
            const cell = sheet[cellAddress]
            if (cell && cell.v) {
              const cellLength = cell.v.toString().length
              maxWidth = Math.max(maxWidth, cellLength)
            }
          }
          colWidths[C] = { width: Math.min(maxWidth, 50) }
        }
        
        sheet['!cols'] = colWidths
      })
    }

    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
  }

  // ========================================================================
  // CSV GENERATION
  // ========================================================================

  private async generateCSV(
    data: ExportableData,
    config: ExportConfig,
    options: CSVExportOptions
  ): Promise<Buffer> {
    let csvContent = ''

    // Add header comment
    csvContent += `# Analytics Export - ${config.reportType.toUpperCase()}\n`
    csvContent += `# Generated: ${data.metadata.generatedAt.toISOString()}\n`
    csvContent += `# Period: ${config.dateRange.startDate.toISOString()} to ${config.dateRange.endDate.toISOString()}\n`
    csvContent += `\n`

    // Generate CSV based on report type
    switch (config.reportType) {
      case 'revenue':
        if (data.revenue) {
          csvContent += this.generateRevenueCSV(data.revenue, options)
        }
        break

      case 'conversion':
        if (data.conversion) {
          csvContent += this.generateConversionCSV(data.conversion, options)
        }
        break

      case 'cohort':
        if (data.cohorts) {
          csvContent += this.generateCohortCSV(data.cohorts, options)
        }
        break

      case 'comprehensive':
        csvContent += this.generateComprehensiveCSV(data, options)
        break

      default:
        csvContent += this.generateGenericCSV(data, options)
    }

    // Apply compression if requested
    if (options.compression === 'gzip') {
      const zlib = require('zlib')
      return Buffer.from(zlib.gzipSync(csvContent))
    }

    return Buffer.from(csvContent, options.encoding)
  }

  private generateRevenueCSV(revenue: any, options: CSVExportOptions): string {
    let csv = ''
    
    if (options.includeHeaders) {
      csv += ['Metric', 'Total', 'Average', 'Growth', 'Period'].join(options.delimiter) + '\n'
    }

    if (revenue.mrr) {
      csv += ['MRR', revenue.mrr.total, revenue.mrr.average, revenue.mrr.growth, revenue.mrr.period].join(options.delimiter) + '\n'
    }

    if (revenue.arr) {
      csv += ['ARR', revenue.arr.total, revenue.arr.average, revenue.arr.growth, revenue.arr.period].join(options.delimiter) + '\n'
    }

    if (revenue.churn) {
      csv += ['Churn', revenue.churn.total, revenue.churn.average, revenue.churn.growth, revenue.churn.period].join(options.delimiter) + '\n'
    }

    return csv
  }

  private generateConversionCSV(conversion: any, options: CSVExportOptions): string {
    let csv = ''
    
    if (options.includeHeaders) {
      csv += ['Metric', 'Rate', 'Total', 'Growth'].join(options.delimiter) + '\n'
    }

    if (conversion.trialToPayment) {
      csv += ['Trial to Payment', conversion.trialToPayment.average, conversion.trialToPayment.total, conversion.trialToPayment.growth].join(options.delimiter) + '\n'
    }

    if (conversion.signupToTrial) {
      csv += ['Signup to Trial', conversion.signupToTrial.average, conversion.signupToTrial.total, conversion.signupToTrial.growth].join(options.delimiter) + '\n'
    }

    return csv
  }

  private generateCohortCSV(cohorts: any[], options: CSVExportOptions): string {
    let csv = ''
    
    if (options.includeHeaders) {
      csv += ['Cohort ID', 'Period', 'Size', 'Churn Rate', 'Revenue Per User'].join(options.delimiter) + '\n'
    }

    cohorts.forEach(cohort => {
      csv += [cohort.cohortId, cohort.period, cohort.size, cohort.churnRate, cohort.revenuePerUser[0] || 0].join(options.delimiter) + '\n'
    })

    return csv
  }

  private generateComprehensiveCSV(data: ExportableData, options: CSVExportOptions): string {
    let csv = ''
    
    csv += '# REVENUE METRICS\n'
    if (data.revenue) {
      csv += this.generateRevenueCSV(data.revenue, options)
    }
    
    csv += '\n# CONVERSION METRICS\n'
    if (data.conversion) {
      csv += this.generateConversionCSV(data.conversion, options)
    }
    
    csv += '\n# COHORT ANALYSIS\n'
    if (data.cohorts) {
      csv += this.generateCohortCSV(data.cohorts, options)
    }

    return csv
  }

  private generateGenericCSV(data: ExportableData, options: CSVExportOptions): string {
    return JSON.stringify(data, null, 2)
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private prepareSummaryData(data: ExportableData, config: ExportConfig): any[] {
    return [
      { Metric: 'Report Type', Value: config.reportType },
      { Metric: 'Generated At', Value: data.metadata.generatedAt.toISOString() },
      { Metric: 'Total Records', Value: data.metadata.totalRecords },
      { Metric: 'Query Time (ms)', Value: data.metadata.queryExecutionTime },
      { Metric: 'Data Freshness', Value: data.metadata.dataFreshness.toISOString() }
    ]
  }

  private prepareRevenueData(revenue: any): any[] {
    const data: any[] = []
    
    if (revenue.mrr) {
      data.push({ Metric: 'MRR', Total: revenue.mrr.total, Average: revenue.mrr.average, Growth: revenue.mrr.growth })
    }
    
    if (revenue.arr) {
      data.push({ Metric: 'ARR', Total: revenue.arr.total, Average: revenue.arr.average, Growth: revenue.arr.growth })
    }
    
    return data
  }

  private prepareConversionData(conversion: any): any[] {
    const data: any[] = []
    
    if (conversion.trialToPayment) {
      data.push({ Metric: 'Trial to Payment', Rate: conversion.trialToPayment.average, Growth: conversion.trialToPayment.growth })
    }
    
    return data
  }

  private prepareCohortData(cohorts: any[]): any[] {
    return cohorts.map(cohort => ({
      'Cohort ID': cohort.cohortId,
      Period: cohort.period,
      Size: cohort.size,
      'Churn Rate': cohort.churnRate,
      'Revenue Per User': cohort.revenuePerUser[0] || 0
    }))
  }

  private prepareForecastData(forecasts: any[]): any[] {
    return forecasts.map((forecast, index) => ({
      Period: index + 1,
      Predicted: forecast.predicted?.[0] || 0,
      Confidence: forecast.confidence?.[0] || 0,
      Accuracy: forecast.accuracy || 0
    }))
  }

  private calculateTotalRecords(data: ExportableData): number {
    let total = 0
    
    if (data.cohorts) total += data.cohorts.length
    if (data.forecasts) total += data.forecasts.length
    if (data.trials) total += data.trials.length
    if (data.rawMetrics) total += data.rawMetrics.length
    
    return total
  }

  private async uploadFile(fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('analytics-exports')
      .upload(`exports/${fileName}`, buffer, {
        contentType: mimeType,
        cacheControl: '3600'
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    const { data: urlData } = this.supabase.storage
      .from('analytics-exports')
      .getPublicUrl(`exports/${fileName}`)

    return urlData.publicUrl
  }

  private async updateExportStatus(
    exportId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress?: { percentage: number; currentStep: string; estimatedTimeRemaining?: number }
  ): Promise<void> {
    const updateData: any = { status }
    
    if (progress) {
      updateData.progress = progress
    }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await this.supabase
      .from('export_requests')
      .update(updateData)
      .eq('id', exportId)

    if (error) {
      console.error('Failed to update export status:', error)
    }
  }

  private async sendCompletionNotification(email: string, response: ExportResponse): Promise<void> {
    // Implementation would depend on your email service
    // This is a placeholder for the notification system
    console.log(`Sending completion notification to ${email} for export ${response.id}`)
  }

  private async logExportMetrics(
    request: ExportRequest,
    processingTime: number,
    fileSize: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('export_metrics')
      .insert({
        export_id: request.id,
        user_id: request.userId,
        format: request.config.format,
        report_type: request.config.reportType,
        processing_time: processingTime,
        file_size: fileSize,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log export metrics:', error)
    }
  }
}

// Export singleton instance
export const analyticsExportService = new AnalyticsExportService()