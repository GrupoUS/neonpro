import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  console.log("=== Popup Callback Route Handler ===");

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // Log all parameters for debugging
  console.log("Callback params:", {
    code: code ? "present" : "missing",
    error,
    error_description,
    origin,
  });

  // Handle OAuth error
  if (error) {
    console.error("OAuth error:", error, error_description);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            // Send error to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: ${JSON.stringify(error_description || error)}
              }, '${origin}');
            }
            // Close popup after a short delay
            setTimeout(() => window.close(), 1000);
          </script>
        </head>
        <body>
          <div style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #ef4444;">Authentication Error</h1>
            <p>${error_description || error}</p>
            <p style="color: #6b7280; margin-top: 20px;">This window will close automatically...</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
        status: 400,
      }
    );
  }

  // Require auth code
  if (!code) {
    console.error("No authorization code received");
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            // Send error to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'No authorization code received'
              }, '${origin}');
            }
            // Close popup after a short delay
            setTimeout(() => window.close(), 1000);
          </script>
        </head>
        <body>
          <div style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #ef4444;">Authentication Error</h1>
            <p>No authorization code received</p>
            <p style="color: #6b7280; margin-top: 20px;">This window will close automatically...</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
        status: 400,
      }
    );
  }

  try {
    // Exchange code for session
    const supabase = await createClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      throw exchangeError;
    }

    if (!data?.session) {
      console.error("No session returned after code exchange");
      throw new Error("Failed to create session");
    }

    console.log("Session created successfully:", {
      user: data.session.user.email,
      expires_at: data.session.expires_at,
    });

    // Return HTML that communicates success to parent window
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Successful</title>
          <script>
            // Send success to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                user: ${JSON.stringify({
                  id: data.session.user.id,
                  email: data.session.user.email,
                  user_metadata: data.session.user.user_metadata,
                })}
              }, '${origin}');
            }
            // Close popup after a short delay
            setTimeout(() => window.close(), 500);
          </script>
        </head>
        <body>
          <div style="font-family: system-ui; padding: 40px; text-align: center;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 20px;">
              <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h1 style="color: #10b981; margin: 0 0 10px;">Login Successful!</h1>
            <p style="color: #6b7280;">Redirecting to dashboard...</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Set cookie for session
          "Set-Cookie": `supabase-auth-token=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Popup callback error:", error);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            // Send error to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: ${JSON.stringify(
                  error.message || "Authentication failed"
                )}
              }, '${origin}');
            }
            // Close popup after a short delay
            setTimeout(() => window.close(), 2000);
          </script>
        </head>
        <body>
          <div style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #ef4444;">Authentication Failed</h1>
            <p>${error.message || "An unexpected error occurred"}</p>
            <p style="color: #6b7280; margin-top: 20px;">This window will close automatically...</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
        status: 500,
      }
    );
  }
}
