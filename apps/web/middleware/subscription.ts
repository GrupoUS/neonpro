import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import {
  type AccessLevel,
  calculateGracePeriodEnd,
  getSubscriptionTier,
  getUserRole,
  routeProtector,
  type SubscriptionTier,
  type UserRole,
  type UserRouteContext,
} from '../lib/route-protection';
import {
  cacheManager,
  globalSubscriptionCache,
} from '../lib/subscription-cache';
import {
  clearSubscriptionCache,
  getCacheStats,
  getPerformanceMetrics,
  getPerformanceSummary,
  healthCheck,
  type SubscriptionStatus,
  type SubscriptionValidationResult,
} from '../lib/subscription-status';

// Re-export types for backward compatibility
export type {
  AccessLevel,
  UserRouteContext,
  SubscriptionStatus,
  SubscriptionTier,
  SubscriptionValidationResult,
  UserRole,
};

/**
 * Enhanced subscription middleware with granular route protection
 * Integrates advanced route protection system for subscription-based access control
 */
export async function subscriptionMiddleware(
  req: NextRequest
): Promise<NextResponse> {
  const startTime = Date.now();
  const _pathname = req.nextUrl.pathname;

  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value || '',
          set: () => {}, // Not needed for middleware
          remove: () => {}, // Not needed for middleware
        },
      }
    );

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Build route context for advanced protection
    let routeContext: UserRouteContext | null = null;

    if (session?.user) {
      // Get user profile data for role and permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select(
          `
          id, role, permissions, clinic_id, clinic_role
        `
        )
        .eq('id', session.user.id)
        .single();

      // Get subscription data separately
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(
          `
          status, tier, current_period_end, 
          plan:subscription_plans(name, features)
        `
        )
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Build comprehensive route context
      routeContext = {
        userId: session.user.id,
        userRole: getUserRole(profile?.role || 'patient'),
        subscriptionTier: getSubscriptionTier(subscription?.tier || 'free'),
        subscriptionStatus: subscription?.status || 'inactive',
        subscriptionExpiresAt: subscription?.current_period_end
          ? new Date(subscription.current_period_end)
          : undefined,
        gracePeriodEndsAt: subscription?.current_period_end
          ? calculateGracePeriodEnd(
              new Date(subscription.current_period_end),
              3
            )
          : undefined,
        permissions: Array.isArray(profile?.permissions)
          ? profile.permissions
          : ['read'],
        featureFlags: await getUserFeatureFlags(session.user.id, supabase),
        clinicId: profile?.clinic_id,
        clinicRole: profile?.clinic_role,
      };
    }

    // Apply advanced route protection
    if (routeContext) {
      const accessResult = await routeProtector.checkAccess(req, routeContext);

      if (!accessResult.allowed) {
        // Create appropriate response based on error type
        if (accessResult.redirectTo) {
          const redirectUrl = new URL(accessResult.redirectTo, req.url);

          // Add error context as query parameters for better UX
          if (accessResult.errorCode) {
            redirectUrl.searchParams.set('error', accessResult.errorCode);
          }
          if (accessResult.reason) {
            redirectUrl.searchParams.set(
              'message',
              encodeURIComponent(accessResult.reason)
            );
          }

          return NextResponse.redirect(redirectUrl);
        }

        // Return 403 for API routes or when no redirect is specified
        return new NextResponse(
          JSON.stringify({
            error: accessResult.errorCode || 'ACCESS_DENIED',
            message: accessResult.reason || 'Access denied',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Continue to next middleware or route handler
    const response = NextResponse.next();

    // Add performance headers for monitoring
    const processingTime = Date.now() - startTime;
    response.headers.set(
      'x-subscription-check-time',
      processingTime.toString()
    );
    response.headers.set('x-subscription-middleware-version', '2.0.0');

    if (routeContext) {
      response.headers.set('x-user-tier', routeContext.subscriptionTier);
      response.headers.set('x-user-role', routeContext.userRole);
    }
    return response;
  } catch (_error) {
    // Performance tracking for errors
    const errorTime = Date.now() - startTime;

    // Return to dashboard with error context
    const errorUrl = new URL('/dashboard', req.url);
    errorUrl.searchParams.set('error', 'MIDDLEWARE_ERROR');
    errorUrl.searchParams.set(
      'message',
      'System error during access validation'
    );

    const response = NextResponse.redirect(errorUrl);
    response.headers.set('x-subscription-error-time', errorTime.toString());

    return response;
  }
}

/**
 * Get user-specific feature flags from database or cache
 */
async function getUserFeatureFlags(
  userId: string,
  supabase: any
): Promise<Record<string, boolean>> {
  try {
    const { data } = await supabase
      .from('user_feature_flags')
      .select('flag_name, enabled')
      .eq('user_id', userId);

    const flags: Record<string, boolean> = {};

    // Default feature flags
    const defaultFlags = {
      advanced_treatments: true,
      advanced_reporting: true,
      multi_clinic_support: false,
      advanced_analytics: true,
      custom_reports: true,
      ai_suggestions: false,
      mobile_app_sync: true,
      third_party_integrations: true,
    };

    // Apply defaults
    Object.assign(flags, defaultFlags);

    // Override with user-specific flags
    if (data) {
      data.forEach((flag: any) => {
        flags[flag.flag_name] = flag.enabled;
      });
    }

    return flags;
  } catch (_error) {
    // Return safe defaults on error
    return {
      advanced_treatments: true,
      advanced_reporting: true,
      multi_clinic_support: false,
      advanced_analytics: false,
      custom_reports: false,
      ai_suggestions: false,
      mobile_app_sync: true,
      third_party_integrations: false,
    };
  }
}

// Utility functions for external use
export async function validateUserAccess(
  req: NextRequest,
  userId: string
): Promise<boolean> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value || '',
          set: () => {},
          remove: () => {},
        },
      }
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, permissions')
      .eq('id', userId)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, tier')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const routeContext: UserRouteContext = {
      userId,
      userRole: getUserRole(profile?.role || 'patient'),
      subscriptionTier: getSubscriptionTier(subscription?.tier || 'free'),
      subscriptionStatus: subscription?.status || 'inactive',
      permissions: Array.isArray(profile?.permissions)
        ? profile.permissions
        : ['read'],
      featureFlags: await getUserFeatureFlags(userId, supabase),
    };

    const result = await routeProtector.checkAccess(req, routeContext);
    return result.allowed;
  } catch (_error) {
    return false;
  }
}

