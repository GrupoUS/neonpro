// lib/services/expense-categories.ts
// Service layer for expense categories management

import { createClient } from '@/app/utils/supabase/client';
import type { ExpenseCategory } from '@/lib/types/accounts-payable';

const supabase = createClient();

export class ExpenseCategoryService {
  /**
   * Get all expense categories
   */
  static async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const { data: categories, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('category_name');

    if (error) {
      throw new Error(`Failed to fetch expense categories: ${error.message}`);
    }

    return categories || [];
  }

  /**
   * Get expense category by ID
   */
  static async getExpenseCategoryById(
    id: string,
  ): Promise<ExpenseCategory | null> {
    const { data: category, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Category not found
      }
      throw new Error(`Failed to fetch expense category: ${error.message}`);
    }

    return category;
  }

  /**
   * Get active categories for dropdown selection
   */
  static async getActiveCategoriesForSelection(): Promise<
    { id: string; label: string; value: string }[]
  > {
    const { data: categories, error } = await supabase
      .from('expense_categories')
      .select('id, category_code, category_name')
      .eq('is_active', true)
      .order('category_name');

    if (error) {
      throw new Error(
        `Failed to fetch active expense categories: ${error.message}`,
      );
    }

    return categories.map((category) => ({
      id: category.id,
      label: `${category.category_code} - ${category.category_name}`,
      value: category.id,
    }));
  }

  /**
   * Create new expense category
   */
  static async createExpenseCategory(categoryData: {
    category_code: string;
    category_name: string;
    parent_category_id?: string;
    description?: string;
    requires_approval?: boolean;
  }): Promise<ExpenseCategory> {
    const { data: category, error } = await supabase
      .from('expense_categories')
      .insert([
        {
          ...categoryData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense category: ${error.message}`);
    }

    return category;
  }

  /**
   * Update existing expense category
   */
  static async updateExpenseCategory(
    id: string,
    categoryData: {
      category_code?: string;
      category_name?: string;
      parent_category_id?: string;
      description?: string;
      requires_approval?: boolean;
      is_active?: boolean;
    },
  ): Promise<ExpenseCategory> {
    const { data: category, error } = await supabase
      .from('expense_categories')
      .update({
        ...categoryData,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update expense category: ${error.message}`);
    }

    return category;
  }

  /**
   * Check if category code is unique
   */
  static async isCategoryCodeUnique(
    categoryCode: string,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('expense_categories')
        .select('id')
        .eq('category_code', categoryCode);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        return false;
      }

      return data.length === 0;
    } catch (_error) {
      return false;
    }
  }
}
