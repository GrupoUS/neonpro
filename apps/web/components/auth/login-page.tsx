/**
 * 🔐 Login Page Component - NeonPro Healthcare
 * ===========================================
 *
 * Login page component for TanStack Router integration
 * with existing authentication system.
 */

"use client";

import { LoginForm } from "@/app/login/login-form";
import { useSearch } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function LoginPage() {
  const search = useSearch({ from: "/login" });
  const redirectUrl = search?.redirect;

  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center font-medium text-lg">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          NeonPro
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Sistema completo de gestão para clínicas estéticas com compliance LGPD, ANVISA
              e CFM integrado.&rdquo;
            </p>
            <footer className="text-sm">Equipe NeonPro Healthcare</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="font-semibold text-2xl tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-muted-foreground text-sm">
              Digite suas credenciais para continuar
              {redirectUrl && (
                <span className="mt-1 block text-xs">
                  Você será redirecionado após o login
                </span>
              )}
            </p>
          </div>
          <LoginForm redirectUrl={redirectUrl} />
          <p className="px-8 text-center text-muted-foreground text-sm">
            Ao clicar em continuar, você concorda com nossos{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/terms"
            >
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a
              className="underline underline-offset-4 hover:text-primary"
              href="/privacy"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
