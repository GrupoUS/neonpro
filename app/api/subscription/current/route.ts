import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's current subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions_view') // This view joins with plans
      .select(`
        id,
        plan_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at,
        plan:subscription_plans(
          id,
          name,
          stripe_price_id,
          price,
          currency,
          interval,
          features
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return NextResponse.json({ subscription: null });
      }
      throw error;
    }

    return NextResponse.json(subscription);

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
