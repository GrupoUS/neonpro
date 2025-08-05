import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Basic health check endpoint
  fastify.get(
    "/",
    {
      schema: {
        description: "Basic health check for NeonPro Healthcare API",
        tags: ["health"],
        response: {
          200: Type.Object({
            status: Type.Literal("healthy"),
            timestamp: Type.String({ format: "date-time" }),
            version: Type.String(),
            service: Type.String(),
            uptime: Type.Number(),
          }),
        },
      },
    },
    async (_request, _reply) => {
      return {
        status: "healthy" as const,
        timestamp: new Date().toISOString(),
        version: process.env.SERVICE_VERSION || "1.0.0",
        service: "neonpro-healthcare-api",
        uptime: process.uptime(),
      };
    },
  );

  // Detailed health check with dependencies
  fastify.get(
    "/detailed",
    {
      schema: {
        description: "Detailed health check including database and external services",
        tags: ["health"],
        response: {
          200: Type.Object({
            status: Type.Union([Type.Literal("healthy"), Type.Literal("degraded")]),
            timestamp: Type.String({ format: "date-time" }),
            version: Type.String(),
            service: Type.String(),
            uptime: Type.Number(),
            dependencies: Type.Object({
              database: Type.Union([Type.Literal("healthy"), Type.Literal("unhealthy")]),
              supabase: Type.Union([Type.Literal("healthy"), Type.Literal("unhealthy")]),
              redis: Type.Optional(
                Type.Union([Type.Literal("healthy"), Type.Literal("unhealthy")]),
              ),
            }),
            system: Type.Object({
              memory: Type.Object({
                used: Type.Number(),
                total: Type.Number(),
                percentage: Type.Number(),
              }),
              cpu: Type.Object({
                usage: Type.Number(),
              }),
            }),
          }),
        },
      },
    },
    async (_request, _reply) => {
      // Check database health
      const databaseHealth = (await fastify.checkDatabaseHealth?.()) || {
        status: "unknown",
        details: "Database health check not available",
      };

      // Check Redis health if available
      let redisHealth: "healthy" | "unhealthy" | undefined;
      if (fastify.redis) {
        try {
          await fastify.redis.ping();
          redisHealth = "healthy";
        } catch (_error) {
          redisHealth = "unhealthy";
        }
      }

      // Get system metrics
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal + memUsage.external;
      const usedMemory = memUsage.heapUsed;

      // Determine overall status
      const allHealthy =
        databaseHealth.status === "healthy" &&
        (redisHealth === undefined || redisHealth === "healthy");

      const healthStatus = {
        status: allHealthy ? ("healthy" as const) : ("degraded" as const),
        timestamp: new Date().toISOString(),
        version: process.env.SERVICE_VERSION || "1.0.0",
        service: "neonpro-healthcare-api",
        uptime: process.uptime(),
        dependencies: {
          database: databaseHealth.status,
          supabase: databaseHealth, // Same as database for Supabase
          ...(redisHealth && { redis: redisHealth }),
        },
        system: {
          memory: {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            percentage: Math.round((usedMemory / totalMemory) * 100),
          },
          cpu: {
            usage: Math.round(process.cpuUsage().user / 1000000), // Convert to seconds
          },
        },
      };

      // Log health check for monitoring
      fastify.log.info(healthStatus, "Detailed health check performed");

      return healthStatus;
    },
  );

  // Readiness probe for Kubernetes
  fastify.get(
    "/ready",
    {
      schema: {
        description: "Kubernetes readiness probe",
        tags: ["health"],
        response: {
          200: Type.Object({
            status: Type.Literal("ready"),
            timestamp: Type.String({ format: "date-time" }),
          }),
          503: Type.Object({
            status: Type.Literal("not-ready"),
            reason: Type.String(),
            timestamp: Type.String({ format: "date-time" }),
          }),
        },
      },
    },
    async (_request, reply) => {
      try {
        // Check if database is accessible
        const databaseHealth = (await fastify.checkDatabaseHealth?.()) || {
          status: "unknown",
          details: "Database health check not available",
        };

        if (databaseHealth.status === "unhealthy") {
          reply.code(503);
          return {
            status: "not-ready" as const,
            reason: "Database not accessible",
            timestamp: new Date().toISOString(),
          };
        }

        return {
          status: "ready" as const,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        reply.code(503);
        return {
          status: "not-ready" as const,
          reason: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        };
      }
    },
  );

  // Liveness probe for Kubernetes
  fastify.get(
    "/alive",
    {
      schema: {
        description: "Kubernetes liveness probe",
        tags: ["health"],
        response: {
          200: Type.Object({
            status: Type.Literal("alive"),
            timestamp: Type.String({ format: "date-time" }),
          }),
        },
      },
    },
    async (_request, _reply) => {
      return {
        status: "alive" as const,
        timestamp: new Date().toISOString(),
      };
    },
  );
};

export default healthRoutes;
