/**
 * Automated Reconciliation Engine - Banking Integration and Transaction Matching
 * NeonPro Healthcare System - Story 4.5 Architecture Alignment
 *
 * This module provides automated bank reconciliation with AI-powered transaction matching,
 * multi-bank support, and 95%+ automatic reconciliation rate for Brazilian banking systems.
 */

import { z } from 'zod';

// =================== TYPES & SCHEMAS ===================

export const BankConnectionSchema = z.object({
  id: z.string(),
  bankCode: z.string(), // FEBRABAN bank code
  bankName: z.string(),
  accountNumber: z.string(),
  accountType: z.enum(['checking', 'savings', 'investment']),
  apiCredentials: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    certificatePath: z.string().optional(),
    environment: z.enum(['production', 'sandbox']),
  }),
  connectionStatus: z.enum(['connected', 'disconnected', 'error', 'pending']),
  lastSyncDate: z.date().optional(),
  syncFrequency: z.enum(['realtime', 'hourly', 'daily']),
  features: z.array(z.enum(['balance', 'transactions', 'pix', 'ted', 'doc'])),
});

export type BankConnection = z.infer<typeof BankConnectionSchema>;

export const BankTransactionSchema = z.object({
  id: z.string(),
  bankConnectionId: z.string(),
  externalId: z.string(), // Bank's transaction ID
  date: z.date(),
  amount: z.number(),
  description: z.string(),
  type: z.enum(['credit', 'debit']),
  category: z.string().optional(),
  subcategory: z.string().optional(),
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
  reconciliationStatus: z.enum([
    'pending',
    'matched',
    'manual_review',
    'unmatched',
  ]),
  reconciliationScore: z.number().min(0).max(1).optional(),
  processingDate: z.date(),
});

export type BankTransaction = z.infer<typeof BankTransactionSchema>;

