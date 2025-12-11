/**
 * Reports Service - Fetches reports data from Supabase
 * Uses payment_reports, payment_transactions, and appointments tables
 */

import { supabase } from '@/integrations/supabase/client';

export interface ReportsSummary {
    revenueTotal: number;
    revenueChange: number;
    proceduresCount: number;
    proceduresChange: number;
    satisfactionRate: number;
    satisfactionChange: number;
    reportsGenerated: number;
}

export interface ReportItem {
    id: string;
    reportName: string;
    reportType: string;
    reportCategory: string;
    description: string | null;
    lastExecutedAt: string | null;
    executionCount: number;
    isScheduled: boolean;
}

/**
 * Fetch reports summary statistics
 */
export async function fetchReportsSummary(clinicId: string): Promise<ReportsSummary> {
    const defaultSummary: ReportsSummary = {
        revenueTotal: 0,
        revenueChange: 0,
        proceduresCount: 0,
        proceduresChange: 0,
        satisfactionRate: 0,
        satisfactionChange: 0,
        reportsGenerated: 0,
    };

    try {
        // Get current and previous month boundaries
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Fetch revenue from payment_transactions
        const { data: transactions, error: transError } = await supabase
            .from('payment_transactions')
            .select('amount, payment_status, created_at')
            .eq('clinic_id', clinicId);

        if (transError) {
            console.warn('[reports] Error fetching transactions:', transError.message);
        }

        // Calculate revenue
        const completedStatuses = ['completed', 'settled', 'paid', 'authorized'];
        const currentMonthRevenue = (transactions || [])
            .filter(t => {
                const date = new Date(t.created_at);
                return date >= currentMonthStart &&
                    completedStatuses.includes(t.payment_status?.toLowerCase() || '');
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const lastMonthRevenue = (transactions || [])
            .filter(t => {
                const date = new Date(t.created_at);
                return date >= lastMonthStart && date <= lastMonthEnd &&
                    completedStatuses.includes(t.payment_status?.toLowerCase() || '');
            })
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const revenueChange = lastMonthRevenue > 0
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Fetch procedures count (appointments with completed status)
        const { data: appointments, error: aptError } = await supabase
            .from('appointments')
            .select('id, status, start_time')
            .eq('clinic_id', clinicId);

        if (aptError) {
            console.warn('[reports] Error fetching appointments:', aptError.message);
        }

        const currentMonthProcedures = (appointments || [])
            .filter(a => {
                const date = new Date(a.start_time);
                return date >= currentMonthStart &&
                    ['completed', 'done', 'checked_in'].includes(a.status?.toLowerCase() || '');
            }).length;

        const lastMonthProcedures = (appointments || [])
            .filter(a => {
                const date = new Date(a.start_time);
                return date >= lastMonthStart && date <= lastMonthEnd &&
                    ['completed', 'done', 'checked_in'].includes(a.status?.toLowerCase() || '');
            }).length;

        const proceduresChange = lastMonthProcedures > 0
            ? ((currentMonthProcedures - lastMonthProcedures) / lastMonthProcedures) * 100
            : 0;

        // Fetch reports count
        const { count: reportsCount, error: reportsError } = await supabase
            .from('payment_reports')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinicId);

        if (reportsError) {
            console.warn('[reports] Error fetching reports count:', reportsError.message);
        }

        // Satisfaction rate would typically come from a reviews/feedback table
        // For now, we'll return 0 as there's no satisfaction data
        const satisfactionRate = 0;
        const satisfactionChange = 0;

        return {
            revenueTotal: currentMonthRevenue,
            revenueChange,
            proceduresCount: currentMonthProcedures,
            proceduresChange,
            satisfactionRate,
            satisfactionChange,
            reportsGenerated: reportsCount || 0,
        };
    } catch (e) {
        console.error('[reports] Exception fetching summary:', e);
        return defaultSummary;
    }
}

/**
 * Fetch available report templates
 */
export async function fetchAvailableReports(clinicId: string): Promise<ReportItem[]> {
    try {
        const { data, error } = await supabase
            .from('payment_reports')
            .select(`
        id,
        report_name,
        report_type,
        report_category,
        description,
        last_executed_at,
        execution_count,
        is_scheduled
      `)
            .eq('clinic_id', clinicId)
            .eq('is_active', true)
            .order('report_category', { ascending: true });

        if (error) {
            console.warn('[reports] Error fetching reports:', error.message);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            reportName: r.report_name,
            reportType: r.report_type,
            reportCategory: r.report_category,
            description: r.description,
            lastExecutedAt: r.last_executed_at,
            executionCount: r.execution_count || 0,
            isScheduled: r.is_scheduled || false,
        }));
    } catch (e) {
        console.error('[reports] Exception fetching reports:', e);
        return [];
    }
}

/**
 * Fetch report history (recently generated reports)
 */
export async function fetchReportHistory(clinicId: string, limit: number = 5): Promise<ReportItem[]> {
    try {
        const { data, error } = await supabase
            .from('payment_reports')
            .select(`
        id,
        report_name,
        report_type,
        report_category,
        description,
        last_executed_at,
        execution_count,
        is_scheduled
      `)
            .eq('clinic_id', clinicId)
            .not('last_executed_at', 'is', null)
            .order('last_executed_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[reports] Error fetching report history:', error.message);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            reportName: r.report_name,
            reportType: r.report_type,
            reportCategory: r.report_category,
            description: r.description,
            lastExecutedAt: r.last_executed_at,
            executionCount: r.execution_count || 0,
            isScheduled: r.is_scheduled || false,
        }));
    } catch (e) {
        console.error('[reports] Exception fetching report history:', e);
        return [];
    }
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Get report category label
 */
export function getReportCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        financial: 'Financeiro',
        patients: 'Clientes',
        procedures: 'Procedimentos',
        appointments: 'Agendamentos',
        analytics: 'Análises',
    };
    return labels[category?.toLowerCase()] || category;
}
