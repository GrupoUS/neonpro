'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function SignUpPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="font-bold text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Use sua conta Google para acessar o NeonPro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-blue-50 p-4 text-center text-slate-600 text-sm dark:bg-blue-950 dark:text-slate-400">
            <p className="mb-2 font-medium">Sistema Simplificado</p>
            <p>
              O NeonPro agora usa autenticação com Google OAuth. Não é
              necessário criar uma conta separada.
            </p>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link
              className="flex items-center justify-center gap-2"
              href="/login"
            >
              Fazer Login com Google
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="text-center text-slate-500 text-xs dark:text-slate-400">
            <p>
              Ao fazer login, você concorda com nossos{' '}
              <Link className="text-blue-600 hover:underline" href="/terms">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link className="text-blue-600 hover:underline" href="/privacy">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
