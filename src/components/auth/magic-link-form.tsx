'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

interface MagicLinkFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function MagicLinkForm({ onSuccess, redirectTo }: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate email
    const validation = emailSchema.safeParse(email)
    if (!validation.success) {
      setError(validation.error.errors[0].message)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send magic link')
      }

      setIsSent(true)
      toast({
        title: 'Check your email',
        description: `We've sent a sign-in link to ${email}`,
      })

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      toast({
        title: 'Error',
        description: 'Failed to send magic link. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setIsSent(false)
    setEmail('')
  }

  if (isSent) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a sign-in link to:
          </p>
          <p className="font-medium">{email}</p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to sign in. The link expires in 15 minutes.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button variant="link" onClick={handleResend} className="p-0">
              try again with a different email
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 text-center">
          <Mail className="h-8 w-8 text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Sign in with email</h2>
          <p className="text-muted-foreground">
            We'll send you a link to sign in. No password required.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            required
            autoFocus
            autoComplete="email"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending link...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send magic link
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </Card>
  )
}
