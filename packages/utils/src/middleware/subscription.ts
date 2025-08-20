/**
 * Subscription Middleware for NeonPro Healthcare System
 * Handles subscription validation, route protection, and caching
 */

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  features: string[];
  expiresAt?: Date;
  planType: 'basic' | 'premium' | 'enterprise';
}

export const validateSubscriptionStatus = (
  subscription: SubscriptionStatus | null
): boolean => {
  if (!subscription) return false;
  if (subscription.status === 'active') return true;
  if (subscription.status === 'expired' || subscription.status === 'cancelled')
    return false;
  return false;
};

export const routeProtection = {
  isPublicRoute: (route: string): boolean => {
    const publicRoutes = ['/login', '/signup', '/public', '/'];
    return publicRoutes.some((pub) => route.startsWith(pub));
  },

  isPremiumRoute: (route: string): boolean => {
    const premiumRoutes = ['/premium', '/analytics', '/reports'];
    return premiumRoutes.some((premium) => route.startsWith(premium));
  },

  shouldRedirectToUpgrade: (
    subscription: SubscriptionStatus | null,
    route: string
  ): boolean => {
    if (this.isPublicRoute(route)) return false;
    if (
      this.isPremiumRoute(route) &&
      (!subscription || subscription.status !== 'active')
    ) {
      return true;
    }
    return false;
  },
};

export const subscriptionCaching = {
  cache: new Map<string, { data: SubscriptionStatus; expires: number }>(),

  get: (userId: string): SubscriptionStatus | null => {
    const cached = subscriptionCaching.cache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    return null;
  },

  set: (userId: string, data: SubscriptionStatus, ttl = 300_000): void => {
    subscriptionCaching.cache.set(userId, {
      data,
      expires: Date.now() + ttl,
    });
  },

  invalidate: (userId: string): void => {
    subscriptionCaching.cache.delete(userId);
  },

  clear: (): void => {
    subscriptionCaching.cache.clear();
  },
};

export const errorHandling = {
  handleNetworkError: (error: Error): SubscriptionStatus | null => {
    console.error('Network error in subscription check:', error);
    return null;
  },

  handleInvalidResponse: (response: any): SubscriptionStatus | null => {
    console.error('Invalid subscription response:', response);
    return null;
  },
};
