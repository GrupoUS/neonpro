import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { auditService } from "../services/audit.service";
import type { AuditContext, AuditEvent } from "../types/audit";
import { AuditAction, AuditSeverity, ResourceType } from "../types/audit";

// Type definitions for audit middleware
interface ResponseBody {
  [key: string]: unknown;
}

interface RequestBody {
  [key: string]: unknown;
  name?: string;
  title?: string;
  description?: string;
}

interface UserAgentInfo {
  raw: string;
  is_mobile: boolean;
  is_bot: boolean;
  browser: string;
  os: string;
}

interface ResponseInfo {
  status_code: number;
  duration_ms: number;
  error_message?: string;
  response_body?: ResponseBody;
}

/**
 * Middleware de auditoria para capturar automaticamente eventos HTTP
 */
export const auditMiddleware = () => {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Extrair informações do contexto
    const auditContext: AuditContext = {
      ip_address: getClientIP(c),
      user_agent: c.req.header("User-Agent"),
      start_time: startTime,
      request_id: requestId,
    };

    // Tentar extrair informações do usuário do JWT
    try {
      const token = extractToken(c);
      if (token) {
        const payload = await verify(token, process.env.JWT_SECRET!);
        auditContext.user_id = payload.sub as string;
        auditContext.session_id = payload.jti as string;
      }
    } catch (error) {
      // Token inválido ou não presente - continuar sem user_id
      console.debug(
        "JWT validation failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }

    // Adicionar contexto ao request para uso posterior
    c.set("auditContext", auditContext);

    // Verificar se deve pular auditoria para esta rota
    if (shouldSkipAudit(c.req.path, c.req.method)) {
      await next();
      return;
    }

    let responseBody: ResponseBody | undefined;
    let statusCode: number;
    let errorMessage: string | undefined;

    try {
      // Executar próximo middleware/handler
      await next();

      statusCode = c.res.status;

      // Capturar corpo da resposta se necessário
      if (shouldCaptureResponseBody(c.req.path, c.req.method)) {
        try {
          const responseText = await c.res.clone().text();
          if (responseText) {
            responseBody = JSON.parse(responseText);
          }
        } catch {
          // Ignorar erros de parsing do response body
        }
      }
    } catch (error) {
      statusCode = 500;
      errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      throw error; // Re-throw para não interferir no fluxo de erro
    } finally {
      // Registrar evento de auditoria de forma assíncrona
      setImmediate(() => {
        logAuditEvent(c, auditContext, {
          status_code: statusCode,
          duration_ms: Date.now() - startTime,
          error_message: errorMessage,
          response_body: responseBody,
        }).catch(error => {
          console.error("Erro ao registrar evento de auditoria:", error);
        });
      });
    }
  };
};

/**
 * Registra evento de auditoria baseado na requisição HTTP
 */
async function logAuditEvent(
  c: Context,
  auditContext: AuditContext,
  responseInfo: ResponseInfo,
): Promise<void> {
  try {
    const method = c.req.method;
    const path = c.req.path;
    const query = c.req.query();

    // Determinar ação baseada no método HTTP e rota
    const action = determineAction(method, path);

    // Determinar tipo de recurso baseado na rota
    const resourceType = determineResourceType(path);

    // Extrair ID do recurso da URL
    const resourceId = extractResourceId(path);

    // Determinar severidade baseada no status code e ação
    const severity = determineSeverity(
      responseInfo.status_code,
      action,
      responseInfo.error_message,
    );

    // Capturar dados da requisição se necessário
    let requestBody: RequestBody | undefined;
    if (shouldCaptureRequestBody(method, path)) {
      try {
        requestBody = await c.req.json() as RequestBody;
      } catch {
        // Ignorar erros de parsing
      }
    }

    // Construir evento de auditoria
    const auditEvent: AuditEvent = {
      user_id: auditContext.user_id,
      session_id: auditContext.session_id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: extractResourceName(path, requestBody),
      ip_address: auditContext.ip_address,
      user_agent: auditContext.user_agent,
      method: method as unknown,
      endpoint: path,
      status_code: responseInfo.status_code,
      severity,
      duration_ms: responseInfo.duration_ms,
      error_message: responseInfo.error_message,
      details: {
        request_id: auditContext.request_id,
        query_params: Object.keys(query).length > 0 ? query : undefined,
        request_body: requestBody,
        response_body: responseInfo.response_body,
        user_agent_parsed: parseUserAgent(auditContext.user_agent),
      },
      timestamp: new Date(),
    };

    // Registrar evento
    await auditService.logEvent(auditEvent);
  } catch (error) {
    console.error("Erro interno no logging de auditoria:", error);
  }
}

/**
 * Extrai token JWT do header Authorization ou cookie
 */
function extractToken(c: Context): string | null {
  // Tentar header Authorization
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Tentar cookie
  const tokenCookie = getCookie(c, "auth_token");
  if (tokenCookie) {
    return tokenCookie;
  }

  return null;
}

/**
 * Extrai IP do cliente considerando proxies
 */
function getClientIP(c: Context): string {
  // Verificar headers de proxy
  const xForwardedFor = c.req.header("X-Forwarded-For");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = c.req.header("X-Real-IP");
  if (xRealIP) {
    return xRealIP;
  }

  // Fallback para IP direto (pode não estar disponível em alguns ambientes)
  return c.req.header("CF-Connecting-IP") || "unknown";
}

/**
 * Determina se deve pular auditoria para esta rota
 */
function shouldSkipAudit(path: string, method: string): boolean {
  const skipPaths = [
    "/health",
    "/metrics",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/api/audit/logs", // Evitar loop infinito
    "/api/audit/stats",
    "/api/audit/export",
  ];

  const skipMethods = ["OPTIONS"];

  return skipPaths.some(skipPath => path.startsWith(skipPath))
    || skipMethods.includes(method);
}

/**
 * Determina ação de auditoria baseada no método HTTP e rota
 */
function determineAction(method: string, path: string): AuditAction {
  // Ações específicas baseadas na rota
  if (path.includes("/login")) {
    return AuditAction.LOGIN;
  }
  if (path.includes("/logout")) {
    return AuditAction.LOGOUT;
  }
  if (path.includes("/export")) {
    return AuditAction.EXPORT;
  }
  if (path.includes("/import")) {
    return AuditAction.IMPORT;
  }
  if (path.includes("/backup")) {
    return AuditAction.BACKUP;
  }
  if (path.includes("/restore")) {
    return AuditAction.RESTORE;
  }
  if (path.includes("/reports")) {
    return AuditAction.REPORT_GENERATE;
  }
  if (path.includes("/password")) {
    return AuditAction.PASSWORD_CHANGE;
  }
  if (path.includes("/permissions")) {
    return AuditAction.PERMISSION_CHANGE;
  }
  if (path.includes("/config")) {
    return AuditAction.SYSTEM_CONFIG;
  }

  // Ações baseadas no método HTTP
  switch (method) {
    case "POST":
      return AuditAction.CREATE;
    case "GET":
      return AuditAction.READ;
    case "PUT":
    case "PATCH":
      return AuditAction.UPDATE;
    case "DELETE":
      return AuditAction.DELETE;
    default:
      return AuditAction.DATA_ACCESS;
  }
}

/**
 * Determina tipo de recurso baseado na rota
 */
function determineResourceType(path: string): ResourceType {
  if (path.includes("/patients")) {
    return ResourceType.PATIENT;
  }
  if (path.includes("/appointments")) {
    return ResourceType.APPOINTMENT;
  }
  if (path.includes("/professionals")) {
    return ResourceType.PROFESSIONAL;
  }
  if (path.includes("/payments")) {
    return ResourceType.PAYMENT;
  }
  if (path.includes("/treatments")) {
    return ResourceType.TREATMENT;
  }
  if (path.includes("/medical-records")) {
    return ResourceType.MEDICAL_RECORD;
  }
  if (path.includes("/users")) {
    return ResourceType.USER;
  }
  if (path.includes("/roles")) {
    return ResourceType.ROLE;
  }
  if (path.includes("/permissions")) {
    return ResourceType.PERMISSION;
  }
  if (path.includes("/reports")) {
    return ResourceType.REPORT;
  }
  if (path.includes("/backup")) {
    return ResourceType.BACKUP;
  }
  if (path.includes("/config")) {
    return ResourceType.CONFIGURATION;
  }
  if (path.includes("/audit")) {
    return ResourceType.AUDIT_LOG;
  }

  return ResourceType.SYSTEM;
}

/**
 * Extrai ID do recurso da URL
 */
function extractResourceId(path: string): string | undefined {
  // Padrão comum: /api/resource/:id
  const matches = path.match(/\/([a-f0-9-]{36}|\d+)(?:\/|$)/);
  return matches ? matches[1] : undefined;
}

/**
 * Extrai nome do recurso do corpo da requisição ou URL
 */
function extractResourceName(path: string, requestBody?: RequestBody): string | undefined {
  if (requestBody) {
    return requestBody.name || requestBody.title || requestBody.description;
  }

  // Extrair da URL se possível
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

/**
 * Determina severidade baseada no status code e contexto
 */
function determineSeverity(
  statusCode: number,
  action: AuditAction,
  errorMessage?: string,
): AuditSeverity {
  // Eventos críticos
  if (statusCode === 401 || statusCode === 403) {
    return AuditSeverity.CRITICAL;
  }
  if (action === AuditAction.LOGIN && statusCode !== 200) {
    return AuditSeverity.HIGH;
  }
  if (action === AuditAction.PERMISSION_CHANGE) {
    return AuditSeverity.HIGH;
  }
  if (action === AuditAction.PASSWORD_CHANGE) {
    return AuditSeverity.HIGH;
  }
  if (action === AuditAction.DELETE) {
    return AuditSeverity.MEDIUM;
  }
  if (errorMessage) {
    return AuditSeverity.MEDIUM;
  }

  // Eventos de alta severidade
  if (statusCode >= 500) {
    return AuditSeverity.HIGH;
  }
  if (statusCode >= 400) {
    return AuditSeverity.MEDIUM;
  }

  return AuditSeverity.LOW;
}

/**
 * Determina se deve capturar corpo da requisição
 */
function shouldCaptureRequestBody(method: string, path: string): boolean {
  // Não capturar para métodos GET
  if (method === "GET") {
    return false;
  }

  // Não capturar para rotas de upload de arquivo
  if (path.includes("/upload")) {
    return false;
  }

  // Não capturar para rotas sensíveis
  if (path.includes("/password") || path.includes("/login")) {
    return false;
  }

  return ["POST", "PUT", "PATCH"].includes(method);
}

/**
 * Determina se deve capturar corpo da resposta
 */
function shouldCaptureResponseBody(path: string, method: string): boolean {
  // Capturar apenas para operações de criação e atualização
  if (!["POST", "PUT", "PATCH"].includes(method)) {
    return false;
  }

  // Não capturar para rotas de upload
  if (path.includes("/upload")) {
    return false;
  }

  // Não capturar para rotas de export (podem ser muito grandes)
  if (path.includes("/export")) {
    return false;
  }

  return true;
}

/**
 * Parse básico do User-Agent
 */
function parseUserAgent(userAgent?: string): UserAgentInfo | undefined {
  if (!userAgent) {
    return undefined;
  }

  return {
    raw: userAgent,
    is_mobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
    is_bot: /bot|crawler|spider/i.test(userAgent),
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
  };
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) {
    return "Chrome";
  }
  if (userAgent.includes("Firefox")) {
    return "Firefox";
  }
  if (userAgent.includes("Safari")) {
    return "Safari";
  }
  if (userAgent.includes("Edge")) {
    return "Edge";
  }
  return "Unknown";
}

function extractOS(userAgent: string): string {
  if (userAgent.includes("Windows")) {
    return "Windows";
  }
  if (userAgent.includes("Mac OS")) {
    return "macOS";
  }
  if (userAgent.includes("Linux")) {
    return "Linux";
  }
  if (userAgent.includes("Android")) {
    return "Android";
  }
  if (userAgent.includes("iOS")) {
    return "iOS";
  }
  return "Unknown";
}

/**
 * Middleware específico para eventos de login/logout
 */
export const auditAuthMiddleware = () => {
  return async (c: Context, next: Next) => {
    const path = c.req.path;
    const method = c.req.method;

    if (path.includes("/login") || path.includes("/logout")) {
      const startTime = Date.now();
      const auditContext: AuditContext = {
        ip_address: getClientIP(c),
        user_agent: c.req.header("User-Agent"),
        start_time: startTime,
        request_id: crypto.randomUUID(),
      };

      try {
        await next();

        // Log evento de autenticação
        const action = path.includes("/login") ? AuditAction.LOGIN : AuditAction.LOGOUT;
        const severity = c.res.status === 200 ? AuditSeverity.LOW : AuditSeverity.HIGH;

        const auditEvent: AuditEvent = {
          action,
          resource_type: ResourceType.USER,
          ip_address: auditContext.ip_address,
          user_agent: auditContext.user_agent,
          method: method as unknown,
          endpoint: path,
          status_code: c.res.status,
          severity,
          duration_ms: Date.now() - startTime,
          details: {
            request_id: auditContext.request_id,
            auth_attempt: true,
          },
          timestamp: new Date(),
        };

        // Tentar extrair user_id da resposta de login bem-sucedido
        if (action === AuditAction.LOGIN && c.res.status === 200) {
          try {
            const responseText = await c.res.clone().text();
            const responseData = JSON.parse(responseText);
            if (responseData.user?.id) {
              auditEvent.user_id = responseData.user.id;
            }
          } catch {
            // Ignorar erros de parsing
          }
        }

        await auditService.logEvent(auditEvent);
      } catch (error) {
        // Log tentativa de autenticação falhada
        const auditEvent: AuditEvent = {
          action: path.includes("/login") ? AuditAction.LOGIN : AuditAction.LOGOUT,
          resource_type: ResourceType.USER,
          ip_address: auditContext.ip_address,
          user_agent: auditContext.user_agent,
          method: method as unknown,
          endpoint: path,
          status_code: 500,
          severity: AuditSeverity.CRITICAL,
          duration_ms: Date.now() - startTime,
          error_message: error instanceof Error ? error.message : "Erro de autenticação",
          details: {
            request_id: auditContext.request_id,
            auth_attempt: true,
            failed: true,
          },
          timestamp: new Date(),
        };

        await auditService.logEvent(auditEvent);
        throw error;
      }
    } else {
      await next();
    }
  };
};
