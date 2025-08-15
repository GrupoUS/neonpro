// app/api/auth/mfa/sms/send/route.ts
// API route for sending SMS verification codes
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// Note: This will require Twilio or AWS SNS configuration
// For now, we'll use a mock implementation that logs the code
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, userId } = await request.json();

    // Validate input
    if (!(phoneNumber && code && userId)) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify user exists and is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const rateLimitResult = await checkSMSRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Rate limit exceeded. Please wait before requesting another code.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }

    // TODO: Replace with actual SMS provider integration
    // For development, we'll log the code
    console.log(`SMS MFA Code for ${phoneNumber}: ${code}`);

    // In production, implement Twilio or AWS SNS:
    /*
    const twilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    
    const message = await twilioClient.messages.create({
      body: `Your NeonPro verification code is: ${code}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })
    
    return NextResponse.json({
      success: true,
      messageId: message.sid
    })
    */

    // For development/testing
    return NextResponse.json({
      success: true,
      messageId: `mock-${Date.now()}`,
      message: 'SMS sent successfully (development mode)',
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// Rate limiting for SMS sending
async function checkSMSRateLimit(
  userId: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const supabase = await createClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Check how many SMS codes were sent in the last 5 minutes
    const { data, error } = await supabase
      .from('mfa_verification_codes')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'sms')
      .gte('created_at', fiveMinutesAgo.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Allow on error
    }

    // Allow maximum 3 SMS codes per 5 minutes
    const count = data?.length || 0;
    if (count >= 3) {
      return {
        allowed: false,
        retryAfter: 300, // 5 minutes
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Allow on error
  }
}
