// SSO Providers Route
// Story 1.3: SSO Integration - Available Providers API

import type { NextRequest } from "next/server";

const providersQuerySchema = z.object({
  domain: z.string().optional(),
  enabled_only: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validationResult = providersQuerySchema.safeParse({
      domain: searchParams.get("domain"),
      enabled_only: searchParams.get("enabled_only"),
    });

    if (!validationResult.success) {
      logger.warn("SSO providers: Invalid parameters", {
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

    const { domain, enabled_only } = validationResult.data;

    let providers;

    if (domain) {
      // Get providers for specific domain
      providers = ssoManager.getProvidersByDomain(domain);

      logger.info("SSO providers: Retrieved providers for domain", {
        domain,
        providerCount: providers.length,
      });
    } else {
      // Get all available providers
      providers = ssoManager.getAvailableProviders();

      logger.info("SSO providers: Retrieved all providers", {
        providerCount: providers.length,
      });
    }

    // Filter by enabled status if requested
    if (enabled_only) {
      providers = providers.filter((provider) => provider.config.enabled);
    }

    // Transform providers for public API (remove sensitive config)
    const publicProviders = providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      type: provider.type,
      enabled: provider.config.enabled,
      displayName: provider.metadata?.displayName || provider.name,
      description: provider.metadata?.description,
      iconUrl: provider.metadata?.iconUrl,
      buttonColor: provider.metadata?.buttonColor,
      textColor: provider.metadata?.textColor,
      supportedDomains: provider.metadata?.supportedDomains,
      features: {
        supportsRefreshToken: provider.config.supportsRefreshToken,
        supportsIdToken: provider.config.supportsIdToken,
        supportsPKCE: provider.config.supportsPKCE,
      },
      // Only include scopes that are safe to expose
      scopes: provider.config.scopes?.filter(
        (scope) =>
          !scope.includes("admin") && !scope.includes("write") && !scope.includes("delete"),
      ),
    }));

    return NextResponse.json({
      providers: publicProviders,
      total: publicProviders.length,
      domain: domain || null,
      enabledOnly: enabled_only || false,
    });
  } catch (error) {
    logger.error("SSO providers: Failed to retrieve providers", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "PROVIDERS_FETCH_FAILED",
        message: "Failed to retrieve SSO providers",
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
