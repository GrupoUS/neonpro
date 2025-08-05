// NeonPro - Bank Transactions API Routes
// Story 6.1 - Task 4: Bank Reconciliation System
// API endpoints for individual bank transaction management

import type { NextRequest } from "next/server";

// Validation schemas
const GetTransactionsQuerySchema = z.object({
  statementId: z.string().uuid().optional(),
  status: z.enum(["unmatched", "matched", "disputed", "ignored"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  amountMin: z.coerce.number().optional(),
  amountMax: z.coerce.number().optional(),
  searchTerm: z.string().optional(),
  transactionType: z.enum(["debit", "credit"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["date", "amount", "description", "status"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const UpdateTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  reconciliationStatus: z.enum(["unmatched", "matched", "disputed", "ignored"]).optional(),
  matchedPaymentId: z.string().uuid().nullable().optional(),
  matchingConfidence: z.number().min(0).max(1).optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

const BulkUpdateSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1),
  action: z.enum([
    "mark_matched",
    "mark_unmatched",
    "mark_disputed",
    "mark_ignored",
    "set_category",
  ]),
  data: z
    .object({
      reconciliationStatus: z.enum(["unmatched", "matched", "disputed", "ignored"]).optional(),
      category: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

const MatchTransactionSchema = z.object({
  transactionId: z.string().uuid(),
  paymentId: z.string().uuid(),
  confidence: z.number().min(0).max(1).default(1.0),
  notes: z.string().optional(),
});

/**
 * GET /api/bank-reconciliation/transactions
 * Get bank transactions with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = GetTransactionsQuerySchema.parse(queryParams);

    // Build query
    let query = supabase
      .from("bank_transactions")
      .select(`
        *,
        bank_statements!inner(
          id,
          bank_name,
          account_number,
          created_by
        ),
        payments(
          id,
          amount,
          status,
          payment_method
        )
      `)
      .eq("bank_statements.created_by", user.id);

    // Apply filters
    if (validatedQuery.statementId) {
      query = query.eq("statement_id", validatedQuery.statementId);
    }

    if (validatedQuery.status) {
      query = query.eq("reconciliation_status", validatedQuery.status);
    }

    if (validatedQuery.dateFrom) {
      query = query.gte("transaction_date", validatedQuery.dateFrom);
    }

    if (validatedQuery.dateTo) {
      query = query.lte("transaction_date", validatedQuery.dateTo);
    }

    if (validatedQuery.transactionType) {
      query = query.eq("transaction_type", validatedQuery.transactionType);
    }

    if (validatedQuery.amountMin !== undefined) {
      query = query.or(
        `debit_amount.gte.${validatedQuery.amountMin},credit_amount.gte.${validatedQuery.amountMin}`,
      );
    }

    if (validatedQuery.amountMax !== undefined) {
      query = query.or(
        `debit_amount.lte.${validatedQuery.amountMax},credit_amount.lte.${validatedQuery.amountMax}`,
      );
    }

    if (validatedQuery.searchTerm) {
      query = query.or(
        `description.ilike.%${validatedQuery.searchTerm}%,reference_number.ilike.%${validatedQuery.searchTerm}%`,
      );
    }

    // Apply sorting
    const sortColumn =
      validatedQuery.sortBy === "amount"
        ? "debit_amount"
        : validatedQuery.sortBy === "date"
          ? "transaction_date"
          : validatedQuery.sortBy;

    query = query.order(sortColumn, { ascending: validatedQuery.sortOrder === "asc" });

    // Apply pagination
    const { data: transactions, error: transactionsError } = await query.range(
      (validatedQuery.page - 1) * validatedQuery.limit,
      validatedQuery.page * validatedQuery.limit - 1,
    );

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`);
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("bank_transactions")
      .select("*", { count: "exact", head: true })
      .eq("bank_statements.created_by", user.id);

    // Apply same filters for count
    if (validatedQuery.statementId) {
      countQuery = countQuery.eq("statement_id", validatedQuery.statementId);
    }
    if (validatedQuery.status) {
      countQuery = countQuery.eq("reconciliation_status", validatedQuery.status);
    }
    if (validatedQuery.dateFrom) {
      countQuery = countQuery.gte("transaction_date", validatedQuery.dateFrom);
    }
    if (validatedQuery.dateTo) {
      countQuery = countQuery.lte("transaction_date", validatedQuery.dateTo);
    }
    if (validatedQuery.transactionType) {
      countQuery = countQuery.eq("transaction_type", validatedQuery.transactionType);
    }
    if (validatedQuery.searchTerm) {
      countQuery = countQuery.or(
        `description.ilike.%${validatedQuery.searchTerm}%,reference_number.ilike.%${validatedQuery.searchTerm}%`,
      );
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to get count: ${countError.message}`);
    }

    // Calculate summary statistics
    const summary = {
      totalTransactions: count || 0,
      matchedCount: transactions?.filter((t) => t.reconciliation_status === "matched").length || 0,
      unmatchedCount:
        transactions?.filter((t) => t.reconciliation_status === "unmatched").length || 0,
      disputedCount:
        transactions?.filter((t) => t.reconciliation_status === "disputed").length || 0,
      totalAmount:
        transactions?.reduce((sum, t) => {
          return sum + (t.debit_amount || t.credit_amount || 0);
        }, 0) || 0,
    };

    return NextResponse.json({
      success: true,
      data: transactions,
      summary,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedQuery.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bank transactions:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/bank-reconciliation/transactions
 * Perform transaction matching or bulk operations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case "match_transaction": {
        const validatedData = MatchTransactionSchema.parse(body);
        const reconciliationManager = new BankReconciliationManager();

        const result = await reconciliationManager.performManualMatching(
          validatedData.transactionId,
          validatedData.paymentId,
          validatedData.confidence,
          validatedData.notes,
        );

        return NextResponse.json({
          success: result.success,
          data: result,
          message: result.success
            ? "Transaction matched successfully"
            : "Failed to match transaction",
        });
      }

      case "bulk_update": {
        const validatedData = BulkUpdateSchema.parse(body);

        const updateData: any = {};

        switch (validatedData.action) {
          case "mark_matched":
            updateData.reconciliation_status = "matched";
            break;
          case "mark_unmatched":
            updateData.reconciliation_status = "unmatched";
            updateData.matched_payment_id = null;
            updateData.matching_confidence = null;
            break;
          case "mark_disputed":
            updateData.reconciliation_status = "disputed";
            break;
          case "mark_ignored":
            updateData.reconciliation_status = "ignored";
            break;
          case "set_category":
            if (validatedData.data?.category) {
              updateData.category = validatedData.data.category;
            }
            break;
        }

        if (validatedData.data?.notes) {
          updateData.notes = validatedData.data.notes;
        }

        const { data: updatedTransactions, error: updateError } = await supabase
          .from("bank_transactions")
          .update(updateData)
          .in("id", validatedData.transactionIds)
          .select(`
            *,
            bank_statements!inner(created_by)
          `)
          .eq("bank_statements.created_by", user.id);

        if (updateError) {
          throw new Error(`Failed to update transactions: ${updateError.message}`);
        }

        return NextResponse.json({
          success: true,
          data: updatedTransactions,
          message: `Successfully updated ${updatedTransactions?.length || 0} transactions`,
        });
      }

      case "find_potential_matches": {
        const { transactionId } = body;

        if (!transactionId) {
          return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
        }

        const reconciliationManager = new BankReconciliationManager();
        const matches = await reconciliationManager.findPotentialMatches(transactionId);

        return NextResponse.json({
          success: true,
          data: matches,
          message: `Found ${matches.length} potential matches`,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in bank transactions POST:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/bank-reconciliation/transactions
 * Update individual transaction details
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateTransactionSchema.parse(body);

    // Prepare update data
    const updateData: any = {};
    if (validatedData.reconciliationStatus !== undefined) {
      updateData.reconciliation_status = validatedData.reconciliationStatus;
    }
    if (validatedData.matchedPaymentId !== undefined) {
      updateData.matched_payment_id = validatedData.matchedPaymentId;
    }
    if (validatedData.matchingConfidence !== undefined) {
      updateData.matching_confidence = validatedData.matchingConfidence;
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category;
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Update transaction
    const { data: transaction, error: updateError } = await supabase
      .from("bank_transactions")
      .update(updateData)
      .eq("id", validatedData.transactionId)
      .select(`
        *,
        bank_statements!inner(
          id,
          bank_name,
          account_number,
          created_by
        )
      `)
      .eq("bank_statements.created_by", user.id)
      .single();

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating bank transaction:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/bank-reconciliation/transactions
 * Delete bank transactions (soft delete by marking as ignored)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transactionIds, permanent = false } = body;

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json({ error: "Transaction IDs array is required" }, { status: 400 });
    }

    if (permanent) {
      // Hard delete (only for admin users)
      const { error: deleteError } = await supabase
        .from("bank_transactions")
        .delete()
        .in("id", transactionIds)
        .eq("bank_statements.created_by", user.id);

      if (deleteError) {
        throw new Error(`Failed to delete transactions: ${deleteError.message}`);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${transactionIds.length} transactions`,
      });
    } else {
      // Soft delete by marking as ignored
      const { data: transactions, error: updateError } = await supabase
        .from("bank_transactions")
        .update({
          reconciliation_status: "ignored",
          notes: "Marked as ignored by user",
        })
        .in("id", transactionIds)
        .select(`
          *,
          bank_statements!inner(created_by)
        `)
        .eq("bank_statements.created_by", user.id);

      if (updateError) {
        throw new Error(`Failed to mark transactions as ignored: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        data: transactions,
        message: `Successfully marked ${transactions?.length || 0} transactions as ignored`,
      });
    }
  } catch (error) {
    console.error("Error deleting bank transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
