// app/login/test-page.tsx - TEMPORARY TEST PAGE
"use client";

import { SignInWithGooglePopupButton } from "@/components/auth/google-popup-button";
import { SignInWithGooglePopupButton as TestButton } from "@/components/auth/google-popup-button-test";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginTestPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Verifica se o usuário já está logado
  useEffect(() => {
    console.log("🔄 Login test page - checking user state:", !!user);
    if (user) {
      console.log("✅ User detected, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            🧪 Teste do Google OAuth
          </CardTitle>
          <CardDescription className="text-center">
            Testando configuração de login com Google via popup
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações sobre o teste */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="text-sm text-yellow-800">
              <strong>🔧 Status da Configuração:</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>✅ Componente popup implementado</li>
                <li>✅ Context de auth configurado</li>
                <li>✅ Callback handler criado</li>
                <li>⚠️ Credenciais do Google: placeholders</li>
                <li>⚠️ Provider Google: não configurado</li>
              </ul>
            </div>
          </div>

          {/* Teste com mock */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              1. Teste Mock (Simulação):
            </label>
            <TestButton />
          </div>

          <Separator />

          {/* Teste real (irá falhar sem credenciais) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              2. Teste Real (Requer credenciais):
            </label>
            <SignInWithGooglePopupButton />
          </div>

          <Separator />

          {/* Links úteis */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              <strong>Links úteis:</strong>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <Button variant="outline" size="sm" asChild>
                <Link href="http://127.0.0.1:54323" target="_blank">
                  📊 Supabase Studio Local
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">🏠 Dashboard (se logado)</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">🔙 Página de Login Normal</Link>
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <strong>📋 Próximos Passos:</strong>
              <ol className="mt-2 space-y-1 text-xs list-decimal list-inside">
                <li>Configure Google Cloud Console</li>
                <li>Adicione credenciais reais no .env.local</li>
                <li>
                  Reinicie Supabase: <code>npx supabase restart</code>
                </li>
                <li>Habilite provider Google no Studio</li>
                <li>Teste o botão "Teste Real"</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
