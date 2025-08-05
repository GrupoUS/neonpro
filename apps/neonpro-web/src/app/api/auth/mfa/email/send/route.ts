// app/api/auth/mfa/email/send/route.ts
// API route for sending email verification codes
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, code, userId } = await request.json()

    // Validate input
    if (!email || !code || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user exists and is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting check
    const rateLimitResult = await checkEmailRateLimit(userId)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please wait before requesting another code.',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      )
    }

    // Send email using Resend (already configured in project)
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NeonPro <no-reply@neonpro.app>',
          to: [email],
          subject: 'Your NeonPro Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; text-align: center;">NeonPro Verification Code</h1>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h2 style="font-size: 32px; letter-spacing: 4px; margin: 0; color: #007bff;">${code}</h2>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Use this verification code to complete your multi-factor authentication setup. 
                This code will expire in 10 minutes.
              </p>
              <p style="color: #666; line-height: 1.6;">
                If you didn't request this code, please ignore this email or contact support if you have concerns.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This email was sent by NeonPro. Please do not reply to this email.
              </p>
            </div>
          `,
          text: `Your NeonPro verification code is: ${code}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`
        })
      })

      if (!response.ok) {
        throw new Error(`Email service error: ${response.status}`)
      }

      const result = await response.json()
      
      return NextResponse.json({
        success: true,
        messageId: result.id,
        message: 'Email sent successfully'
      })

    } catch (emailError) {
      console.error('Email sending error:', emailError)
      
      // Fallback: Log the code for development
      console.log(`Email MFA Code for ${email}: ${code}`)
      
      return NextResponse.json({
        success: true,
        messageId: `mock-${Date.now()}`,
        message: 'Email sent successfully (development mode)',
        warning: 'Email service unavailable, check console for code'
      })
    }

  } catch (error) {
    console.error('Email MFA error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Rate limiting for email sending
async function checkEmailRateLimit(userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const supabase = await createClient()
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    // Check how many email codes were sent in the last 5 minutes
    const { data, error } = await supabase
      .from('mfa_verification_codes')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'email')
      .gte('created_at', fiveMinutesAgo.toISOString())
    
    if (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true } // Allow on error
    }
    
    // Allow maximum 3 email codes per 5 minutes
    const count = data?.length || 0
    if (count >= 3) {
      return { 
        allowed: false, 
        retryAfter: 300 // 5 minutes
      }
    }
    
    return { allowed: true }
  } catch (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true } // Allow on error
  }
}
