'use client';

import { useSignUp } from '@clerk/nextjs';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@neonpro/ui';
import { Check, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState('basic');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    // Validations
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('Você deve aceitar os termos de serviço.');
      setIsLoading(false);
      return;
    }

    if (!lgpdConsent) {
      setError('Você deve consentir com o tratamento de dados conforme LGPD.');
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          companyName,
          plan,
          lgpdConsent: true,
          termsAccepted: true,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || 'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Código de verificação inválido.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader>
              <CardTitle>Verificar Email</CardTitle>
              <CardDescription>
                Enviamos um código de verificação para {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleVerify}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code">Código de Verificação</Label>
                  <Input
                    disabled={isLoading}
                    id="code"
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Digite o código de 6 dígitos"
                    required
                    value={code}
                  />
                </div>

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Verificando...' : 'Verificar Email'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          NeonPro
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Plataforma completa de gestão empresarial com foco em
              saúde, compliance e experiência do usuário.&rdquo;
            </p>
            <footer className="text-sm">Equipe NeonPro</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              Criar conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Preencha os dados para começar
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cadastro</CardTitle>
              <CardDescription>Crie sua conta NeonPro</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      disabled={isLoading}
                      id="firstName"
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="João"
                      required
                      value={firstName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      disabled={isLoading}
                      id="lastName"
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Silva"
                      required
                      value={lastName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    disabled={isLoading}
                    id="companyName"
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Minha Empresa Ltda"
                    required
                    value={companyName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    disabled={isLoading}
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select
                    disabled={isLoading}
                    onValueChange={setPlan}
                    value={plan}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico - R$ 99/mês</SelectItem>
                      <SelectItem value="professional">
                        Profissional - R$ 199/mês
                      </SelectItem>
                      <SelectItem value="enterprise">
                        Enterprise - R$ 399/mês
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite uma senha forte"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                    <Button
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      disabled={isLoading}
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
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      id="confirmPassword"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite a senha novamente"
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                    />
                    <Button
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      disabled={isLoading}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={termsAccepted}
                      disabled={isLoading}
                      id="terms"
                      onCheckedChange={setTermsAccepted}
                    />
                    <div className="text-sm">
                      <Label className="cursor-pointer" htmlFor="terms">
                        Aceito os{' '}
                        <a
                          className="underline hover:text-primary"
                          href="/terms"
                        >
                          Termos de Serviço
                        </a>{' '}
                        e{' '}
                        <a
                          className="underline hover:text-primary"
                          href="/privacy"
                        >
                          Política de Privacidade
                        </a>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={lgpdConsent}
                      disabled={isLoading}
                      id="lgpd"
                      onCheckedChange={setLgpdConsent}
                    />
                    <div className="text-sm">
                      <Label className="cursor-pointer" htmlFor="lgpd">
                        <Shield className="mr-1 inline h-4 w-4" />
                        Consinto com o tratamento dos meus dados pessoais
                        conforme a{' '}
                        <a
                          className="underline hover:text-primary"
                          href="/lgpd"
                        >
                          Lei Geral de Proteção de Dados (LGPD)
                        </a>
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={isLoading || !termsAccepted || !lgpdConsent}
                  type="submit"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>

                <div className="text-center">
                  <a
                    className="text-muted-foreground text-sm underline underline-offset-4 hover:text-primary"
                    href="/login"
                  >
                    Já tem uma conta? Entre aqui
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center space-x-2 text-green-800">
              <Check className="h-4 w-4" />
              <span className="font-medium text-sm">
                Ambiente seguro e compatível com LGPD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
