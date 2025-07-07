// app/auth/popup-callback/route.ts
// Rota para lidar com callbacks OAuth em janelas popup
import { createClient } from "@/app/utils/supabase/server";

// Helper function para criar resposta de erro consistente
function createErrorResponse(message: string) {
  console.log("Returning error response:", message);
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Erro na autenticação</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            text-align: center;
            padding: 2rem;
            background: #fef2f2;
          }
          .error {
            color: #dc2626;
            font-size: 1.125rem;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="error">❌ ${message}</div>
        <p>Redirecionando para login...</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'auth-error', message: '${message}' }, '*');
            setTimeout(() => window.close(), 3000);
          } else {
            setTimeout(() => window.location.href = '/login', 3000);
          }
        </script>
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Log para debugging
  console.log("=== Popup Callback Received ===");
  console.log("Code present:", !!code);
  console.log("Full URL:", request.url);

  if (code) {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log("✅ OAuth code exchange successful");
        // Verificar se a sessão foi criada
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Session created:", !!session);

        // Em caso de sucesso, retorna uma página que fecha o popup
        // e comunica com a janela pai
        return new Response(
          `
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
      `,
          {
            headers: { "Content-Type": "text/html" },
          }
        );
      } else {
        // Log do erro para debugging
        console.error("❌ OAuth code exchange failed:", error);
        return createErrorResponse("OAuth exchange failed: " + error.message);
      }
    } catch (err) {
      // Tratamento de erros inesperados
      console.error("❌ Unexpected error in popup callback:", err);
      return createErrorResponse("Unexpected error occurred");
    }
  }

  // Se não há código, retorna erro
  console.log("❌ No authorization code provided");
  return createErrorResponse("No authorization code provided");
}
