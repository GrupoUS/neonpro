/**
 * @file Login Route
 * 
 * Authentication login page with email/password and OAuth
 * Uses Supabase Auth with proper redirect handling
 * Updated with shadcn/ui components and NeonPro branding
 * 
 * @version 2.0.0
 * @author NeonPro Platform Team
 */

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext.ts'
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription } from '@/components/ui/index.tsx'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const { signIn, signInWithOAuth, isAuthenticated, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if user was redirected from registration
  const urlParams = new URLSearchParams(window.location.search)
  const wasRegistered = urlParams.get('registered') === 'true'

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn({ email, password })
      
      if (result.error) {
        setError(result.error.message)
      }
      // Success redirect handled by AuthContext
    } catch (err) {
      setError('Erro inesperado durante o login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithOAuth('google', '/dashboard')
      
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
      }
      // OAuth redirect happens automatically
    } catch (err) {
      setError('Erro inesperado durante o login com Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neonpro-background p-4">
      <Card className="w-full max-w-md" variant="neonpro">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-neonpro-deep-blue">
            Entre na sua conta
          </CardTitle>
          <CardDescription className="text-neonpro-deep-blue/70">
            NeonPro - Plataforma de Gestão Estética
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {wasRegistered && (
            <Alert variant="default" className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Conta criada com sucesso! Faça login para acessar sua conta.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* OAuth Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="neonpro-medical"
            size="touch"
            className="w-full"
          >
            {loading ? 'Carregando...' : 'Continuar com Google'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neonpro-neutral/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-neonpro-deep-blue/60">ou</span>
            </div>
          </div>
          
          {/* Email/Password Login */}
          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="text-accessible-base"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="text-accessible-base"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              variant="neonpro"
              size="touch"
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar com Email'}
            </Button>
          </form>
          
          <div className="text-center">
            <a 
              href="/auth/signup" 
              className="text-neonpro-primary hover:text-neonpro-accent transition-colors text-accessible-sm"
            >
              Não tem conta? Cadastre-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}