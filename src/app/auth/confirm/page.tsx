'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function MagicLinkConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string | null>(null)
  const [redirectTo, setRedirectTo] = useState('/dashboard')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No verification token provided')
      return
    }

    verifyMagicLink()
  }, [token])

  const verifyMagicLink = async () => {
    try {
      const response = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Invalid or expired link')
      }

      const data = await response.json()
      setRedirectTo(data.redirectTo || '/dashboard')
      setStatus('success')

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(data.redirectTo || '/dashboard')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to verify link')
    }
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Verifying your link...</h1>
            <p className="text-muted-foreground text-center">
              Please wait while we sign you in
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold">Success!</h1>
            <p className="text-muted-foreground text-center">
              You've been signed in successfully
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to {redirectTo}...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="flex flex-col items-center space-y-4">
          <XCircle className="h-8 w-8 text-destructive" />
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">
              The link may have expired or already been used.
            </p>
            <p className="text-muted-foreground">
              Magic links expire after 15 minutes and can only be used once.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button asChild className="flex-1">
              <Link href="/login">
                <Mail className="mr-2 h-4 w-4" />
                Request new link
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                Go to homepage
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
