// NeonPro - Bank Reconciliation API Routes
// Story 6.1 - Task 4: Bank Reconciliation System
// Main API endpoints for bank reconciliation management

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BankStatementProcessor } from '@/lib/payments/reconciliation/bank-statement-processor';
import { EnhancedBankReconciliationService } from '@/lib/payments/reconciliation/enhanced-bank-reconciliation-service';
import { createClient } from '@/lib/supabase/server';

// Validation schemas
const GetReconciliationQuerySchema = z.object({
  statementId: z.string().uuid().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const ImportStatementSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  statementDate: z.string().datetime(),
  openingBalance: z.number(),
  closingBalance: z.number(),
  statementPeriodStart: z.string().datetime(),
  statementPeriodEnd: z.string().datetime(),
  processingOptions: z
    .object({
      skipDuplicates: z.boolean().default(true),
      autoMatch: z.boolean().default(true),
      dateFormat: z.string().default('YYYY-MM-DD'),
      encoding: z.string().default('utf-8'),
      delimiter: z.string().default(','),
      hasHeader: z.boolean().default(true),
    })
    .optional(),
});

const ReconcileTransactionsSchema = z.object({
  statementId: z.string().uuid(),
  autoMatchOnly: z.boolean().default(false),
  confidenceThreshold: z.number().min(0).max(1).default(0.8),
});

const ManualMatchSchema = z.object({
  transactionId: z.string().uuid(),
  paymentId: z.string().uuid(),
  confidence: z.number().min(0).max(1).default(1.0),
  notes: z.string().optional(),
});

/**
 * GET /api/bank-reconciliation
 * Get bank reconciliation data with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = GetReconciliationQuerySchema.parse(queryParams);

    const reconciliationService = new EnhancedBankReconciliationService();

    // Build filters
    const filters: any = {};
    if (validatedQuery.statementId) {
      filters.statementId = validatedQuery.statementId;
    }
    if (validatedQuery.bankName) {
      filters.bankName = validatedQuery.bankName;
    }
    if (validatedQuery.accountNumber) {
      filters.accountNumber = validatedQuery.accountNumber;
    }
    if (validatedQuery.dateFrom) {
      filters.dateFrom = validatedQuery.dateFrom;
    }
    if (validatedQuery.dateTo) {
      filters.dateTo = validatedQuery.dateTo;
    }
    if (validatedQuery.status) {
      filters.status = validatedQuery.status;
    }

    // Get bank statements with pagination
    const { data: statements, error: statementsError } = await supabase
      .from('bank_statements')
      .select(`
        *,
        bank_transactions(
          id,
          transaction_date,
          description,
          debit_amount,
          credit_amount,
          reconciliation_status,
          matching_confidence
        )
      `)
      .match(filters)
      .order('statement_date', { ascending: false })
      .range(
        (validatedQuery.page - 1) * validatedQuery.limit,
        validatedQuery.page * validatedQuery.limit - 1
      );

    if (statementsError) {
      throw new Error(`Failed to fetch statements: ${statementsError.message}`);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('bank_statements')
      .select('*', { count: 'exact', head: true })
      .match(filters);

    if (countError) {
      throw new Error(`Failed to get count: ${countError.message}`);
    }

    // Calculate summary statistics
    const summary = {
      totalStatements: count || 0,
      totalPages: Math.ceil((count || 0) / validatedQuery.limit),
      currentPage: validatedQuery.page,
      reconciliationStats: await reconciliationService.getReconciliationSummary(
        {
          dateFrom: validatedQuery.dateFrom,
          dateTo: validatedQuery.dateTo,
          bankName: validatedQuery.bankName,
        }
      ),
    };

    return NextResponse.json({
      success: true,
      data: statements,
      summary,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedQuery.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reconciliation data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bank-reconciliation
 * Import bank statement file or perform reconciliation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Handle file upload for statement import
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const metadata = formData.get('metadata') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      let statementData;
      try {
        statementData = metadata ? JSON.parse(metadata) : {};
      } catch {
        return NextResponse.json(
          { error: 'Invalid metadata JSON' },
          { status: 400 }
        );
      }

      const validatedData = ImportStatementSchema.parse(statementData);
      const processor = new BankStatementProcessor();

      const result = await processor.processStatementFile(
        file,
        file.name,
        validatedData.processingOptions
      );

      return NextResponse.json({
        success: result.success,
        data: result,
        message: result.success
          ? `Successfully processed ${result.processedTransactions} transactions`
          : 'Failed to process statement file',
      });
    }

    // Handle JSON requests for reconciliation operations
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'reconcile': {
        const validatedData = ReconcileTransactionsSchema.parse(body);
        const reconciliationService = new EnhancedBankReconciliationService();

        const result = await reconciliationService.performAutoMatching(
          validatedData.statementId,
          {
            confidenceThreshold: validatedData.confidenceThreshold,
            autoMatchOnly: validatedData.autoMatchOnly,
          }
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: `Matched ${result.matchedCount} transactions`,
        });
      }

      case 'manual_match': {
        const validatedData = ManualMatchSchema.parse(body);
        const reconciliationService = new EnhancedBankReconciliationService();

        const result = await reconciliationService.performManualMatching(
          validatedData.transactionId,
          validatedData.paymentId,
          validatedData.confidence,
          validatedData.notes
        );

        return NextResponse.json({
          success: result.success,
          data: result,
          message: result.success
            ? 'Transaction matched successfully'
            : 'Failed to match transaction',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in bank reconciliation POST:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bank-reconciliation
 * Update reconciliation rules or statement status
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'update_rule': {
        const { ruleId, ...ruleData } = body;

        if (!ruleId) {
          return NextResponse.json(
            { error: 'Rule ID is required' },
            { status: 400 }
          );
        }

        const { data: rule, error: updateError } = await supabase
          .from('reconciliation_rules')
          .update(ruleData)
          .eq('id', ruleId)
          .eq('created_by', user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update rule: ${updateError.message}`);
        }

        return NextResponse.json({
          success: true,
          data: rule,
          message: 'Reconciliation rule updated successfully',
        });
      }

      case 'update_statement_status': {
        const { statementId, status } = body;

        if (!(statementId && status)) {
          return NextResponse.json(
            { error: 'Statement ID and status are required' },
            { status: 400 }
          );
        }

        const { data: statement, error: updateError } = await supabase
          .from('bank_statements')
          .update({ import_status: status })
          .eq('id', statementId)
          .eq('created_by', user.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update statement: ${updateError.message}`);
        }

        return NextResponse.json({
          success: true,
          data: statement,
          message: 'Statement status updated successfully',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in bank reconciliation PUT:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bank-reconciliation
 * Delete bank statements or reconciliation rules
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!(action && ids && Array.isArray(ids))) {
      return NextResponse.json(
        { error: 'Action and IDs array are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'delete_statements': {
        const { error: deleteError } = await supabase
          .from('bank_statements')
          .delete()
          .in('id', ids)
          .eq('created_by', user.id);

        if (deleteError) {
          throw new Error(
            `Failed to delete statements: ${deleteError.message}`
          );
        }

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${ids.length} bank statements`,
        });
      }

      case 'delete_rules': {
        const { error: deleteError } = await supabase
          .from('reconciliation_rules')
          .delete()
          .in('id', ids)
          .eq('created_by', user.id);

        if (deleteError) {
          throw new Error(`Failed to delete rules: ${deleteError.message}`);
        }

        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${ids.length} reconciliation rules`,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in bank reconciliation DELETE:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
