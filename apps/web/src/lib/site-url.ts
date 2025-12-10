/**
 * Get the site URL based on environment
 */
export function getSiteUrl(): string {
    // Check for Vercel deployment URL
    if (import.meta.env.VITE_VERCEL_URL) {
        return `https://${import.meta.env.VITE_VERCEL_URL}`;
    }

    // Check for custom site URL
    if (import.meta.env.VITE_SITE_URL) {
        return import.meta.env.VITE_SITE_URL;
    }

    // Default to localhost in development
    if (import.meta.env.DEV) {
        return 'http://localhost:8080';
    }

    // Fallback to current origin
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return 'http://localhost:8080';
}

/**
 * Get the API URL based on environment
 */
export function getApiUrl(): string {
    // Check for custom API URL
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Default to /api on the site URL
    return `${getSiteUrl()}/api`;
}

/**
 * Get the next redirect URL from OAuth callback
 * Extracts the 'next' or 'redirect_to' query parameter from the callback URL
 */
export function getNextRedirectFromCallback(callbackUrl: string): string {
    try {
        const url = new URL(callbackUrl);
        const next = url.searchParams.get('next') || url.searchParams.get('redirect_to');

        if (next) {
            // Validate that the redirect is to our own domain (security)
            try {
                const redirectUrl = new URL(next, getSiteUrl());
                const siteOrigin = new URL(getSiteUrl()).origin;
                if (redirectUrl.origin === siteOrigin) {
                    return next;
                }
            } catch {
                // If parsing fails, fall through to default
            }
        }
    } catch {
        // If URL parsing fails, fall through to default
    }

    // Default redirect to dashboard
    return '/dashboard';
}

export const siteUrl = getSiteUrl();
