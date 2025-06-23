"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProcessAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const processAuth = async () => {
      console.log("=== Processing Auth ===");
      console.log("Current URL:", window.location.href);
      console.log("Hash:", window.location.hash);
      
      const supabase = createClient();
      
      try {
        // Para fluxo implícito, o Supabase processa automaticamente o hash
        // Vamos dar um tempo para ele processar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se temos uma sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          router.push(`/login?error=${error.message}`);
          return;
        }
        
        if (session) {
          console.log("Session found, redirecting to:", next);
          router.push(next);
        } else {
          console.log("No session found");
          router.push("/login?error=no_session");
        }
      } catch (error: any) {
        console.error("Process auth error:", error);
        router.push(`/login?error=${error.message}`);
      }
    };
    
    processAuth();
  }, [next, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Processando autenticação...</p>
      </div>
    </div>
  );
}