"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { SignInWithGooglePopupButton } from "@/components/auth/google-popup-button";
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
  const { signIn, user, loading } = useAuth();

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

  // Redirect when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = getRedirectUrl();
      toast.success("Login realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast.error("Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
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
      <div className="flex items-center justify-center min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 bg-background">
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
                    className="h-11"
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
                    className="h-11"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fazendo login...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <SignInWithGooglePopupButton
                text="Entrar com Google"
                disabled={isLoading}
              />

              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Criar conta gratuita
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-lg">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm">
                <span className="text-3xl font-bold text-primary">NP</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Bem-vindo ao NEON PRO!
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A plataforma completa para gestão da sua clínica de estética.
              Gerencie agendamentos, pacientes e faturamento em um só lugar.
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
