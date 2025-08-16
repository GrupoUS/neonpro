import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get('start_date') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const endDate =
      searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly

    // Financial Summary
    const { data: financialSummary, error: summaryError } = await supabase.rpc(
      'get_financial_summary',
      {
        start_date: startDate,
        end_date: endDate,
      },
    );

    if (summaryError) {
    }

    // Revenue by Period
    const { data: revenueByPeriod, error: revenueError } = await supabase.rpc(
      'get_revenue_by_period',
      {
        start_date: startDate,
        end_date: endDate,
        period_type: period,
      },
    );

    if (revenueError) {
    }

    // Revenue by Service
    const { data: revenueByService, error: serviceRevenueError } =
      await supabase.rpc('get_revenue_by_service', {
        start_date: startDate,
        end_date: endDate,
      });

    if (serviceRevenueError) {
    }

    // Payment Method Statistics
    const { data: paymentMethodStats, error: paymentStatsError } =
      await supabase
        .from('payments')
        .select('method, amount, status')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
        .eq('status', 'completed');

    let methodStats = {};
    if (!paymentStatsError && paymentMethodStats) {
      methodStats = paymentMethodStats.reduce(
        (acc, payment) => {
          const method = payment.method;
          if (!acc[method]) {
            acc[method] = { count: 0, total_amount: 0 };
          }
          acc[method].count += 1;
          acc[method].total_amount += payment.amount;
          return acc;
        },
        {} as Record<string, { count: number; total_amount: number }>,
      );
    }

    // Top Patients by Revenue
    const { data: topPatients, error: patientsError } = await supabase
      .from('payments')
      .select(
        `
        amount,
        invoice:invoices(
          patient_id,
          patient:profiles!invoices_patient_id_fkey(
            id,
            full_name,
            email
          )
        )
      `,
      )
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .eq('status', 'completed');

    let patientRevenue = {};
    if (!patientsError && topPatients) {
      patientRevenue = topPatients.reduce(
        (acc, payment) => {
          const invoice = payment.invoice as any;
          const patientId = invoice?.patient_id;
          if (patientId && invoice?.patient) {
            if (!acc[patientId]) {
              acc[patientId] = {
                patient: Array.isArray(invoice.patient)
                  ? invoice.patient[0]
                  : invoice.patient,
                total_revenue: 0,
                payments_count: 0,
              };
            }
            acc[patientId].total_revenue += payment.amount;
            acc[patientId].payments_count += 1;
          }
          return acc;
        },
        {} as Record<string, any>,
      );
    }

    const topPatientsArray = Object.values(patientRevenue)
      .sort((a: any, b: any) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Outstanding Invoices Analysis
    const { data: outstandingInvoices, error: outstandingError } =
      await supabase
        .from('invoices')
        .select(
          `
        id,
        invoice_number,
        total_amount,
        issue_date,
        due_date,
        status,
        patient:profiles!invoices_patient_id_fkey(
          full_name,
          email
        ),
        payments:payments!inner(amount)
      `,
        )
        .in('status', ['pending', 'overdue'])
        .order('due_date', { ascending: true });

    const outstandingAnalysis = {
      total_outstanding: 0,
      overdue_count: 0,
      overdue_amount: 0,
      upcoming_due: 0,
      by_age: {
        current: { count: 0, amount: 0 },
        '1-30': { count: 0, amount: 0 },
        '31-60': { count: 0, amount: 0 },
        '61-90': { count: 0, amount: 0 },
        '90+': { count: 0, amount: 0 },
      },
    };

    if (!outstandingError && outstandingInvoices) {
      const now = new Date();
      outstandingInvoices.forEach((invoice) => {
        const paidAmount =
          invoice.payments?.reduce(
            (sum: number, p: any) => sum + p.amount,
            0,
          ) || 0;
        const remainingAmount = invoice.total_amount - paidAmount;

        if (remainingAmount > 0) {
          outstandingAnalysis.total_outstanding += remainingAmount;

          const dueDate = new Date(invoice.due_date);
          const daysPastDue = Math.floor(
            (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysPastDue > 0) {
            outstandingAnalysis.overdue_count += 1;
            outstandingAnalysis.overdue_amount += remainingAmount;

            // Categorize by age
            if (daysPastDue <= 30) {
              outstandingAnalysis.by_age['1-30'].count += 1;
              outstandingAnalysis.by_age['1-30'].amount += remainingAmount;
            } else if (daysPastDue <= 60) {
              outstandingAnalysis.by_age['31-60'].count += 1;
              outstandingAnalysis.by_age['31-60'].amount += remainingAmount;
            } else if (daysPastDue <= 90) {
              outstandingAnalysis.by_age['61-90'].count += 1;
              outstandingAnalysis.by_age['61-90'].amount += remainingAmount;
            } else {
              outstandingAnalysis.by_age['90+'].count += 1;
              outstandingAnalysis.by_age['90+'].amount += remainingAmount;
            }
          } else {
            outstandingAnalysis.by_age.current.count += 1;
            outstandingAnalysis.by_age.current.amount += remainingAmount;

            // Check if due in next 30 days
            if (daysPastDue >= -30) {
              outstandingAnalysis.upcoming_due += remainingAmount;
            }
          }
        }
      });
    }

    // Monthly Trends (last 12 months)
    const monthlyTrendsStartDate = new Date();
    monthlyTrendsStartDate.setMonth(monthlyTrendsStartDate.getMonth() - 12);

    const { data: monthlyTrends, error: trendsError } = await supabase.rpc(
      'get_revenue_by_period',
      {
        start_date: monthlyTrendsStartDate.toISOString().split('T')[0],
        end_date: endDate,
        period_type: 'monthly',
      },
    );

    return NextResponse.json({
      financial_summary: financialSummary?.[0] || {
        total_revenue: 0,
        pending_invoices: 0,
        overdue_invoices: 0,
        paid_invoices: 0,
        total_outstanding: outstandingAnalysis.total_outstanding,
        monthly_revenue: 0,
        daily_revenue: 0,
        period: { start_date: startDate, end_date: endDate },
      },
      revenue_by_period: revenueByPeriod || [],
      revenue_by_service: revenueByService || [],
      payment_method_stats: methodStats,
      top_patients: topPatientsArray,
      outstanding_analysis: outstandingAnalysis,
      monthly_trends: monthlyTrends || [],
      period: {
        start_date: startDate,
        end_date: endDate,
        type: period,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
