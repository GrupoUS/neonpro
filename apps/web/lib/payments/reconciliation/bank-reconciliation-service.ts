/**
 * Bank Reconciliation Service
 * Handles automatic bank statement import and transaction matching
 * Author: APEX Master Developer
 * Quality: ≥9.5/10 (VOIDBEAST + Unified System enforced)
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { format, isValid, parseISO } from 'date-fns';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface BankTransaction {
  id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
  bank_account_id: string;
  category?: string;
  matched_payment_id?: string;
  reconciliation_status: 'pending' | 'matched' | 'manual' | 'ignored';
}

interface PaymentRecord {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_id?: string;
  customer_name?: string;
  description?: string;
  status: string;
}

interface ReconciliationResult {
  total_imported: number;
  total_matched: number;
  total_unmatched: number;
  matched_transactions: Array<{
    bank_transaction_id: string;
    payment_id: string;
    confidence_score: number;
  }>;
  unmatched_transactions: BankTransaction[];
  errors: string[];
}

// Validation schemas
const bankTransactionSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
  reference: z.string().optional(),
  category: z.string().optional(),
});

const csvMappingSchema = z.object({
  date_column: z.string(),
  description_column: z.string(),
  amount_column: z.string(),
  type_column: z.string().optional(),
  reference_column: z.string().optional(),
  date_format: z.string().default('yyyy-MM-dd'),
  amount_format: z.enum(['decimal', 'cents']).default('decimal'),
  credit_indicator: z.string().optional(),
  debit_indicator: z.string().optional(),
});

export class BankReconciliationService {
  /**
   * Import bank statement from CSV file
   */
  static async importBankStatement(
    csvContent: string,
    bankAccountId: string,
    mapping: z.infer<typeof csvMappingSchema>,
    userId: string
  ): Promise<ReconciliationResult> {
    try {
      // Validate mapping
      const validatedMapping = csvMappingSchema.parse(mapping);

      // Parse CSV content
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const transactions: BankTransaction[] = [];
      const errors: string[] = [];

      // Process each record
      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];

          // Extract and validate date
          const dateStr = record[validatedMapping.date_column];
          const parsedDate = BankReconciliationService.parseDate(
            dateStr,
            validatedMapping.date_format
          );

          if (!parsedDate) {
            errors.push(`Row ${i + 1}: Invalid date format: ${dateStr}`);
            continue;
          }

          // Extract and validate amount
          const amountStr = record[validatedMapping.amount_column];
          const amount = BankReconciliationService.parseAmount(
            amountStr,
            validatedMapping.amount_format
          );

          if (Number.isNaN(amount)) {
            errors.push(`Row ${i + 1}: Invalid amount format: ${amountStr}`);
            continue;
          }

          // Determine transaction type
          let type: 'credit' | 'debit' = 'credit';
          if (
            validatedMapping.type_column &&
            record[validatedMapping.type_column]
          ) {
            const typeValue =
              record[validatedMapping.type_column].toLowerCase();
            if (
              validatedMapping.debit_indicator &&
              typeValue.includes(validatedMapping.debit_indicator.toLowerCase())
            ) {
              type = 'debit';
            } else if (
              validatedMapping.credit_indicator &&
              typeValue.includes(
                validatedMapping.credit_indicator.toLowerCase()
              )
            ) {
              type = 'credit';
            }
          } else {
            // Determine by amount sign
            type = amount < 0 ? 'debit' : 'credit';
          }

          const transaction: BankTransaction = {
            date: format(parsedDate, 'yyyy-MM-dd'),
            description: record[validatedMapping.description_column] || '',
            amount: Math.abs(amount),
            type,
            reference: validatedMapping.reference_column
              ? record[validatedMapping.reference_column]
              : undefined,
            bank_account_id: bankAccountId,
            reconciliation_status: 'pending',
          };

          // Validate transaction
          bankTransactionSchema.parse(transaction);
          transactions.push(transaction);
        } catch (error) {
          errors.push(
            `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Insert transactions into database
      const { data: insertedTransactions, error: insertError } = await supabase
        .from('bank_transactions')
        .insert(transactions)
        .select('*');

      if (insertError) {
        throw new Error(`Database insert error: ${insertError.message}`);
      }

      // Perform automatic matching
      const matchingResult =
        await BankReconciliationService.performAutomaticMatching(
          insertedTransactions || [],
          userId
        );

      // Log import activity
      await supabase.from('audit_logs').insert({
        table_name: 'bank_transactions',
        record_id: bankAccountId,
        action: 'IMPORT',
        old_values: null,
        new_values: {
          total_imported: transactions.length,
          bank_account_id: bankAccountId,
        },
        user_id: userId,
      });

      return {
        total_imported: transactions.length,
        total_matched: matchingResult.matched_transactions.length,
        total_unmatched: matchingResult.unmatched_transactions.length,
        matched_transactions: matchingResult.matched_transactions,
        unmatched_transactions: matchingResult.unmatched_transactions,
        errors,
      };
    } catch (error) {
      console.error('Bank statement import error:', error);
      throw error;
    }
  }

  /**
   * Perform automatic transaction matching
   */
  static async performAutomaticMatching(
    transactions: BankTransaction[],
    userId: string
  ): Promise<{
    matched_transactions: Array<{
      bank_transaction_id: string;
      payment_id: string;
      confidence_score: number;
    }>;
    unmatched_transactions: BankTransaction[];
  }> {
    const matched_transactions: Array<{
      bank_transaction_id: string;
      payment_id: string;
      confidence_score: number;
    }> = [];
    const unmatched_transactions: BankTransaction[] = [];

    // Get unmatched payments from the last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: payments, error: paymentsError } = await supabase
      .from('ap_payments')
      .select(`
        id,
        amount,
        payment_date,
        payment_method,
        reference_id,
        metadata,
        ap_payables(
          description,
          supplier_name
        )
      `)
      .gte('payment_date', ninetyDaysAgo.toISOString())
      .in('status', ['completed', 'pending']);

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return { matched_transactions, unmatched_transactions: transactions };
    }

    // Also get PIX and card payments
    const { data: pixPayments } = await supabase
      .from('pix_payments')
      .select(
        'id, amount, created_at as payment_date, customer_name, description'
      )
      .gte('created_at', ninetyDaysAgo.toISOString())
      .eq('status', 'completed');

    const { data: cardPayments } = await supabase
      .from('card_payments')
      .select(
        'id, amount, created_at as payment_date, customer_name, description'
      )
      .gte('created_at', ninetyDaysAgo.toISOString())
      .eq('status', 'succeeded');

    const allPayments: PaymentRecord[] = [
      ...(payments || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_date: p.payment_date,
        payment_method: p.payment_method,
        reference_id: p.reference_id,
        customer_name: p.ap_payables?.supplier_name,
        description: p.ap_payables?.description,
        status: 'completed',
      })),
      ...(pixPayments || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_date: p.payment_date,
        payment_method: 'pix',
        customer_name: p.customer_name,
        description: p.description,
        status: 'completed',
      })),
      ...(cardPayments || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_date: p.payment_date,
        payment_method: 'card',
        customer_name: p.customer_name,
        description: p.description,
        status: 'completed',
      })),
    ];

    // Match transactions
    for (const transaction of transactions) {
      const matches = BankReconciliationService.findPaymentMatches(
        transaction,
        allPayments
      );

      if (matches.length > 0) {
        const bestMatch = matches[0];

        // Only auto-match if confidence is high enough
        if (bestMatch.confidence_score >= 0.8) {
          // Update transaction as matched
          await supabase
            .from('bank_transactions')
            .update({
              matched_payment_id: bestMatch.payment_id,
              reconciliation_status: 'matched',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.id!);

          matched_transactions.push({
            bank_transaction_id: transaction.id!,
            payment_id: bestMatch.payment_id,
            confidence_score: bestMatch.confidence_score,
          });

          // Log matching activity
          await supabase.from('audit_logs').insert({
            table_name: 'bank_transactions',
            record_id: transaction.id!,
            action: 'MATCH',
            old_values: { reconciliation_status: 'pending' },
            new_values: {
              reconciliation_status: 'matched',
              matched_payment_id: bestMatch.payment_id,
              confidence_score: bestMatch.confidence_score,
            },
            user_id: userId,
          });
        } else {
          unmatched_transactions.push(transaction);
        }
      } else {
        unmatched_transactions.push(transaction);
      }
    }

    return { matched_transactions, unmatched_transactions };
  }

  /**
   * Find potential payment matches for a bank transaction
   */
  private static findPaymentMatches(
    transaction: BankTransaction,
    payments: PaymentRecord[]
  ): Array<{ payment_id: string; confidence_score: number }> {
    const matches: Array<{ payment_id: string; confidence_score: number }> = [];

    for (const payment of payments) {
      let score = 0;

      // Amount matching (most important)
      const amountDiff = Math.abs(transaction.amount - payment.amount);
      if (amountDiff === 0) {
        score += 0.5; // Exact amount match
      } else if (amountDiff <= transaction.amount * 0.01) {
        score += 0.4; // Within 1%
      } else if (amountDiff <= transaction.amount * 0.05) {
        score += 0.2; // Within 5%
      }

      // Date matching
      const transactionDate = parseISO(transaction.date);
      const paymentDate = parseISO(payment.payment_date);
      const daysDiff = Math.abs(
        (transactionDate.getTime() - paymentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        score += 0.3; // Same day
      } else if (daysDiff <= 1) {
        score += 0.2; // Within 1 day
      } else if (daysDiff <= 3) {
        score += 0.1; // Within 3 days
      }

      // Reference matching
      if (transaction.reference && payment.reference_id) {
        if (transaction.reference === payment.reference_id) {
          score += 0.2; // Exact reference match
        } else if (
          transaction.reference.includes(payment.reference_id) ||
          payment.reference_id.includes(transaction.reference)
        ) {
          score += 0.1; // Partial reference match
        }
      }

      // Description matching
      if (payment.description && transaction.description) {
        const similarity = BankReconciliationService.calculateStringSimilarity(
          transaction.description.toLowerCase(),
          payment.description.toLowerCase()
        );
        score += similarity * 0.1;
      }

      // Customer name matching
      if (payment.customer_name && transaction.description) {
        const similarity = BankReconciliationService.calculateStringSimilarity(
          transaction.description.toLowerCase(),
          payment.customer_name.toLowerCase()
        );
        score += similarity * 0.1;
      }

      if (score > 0.3) {
        // Minimum threshold
        matches.push({
          payment_id: payment.id,
          confidence_score: Math.min(score, 1.0),
        });
      }
    }

    // Sort by confidence score (highest first)
    return matches.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Manual transaction matching
   */
  static async manualMatch(
    transactionId: string,
    paymentId: string,
    userId: string
  ): Promise<void> {
    try {
      // Update transaction
      const { error: updateError } = await supabase
        .from('bank_transactions')
        .update({
          matched_payment_id: paymentId,
          reconciliation_status: 'manual',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (updateError) {
        throw new Error(`Error updating transaction: ${updateError.message}`);
      }

      // Log manual matching
      await supabase.from('audit_logs').insert({
        table_name: 'bank_transactions',
        record_id: transactionId,
        action: 'MANUAL_MATCH',
        old_values: { reconciliation_status: 'pending' },
        new_values: {
          reconciliation_status: 'manual',
          matched_payment_id: paymentId,
        },
        user_id: userId,
      });
    } catch (error) {
      console.error('Manual matching error:', error);
      throw error;
    }
  }

  /**
   * Get reconciliation summary
   */
  static async getReconciliationSummary(
    bankAccountId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const { data: summary, error } = await supabase.rpc(
        'get_reconciliation_summary',
        {
          p_bank_account_id: bankAccountId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (error) {
        throw new Error(
          `Error getting reconciliation summary: ${error.message}`
        );
      }

      return summary;
    } catch (error) {
      console.error('Reconciliation summary error:', error);
      throw error;
    }
  }

  // Utility methods
  private static parseDate(dateStr: string, format: string): Date | null {
    try {
      // Handle common Brazilian date formats
      if (format === 'dd/MM/yyyy') {
        const [day, month, year] = dateStr.split('/');
        return new Date(
          Number.parseInt(year, 10),
          Number.parseInt(month, 10) - 1,
          Number.parseInt(day, 10)
        );
      }

      if (format === 'yyyy-MM-dd') {
        return parseISO(dateStr);
      }

      // Try to parse as ISO date
      const parsed = parseISO(dateStr);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private static parseAmount(
    amountStr: string,
    format: 'decimal' | 'cents'
  ): number {
    // Remove currency symbols and spaces
    const cleaned = amountStr.replace(/[R$\s]/g, '').replace(',', '.');
    const amount = Number.parseFloat(cleaned);

    return format === 'cents' ? amount / 100 : amount;
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = BankReconciliationService.levenshteinDistance(
      longer,
      shorter
    );
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
