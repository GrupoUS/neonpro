import { BudgetApprovalService } from '@/app/lib/services/budget-approval-service';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: {
    id: string;
    action: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = params;
    const body = await request.json();
    const { comments } = body;

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const service = new BudgetApprovalService();
    
    // For now, we'll update the approval directly since the service method expects different parameters
    const { data: approval, error } = await supabase
      .from('budget_approvals')
      .update({
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes_requested',
        decision_date: new Date().toISOString(),
        comments: comments || '',
        approver_id: user.id
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to process approval: ${error.message}`);
    }

    return NextResponse.json({ approval });
  } catch (error) {
    console.error('Error processing approval action:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}
