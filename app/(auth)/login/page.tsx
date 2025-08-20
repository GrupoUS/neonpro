'use client';

import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Erro ao fazer login' });
        return;
      }

      // Store token and redirect
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (error) {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <div className="h-6 w-6 rounded-sm bg-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">NeonPro</CardTitle>
            <CardDescription>
              Faça login em sua clínica estética
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-destructive text-sm">{errors.general}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className={cn(
                    'pl-10',
                    errors.email &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoading}
                  onChange={handleInputChange('email')}
                  placeholder="seu@email.com"
                  type="email"
                  value={formData.email}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className={cn(
                    'pr-10 pl-10',
                    errors.password &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoading}
                  onChange={handleInputChange('password')}
                  placeholder="Sua senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                />
                <button
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                className="text-primary text-sm hover:underline"
                href="/forgot-password"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Não tem uma conta?{' '}
                <Link className="text-primary hover:underline" href="/register">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
