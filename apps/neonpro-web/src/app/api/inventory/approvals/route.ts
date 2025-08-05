import { BudgetApprovalService } from '@/app/lib/services/budget-approval-service';
import {
    approvalSchema
} from '@/app/lib/validations/budget-approval';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const budgetId = searchParams.get('budgetId');
    const status = searchParams.get('status');
    const approverId = searchParams.get('approverId');

    let query = supabase
      .from('budget_approvals')
      .select(`
        *,
        budget:budgets(name, total_amount),
        approver:profiles(name),
        requester:profiles(name)
      `);

    if (budgetId) {
      query = query.eq('budget_id', budgetId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (approverId) {
      query = query.eq('approver_id', approverId);
    }

    const { data: approvals, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approvals:', error);
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
    }

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error('Error in approvals GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = approvalSchema.parse(body);
    const service = new BudgetApprovalService();
    
    const approval = await service.createApproval(user.id, {
      ...validated,
      requester_id: user.id
    });

    return NextResponse.json({ approval });
  } catch (error) {
    console.error('Error creating approval:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid approval data' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}
