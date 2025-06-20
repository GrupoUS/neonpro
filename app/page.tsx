"use client";

// Login page with two-column layout and background
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Simular login por email
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Simular login com Google
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Login com Google realizado!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao fazer login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 relative">
      {/* Theme Toggle - Fixed position */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Login Form Column */}
      <div className="flex items-center justify-center min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="w-full rounded-2xl shadow-2xl border-0 bg-card/95 backdrop-blur-sm p-8">
            <CardHeader className="space-y-1 text-center pb-6">
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
                    placeholder="m@example.com"
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
                  {isLoading ? "Fazendo login..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-background text-foreground rounded-lg"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Aguarde..." : "Login com Google"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Não tem uma conta?{" "}
                <Link href="/signup" className="underline">
                  Criar conta
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Background Image Column */}
      <div className="hidden bg-muted lg:block relative">
        <img
          src="/spectral-dark-bg.jpg"
          alt="Spectral Dark Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h2>
            <p className="text-lg">
              Acesse sua conta e continue sua jornada conosco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
