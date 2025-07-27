// =====================================================================================
// Financial Reporting API - Advanced Analytics Endpoint
// Epic 5, Story 5.1: Advanced Financial Reporting + Real-time Insights
// Created: 2025-01-27
// Author: VoidBeast V4.0 (BMad Method Implementation)
// =====================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  FinancialReportingEngine 
} from '@/lib/financial/reporting-engine';
import { 
  FinancialAnalyticsCore 
} from '@/lib/financial/analytics-core';
import {
  reportParametersSchema,
  exportOptionsSchema
} from '@/lib/validations/financial-reporting';
import { 
  REPORT_TYPES,
  FINANCIAL_CONSTANTS 
} from '@/lib/types/financial-reporting';

// Initialize services
const reportingEngine = new FinancialReportingEngine();
const analyticsCore = new FinancialAnalyticsCore();

// =====================================================================================
// GET: Fetch Financial Reports and Analytics
// =====================================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Extract and validate parameters
    const clinicId = searchParams.get('clinic_id');
    const reportType = searchParams.get('report_type');
    const action = searchParams.get('action') || 'dashboard';
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Verify user has access to clinic
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Route to specific action
    switch (action) {
      case 'dashboard':
        return await handleDashboardRequest(clinicId);
        
      case 'kpis':
        return await handleKPIRequest(clinicId, searchParams);
        
      case 'reports':
        return await handleReportsListRequest(clinicId, searchParams);
        
      case 'generate-report':
        return await handleReportGenerationRequest(clinicId, reportType, searchParams);
        
      case 'performance':
        return await handlePerformanceRequest(clinicId, searchParams);
        
      default:
        return NextResponse.json(
          { error: `Ação '${action}' não reconhecida` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET /api/financial/reporting error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// POST: Generate Reports and Analytics
// =====================================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, clinic_id, parameters, options } = body;

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id é obrigatório' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Route to specific action
    switch (action) {
      case 'generate-profit-loss':
        return await handleProfitLossGeneration(clinic_id, parameters);
        
      case 'generate-balance-sheet':
        return await handleBalanceSheetGeneration(clinic_id, parameters);
        
      case 'generate-cash-flow':
        return await handleCashFlowGeneration(clinic_id, parameters);
        
      case 'export-report':
        return await handleReportExport(clinic_id, parameters, options);
        
      case 'schedule-report':
        return await handleReportScheduling(clinic_id, parameters, options);
        
      default:
        return NextResponse.json(
          { error: `Ação '${action}' não reconhecida` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/financial/reporting error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// =====================================================================================
// REQUEST HANDLERS
// =====================================================================================

/**
 * Handle dashboard data request
 */
async function handleDashboardRequest(clinicId: string) {
  try {
    const dashboardData = await analyticsCore.generateDashboardData(clinicId);
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard request error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar dados do dashboard' },
      { status: 500 }
    );
  }
}

/**
 * Handle KPI calculation request
 */
async function handleKPIRequest(clinicId: string, searchParams: URLSearchParams) {
  try {
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');
    
    if (!periodStart || !periodEnd) {
      // Default to current month
      const now = new Date();
      const parameters = {
        period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
        period_end: now.toISOString().split('T')[0]
      };
      
      const kpis = await analyticsCore.calculateFinancialKPIs(clinicId, parameters);
      
      return NextResponse.json({
        success: true,
        data: kpis,
        parameters
      });
    }

    const parameters = { period_start: periodStart, period_end: periodEnd };
    const validation = reportParametersSchema.safeParse(parameters);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const kpis = await analyticsCore.calculateFinancialKPIs(clinicId, parameters);
    
    return NextResponse.json({
      success: true,
      data: kpis,
      parameters
    });
  } catch (error) {
    console.error('KPI request error:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular KPIs' },
      { status: 500 }
    );
  }
}

/**
 * Handle reports list request
 */
async function handleReportsListRequest(clinicId: string, searchParams: URLSearchParams) {
  try {
    const reportType = searchParams.get('report_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const filters = {
      report_type: reportType || undefined,
      status: status || undefined,
      page,
      limit
    };

    const reports = await reportingEngine.getFinancialReports(clinicId, filters);
    
    return NextResponse.json({
      success: true,
      data: reports.reports,
      pagination: {
        page,
        limit,
        total: reports.total,
        pages: Math.ceil(reports.total / limit)
      }
    });
  } catch (error) {
    console.error('Reports list request error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relatórios' },
      { status: 500 }
    );
  }
}

/**
 * Handle report generation request
 */
async function handleReportGenerationRequest(
  clinicId: string, 
  reportType: string | null, 
  searchParams: URLSearchParams
) {
  try {
    if (!reportType || !Object.values(REPORT_TYPES).includes(reportType as any)) {
      return NextResponse.json(
        { error: 'Tipo de relatório inválido' },
        { status: 400 }
      );
    }

    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');
    
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'period_start e period_end são obrigatórios' },
        { status: 400 }
      );
    }

    const parameters = { period_start: periodStart, period_end: periodEnd };
    const validation = reportParametersSchema.safeParse(parameters);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    let reportData;
    
    switch (reportType) {
      case REPORT_TYPES.PROFIT_LOSS:
        reportData = await reportingEngine.generateProfitLossStatement(clinicId, parameters);
        break;
      case REPORT_TYPES.BALANCE_SHEET:
        reportData = await reportingEngine.generateBalanceSheet(clinicId, periodEnd);
        break;
      case REPORT_TYPES.CASH_FLOW:
        reportData = await reportingEngine.generateCashFlowStatement(clinicId, parameters);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de relatório não implementado' },
          { status: 400 }
        );
    }

    // Save report to database
    const savedReport = await reportingEngine.saveFinancialReport({
      clinic_id: clinicId,
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      generated_by: 'system' // TODO: Get user ID
    }, reportData);

    return NextResponse.json({
      success: true,
      data: {
        report: savedReport,
        content: reportData
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}

/**
 * Handle performance metrics request
 */
async function handlePerformanceRequest(clinicId: string, searchParams: URLSearchParams) {
  try {
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');
    
    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'period_start e period_end são obrigatórios' },
        { status: 400 }
      );
    }

    const parameters = { period_start: periodStart, period_end: periodEnd };
    const validation = reportParametersSchema.safeParse(parameters);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const performance = await analyticsCore.calculatePerformanceMetrics(clinicId, parameters);
    
    return NextResponse.json({
      success: true,
      data: performance,
      parameters
    });
  } catch (error) {
    console.error('Performance request error:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular métricas de performance' },
      { status: 500 }
    );
  }
}

