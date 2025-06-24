import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Protege rotas que começam com /dashboard
  if (url.pathname.startsWith("/dashboard")) {
    // Verifica se existe cookie de sessão do Supabase
    // Os cookies do Supabase geralmente têm o prefixo sb- seguido do project ref
    const hasSessionCookie = req.cookies.has("sb-gfkskrkbnawkuppazkpt-auth-token") || 
                            req.cookies.has("sb-access-token") ||
                            req.cookies.has("sb-gfkskrkbnawkuppazkpt-auth-token-code-verifier");
    
    if (!hasSessionCookie) {
      // Redireciona para login se não houver sessão
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