/**
 * Health Check API Route
 * GET /api/health - System health status
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };
    }

    return {
      service: 'database',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheck {
  try {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memoryUsagePercent = (usedMem / totalMem) * 100;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (memoryUsagePercent > 90) {
      status = 'unhealthy';
    } else if (memoryUsagePercent > 75) {
      status = 'degraded';
    }

    return {
      service: 'memory',
      status,
      details: {
        heapUsed: `${Math.round(usedMem / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
        usagePercent: `${memoryUsagePercent.toFixed(1)}%`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      },
    };
  } catch (error) {
    return {
      service: 'memory',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check system uptime
 */
function checkUptime(): HealthCheck {
  try {
    const uptime = process.uptime();
    const _uptimeHours = uptime / 3600;

    return {
      service: 'uptime',
      status: 'healthy',
      details: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime),
        startTime: new Date(Date.now() - uptime * 1000).toISOString(),
      },
    };
  } catch (error) {
    return {
      service: 'uptime',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format uptime in human readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Check environment variables
 */
function checkEnvironment(): HealthCheck {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    return {
      service: 'environment',
      status: 'unhealthy',
      error: `Missing environment variables: ${missing.join(', ')}`,
    };
  }

  return {
    service: 'environment',
    status: 'healthy',
    details: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      environment: process.env.NODE_ENV || 'development',
    },
  };
}

/**
 * Get overall system status
 */
function getOverallStatus(
  checks: HealthCheck[]
): 'healthy' | 'unhealthy' | 'degraded' {
  const hasUnhealthy = checks.some((check) => check.status === 'unhealthy');
  const hasDegraded = checks.some((check) => check.status === 'degraded');

  if (hasUnhealthy) return 'unhealthy';
  if (hasDegraded) return 'degraded';
  return 'healthy';
}

/**
 * Health check endpoint
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Run all health checks
    const checks = await Promise.all([
      checkDatabase(),
      checkMemory(),
      checkUptime(),
      checkEnvironment(),
    ]);

    const overallStatus = getOverallStatus(checks);
    const totalResponseTime = Date.now() - startTime;

    // Determine HTTP status code
    let statusCode = 200;
    if (overallStatus === 'degraded') statusCode = 200; // Still operational
    if (overallStatus === 'unhealthy') statusCode = 503; // Service unavailable

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      version: process.env.npm_package_version || '1.0.0',
      checks: checks.reduce(
        (acc, check) => {
          acc[check.service] = {
            status: check.status,
            ...(check.responseTime && { responseTime: check.responseTime }),
            ...(check.error && { error: check.error }),
            ...(check.details && { details: check.details }),
          };
          return acc;
        },
        {} as Record<string, any>
      ),
    };

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
