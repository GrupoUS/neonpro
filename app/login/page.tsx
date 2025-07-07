// app/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Chrome } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Verifica se o usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [])

  // Função para lidar com o login via Google com popup
  const handleLoginWithGoogle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/popup-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        setError("Erro ao fazer login com Google: " + error.message)
      }
    } catch (err) {
      setError("Erro inesperado ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  // Função para login com email e senha
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setError("Erro ao fazer login: " + error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Erro inesperado ao fazer login")
    } finally {
      setLoading(false)
    }
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
            {/* Exibir erro se houver */}
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* Botão de login com Google */}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLoginWithGoogle}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {loading ? "Carregando..." : "Entrar com Google"}
            </Button>

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
                  <Link href="#" className="ml-auto inline-block text-sm underline">
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
  )
}
