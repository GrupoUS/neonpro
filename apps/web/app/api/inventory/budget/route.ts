import { type NextRequest, NextResponse } from 'next/server';
import { BudgetApprovalService } from '@/app/lib/services/budget-approval-service';
import {
  budgetPeriodUpdateSchema,
  budgetSchema,
  bulkBudgetCreateSchema,
} from '@/app/lib/validations/budget-approval';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const costCenter = searchParams.get('costCenter');
    const status = searchParams.get('status');

    let query = supabase
      .from('budgets')
      .select(
        `
        *,
        cost_center:cost_centers(name),
        approvals:budget_approvals(*),
        allocations:budget_allocations(*)
      `
      )
      .eq('user_id', user.id);

    if (period) {
      query = query.eq('period', period);
    }

    if (costCenter) {
      query = query.eq('cost_center_id', costCenter);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: budgets, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('Error fetching budgets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch budgets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error in budget GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle bulk creation
    if (body.budgets && Array.isArray(body.budgets)) {
      const validated = bulkBudgetCreateSchema.parse(body);
      const service = new BudgetApprovalService();

      const results = await Promise.all(
        validated.budgets.map((budgetData) =>
          service.createBudget(user.id, {
            ...budgetData,
            user_id: user.id,
          })
        )
      );

      return NextResponse.json({ budgets: results });
    }

    // Single budget creation
    const validated = budgetSchema.parse(body);
    const service = new BudgetApprovalService();

    const budget = await service.createBudget(user.id, {
      ...validated,
      user_id: user.id,
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error creating budget:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid budget data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = budgetPeriodUpdateSchema.parse(body);
    const service = new BudgetApprovalService();

    const updated = await service.updateBudgetPeriod(
      validated.budget_id,
      validated.period_data
    );

    return NextResponse.json({ budget: updated });
  } catch (error) {
    console.error('Error updating budget:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}
