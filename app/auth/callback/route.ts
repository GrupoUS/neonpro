// app/auth/callback/route.ts
// Comentário: Rota de servidor para lidar com o callback do OAuth.
// Após o usuário autenticar com o Google, o Supabase o redireciona para cá.
// O código na URL é trocado por uma sessão de usuário segura no servidor.
import { NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // se o 'next' estiver na URL, redirecionaremos para ele.
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // redireciona para uma página de erro se algo der errado
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
