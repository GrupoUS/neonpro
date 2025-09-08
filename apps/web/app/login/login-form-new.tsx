'use client'

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Checkbox, } from '@/components/ui/checkbox'
import { Icons, } from '@/components/ui/icons'
import { Input, } from '@/components/ui/input'
import { Label, } from '@/components/ui/label'
import { useAuth, } from '@/contexts/auth-context-new'
import { AlertCircle, Eye, EyeOff, Lock, Shield, UserCheck, } from 'lucide-react'
import Link from 'next/link'
import { useRouter, } from 'next/navigation'
import { useEffect, useState, } from 'react'

export function LoginForm() {
  const [email, setEmail,] = useState('',)
  const [password, setPassword,] = useState('',)
  const [rememberMe, setRememberMe,] = useState(false,)
  const [showPassword, setShowPassword,] = useState(false,)
  const [error, setError,] = useState<string | null>(null,)
  const [isSubmitting, setIsSubmitting,] = useState(false,)
  const [successMessage, setSuccessMessage,] = useState<string | null>(null,)

  const { signIn, loading, isAuthenticated, } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard',)
    }
  }, [isAuthenticated, loading, router,],)

  const handleSubmit = async (e: React.FormEvent,) => {
    e.preventDefault()
    setError(null,)
    setSuccessMessage(null,)
    setIsSubmitting(true,)

    try {
      const response = await signIn(email, password, rememberMe,)

      if (response.success && response.user) {
        setSuccessMessage('Login realizado com sucesso! Redirecionando...',)

        // Clear form
        setEmail('',)
        setPassword('',)
        setRememberMe(false,)

        // Redirect will be handled by auth context
      } else {
        setError(response.error || 'Falha na autenticação',)
      }
    } catch (err) {
      console.error('Login error:', err,)
      setError('Erro inesperado. Tente novamente.',)
    } finally {
      setIsSubmitting(false,)
    }
  }

  const isFormValid = email && password && !isSubmitting && !loading

  return (
    <Card className="neonpro-card w-full max-w-md shadow-lg">
      <CardHeader className="space-y-3 text-center pb-6">
        <div className="flex justify-center">
          <div className="neonpro-gradient neonpro-glow flex h-12 w-12 items-center justify-center rounded-xl mb-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <CardTitle className="font-bold text-foreground text-2xl">
          Acesso Seguro
        </CardTitle>

        <CardDescription className="text-muted-foreground">
          Sistema de Gestão Médica - Conformidade LGPD & HIPAA
        </CardDescription>

        {/* Healthcare Security Indicators */}
        <div className="flex justify-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>SSL</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserCheck className="h-3 w-3" />
            <span>2FA</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>LGPD</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <UserCheck className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Profissional
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="profissional@clinica.com.br"
              value={email}
              onChange={(e,) => setEmail(e.target.value,)}
              disabled={loading || isSubmitting}
              required
              className="w-full"
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha Segura
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha segura"
                value={password}
                onChange={(e,) => setPassword(e.target.value,)}
                disabled={loading || isSubmitting}
                required
                className="w-full pr-10"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword,)}
                disabled={loading || isSubmitting}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                  : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          {/* Remember Me & Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked,) => setRememberMe(checked === true,)}
                disabled={loading || isSubmitting}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Manter conectado (30 dias)
              </Label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-medium"
              tabIndex={loading || isSubmitting ? -1 : 0}
            >
              Esqueci a senha
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="neonpro-button-primary w-full h-11"
            disabled={!isFormValid}
          >
            {isSubmitting || loading
              ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              )
              : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Acessar Sistema
                </>
              )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou
            </span>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="space-y-3">
          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Não tem uma conta?{' '}
            </span>
            <Link
              href="/signup"
              className="text-sm font-semibold text-primary hover:text-primary/80"
              tabIndex={loading || isSubmitting ? -1 : 0}
            >
              Criar conta gratuita
            </Link>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <Link
              href="/support"
              className="text-xs text-muted-foreground hover:text-foreground"
              tabIndex={loading || isSubmitting ? -1 : 0}
            >
              Precisa de ajuda? Contate o suporte técnico
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="pt-4 border-t border-muted">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p className="font-medium">🔒 Ambiente Seguro</p>
            <p>
              Dados protegidos com criptografia AES-256<br />
              Conformidade total com LGPD, CFM e ANVISA
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading state component for when auth is initializing
export function LoginFormSkeleton() {
  return (
    <Card className="neonpro-card w-full max-w-md">
      <CardHeader className="space-y-3 text-center pb-6">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mx-auto" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-full bg-muted rounded animate-pulse" />
        </div>

        <div className="h-11 w-full bg-muted rounded animate-pulse" />

        <div className="flex justify-center">
          <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
