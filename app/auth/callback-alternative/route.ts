import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Alternative OAuth Callback Handler
 * This is a more robust implementation that handles both popup and redirect flows
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const next = searchParams.get("next") || "/dashboard";

  console.log("=== OAuth Callback Alternative ===");
  console.log("Code:", !!code);
  console.log("Error:", error);
  console.log("State:", state);
  console.log("Next:", next);

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    const errorUrl = new URL("/auth/auth-code-error", origin);
    errorUrl.searchParams.set("error", error);
    errorUrl.searchParams.set("description", searchParams.get("error_description") || "");
    return NextResponse.redirect(errorUrl.toString());
  }

  // Handle authorization code
  if (code) {
    const supabase = await createClient();
    
    try {
      console.log("Exchanging code for session...");
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Exchange error:", exchangeError);
        const errorUrl = new URL("/auth/auth-code-error", origin);
        errorUrl.searchParams.set("error", "exchange_failed");
        errorUrl.searchParams.set("description", exchangeError.message);
        return NextResponse.redirect(errorUrl.toString());
      }

      if (!data.session) {
        console.error("No session created");
        const errorUrl = new URL("/auth/auth-code-error", origin);
        errorUrl.searchParams.set("error", "no_session");
        errorUrl.searchParams.set("description", "Failed to create session");
        return NextResponse.redirect(errorUrl.toString());
      }

      console.log("Session created successfully for user:", data.session.user.email);

      // Check if this is a popup request
      const isPopup = state && JSON.parse(atob(state)).popup;
      
      if (isPopup) {
        // Return HTML for popup that notifies parent window
        return new Response(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>OAuth Success</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                }
                .container {
                  text-align: center;
                  padding: 2rem;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 10px;
                  backdrop-filter: blur(10px);
                }
                .success-icon {
                  font-size: 3rem;
                  margin-bottom: 1rem;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-icon">✅</div>
                <h2>Authentication Successful!</h2>
                <p>This window will close automatically...</p>
              </div>
              <script>
                console.log("OAuth successful, notifying parent window");
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'OAUTH_SUCCESS',
                    sessionEstablished: true,
                    user: {
                      email: '${data.session.user.email}',
                      id: '${data.session.user.id}'
                    }
                  }, window.location.origin);
                }
                
                // Close popup after delay
                setTimeout(() => {
                  window.close();
                }, 2000);
              </script>
            </body>
          </html>
          `,
          { headers: { "Content-Type": "text/html" } }
        );
      } else {
        // Regular redirect flow
        const redirectUrl = new URL(next, origin);
        return NextResponse.redirect(redirectUrl.toString());
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorUrl = new URL("/auth/auth-code-error", origin);
      errorUrl.searchParams.set("error", "unexpected_error");
      errorUrl.searchParams.set("description", err.message);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // No code or error - invalid callback
  console.error("Invalid callback - no code or error");
  const errorUrl = new URL("/auth/auth-code-error", origin);
  errorUrl.searchParams.set("error", "invalid_callback");
  errorUrl.searchParams.set("description", "No authorization code received");
  return NextResponse.redirect(errorUrl.toString());
}
