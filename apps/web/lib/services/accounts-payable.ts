// lib/services/accounts-payable.ts
// Service layer for accounts payable management

import { createClient } from '@/app/utils/supabase/client';
import type {
  AccountsPayable,
  AccountsPayableFilters,
  AccountsPayableFormData,
  AccountsPayableResponse,
} from '@/lib/types/accounts-payable';

const supabase = createClient();

export class AccountsPayableService {
  /**
   * Get all accounts payable with optional filtering
   */
  static async getAccountsPayable(
    filters?: AccountsPayableFilters,
    page = 1,
    pageSize = 20
  ): Promise<AccountsPayableResponse> {
    try {
      let query = supabase
        .from('accounts_payable')
        .select(
          `
          *,
          vendor:vendors(*),
          expense_category:expense_categories(*)
        `,
          { count: 'exact' }
        )
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `ap_number.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.expense_category_id) {
        query = query.eq('expense_category_id', filters.expense_category_id);
      }

      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }

      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      if (filters?.overdue_only) {
        query = query
          .lt('due_date', new Date().toISOString().split('T')[0])
          .in('status', ['pending', 'approved', 'scheduled']);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: accounts_payable, error, count } = await query;

      if (error) {
        console.error('Error fetching accounts payable:', error);
        throw new Error(`Failed to fetch accounts payable: ${error.message}`);
      }

      return {
        accounts_payable: accounts_payable || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error in getAccountsPayable:', error);
      throw error;
    }
  }

  /**
   * Get accounts payable by ID
   */
  static async getAccountsPayableById(
    id: string
  ): Promise<AccountsPayable | null> {
    try {
      const { data: ap, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          vendor:vendors(*),
          expense_category:expense_categories(*)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // AP not found
        }
        console.error('Error fetching accounts payable:', error);
        throw new Error(`Failed to fetch accounts payable: ${error.message}`);
      }

      return ap;
    } catch (error) {
      console.error('Error in getAccountsPayableById:', error);
      throw error;
    }
  }

  /**
   * Create new accounts payable
   */
  static async createAccountsPayable(
    apData: AccountsPayableFormData
  ): Promise<AccountsPayable> {
    try {
      const { data: ap, error } = await supabase
        .from('accounts_payable')
        .insert([
          {
            ...apData,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select(`
          *,
          vendor:vendors(*),
          expense_category:expense_categories(*)
        `)
        .single();

      if (error) {
        console.error('Error creating accounts payable:', error);
        throw new Error(`Failed to create accounts payable: ${error.message}`);
      }

      return ap;
    } catch (error) {
      console.error('Error in createAccountsPayable:', error);
      throw error;
    }
  }

  /**
   * Update existing accounts payable
   */
  static async updateAccountsPayable(
    id: string,
    apData: Partial<AccountsPayableFormData>
  ): Promise<AccountsPayable> {
    try {
      const { data: ap, error } = await supabase
        .from('accounts_payable')
        .update({
          ...apData,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select(`
          *,
          vendor:vendors(*),
          expense_category:expense_categories(*)
        `)
        .single();

      if (error) {
        console.error('Error updating accounts payable:', error);
        throw new Error(`Failed to update accounts payable: ${error.message}`);
      }

      return ap;
    } catch (error) {
      console.error('Error in updateAccountsPayable:', error);
      throw error;
    }
  }

  /**
   * Soft delete accounts payable
   */
  static async deleteAccountsPayable(
    id: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id,
          deleted_reason: reason || 'Deleted by user',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting accounts payable:', error);
        throw new Error(`Failed to delete accounts payable: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteAccountsPayable:', error);
      throw error;
    }
  }

