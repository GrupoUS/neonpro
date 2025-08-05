import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: FastifyRequest) => string;
  onLimitReached?: (request: FastifyRequest) => void;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Rate limiting específico para sistema de saúde brasileiro
const healthcareRateLimits = {
  // APIs críticas de emergência - sem limite durante emergências
  emergency: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 1000, // Alto limite para emergências
    emergencyOverride: true,
  },

  // APIs de sinais vitais - frequentes mas controladas
  vitalSigns: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 120, // 2 por segundo máximo
    skipSuccessfulRequests: false,
  },

  // APIs de pacientes - moderadas
  patients: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 60, // 1 por segundo
    skipSuccessfulRequests: true,
  },

  // APIs de consultas - moderadas
  appointments: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 30, // 1 a cada 2 segundos
    skipSuccessfulRequests: true,
  },

  // APIs de cobrança - conservativas
  billing: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20, // 1 a cada 3 segundos
    skipSuccessfulRequests: true,
  },

  // APIs de relatórios - muito conservativas
  reports: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 10, // 1 a cada 30 segundos
    skipSuccessfulRequests: true,
  },

  // APIs de autenticação - moderadas com bloqueio
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas por 15 minutos
    skipSuccessfulRequests: false,
    blockDuration: 30 * 60 * 1000, // 30 minutos de bloqueio
  },
};

class HealthcareRateLimiter {
  private store: RateLimitStore = {};
  private blockedIPs: Map<string, number> = new Map();

  constructor() {
    // Limpeza automática a cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();

    // Limpar store expirado
    Object.keys(this.store).forEach((key) => {
      const entry = this.store[key];
      if (entry && entry.resetTime < now) {
        delete this.store[key];
      }
    });

    // Limpar IPs bloqueados expirados
    this.blockedIPs.forEach((unblockTime, ip) => {
      if (unblockTime < now) {
        this.blockedIPs.delete(ip);
      }
    });
  }

  private generateKey(request: FastifyRequest, endpoint: string): string {
    const tenantId = request.headers["x-tenant-id"] || "anonymous";
    const userId = (request.user as any)?.userId || "anonymous";
    const ip = request.ip;

    // Para endpoints críticos, usar apenas IP
    if (endpoint === "emergency") {
      return `${endpoint}:${ip}`;
    }

    // Para outros endpoints, combinar tenant + usuário + IP
    return `${endpoint}:${tenantId}:${userId}:${ip}`;
  }

  private isBlocked(ip: string): boolean {
    const unblockTime = this.blockedIPs.get(ip);
    if (!unblockTime) return false;

    if (Date.now() < unblockTime) {
      return true;
    }

    this.blockedIPs.delete(ip);
    return false;
  }

  private blockIP(ip: string, duration: number) {
    this.blockedIPs.set(ip, Date.now() + duration);
  }

  private isEmergencyOverride(request: FastifyRequest): boolean {
    // Verificar se existe override de emergência
    const emergencyHeader = request.headers["x-emergency-override"];
    const emergencyToken = request.headers["x-emergency-token"];

    // Validar token de emergência (em produção, usar token criptografado)
    return emergencyHeader === "true" && emergencyToken === process.env.EMERGENCY_OVERRIDE_TOKEN;
  }

  public checkLimit(
    request: FastifyRequest,
    endpoint: string,
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    // Verificar se IP está bloqueado
    if (this.isBlocked(request.ip)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.blockedIPs.get(request.ip)!,
        retryAfter: Math.ceil((this.blockedIPs.get(request.ip)! - Date.now()) / 1000),
      };
    }

    const config = healthcareRateLimits[endpoint as keyof typeof healthcareRateLimits];
    if (!config) {
      // Se não há configuração específica, permitir
      return { allowed: true, remaining: 999, resetTime: Date.now() + 60000 };
    }

    // Override de emergência
    if ((config as any).emergencyOverride && this.isEmergencyOverride(request)) {
      return { allowed: true, remaining: 999, resetTime: Date.now() + config.windowMs };
    }

    const key = this.generateKey(request, endpoint);
    const now = Date.now();
    const _windowStart = now - config.windowMs;

