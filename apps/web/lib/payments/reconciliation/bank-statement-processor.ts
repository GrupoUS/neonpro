// NeonPro - Bank Statement Processor
// Story 6.1 - Task 4: Bank Reconciliation System
// Automated bank statement import and processing service

import Papa from 'papaparse';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

// Validation schemas
const BankStatementFileSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  statementDate: z.string().datetime(),
  openingBalance: z.number(),
  closingBalance: z.number(),
  statementPeriodStart: z.string().datetime(),
  statementPeriodEnd: z.string().datetime(),
  filePath: z.string().optional(),
});

const BankTransactionFileSchema = z.object({
  date: z.string(),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  debit: z.union([z.string(), z.number()]).optional(),
  credit: z.union([z.string(), z.number()]).optional(),
  balance: z.union([z.string(), z.number()]),
  category: z.string().optional(),
});

const ProcessingOptionsSchema = z.object({
  skipDuplicates: z.boolean().default(true),
  autoMatch: z.boolean().default(true),
  dateFormat: z.string().default('YYYY-MM-DD'),
  encoding: z.string().default('utf-8'),
  delimiter: z.string().default(','),
  hasHeader: z.boolean().default(true),
});

// Types
type ProcessingOptions = z.infer<typeof ProcessingOptionsSchema>;
type BankStatementFile = z.infer<typeof BankStatementFileSchema>;
type BankTransactionFile = z.infer<typeof BankTransactionFileSchema>;

interface ProcessingResult {
  success: boolean;
  statementId?: string;
  processedTransactions: number;
  skippedTransactions: number;
  errors: string[];
  warnings: string[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    balanceCheck: boolean;
  };
}

interface FileParsingResult {
  header: BankStatementFile;
  transactions: BankTransactionFile[];
  errors: string[];
  warnings: string[];
}

// Bank-specific parsers
interface BankParser {
  name: string;
  patterns: string[];
  parseStatement: (
    content: string,
    options: ProcessingOptions
  ) => FileParsingResult;
}

class BankStatementProcessor {
  private supabase = createClient();
  private parsers: Map<string, BankParser> = new Map();

  constructor() {
    this.initializeParsers();
  }

  private initializeParsers() {
    // Bradesco parser
    this.parsers.set('bradesco', {
      name: 'Bradesco',
      patterns: ['bradesco', 'banco bradesco'],
      parseStatement: this.parseBradescoStatement.bind(this),
    });

    // Itaú parser
    this.parsers.set('itau', {
      name: 'Itaú',
      patterns: ['itau', 'banco itau', 'itaú'],
      parseStatement: this.parseItauStatement.bind(this),
    });

    // Santander parser
    this.parsers.set('santander', {
      name: 'Santander',
      patterns: ['santander', 'banco santander'],
      parseStatement: this.parseSantanderStatement.bind(this),
    });

    // Generic CSV parser
    this.parsers.set('generic', {
      name: 'Generic CSV',
      patterns: ['csv', 'generic'],
      parseStatement: this.parseGenericCSV.bind(this),
    });
  }

