import { createClient } from "@/app/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Protege rotas que começam com /dashboard
  if (url.pathname.startsWith("/dashboard")) {
    try {
      console.log(
        "🔒 Middleware: Checking dashboard access for:",
        url.pathname
      );

      // Cria o cliente Supabase no servidor para verificar a sessão
      const supabase = await createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Middleware: Error getting session:", error);
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      if (!session) {
        console.log("❌ Middleware: No session found, redirecting to login");
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      console.log("✅ Middleware: Session found, allowing dashboard access");
    } catch (error) {
      console.error("❌ Middleware: Unexpected error:", error);
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
  ],
};
