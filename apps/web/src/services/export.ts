/**
 * Export Service
 * Service for generating PDF and Excel reports from financial data
 * with Brazilian formatting and LGPD compliance
 */

import { supabase } from '@/integrations/supabase/client';
import type { DashboardData, DashboardFilters } from './dashboard-data';
import type { FinancialMetric, MetricsCalculationOptions } from './financial-metrics';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeComparisons?: boolean;
  watermark?: string;
  locale?: 'pt-BR' | 'en-US';
  timezone?: string;
}

export interface ExportMetadata {
  title: string;
  subtitle?: string;
  author: string;
  clinicName: string;
  generatedAt: Date;
  period: string;
  filters: any;
  lgpdCompliance: {
    consentRequired: boolean;
    dataController: string;
    retentionPeriod: string;
    anonymized: boolean;
  };
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  size: number;
  format: string;
  metadata: ExportMetadata;
}

export class ExportService {
  private static readonly DEFAULT_LOCALE = 'pt-BR';
  private static readonly DEFAULT_TIMEZONE = 'America/Sao_Paulo';

  /**
   * Export financial metrics to specified format
   */
  static async exportFinancialMetrics(
    metrics: FinancialMetric[],
    options: ExportOptions,
    metadata: Partial<ExportMetadata> = {},
  ): Promise<ExportResult> {
    const completeMetadata = this.buildMetadata(metadata);
    try {
      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'csv':
          blob = await this.exportToCsv(metrics, options, completeMetadata);
          filename = `relatorio-financeiro-${this.formatDate(new Date())}.csv`;
          break;
        case 'excel':
          blob = await this.exportToExcel(metrics, options, completeMetadata);
          filename = `relatorio-financeiro-${this.formatDate(new Date())}.xlsx`;
          break;
        case 'pdf':
          blob = await this.exportToPdf(metrics, options, completeMetadata);
          filename = `relatorio-financeiro-${this.formatDate(new Date())}.pdf`;
          break;
        default:
          throw new Error(`Formato de exportação não suportado: ${options.format}`);
      }

      return {
        blob,
        filename,
        size: blob.size,
        format: options.format,
        metadata: completeMetadata,
      };
    } catch (error) {
      console.error('Error exporting financial metrics:', error);
      throw new Error('Falha ao exportar relatório financeiro');
    }
  }

  /**
   * Export dashboard data to comprehensive report
   */
  static async exportDashboardReport(
    dashboardData: DashboardData,
    options: ExportOptions,
    metadata: Partial<ExportMetadata> = {},
  ): Promise<ExportResult> {
    const completeMetadata = this.buildMetadata({
      ...metadata,
      title: 'Relatório de Dashboard Financeiro',
      subtitle: `Período: ${dashboardData.period}`,
    });

    try {
      let blob: Blob;
      let filename: string;

      switch (options.format) {
        case 'pdf':
          blob = await this.exportDashboardToPdf(dashboardData, options, completeMetadata);
          filename = `dashboard-${this.formatDate(new Date())}.pdf`;
          break;
        case 'excel':
          blob = await this.exportDashboardToExcel(dashboardData, options, completeMetadata);
          filename = `dashboard-${this.formatDate(new Date())}.xlsx`;
          break;
        default:
          throw new Error(`Formato não suportado para dashboard: ${options.format}`);
      }

      return {
        blob,
        filename,
        size: blob.size,
        format: options.format,
        metadata: completeMetadata,
      };
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw new Error('Falha ao exportar dashboard');
    }
  } /**
   * CSV Export with Brazilian formatting
   */

  private static async exportToCsv(
    metrics: FinancialMetric[],
    options: ExportOptions,
    metadata: ExportMetadata,
  ): Promise<Blob> {
    const locale = options.locale || this.DEFAULT_LOCALE;
    const headers = [
      'Nome',
      'Valor',
      'Valor Anterior',
      'Mudança',
      'Mudança %',
      'Tendência',
      'Categoria',
      'Período',
    ];

    const rows = metrics.map(metric => [
      metric.name,
      this.formatCurrency(metric.value, locale),
      this.formatCurrency(metric.previousValue, locale),
      this.formatCurrency(metric.change, locale),
      this.formatPercentage(metric.changePercentage, locale),
      this.translateTrend(metric.trend),
      this.translateCategory(metric.category),
      this.translatePeriod(metric.period),
    ]);

    // Add metadata header
    const metadataRows = [
      [`# ${metadata.title}`],
      [`# Gerado em: ${this.formatDateTime(metadata.generatedAt, locale)}`],
      [`# Clínica: ${metadata.clinicName}`],
      [`# Período: ${metadata.period}`],
      [`# Conformidade LGPD: ${
        metadata.lgpdCompliance.anonymized ? 'Dados Anonimizados' : 'Dados Identificados'
      }`],
      [''], // Empty row separator
    ];

    const csvContent = [...metadataRows, [headers], ...rows]
      .map(row => row.join(';')) // Use semicolon for Brazilian CSV
      .join('\n');

    return new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
  }

  /**
   * Excel Export (simplified implementation)
   */
  private static async exportToExcel(
    metrics: FinancialMetric[],
    options: ExportOptions,
    metadata: ExportMetadata,
  ): Promise<Blob> {
    // For production, you would use a library like ExcelJS
    // This is a simplified implementation
    const csvBlob = await this.exportToCsv(metrics, options, metadata);
    return new Blob([csvBlob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  /**
   * PDF Export with Brazilian formatting and LGPD compliance
   */
  private static async exportToPdf(
    metrics: FinancialMetric[],
    options: ExportOptions,
    metadata: ExportMetadata,
  ): Promise<Blob> {
    // For production, you would use a library like jsPDF with autoTable
    // This is a simplified implementation
    const locale = options.locale || this.DEFAULT_LOCALE;

    let content = `${metadata.title}\n\n`;
    content += `Clínica: ${metadata.clinicName}\n`;
    content += `Gerado em: ${this.formatDateTime(metadata.generatedAt, locale)}\n`;
    content += `Período: ${metadata.period}\n\n`;

    if (metadata.lgpdCompliance.anonymized) {
      content += 'AVISO LGPD: Relatório com dados anonimizados para proteção da privacidade.\n\n';
    }

    content += 'MÉTRICAS FINANCEIRAS:\n';
    content += '=' + '='.repeat(50) + '\n\n';

    metrics.forEach(metric => {
      content += `${metric.name}: ${metric.formattedValue}\n`;
      content += `  Mudança: ${this.formatCurrency(metric.change, locale)} (${
        this.formatPercentage(metric.changePercentage, locale)
      })\n`;
      content += `  Tendência: ${this.translateTrend(metric.trend)}\n\n`;
    });

    content += `\n\nEste relatório foi gerado automaticamente pelo sistema NeonPro.\n`;
    content += `Conformidade LGPD: ${metadata.lgpdCompliance.dataController}\n`;

    return new Blob([content], { type: 'application/pdf' });
  } /**
   * Dashboard PDF Export
   */

  private static async exportDashboardToPdf(
    dashboardData: DashboardData,
    options: ExportOptions,
    metadata: ExportMetadata,
  ): Promise<Blob> {
    const locale = options.locale || this.DEFAULT_LOCALE;

    let content = `${metadata.title}\n\n`;
    content += `Clínica: ${metadata.clinicName}\n`;
    content += `Período: ${dashboardData.period}\n`;
    content += `Gerado em: ${this.formatDateTime(metadata.generatedAt, locale)}\n\n`;

    // Executive Summary
    content += 'RESUMO EXECUTIVO\n';
    content += '=' + '='.repeat(30) + '\n';
    content += `Receita Total: ${
      this.formatCurrency(dashboardData.aggregates.totalRevenue, locale)
    }\n`;
    content += `Despesas Totais: ${
      this.formatCurrency(dashboardData.aggregates.totalExpenses, locale)
    }\n`;
    content += `Lucro Líquido: ${
      this.formatCurrency(dashboardData.aggregates.netProfit, locale)
    }\n`;
    content += `Total de Pacientes: ${dashboardData.aggregates.patientCount}\n`;
    content += `Consultas Realizadas: ${dashboardData.aggregates.appointmentCount}\n\n`;

    // Trends
    content += 'TENDÊNCIAS\n';
    content += '=' + '='.repeat(20) + '\n';
    content += `Crescimento da Receita: ${
      this.formatPercentage(dashboardData.trends.revenueGrowth, locale)
    }\n`;
    content += `Crescimento das Despesas: ${
      this.formatPercentage(dashboardData.trends.expenseGrowth, locale)
    }\n`;
    content += `Crescimento do Lucro: ${
      this.formatPercentage(dashboardData.trends.profitGrowth, locale)
    }\n`;
    content += `Crescimento de Pacientes: ${
      this.formatPercentage(dashboardData.trends.patientGrowth, locale)
    }\n\n`;

    // Insights
    if (dashboardData.insights.length > 0) {
      content += 'INSIGHTS E RECOMENDAÇÕES\n';
      content += '=' + '='.repeat(35) + '\n';
      dashboardData.insights.forEach((insight, index) => {
        content += `${index + 1}. ${insight.title}\n`;
        content += `   ${insight.description}\n`;
        if (insight.recommendations && insight.recommendations.length > 0) {
          content += `   Recomendações:\n`;
          insight.recommendations.forEach(rec => {
            content += `   • ${rec}\n`;
          });
        }
        content += '\n';
      });
    }

    content += `\n\nRelatório gerado automaticamente pelo NeonPro.\n`;
    content += `Última atualização: ${
      this.formatDateTime(dashboardData.realTimeData.lastUpdated, locale)
    }\n`;

    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * Dashboard Excel Export
   */
  private static async exportDashboardToExcel(
    dashboardData: DashboardData,
    options: ExportOptions,
    metadata: ExportMetadata,
  ): Promise<Blob> {
    // For production, implement with ExcelJS for multiple sheets
    const pdfBlob = await this.exportDashboardToPdf(dashboardData, options, metadata);
    return new Blob([pdfBlob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  } /**
   * Utility methods
   */

  private static buildMetadata(partial: Partial<ExportMetadata>): ExportMetadata {
    return {
      title: partial.title || 'Relatório Financeiro',
      subtitle: partial.subtitle,
      author: partial.author || 'Sistema NeonPro',
      clinicName: partial.clinicName || 'Clínica',
      generatedAt: partial.generatedAt || new Date(),
      period: partial.period || 'Período Atual',
      filters: partial.filters || {},
      lgpdCompliance: {
        consentRequired: true,
        dataController: 'NeonPro Healthcare Platform',
        retentionPeriod: '5 anos conforme legislação médica',
        anonymized: false,
        ...partial.lgpdCompliance,
      },
    };
  }

  private static formatCurrency(value: number, locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private static formatPercentage(value: number, locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  }

  private static formatDate(date: Date, locale: string = 'pt-BR'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date).replace(/\//g, '-');
  }

  private static formatDateTime(date: Date, locale: string = 'pt-BR'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.DEFAULT_TIMEZONE,
    }).format(date);
  }

  private static translateTrend(trend: string): string {
    const translations = {
      up: 'Crescimento',
      down: 'Declínio',
      stable: 'Estável',
    };
    return translations[trend as keyof typeof translations] || trend;
  }

  private static translateCategory(category: string): string {
    const translations = {
      revenue: 'Receita',
      expenses: 'Despesas',
      profit: 'Lucro',
      patients: 'Pacientes',
      appointments: 'Consultas',
    };
    return translations[category as keyof typeof translations] || category;
  }

  private static translatePeriod(period: string): string {
    const translations = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
    };
    return translations[period as keyof typeof translations] || period;
  }
}
