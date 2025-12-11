/**
 * Financial Service - Fetches financial data from Supabase
 * Uses the payment_transactions table with the correct schema
 */

import { supabase } from '@/integrations/supabase/client';

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    accountsReceivable: number;
    pendingInvoicesCount: number;
    revenueChange: number; // percentage
    expensesChange: number; // percentage
    profitChange: number; // percentage
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    patientName?: string;
    amount: number;
    netAmount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue' | 'failed';
    paymentMethod: string;
}

export interface Invoice {
    id: string;
    patientName: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'overdue' | 'paid';
}

/**
 * Fetch financial summary for a clinic
 */
export async function fetchFinancialSummary(clinicId: string): Promise<FinancialSummary> {
    const defaultSummary: FinancialSummary = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        accountsReceivable: 0,
        pendingInvoicesCount: 0,
        revenueChange: 0,
        expensesChange: 0,
        profitChange: 0,
    };

    try {
        // Fetch transactions from payment_transactions table
        const { data: transactions, error } = await supabase
            .from('payment_transactions')
            .select('amount, net_amount, payment_status, fees, created_at, expires_at')
            .eq('clinic_id', clinicId);

        if (error) {
            console.warn('[financial] Error fetching transactions:', error.message);
            return defaultSummary;
        }

        if (!transactions || transactions.length === 0) {
            return defaultSummary;
        }

        // Calculate current month data
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.created_at);
            return transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear;
        });

        const lastMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.created_at);
            return transactionDate.getMonth() === lastMonth &&
                transactionDate.getFullYear() === lastMonthYear;
        });

        // Calculate current month totals (completed transactions = revenue)
        const completedStatuses = ['completed', 'settled', 'paid', 'authorized'];
        const pendingStatuses = ['pending', 'processing'];

        const currentRevenue = currentMonthTransactions
            .filter(t => completedStatuses.includes(t.payment_status?.toLowerCase() || ''))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const currentExpenses = currentMonthTransactions
            .reduce((sum, t) => sum + (t.fees || 0), 0);

        const lastMonthRevenue = lastMonthTransactions
            .filter(t => completedStatuses.includes(t.payment_status?.toLowerCase() || ''))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const lastMonthExpenses = lastMonthTransactions
            .reduce((sum, t) => sum + (t.fees || 0), 0);

        // Accounts receivable (pending transactions)
        const accountsReceivable = transactions
            .filter(t => pendingStatuses.includes(t.payment_status?.toLowerCase() || ''))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const pendingInvoicesCount = transactions.filter(t =>
            pendingStatuses.includes(t.payment_status?.toLowerCase() || '')
        ).length;

        // Calculate percentage changes
        const revenueChange = lastMonthRevenue > 0
            ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        const expensesChange = lastMonthExpenses > 0
            ? ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
            : 0;

        const currentProfit = currentRevenue - currentExpenses;
        const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
        const profitChange = lastMonthProfit > 0
            ? ((currentProfit - lastMonthProfit) / lastMonthProfit) * 100
            : 0;

        return {
            totalRevenue: currentRevenue,
            totalExpenses: currentExpenses,
            netProfit: currentProfit,
            accountsReceivable,
            pendingInvoicesCount,
            revenueChange,
            expensesChange,
            profitChange,
        };
    } catch (e) {
        console.error('[financial] Exception fetching summary:', e);
        return defaultSummary;
    }
}

/**
 * Fetch recent transactions for a clinic
 */
export async function fetchRecentTransactions(
    clinicId: string,
    limit: number = 10
): Promise<Transaction[]> {
    try {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select(`
        id,
        amount,
        net_amount,
        payment_status,
        payment_method,
        created_at,
        fees,
        transaction_metadata
      `)
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[financial] Error fetching transactions:', error.message);
            return [];
        }

        return (data || []).map((t: any) => ({
            id: t.id,
            type: 'income' as const, // All payment_transactions are income
            description: getTransactionDescription(t.payment_method, t.transaction_metadata),
            patientName: undefined, // Would need a join to get patient name
            amount: t.amount || 0,
            netAmount: t.net_amount || 0,
            date: t.created_at,
            status: mapPaymentStatus(t.payment_status),
            paymentMethod: t.payment_method || 'Não especificado',
        }));
    } catch (e) {
        console.error('[financial] Exception fetching transactions:', e);
        return [];
    }
}

/**
 * Fetch pending invoices for a clinic
 */
export async function fetchPendingInvoices(clinicId: string): Promise<Invoice[]> {
    try {
        const { data, error } = await supabase
            .from('payment_transactions')
            .select(`
        id,
        amount,
        payment_status,
        expires_at,
        created_at
      `)
            .eq('clinic_id', clinicId)
            .in('payment_status', ['pending', 'processing', 'awaiting_payment'])
            .order('expires_at', { ascending: true });

        if (error) {
            console.warn('[financial] Error fetching invoices:', error.message);
            return [];
        }

        const now = new Date();
        return (data || []).map((i: any) => {
            const dueDate = i.expires_at ? new Date(i.expires_at) : new Date(i.created_at);
            const isOverdue = dueDate < now;

            return {
                id: i.id,
                patientName: 'Cliente', // Would need a join to get patient name
                amount: i.amount || 0,
                dueDate: i.expires_at || i.created_at,
                status: isOverdue ? 'overdue' : 'pending',
            };
        });
    } catch (e) {
        console.error('[financial] Exception fetching invoices:', e);
        return [];
    }
}

function getTransactionDescription(paymentMethod: string | null, metadata: any): string {
    if (metadata?.description) {
        return metadata.description;
    }

    const methodLabels: Record<string, string> = {
        credit_card: 'Cartão de Crédito',
        debit_card: 'Cartão de Débito',
        pix: 'PIX',
        boleto: 'Boleto',
        cash: 'Dinheiro',
        transfer: 'Transferência',
    };

    return methodLabels[paymentMethod || ''] || `Pagamento - ${paymentMethod || 'Outros'}`;
}

function mapPaymentStatus(status: string | null): 'paid' | 'pending' | 'overdue' | 'failed' {
    const statusLower = (status || '').toLowerCase();

    if (['completed', 'settled', 'paid', 'authorized'].includes(statusLower)) {
        return 'paid';
    }
    if (['failed', 'cancelled', 'canceled', 'declined', 'expired'].includes(statusLower)) {
        return 'failed';
    }
    if (statusLower === 'overdue') {
        return 'overdue';
    }
    return 'pending';
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
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
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
