"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle, user, loading } = useAuth();

  // Get redirect URL and messages from query params
  const getRedirectUrl = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("redirectTo") || "/dashboard";
    }
    return "/dashboard";
  };

  const getMessage = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("message");
    }
    return null;
  };

  // Show message if coming from signup
  useEffect(() => {
    const message = getMessage();
    if (message === "check-email") {
      toast.success("Verifique seu email para confirmar sua conta!");
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = getRedirectUrl();
      router.push(redirectUrl);
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
      } else {
        toast.success("Login realizado com sucesso!");
        const redirectUrl = getRedirectUrl();
        router.push(redirectUrl);
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Chama signInWithGoogle do AuthContext
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error(`Erro ao fazer login com Google: ${error.message}`);
        console.error("Google Sign-In Error from AuthContext:", error);
      }
      // O redirecionamento para o Google é tratado dentro de signInWithGoogle
      // e o redirecionamento após o callback é tratado em /auth/callback
    } catch (error: any) {
      toast.error(
        `Erro inesperado ao fazer login com Google: ${error.message}`
      );
      console.error("Unexpected Google Sign-In Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading && !user) {
    // Mostrar loading apenas se não houver usuário e estiver carregando
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="w-full rounded-2xl shadow-2xl border-0 bg-card/95 backdrop-blur-sm p-8">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NEON PRO
                </h1>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                Login
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Digite seu email abaixo para fazer login
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Fazendo login..." : "Entrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background text-foreground rounded-lg"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Aguarde..." : "Entrar com Google"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="underline text-primary hover:text-primary/80"
                >
                  Criar conta
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <img
          src="/spectral-dark-bg.jpg"
          alt="Spectral Dark Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Bem-vindo ao NEON PRO!</h2>
            <p className="text-lg">
              A plataforma completa para gestão da sua clínica de estética.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
