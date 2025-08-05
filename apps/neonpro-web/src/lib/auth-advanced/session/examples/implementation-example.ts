// ============================================================================
// Session Management System - Implementation Example
// NeonPro - Session Management & Security
// ============================================================================

import type { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";
import type { NextRequest, NextResponse } from "next/server";
import type { SessionSystem } from "../index";
import type { DeviceFingerprint, SessionConfig, SessionLocation, UserSession } from "../types";

// ============================================================================
// CONFIGURATION SETUP
// ============================================================================

/**
 * Configuração do sistema de sessões para diferentes ambientes
 */
const getSessionConfig = (environment: "development" | "production"): SessionConfig => {
  const baseConfig: SessionConfig = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    renewalThreshold: 0.25,
    maxConcurrentSessions: 3,
    requireDeviceVerification: false,
    enableLocationTracking: true,
    enableDeviceFingerprinting: true,
    tokenRotationInterval: 15 * 60 * 1000,
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
    maxSessionDuration: 8 * 60 * 60 * 1000,
    cleanupInterval: 60 * 60 * 1000,
    retainExpiredSessions: 24 * 60 * 60 * 1000,
    redis: {
      enabled: true,
      keyPrefix: "neonpro:session:",
      ttl: 1800,
    },
    lgpd: {
      enabled: true,
      consentRequired: true,
      dataRetentionDays: 365,
      anonymizeAfterDays: 1095,
    },
  };

  if (environment === "production") {
    return {
      ...baseConfig,
      sessionTimeout: 15 * 60 * 1000, // 15 minutes in production
      requireDeviceVerification: true,
      maxConcurrentSessions: 2,
    };
  }

  return baseConfig;
};

// ============================================================================
// SESSION SYSTEM INITIALIZATION
// ============================================================================

/**
 * Inicializa o sistema de sessões com configurações apropriadas
 */
export class SessionService {
  private sessionSystem: SessionSystem;
  private initialized = false;

  constructor() {
    this.sessionSystem = new SessionSystem();
  }

  async initialize() {
    if (this.initialized) return;

    // Configurar Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Configurar Redis (opcional)
    const redis = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        })
      : undefined;

    // Configuração baseada no ambiente
    const config = getSessionConfig(
      process.env.NODE_ENV === "production" ? "production" : "development",
    );

    await this.sessionSystem.initialize({
      supabase,
      redis,
      config,
    });

    // Configurar event listeners
    this.setupEventListeners();

    this.initialized = true;
  }

  private setupEventListeners() {
    // Eventos de segurança
    this.sessionSystem.on("security_event", (event) => {
      console.log("🚨 Security Event:", event);

      if (event.threatLevel === "high") {
        // Notificar equipe de segurança
        this.notifySecurityTeam(event);
      }
    });

    // Atividade suspeita
    this.sessionSystem.on("suspicious_activity", (activity) => {
      console.log("⚠️ Suspicious Activity:", activity);

      if (activity.riskScore > 80) {
        // Terminar sessão automaticamente
        this.sessionSystem.terminateSession(activity.sessionId, "high_risk_activity");
      }
    });

    // Criação de sessão
    this.sessionSystem.on("session_created", (session) => {
      console.log("✅ Session Created:", {
        sessionId: session.id,
        userId: session.userId,
        deviceType: session.deviceFingerprint?.platform,
      });
    });

    // Término de sessão
    this.sessionSystem.on("session_terminated", (data) => {
      console.log("🔚 Session Terminated:", {
        sessionId: data.sessionId,
        reason: data.reason,
      });
    });
  }

  private async notifySecurityTeam(event: any) {
    // Implementar notificação (email, Slack, etc.)
    console.log("📧 Notifying security team about:", event);
  }

  getSessionSystem() {
    if (!this.initialized) {
      throw new Error("SessionService not initialized. Call initialize() first.");
    }
    return this.sessionSystem;
  }
}

// Instância singleton
const sessionService = new SessionService();
export { sessionService };

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Middleware para autenticação de sessões em Next.js
 */
