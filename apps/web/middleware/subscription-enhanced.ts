/**
 * Enhanced Subscription Middleware v2 - Performance Optimized
 *
 * Advanced subscription middleware with performance optimizations:
 * - Intelligent caching with adaptive TTL
 * - Request batching and deduplication
 * - Performance monitoring and alerting
 * - Circuit breaker pattern for resilience
 * - Parallel processing where possible
 * - Memory-efficient route matching
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Performance Optimized
 */

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { enhancedSubscriptionCache } from '../lib/subscription-cache-enhanced';
import { subscriptionPerformanceMonitor } from '../lib/subscription-performance-monitor';
import { subscriptionQueryOptimizer } from '../lib/subscription-query-optimizer';
import type {
  SubscriptionStatus,
  SubscriptionValidationResult,
} from '../lib/subscription-status';

// Performance optimization configuration
type MiddlewareConfig = {
  enableCaching: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'adaptive';
  enableBatching: boolean;
  batchTimeout: number;
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    slowRequestThreshold: number;
  };
  routeOptimization: {
    precompileRoutes: boolean;
    enableRegexCaching: boolean;
    maxCacheSize: number;
  };
};

const defaultConfig: MiddlewareConfig = {
  enableCaching: true,
  cacheStrategy: 'adaptive',
  enableBatching: true,
  batchTimeout: 100,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 10,
    recoveryTimeout: 30_000,
  },
  monitoring: {
    enabled: true,
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    slowRequestThreshold: 500,
  },
  routeOptimization: {
    precompileRoutes: true,
    enableRegexCaching: true,
    maxCacheSize: 1000,
  },
};

// Route patterns cache for performance
const _routePatternsCache = new Map<string, RegExp>();
const routeMatchCache = new Map<string, string>();

// Circuit breaker state
let circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed';
let circuitBreakerFailures = 0;
let lastFailureTime = 0;

// Request batching
const pendingRequests = new Map<
  string,
  Promise<SubscriptionValidationResult>
>();
const requestBatches = new Map<
  string,
  Array<{
    userId: string;
    resolve: (value: SubscriptionValidationResult) => void;
    reject: (reason?: any) => void;
  }>
>();

// Performance metrics
type RequestMetrics = {
  path: string;
  method: string;
  duration: number;
  cacheHit: boolean;
  status: number;
  timestamp: number;
  userId?: string;
};

const requestMetrics: RequestMetrics[] = [];

/**
 * Enhanced subscription middleware with performance optimizations
 */
export async function enhancedSubscriptionMiddleware(
  req: NextRequest,
  config: Partial<MiddlewareConfig> = {},
): Promise<NextResponse> {
  const mergedConfig = { ...defaultConfig, ...config };
  const startTime = performance.now();
  const pathname = req.nextUrl.pathname;
  const method = req.method;

  // Performance monitoring start
  const timerId = subscriptionPerformanceMonitor.startTimer(
    `middleware_${pathname}`,
  );

  try {
    // Fast path for public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Circuit breaker check
    if (circuitBreakerState === 'open') {
      if (
        Date.now() - lastFailureTime >
        mergedConfig.circuitBreaker.recoveryTimeout
      ) {
        circuitBreakerState = 'half-open';
      } else {
        return createErrorResponse('Service temporarily unavailable', 503);
      }
    }

    // Get user session with caching
    const { user, sessionValidationResult } = await getCachedUserSession(
      req,
      mergedConfig,
    );

    if (!user) {
      return redirectToLogin(req);
    }

    // Check if route requires subscription
    const routeProtection = await getRouteProtection(pathname, mergedConfig);

    if (!routeProtection.requiresSubscription) {
      return NextResponse.next();
    }

    // Get subscription status with intelligent caching and batching
    const subscriptionResult = await getOptimizedSubscriptionStatus(
      user.id,
      pathname,
      mergedConfig,
    );

    // Validate access
    const hasAccess = await validateRouteAccess(
      subscriptionResult,
      routeProtection,
      user,
      mergedConfig,
    );

    // Record performance metrics
    const duration = performance.now() - startTime;
    recordRequestMetrics(
      {
        path: pathname,
        method,
        duration,
        cacheHit: subscriptionResult.performance?.cacheHit,
        status: hasAccess ? 200 : 403,
        timestamp: Date.now(),
        userId: user.id,
      },
      mergedConfig,
    );

    // Handle access result
    if (!hasAccess) {
      return createAccessDeniedResponse(subscriptionResult, routeProtection);
    }

    // Add subscription headers for downstream consumption
    const response = NextResponse.next();
    addSubscriptionHeaders(response, subscriptionResult, user);

    // Performance monitoring end
    subscriptionPerformanceMonitor.endTimer(timerId, true);

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Handle circuit breaker
    handleCircuitBreakerFailure(error, mergedConfig);

    // Record error metrics
    recordRequestMetrics(
      {
        path: pathname,
        method,
        duration,
        cacheHit: false,
        status: 500,
        timestamp: Date.now(),
      },
      mergedConfig,
    );

    // Performance monitoring end with error
    subscriptionPerformanceMonitor.endTimer(timerId, false);
    return createErrorResponse('Authentication error', 500);
  }
}

