import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useEffect, useState } from 'react'

function AuthConfirmComponent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the current URL to check for parameters
        const url = new URL(window.location.href)
        const nextUrl = url.searchParams.get('next')
        
        // Handle the email confirmation
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data.session) {
          console.error('Email confirmation error:', error)
          setStatus('error')
          setTimeout(() => {
            window.location.href = '/login?message=confirmation_failed'
          }, 3000)
          return
        }

        console.log('Email confirmed successfully')
        setStatus('success')
        
        // Redirect to next URL or default to dashboard
        const redirectUrl = nextUrl ? decodeURIComponent(nextUrl) : '/dashboard'
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 2000)      } catch (error) {
        console.error('Email confirmation exception:', error)
        setStatus('error')
        setTimeout(() => {
          window.location.href = '/login?error=confirmation_exception'
        }, 3000)
      }
    }

    handleEmailConfirmation()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Confirmando email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-600">Email confirmado com sucesso!</p>
            <p className="text-xs text-muted-foreground">Redirecionando para o dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600">Erro na confirmação do email</p>
            <p className="text-xs text-muted-foreground">Redirecionando para login...</p>
          </>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/confirm')({
  component: AuthConfirmComponent,
})