import { type NextRequest, NextResponse } from 'next/server';
import { BudgetApprovalService } from '@/app/lib/services/budget-approval-service';
import { createClient } from '@/app/utils/supabase/server';

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
    const { budget_ids, period } = body;

    if (!(budget_ids && Array.isArray(budget_ids)) || budget_ids.length === 0) {
      return NextResponse.json(
        { error: 'Budget IDs required' },
        { status: 400 },
      );
    }

    const service = new BudgetApprovalService();

    // Generate recommendations for each budget
    const allRecommendations = await Promise.all(
      budget_ids.map((budgetId: string) =>
        service.generateBudgetOptimizationRecommendations(budgetId),
      ),
    );

    return NextResponse.json({ recommendations: allRecommendations.flat() });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to analyze optimization' },
      { status: 500 },
    );
  }
}

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
    const budgetId = searchParams.get('budgetId');
    const period = searchParams.get('period') || 12;

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID required' },
        { status: 400 },
      );
    }

    const service = new BudgetApprovalService();
    const forecasts = await service.generateBudgetForecast(
      budgetId,
      Number(period),
    );

    return NextResponse.json({ forecasts });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 },
    );
  }
}
