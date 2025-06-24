// app/auth/popup-callback/route.ts
// Rota para lidar com callbacks OAuth em janelas popup
import { NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Em caso de sucesso, retorna uma página que fecha o popup
      // e comunica com a janela pai
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autenticação concluída</title>
          </head>
          <body>
            <script>
              // Notifica a janela pai sobre o sucesso
              if (window.opener) {
                window.opener.postMessage({ type: 'auth-success' }, '*');
                window.close();
              } else {
                // Se não for popup, redireciona normalmente
                window.location.href = '/dashboard';
              }
            </script>
            <p>Autenticação concluída. Esta janela será fechada automaticamente...</p>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
  }
  
  // Em caso de erro, exibe mensagem
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Erro na autenticação</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'auth-error' }, '*');
            setTimeout(() => window.close(), 3000);
          } else {
            setTimeout(() => window.location.href = '/login', 3000);
          }
        </script>
        <p>Erro na autenticação. Redirecionando...</p>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  })
}