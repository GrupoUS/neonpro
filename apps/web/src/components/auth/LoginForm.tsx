import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Chrome, Loader2, Lock, Mail, Shield, Sparkles, Stethoscope } from 'lucide-react';
import { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data && (data as any).user) {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          router.navigate({ to: '/dashboard' });
        }, 1200);
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await (async () => {
        // Use centralized helper to ensure proper callback + next handling
        const { signInWithProvider } = await import('@/integrations/supabase/client');
        return signInWithProvider('google', '/dashboard');
      })();

      if (error) {
        setError(error.message);
      }
    } catch {
      setError('Erro ao conectar com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className='w-full shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm'>
      <CardHeader className='text-center space-y-6 pb-8'>
        <div className='flex items-center justify-center mb-2'>
          <div className='relative p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/20'>
            <div className='flex items-center gap-2 text-primary'>
              <Stethoscope className='h-8 w-8' />
              <Sparkles className='h-6 w-6' />
            </div>
            <div className='absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse' />
          </div>
        </div>
        <div className='space-y-3'>
          <CardTitle className='text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent'>
            NEON PRO
          </CardTitle>
          <CardDescription className='text-base text-muted-foreground font-medium'>
            Sistema especializado para clínicas de estética
          </CardDescription>
          <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
            <span>Plataforma AI-First para profissionais brasileiros</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Google Sign In Button */}
        <Button
          type='button'
          variant='outline'
          className='w-full h-14 text-base font-semibold border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md'
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading
            ? (
              <>
                <Loader2 className='mr-3 h-5 w-5 animate-spin text-primary' />
                <span className='text-muted-foreground'>Conectando com Google...</span>
              </>
            )
            : (
              <>
                <Chrome className='mr-3 h-5 w-5 text-[#4285f4]' />
                <span className='text-foreground'>Entrar com Google</span>
              </>
            )}
        </Button>

        {/* Divider */}
        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t border-border/60' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-card px-6 py-1 text-muted-foreground font-medium rounded-full border border-border/30'>
              Ou continue com e-mail
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-4'>
            <Label
              htmlFor='email'
              className='text-sm font-semibold text-foreground flex items-center gap-2'
            >
              <Mail className='h-4 w-4 text-primary' />
              E-mail Profissional
            </Label>
            <div className='relative group'>
              <Input
                id='email'
                type='email'
                placeholder='seu.email@clinica.com.br'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='h-14 text-base border-2 border-border focus:border-primary/70 hover:border-primary/30 transition-all duration-200 rounded-lg bg-background/50 backdrop-blur-sm pl-4 pr-4'
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </div>

          <div className='space-y-4'>
            <Label
              htmlFor='password'
              className='text-sm font-semibold text-foreground flex items-center gap-2'
            >
              <Lock className='h-4 w-4 text-primary' />
              Senha
            </Label>
            <div className='relative group'>
              <Input
                id='password'
                type='password'
                placeholder='Digite sua senha'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='h-14 text-base border-2 border-border focus:border-primary/70 hover:border-primary/30 transition-all duration-200 rounded-lg bg-background/50 backdrop-blur-sm pl-4 pr-4'
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </div>

          {error && (
            <Alert variant='destructive' className='border-destructive/50 bg-destructive/10'>
              <AlertDescription className='text-sm font-medium'>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className='border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'>
              <AlertDescription className='text-sm font-medium'>{success}</AlertDescription>
            </Alert>
          )}

          <Button
            type='submit'
            className='w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/90 hover:via-primary/85 hover:to-primary/80 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading
              ? (
                <>
                  <Loader2 className='mr-3 h-5 w-5 animate-spin' />
                  <span>Entrando...</span>
                </>
              )
              : (
                <>
                  <Stethoscope className='mr-3 h-5 w-5' />
                  <span>Entrar no Sistema</span>
                </>
              )}
          </Button>
        </form>

        {/* Forgot Password */}
        <div className='text-center'>
          <Button
            variant='link'
            className='text-sm text-muted-foreground hover:text-primary transition-colors p-0 h-auto font-medium'
          >
            Esqueceu sua senha?
          </Button>
        </div>

        {/* Security & Compliance Footer */}
        <div className='mt-8 pt-6 border-t border-border/30'>
          <div className='text-center space-y-5'>
            <p className='text-sm font-semibold text-foreground'>
              Sistema seguro para profissionais de saúde
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm'>
                <Shield className='h-4 w-4 text-primary' />
                <span className='font-bold text-xs text-primary'>LGPD Compliant</span>
              </div>
              <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 shadow-sm'>
                <Stethoscope className='h-4 w-4 text-primary' />
                <span className='font-bold text-xs text-primary'>CFM Validated</span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-xs text-muted-foreground font-medium'>
                Plataforma especializada em clínicas de estética brasileiras
              </p>
              <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                <div className='w-1.5 h-1.5 bg-primary rounded-full animate-pulse' />
                <span>Tecnologia AI-First • Segurança Máxima • Compliance Total</span>
                <div className='w-1.5 h-1.5 bg-primary rounded-full animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
