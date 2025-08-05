import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

// Healthcare User Interface
export interface HealthcareUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  permissions: string[];
  licenseNumber?: string;
  certifications?: string[];
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Multi-tenant authentication decorator
  fastify.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      // Verify JWT token
      await request.jwtVerify();

      // Extract user info from JWT payload
      const payload = request.user as any;

      // Validate required user properties
      if (!payload.sub || !payload.email) {
        throw new Error("Invalid token payload");
      }

      // Get tenant ID from header or user metadata
      const headerTenantId = request.headers["x-tenant-id"] as string;
      const userTenantId = payload.app_metadata?.tenant_id || payload.tenant_id;

      // Validate tenant access
      if (headerTenantId && userTenantId && headerTenantId !== userTenantId) {
        throw new Error("Tenant access denied");
      }

      // Set tenant ID (prefer header, fallback to user metadata)
      request.tenantId = headerTenantId || userTenantId;

      if (!request.tenantId) {
        throw new Error("Tenant ID required");
      }

      // Enhance user object with healthcare-specific properties
      const healthcareUser: HealthcareUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.app_metadata?.role || payload.role || "patient",
        tenantId: request.tenantId,
        permissions: payload.app_metadata?.permissions || [],
        licenseNumber: payload.app_metadata?.license_number,
        certifications: payload.app_metadata?.certifications || [],
      };

      request.user = healthcareUser;

      fastify.log.info(
        {
          userId: (request.user as HealthcareUser).id,
          tenantId: request.tenantId,
          role: (request.user as HealthcareUser).role,
        },
        "User authenticated successfully",
      );
    } catch (error) {
      fastify.log.warn({ error: (error as Error).message }, "Authentication failed");
      throw new Error("Authentication required");
    }
  });

  // Role-based authorization decorator
  fastify.decorate("requireRole", (allowedRoles: string[]) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.user) {
        throw new Error("Authentication required");
      }

      if (!allowedRoles.includes((request.user as HealthcareUser).role)) {
        fastify.log.warn(
          {
            userId: (request.user as HealthcareUser).id,
            userRole: (request.user as HealthcareUser).role,
            requiredRoles: allowedRoles,
          },
          "Insufficient permissions",
        );
        throw new Error("Insufficient permissions");
      }
    };
  });

  // Permission-based authorization decorator
  fastify.decorate("requirePermission", (requiredPermission: string) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.user) {
        throw new Error("Authentication required");
      }

      if (!(request.user as HealthcareUser).permissions?.includes(requiredPermission)) {
        fastify.log.warn(
          {
            userId: (request.user as HealthcareUser).id,
            userPermissions: (request.user as HealthcareUser).permissions,
            requiredPermission,
          },
          "Missing required permission",
        );
        throw new Error("Missing required permission");
      }
    };
  });

  // Healthcare professional license validation
  fastify.decorate("requireLicense", (requiredLicenseType?: string) => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.user) {
        throw new Error("Authentication required");
      }

      if (!(request.user as HealthcareUser).licenseNumber) {
        throw new Error("Healthcare license required");
      }

      if (
        requiredLicenseType &&
        !(request.user as HealthcareUser).certifications?.includes(requiredLicenseType)
      ) {
        fastify.log.warn(
          {
            userId: (request.user as HealthcareUser).id,
            userCertifications: (request.user as HealthcareUser).certifications,
            requiredLicenseType,
          },
          "Required healthcare certification missing",
        );
        throw new Error("Required healthcare certification missing");
      }
    };
  });

  fastify.log.info("✅ Authentication plugin registered successfully");
};
export default fp(authPlugin, "4.x");