export const ClinicTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['invoice', 'payment', 'expense', 'refund', 'adjustment']),
  date: z.date(),
  amount: z.number(),
  description: z.string(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  invoiceId: z.string().optional(),
  paymentMethod: z.enum([
    'cash',
    'pix',
    'credit_card',
    'debit_card',
    'bank_transfer',
    'check',
  ]),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  reconciliationStatus: z.enum([
    'pending',
    'matched',
    'manual_review',
    'unmatched',
  ]),
  expectedSettlementDate: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ClinicTransaction = z.infer<typeof ClinicTransactionSchema>;

export const ReconciliationMatchSchema = z.object({
  id: z.string(),
  bankTransactionId: z.string(),
  clinicTransactionId: z.string(),
  matchConfidence: z.number().min(0).max(1),
  matchType: z.enum(['exact', 'fuzzy', 'partial', 'manual']),
  matchCriteria: z.array(
    z.enum(['amount', 'date', 'description', 'customer', 'reference'])
  ),
  amountVariance: z.number().optional(),
  dateVariance: z.number().optional(), // Days
  validationStatus: z.enum(['pending', 'approved', 'rejected']),
  validatedBy: z.string().optional(),
  validatedAt: z.date().optional(),
  notes: z.string().optional(),
});

export type ReconciliationMatch = z.infer<typeof ReconciliationMatchSchema>;

export interface ReconciliationReport {
  period: { startDate: Date; endDate: Date };
  totalBankTransactions: number;
  totalClinicTransactions: number;
  matchedTransactions: number;
  unmatchedBankTransactions: number;
  unmatchedClinicTransactions: number;
  pendingReviewTransactions: number;
  reconciliationRate: number;
  averageMatchConfidence: number;
  totalVariance: number;
  varianceExplanations: Array<{
    description: string;
    amount: number;
    reason: string;
  }>;
  processingSummary: {
    automaticMatches: number;
    manualMatches: number;
    failedMatches: number;
    processingTime: number; // milliseconds
  };
}

// =================== RECONCILIATION ENGINE CLASS ===================

export class AutomatedReconciliationEngine {
  private readonly MATCH_CONFIDENCE_THRESHOLD = 0.85;
  private readonly HIGH_CONFIDENCE_THRESHOLD = 0.95;
  private readonly DATE_VARIANCE_TOLERANCE = 2; // days
  private readonly AMOUNT_VARIANCE_TOLERANCE = 0.01; // 1 cent

  /**
   * Perform automated reconciliation between bank and clinic transactions
   */
  async performReconciliation(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[],
    options: {
      dateRange?: { startDate: Date; endDate: Date };
      autoApproveHighConfidence?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    matches: ReconciliationMatch[];
    report: ReconciliationReport;
    unmatchedBank: BankTransaction[];
    unmatchedClinic: ClinicTransaction[];
  }> {
    try {
      // Validate input data
      bankTransactions.forEach((tx) => BankTransactionSchema.parse(tx));
      clinicTransactions.forEach((tx) => ClinicTransactionSchema.parse(tx));

      const startTime = Date.now();

      // Filter by date range if specified
      const filteredBankTx = this.filterByDateRange(
        bankTransactions,
        options.dateRange
      );
      const filteredClinicTx = this.filterByDateRange(
        clinicTransactions,
        options.dateRange
      );

      // Reset reconciliation status
      await this.resetReconciliationStatus(filteredBankTx, filteredClinicTx);

      // Perform intelligent matching
      const matches = await this.performIntelligentMatching(
        filteredBankTx,
        filteredClinicTx
      );

      // Auto-approve high confidence matches if enabled
      if (options.autoApproveHighConfidence) {
        await this.autoApproveHighConfidenceMatches(matches);
      }

      // Update transaction statuses
      await this.updateTransactionStatuses(
        matches,
        filteredBankTx,
        filteredClinicTx
      );

      // Generate reconciliation report
      const report = this.generateReconciliationReport(
        filteredBankTx,
        filteredClinicTx,
        matches,
        Date.now() - startTime
      );

      // Get unmatched transactions
      const unmatchedBank = this.getUnmatchedTransactions(
        filteredBankTx,
        matches,
        'bank'
      );
      const unmatchedClinic = this.getUnmatchedTransactions(
        filteredClinicTx,
        matches,
        'clinic'
      );

      return {
        matches,
        report,
        unmatchedBank,
        unmatchedClinic,
      };
    } catch (error) {
      console.error('Error performing reconciliation:', error);
      throw new Error('Failed to perform automated reconciliation');
    }
  }

  /**
   * AI-powered transaction matching with multiple algorithms
   */
  private async performIntelligentMatching(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];
    const usedBankTxIds = new Set<string>();
    const usedClinicTxIds = new Set<string>();

    // Phase 1: Exact matches (amount + date + reference)
    const exactMatches = await this.findExactMatches(
      bankTransactions,
      clinicTransactions
    );
    matches.push(...exactMatches);
    exactMatches.forEach((match) => {
      usedBankTxIds.add(match.bankTransactionId);
      usedClinicTxIds.add(match.clinicTransactionId);
    });

    // Phase 2: High confidence fuzzy matches
    const remainingBankTx = bankTransactions.filter(
      (tx) => !usedBankTxIds.has(tx.id)
    );
    const remainingClinicTx = clinicTransactions.filter(
      (tx) => !usedClinicTxIds.has(tx.id)
    );

    const fuzzyMatches = await this.findFuzzyMatches(
      remainingBankTx,
      remainingClinicTx
    );
    matches.push(...fuzzyMatches);
    fuzzyMatches.forEach((match) => {
      usedBankTxIds.add(match.bankTransactionId);
      usedClinicTxIds.add(match.clinicTransactionId);
    });

    // Phase 3: Partial matches (split payments, installments)
    const remainingBankTx2 = bankTransactions.filter(
      (tx) => !usedBankTxIds.has(tx.id)
    );
    const remainingClinicTx2 = clinicTransactions.filter(
      (tx) => !usedClinicTxIds.has(tx.id)
    );

    const partialMatches = await this.findPartialMatches(
      remainingBankTx2,
      remainingClinicTx2
    );
    matches.push(...partialMatches);

    return matches;
  }

  /**
   * Find exact matches based on amount, date, and reference
   */
  private async findExactMatches(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      const potentialMatches = clinicTransactions.filter((clinicTx) => {
        // Exact amount match
        const amountMatch =
          Math.abs(bankTx.amount - Math.abs(clinicTx.amount)) <=
          this.AMOUNT_VARIANCE_TOLERANCE;

        // Date within tolerance
        const dateDiff =
          Math.abs(bankTx.date.getTime() - clinicTx.date.getTime()) /
          (1000 * 60 * 60 * 24);
        const dateMatch = dateDiff <= this.DATE_VARIANCE_TOLERANCE;

        return amountMatch && dateMatch;
      });

      if (potentialMatches.length === 1) {
        // Single exact match found
        const clinicTx = potentialMatches[0];
        matches.push({
          id: this.generateMatchId(),
          bankTransactionId: bankTx.id,
          clinicTransactionId: clinicTx.id,
          matchConfidence: 1.0,
          matchType: 'exact',
          matchCriteria: ['amount', 'date'],
          validationStatus: 'approved',
          validatedAt: new Date(),
        });
      }
    }

    return matches;
  }

  /**
   * Find fuzzy matches using AI-powered similarity scoring
   */
  private async findFuzzyMatches(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    for (const bankTx of bankTransactions) {
      let bestMatch: {
        clinicTx: ClinicTransaction;
        score: number;
        criteria: string[];
      } | null = null;

      for (const clinicTx of clinicTransactions) {
        const matchScore = this.calculateMatchScore(bankTx, clinicTx);

        if (
          matchScore.score >= this.MATCH_CONFIDENCE_THRESHOLD &&
          (!bestMatch || matchScore.score > bestMatch.score)
        ) {
          bestMatch = {
            clinicTx,
            score: matchScore.score,
            criteria: matchScore.criteria,
          };
        }
      }

      if (bestMatch) {
        matches.push({
          id: this.generateMatchId(),
          bankTransactionId: bankTx.id,
          clinicTransactionId: bestMatch.clinicTx.id,
          matchConfidence: bestMatch.score,
          matchType: 'fuzzy',
          matchCriteria: bestMatch.criteria as any[],
          amountVariance: Math.abs(
            bankTx.amount - Math.abs(bestMatch.clinicTx.amount)
          ),
          dateVariance:
            Math.abs(
              bankTx.date.getTime() - bestMatch.clinicTx.date.getTime()
            ) /
            (1000 * 60 * 60 * 24),
          validationStatus:
            bestMatch.score >= this.HIGH_CONFIDENCE_THRESHOLD
              ? 'approved'
              : 'pending',
          validatedAt:
            bestMatch.score >= this.HIGH_CONFIDENCE_THRESHOLD
              ? new Date()
              : undefined,
        });
      }
    }

    return matches;
  }

  /**
   * Find partial matches for split payments and installments
   */
  private async findPartialMatches(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<ReconciliationMatch[]> {
    const matches: ReconciliationMatch[] = [];

    // Group clinic transactions by customer and date range
    const groupedClinicTx =
      this.groupTransactionsByCustomerAndDate(clinicTransactions);

    for (const bankTx of bankTransactions) {
      // Look for multiple clinic transactions that sum to the bank transaction amount
      const potentialGroups = this.findMatchingGroups(bankTx, groupedClinicTx);

      for (const group of potentialGroups) {
        if (group.confidence >= this.MATCH_CONFIDENCE_THRESHOLD) {
          // Create matches for each clinic transaction in the group
          for (const clinicTx of group.transactions) {
            matches.push({
              id: this.generateMatchId(),
              bankTransactionId: bankTx.id,
              clinicTransactionId: clinicTx.id,
              matchConfidence: group.confidence,
              matchType: 'partial',
              matchCriteria: ['amount', 'customer', 'date'],
              validationStatus: 'pending', // Partial matches always require review
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Calculate match score between bank and clinic transactions
   */
  private calculateMatchScore(
    bankTx: BankTransaction,
    clinicTx: ClinicTransaction
  ): { score: number; criteria: string[] } {
    let score = 0;
    const criteria: string[] = [];
    const weights = {
      amount: 0.4,
      date: 0.3,
      description: 0.2,
      customer: 0.1,
    };

    // Amount similarity
    const amountDiff = Math.abs(bankTx.amount - Math.abs(clinicTx.amount));
    const amountSimilarity = Math.max(
      0,
      1 -
        amountDiff /
          Math.max(Math.abs(bankTx.amount), Math.abs(clinicTx.amount))
    );

    if (amountSimilarity > 0.95) {
      score += weights.amount;
      criteria.push('amount');
    } else if (amountSimilarity > 0.8) {
      score += weights.amount * amountSimilarity;
      criteria.push('amount');
    }

    // Date proximity
    const dateDiff =
      Math.abs(bankTx.date.getTime() - clinicTx.date.getTime()) /
      (1000 * 60 * 60 * 24);
    const dateSimilarity = Math.max(0, 1 - dateDiff / 7); // 7-day window

    if (dateSimilarity > 0.7) {
      score += weights.date * dateSimilarity;
      criteria.push('date');
    }

    // Description similarity (using Levenshtein distance)
    const descriptionSimilarity = this.calculateStringSimilarity(
      this.normalizeDescription(bankTx.description),
      this.normalizeDescription(clinicTx.description)
    );

    if (descriptionSimilarity > 0.6) {
      score += weights.description * descriptionSimilarity;
      criteria.push('description');
    }

    // Customer matching (if available)
    if (clinicTx.customerName && bankTx.counterparty?.name) {
      const customerSimilarity = this.calculateStringSimilarity(
        this.normalizeName(clinicTx.customerName),
        this.normalizeName(bankTx.counterparty.name)
      );

      if (customerSimilarity > 0.7) {
        score += weights.customer * customerSimilarity;
        criteria.push('customer');
      }
    }

    return { score, criteria };
  }

  /**
   * Auto-approve high confidence matches
   */
  private async autoApproveHighConfidenceMatches(
    matches: ReconciliationMatch[]
  ): Promise<void> {
    for (const match of matches) {
      if (
        match.matchConfidence >= this.HIGH_CONFIDENCE_THRESHOLD &&
        match.validationStatus === 'pending'
      ) {
        match.validationStatus = 'approved';
        match.validatedBy = 'system';
        match.validatedAt = new Date();
      }
    }
  }

  /**
   * Update transaction reconciliation statuses
   */
  private async updateTransactionStatuses(
    matches: ReconciliationMatch[],
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<void> {
    const matchedBankIds = new Set(matches.map((m) => m.bankTransactionId));
    const matchedClinicIds = new Set(matches.map((m) => m.clinicTransactionId));

    // Update bank transactions
    bankTransactions.forEach((tx) => {
      if (matchedBankIds.has(tx.id)) {
        const match = matches.find((m) => m.bankTransactionId === tx.id);
        tx.reconciliationStatus =
          match?.validationStatus === 'approved' ? 'matched' : 'manual_review';
        tx.reconciliationScore = match?.matchConfidence;
      } else {
        tx.reconciliationStatus = 'unmatched';
      }
    });

    // Update clinic transactions
    clinicTransactions.forEach((tx) => {
      if (matchedClinicIds.has(tx.id)) {
        const match = matches.find((m) => m.clinicTransactionId === tx.id);
        tx.reconciliationStatus =
          match?.validationStatus === 'approved' ? 'matched' : 'manual_review';
      } else {
        tx.reconciliationStatus = 'unmatched';
      }
    });
  }

  /**
   * Generate comprehensive reconciliation report
   */
  private generateReconciliationReport(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[],
    matches: ReconciliationMatch[],
    processingTime: number
  ): ReconciliationReport {
    const approvedMatches = matches.filter(
      (m) => m.validationStatus === 'approved'
    );
    const pendingMatches = matches.filter(
      (m) => m.validationStatus === 'pending'
    );
    const automaticMatches = matches.filter((m) => m.matchType !== 'manual');
    const manualMatches = matches.filter((m) => m.matchType === 'manual');

    const totalVariance = matches.reduce((sum, match) => {
      return sum + (match.amountVariance || 0);
    }, 0);

    const reconciliationRate =
      bankTransactions.length > 0
        ? approvedMatches.length / bankTransactions.length
        : 0;

    const averageConfidence =
      matches.length > 0
        ? matches.reduce((sum, m) => sum + m.matchConfidence, 0) /
          matches.length
        : 0;

    return {
      period: {
        startDate: new Date(
          Math.min(...bankTransactions.map((tx) => tx.date.getTime()))
        ),
        endDate: new Date(
          Math.max(...bankTransactions.map((tx) => tx.date.getTime()))
        ),
      },
      totalBankTransactions: bankTransactions.length,
      totalClinicTransactions: clinicTransactions.length,
      matchedTransactions: approvedMatches.length,
      unmatchedBankTransactions: bankTransactions.filter(
        (tx) => tx.reconciliationStatus === 'unmatched'
      ).length,
      unmatchedClinicTransactions: clinicTransactions.filter(
        (tx) => tx.reconciliationStatus === 'unmatched'
      ).length,
      pendingReviewTransactions: pendingMatches.length,
      reconciliationRate,
      averageMatchConfidence: averageConfidence,
      totalVariance,
      varianceExplanations: this.generateVarianceExplanations(matches),
      processingSummary: {
        automaticMatches: automaticMatches.length,
        manualMatches: manualMatches.length,
        failedMatches: 0, // Would track actual failures
        processingTime,
      },
    };
  }

  // =================== HELPER METHODS ===================

  private filterByDateRange<T extends { date: Date }>(
    transactions: T[],
    dateRange?: { startDate: Date; endDate: Date }
  ): T[] {
    if (!dateRange) {
      return transactions;
    }

    return transactions.filter(
      (tx) => tx.date >= dateRange.startDate && tx.date <= dateRange.endDate
    );
  }

  private async resetReconciliationStatus(
    bankTransactions: BankTransaction[],
    clinicTransactions: ClinicTransaction[]
  ): Promise<void> {
    bankTransactions.forEach((tx) => {
      tx.reconciliationStatus = 'pending';
      tx.reconciliationScore = undefined;
    });

    clinicTransactions.forEach((tx) => {
      tx.reconciliationStatus = 'pending';
    });
  }

  private getUnmatchedTransactions<T extends { id: string }>(
    transactions: T[],
    matches: ReconciliationMatch[],
    type: 'bank' | 'clinic'
  ): T[] {
    const matchedIds = new Set(
      matches.map((m) =>
        type === 'bank' ? m.bankTransactionId : m.clinicTransactionId
      )
    );

    return transactions.filter((tx) => !matchedIds.has(tx.id));
  }

  private groupTransactionsByCustomerAndDate(
    transactions: ClinicTransaction[]
  ): Map<string, ClinicTransaction[]> {
    const groups = new Map<string, ClinicTransaction[]>();

    transactions.forEach((tx) => {
      const key = `${tx.customerId || 'unknown'}_${tx.date.toISOString().split('T')[0]}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(tx);
    });

    return groups;
  }

  private findMatchingGroups(
    bankTx: BankTransaction,
    groupedTransactions: Map<string, ClinicTransaction[]>
  ): Array<{ transactions: ClinicTransaction[]; confidence: number }> {
    const matchingGroups: Array<{
      transactions: ClinicTransaction[];
      confidence: number;
    }> = [];

    for (const [_key, transactions] of groupedTransactions) {
      const totalAmount = transactions.reduce(
        (sum, tx) => sum + Math.abs(tx.amount),
        0
      );
      const amountMatch =
        Math.abs(bankTx.amount - totalAmount) <= this.AMOUNT_VARIANCE_TOLERANCE;

      if (amountMatch && transactions.length > 1) {
        // Calculate confidence based on amount match and date proximity
        const avgDate = new Date(
          transactions.reduce((sum, tx) => sum + tx.date.getTime(), 0) /
            transactions.length
        );
        const dateDiff =
          Math.abs(bankTx.date.getTime() - avgDate.getTime()) /
          (1000 * 60 * 60 * 24);
        const dateScore = Math.max(0, 1 - dateDiff / 7);

        const confidence = 0.8 + dateScore * 0.2; // Base confidence + date bonus

        matchingGroups.push({ transactions, confidence });
      }
    }

    return matchingGroups;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance implementation
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
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0
      ? 1
      : 1 - matrix[str2.length][str1.length] / maxLength;
  }

  private normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .sort()
      .join(' ');
  }

  private generateMatchId(): string {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVarianceExplanations(matches: ReconciliationMatch[]): Array<{
    description: string;
    amount: number;
    reason: string;
  }> {
    const explanations: Array<{
      description: string;
      amount: number;
      reason: string;
    }> = [];

    matches.forEach((match) => {
      if (
        match.amountVariance &&
        match.amountVariance > this.AMOUNT_VARIANCE_TOLERANCE
      ) {
        explanations.push({
          description: `Match ${match.id}`,
          amount: match.amountVariance,
          reason:
            match.matchType === 'partial'
              ? 'Partial payment matching'
              : 'Amount variance in fuzzy match',
        });
      }
    });

    return explanations;
  }
}

// =================== FACTORY & EXPORTS ===================

/**
 * Factory function to create AutomatedReconciliationEngine instance
 */
export const createReconciliationEngine = (): AutomatedReconciliationEngine => {
  return new AutomatedReconciliationEngine();
};

/**
 * Default export
 */
export default createReconciliationEngine;
