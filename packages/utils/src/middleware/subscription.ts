/**
 * Subscription Middleware for NeonPro Healthcare System
 * Handles subscription validation, route protection, and caching
 */

export interface SubscriptionStatus {
  id: string;
  status: "active" | "expired" | "cancelled" | "pending";
  features: string[];
  expiresAt?: Date;
  planType: "basic" | "premium" | "enterprise";
}

// Constants for caching
const DEFAULT_TTL = 300_000;

const validateSubscriptionStatus = (
  subscription: SubscriptionStatus | null,
): boolean => {
  if (!subscription) {
    return false;
  }
  if (subscription.status === "active") {
    return true;
  }
  if (
    subscription.status === "expired"
    || subscription.status === "cancelled"
  ) {
    return false;
  }
  return false;
};

const routeProtection = {
  isPremiumRoute: (route: string): boolean => {
    const premiumRoutes = ["/premium", "/analytics", "/reports"];
    return premiumRoutes.some((premium) => route.startsWith(premium));
  },

  isPublicRoute: (route: string): boolean => {
    const publicRoutes = ["/login", "/signup", "/public", "/"];
    return publicRoutes.some((pub) => route.startsWith(pub));
  },

  shouldRedirectToUpgrade: (
    subscription: SubscriptionStatus | null,
    route: string,
  ): boolean => {
    if (routeProtection.isPublicRoute(route)) {
      return false;
    }
    if (
      routeProtection.isPremiumRoute(route)
      && (!subscription || subscription.status !== "active")
    ) {
      return true;
    }
    return false;
  },
};

const subscriptionCaching = {
  cache: new Map<string, { data: SubscriptionStatus; expires: number; }>(),

  clear: (): void => {
    subscriptionCaching.cache.clear();
  },

  get: (userId: string): SubscriptionStatus | null => {
    const cached = subscriptionCaching.cache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  },

  invalidate: (userId: string): void => {
    subscriptionCaching.cache.delete(userId);
  },

  set: (userId: string, data: SubscriptionStatus, ttl = DEFAULT_TTL): void => {
    subscriptionCaching.cache.set(userId, {
      data,
      expires: Date.now() + ttl,
    });
  },
};

const errorHandling = {
  handleInvalidResponse: (_response: unknown): SubscriptionStatus | null => null,

  handleNetworkError: (_error: Error): SubscriptionStatus | null => null,
};

export { errorHandling, routeProtection, subscriptionCaching, validateSubscriptionStatus };
