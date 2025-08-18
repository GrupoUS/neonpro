'use client';

import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toastHelpers } from '@/lib/toast-helpers';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        if (error.message.includes('Invalid')) {
          toastHelpers.error.validation('Email ou senha incorretos');
        } else {
          toastHelpers.error.generic();
        }
      } else if (data?.user) {
        toastHelpers.success.login();
        // Redirect will be handled by auth context
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login');
      toastHelpers.error.network();
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError(error.message);
        toastHelpers.error.generic();
      }
      // Redirect will be handled by OAuth flow
    } catch (err) {
      toastHelpers.error.network();
      setError('Erro inesperado ao fazer login com Google');
      console.error('Google login error:', err);
    }
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center font-bold text-2xl">
          Entrar no NeonPro
        </CardTitle>
        <CardDescription className="text-center">
          Digite seus dados para acessar sua conta
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              className="w-full"
              disabled={loading || isSubmitting}
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                className="w-full pr-10"
                disabled={loading || isSubmitting}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <Button
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                disabled={loading || isSubmitting}
                onClick={() => setShowPassword(!showPassword)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={loading || isSubmitting || !email || !password}
            type="submit"
          >
            {isSubmitting || loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={loading || isSubmitting}
          onClick={handleGoogleLogin}
          type="button"
          variant="outline"
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Continuar com Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Button
            className="h-auto p-0 font-normal"
            disabled={loading || isSubmitting}
            onClick={() => router.push('/signup')}
            type="button"
            variant="link"
          >
            Criar conta
          </Button>
        </div>

        <div className="text-center">
          <Button
            className="h-auto p-0 font-normal text-muted-foreground text-sm"
            disabled={loading || isSubmitting}
            onClick={() => router.push('/auth/forgot-password')}
            type="button"
            variant="link"
          >
            Esqueceu a senha?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
