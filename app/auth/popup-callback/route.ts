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
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

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
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_ERROR',
                  error: 'exchange_failed',
                  description: '${exchangeError.message}'
                }, window.location.origin);
              }
              window.close();
            </script>
            <p>Authentication failed</p>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } }
      );
    }

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
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                code: '${code}',
                state: '${state || ""}'
              }, window.location.origin);
            }
            // Don't close immediately, let parent handle it
            setTimeout(() => {
              if (!window.closed) {
                window.close();
              }
            }, 2000);
          </script>
          <p>Authentication successful! This window will close automatically...</p>
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