    // Obter ou criar entrada no store
    let entry = this.store[key];
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      this.store[key] = entry;
    }

    // Verificar se excedeu o limite
    if (entry.count >= config.maxRequests) {
      // Para autenticação, bloquear IP temporariamente
      if (endpoint === "auth" && (config as any).blockDuration) {
        this.blockIP(request.ip, (config as any).blockDuration);
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Incrementar contador
    entry.count++;

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  public getEndpointFromPath(path: string): string {
    // Mapear caminhos para endpoints de rate limiting
    if (path.includes("/emergency") || path.includes("/alert")) return "emergency";
    if (path.includes("/vital-signs")) return "vitalSigns";
    if (path.includes("/patients")) return "patients";
    if (path.includes("/appointments")) return "appointments";
    if (path.includes("/billing") || path.includes("/payments")) return "billing";
    if (path.includes("/reports") || path.includes("/analytics")) return "reports";
    if (path.includes("/auth") || path.includes("/login")) return "auth";

    return "general";
  }

  // Métodos públicos para acessar informações de bloqueio
  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  public getBlockedIPInfo(ip: string): number | undefined {
    return this.blockedIPs.get(ip);
  }

  public getBlockedIPsCount(): number {
    return this.blockedIPs.size;
  }

  public getStoreSize(): number {
    return Object.keys(this.store).length;
  }

  public unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }
}

// Plugin de rate limiting para Fastify
async function rateLimitingPlugin(fastify: FastifyInstance) {
  const rateLimiter = new HealthcareRateLimiter();

  // Middleware de rate limiting
  fastify.addHook("preHandler", async (request, reply) => {
    const endpoint = rateLimiter.getEndpointFromPath(request.url);
    const result = rateLimiter.checkLimit(request, endpoint);

    // Adicionar headers de rate limiting
    reply.header(
      "X-RateLimit-Limit",
      healthcareRateLimits[endpoint as keyof typeof healthcareRateLimits]?.maxRequests || 60,
    );
    reply.header("X-RateLimit-Remaining", result.remaining);
    reply.header("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

    if (!result.allowed) {
      // Log de tentativa de excesso de rate limit
      request.log.warn({
        event: "rate_limit_exceeded",
        endpoint,
        ip: request.ip,
        userAgent: request.headers["user-agent"],
        tenantId: request.headers["x-tenant-id"],
        retryAfter: result.retryAfter,
      });

      if (result.retryAfter) {
        reply.header("Retry-After", result.retryAfter);
      }

      // Resposta específica para sistema de saúde
      reply.code(429).send({
        error: "Rate limit exceeded",
        message: "Muitas requisições. Por favor, aguarde antes de tentar novamente.",
        retryAfter: result.retryAfter,
        endpoint,
        timestamp: new Date().toISOString(),
        // Para emergências, fornecer informações de override
        ...(endpoint === "emergency" && {
          emergencyOverride:
            "Para situações de emergência real, entre em contato com o suporte técnico",
        }),
      });
    }
  });

  // Endpoint para verificar status de rate limiting (apenas admin)
  fastify.get(
    "/api/admin/rate-limit/status",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
    },
    async (request, reply) => {
      const ip = request.ip;
      const stats = {
        blocked: rateLimiter.isIPBlocked(ip),
        blockedUntil: rateLimiter.getBlockedIPInfo(ip),
        currentLimits: healthcareRateLimits,
        storeSize: rateLimiter.getStoreSize(),
        blockedIPsCount: rateLimiter.getBlockedIPsCount(),
      };

      reply.send({
        success: true,
        data: stats,
      });
    },
  );

  // Endpoint para remover bloqueio de IP (apenas admin, para emergências)
  fastify.post(
    "/api/admin/rate-limit/unblock",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
      schema: {
        body: {
          type: "object",
          required: ["ip", "reason"],
          properties: {
            ip: { type: "string" },
            reason: { type: "string" },
            emergencyJustification: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { ip, reason, emergencyJustification } = request.body as any;
      const { userId, tenantId } = request.user as { userId: string; tenantId: string };

      // Remover bloqueio
      rateLimiter.unblockIP(ip);

      // Log da ação de desbloqueio
      request.log.info({
        event: "rate_limit_unblock",
        unblockedIP: ip,
        reason,
        emergencyJustification,
        adminUserId: userId,
        tenantId,
        timestamp: new Date().toISOString(),
      });

      reply.send({
        success: true,
        message: `IP ${ip} desbloqueado com sucesso`,
        reason,
        timestamp: new Date().toISOString(),
      });
    },
  );

  // Decorar fastify com instância do rate limiter para uso em outros plugins
  fastify.decorate("rateLimiter", rateLimiter);
}

export default fp(rateLimitingPlugin, {
  name: "healthcare-rate-limiting",
});

// Tipos para TypeScript
declare module "fastify" {
  interface FastifyInstance {
    rateLimiter: HealthcareRateLimiter;
  }
}
