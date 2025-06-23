import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    console.error("OAuth popup callback error:", error);
    // Return HTML that posts error message to parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error}',
                description: '${searchParams.get("error_description") || ""}'
              }, window.location.origin);
            }
            window.close();
          </script>
          <p>Processing authentication...</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (code) {
    console.log("OAuth callback received code, exchanging for session...");

    const supabase = await createClient();
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code:", exchangeError);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>OAuth Callback</title>
          </head>
          <body>
            <script>
              console.log("OAuth exchange failed: ${exchangeError.message}");
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_ERROR',
                  error: 'exchange_failed',
                  description: '${exchangeError.message}'
                }, window.location.origin);
              }
              window.close();
            </script>
            <p>Authentication failed: ${exchangeError.message}</p>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    console.log("OAuth exchange successful, session created");

    // Success - return HTML that posts success message to parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
        </head>
        <body>
          <script>
            console.log("OAuth successful, notifying parent window");
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                sessionEstablished: true
              }, window.location.origin);
            }
            // Close after a short delay
            setTimeout(() => {
              window.close();
            }, 1000);
          </script>
          <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>✅ Authentication Successful!</h2>
            <p>This window will close automatically...</p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // No code or error
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OAuth Callback</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: 'invalid_callback',
              description: 'No authorization code received'
            }, window.location.origin);
          }
          window.close();
        </script>
        <p>Invalid callback</p>
      </body>
    </html>
    `,
    { headers: { "Content-Type": "text/html" } }
  );
}
