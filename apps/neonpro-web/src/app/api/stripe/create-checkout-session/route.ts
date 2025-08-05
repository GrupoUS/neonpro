import { createClient } from '@/lib/supabase/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { planId, successUrl, cancelUrl } = await request.json();

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Create checkout session
    const subscriptionService = new SubscriptionService();
    const session = await subscriptionService.createCheckoutSession(
      planId,
      user.id,
      user.email!,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('Create checkout session error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
