// SSO Authorization Route
// Story 1.3: SSO Integration - Authorization URL Generation

import type { NextRequest } from "next/server";

const authorizeSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  redirect_to: z.string().url().optional(),
  login_hint: z.string().email().optional(),
  domain_hint: z.string().optional(),
  prompt: z.enum(["none", "consent", "select_account", "login"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validationResult = authorizeSchema.safeParse({
      provider: searchParams.get("provider"),
      redirect_to: searchParams.get("redirect_to"),
      login_hint: searchParams.get("login_hint"),
      domain_hint: searchParams.get("domain_hint"),
      prompt: searchParams.get("prompt"),
    });

    if (!validationResult.success) {
      logger.warn("SSO authorize: Invalid parameters", {
        errors: validationResult.error.errors,
        params: Object.fromEntries(searchParams.entries()),
      });

      return NextResponse.json(
        {
          error: "INVALID_PARAMETERS",
          message: "Invalid request parameters",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const {
      provider: providerId,
      redirect_to,
      login_hint,
      domain_hint,
      prompt,
    } = validationResult.data;

    // Check if provider exists and is enabled
    const availableProviders = ssoManager.getAvailableProviders();
    const provider = availableProviders.find((p) => p.id === providerId);

    if (!provider) {
      logger.warn("SSO authorize: Provider not found", { providerId });

      return NextResponse.json(
        {
          error: "PROVIDER_NOT_FOUND",
          message: `SSO provider '${providerId}' not found or disabled`,
        },
        { status: 404 },
      );
    }

    // Generate authorization URL
    const authUrl = await ssoManager.generateAuthUrl(providerId, {
      redirectUri: provider.config.redirectUri,
      scopes: provider.config.scopes,
      loginHint: login_hint,
      domainHint: domain_hint,
      prompt,
      // Store redirect destination in state for later use
      state: redirect_to ? `redirect_to=${encodeURIComponent(redirect_to)}` : undefined,
    });

    logger.info("SSO authorize: Generated auth URL", {
      providerId,
      hasRedirectTo: !!redirect_to,
      hasLoginHint: !!login_hint,
      hasDomainHint: !!domain_hint,
      prompt,
    });

    return NextResponse.json({
      authUrl,
      provider: {
        id: provider.id,
        name: provider.name,
        displayName: provider.metadata?.displayName || provider.name,
      },
    });
  } catch (error) {
    logger.error("SSO authorize: Failed to generate auth URL", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "AUTHORIZATION_FAILED",
        message: "Failed to generate authorization URL",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "POST method not allowed" },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "PUT method not allowed" },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "METHOD_NOT_ALLOWED", message: "DELETE method not allowed" },
    { status: 405 },
  );
}
