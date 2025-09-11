import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Chrome, Loader2, Lock, Mail, Shield, Sparkles, Stethoscope } from 'lucide-react';
import { useState } from 'react';

export function LoginForm() {
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
      } else if (data.user) {
        setSuccess('Login realizado com sucesso! Redirecionando...');
        // In a real app, you would redirect to the dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err) {
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className='w-full shadow-2xl border-0 bg-card/95 backdrop-blur-sm'>
      <CardHeader className='space-y-6 pb-8'>
        <div className='flex items-center justify-center mb-2'>
          <div className='relative'>
            <div className='flex items-center gap-3 text-primary'>
              <div className='relative'>
                <Stethoscope className='h-8 w-8' />
                <Sparkles className='h-4 w-4 absolute -top-1 -right-1 text-accent-foreground' />
              </div>
              <Shield className='h-6 w-6' />
            </div>
          </div>
        </div>
        <div className='text-center space-y-2'>
          <CardTitle className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
            Acesso Profissional
          </CardTitle>
          <CardDescription className='text-muted-foreground text-base'>
            Sistema especializado para clínicas de estética
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Google Sign In Button */}
        <Button
          type='button'
          variant='outline'
          className='w-full h-12 text-base font-medium border-2 hover:bg-accent/50 transition-all duration-200'
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading
            ? (
              <>
                <Loader2 className='mr-3 h-5 w-5 animate-spin' />
                Conectando com Google...
              </>
            )
            : (
              <>
                <Chrome className='mr-3 h-5 w-5 text-[#4285f4]' />
                Entrar com Google
              </>
            )}
        </Button>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t border-border' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-card px-4 text-muted-foreground font-medium'>
              Ou continue com e-mail
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-3'>
            <Label htmlFor='email' className='text-sm font-semibold text-foreground'>
              E-mail Profissional
            </Label>
            <div className='relative'>
              <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='email'
                type='email'
                placeholder='seu.email@clinica.com.br'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors'
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
          </div>

          <div className='space-y-3'>
            <Label htmlFor='password' className='text-sm font-semibold text-foreground'>
              Senha
            </Label>
            <div className='relative'>
              <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='password'
                type='password'
                placeholder='Digite sua senha'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors'
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
            className='w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl'
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading
              ? (
                <>
                  <Loader2 className='mr-3 h-5 w-5 animate-spin' />
                  Entrando...
                </>
              )
              : (
                <>
                  <Stethoscope className='mr-3 h-5 w-5' />
                  Entrar no Sistema
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
        <div className='mt-8 pt-6 border-t border-border/50'>
          <div className='text-center space-y-4'>
            <p className='text-sm font-medium text-foreground'>
              Sistema seguro para profissionais de saúde
            </p>
            <div className='flex items-center justify-center gap-6 text-xs'>
              <div className='flex items-center gap-2 px-3 py-2 rounded-full bg-accent/30 border border-accent/50'>
                <Shield className='h-4 w-4 text-primary' />
                <span className='font-semibold text-accent-foreground'>LGPD Compliant</span>
              </div>
              <div className='flex items-center gap-2 px-3 py-2 rounded-full bg-accent/30 border border-accent/50'>
                <Stethoscope className='h-4 w-4 text-primary' />
                <span className='font-semibold text-accent-foreground'>CFM Validated</span>
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Plataforma especializada em clínicas de estética brasileiras
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
