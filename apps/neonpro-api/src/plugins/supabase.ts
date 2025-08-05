import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

interface SupabasePluginOptions {
  url: string;
  anonKey: string;
  serviceKey: string;
  connectionPooling?: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
}

const supabasePlugin: FastifyPluginAsync<SupabasePluginOptions> = async (
  fastify: FastifyInstance,
  options: SupabasePluginOptions,
) => {
  // Service role client for admin operations and connection pooling
  const serviceClient = createClient(options.url, options.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-application-name": "neonpro-healthcare-api",
      },
    },
    // Connection pooling configuration
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  // Decorate fastify instance with service client
  fastify.decorate("supabaseClient", serviceClient);

  // Add user-authenticated client to requests
  fastify.decorateRequest("supabaseClient", null);

  // Pre-handler hook to create user-authenticated clients
  fastify.addHook("preHandler", async (request) => {
    if (request.headers.authorization) {
      const token = request.headers.authorization.replace("Bearer ", "");

      // Create user-authenticated client
      request.supabaseClient = createClient(options.url, options.anonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      // Use service client for non-authenticated requests
      request.supabaseClient = serviceClient;
    }
  });

  // Health check for database connectivity
  fastify.decorate("checkDatabaseHealth", async (): Promise<"healthy" | "unhealthy"> => {
    try {
      const { data, error } = await serviceClient.from("health_check").select("id").limit(1);

      if (error && error.code !== "PGRST116") {
        // PGRST116 = table not found, which is OK
        fastify.log.error("Database health check failed:", error);
        return "unhealthy";
      }

      return "healthy";
    } catch (error) {
      fastify.log.error("Database health check error:", error);
      return "unhealthy";
    }
  });

  // Healthcare-specific database utilities
  fastify.decorate("getTenantPatients", async (tenantId: string, limit = 20, offset = 0) => {
    const { data, error, count } = await serviceClient
      .from("patients")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }

    return { patients: data || [], total: count || 0 };
  });

  // Tenant-aware appointment queries
  fastify.decorate(
    "getTenantAppointments",
    async (
      tenantId: string,
      filters: {
        status?: string;
        date?: string;
        patientId?: string;
      } = {},
      limit = 50,
      offset = 0,
    ) => {
      let query = serviceClient
        .from("appointments")
        .select(`
        *,
        patients!inner(id, name, medical_record_number),
        providers!inner(id, name, specialization)
      `)
        .eq("tenant_id", tenantId)
        .range(offset, offset + limit - 1)
        .order("appointment_date", { ascending: true });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.date) {
        query = query
          .gte("appointment_date", filters.date)
          .lt(
            "appointment_date",
            new Date(new Date(filters.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          );
      }

      if (filters.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }

      return { appointments: data || [], total: count || 0 };
    },
  );

  // Audit log insertion
  fastify.decorate(
    "insertAuditLog",
    async (logEntry: {
      user_id: string;
      tenant_id: string;
      action: string;
      resource_type: string;
      resource_id: string;
      metadata: Record<string, any>;
      ip_address: string;
      user_agent: string;
    }) => {
      const { error } = await serviceClient.from("audit_logs").insert({
        ...logEntry,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        fastify.log.error("Failed to insert audit log:", error);
        // Don't throw error to avoid disrupting main request flow
      }
    },
  );

  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    fastify.log.info("Closing Supabase connections...");
    // Supabase client doesn't require explicit closing in current version
    // but we log the shutdown for monitoring purposes
  });

  fastify.log.info("✅ Supabase plugin registered successfully");
};
export default fp(supabasePlugin, "4.x");
