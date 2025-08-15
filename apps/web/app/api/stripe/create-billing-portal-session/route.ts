import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { SubscriptionService } from '@/lib/services/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json();

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Missing required field: returnUrl' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user's subscription to find customer ID
    const subscriptionService = new SubscriptionService();
    const userSubscription = await subscriptionService.getUserSubscription(
      user.id
    );

    if (!(userSubscription && userSubscription.stripe_customer_id)) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create billing portal session
    const session = await subscriptionService.createBillingPortalSession(
      userSubscription.stripe_customer_id,
      returnUrl
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create billing portal session error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create billing portal session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
