// app/login/page.tsx
"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Chrome } from "lucide-react" // Usando um ícone genérico para o Google
import { createClient } from "@/app/utils/supabase/client"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  // Comentário: Instancia o cliente Supabase do lado do cliente para interações de UI.
  const supabase = createClient()

  // Comentário: Função para lidar com o login via Google.
  // Utiliza signInWithOAuth, que gerencia o fluxo de popup/redirect de forma otimizada.
  // O redirecionamento para /dashboard é tratado pela rota de callback.
  const handleLoginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // URL para onde o Supabase deve redirecionar após o login no Google.
        // Esta é a nossa rota de callback que criamos.
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  // Placeholder para a função de login com email e senha
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Lógica de login com email/senha aqui
    // ...
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login - NEON PRO</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar sua clínica.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Comentário: Botão de login com Google. Dispara a função que inicia o fluxo OAuth. */}
            <Button variant="outline" className="w-full" onClick={handleLoginWithGoogle}>
              <Chrome className="mr-2 h-4 w-4" />
              Entrar com Google
            </Button>

            <Separator className="my-2" />

            <form onSubmit={handleSignIn} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="#" className="ml-auto inline-block text-sm underline">
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              {/* Comentário: O fluxo de "Criar conta" deve levar a uma página de registro
                  que utilize `supabase.auth.signUp`. */}
              <Link href="/signup" className="underline">
                Criar conta
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
