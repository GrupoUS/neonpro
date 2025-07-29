// app/login/page.tsx
"use client";

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
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// Corrigindo importações para usar o contexto de autenticação
import { SignInWithGooglePopupButton } from "@/components/auth/google-popup-button";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usando contexto de autenticação em vez de cliente direto
  const { user, signIn } = useAuth();

  // Verifica se o usuário já está logado
  useEffect(() => {
    console.log("🔄 Login page - checking user state:", !!user);
    if (user) {
      console.log("✅ User detected in login page, redirecting to dashboard");
      router.push("/dashboard");
    } else {
      console.log("❌ No user detected in login page");
    }
  }, [user, router]);

  // Função para login com email e senha usando contexto
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError("Erro ao fazer login: " + error.message);
      } else {
        // Redirecionamento será feito automaticamente pelo useEffect
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Botão de alternância de tema no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login - NEON PRO</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar sua clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Exibir erro se houver */}
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Usando componente robusto de login Google com popup */}
            <SignInWithGooglePopupButton
              text="Entrar com Google"
              loadingText="Carregando..."
              className="w-full"
              disabled={loading}
            />

            <Separator className="my-2" />
            <form onSubmit={handleSignIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Carregando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/signup" className="underline">
                Criar conta
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
