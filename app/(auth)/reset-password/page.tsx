'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle, Heart, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Validation schema for password reset
const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement password reset API call
      console.log('Password reset for:', data.email);

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
      setError(
        'Ocorreu um erro ao enviar o email de redefinição. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      setIsLoading(true);
      try {
        // TODO: Implement resend email API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Show success message
      } catch (error) {
        setError('Erro ao reenviar email. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
                NeonPro
              </span>
            </div>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <CardTitle className="font-bold text-2xl text-gray-900">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Verifique sua caixa de entrada para redefinir sua senha
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <p className="text-gray-600 text-sm">
                Enviamos um link de redefinição de senha para:
              </p>
              <p className="rounded-lg bg-gray-50 p-3 font-medium text-gray-900">
                {getValues('email')}
              </p>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="text-blue-800 text-sm">
                    <p className="mb-1 font-medium">
                      Verifique também sua pasta de spam
                    </p>
                    <p>O email pode levar alguns minutos para chegar.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full"
                disabled={isLoading}
                onClick={handleResendEmail}
                variant="outline"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    <span>Reenviando...</span>
                  </div>
                ) : (
                  'Reenviar Email'
                )}
              </Button>

              <Button asChild className="w-full" variant="ghost">
                <Link className="flex items-center space-x-2" href="/login">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar para o login</span>
                </Link>
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-2xl text-transparent">
              NeonPro
            </span>
          </div>
          <CardTitle className="font-bold text-2xl text-gray-900">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite seu email para receber um link de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label
                className="font-medium text-gray-700 text-sm"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                autoFocus
                className={errors.email ? 'border-red-500' : ''}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 font-medium text-white hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Enviar Link de Redefinição</span>
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4 border-gray-200 border-t pt-6 text-center">
            <p className="text-gray-600 text-sm">
              Lembrou da senha?{' '}
              <Link
                className="font-medium text-blue-600 hover:underline"
                href="/login"
              >
                Fazer login
              </Link>
            </p>

            <p className="text-gray-600 text-sm">
              Não tem uma conta?{' '}
              <Link
                className="font-medium text-blue-600 hover:underline"
                href="/register"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