/**
 * Check if route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];

  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get cached user session with optimization
 */
async function getCachedUserSession(
  req: NextRequest,
  config: MiddlewareConfig,
): Promise<{ user: any; sessionValidationResult: any }> {
  const cacheKey = `session_${req.headers.get('authorization') || 'anonymous'}`;

  if (config.enableCaching) {
    const cached = await enhancedSubscriptionCache.get(cacheKey);
    if (cached && (cached as any).sessionData) {
      return (cached as any).sessionData;
    }
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // No-op for middleware
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const sessionData = { user, sessionValidationResult: { error } };

  // Cache session for short duration
  if (config.enableCaching && user) {
    const cacheData: SubscriptionValidationResult = {
      hasAccess: true,
      status: 'active' as SubscriptionStatus,
      subscription: null,
      message: 'Session cached',
      performance: {
        validationTime: 0,
        cacheHit: false,
        source: 'database',
      },
      sessionData,
    } as any;

    await enhancedSubscriptionCache.set(cacheKey, cacheData, 60_000); // 1 minute cache
  }

  return sessionData;
}

/**
 * Get route protection configuration with caching
 */
async function getRouteProtection(
  pathname: string,
  config: MiddlewareConfig,
): Promise<{
  requiresSubscription: boolean;
  requiredTier?: string;
  permissions?: string[];
}> {
  const cacheKey = `route_protection_${pathname}`;

  if (config.routeOptimization.enableRegexCaching) {
    const cached = routeMatchCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  // Define protected routes with their requirements
  const protectedRoutes = [
    {
      pattern: /^\/dashboard\/patients/,
      requiresSubscription: true,
      requiredTier: 'basic',
      permissions: ['patients:read'],
    },
    {
      pattern: /^\/dashboard\/appointments/,
      requiresSubscription: true,
      requiredTier: 'basic',
      permissions: ['appointments:read'],
    },
    {
      pattern: /^\/dashboard\/analytics/,
      requiresSubscription: true,
      requiredTier: 'pro',
      permissions: ['analytics:read'],
    },
    {
      pattern: /^\/dashboard\/billing/,
      requiresSubscription: true,
      requiredTier: 'basic',
      permissions: ['billing:read'],
    },
    {
      pattern: /^\/dashboard\/settings/,
      requiresSubscription: false,
      permissions: ['settings:read'],
    },
    {
      pattern: /^\/api\/patients/,
      requiresSubscription: true,
      requiredTier: 'basic',
      permissions: ['patients:write'],
    },
  ];

  // Find matching route
  let routeProtection: {
    requiresSubscription: boolean;
    requiredTier?: string;
    permissions?: string[];
  } = { requiresSubscription: false };

  for (const route of protectedRoutes) {
    if (route.pattern.test(pathname)) {
      routeProtection = {
        requiresSubscription: route.requiresSubscription,
        requiredTier: route.requiredTier,
        permissions: route.permissions,
      };
      break;
    }
  }

  // Cache result if enabled
  if (config.routeOptimization.enableRegexCaching) {
    if (routeMatchCache.size > config.routeOptimization.maxCacheSize) {
      // Clear old entries
      const entries = Array.from(routeMatchCache.entries());
      const toDelete = entries.slice(0, Math.floor(entries.length * 0.2));
      toDelete.forEach(([key]) => routeMatchCache.delete(key));
    }

    routeMatchCache.set(cacheKey, JSON.stringify(routeProtection));
  }

  return routeProtection;
}

/**
 * Get optimized subscription status with batching and caching
 */
async function getOptimizedSubscriptionStatus(
  userId: string,
  pathname: string,
  config: MiddlewareConfig,
): Promise<SubscriptionValidationResult> {
  const _cacheKey = `subscription_${userId}`;

  // Check for existing pending request to avoid duplicate calls
  const pendingRequest = pendingRequests.get(userId);
  if (pendingRequest) {
    return pendingRequest;
  }

  // Check if we should use batching
  if (config.enableBatching) {
    return getBatchedSubscriptionStatus(userId, config);
  }

  // Create new request
  const requestPromise = subscriptionQueryOptimizer.getSubscriptionStatus(
    userId,
    {
      useCache: config.enableCaching,
      cacheTTL: getCacheTTL(config.cacheStrategy, pathname),
      priority: getRequestPriority(pathname),
    },
  );

  pendingRequests.set(userId, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    pendingRequests.delete(userId);
  }
}

/**
 * Get batched subscription status to reduce database load
 */
async function getBatchedSubscriptionStatus(
  userId: string,
  config: MiddlewareConfig,
): Promise<SubscriptionValidationResult> {
  return new Promise((resolve, reject) => {
    const batchKey = 'subscription_batch';

    let batch = requestBatches.get(batchKey);
    if (!batch) {
      batch = [];
      requestBatches.set(batchKey, batch);

      // Schedule batch execution
      setTimeout(async () => {
        const currentBatch = requestBatches.get(batchKey);
        if (!currentBatch || currentBatch.length === 0) {
          return;
        }

        requestBatches.delete(batchKey);

        try {
          const userIds = currentBatch.map((item) => item.userId);
          const results =
            await subscriptionQueryOptimizer.getBatchSubscriptionStatus(
              userIds,
              {
                useCache: config.enableCaching,
                batch: true,
              },
            );

          // Resolve all pending requests
          currentBatch.forEach(
            ({ userId: batchUserId, resolve: batchResolve }) => {
              const result = results.get(batchUserId);
              if (result) {
                batchResolve(result);
              } else {
                batchResolve({
                  hasAccess: false,
                  status: null,
                  subscription: null,
                  message: 'No subscription found',
                  performance: {
                    validationTime: 0,
                    cacheHit: false,
                    source: 'database',
                  },
                });
              }
            },
          );
        } catch (error) {
          // Reject all pending requests
          currentBatch.forEach(({ reject: batchReject }) => {
            batchReject(error);
          });
        }
      }, config.batchTimeout);
    }

    batch.push({ userId, resolve, reject });
  });
}

/**
 * Calculate cache TTL based on strategy
 */
function getCacheTTL(strategy: string, pathname: string): number {
  switch (strategy) {
    case 'aggressive':
      return 600_000; // 10 minutes
    case 'conservative':
      return 60_000; // 1 minute
    case 'adaptive':
      // Adaptive TTL based on route criticality
      if (pathname.includes('/api/')) {
        return 120_000; // 2 minutes for API
      }
      if (pathname.includes('/analytics')) {
        return 300_000; // 5 minutes for analytics
      }
      if (pathname.includes('/dashboard')) {
        return 180_000; // 3 minutes for dashboard
      }
      return 240_000; // 4 minutes default
    default:
      return 180_000; // 3 minutes default
  }
}

/**
 * Get request priority based on pathname
 */
function getRequestPriority(pathname: string): 'high' | 'medium' | 'low' {
  if (pathname.includes('/api/')) {
    return 'high';
  }
  if (pathname.includes('/dashboard/patients')) {
    return 'high';
  }
  if (pathname.includes('/dashboard/appointments')) {
    return 'high';
  }
  if (pathname.includes('/dashboard/analytics')) {
    return 'medium';
  }
  return 'low';
}

/**
 * Validate route access based on subscription and requirements
 */
async function validateRouteAccess(
  subscriptionResult: SubscriptionValidationResult,
  routeProtection: any,
  _user: any,
  _config: MiddlewareConfig,
): Promise<boolean> {
  // Basic access check
  if (!subscriptionResult.hasAccess) {
    return false;
  }

  // Check tier requirements
  if (routeProtection.requiredTier) {
    const userTier =
      subscriptionResult.subscription?.plan?.name?.toLowerCase() || 'free';
    const requiredTier = routeProtection.requiredTier.toLowerCase();

    const tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

    if (userTierIndex < requiredTierIndex) {
      return false;
    }
  }

  // Check specific permissions (placeholder for future implementation)
  if (routeProtection.permissions && routeProtection.permissions.length > 0) {
    // This would check user permissions from database or JWT
    // For now, we'll assume users with active subscriptions have all permissions
    return subscriptionResult.hasAccess;
  }

  return true;
}

/**
 * Handle circuit breaker failures
 */
function handleCircuitBreakerFailure(
  _error: any,
  config: MiddlewareConfig,
): void {
  if (!config.circuitBreaker.enabled) {
    return;
  }

  circuitBreakerFailures++;
  lastFailureTime = Date.now();

  if (circuitBreakerFailures >= config.circuitBreaker.failureThreshold) {
    circuitBreakerState = 'open';
  }
}

/**
 * Record request metrics for monitoring
 */
function recordRequestMetrics(
  metrics: RequestMetrics,
  config: MiddlewareConfig,
): void {
  if (!config.monitoring.enabled) {
    return;
  }

  // Sample requests in production
  if (Math.random() > config.monitoring.sampleRate) {
    return;
  }

  requestMetrics.push(metrics);

  // Alert on slow requests
  if (metrics.duration > config.monitoring.slowRequestThreshold) {
  }

  // Keep only recent metrics
  if (requestMetrics.length > 10_000) {
    requestMetrics.splice(0, requestMetrics.length - 5000);
  }

  // Record in performance monitor
  subscriptionPerformanceMonitor.recordRealtimeOperation(
    metrics.duration,
    requestMetrics.length,
  );
}

/**
 * Create error response
 */
function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Redirect to login
 */
function redirectToLogin(req: NextRequest): NextResponse {
  const redirectUrl = new URL('/login', req.url);
  redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

/**
 * Create access denied response
 */
function createAccessDeniedResponse(
  subscriptionResult: SubscriptionValidationResult,
  routeProtection: any,
): NextResponse {
  const upgradeNeeded =
    routeProtection.requiredTier &&
    (!subscriptionResult.subscription?.plan?.name ||
      getTierLevel(subscriptionResult.subscription.plan.name) <
        getTierLevel(routeProtection.requiredTier));

  return NextResponse.json(
    {
      error: 'Access denied',
      message: subscriptionResult.message,
      upgradeNeeded,
      requiredTier: routeProtection.requiredTier,
      currentTier: subscriptionResult.subscription?.plan?.name || 'free',
    },
    { status: 403 },
  );
}

/**
 * Get tier level for comparison
 */
function getTierLevel(tier: string): number {
  const levels = { free: 0, basic: 1, pro: 2, enterprise: 3 };
  return levels[tier.toLowerCase() as keyof typeof levels] || 0;
}

/**
 * Add subscription headers for downstream consumption
 */
function addSubscriptionHeaders(
  response: NextResponse,
  subscriptionResult: SubscriptionValidationResult,
  user: any,
): void {
  response.headers.set('x-user-id', user.id);
  response.headers.set(
    'x-subscription-status',
    subscriptionResult.status || 'unknown',
  );
  response.headers.set(
    'x-subscription-tier',
    subscriptionResult.subscription?.plan?.name || 'free',
  );
  response.headers.set('x-has-access', subscriptionResult.hasAccess.toString());

  if (subscriptionResult.gracePeriod) {
    response.headers.set('x-grace-period', 'true');
  }

  if (subscriptionResult.performance) {
    response.headers.set(
      'x-cache-hit',
      subscriptionResult.performance.cacheHit.toString(),
    );
    response.headers.set(
      'x-validation-time',
      subscriptionResult.performance.validationTime.toString(),
    );
  }
}

/**
 * Get performance statistics
 */
export function getMiddlewarePerformanceStats(): {
  totalRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  slowRequestCount: number;
  circuitBreakerState: string;
  topSlowPaths: Array<{ path: string; averageTime: number; count: number }>;
} {
  const totalRequests = requestMetrics.length;
  const averageResponseTime =
    requestMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests || 0;
  const cacheHits = requestMetrics.filter((m) => m.cacheHit).length;
  const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;
  const slowRequestCount = requestMetrics.filter(
    (m) => m.duration > 500,
  ).length;

  // Calculate top slow paths
  const pathStats = new Map<string, { totalTime: number; count: number }>();
  requestMetrics.forEach((metric) => {
    const existing = pathStats.get(metric.path) || { totalTime: 0, count: 0 };
    pathStats.set(metric.path, {
      totalTime: existing.totalTime + metric.duration,
      count: existing.count + 1,
    });
  });

  const topSlowPaths = Array.from(pathStats.entries())
    .map(([path, stats]) => ({
      path,
      averageTime: stats.totalTime / stats.count,
      count: stats.count,
    }))
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, 10);

  return {
    totalRequests,
    averageResponseTime,
    cacheHitRate,
    slowRequestCount,
    circuitBreakerState,
    topSlowPaths,
  };
}

/**
 * Reset circuit breaker (manual recovery)
 */
export function resetCircuitBreaker(): void {
  circuitBreakerState = 'closed';
  circuitBreakerFailures = 0;
  lastFailureTime = 0;
}

// Default export
export default enhancedSubscriptionMiddleware;
