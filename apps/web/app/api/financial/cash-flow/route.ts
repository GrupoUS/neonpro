/**
 * Cash Flow API Route
 * RESTful endpoints for financial analytics and monitoring
 * 
 * @route /api/financial/cash-flow
 * @author BMad Method Implementation
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { CashFlowMonitoringEngine } from '@/lib/financial/cash-flow-monitoring';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schemas
const CashFlowQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
  date: z.string().optional(),
  days: z.coerce.number().min(1).max(365).optional().default(30),
});

const AlertSetupSchema = z.object({
  low_balance: z.number().optional(),
  high_expense_daily: z.number().optional(),
  negative_flow_days: z.number().min(1).max(30).optional(),
});

/**
 * GET /api/financial/cash-flow
 * Retrieve cash flow data and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    
    // Validate query parameters
    const { period, date, days } = CashFlowQuerySchema.parse(params);
    
    // Get user session and clinic ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const cashFlowEngine = new CashFlowMonitoringEngine(profile.clinic_id);
    
    // Determine which data to return based on query parameters
    const action = searchParams.get('action') || 'summary';
    
    switch (action) {
      case 'realtime':
        const realtimeData = await cashFlowEngine.getRealTimeCashFlow();
        return NextResponse.json({
          success: true,
          data: realtimeData,
          timestamp: new Date().toISOString()
        });

      case 'summary':
        const targetDate = date ? new Date(date) : undefined;
        const summary = await cashFlowEngine.getCashFlowSummary(period, targetDate);
        return NextResponse.json({
          success: true,
          data: summary,
          timestamp: new Date().toISOString()
        });

      case 'trend':
        const trend = await cashFlowEngine.getCashFlowTrend(days);
        return NextResponse.json({
          success: true,
          data: trend,
          period: `${days} days`,
          timestamp: new Date().toISOString()
        });

      case 'prediction':
        const predictions = await cashFlowEngine.predictCashFlow(days);
        return NextResponse.json({
          success: true,
          data: predictions,
          forecast_period: `${days} days`,
          timestamp: new Date().toISOString()
        });

      case 'alerts-check':
        await cashFlowEngine.checkAlertConditions();
        return NextResponse.json({
          success: true,
          message: 'Alert conditions checked and processed',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cash flow API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/financial/cash-flow
 * Setup alerts and configure cash flow monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'setup-alerts';
    
    // Get user session and clinic ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's clinic ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id, role')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Check if user has permission to configure alerts
    if (!['admin', 'owner', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const cashFlowEngine = new CashFlowMonitoringEngine(profile.clinic_id);
    
    switch (action) {
      case 'setup-alerts':
        const alertConfig = AlertSetupSchema.parse(body.config);
        await cashFlowEngine.setupCashFlowAlerts(alertConfig);
        
        return NextResponse.json({
          success: true,
          message: 'Cash flow alerts configured successfully',
          config: alertConfig,
          timestamp: new Date().toISOString()
        });

      case 'manual-transaction':
        // Add manual transaction entry
        const { type, amount, category, description, payment_method } = body;
        
        if (!type || !amount || amount <= 0) {
          return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 });
        }

        const { error: transactionError } = await supabase
          .from('financial_transactions')
          .insert({
            clinic_id: profile.clinic_id,
            type,
            amount,
            category: category || 'manual',
            description: description || 'Manual entry',
            source: 'manual',
            payment_method,
            status: 'completed',
            created_by: session.user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (transactionError) {
          throw new Error(`Failed to create transaction: ${transactionError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: 'Manual transaction added successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cash flow API POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}