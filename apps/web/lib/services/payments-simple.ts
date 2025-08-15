import { createClient } from '@/app/utils/supabase/client';

// Define types directly since we don't have the database types file
export interface Payment {
  id: string;
  accounts_payable_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentInsert {
  accounts_payable_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentUpdate {
  payment_date?: string;
  amount_paid?: number;
  payment_method?:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'failed';
  updated_at: string;
}

export interface PaymentWithDetails extends Payment {
  accounts_payable?: {
    id: string;
    invoice_number: string;
    vendor_name: string;
    net_amount: number;
  };
  vendor_name?: string;
  invoice_number?: string;
}

export interface PaymentFormData {
  accounts_payable_id: string;
  payment_date: string;
  amount_paid: number;
  payment_method:
    | 'cash'
    | 'check'
    | 'bank_transfer'
    | 'pix'
    | 'credit_card'
    | 'other';
  reference_number?: string;
  bank_account?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
}

export interface BulkPaymentData {
  accounts_payable_ids: string[];
  payment_date: string;
  payment_method: string;
  total_amount: number;
  payments: Array<{
    accounts_payable_id: string;
    amount_paid: number;
  }>;
  notes?: string;
}

export interface PaymentSummary {
  total_payments: number;
  total_amount: number;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
  average_payment_amount: number;
  payment_methods: Record<string, number>;
}

export class PaymentsService {
  private supabase = createClient();

  async createPayment(paymentData: PaymentFormData): Promise<Payment> {
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const insertData: PaymentInsert = {
        ...paymentData,
        created_by: currentUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('ap_payments')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Update accounts payable paid amount if payment is completed
      if (paymentData.status === 'completed') {
        await this.updatePayablePaidAmount(paymentData.accounts_payable_id);
      }

      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Falha ao criar pagamento');
    }
  }

  async processBulkPayments(bulkData: BulkPaymentData): Promise<Payment[]> {
    try {
      const { data: currentUser } = await this.supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Usuário não autenticado');

      const payments: PaymentInsert[] = bulkData.payments.map((payment) => ({
        accounts_payable_id: payment.accounts_payable_id,
        payment_date: bulkData.payment_date,
        amount_paid: payment.amount_paid,
        payment_method: bulkData.payment_method as any,
        reference_number: `BULK${Date.now()}`,
        notes: bulkData.notes || 'Pagamento em lote',
        status: 'completed',
        created_by: currentUser.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await this.supabase
        .from('ap_payments')
        .insert(payments)
        .select();

      if (error) throw error;

      // Update all related accounts payable
      for (const payment of bulkData.payments) {
        await this.updatePayablePaidAmount(payment.accounts_payable_id);
      }

      return data || [];
    } catch (error) {
      console.error('Error processing bulk payments:', error);
      throw new Error('Falha ao processar pagamentos em lote');
    }
  }

  private async updatePayablePaidAmount(payableId: string): Promise<void> {
    try {
      // Calculate total paid amount for this payable
      const { data: payments } = await this.supabase
        .from('ap_payments')
        .select('amount_paid')
        .eq('accounts_payable_id', payableId)
        .eq('status', 'completed');

      const totalPaid =
        payments?.reduce((sum, p) => sum + p.amount_paid, 0) || 0;

      // Update the accounts payable record
      await this.supabase
        .from('accounts_payable')
        .update({
          paid_amount: totalPaid,
          status: totalPaid > 0 ? 'partial' : 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payableId);
    } catch (error) {
      console.error('Error updating payable paid amount:', error);
      // Don't throw here to avoid breaking the main operation
    }
  }
}

// Export singleton instance
export const paymentsService = new PaymentsService();
