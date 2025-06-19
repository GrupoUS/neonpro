import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Generate a secure token
export function generateMagicLinkToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const tokenLength = 32
  let token = ''

  const randomValues = new Uint8Array(tokenLength)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < tokenLength; i++) {
    token += chars[randomValues[i] % chars.length]
  }

  return token
}

// Create magic link for email
export async function createMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateMagicLinkToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  const supabase = createRouteHandlerClient({ cookies })

  // Store the magic link token
  const { error } = await supabase
    .from('magic_links')
    .insert({
      email,
      token,
      redirect_to: redirectTo || '/dashboard',
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

  if (error) {
    throw new Error('Failed to create magic link')
  }

  return { token, expiresAt }
}

// Verify magic link token
export async function verifyMagicLink(token: string): Promise<{
  valid: boolean
  email?: string
  redirectTo?: string
}> {
  const supabase = createRouteHandlerClient({ cookies })

  // Get the magic link
  const { data, error } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return { valid: false }
  }

  // Mark as used
  await supabase
    .from('magic_links')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('token', token)

  return {
    valid: true,
    email: data.email,
    redirectTo: data.redirect_to,
  }
}

// Send magic link email
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  appUrl: string
): Promise<void> {
  const magicLinkUrl = `${appUrl}/auth/verify?token=${token}`

  // Email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Sign in to NeonPro</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .code {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>NeonPro</h1>
          </div>

          <h2>Sign in to your account</h2>

          <p>Hi there,</p>

          <p>
            We received a request to sign in to NeonPro using this email address.
            Click the button below to sign in:
          </p>

          <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="button">Sign in to NeonPro</a>
          </div>

          <p>
            Or copy and paste this URL into your browser:
            <br>
            <span class="code">${magicLinkUrl}</span>
          </p>

          <p>
            This link will expire in 15 minutes and can only be used once.
          </p>

          <div class="footer">
            <p>
              If you didn't request this email, you can safely ignore it.
            </p>
            <p>
              Best regards,<br>
              The NeonPro Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
Sign in to NeonPro

Hi there,

We received a request to sign in to NeonPro using this email address.

Click this link to sign in:
${magicLinkUrl}

This link will expire in 15 minutes and can only be used once.

If you didn't request this email, you can safely ignore it.

Best regards,
The NeonPro Team
  `

  // In production, you would use a proper email service
  // For now, we'll use Supabase's auth email system
  console.log('Magic link email would be sent to:', email)
  console.log('Magic link URL:', magicLinkUrl)

  // You can integrate with services like:
  // - SendGrid
  // - Mailgun
  // - Amazon SES
  // - Resend
  // - Postmark
}

// Clean up expired magic links
export async function cleanupExpiredMagicLinks(): Promise<void> {
  const supabase = createRouteHandlerClient({ cookies })

  await supabase
    .from('magic_links')
    .delete()
    .lt('expires_at', new Date().toISOString())
}
