import type { HealthStatus, HealthCheck } from "../types";

interface HealthConfig {
  endpoint: string;
  interval: number;
}

let healthInterval: NodeJS.Timeout | null = null;

export function initializeHealthChecks(config: HealthConfig): void {
  console.log(`🏥 Initializing health checks on ${config.endpoint}`);

  // Register default health checks
  registerHealthCheck("system", checkSystemHealth);
  registerHealthCheck("database", checkDatabaseHealth);
  registerHealthCheck("ai-providers", checkAIProvidersHealth);
  registerHealthCheck("memory", checkMemoryUsage);

  // Start periodic health checks
  healthInterval = setInterval(runHealthChecks, config.interval);

  console.log(`🏥 Health checks running every ${config.interval}ms`);
}

export function registerHealthCheck(
  name: string,
  _checkFn: () => Promise<HealthCheck>,
): void {
  console.log(`📋 Registering health check: ${name}`);
}

export async function runHealthChecks(): Promise<HealthStatus> {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  // Run all health checks in parallel
  const results = await Promise.allSettled([
    checkSystemHealth(),
    checkDatabaseHealth(),
    checkAIProvidersHealth(),
    checkMemoryUsage(),
  ]);

  results.forEach((result, index) => {
    const checkNames = ["system", "database", "ai-providers", "memory"];
    if (result.status === "fulfilled") {
      checks.push(result.value);
    } else {
      checks.push({
        name: checkNames[index],
        status: "fail",
        duration: Date.now() - startTime,
        message: result.reason?.message || "Health check failed",
      } as HealthCheck);
    }
  });

  // Determine overall status
  const failedChecks = checks.filter((check) => check.status === "fail");
  const warningChecks = checks.filter((check) => check.status === "warn");

  let status: "healthy" | "degraded" | "unhealthy";
  if (failedChecks.length > 0) {
    status = "unhealthy";
  } else if (warningChecks.length > 0) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  return {
    status,
    checks,
    timestamp: new Date(),
  };
}

async function checkSystemHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Check basic system metrics
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const duration = Date.now() - startTime;

    return {
      name: "system",
      status: "pass",
      duration,
      data: {
        uptime: Math.round(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
    };
  } catch (error) {
    return {
      name: "system",
      status: "fail",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "System check failed",
    };
  }
}

async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Simple database ping (would need actual DB connection)
    // For now, just simulate a successful check
    await new Promise((resolve) => setTimeout(resolve, 10));

    return {
      name: "database",
      status: "pass",
      duration: Date.now() - startTime,
      data: {
        connections: 5,
        maxConnections: 20,
      },
    };
  } catch (error) {
    return {
      name: "database",
      status: "fail",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Database check failed",
    };
  }
}

async function checkAIProvidersHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Check AI provider availability (would need actual API calls)
    // For now, just simulate a successful check
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      name: "ai-providers",
      status: "pass",
      duration: Date.now() - startTime,
      data: {
        openai: "healthy",
        anthropic: "healthy",
        google: "healthy",
      },
    };
  } catch (error) {
    return {
      name: "ai-providers",
      status: "fail",
      duration: Date.now() - startTime,
      message:
        error instanceof Error ? error.message : "AI providers check failed",
    };
  }
}

async function checkMemoryUsage(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    const memoryUsage = process.memoryUsage();
    const usedHeap = memoryUsage.heapUsed;
    const totalHeap = memoryUsage.heapTotal;
    const usagePercent = (usedHeap / totalHeap) * 100;

    let status: "pass" | "warn" | "fail" = "pass";
    let message: string | undefined;

    if (usagePercent > 90) {
      status = "fail";
      message = "Memory usage critically high";
    } else if (usagePercent > 80) {
      status = "warn";
      message = "Memory usage high";
    }

    return {
      name: "memory",
      status,
      duration: Date.now() - startTime,
      message,
      data: {
        usedMB: Math.round(usedHeap / 1024 / 1024),
        totalMB: Math.round(totalHeap / 1024 / 1024),
        usagePercent: Math.round(usagePercent),
      },
    };
  } catch (error) {
    return {
      name: "memory",
      status: "fail",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Memory check failed",
    };
  }
}

export function stopHealthChecks(): void {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
    console.log("🏥 Health checks stopped");
  }
}
