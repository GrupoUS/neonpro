"use client";

import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Separator } from "@/components/ui/separator";
import type { useAuth } from "@/contexts/auth-context";
import type { Eye, EyeOff, Mail } from "lucide-react";
import type { useState } from "react";
import type { toast } from "sonner";
import type { SignInWithGooglePopupButton } from "./google-popup-button";

interface AuthWithFallbackProps {
  onSuccess?: () => void;
  showSignUp?: boolean;
  className?: string;
}

export function AuthWithFallback({
  onSuccess,
  showSignUp = false,
  className = "",
}: AuthWithFallbackProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const { signIn, signUp } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      toast.error("Senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const startTime = Date.now();

      const { error } =
        authMode === "signup" ? await signUp(email, password) : await signIn(email, password);

      const totalTime = Date.now() - startTime;

      if (error) {
        // Enhanced error messages
        let errorMessage = "Erro na autenticação";

        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message?.includes("User already registered")) {
          errorMessage = "Este email já está cadastrado";
        } else if (error.message?.includes("Password should be")) {
          errorMessage = "Senha deve ter pelo menos 6 caracteres";
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = "Email inválido";
        } else if (error.message?.includes("rate limit")) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
        }

        toast.error(errorMessage);
        return;
      }

      // Success feedback
      const action = authMode === "signup" ? "cadastro" : "login";
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} realizado com sucesso!`);

      // Performance feedback
      if (totalTime <= 2000) {
        console.log(`✅ Email auth completed in ${totalTime}ms`);
      } else {
        console.warn(`⚠️ Email auth took ${totalTime}ms`);
      }

      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary OAuth Option */}
      <div className="space-y-3">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Acesso Rápido</h3>
          <p className="text-sm text-gray-600">Recomendado para melhor experiência</p>
        </div>

        <SignInWithGooglePopupButton
          text="Continuar com Google"
          onSuccess={onSuccess}
          className="w-full h-12 text-base font-medium"
        />
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou continue com email</span>
        </div>
      </div>

      {/* Fallback Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {authMode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              {authMode === "signup" ? "Criando conta..." : "Entrando..."}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {authMode === "signup" ? "Criar conta" : "Entrar"}
            </>
          )}
        </Button>
      </form>

      {/* Auth Mode Toggle */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={toggleAuthMode}
          disabled={isLoading}
          className="text-sm"
        >
          {authMode === "signup"
            ? "Já tem uma conta? Fazer login"
            : showSignUp
              ? "Não tem uma conta? Criar conta"
              : ""}
        </Button>
      </div>

      {/* Performance Note */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>
          💡 <strong>Google OAuth</strong>: ~2-3 segundos
        </p>
        <p>
          📧 <strong>Email/Senha</strong>: Alternativa segura
        </p>
      </div>
    </div>
  );
}
