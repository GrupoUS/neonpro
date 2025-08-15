// app/auth/callback/route.ts
// Comentário: Rota de servidor para lidar com o callback do OAuth.
// Após o usuário autenticar com o Google, o Supabase o redireciona para cá.
// O código na URL é trocado por uma sessão de usuário segura no servidor.

import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // se o 'next' estiver na URL, redirecionaremos para ele.
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();

    try {
      // Melhorando tratamento de erro e logging
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        // Log do erro para debugging
        console.error('Erro na troca do código OAuth:', error);
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(
            error.message
          )}`
        );
      }
      // Sucesso: redireciona para o dashboard ou próxima página
      return NextResponse.redirect(`${origin}${next}`);
    } catch (err) {
      // Tratamento de erros inesperados
      console.error('Erro inesperado no callback OAuth:', err);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=unexpected_error`
      );
    }
  }

  // Redireciona para página de erro se não houver código
  return NextResponse.redirect(
    `${origin}/auth/auth-code-error?error=no_code_provided`
  );
}