  /**
   * Process bank statement file
   */
  async processStatementFile(
    file: File | Buffer,
    fileName: string,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessingResult> {
    try {
      const processingOptions = ProcessingOptionsSchema.parse(options);
      const content = await this.readFileContent(file);

      // Detect bank and parse statement
      const parser = this.detectBankParser(fileName, content);
      const parseResult = parser.parseStatement(content, processingOptions);

      if (parseResult.errors.length > 0) {
        return {
          success: false,
          processedTransactions: 0,
          skippedTransactions: 0,
          errors: parseResult.errors,
          warnings: parseResult.warnings,
          summary: {
            totalCredits: 0,
            totalDebits: 0,
            balanceCheck: false,
          },
        };
      }

      // Validate and process statement
      const result = await this.processStatement(
        parseResult.header,
        parseResult.transactions,
        fileName,
        processingOptions
      );

      return {
        ...result,
        warnings: [...result.warnings, ...parseResult.warnings],
      };
    } catch (error) {
      console.error('Error processing statement file:', error);
      return {
        success: false,
        processedTransactions: 0,
        skippedTransactions: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        summary: {
          totalCredits: 0,
          totalDebits: 0,
          balanceCheck: false,
        },
      };
    }
  }

  /**
   * Process multiple statement files
   */
  async processBatchFiles(
    files: Array<{ file: File | Buffer; fileName: string }>,
    options: Partial<ProcessingOptions> = {}
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const { file, fileName } of files) {
      const result = await this.processStatementFile(file, fileName, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Get processing summary for multiple files
   */
  getBatchSummary(results: ProcessingResult[]) {
    return {
      totalFiles: results.length,
      successfulFiles: results.filter((r) => r.success).length,
      failedFiles: results.filter((r) => !r.success).length,
      totalTransactions: results.reduce(
        (sum, r) => sum + r.processedTransactions,
        0
      ),
      totalSkipped: results.reduce((sum, r) => sum + r.skippedTransactions, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    };
  }

  private async readFileContent(file: File | Buffer): Promise<string> {
    if (file instanceof Buffer) {
      return file.toString('utf-8');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (_e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private detectBankParser(fileName: string, content: string): BankParser {
    const lowerFileName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();

    for (const [key, parser] of this.parsers) {
      if (key === 'generic') continue; // Skip generic parser in detection

      const matches = parser.patterns.some(
        (pattern) =>
          lowerFileName.includes(pattern) || lowerContent.includes(pattern)
      );

      if (matches) {
        return parser;
      }
    }

    // Default to generic parser
    return this.parsers.get('generic')!;
  }

  private parseBradescoStatement(
    content: string,
    options: ProcessingOptions
  ): FileParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Bradesco-specific parsing logic
      const lines = content.split('\n');

      // Extract header information
      const header: BankStatementFile = {
        bankName: 'Bradesco',
        accountNumber: this.extractAccountNumber(lines, 'bradesco'),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, 'opening', 'bradesco'),
        closingBalance: this.extractBalance(lines, 'closing', 'bradesco'),
        statementPeriodStart: this.extractPeriodStart(lines, 'bradesco'),
        statementPeriodEnd: this.extractPeriodEnd(lines, 'bradesco'),
      };

      // Parse transactions
      const transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, 'bradesco')),
        'bradesco',
        options
      );

      return { header, transactions, errors, warnings };
    } catch (error) {
      errors.push(
        `Bradesco parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        header: {} as BankStatementFile,
        transactions: [],
        errors,
        warnings,
      };
    }
  }

  private parseItauStatement(
    content: string,
    options: ProcessingOptions
  ): FileParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Itaú-specific parsing logic
      const lines = content.split('\n');

      const header: BankStatementFile = {
        bankName: 'Itaú',
        accountNumber: this.extractAccountNumber(lines, 'itau'),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, 'opening', 'itau'),
        closingBalance: this.extractBalance(lines, 'closing', 'itau'),
        statementPeriodStart: this.extractPeriodStart(lines, 'itau'),
        statementPeriodEnd: this.extractPeriodEnd(lines, 'itau'),
      };

      const transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, 'itau')),
        'itau',
        options
      );

      return { header, transactions, errors, warnings };
    } catch (error) {
      errors.push(
        `Itaú parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        header: {} as BankStatementFile,
        transactions: [],
        errors,
        warnings,
      };
    }
  }

  private parseSantanderStatement(
    content: string,
    options: ProcessingOptions
  ): FileParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Santander-specific parsing logic
      const lines = content.split('\n');

      const header: BankStatementFile = {
        bankName: 'Santander',
        accountNumber: this.extractAccountNumber(lines, 'santander'),
        statementDate: new Date().toISOString(),
        openingBalance: this.extractBalance(lines, 'opening', 'santander'),
        closingBalance: this.extractBalance(lines, 'closing', 'santander'),
        statementPeriodStart: this.extractPeriodStart(lines, 'santander'),
        statementPeriodEnd: this.extractPeriodEnd(lines, 'santander'),
      };

      const transactions = this.parseTransactionLines(
        lines.slice(this.findTransactionStartLine(lines, 'santander')),
        'santander',
        options
      );

      return { header, transactions, errors, warnings };
    } catch (error) {
      errors.push(
        `Santander parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        header: {} as BankStatementFile,
        transactions: [],
        errors,
        warnings,
      };
    }
  }

  private parseGenericCSV(
    content: string,
    options: ProcessingOptions
  ): FileParsingResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const parseResult = Papa.parse(content, {
        header: options.hasHeader,
        delimiter: options.delimiter,
        skipEmptyLines: true,
      });

      if (parseResult.errors.length > 0) {
        errors.push(...parseResult.errors.map((e) => e.message));
      }

      const data = parseResult.data as any[];

      if (data.length === 0) {
        errors.push('No data found in CSV file');
        return {
          header: {} as BankStatementFile,
          transactions: [],
          errors,
          warnings,
        };
      }

      // Try to detect header information from first few rows or use defaults
      const header: BankStatementFile = {
        bankName: 'Generic Bank',
        accountNumber: 'Unknown',
        statementDate: new Date().toISOString(),
        openingBalance: 0,
        closingBalance: 0,
        statementPeriodStart: new Date().toISOString(),
        statementPeriodEnd: new Date().toISOString(),
      };

      // Parse transactions from CSV data
      const transactions: BankTransactionFile[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          const transaction = this.parseCSVRow(row, options);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          warnings.push(
            `Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`
          );
        }
      }

      return { header, transactions, errors, warnings };
    } catch (error) {
      errors.push(
        `CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        header: {} as BankStatementFile,
        transactions: [],
        errors,
        warnings,
      };
    }
  }

  private parseCSVRow(
    row: any,
    _options: ProcessingOptions
  ): BankTransactionFile | null {
    // Handle both header and non-header CSV formats
    if (typeof row === 'object' && row !== null) {
      // Header format
      return {
        date: row.date || row.Date || row.DATA || '',
        description: row.description || row.Description || row.DESCRICAO || '',
        reference: row.reference || row.Reference || row.REFERENCIA || '',
        debit: row.debit || row.Debit || row.DEBITO || '',
        credit: row.credit || row.Credit || row.CREDITO || '',
        balance: row.balance || row.Balance || row.SALDO || '',
        category: row.category || row.Category || row.CATEGORIA || '',
      };
    }
    if (Array.isArray(row)) {
      // Non-header format - assume standard order
      return {
        date: row[0] || '',
        description: row[1] || '',
        reference: row[2] || '',
        debit: row[3] || '',
        credit: row[4] || '',
        balance: row[5] || '',
        category: row[6] || '',
      };
    }

    return null;
  }

  private async processStatement(
    header: BankStatementFile,
    transactions: BankTransactionFile[],
    fileName: string,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let processedTransactions = 0;
    let skippedTransactions = 0;
    let totalCredits = 0;
    let totalDebits = 0;

    try {
      // Validate header
      const validatedHeader = BankStatementFileSchema.parse(header);

      // Create bank statement record
      const { data: statement, error: statementError } = await this.supabase
        .from('bank_statements')
        .insert({
          bank_name: validatedHeader.bankName,
          account_number: validatedHeader.accountNumber,
          statement_date: validatedHeader.statementDate,
          opening_balance: validatedHeader.openingBalance,
          closing_balance: validatedHeader.closingBalance,
          statement_period_start: validatedHeader.statementPeriodStart,
          statement_period_end: validatedHeader.statementPeriodEnd,
          file_path: fileName,
          import_status: 'processing',
        })
        .select()
        .single();

      if (statementError) {
        throw new Error(
          `Failed to create statement: ${statementError.message}`
        );
      }

      // Process transactions
      const transactionInserts = [];

      for (const transaction of transactions) {
        try {
          const validatedTransaction =
            BankTransactionFileSchema.parse(transaction);

          // Parse amounts
          const debitAmount = this.parseAmount(validatedTransaction.debit);
          const creditAmount = this.parseAmount(validatedTransaction.credit);
          const balance = this.parseAmount(validatedTransaction.balance);

          if (!(debitAmount || creditAmount)) {
            warnings.push(
              `Transaction skipped - no amount: ${validatedTransaction.description}`
            );
            skippedTransactions++;
            continue;
          }

          // Parse date
          const transactionDate = this.parseDate(
            validatedTransaction.date,
            options.dateFormat
          );
          if (!transactionDate) {
            warnings.push(
              `Transaction skipped - invalid date: ${validatedTransaction.date}`
            );
            skippedTransactions++;
            continue;
          }

          const transactionData = {
            statement_id: statement.id,
            transaction_date: transactionDate.toISOString(),
            description: validatedTransaction.description,
            reference_number: validatedTransaction.reference || null,
            debit_amount: debitAmount,
            credit_amount: creditAmount,
            balance: balance || 0,
            transaction_type: debitAmount
              ? ('debit' as const)
              : ('credit' as const),
            category: validatedTransaction.category || null,
          };

          transactionInserts.push(transactionData);

          if (debitAmount) totalDebits += debitAmount;
          if (creditAmount) totalCredits += creditAmount;

          processedTransactions++;
        } catch (error) {
          warnings.push(
            `Transaction validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          skippedTransactions++;
        }
      }

      // Batch insert transactions
      if (transactionInserts.length > 0) {
        const { error: transactionError } = await this.supabase
          .from('bank_transactions')
          .insert(transactionInserts);

        if (transactionError) {
          throw new Error(
            `Failed to insert transactions: ${transactionError.message}`
          );
        }
      }

      // Update statement status and totals
      const { error: updateError } = await this.supabase
        .from('bank_statements')
        .update({
          total_credits: totalCredits,
          total_debits: totalDebits,
          import_status: 'completed',
        })
        .eq('id', statement.id);

      if (updateError) {
        warnings.push(
          `Failed to update statement totals: ${updateError.message}`
        );
      }

      // Validate balance
      const expectedBalance =
        header.openingBalance + totalCredits - totalDebits;
      const balanceCheck =
        Math.abs(expectedBalance - header.closingBalance) < 0.01;

      if (!balanceCheck) {
        warnings.push(
          `Balance mismatch: Expected ${expectedBalance.toFixed(2)}, ` +
            `Got ${header.closingBalance.toFixed(2)}`
        );
      }

      return {
        success: true,
        statementId: statement.id,
        processedTransactions,
        skippedTransactions,
        errors,
        warnings,
        summary: {
          totalCredits,
          totalDebits,
          balanceCheck,
        },
      };
    } catch (error) {
      console.error('Error processing statement:', error);
      return {
        success: false,
        processedTransactions,
        skippedTransactions,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        summary: {
          totalCredits,
          totalDebits,
          balanceCheck: false,
        },
      };
    }
  }

  // Helper methods for bank-specific parsing
  private extractAccountNumber(lines: string[], _bank: string): string {
    // Bank-specific account number extraction logic
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('conta') || lowerLine.includes('account')) {
        const match = line.match(/\d{4,}/); // Find sequence of 4+ digits
        if (match) return match[0];
      }
    }
    return 'Unknown';
  }

  private extractBalance(
    lines: string[],
    type: 'opening' | 'closing',
    _bank: string
  ): number {
    // Bank-specific balance extraction logic
    const searchTerms =
      type === 'opening'
        ? ['saldo anterior', 'opening balance', 'saldo inicial']
        : ['saldo final', 'closing balance', 'saldo atual'];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const term of searchTerms) {
        if (lowerLine.includes(term)) {
          const amount = this.parseAmount(line);
          if (amount !== null) return amount;
        }
      }
    }
    return 0;
  }

  private extractPeriodStart(_lines: string[], _bank: string): string {
    // Extract statement period start date
    return new Date().toISOString(); // Placeholder
  }

  private extractPeriodEnd(_lines: string[], _bank: string): string {
    // Extract statement period end date
    return new Date().toISOString(); // Placeholder
  }

  private findTransactionStartLine(lines: string[], _bank: string): number {
    // Find where transaction data starts
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('data') && line.includes('descri')) {
        return i + 1; // Skip header line
      }
    }
    return 0;
  }

  private parseTransactionLines(
    lines: string[],
    bank: string,
    options: ProcessingOptions
  ): BankTransactionFile[] {
    const transactions: BankTransactionFile[] = [];

    for (const line of lines) {
      if (line.trim() === '') continue;

      // Bank-specific transaction parsing
      const transaction = this.parseTransactionLine(line, bank, options);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private parseTransactionLine(
    line: string,
    _bank: string,
    _options: ProcessingOptions
  ): BankTransactionFile | null {
    // Basic transaction line parsing - would be customized per bank
    const parts = line.split(/\s{2,}|\t/); // Split on multiple spaces or tabs

    if (parts.length < 4) return null;

    return {
      date: parts[0] || '',
      description: parts[1] || '',
      reference: parts[2] || '',
      debit: parts[3] || '',
      credit: parts[4] || '',
      balance: parts[5] || '',
    };
  }

  private parseAmount(value: string | number | undefined): number | null {
    if (value === undefined || value === null || value === '') return null;

    if (typeof value === 'number') return value;

    // Clean up string value
    const cleaned = value
      .toString()
      .replace(/[^\d.,-]/g, '') // Remove non-numeric characters except . , -
      .replace(/,/g, '.') // Replace comma with dot
      .replace(/\.(?=.*\.)/g, ''); // Remove all but last dot

    const parsed = Number.parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private parseDate(dateStr: string, _format: string): Date | null {
    if (!dateStr) return null;

    // Try different date formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    ];

    for (const formatRegex of formats) {
      const match = dateStr.match(formatRegex);
      if (match) {
        const [, part1, part2, part3] = match;

        // Determine if it's YYYY-MM-DD or DD/MM/YYYY format
        if (part1.length === 4) {
          // YYYY-MM-DD
          const date = new Date(
            Number.parseInt(part1, 10),
            Number.parseInt(part2, 10) - 1,
            Number.parseInt(part3, 10)
          );
          if (!Number.isNaN(date.getTime())) return date;
        } else {
          // DD/MM/YYYY
          const date = new Date(
            Number.parseInt(part3, 10),
            Number.parseInt(part2, 10) - 1,
            Number.parseInt(part1, 10)
          );
          if (!Number.isNaN(date.getTime())) return date;
        }
      }
    }

    // Fallback to Date constructor
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

export {
  BankStatementProcessor,
  type ProcessingOptions,
  type ProcessingResult,
};
