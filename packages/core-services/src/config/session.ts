// T044: Session management and authentication middleware
import type { Context, Next, MiddlewareHandler } from "hono";

export interface SessionConfig {
  cookieName: string;
  secretKey: string;
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none";
  domain?: string;
  path: string;
  renewThreshold: number; // Renew session if less than this many seconds remain
}

export interface UserSession {
  id: string;
  _userId: string;
  email?: string;
  _role?: string;
  permissions?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
}

export interface SessionStore {
  get(sessionId: string): Promise<UserSession | null>;
  set(sessionId: string, session: UserSession): Promise<void>;
  delete(sessionId: string): Promise<void>;
  cleanup(): Promise<void>;
}

export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, UserSession>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs = 60000) {
    this.cleanupInterval = setInterval(() => {
      void this.cleanup();
    }, cleanupIntervalMs);
  }

  async get(sessionId: string): Promise<UserSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  async set(sessionId: string, session: UserSession): Promise<void> {
    this.sessions.set(sessionId, session);
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async cleanup(): Promise<void> {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.sessions.clear();
  }
}

export class SessionManager {
  private config: SessionConfig;
  private store: SessionStore;

  constructor(config: SessionConfig, store: SessionStore) {
    this.config = config;
    this.store = store;
  }

  generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  async createSession(userData: {
    _userId: string;
    email?: string;
    _role?: string;
    permissions?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ sessionId: string; session: UserSession }> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.maxAge * 1000);

    const session: UserSession = {
      id: sessionId,
      _userId: userData._userId,
      email: userData.email,
      _role: userData._role || "user",
      permissions: userData.permissions || [],
      metadata: userData.metadata || {},
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
    };

    await this.store.set(sessionId, session);
    return { sessionId, session };
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    return await this.store.get(sessionId);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<UserSession>,
  ): Promise<UserSession | null> {
    const session = await this.store.get(sessionId);
    if (!session) return null;

    const updatedSession: UserSession = {
      ...session,
      ...updates,
      lastActivity: new Date().toISOString(),
    };

    await this.store.set(sessionId, updatedSession);
    return updatedSession;
  }

  async renewSession(sessionId: string): Promise<UserSession | null> {
    const session = await this.store.get(sessionId);
    if (!session) return null;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.maxAge * 1000);

    const renewedSession: UserSession = {
      ...session,
      expiresAt: expiresAt.toISOString(),
      lastActivity: now.toISOString(),
    };

    await this.store.set(sessionId, renewedSession);
    return renewedSession;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.store.delete(sessionId);
  }

  shouldRenewSession(session: UserSession): boolean {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const timeRemaining = (expiresAt.getTime() - now.getTime()) / 1000;
    return timeRemaining < this.config.renewThreshold;
  }

  createSessionCookie(sessionId: string): string {
    const cookieOptions = [
      `${this.config.cookieName}=${sessionId}`,
      `Max-Age=${this.config.maxAge}`,
      `Path=${this.config.path}`,
    ];

    if (this.config.secure) {
      cookieOptions.push("Secure");
    }

    if (this.config.httpOnly) {
      cookieOptions.push("HttpOnly");
    }

    if (this.config.sameSite) {
      cookieOptions.push(`SameSite=${this.config.sameSite}`);
    }

    if (this.config.domain) {
      cookieOptions.push(`Domain=${this.config.domain}`);
    }

    return cookieOptions.join("; ");
  }

  createClearCookie(): string {
    return `${this.config.cookieName}=; Max-Age=0; Path=${this.config.path}`;
  }
}

export function createSessionConfig(): SessionConfig {
  return {
    cookieName: process.env.SESSION_COOKIE_NAME || "neonpro_session",
    secretKey: process.env.SESSION_SECRET_KEY || "your-secret-key-here",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400"), // 24 hours
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: (process.env.SESSION_SAME_SITE as any) || "lax",
    domain: process.env.SESSION_DOMAIN,
    path: process.env.SESSION_PATH || "/",
    renewThreshold: parseInt(process.env.SESSION_RENEW_THRESHOLD || "3600"), // 1 hour
  };
}

let sessionManagerInstance: SessionManager | null = null;

export function createSessionManager(
  config?: SessionConfig,
  store?: SessionStore,
): SessionManager {
  const sessionConfig = config || createSessionConfig();
  const sessionStore = store || new MemorySessionStore();
  sessionManagerInstance = new SessionManager(sessionConfig, sessionStore);
  return sessionManagerInstance;
}

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = createSessionManager();
  }
  return sessionManagerInstance;
}

export function sessionMiddleware(options?: {
  required?: boolean;
  roles?: string[];
  permissions?: string[];
}): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const sessionManager = getSessionManager();
    const config = createSessionConfig();

    const cookieSessionId = getCookieValue(
      c.req.header("Cookie") || "",
      config.cookieName,
    );
    const headerSessionId = c.req.header("X-Session-ID");
    const sessionId = headerSessionId || cookieSessionId;

    let session: UserSession | null = null;

    if (sessionId) {
      session = await sessionManager.getSession(sessionId);

      if (session && sessionManager.shouldRenewSession(session)) {
        session = await sessionManager.renewSession(sessionId);
        if (session) {
          c.header("Set-Cookie", sessionManager.createSessionCookie(sessionId));
        }
      }
    }

    if (options?.required && !session) {
      return c.json({ error: "Authentication required" }, 401);
    }

    if (session && options?.roles && options.roles.length > 0) {
      if (!session._role || !options.roles.includes(session._role)) {
        return c.json({ error: "Insufficient permissions" }, 403);
      }
    }

    if (session && options?.permissions && options.permissions.length > 0) {
      const userPermissions = session.permissions || [];
      const hasAllPermissions = options.permissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        return c.json({ error: "Insufficient permissions" }, 403);
      }
    }

    c.set("session", session);
    c.set(
      "user",
      session
        ? {
            id: session._userId,
            email: session.email,
            _role: session._role,
            permissions: session.permissions,
          }
        : null,
    );

    return await next();
  };
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue || null;
    }
  }
  return null;
}

export function requireAuth(options?: {
  roles?: string[];
  permissions?: string[];
}): MiddlewareHandler {
  return sessionMiddleware({
    required: true,
    ...options,
  });
}

export function optionalAuth(): MiddlewareHandler {
  return sessionMiddleware({
    required: false,
  });
}
