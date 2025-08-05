import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

const auditPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Audit logging decorator for requests
  fastify.decorateRequest("auditLog", function (action: string, metadata: object = {}) {
    const request = this as FastifyRequest;

    // Create audit log entry
    const auditEntry = {
      user_id: request.user?.id || "anonymous",
      tenant_id: request.tenantId || "unknown",
      action,
      resource_type: getResourceTypeFromPath(request.routeOptions?.url || request.url),
      resource_id: extractResourceId(request.params as Record<string, string>),
      metadata: {
        ...metadata,
        method: request.method,
        url: request.url,
        userRole: request.user?.role,
      },
      ip_address: getClientIP(request),
      user_agent: request.headers["user-agent"] || "unknown",
    };

    // Log locally for immediate debugging
    request.log.info(auditEntry, `Healthcare audit: ${action}`);

    // Insert into audit log table (async, don't block request)
    fastify.insertAuditLog(auditEntry).catch((error) => {
      fastify.log.error(error, "Failed to insert audit log");
    });
  });

  // Global audit hook for all requests to healthcare endpoints
  fastify.addHook("preHandler", async (request, reply) => {
    // Skip audit for health checks and static assets
    if (
      request.url.startsWith("/health") ||
      request.url.startsWith("/static") ||
      request.url.startsWith("/favicon")
    ) {
      return;
    }

    // Auto-audit for sensitive healthcare operations
    const sensitiveActions = [
      "/api/patients",
      "/api/appointments",
      "/api/medical-records",
      "/api/prescriptions",
      "/api/billing",
    ];

    const isSensitiveEndpoint = sensitiveActions.some((path) => request.url.startsWith(path));

    if (isSensitiveEndpoint) {
      const action = `${request.method.toLowerCase()}_${getResourceTypeFromPath(request.url)}`;
      request.auditLog(action, {
        autoAudit: true,
        endpoint: request.url,
      });
    }
  });

  // LGPD compliance - log data access and modifications
  fastify.addHook("onResponse", async (request, reply) => {
    // Log successful operations that modify patient data
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      const dataModifyingMethods = ["POST", "PUT", "PATCH", "DELETE"];

      if (dataModifyingMethods.includes(request.method)) {
        const action = `${request.method.toLowerCase()}_completed`;
        request.auditLog(action, {
          statusCode: reply.statusCode,
          responseTime: reply.elapsedTime,
          lgpdCompliance: true,
        });
      }
    }
  });

  // ANVISA compliance - special audit for controlled substances and medical devices
  fastify.decorate(
    "auditControlledSubstance",
    async (
      request: FastifyRequest,
      substanceInfo: {
        substanceId: string;
        substanceName: string;
        quantity: number;
        prescriberId: string;
        patientId: string;
        anvisaCode?: string;
      },
    ) => {
      const auditEntry = {
        user_id: request.user?.id || "system",
        tenant_id: request.tenantId,
        action: "controlled_substance_prescribed",
        resource_type: "controlled_substance",
        resource_id: substanceInfo.substanceId,
        metadata: {
          ...substanceInfo,
          prescriber_license: request.user?.licenseNumber,
          anvisa_compliance: true,
          cfm_regulation: "CFM Resolution 1246/88",
        },
        ip_address: getClientIP(request),
        user_agent: request.headers["user-agent"] || "unknown",
      };

      // This must be synchronous for ANVISA compliance
      try {
        await fastify.insertAuditLog(auditEntry);
        request.log.info(auditEntry, "ANVISA controlled substance audit logged");
      } catch (error) {
        request.log.error(error, "CRITICAL: Failed to log ANVISA controlled substance audit");
        throw new Error("Audit logging failed - operation cannot proceed");
      }
    },
  );

  fastify.log.info("✅ Audit logging plugin registered successfully");
};

// Helper functions
function getResourceTypeFromPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "api") {
    return segments[1].replace(/s$/, ""); // Remove plural 's'
  }
  return "unknown";
}

function extractResourceId(params: Record<string, string>): string {
  return params.id || params.patientId || params.appointmentId || "unknown";
}

function getClientIP(request: FastifyRequest): string {
  return (
    (request.headers["x-forwarded-for"] as string) ||
    (request.headers["x-real-ip"] as string) ||
    request.ip ||
    "unknown"
  );
}

export default fp(auditPlugin, "4.x");
