import superjson from "superjson";
import type { AppRouter } from "@/server/trpc/router";

/**
 * tRPC React Client for NeonPro Healthcare
 *
 * Type-safe client with:
 * - Batch requests for performance
 * - SuperJSON for date/BigInt serialization
 * - Healthcare-compliant error handling
 * - Development logging
 * - Automatic request/response transformation
 */

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get base URL for tRPC endpoints
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative url
    return "";
  }

  if (process.env.VERCEL_URL) {
    // SSR should use vercel url
    return `https://${process.env.VERCEL_URL}`;
  }

  // Dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// tRPC client configuration
export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    // Logger for development
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    // HTTP batch link for performance
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      // Healthcare-specific headers
      headers() {
        return {
          "Content-Type": "application/json",
          "X-Healthcare-Client": "neonpro-web",
          "X-API-Version": "1.0",
        };
      },
      // Error handling for healthcare compliance
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include", // Include cookies for auth
        }).catch((error) => {
          console.error("tRPC Healthcare API Request Failed:", {
            url,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          throw error;
        });
      },
    }),
  ],
});
