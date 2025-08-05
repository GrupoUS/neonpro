// NeonPro - Bank Reconciliation Manager
// Story 6.1 - Task 4: Bank Reconciliation System
// Comprehensive bank reconciliation service for automated transaction matching

import type { z } from "zod";
import type { createClient } from "@/lib/supabase/client";

// Validation schemas
const BankStatementSchema = z.object({
  id: z.string().optional(),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  statement_date: z.string().datetime(),
  opening_balance: z.number(),
  closing_balance: z.number(),
  total_credits: z.number(),
  total_debits: z.number(),
  statement_period_start: z.string().datetime(),
  statement_period_end: z.string().datetime(),
  file_path: z.string().optional(),
  import_status: z.enum(["pending", "processing", "completed", "failed"]).default("pending"),
  created_by: z.string().uuid(),
});

const BankTransactionSchema = z.object({
  id: z.string().optional(),
  statement_id: z.string().uuid(),
  transaction_date: z.string().datetime(),
  description: z.string().min(1, "Description is required"),
  reference_number: z.string().optional(),
  debit_amount: z.number().optional(),
  credit_amount: z.number().optional(),
  balance: z.number(),
  transaction_type: z.enum(["debit", "credit"]),
  category: z.string().optional(),
  matched_payment_id: z.string().uuid().optional(),
  reconciliation_status: z
    .enum(["unmatched", "matched", "disputed", "ignored"])
    .default("unmatched"),
  matching_confidence: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

const ReconciliationRuleSchema = z.object({
  id: z.string().optional(),
  rule_name: z.string().min(1, "Rule name is required"),
  rule_type: z.enum([
    "exact_match",
    "amount_match",
    "date_range_match",
    "description_pattern",
    "reference_match",
  ]),
  conditions: z.record(z.any()),
  priority: z.number().min(1).max(10).default(5),
  auto_match: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid(),
});

const DiscrepancySchema = z.object({
  id: z.string().optional(),
  statement_id: z.string().uuid(),
  discrepancy_type: z.enum([
    "missing_transaction",
    "duplicate_transaction",
    "amount_mismatch",
    "date_mismatch",
    "unmatched_payment",
  ]),
  description: z.string().min(1, "Description is required"),
  expected_amount: z.number().optional(),
  actual_amount: z.number().optional(),
  transaction_id: z.string().uuid().optional(),
  payment_id: z.string().uuid().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["open", "investigating", "resolved", "closed"]).default("open"),
  resolution_notes: z.string().optional(),
  resolved_by: z.string().uuid().optional(),
  resolved_at: z.string().datetime().optional(),
});

export type BankStatement = z.infer<typeof BankStatementSchema>;
export type BankTransaction = z.infer<typeof BankTransactionSchema>;
export type ReconciliationRule = z.infer<typeof ReconciliationRuleSchema>;
export type Discrepancy = z.infer<typeof DiscrepancySchema>;

export interface ReconciliationSummary {
  statement_id: string;
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  disputed_transactions: number;
  total_discrepancies: number;
  reconciliation_percentage: number;
  balance_difference: number;
  last_reconciled_at: string;
}

export interface MatchingResult {
  transaction_id: string;
  payment_id: string | null;
  confidence_score: number;
  matching_criteria: string[];
  auto_matched: boolean;
}

export interface ImportResult {
  statement_id: string;
  total_transactions: number;
  imported_transactions: number;
  failed_transactions: number;
  errors: string[];
  warnings: string[];
}

/**
 * Bank Reconciliation Manager
 * Handles bank statement imports, transaction matching, and discrepancy detection
 */
export class BankReconciliationManager {
  private supabase = createClient();

  /**
   * Import bank statement from file
   */
  async importBankStatement(
    statementData: Omit<BankStatement, "id">,
    transactions: Omit<BankTransaction, "id" | "statement_id">[],
  ): Promise<ImportResult> {
    try {
      // Validate statement data
      const validatedStatement = BankStatementSchema.parse(statementData);

      // Insert bank statement
      const { data: statement, error: statementError } = await this.supabase
        .from("bank_statements")
        .insert(validatedStatement)
        .select()
        .single();

      if (statementError) {
        throw new Error(`Failed to insert bank statement: ${statementError.message}`);
      }

      const importResult: ImportResult = {
        statement_id: statement.id,
        total_transactions: transactions.length,
        imported_transactions: 0,
        failed_transactions: 0,
        errors: [],
        warnings: [],
      };

      // Import transactions in batches
      const batchSize = 100;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);

        try {
          const validatedTransactions = batch.map((transaction) => {
            const validated = BankTransactionSchema.parse({
              ...transaction,
              statement_id: statement.id,
            });
            return validated;
          });

          const { data, error } = await this.supabase
            .from("bank_transactions")
            .insert(validatedTransactions)
            .select();

          if (error) {
            importResult.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
            importResult.failed_transactions += batch.length;
          } else {
            importResult.imported_transactions += data.length;
          }
        } catch (validationError) {
          importResult.errors.push(
            `Validation error in batch ${Math.floor(i / batchSize) + 1}: ${validationError}`,
          );
          importResult.failed_transactions += batch.length;
        }
      }

      // Update statement status
      const finalStatus = importResult.failed_transactions === 0 ? "completed" : "failed";
      await this.supabase
        .from("bank_statements")
        .update({ import_status: finalStatus })
        .eq("id", statement.id);

      return importResult;
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Perform automatic transaction matching
   */
  async performAutoMatching(statementId: string): Promise<MatchingResult[]> {
    try {
      // Get unmatched transactions
      const { data: transactions, error: transError } = await this.supabase
        .from("bank_transactions")
        .select("*")
        .eq("statement_id", statementId)
        .eq("reconciliation_status", "unmatched");

      if (transError) {
        throw new Error(`Failed to fetch transactions: ${transError.message}`);
      }

      // Get active reconciliation rules
      const { data: rules, error: rulesError } = await this.supabase
        .from("reconciliation_rules")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (rulesError) {
        throw new Error(`Failed to fetch reconciliation rules: ${rulesError.message}`);
      }

      const matchingResults: MatchingResult[] = [];

      for (const transaction of transactions) {
        const matchResult = await this.findMatchingPayment(transaction, rules);

        if (matchResult) {
          matchingResults.push(matchResult);

          // Update transaction with match
          await this.supabase
            .from("bank_transactions")
            .update({
              matched_payment_id: matchResult.payment_id,
              reconciliation_status: matchResult.auto_matched ? "matched" : "unmatched",
              matching_confidence: matchResult.confidence_score,
              notes: `Auto-matched using criteria: ${matchResult.matching_criteria.join(", ")}`,
            })
            .eq("id", matchResult.transaction_id);
        }
      }

      return matchingResults;
    } catch (error) {
      throw new Error(
        `Auto matching failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Find matching payment for a bank transaction
   */
  private async findMatchingPayment(
    transaction: BankTransaction,
    rules: ReconciliationRule[],
  ): Promise<MatchingResult | null> {
    try {
      const amount = transaction.credit_amount || transaction.debit_amount || 0;
      const transactionDate = new Date(transaction.transaction_date);

      // Search for potential payment matches
      const dateRange = 7; // days
      const startDate = new Date(transactionDate);
      startDate.setDate(startDate.getDate() - dateRange);
      const endDate = new Date(transactionDate);
      endDate.setDate(endDate.getDate() + dateRange);

      const { data: payments, error } = await this.supabase
        .from("payments")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .eq("status", "completed");

      if (error || !payments) {
        return null;
      }

      let bestMatch: MatchingResult | null = null;
      let highestConfidence = 0;

      for (const payment of payments) {
        const confidence = this.calculateMatchingConfidence(transaction, payment, rules);

        if (confidence.score > highestConfidence && confidence.score >= 0.7) {
          highestConfidence = confidence.score;
          bestMatch = {
            transaction_id: transaction.id!,
            payment_id: payment.id,
            confidence_score: confidence.score,
            matching_criteria: confidence.criteria,
            auto_matched: confidence.score >= 0.9,
          };
        }
      }

      return bestMatch;
    } catch (error) {
      console.error("Error finding matching payment:", error);
      return null;
    }
  }

  /**
   * Calculate matching confidence between transaction and payment
   */
  private calculateMatchingConfidence(
    transaction: BankTransaction,
    payment: any,
    rules: ReconciliationRule[],
  ): { score: number; criteria: string[] } {
    let score = 0;
    const criteria: string[] = [];
    const amount = transaction.credit_amount || transaction.debit_amount || 0;

    // Exact amount match (40% weight)
    if (Math.abs(payment.amount - amount) < 0.01) {
      score += 0.4;
      criteria.push("exact_amount_match");
    } else if (Math.abs(payment.amount - amount) / payment.amount < 0.05) {
      score += 0.2;
      criteria.push("approximate_amount_match");
    }

    // Date proximity (30% weight)
    const transactionDate = new Date(transaction.transaction_date);
    const paymentDate = new Date(payment.created_at);
    const daysDiff =
      Math.abs(transactionDate.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff === 0) {
      score += 0.3;
      criteria.push("same_date");
    } else if (daysDiff <= 1) {
      score += 0.2;
      criteria.push("next_day");
    } else if (daysDiff <= 3) {
      score += 0.1;
      criteria.push("within_3_days");
    }

    // Reference number match (20% weight)
    if (transaction.reference_number && payment.reference_id) {
      if (transaction.reference_number === payment.reference_id) {
        score += 0.2;
        criteria.push("reference_match");
      } else if (
        transaction.reference_number.includes(payment.reference_id) ||
        payment.reference_id.includes(transaction.reference_number)
      ) {
        score += 0.1;
        criteria.push("partial_reference_match");
      }
    }

    // Description similarity (10% weight)
    if (transaction.description && payment.description) {
      const similarity = this.calculateStringSimilarity(
        transaction.description.toLowerCase(),
        payment.description.toLowerCase(),
      );

      if (similarity > 0.8) {
        score += 0.1;
        criteria.push("description_match");
      } else if (similarity > 0.5) {
        score += 0.05;
        criteria.push("partial_description_match");
      }
    }

    return { score: Math.min(score, 1), criteria };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
  }

  /**
   * Detect discrepancies in reconciliation
   */
  async detectDiscrepancies(statementId: string): Promise<Discrepancy[]> {
    try {
      const discrepancies: Discrepancy[] = [];

      // Get statement and transactions
      const { data: statement, error: stmtError } = await this.supabase
        .from("bank_statements")
        .select("*")
        .eq("id", statementId)
        .single();

      if (stmtError) {
        throw new Error(`Failed to fetch statement: ${stmtError.message}`);
      }

      const { data: transactions, error: transError } = await this.supabase
        .from("bank_transactions")
        .select("*")
        .eq("statement_id", statementId);

      if (transError) {
        throw new Error(`Failed to fetch transactions: ${transError.message}`);
      }

      // Check balance reconciliation
      const calculatedBalance = transactions.reduce((balance, trans) => {
        const credit = trans.credit_amount || 0;
        const debit = trans.debit_amount || 0;
        return balance + credit - debit;
      }, statement.opening_balance);

      if (Math.abs(calculatedBalance - statement.closing_balance) > 0.01) {
        discrepancies.push({
          statement_id: statementId,
          discrepancy_type: "amount_mismatch",
          description: "Calculated balance does not match statement closing balance",
          expected_amount: statement.closing_balance,
          actual_amount: calculatedBalance,
          severity: "high",
        });
      }

      // Check for unmatched transactions
      const unmatchedTransactions = transactions.filter(
        (trans) => trans.reconciliation_status === "unmatched",
      );

      for (const transaction of unmatchedTransactions) {
        discrepancies.push({
          statement_id: statementId,
          discrepancy_type: "unmatched_payment",
          description: `Unmatched transaction: ${transaction.description}`,
          actual_amount: transaction.credit_amount || transaction.debit_amount,
          transaction_id: transaction.id,
          severity: "medium",
        });
      }

      // Check for duplicate transactions
      const duplicates = this.findDuplicateTransactions(transactions);
      for (const duplicate of duplicates) {
        discrepancies.push({
          statement_id: statementId,
          discrepancy_type: "duplicate_transaction",
          description: `Potential duplicate transaction: ${duplicate.description}`,
          actual_amount: duplicate.credit_amount || duplicate.debit_amount,
          transaction_id: duplicate.id,
          severity: "medium",
        });
      }

      // Save discrepancies to database
      if (discrepancies.length > 0) {
        const { error: discError } = await this.supabase
          .from("reconciliation_discrepancies")
          .insert(discrepancies);

        if (discError) {
          console.error("Failed to save discrepancies:", discError);
        }
      }

      return discrepancies;
    } catch (error) {
      throw new Error(
        `Discrepancy detection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Find duplicate transactions
   */
  private findDuplicateTransactions(transactions: BankTransaction[]): BankTransaction[] {
    const duplicates: BankTransaction[] = [];
    const seen = new Map<string, BankTransaction>();

    for (const transaction of transactions) {
      const key = `${transaction.transaction_date}_${transaction.credit_amount || transaction.debit_amount}_${transaction.description}`;

      if (seen.has(key)) {
        duplicates.push(transaction);
      } else {
        seen.set(key, transaction);
      }
    }

    return duplicates;
  }

  /**
   * Get reconciliation summary
   */
  async getReconciliationSummary(statementId: string): Promise<ReconciliationSummary> {
    try {
      const { data: transactions, error } = await this.supabase
        .from("bank_transactions")
        .select("reconciliation_status")
        .eq("statement_id", statementId);

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      const total = transactions.length;
      const matched = transactions.filter((t) => t.reconciliation_status === "matched").length;
      const unmatched = transactions.filter((t) => t.reconciliation_status === "unmatched").length;
      const disputed = transactions.filter((t) => t.reconciliation_status === "disputed").length;

      const { data: discrepancies, error: discError } = await this.supabase
        .from("reconciliation_discrepancies")
        .select("id")
        .eq("statement_id", statementId)
        .eq("status", "open");

      if (discError) {
        throw new Error(`Failed to fetch discrepancies: ${discError.message}`);
      }

      return {
        statement_id: statementId,
        total_transactions: total,
        matched_transactions: matched,
        unmatched_transactions: unmatched,
        disputed_transactions: disputed,
        total_discrepancies: discrepancies.length,
        reconciliation_percentage: total > 0 ? (matched / total) * 100 : 0,
        balance_difference: 0, // This would be calculated from actual vs expected balance
        last_reconciled_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to get reconciliation summary: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Manual transaction matching
   */
  async manualMatch(transactionId: string, paymentId: string, notes?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("bank_transactions")
        .update({
          matched_payment_id: paymentId,
          reconciliation_status: "matched",
          matching_confidence: 1.0,
          notes: notes || "Manually matched",
        })
        .eq("id", transactionId);

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }
    } catch (error) {
      throw new Error(
        `Manual matching failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create reconciliation rule
   */
  async createReconciliationRule(
    ruleData: Omit<ReconciliationRule, "id">,
  ): Promise<ReconciliationRule> {
    try {
      const validatedRule = ReconciliationRuleSchema.parse(ruleData);

      const { data, error } = await this.supabase
        .from("reconciliation_rules")
        .insert(validatedRule)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create reconciliation rule: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(
        `Rule creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
let bankReconciliationManager: BankReconciliationManager;

export function getBankReconciliationManager(): BankReconciliationManager {
  if (!bankReconciliationManager) {
    bankReconciliationManager = new BankReconciliationManager();
  }
  return bankReconciliationManager;
}