  /**
   * Update accounts payable status
   */
  static async updateStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<AccountsPayable> {
    try {
      const updateData: any = {
        status,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;
        if (notes) updateData.approval_notes = notes;
      }

      const { data: ap, error } = await supabase
        .from('accounts_payable')
        .update(updateData)
        .eq('id', id)
        .is('deleted_at', null)
        .select(`
          *,
          vendor:vendors(*),
          expense_category:expense_categories(*)
        `)
        .single();

      if (error) {
        console.error('Error updating AP status:', error);
        throw new Error(`Failed to update AP status: ${error.message}`);
      }

      return ap;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  /**
   * Get accounts payable dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [
        totalResult,
        pendingResult,
        overdueResult,
        dueTodayResult,
        totalAmountResult,
      ] = await Promise.all([
        supabase
          .from('accounts_payable')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),

        supabase
          .from('accounts_payable')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'approved'])
          .is('deleted_at', null),

        supabase
          .from('accounts_payable')
          .select('id', { count: 'exact', head: true })
          .lt('due_date', today)
          .in('status', ['pending', 'approved', 'scheduled'])
          .is('deleted_at', null),

        supabase
          .from('accounts_payable')
          .select('id', { count: 'exact', head: true })
          .eq('due_date', today)
          .in('status', ['pending', 'approved', 'scheduled'])
          .is('deleted_at', null),

        supabase
          .from('accounts_payable')
          .select('balance_amount')
          .in('status', ['pending', 'approved', 'scheduled'])
          .is('deleted_at', null),
      ]);

      const totalOpenAmount =
        totalAmountResult.data?.reduce(
          (sum, ap) => sum + (ap.balance_amount || 0),
          0
        ) || 0;

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        overdue: overdueResult.count || 0,
        dueToday: dueTodayResult.count || 0,
        totalOpenAmount,
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        total: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0,
        totalOpenAmount: 0,
      };
    }
  }

  /**
   * Get upcoming due dates for calendar view
   */
  static async getUpcomingDueDates(days = 30): Promise<AccountsPayable[]> {
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

      const { data: aps, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          vendor:vendors(company_name),
          expense_category:expense_categories(category_name)
        `)
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', endDate.toISOString().split('T')[0])
        .in('status', ['pending', 'approved', 'scheduled'])
        .is('deleted_at', null)
        .order('due_date');

      if (error) {
        console.error('Error fetching upcoming due dates:', error);
        throw new Error(`Failed to fetch upcoming due dates: ${error.message}`);
      }

      return aps || [];
    } catch (error) {
      console.error('Error in getUpcomingDueDates:', error);
      throw error;
    }
  }

  /**
   * Generate next AP number
   */
  static async generateAPNumber(): Promise<string> {
    try {
      const year = new Date().getFullYear().toString();

      const { data, error } = await supabase
        .from('accounts_payable')
        .select('ap_number')
        .like('ap_number', `AP${year}-%`)
        .is('deleted_at', null)
        .order('ap_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error generating AP number:', error);
        return `AP${year}-000001`;
      }

      if (!data || data.length === 0) {
        return `AP${year}-000001`;
      }

      const lastNumber = data[0].ap_number;
      const numericPart = lastNumber.split('-')[1];
      const nextNumber = Number.parseInt(numericPart, 10) + 1;

      return `AP${year}-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('Error in generateAPNumber:', error);
      return `AP${new Date().getFullYear()}-000001`;
    }
  }

  /**
   * Calculate financial totals by status
   */
  static async getFinancialSummary() {
    try {
      const { data: aps, error } = await supabase
        .from('accounts_payable')
        .select('status, balance_amount, net_amount')
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching financial summary:', error);
        throw new Error(`Failed to fetch financial summary: ${error.message}`);
      }

      const summary = aps.reduce(
        (acc, ap) => {
          if (!acc[ap.status]) {
            acc[ap.status] = { count: 0, totalAmount: 0, balanceAmount: 0 };
          }
          acc[ap.status].count++;
          acc[ap.status].totalAmount += ap.net_amount || 0;
          acc[ap.status].balanceAmount += ap.balance_amount || 0;
          return acc;
        },
        {} as Record<
          string,
          { count: number; totalAmount: number; balanceAmount: number }
        >
      );

      return summary;
    } catch (error) {
      console.error('Error in getFinancialSummary:', error);
      return {};
    }
  }
}
