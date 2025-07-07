import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/app/utils/supabase/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Protege rotas que começam com /dashboard
  if (url.pathname.startsWith("/dashboard")) {
    try {
      // Cria o cliente Supabase no servidor para verificar a sessão
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redireciona para login se não houver sessão
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Em caso de erro, redireciona para login por segurança
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  
  // Permite acesso às rotas públicas
  return NextResponse.next();
}

// Configuração das rotas que o middleware deve interceptar
export const config = {
  matcher: [
    // Protege todas as rotas do dashboard
    "/dashboard/:path*",
    // Adicione outras rotas protegidas aqui conforme necessário
    // "/profile/:path*",
    // "/settings/:path*",
  ]
};