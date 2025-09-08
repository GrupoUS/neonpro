"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent, /*, CardDescription, CardHeader, CardTitle*/
} from "@/components/ui/card"; // CardDescription, CardHeader, CardTitle unused imports
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRealAuthContext } from "@/contexts/RealAuthContext";
import { toastHelpers } from "@/lib/toast-helpers";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RealLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading, error, isAuthenticated, clearError } = useRealAuthContext();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, mfaCode, error, clearError]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      const result = await login({
        email: email.trim(),
        password,
        ...(mfaCode && { mfaCode: mfaCode.trim() }),
      });

      if (result.success) {
        toastHelpers.success.login();
        router.push("/dashboard");
      } else if ((result as any).requiresMfa) {
        setShowMfaInput(true);
        toastHelpers.info("Por favor, insira seu código de autenticação de dois fatores");
      } else {
        // Error is handled by the context
        if (result.error?.includes("Invalid") || result.error?.includes("credentials")) {
          toastHelpers.error.validation("Email ou senha incorretos");
        } else if (result.error?.includes("locked")) {
          toastHelpers.error.generic(
            "Conta temporariamente bloqueada. Tente novamente mais tarde.",
          );
        } else if (result.error?.includes("MFA")) {
          toastHelpers.error.validation("Código MFA inválido");
        } else {
          toastHelpers.error.generic();
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toastHelpers.error.network();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    toastHelpers.info("Login social em desenvolvimento. Use email e senha por enquanto.");
  };

  const isFormValid = email.trim() && password && (!showMfaInput || mfaCode.trim());
  const buttonText = isSubmitting ? "Entrando..." : "Entrar";

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          Entrar na sua conta
        </h1>
        <p className="text-muted-foreground text-sm">
          Digite seu email e senha para acessar o sistema
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@clinica.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* MFA Input - Only shown when required */}
            {showMfaInput && (
              <div className="space-y-2">
                <Label htmlFor="mfaCode">Código de Autenticação</Label>
                <Input
                  id="mfaCode"
                  type="text"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  disabled={isSubmitting || isLoading}
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <p className="text-muted-foreground text-xs">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {buttonText}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isLoading}
          >
            <div className="mr-2 h-4 w-4">
              <Icons.google />
            </div>
            Google (Em breve)
          </Button>
        </CardContent>
      </Card>

      {/* Registration Link */}
      <p className="px-8 text-center text-muted-foreground text-sm">
        Não tem uma conta?{" "}
        <Button
          variant="link"
          className="p-0 font-normal underline underline-offset-4 hover:text-primary"
          onClick={() => router.push("/auth/cadastrar")}
        >
          Cadastre-se aqui
        </Button>
      </p>

      {/* Forgot Password Link */}
      <p className="px-8 text-center text-muted-foreground text-sm">
        Esqueceu sua senha?{" "}
        <Button
          variant="link"
          className="p-0 font-normal underline underline-offset-4 hover:text-primary"
          onClick={() => toastHelpers.info("Recuperação de senha em desenvolvimento")}
        >
          Clique aqui
        </Button>
      </p>

      {/* Development Notice - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="rounded-md bg-blue-50 p-4 text-center dark:bg-blue-950">
          <p className="text-blue-700 text-xs dark:text-blue-300">
            🚧 <strong>Modo Desenvolvimento:</strong>{" "}
            Usando sistema de autenticação real integrado com Supabase
          </p>
        </div>
      )}
    </div>
  );
}
