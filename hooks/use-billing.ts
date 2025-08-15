'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/app/utils/supabase/client';
import type {
  CreateInvoiceData,
  CreatePaymentData,
  CreateServiceData,
  FinancialSettings,
  FinancialSummary,
  Invoice,
  InvoiceCalculations,
  InvoiceFilters,
  Payment,
  PaymentCalculations,
  PaymentFilters,
  RevenueByPeriod,
  Service,
  ServiceFilters,
  UpdateFinancialSettingsData,
  UpdateInvoiceData,
  UpdateServiceData,
} from '@/types/billing';

export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);

  const supabase = createClient();

  // =====================================================
  // SERVICES MANAGEMENT
  // =====================================================

  const fetchServices = useCallback(
    async (filters?: ServiceFilters) => {
      try {
        setLoading(true);

        let query = supabase.from('services').select(`
          *,
          pricing_plans(*)
        `);

        // Apply filters
        if (filters?.type?.length) {
          query = query.in('type', filters.type);
        }

        if (filters?.category?.length) {
          query = query.in('category', filters.category);
        }

        if (filters?.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }

        if (filters?.price_min !== undefined) {
          query = query.gte('base_price', filters.price_min);
        }

        if (filters?.price_max !== undefined) {
          query = query.lte('base_price', filters.price_max);
        }

        if (filters?.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }

        // Sorting
        const sortBy = filters?.sort_by || 'name';
        const sortOrder = filters?.sort_order || 'asc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching services:', error);
          toast.error('Erro ao carregar serviços');
          return;
        }

        setServices(data || []);
      } catch (error) {
        console.error('Error in fetchServices:', error);
        toast.error('Erro inesperado ao carregar serviços');
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const createService = useCallback(
    async (serviceData: CreateServiceData): Promise<Service | null> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (error) {
          console.error('Error creating service:', error);
          toast.error('Erro ao criar serviço');
          return null;
        }

        toast.success('Serviço criado com sucesso');
        await fetchServices(); // Refresh list
        return data;
      } catch (error) {
        console.error('Error in createService:', error);
        toast.error('Erro inesperado ao criar serviço');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchServices]
  );

  const updateService = useCallback(
    async (id: string, updates: UpdateServiceData): Promise<Service | null> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('services')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating service:', error);
          toast.error('Erro ao atualizar serviço');
          return null;
        }

        toast.success('Serviço atualizado com sucesso');
        await fetchServices(); // Refresh list
        return data;
      } catch (error) {
        console.error('Error in updateService:', error);
        toast.error('Erro inesperado ao atualizar serviço');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchServices]
  );

  const deleteService = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);

        const { error } = await supabase.from('services').delete().eq('id', id);

        if (error) {
          console.error('Error deleting service:', error);
          toast.error('Erro ao excluir serviço');
          return false;
        }

        toast.success('Serviço excluído com sucesso');
        await fetchServices(); // Refresh list
        return true;
      } catch (error) {
        console.error('Error in deleteService:', error);
        toast.error('Erro inesperado ao excluir serviço');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchServices]
  );

  // =====================================================
  // INVOICES MANAGEMENT
  // =====================================================

  const fetchInvoices = useCallback(
    async (filters?: InvoiceFilters) => {
      try {
        setLoading(true);

        let query = supabase.from('invoices').select(`
          *,
          patient:profiles!invoices_patient_id_fkey(id, name, email, phone),
          appointment:appointments(id, scheduled_for),
          items:invoice_items(*),
          payments(*)
        `);

        // Apply filters
        if (filters?.status?.length) {
          query = query.in('status', filters.status);
        }

        if (filters?.patient_id) {
          query = query.eq('patient_id', filters.patient_id);
        }

        if (filters?.date_from) {
          query = query.gte('issue_date', filters.date_from);
        }

        if (filters?.date_to) {
          query = query.lte('issue_date', filters.date_to);
        }

        if (filters?.amount_min !== undefined) {
          query = query.gte('total_amount', filters.amount_min);
        }

        if (filters?.amount_max !== undefined) {
          query = query.lte('total_amount', filters.amount_max);
        }

        if (filters?.search) {
          query = query.or(
            `invoice_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
          );
        }

        // Pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Sorting
        const sortBy = filters?.sort_by || 'issue_date';
        const sortOrder = filters?.sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching invoices:', error);
          toast.error('Erro ao carregar faturas');
          return;
        }

        setInvoices(data || []);
      } catch (error) {
        console.error('Error in fetchInvoices:', error);
        toast.error('Erro inesperado ao carregar faturas');
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const createInvoice = useCallback(
    async (invoiceData: CreateInvoiceData): Promise<Invoice | null> => {
      try {
        setLoading(true);

        // Calculate totals
        const calculations = calculateInvoiceTotals(invoiceData.items);

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([
            {
              patient_id: invoiceData.patient_id,
              appointment_id: invoiceData.appointment_id,
              due_date: invoiceData.due_date,
              notes: invoiceData.notes,
              payment_terms: invoiceData.payment_terms,
              subtotal: calculations.subtotal,
              discount_amount: calculations.total_discount,
              tax_amount: calculations.tax_amount,
              total_amount: calculations.total_amount,
            },
          ])
          .select()
          .single();

        if (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          toast.error('Erro ao criar fatura');
          return null;
        }

        // Create invoice items
        const itemsWithInvoiceId = invoiceData.items.map((item) => ({
          ...item,
          invoice_id: invoice.id,
          subtotal: item.quantity * item.unit_price,
          total: item.quantity * item.unit_price - (item.discount_value || 0),
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
          // Rollback invoice creation
          await supabase.from('invoices').delete().eq('id', invoice.id);
          toast.error('Erro ao criar itens da fatura');
          return null;
        }

        toast.success('Fatura criada com sucesso');
        await fetchInvoices(); // Refresh list
        return invoice;
      } catch (error) {
        console.error('Error in createInvoice:', error);
        toast.error('Erro inesperado ao criar fatura');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchInvoices]
  );

  const updateInvoice = useCallback(
    async (id: string, updates: UpdateInvoiceData): Promise<Invoice | null> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('invoices')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating invoice:', error);
          toast.error('Erro ao atualizar fatura');
          return null;
        }

        toast.success('Fatura atualizada com sucesso');
        await fetchInvoices(); // Refresh list
        return data;
      } catch (error) {
        console.error('Error in updateInvoice:', error);
        toast.error('Erro inesperado ao atualizar fatura');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchInvoices]
  );

  // =====================================================
  // PAYMENTS MANAGEMENT
  // =====================================================

  const fetchPayments = useCallback(
    async (filters?: PaymentFilters) => {
      try {
        setLoading(true);

        let query = supabase.from('payments').select(`
          *,
          invoice:invoices(
            *,
            patient:profiles!invoices_patient_id_fkey(id, name, email)
          ),
          installment_payments:installments(*)
        `);

        // Apply filters
        if (filters?.status?.length) {
          query = query.in('status', filters.status);
        }

        if (filters?.method?.length) {
          query = query.in('method', filters.method);
        }

        if (filters?.date_from) {
          query = query.gte('payment_date', filters.date_from);
        }

        if (filters?.date_to) {
          query = query.lte('payment_date', filters.date_to);
        }

        if (filters?.amount_min !== undefined) {
          query = query.gte('amount', filters.amount_min);
        }

        if (filters?.amount_max !== undefined) {
          query = query.lte('amount', filters.amount_max);
        }

        if (filters?.search) {
          query = query.or(
            `payment_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
          );
        }

        // Pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Sorting
        const sortBy = filters?.sort_by || 'payment_date';
        const sortOrder = filters?.sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching payments:', error);
          toast.error('Erro ao carregar pagamentos');
          return;
        }

        setPayments(data || []);
      } catch (error) {
        console.error('Error in fetchPayments:', error);
        toast.error('Erro inesperado ao carregar pagamentos');
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const createPayment = useCallback(
    async (paymentData: CreatePaymentData): Promise<Payment | null> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('payments')
          .insert([paymentData])
          .select()
          .single();

        if (error) {
          console.error('Error creating payment:', error);
          toast.error('Erro ao criar pagamento');
          return null;
        }

        toast.success('Pagamento criado com sucesso');
        await fetchPayments(); // Refresh list
        return data;
      } catch (error) {
        console.error('Error in createPayment:', error);
        toast.error('Erro inesperado ao criar pagamento');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase, fetchPayments]
  );

  // =====================================================
  // FINANCIAL ANALYTICS
  // =====================================================

  const fetchFinancialSummary = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        setLoading(true);

        // Default to current month if no dates provided
        if (!startDate) {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        }
        if (!endDate) {
          endDate = new Date().toISOString().split('T')[0];
        }

        // Fetch invoices summary
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('status, total_amount, paid_amount')
          .gte('issue_date', startDate)
          .lte('issue_date', endDate);

        if (invoicesError) {
          console.error('Error fetching invoices summary:', invoicesError);
          return;
        }

        // Calculate summary
        const summary: FinancialSummary = {
          total_revenue: 0,
          pending_invoices: 0,
          overdue_invoices: 0,
          paid_invoices: 0,
          total_outstanding: 0,
          monthly_revenue: 0,
          daily_revenue: 0,
          period: { start_date: startDate, end_date: endDate },
        };

        invoicesData?.forEach((invoice: any) => {
          summary.total_revenue += invoice.paid_amount || 0;

          switch (invoice.status) {
            case 'paid':
              summary.paid_invoices += 1;
              break;
            case 'pending':
              summary.pending_invoices += 1;
              summary.total_outstanding +=
                invoice.total_amount - (invoice.paid_amount || 0);
              break;
            case 'overdue':
              summary.overdue_invoices += 1;
              summary.total_outstanding +=
                invoice.total_amount - (invoice.paid_amount || 0);
              break;
          }
        });

        // Calculate monthly and daily averages
        const daysDiff = Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        const monthsDiff = Math.max(1, daysDiff / 30);

        summary.daily_revenue = summary.total_revenue / daysDiff;
        summary.monthly_revenue = summary.total_revenue / monthsDiff;

        setFinancialSummary(summary);
      } catch (error) {
        console.error('Error in fetchFinancialSummary:', error);
        toast.error('Erro ao carregar resumo financeiro');
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const fetchRevenueByPeriod = useCallback(
    async (
      period: 'daily' | 'weekly' | 'monthly' = 'monthly',
      startDate?: string,
      endDate?: string
    ): Promise<RevenueByPeriod[]> => {
      try {
        // Default to last 12 periods if no dates provided
        if (!startDate) {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
            .toISOString()
            .split('T')[0];
        }
        if (!endDate) {
          endDate = new Date().toISOString().split('T')[0];
        }

        const { data, error } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .eq('status', 'completed')
          .gte('payment_date', startDate)
          .lte('payment_date', endDate);

        if (error) {
          console.error('Error fetching revenue by period:', error);
          return [];
        }

        // Group by period
        const grouped: { [key: string]: { revenue: number; count: number } } =
          {};

        data?.forEach((payment: any) => {
          const date = new Date(payment.payment_date);
          let periodKey = '';

          switch (period) {
            case 'daily':
              periodKey = date.toISOString().split('T')[0];
              break;
            case 'weekly': {
              const weekStart = new Date(
                date.setDate(date.getDate() - date.getDay())
              );
              periodKey = weekStart.toISOString().split('T')[0];
              break;
            }
            case 'monthly':
              periodKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, '0')}`;
              break;
          }

          if (!grouped[periodKey]) {
            grouped[periodKey] = { revenue: 0, count: 0 };
          }

          grouped[periodKey].revenue += payment.amount;
          grouped[periodKey].count += 1;
        });

        return Object.entries(grouped)
          .map(([period, data]) => ({
            period,
            revenue: data.revenue,
            invoices_count: data.count,
            payments_count: data.count,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));
      } catch (error) {
        console.error('Error in fetchRevenueByPeriod:', error);
        return [];
      }
    },
    [supabase]
  );

  // =====================================================
  // SETTINGS MANAGEMENT
  // =====================================================

  const fetchFinancialSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('financial_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching financial settings:', error);
        return;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error in fetchFinancialSettings:', error);
    }
  }, [supabase]);

  const updateFinancialSettings = useCallback(
    async (updates: UpdateFinancialSettingsData): Promise<boolean> => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('financial_settings')
          .update(updates)
          .eq('id', settings?.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating financial settings:', error);
          toast.error('Erro ao atualizar configurações');
          return false;
        }

        setSettings(data);
        toast.success('Configurações atualizadas com sucesso');
        return true;
      } catch (error) {
        console.error('Error in updateFinancialSettings:', error);
        toast.error('Erro inesperado ao atualizar configurações');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase, settings?.id]
  );

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const calculateInvoiceTotals = useCallback(
    (items: CreateInvoiceData['items']): InvoiceCalculations => {
      let subtotal = 0;
      let totalDiscount = 0;

      items.forEach((item) => {
        const itemSubtotal = item.quantity * item.unit_price;
        subtotal += itemSubtotal;
        totalDiscount += item.discount_value || 0;
      });

      const taxAmount =
        (subtotal - totalDiscount) * ((settings?.tax_rate || 0) / 100);
      const totalAmount = subtotal - totalDiscount + taxAmount;

      return {
        subtotal,
        total_discount: totalDiscount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      };
    },
    [settings?.tax_rate]
  );

  const calculatePaymentBalance = useCallback(
    (invoice: Invoice): PaymentCalculations => {
      const totalPaid = invoice.paid_amount || 0;
      const remainingBalance = invoice.total_amount - totalPaid;
      const isFullyPaid = remainingBalance <= 0.01; // Consider small amounts as paid

      return {
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        is_fully_paid: isFullyPaid,
      };
    },
    []
  );

  // Initialize data on mount
  useEffect(() => {
    fetchServices();
    fetchFinancialSettings();
    fetchFinancialSummary();
  }, [fetchServices, fetchFinancialSettings, fetchFinancialSummary]);

  return {
    // State
    loading,
    services,
    invoices,
    payments,
    financialSummary,
    settings,

    // Services
    fetchServices,
    createService,
    updateService,
    deleteService,

    // Invoices
    fetchInvoices,
    createInvoice,
    updateInvoice,

    // Payments
    fetchPayments,
    createPayment,

    // Analytics
    fetchFinancialSummary,
    fetchRevenueByPeriod,

    // Settings
    fetchFinancialSettings,
    updateFinancialSettings,

    // Utilities
    calculateInvoiceTotals,
    calculatePaymentBalance,
  };
}