// Export utilities for external access
export {
  cacheManager,
  clearSubscriptionCache,
  getCacheStats,
  getPerformanceMetrics,
  getPerformanceSummary,
  globalSubscriptionCache,
  healthCheck,
  routeProtector,
};

/**
 * Real-time Integration
 *
 * The middleware now supports real-time subscription status updates through:
 * - WebSocket connections via SubscriptionRealtimeManager
 * - Client-side hooks (useSubscriptionStatus)
 * - Automatic UI synchronization
 * - Server-sent events for status changes
 *
 * To use real-time features in components:
 * 1. Import useSubscriptionStatus hook
 * 2. Component will auto-connect to real-time updates
 * 3. Status changes trigger automatic UI updates
 *
 * Example:
 * ```tsx
 * import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
 *
 * function MyComponent() {
 *   const { status, isActive, refresh } = useSubscriptionStatus()
 *   return <div>Status: {status}</div>
 * }
 * ```
 *
 * For manual integration:
 * ```tsx
 * import { subscriptionRealtimeManager } from '@/lib/subscription-realtime'
 *
 * const unsubscribe = subscriptionRealtimeManager.subscribe(userId, (update) => {
 *   console.log('Subscription updated:', update)
 * })
 * ```
 */

// Real-time integration is handled by:
// - lib/subscription-realtime.ts (WebSocket management)
// - hooks/use-subscription-status.ts (React integration)
// - components/subscription/subscription-status-indicator.tsx (UI component)
