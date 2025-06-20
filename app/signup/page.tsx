
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

function SignupContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle, user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email já está cadastrado. Faça login.");
        } else {
          toast.error("Erro ao criar conta. Tente novamente.");
        }
      } else {
        toast.success("Conta criada com sucesso! Verifique seu email.");
      }
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Erro ao criar conta com Google.");
      }
    } catch (error) {
      toast.error("Erro ao criar conta com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm rounded-2xl shadow-lg">
          <CardHeader>
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NEON PRO
              </h1>
            </div>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
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

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
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

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-background text-foreground rounded-lg"
                onClick={handleGoogleSignup}
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : "Criar conta com Google"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/" className="underline text-primary hover:text-primary/80">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/spectral-dark-bg.jpg"
          alt="Spectral Dark Background"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Junte-se ao NEON PRO!</h2>
            <p className="text-lg">
              Transforme a gestão da sua clínica de estética.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupContent />
    </AuthProvider>
  );
}
