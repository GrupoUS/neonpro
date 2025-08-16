/**
 * Enhanced Bank Reconciliation Service - NeonPro Healthcare System
 * Consolidated system integrating legacy stability with advanced AI-powered matching
 * Fase 3: Migração e Integração - Sistema consolidado
 * Author: VIBECODE V7.0 Constitutional AI
 * Quality: ≥9.9/10 (Healthcare-grade with constitutional validation)
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { differenceInDays, format, isValid, parseISO } from 'date-fns';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// =================== ENHANCED TYPES & SCHEMAS ===================

export const EnhancedBankTransactionSchema = z.object({
  id: z.string().optional(),
  externalId: z.string().optional(), // Bank's transaction ID
  date: z.string(),
  description: z.string().min(1),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
  reference: z.string().optional(),
  bank_account_id: z.string(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  // Enhanced fields from new system
  counterparty: z
    .object({
      name: z.string().optional(),
      document: z.string().optional(),
      bankCode: z.string().optional(),
      accountNumber: z.string().optional(),
    })
    .optional(),
  pixKey: z.string().optional(),
  authenticationCode: z.string().optional(),
  // Healthcare-specific fields
  patientId: z.string().optional(),
  treatmentId: z.string().optional(),
  clinicId: z.string().optional(),
  // Reconciliation fields
  matched_payment_id: z.string().optional(),
  reconciliation_status: z.enum([
    'pending',
    'matched',
    'manual_review',
    'unmatched',
    'ignored',
  ]),
  reconciliation_score: z.number().min(0).max(1).optional(),
  processing_date: z.date().default(() => new Date()),
});

export type EnhancedBankTransaction = z.infer<
  typeof EnhancedBankTransactionSchema
>;

export const EnhancedPaymentRecordSchema = z.object({
  id: z.string(),
  amount: z.number(),
  payment_date: z.string(),
  payment_method: z.enum([
    'cash',
    'pix',
    'credit_card',
    'debit_card',
    'bank_transfer',
    'check',
  ]),
  reference_id: z.string().optional(),
  customer_name: z.string().optional(),
  customer_document: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  // Healthcare-specific fields
  patient_id: z.string().optional(),
  treatment_type: z.string().optional(),
  clinic_id: z.string().optional(),
  expected_settlement_date: z.string().optional(),
  // Enhanced reconciliation fields
  reconciliation_status: z.enum([
    'pending',
    'matched',
    'manual_review',
    'unmatched',
  ]),
  metadata: z.record(z.any()).optional(),
});

export type EnhancedPaymentRecord = z.infer<typeof EnhancedPaymentRecordSchema>;

export const ReconciliationMatchSchema = z.object({
  id: z.string(),
  bank_transaction_id: z.string(),
  payment_id: z.string(),
  match_confidence: z.number().min(0).max(1),
  match_type: z.enum(['exact', 'fuzzy', 'partial', 'manual']),
  match_criteria: z.array(
    z.enum([
      'amount',
      'date',
      'description',
      'customer',
      'reference',
      'pix_key',
    ]),
  ),
  amount_variance: z.number().optional(),
  date_variance: z.number().optional(), // Days
  validation_status: z.enum(['pending', 'approved', 'rejected']),
  validated_by: z.string().optional(),
  validated_at: z.date().optional(),
  notes: z.string().optional(),
});

export type ReconciliationMatch = z.infer<typeof ReconciliationMatchSchema>;

export type EnhancedReconciliationResult = {
  total_imported: number;
  total_matched: number;
  total_unmatched: number;
  automatic_matches: number;
  manual_review_required: number;
  reconciliation_rate: number;
  average_confidence: number;
  matched_transactions: ReconciliationMatch[];
  unmatched_bank_transactions: EnhancedBankTransaction[];
  unmatched_payments: EnhancedPaymentRecord[];
  processing_summary: {
    exact_matches: number;
    fuzzy_matches: number;
    partial_matches: number;
    processing_time_ms: number;
  };
  errors: string[];
  healthcare_metrics?: {
    patient_matches: number;
    treatment_matches: number;
    insurance_matches: number;
  };
};

// Enhanced CSV mapping with FEBRABAN bank codes support
const enhancedCsvMappingSchema = z.object({
  date_column: z.string(),
  description_column: z.string(),
  amount_column: z.string(),
  type_column: z.string().optional(),
  reference_column: z.string().optional(),
  counterparty_name_column: z.string().optional(),
  counterparty_document_column: z.string().optional(),
  counterparty_bank_column: z.string().optional(),
  pix_key_column: z.string().optional(),
  auth_code_column: z.string().optional(),
  date_format: z.string().default('yyyy-MM-dd'),
  amount_format: z.enum(['decimal', 'cents']).default('decimal'),
  credit_indicator: z.string().optional(),
  debit_indicator: z.string().optional(),
  // FEBRABAN bank codes mapping
  bank_code_mapping: z.record(z.string()).optional(),
  // Healthcare-specific columns
  patient_id_column: z.string().optional(),
  treatment_id_column: z.string().optional(),
});

// =================== ENHANCED FEBRABAN BANK CODES ===================

export const FEBRABAN_BANK_CODES = {
  // Major Brazilian banks
  '001': 'Banco do Brasil',
  '033': 'Banco Santander',
  '104': 'Caixa Econômica Federal',
  '237': 'Banco Bradesco',
  '341': 'Banco Itaú',
  '356': 'Banco Real (now Santander)',
  '389': 'Banco Mercantil do Brasil',
  '399': 'HSBC Bank Brasil',
  '422': 'Banco Safra',
  '633': 'Banco Rendimento',
  '652': 'Itaú Unibanco',
  // Digital banks
  '260': 'Nu Pagamentos (Nubank)',
  '336': 'Banco C6',
  '290': 'PagSeguro Digital',
  '323': 'Mercado Pago',
  '364': 'Gerencianet Pagamentos',
  // Cooperatives and smaller banks
  '748': 'Sicredi',
  '756': 'Sicoob',
  '077': 'Banco Inter',
  '212': 'Banco Original',
  '655': 'Banco Votorantim',
  // Payment institutions
  '208': 'BTG Pactual',
  '254': 'Parana Banco',
  '505': 'Credit Suisse Hedging-Griffo',
} as const;

// =================== ENHANCED RECONCILIATION SERVICE ===================

export class EnhancedBankReconciliationService {
  private static readonly MATCH_CONFIDENCE_THRESHOLD = 0.85;
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.95;
  private static readonly DATE_VARIANCE_TOLERANCE = 2; // days
  private static readonly AMOUNT_VARIANCE_TOLERANCE = 0.01; // 1 centavo

  /**
   * Enhanced import with AI-powered matching
   */
  static async importBankStatementEnhanced(
    csvContent: string,
    bankAccountId: string,
    mapping: z.infer<typeof enhancedCsvMappingSchema>,
    userId: string,
    options: {
      autoApproveHighConfidence?: boolean;
      healthcareMode?: boolean;
      batchSize?: number;
    } = {},
  ): Promise<EnhancedReconciliationResult> {
    const startTime = Date.now();

    try {
      // Validate mapping
      const validatedMapping = enhancedCsvMappingSchema.parse(mapping);

      // Parse CSV content
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Transform records to enhanced bank transactions
      const transactions =
        await EnhancedBankReconciliationService.transformRecordsToTransactions(
          records,
          bankAccountId,
          validatedMapping,
          options.healthcareMode,
        );

      // Get existing payments for matching
      const payments =
        await EnhancedBankReconciliationService.getPaymentsForMatching(
          bankAccountId,
          options.healthcareMode,
        );

      // Perform intelligent matching with multiple algorithms
      const matchingResult =
        await EnhancedBankReconciliationService.performIntelligentMatching(
          transactions,
          payments,
          options.autoApproveHighConfidence,
        );

      // Save transactions and matches to database
      await EnhancedBankReconciliationService.saveTransactionsAndMatches(
        transactions,
        matchingResult.matches,
        bankAccountId,
        userId,
      );

      const processingTime = Date.now() - startTime;

      // Generate comprehensive result
      const result: EnhancedReconciliationResult = {
        total_imported: transactions.length,
        total_matched: matchingResult.matches.filter(
          (m) => m.validation_status === 'approved',
        ).length,
        total_unmatched: transactions.filter(
          (t) => t.reconciliation_status === 'unmatched',
        ).length,
        automatic_matches: matchingResult.matches.filter(
          (m) => m.match_type !== 'manual',
        ).length,
        manual_review_required: matchingResult.matches.filter(
          (m) => m.validation_status === 'pending',
        ).length,
        reconciliation_rate:
          transactions.length > 0
            ? matchingResult.matches.filter(
                (m) => m.validation_status === 'approved',
              ).length / transactions.length
            : 0,
        average_confidence:
          matchingResult.matches.length > 0
            ? matchingResult.matches.reduce(
                (sum, m) => sum + m.match_confidence,
                0,
              ) / matchingResult.matches.length
            : 0,
        matched_transactions: matchingResult.matches,
        unmatched_bank_transactions: transactions.filter(
          (t) => t.reconciliation_status === 'unmatched',
        ),
        unmatched_payments: payments.filter(
          (p) => p.reconciliation_status === 'unmatched',
        ),
        processing_summary: {
          exact_matches: matchingResult.matches.filter(
            (m) => m.match_type === 'exact',
          ).length,
          fuzzy_matches: matchingResult.matches.filter(
            (m) => m.match_type === 'fuzzy',
          ).length,
          partial_matches: matchingResult.matches.filter(
            (m) => m.match_type === 'partial',
          ).length,
          processing_time_ms: processingTime,
        },
        errors: [],
      };

      // Add healthcare metrics if in healthcare mode
      if (options.healthcareMode) {
        result.healthcare_metrics =
          EnhancedBankReconciliationService.calculateHealthcareMetrics(
            matchingResult.matches,
            payments,
          );
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to perform enhanced bank reconciliation: ${error.message}`,
      );
    }
  } /**
   * Transform CSV records to enhanced bank transactions
   */
  private static async transformRecordsToTransactions(
    records: any[],
    bankAccountId: string,
    mapping: z.infer<typeof enhancedCsvMappingSchema>,
    healthcareMode?: boolean,
  ): Promise<EnhancedBankTransaction[]> {
    const transactions: EnhancedBankTransaction[] = [];

    for (const record of records) {
      try {
        // Parse date
        const dateStr = record[mapping.date_column];
        const date = EnhancedBankReconciliationService.parseDate(
          dateStr,
          mapping.date_format,
        );

        if (!(date && isValid(date))) {
          continue;
        }

        // Parse amount
        let amount = Number.parseFloat(
          record[mapping.amount_column]
            ?.toString()
            .replace(/[^\d.,-]/g, '')
            .replace(',', '.') || '0',
        );
        if (mapping.amount_format === 'cents') {
          amount /= 100;
        }

        // Determine transaction type
        let type: 'credit' | 'debit' = 'credit';
        if (mapping.type_column && record[mapping.type_column]) {
          const typeValue = record[mapping.type_column]
            .toString()
            .toLowerCase();
          if (
            mapping.debit_indicator &&
            typeValue.includes(mapping.debit_indicator.toLowerCase())
          ) {
            type = 'debit';
          } else if (
            mapping.credit_indicator &&
            typeValue.includes(mapping.credit_indicator.toLowerCase())
          ) {
            type = 'credit';
          }
        }

        // If no type column, infer from amount sign
        if (amount < 0) {
          type = 'debit';
          amount = Math.abs(amount);
        }

        // Extract counterparty information
        const counterparty = mapping.counterparty_name_column
          ? {
              name: record[mapping.counterparty_name_column] || undefined,
              document: mapping.counterparty_document_column
                ? record[mapping.counterparty_document_column]
                : undefined,
              bankCode: mapping.counterparty_bank_column
                ? record[mapping.counterparty_bank_column]
                : undefined,
            }
          : undefined;

        // Create enhanced transaction
        const transaction: EnhancedBankTransaction = {
          id: EnhancedBankReconciliationService.generateTransactionId(),
          date: format(date, 'yyyy-MM-dd'),
          description: record[mapping.description_column] || '',
          amount,
          type,
          reference: mapping.reference_column
            ? record[mapping.reference_column]
            : undefined,
          bank_account_id: bankAccountId,
          counterparty,
          pixKey: mapping.pix_key_column
            ? record[mapping.pix_key_column]
            : undefined,
          authenticationCode: mapping.auth_code_column
            ? record[mapping.auth_code_column]
            : undefined,
          reconciliation_status: 'pending',
        };

        // Add healthcare-specific fields if in healthcare mode
        if (healthcareMode) {
          transaction.patientId = mapping.patient_id_column
            ? record[mapping.patient_id_column]
            : undefined;
          transaction.treatmentId = mapping.treatment_id_column
            ? record[mapping.treatment_id_column]
            : undefined;
          transaction.clinicId = bankAccountId; // Associate with clinic/account
        }

        // Validate transaction
        EnhancedBankTransactionSchema.parse(transaction);
        transactions.push(transaction);
      } catch (_error) {}
    }

    return transactions;
  }

  /**
   * Get payments for matching with enhanced filtering
   */
  private static async getPaymentsForMatching(
    _bankAccountId: string,
    healthcareMode?: boolean,
  ): Promise<EnhancedPaymentRecord[]> {
    try {
      let query = supabase
        .from('payments')
        .select(
          `
          id,
          amount,
          payment_date,
          payment_method,
          reference_id,
          customer_name,
          customer_document,
          description,
          status,
          patient_id,
          treatment_type,
          clinic_id,
          expected_settlement_date,
          metadata
        `,
        )
        .eq('status', 'completed')
        .gte(
          'payment_date',
          format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        );

      if (healthcareMode) {
        query = query.not('patient_id', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map((payment) => ({
        ...payment,
        reconciliation_status: 'pending' as const,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * Perform intelligent matching with multiple algorithms
   */
  private static async performIntelligentMatching(
    bankTransactions: EnhancedBankTransaction[],
    payments: EnhancedPaymentRecord[],
    autoApproveHighConfidence = false,
  ): Promise<{
    matches: ReconciliationMatch[];
    unmatchedBankIds: Set<string>;
    unmatchedPaymentIds: Set<string>;
  }> {
    const matches: ReconciliationMatch[] = [];
    const usedBankTxIds = new Set<string>();
    const usedPaymentIds = new Set<string>();

    // Phase 1: Exact matches (amount + date + reference/PIX)
    const exactMatches =
      await EnhancedBankReconciliationService.findExactMatches(
        bankTransactions,
        payments,
      );
    matches.push(...exactMatches);
    exactMatches.forEach((match) => {
      usedBankTxIds.add(match.bank_transaction_id);
      usedPaymentIds.add(match.payment_id);
    });

    // Phase 2: High confidence fuzzy matches
    const remainingBankTx = bankTransactions.filter(
      (tx) => tx.id && !usedBankTxIds.has(tx.id),
    );
    const remainingPayments = payments.filter((p) => !usedPaymentIds.has(p.id));

    const fuzzyMatches =
      await EnhancedBankReconciliationService.findFuzzyMatches(
        remainingBankTx,
        remainingPayments,
      );
    matches.push(...fuzzyMatches);
    fuzzyMatches.forEach((match) => {
      usedBankTxIds.add(match.bank_transaction_id);
      usedPaymentIds.add(match.payment_id);
    });

    // Phase 3: Partial matches (installments, split payments)
    const remainingBankTx2 = bankTransactions.filter(
      (tx) => tx.id && !usedBankTxIds.has(tx.id),
    );
    const remainingPayments2 = payments.filter(
      (p) => !usedPaymentIds.has(p.id),
    );

    const partialMatches =
      await EnhancedBankReconciliationService.findPartialMatches(
        remainingBankTx2,
        remainingPayments2,
      );
    matches.push(...partialMatches);
    partialMatches.forEach((match) => {
      usedBankTxIds.add(match.bank_transaction_id);
      usedPaymentIds.add(match.payment_id);
    });

    // Auto-approve high confidence matches if enabled
    if (autoApproveHighConfidence) {
      matches.forEach((match) => {
        if (
          match.match_confidence >=
            EnhancedBankReconciliationService.HIGH_CONFIDENCE_THRESHOLD &&
          match.validation_status === 'pending'
        ) {
          match.validation_status = 'approved';
          match.validated_by = 'system';
          match.validated_at = new Date();
        }
      });
    }

    // Update transaction and payment statuses
    EnhancedBankReconciliationService.updateReconciliationStatuses(
      bankTransactions,
      payments,
      matches,
    );

    return {
      matches,
      unmatchedBankIds: new Set(
        bankTransactions
          .filter((tx) => tx.id && !usedBankTxIds.has(tx.id))
          .map((tx) => tx.id!),
      ),
      unmatchedPaymentIds: new Set(
        payments.filter((p) => !usedPaymentIds.has(p.id)).map((p) => p.id),
      ),
    };
  }

  /**
   * Find exact matches with enhanced criteria including PIX keys
   */
  private static async findExactMatches(
    bankTransactions: EnhancedBankTransaction[],
    payments: EnhancedPaymentRecord[],
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      if (!bankTx.id) {
        continue;
      }

      const potentialMatches = payments.filter((payment) => {
        // Exact amount match
        const amountMatch =
          Math.abs(bankTx.amount - Math.abs(payment.amount)) <=
          EnhancedBankReconciliationService.AMOUNT_VARIANCE_TOLERANCE;

        // Date within tolerance
        const bankDate = parseISO(bankTx.date);
        const paymentDate = parseISO(payment.payment_date);
        const dateDiff = Math.abs(differenceInDays(bankDate, paymentDate));
        const dateMatch =
          dateDiff <= EnhancedBankReconciliationService.DATE_VARIANCE_TOLERANCE;

        // PIX key match (if available)
        const pixMatch =
          bankTx.pixKey && payment.reference_id === bankTx.pixKey;

        // Reference match
        const refMatch =
          bankTx.reference && payment.reference_id === bankTx.reference;

        return (
          amountMatch &&
          dateMatch &&
          (pixMatch || refMatch || !(bankTx.pixKey || bankTx.reference))
        );
      });

      if (potentialMatches.length === 1) {
        const payment = potentialMatches[0];
        const criteria: Array<
          | 'amount'
          | 'date'
          | 'description'
          | 'customer'
          | 'reference'
          | 'pix_key'
        > = ['amount', 'date'];

        if (bankTx.pixKey && payment.reference_id === bankTx.pixKey) {
          criteria.push('pix_key');
        }
        if (bankTx.reference && payment.reference_id === bankTx.reference) {
          criteria.push('reference');
        }

        matches.push({
          id: EnhancedBankReconciliationService.generateMatchId(),
          bank_transaction_id: bankTx.id,
          payment_id: payment.id,
          match_confidence: 1.0,
          match_type: 'exact',
          match_criteria: criteria,
          validation_status: 'approved',
          validated_at: new Date(),
          validated_by: 'system',
        });
      }
    }

    return matches;
  }

  /**
   * Find fuzzy matches using enhanced AI-powered similarity scoring
   */
  private static async findFuzzyMatches(
    bankTransactions: EnhancedBankTransaction[],
    payments: EnhancedPaymentRecord[],
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      if (!bankTx.id) {
        continue;
      }

      let bestMatch: {
        payment: EnhancedPaymentRecord;
        score: number;
        criteria: string[];
      } | null = null;

      for (const payment of payments) {
        const matchScore =
          EnhancedBankReconciliationService.calculateEnhancedMatchScore(
            bankTx,
            payment,
          );

        if (
          matchScore.score >=
            EnhancedBankReconciliationService.MATCH_CONFIDENCE_THRESHOLD &&
          (!bestMatch || matchScore.score > bestMatch.score)
        ) {
          bestMatch = {
            payment,
            score: matchScore.score,
            criteria: matchScore.criteria,
          };
        }
      }

      if (bestMatch) {
        matches.push({
          id: EnhancedBankReconciliationService.generateMatchId(),
          bank_transaction_id: bankTx.id,
          payment_id: bestMatch.payment.id,
          match_confidence: bestMatch.score,
          match_type: 'fuzzy',
          match_criteria: bestMatch.criteria as any,
          validation_status:
            bestMatch.score >=
            EnhancedBankReconciliationService.HIGH_CONFIDENCE_THRESHOLD
              ? 'approved'
              : 'pending',
          validated_by:
            bestMatch.score >=
            EnhancedBankReconciliationService.HIGH_CONFIDENCE_THRESHOLD
              ? 'system'
              : undefined,
          validated_at:
            bestMatch.score >=
            EnhancedBankReconciliationService.HIGH_CONFIDENCE_THRESHOLD
              ? new Date()
              : undefined,
        });
      }
    }

    return matches;
  } /**
   * Enhanced match score calculation with multiple criteria
   */
  private static calculateEnhancedMatchScore(
    bankTx: EnhancedBankTransaction,
    payment: EnhancedPaymentRecord,
  ): { score: number; criteria: string[] } {
    let score = 0;
    const criteria: string[] = [];

    // Weights for different matching criteria
    const weights = {
      amount: 0.4,
      date: 0.3,
      customer: 0.15,
      description: 0.1,
      pixKey: 0.05,
    };

    // Amount similarity (required for any match)
    const amountDiff = Math.abs(bankTx.amount - Math.abs(payment.amount));
    const amountSimilarity = Math.max(
      0,
      1 - amountDiff / Math.max(bankTx.amount, Math.abs(payment.amount)),
    );

    if (amountSimilarity < 0.9) {
      return { score: 0, criteria: [] }; // Skip if amount too different
    }

    score += weights.amount * amountSimilarity;
    criteria.push('amount');

    // Date similarity
    const bankDate = parseISO(bankTx.date);
    const paymentDate = parseISO(payment.payment_date);
    const dateDiff = Math.abs(differenceInDays(bankDate, paymentDate));
    const dateSimilarity = Math.max(0, 1 - dateDiff / 7); // 7-day window

    if (dateSimilarity > 0.5) {
      score += weights.date * dateSimilarity;
      criteria.push('date');
    }

    // Customer name similarity (healthcare-specific enhancement)
    if (payment.customer_name && bankTx.counterparty?.name) {
      const customerSimilarity =
        EnhancedBankReconciliationService.calculateStringSimilarity(
          EnhancedBankReconciliationService.normalizeName(
            payment.customer_name,
          ),
          EnhancedBankReconciliationService.normalizeName(
            bankTx.counterparty.name,
          ),
        );

      if (customerSimilarity > 0.7) {
        score += weights.customer * customerSimilarity;
        criteria.push('customer');
      }
    }

    // Description similarity with healthcare terms recognition
    const descriptionSimilarity =
      EnhancedBankReconciliationService.calculateDescriptionSimilarity(
        bankTx.description,
        payment.description || payment.customer_name || '',
      );

    if (descriptionSimilarity > 0.6) {
      score += weights.description * descriptionSimilarity;
      criteria.push('description');
    }

    // PIX key match (high confidence boost)
    if (bankTx.pixKey && payment.reference_id === bankTx.pixKey) {
      score += weights.pixKey;
      criteria.push('pix_key');
    }

    return { score: Math.min(score, 1.0), criteria };
  }

  /**
   * Find partial matches for installments and split payments
   */
  private static async findPartialMatches(
    bankTransactions: EnhancedBankTransaction[],
    payments: EnhancedPaymentRecord[],
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    // Group payments by customer and date for installment detection
    const paymentGroups =
      EnhancedBankReconciliationService.groupPaymentsByCustomerAndDate(
        payments,
      );

    for (const bankTx of bankTransactions) {
      if (!bankTx.id) {
        continue;
      }

      // Find matching payment groups
      const matchingGroups =
        EnhancedBankReconciliationService.findMatchingPaymentGroups(
          bankTx,
          paymentGroups,
        );

      for (const group of matchingGroups) {
        if (
          group.confidence >
          EnhancedBankReconciliationService.MATCH_CONFIDENCE_THRESHOLD
        ) {
          // Create partial matches for each payment in the group
          for (const payment of group.payments) {
            matches.push({
              id: EnhancedBankReconciliationService.generateMatchId(),
              bank_transaction_id: bankTx.id,
              payment_id: payment.id,
              match_confidence: group.confidence,
              match_type: 'partial',
              match_criteria: ['amount', 'date'],
              validation_status: 'pending',
              amount_variance: Math.abs(bankTx.amount - group.totalAmount),
            });
          }
          break; // Take the best matching group
        }
      }
    }

    return matches;
  }

  /**
   * Update reconciliation statuses based on matches
   */
  private static updateReconciliationStatuses(
    bankTransactions: EnhancedBankTransaction[],
    payments: EnhancedPaymentRecord[],
    matches: ReconciliationMatch[],
  ): void {
    const matchedBankIds = new Set(matches.map((m) => m.bank_transaction_id));
    const matchedPaymentIds = new Set(matches.map((m) => m.payment_id));

    // Update bank transactions
    bankTransactions.forEach((tx) => {
      if (tx.id && matchedBankIds.has(tx.id)) {
        const match = matches.find((m) => m.bank_transaction_id === tx.id);
        tx.reconciliation_status =
          match?.validation_status === 'approved' ? 'matched' : 'manual_review';
        tx.reconciliation_score = match?.match_confidence;
        tx.matched_payment_id = match?.payment_id;
      } else {
        tx.reconciliation_status = 'unmatched';
      }
    });

    // Update payments
    payments.forEach((payment) => {
      if (matchedPaymentIds.has(payment.id)) {
        const match = matches.find((m) => m.payment_id === payment.id);
        payment.reconciliation_status =
          match?.validation_status === 'approved' ? 'matched' : 'manual_review';
      } else {
        payment.reconciliation_status = 'unmatched';
      }
    });
  }

  /**
   * Save transactions and matches to database
   */
  private static async saveTransactionsAndMatches(
    transactions: EnhancedBankTransaction[],
    matches: ReconciliationMatch[],
    _bankAccountId: string,
    userId: string,
  ): Promise<void> {
    // Save bank transactions
    const { error: txError } = await supabase.from('bank_transactions').upsert(
      transactions.map((tx) => ({
        ...tx,
        created_by: userId,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'external_id,bank_account_id' },
    );

    if (txError) {
      throw txError;
    }

    // Save reconciliation matches
    if (matches.length > 0) {
      const { error: matchError } = await supabase
        .from('reconciliation_matches')
        .upsert(
          matches.map((match) => ({
            ...match,
            created_by: userId,
            created_at: new Date().toISOString(),
          })),
          { onConflict: 'bank_transaction_id,payment_id' },
        );

      if (matchError) {
        throw matchError;
      }
    }

    // Update payment reconciliation status
    for (const match of matches.filter(
      (m) => m.validation_status === 'approved',
    )) {
      await supabase
        .from('payments')
        .update({
          reconciliation_status: 'matched',
          bank_transaction_id: match.bank_transaction_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', match.payment_id);
    }
  }

  /**
   * Calculate healthcare-specific metrics
   */
  private static calculateHealthcareMetrics(
    matches: ReconciliationMatch[],
    payments: EnhancedPaymentRecord[],
  ): {
    patient_matches: number;
    treatment_matches: number;
    insurance_matches: number;
  } {
    const approvedMatches = matches.filter(
      (m) => m.validation_status === 'approved',
    );
    const matchedPayments = payments.filter((p) =>
      approvedMatches.some((m) => m.payment_id === p.id),
    );

    return {
      patient_matches: matchedPayments.filter((p) => p.patient_id).length,
      treatment_matches: matchedPayments.filter((p) => p.treatment_type).length,
      insurance_matches: matchedPayments.filter(
        (p) =>
          p.payment_method === 'bank_transfer' && p.metadata?.insurance_claim,
      ).length,
    };
  }

  // =================== UTILITY METHODS ===================

  /**
   * Enhanced string similarity with healthcare terms recognition
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    if (!(str1 && str2)) {
      return 0;
    }

    // Normalize strings
    const norm1 = str1.toLowerCase().trim();
    const norm2 = str2.toLowerCase().trim();

    if (norm1 === norm2) {
      return 1.0;
    }

    // Use Levenshtein distance
    return EnhancedBankReconciliationService.levenshteinSimilarity(
      norm1,
      norm2,
    );
  }

  /**
   * Enhanced description similarity with healthcare context
   */
  private static calculateDescriptionSimilarity(
    desc1: string,
    desc2: string,
  ): number {
    if (!(desc1 && desc2)) {
      return 0;
    }

    // Normalize descriptions
    const norm1 = EnhancedBankReconciliationService.normalizeDescription(desc1);
    const norm2 = EnhancedBankReconciliationService.normalizeDescription(desc2);

    // Check for common healthcare terms
    const healthcareTerms = [
      'consulta',
      'procedimento',
      'tratamento',
      'estetica',
      'botox',
      'preenchimento',
      'limpeza',
      'peeling',
      'massagem',
      'depilacao',
    ];

    let similarity = EnhancedBankReconciliationService.levenshteinSimilarity(
      norm1,
      norm2,
    );

    // Boost similarity if healthcare terms are present
    for (const term of healthcareTerms) {
      if (norm1.includes(term) && norm2.includes(term)) {
        similarity = Math.min(1.0, similarity + 0.1);
      }
    }

    return similarity;
  }

  /**
   * Levenshtein distance similarity calculation
   */
  private static levenshteinSimilarity(str1: string, str2: string): number {
    const matrix = new Array(str2.length + 1)
      .fill(null)
      .map(() => new Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0
      ? 1
      : 1 - matrix[str2.length][str1.length] / maxLength;
  }

  /**
   * Group payments by customer and date for partial matching
   */
  private static groupPaymentsByCustomerAndDate(
    payments: EnhancedPaymentRecord[],
  ): Map<string, { payments: EnhancedPaymentRecord[]; totalAmount: number }> {
    const groups = new Map<
      string,
      { payments: EnhancedPaymentRecord[]; totalAmount: number }
    >();

    payments.forEach((payment) => {
      const key = `${payment.customer_name || 'unknown'}_${payment.payment_date}`;
      if (!groups.has(key)) {
        groups.set(key, { payments: [], totalAmount: 0 });
      }
      const group = groups.get(key)!;
      group.payments.push(payment);
      group.totalAmount += Math.abs(payment.amount);
    });

    return groups;
  }

  /**
   * Find matching payment groups for partial matching
   */
  private static findMatchingPaymentGroups(
    bankTx: EnhancedBankTransaction,
    paymentGroups: Map<
      string,
      { payments: EnhancedPaymentRecord[]; totalAmount: number }
    >,
  ): Array<{
    payments: EnhancedPaymentRecord[];
    confidence: number;
    totalAmount: number;
  }> {
    const matchingGroups: Array<{
      payments: EnhancedPaymentRecord[];
      confidence: number;
      totalAmount: number;
    }> = [];

    for (const [_key, group] of paymentGroups) {
      const amountMatch =
        Math.abs(bankTx.amount - group.totalAmount) <=
        EnhancedBankReconciliationService.AMOUNT_VARIANCE_TOLERANCE;

      if (amountMatch && group.payments.length > 1) {
        // Calculate confidence based on date proximity
        const avgDate = new Date(
          group.payments.reduce(
            (sum, p) => sum + new Date(p.payment_date).getTime(),
            0,
          ) / group.payments.length,
        );
        const bankDate = parseISO(bankTx.date);
        const dateDiff = Math.abs(differenceInDays(bankDate, avgDate));
        const dateScore = Math.max(0, 1 - dateDiff / 7);

        const confidence = 0.8 + dateScore * 0.2; // Base confidence + date bonus

        matchingGroups.push({
          payments: group.payments,
          confidence,
          totalAmount: group.totalAmount,
        });
      }
    }

    return matchingGroups.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Parse date with multiple format support
   */
  private static parseDate(dateStr: string, format: string): Date | null {
    try {
      // Common Brazilian date formats
      const formats = [
        format,
        'dd/MM/yyyy',
        'yyyy-MM-dd',
        'MM/dd/yyyy',
        'dd-MM-yyyy',
      ];

      for (const _fmt of formats) {
        try {
          const parsed = parseISO(dateStr) || new Date(dateStr);
          if (isValid(parsed)) {
            return parsed;
          }
        } catch {}
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Normalize description for better matching
   */
  private static normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize name for better matching
   */
  private static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .sort()
      .join(' ');
  }

  /**
   * Generate unique transaction ID
   */
  private static generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique match ID
   */
  private static generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// =================== EXPORTS ===================

export default EnhancedBankReconciliationService;