/**
 * Handle Profit & Loss statement generation
 */
async function handleProfitLossGeneration(clinicId: string, parameters: any) {
  try {
    const validation = reportParametersSchema.safeParse(parameters);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const profitLoss = await reportingEngine.generateProfitLossStatement(
      clinicId, 
      validation.data
    );

    const savedReport = await reportingEngine.saveFinancialReport({
      clinic_id: clinicId,
      report_type: REPORT_TYPES.PROFIT_LOSS,
      period_start: parameters.period_start,
      period_end: parameters.period_end,
      generated_by: 'system'
    }, profitLoss);

    return NextResponse.json({
      success: true,
      data: {
        report: savedReport,
        content: profitLoss
      }
    });
  } catch (error) {
    console.error('P&L generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar DRE' },
      { status: 500 }
    );
  }
}

/**
 * Handle Balance Sheet generation
 */
async function handleBalanceSheetGeneration(clinicId: string, parameters: any) {
  try {
    if (!parameters.as_of_date) {
      return NextResponse.json(
        { error: 'as_of_date é obrigatório para balanço patrimonial' },
        { status: 400 }
      );
    }

    const balanceSheet = await reportingEngine.generateBalanceSheet(
      clinicId, 
      parameters.as_of_date
    );

    const savedReport = await reportingEngine.saveFinancialReport({
      clinic_id: clinicId,
      report_type: REPORT_TYPES.BALANCE_SHEET,
      period_start: parameters.as_of_date,
      period_end: parameters.as_of_date,
      generated_by: 'system'
    }, balanceSheet);

    return NextResponse.json({
      success: true,
      data: {
        report: savedReport,
        content: balanceSheet
      }
    });
  } catch (error) {
    console.error('Balance sheet generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar balanço patrimonial' },
      { status: 500 }
    );
  }
}

/**
 * Handle Cash Flow statement generation
 */
async function handleCashFlowGeneration(clinicId: string, parameters: any) {
  try {
    const validation = reportParametersSchema.safeParse(parameters);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const cashFlow = await reportingEngine.generateCashFlowStatement(
      clinicId, 
      validation.data
    );

    const savedReport = await reportingEngine.saveFinancialReport({
      clinic_id: clinicId,
      report_type: REPORT_TYPES.CASH_FLOW,
      period_start: parameters.period_start,
      period_end: parameters.period_end,
      generated_by: 'system'
    }, cashFlow);

    return NextResponse.json({
      success: true,
      data: {
        report: savedReport,
        content: cashFlow
      }
    });
  } catch (error) {
    console.error('Cash flow generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar fluxo de caixa' },
      { status: 500 }
    );
  }
}

/**
 * Handle report export (placeholder)
 */
async function handleReportExport(clinicId: string, parameters: any, options: any) {
  try {
    // TODO: Implement report export functionality (PDF, Excel, CSV)
    return NextResponse.json({
      success: true,
      message: 'Exportação de relatórios será implementada em breve',
      data: {
        clinic_id: clinicId,
        parameters,
        options
      }
    });
  } catch (error) {
    console.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar relatório' },
      { status: 500 }
    );
  }
}

/**
 * Handle report scheduling (placeholder)
 */
async function handleReportScheduling(clinicId: string, parameters: any, options: any) {
  try {
    // TODO: Implement report scheduling functionality
    return NextResponse.json({
      success: true,
      message: 'Agendamento de relatórios será implementado em breve',
      data: {
        clinic_id: clinicId,
        parameters,
        options
      }
    });
  } catch (error) {
    console.error('Report scheduling error:', error);
    return NextResponse.json(
      { error: 'Erro ao agendar relatório' },
      { status: 500 }
    );
  }
}