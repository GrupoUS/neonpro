// app/page.tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("🔄 Home page - Auth state:", { user: !!user, loading });
    if (!loading) {
      if (user) {
        console.log("✅ User detected in home page, redirecting to dashboard");
        // Se o usuário está logado, redireciona para o dashboard
        router.push("/dashboard");
      } else {
        console.log("❌ No user detected in home page, redirecting to login");
        // Se não está logado, redireciona para o login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Página de loading enquanto verifica autenticação
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Carregando NeonPro...</p>
      </div>
    </div>
  );
}