export async function authMiddleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/register", "/forgot-password", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar se há token de sessão
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Inicializar sistema se necessário
    await sessionService.initialize();
    const sessionSystem = sessionService.getSessionSystem();

    // Validar sessão
    const validation = await sessionSystem.validateSession(sessionToken);

    if (!validation.valid) {
      // Sessão inválida - redirecionar para login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session_token");
      return response;
    }

    // Atualizar atividade da sessão
    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await sessionSystem.updateActivity(sessionToken, {
      ipAddress: clientIP,
      userAgent,
    });

    // Verificar se a sessão precisa ser renovada
    if (validation.needsRenewal) {
      const renewal = await sessionSystem.renewSession(sessionToken);
      if (renewal.success && renewal.session) {
        // Atualizar cookie com novo token
        const response = NextResponse.next();
        response.cookies.set("session_token", renewal.session.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 60, // 30 minutes
        });
        return response;
      }
    }

    // Adicionar dados da sessão aos headers para uso nas páginas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", validation.session!.userId);
    requestHeaders.set("x-clinic-id", validation.session!.clinicId);
    requestHeaders.set("x-session-id", validation.session!.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// ============================================================================
// API ROUTE HELPERS
// ============================================================================

/**
 * Helper para criar sessão em API routes
 */
export async function createUserSession(userId: string, clinicId: string, request: NextRequest) {
  await sessionService.initialize();
  const sessionSystem = sessionService.getSessionSystem();

  // Extrair informações do request
  const clientIP = request.ip || request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Gerar fingerprint do dispositivo (simplificado)
  const deviceFingerprint: DeviceFingerprint = {
    userAgent,
    screen: { width: 1920, height: 1080 }, // Valores padrão
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    platform: "Web",
    plugins: [],
    canvas: "",
    webgl: "",
  };

  // Criar sessão
  const result = await sessionSystem.createSession({
    userId,
    clinicId,
    deviceFingerprint,
    ipAddress: clientIP,
    userAgent,
  });

  if (result.success && result.session) {
    return {
      success: true,
      sessionToken: result.session.sessionToken,
      expiresAt: result.session.expiresAt,
      deviceRegistered: result.deviceRegistered,
    };
  }

  return {
    success: false,
    error: result.error,
  };
}

/**
 * Helper para terminar sessão em API routes
 */
export async function terminateUserSession(sessionToken: string, reason: string = "user_logout") {
  await sessionService.initialize();
  const sessionSystem = sessionService.getSessionSystem();

  return await sessionSystem.terminateSession(sessionToken, reason);
}

/**
 * Helper para obter dados da sessão atual
 */
export async function getCurrentSession(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  await sessionService.initialize();
  const sessionSystem = sessionService.getSessionSystem();

  const validation = await sessionSystem.validateSession(sessionToken);

  return validation.valid ? validation.session : null;
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook React para gerenciar sessão no cliente
 */
export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.success) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      setError("Failed to check session");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSession(data.session);
        return { success: true };
      } else {
        setError(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      const error = "Login failed";
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSession(null);
      window.location.href = "/login";
    }
  };

  return {
    session,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
}

// ============================================================================
// EXAMPLE API ROUTES
// ============================================================================

/**
 * Exemplo de API route para login
 * Arquivo: app/api/auth/login/route.ts
 */
export async function loginApiExample(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar credenciais (implementar sua lógica)
    const user = await validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Criar sessão
    const sessionResult = await createUserSession(user.id, user.clinicId, request);

    if (!sessionResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to create session" },
        { status: 500 },
      );
    }

    // Configurar cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set("session_token", sessionResult.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60, // 30 minutes
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Exemplo de API route para logout
 * Arquivo: app/api/auth/logout/route.ts
 */
export async function logoutApiExample(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      await terminateUserSession(sessionToken, "user_logout");
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Exemplo de API route para verificar sessão
 * Arquivo: app/api/auth/session/route.ts
 */
export async function sessionApiExample(request: NextRequest) {
  try {
    const session = await getCurrentSession(request);

    if (session) {
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          userId: session.userId,
          clinicId: session.clinicId,
          expiresAt: session.expiresAt,
          securityScore: session.securityScore,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: "No valid session" }, { status: 401 });
    }
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Função placeholder para validação de credenciais
 * Implementar com sua lógica de autenticação
 */
async function validateUserCredentials(email: string, password: string) {
  // Implementar validação real
  // Exemplo: verificar no banco de dados, hash de senha, etc.
  return null;
}

/**
 * Função para obter localização do IP (opcional)
 */
async function getLocationFromIP(ipAddress: string): Promise<SessionLocation | undefined> {
  try {
    // Usar serviço de geolocalização (ex: ipapi.co, ipinfo.io)
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();

    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        country: data.country_name,
        timestamp: new Date(),
      };
    }
  } catch (error) {
    console.error("Failed to get location from IP:", error);
  }

  return undefined;
}

/**
 * Função para gerar fingerprint mais detalhado no cliente
 */
export function generateClientFingerprint(): DeviceFingerprint {
  if (typeof window === "undefined") {
    // Server-side fallback
    return {
      userAgent: "server",
      screen: { width: 0, height: 0 },
      timezone: "UTC",
      language: "en",
      platform: "server",
      plugins: [],
      canvas: "",
      webgl: "",
    };
  }

  // Client-side fingerprinting
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx?.fillText("fingerprint", 10, 10);
  const canvasFingerprint = canvas.toDataURL();

  return {
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    plugins: Array.from(navigator.plugins).map((p) => p.name),
    canvas: canvasFingerprint,
    webgl: getWebGLFingerprint(),
  };
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) return "";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "";

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch (error) {
    return "";
  }
}

export default sessionService;
