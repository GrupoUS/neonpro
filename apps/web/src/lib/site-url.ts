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

export const siteUrl = getSiteUrl();
