'use client';

import { useAuth } from '@/contexts/auth-context';
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Use sua conta Google para acessar o NeonPro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border">
            <p className="font-medium mb-2">Sistema Simplificado</p>
            <p>
              O NeonPro agora usa autenticação com Google OAuth. Não é
              necessário criar uma conta separada.
            </p>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2"
            >
              Fazer Login com Google
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            <p>
              Ao fazer login, você concorda com nossos{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
