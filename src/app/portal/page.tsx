// ===============================================
// Patient Portal Login Page
// Story 4.3: Patient Portal & Self-Service
// ===============================================

import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/server'
import PatientLoginForm from '@/components/portal/PatientLoginForm'
import PortalLoadingSpinner from '@/components/portal/PortalLoadingSpinner'

export const metadata: Metadata = {
  title: 'Portal do Paciente - NeonPro',
  description: 'Acesse seu portal do paciente para gerenciar consultas, ver progresso e muito mais',
  robots: 'noindex, nofollow', // Portal pages should not be indexed
}

interface PortalPageProps {
  searchParams: {
    clinic?: string
    redirect?: string
    error?: string
  }
}

export default async function PortalLoginPage({ searchParams }: PortalPageProps) {
  const { clinic, redirect: redirectTo, error } = searchParams

  // Check if user is already logged in
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Check if valid patient session exists
    const { data: patientSession } = await supabase
      .from('patient_portal_sessions')
      .select('id')
      .eq('session_token', session.access_token)
      .eq('is_active', true)
      .single()

    if (patientSession) {
      // Redirect to dashboard or specified redirect URL
      redirect(redirectTo || '/portal/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* PWA Status Bar Spacer */}
      <div className="safe-area-top bg-blue-600"></div>
      
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
              <svg 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Portal do Paciente
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Acesse sua conta para gerenciar consultas e acompanhar seu progresso
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg 
                    className="h-5 w-5 text-red-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    {decodeURIComponent(error)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-white shadow-xl rounded-2xl px-8 py-10 border border-gray-100">
            <Suspense fallback={<PortalLoadingSpinner />}>
              <PatientLoginForm 
                initialClinicCode={clinic}
                redirectUrl={redirect}
              />
            </Suspense>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <p>
              Problemas para acessar? Entre em contato com a clínica
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a 
                href="/portal/help" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ajuda
              </a>
              <span>•</span>
              <a 
                href="/privacy" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Privacidade
              </a>
              <span>•</span>
              <a 
                href="/terms" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Termos
              </a>
            </div>
          </div>
        </div>

        {/* Install Prompt Placeholder */}
        <div id="install-prompt-container" className="fixed bottom-4 left-4 right-4 z-50"></div>
      </div>
    </div>
  )
}