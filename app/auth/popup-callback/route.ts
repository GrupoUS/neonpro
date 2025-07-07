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
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                text-align: center;
                padding: 2rem;
                background: #f8fafc;
              }
              .success {
                color: #059669;
                font-size: 1.125rem;
                margin-bottom: 1rem;
              }
            </style>
          </head>
          <body>
            <div class="success">✅ Autenticação concluída com sucesso!</div>
            <p>Redirecionando...</p>
            <script>
              // Notifica a janela pai sobre o sucesso
              if (window.opener) {
                window.opener.postMessage({ type: 'auth-success' }, '*');
                // Aguarda um pouco antes de fechar para mostrar a mensagem
                setTimeout(() => {
                  window.close();
                }, 1500);
              } else {
                // Se não for popup, redireciona normalmente
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1500);
              }
            </script>
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