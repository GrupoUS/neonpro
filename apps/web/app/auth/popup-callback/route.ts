import { createClient } from "@/app/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const error_description = requestUrl.searchParams.get("error_description");

	if (error) {
		// Return HTML that sends error message to parent window
		return new NextResponse(
			`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error_description || error || "Authentication failed"}'
              }, '${requestUrl.origin}');
            }
            window.close();
          </script>
          <p>Authentication failed. This window should close automatically.</p>
        </body>
      </html>
    `,
			{
				headers: { "Content-Type": "text/html" },
			}
		);
	}

	if (code) {
		const supabase = await createClient();

		try {
			// Exchange the code for a session
			const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

			if (exchangeError) {
				throw exchangeError;
			}

			// Return HTML that sends success message to parent window
			return new NextResponse(
				`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Success</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_SUCCESS',
                  user: ${JSON.stringify(data.user)},
                  session: ${JSON.stringify(data.session)}
                }, '${requestUrl.origin}');
              }
              window.close();
            </script>
            <p>Authentication successful! This window should close automatically.</p>
          </body>
        </html>
      `,
				{
					headers: { "Content-Type": "text/html" },
				}
			);
		} catch (_exchangeError) {
			return new NextResponse(
				`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_ERROR',
                  error: 'Failed to complete authentication'
                }, '${requestUrl.origin}');
              }
              window.close();
            </script>
            <p>Authentication failed. This window should close automatically.</p>
          </body>
        </html>
      `,
				{
					headers: { "Content-Type": "text/html" },
				}
			);
		}
	}

	// No code or error - shouldn't happen in normal flow
	return new NextResponse(
		`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: 'Invalid authentication response'
            }, '${requestUrl.origin}');
          }
          window.close();
        </script>
        <p>Invalid authentication response. This window should close automatically.</p>
      </body>
    </html>
  `,
		{
			headers: { "Content-Type": "text/html" },
		}
	);
}
