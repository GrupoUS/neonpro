/**
 * 🔐 Authentication Middleware - NeonPro API
 * ==========================================
 *
 * Middleware de autenticação JWT com refresh tokens,
 * verificação de roles e permissions para o sistema.
 */

import type { Context, MiddlewareHandler } from "hono";
import { createError } from "./error-handler";

// User roles in the system
export enum UserRole {
  ADMIN = "admin", // System administrator
  CLINIC_OWNER = "clinic_owner", // Clinic owner/manager
  PROFESSIONAL = "professional", // Healthcare professional
  STAFF = "staff", // Administrative staff
  PATIENT = "patient", // Patient (limited access)
}

// Permissions system
export enum Permission {
  // Patient data permissions
  READ_PATIENTS = "read:patients",
  WRITE_PATIENTS = "write:patients",
  DELETE_PATIENTS = "delete:patients",
  EXPORT_PATIENTS = "export:patients",

  // Appointment permissions
  READ_APPOINTMENTS = "read:appointments",
  WRITE_APPOINTMENTS = "write:appointments",
  DELETE_APPOINTMENTS = "delete:appointments",
  RESCHEDULE_APPOINTMENTS = "reschedule:appointments",

  // Professional permissions
  READ_PROFESSIONALS = "read:professionals",
  WRITE_PROFESSIONALS = "write:professionals",
  DELETE_PROFESSIONALS = "delete:professionals",

  // Service permissions
  READ_SERVICES = "read:services",
  WRITE_SERVICES = "write:services",
  DELETE_SERVICES = "delete:services",

  // Analytics permissions
  READ_ANALYTICS = "read:analytics",
  EXPORT_ANALYTICS = "export:analytics",

  // Compliance permissions
  READ_COMPLIANCE = "read:compliance",
  MANAGE_COMPLIANCE = "manage:compliance",
  EXPORT_COMPLIANCE = "export:compliance",

  // System permissions
  MANAGE_USERS = "manage:users",
  MANAGE_CLINICS = "manage:clinics",
  SYSTEM_CONFIG = "system:config",
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions

  [UserRole.CLINIC_OWNER]: [
    Permission.READ_PATIENTS,
    Permission.WRITE_PATIENTS,
    Permission.EXPORT_PATIENTS,
    Permission.READ_APPOINTMENTS,
    Permission.WRITE_APPOINTMENTS,
    Permission.RESCHEDULE_APPOINTMENTS,
    Permission.READ_PROFESSIONALS,
    Permission.WRITE_PROFESSIONALS,
    Permission.READ_SERVICES,
    Permission.WRITE_SERVICES,
    Permission.READ_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.READ_COMPLIANCE,
    Permission.EXPORT_COMPLIANCE,
    Permission.MANAGE_CLINICS,
  ],

  [UserRole.PROFESSIONAL]: [
    Permission.READ_PATIENTS,
    Permission.WRITE_PATIENTS,
    Permission.READ_APPOINTMENTS,
    Permission.WRITE_APPOINTMENTS,
    Permission.RESCHEDULE_APPOINTMENTS,
    Permission.READ_SERVICES,
    Permission.READ_ANALYTICS, // Limited analytics
  ],

  [UserRole.STAFF]: [
    Permission.READ_PATIENTS,
    Permission.WRITE_PATIENTS,
    Permission.READ_APPOINTMENTS,
    Permission.WRITE_APPOINTMENTS,
    Permission.RESCHEDULE_APPOINTMENTS,
    Permission.READ_SERVICES,
  ],

  [UserRole.PATIENT]: [
    // Patients have very limited permissions, mainly for their own data
  ],
};

// JWT payload interface
export interface JWTPayload {
  sub: string; // User ID
  email: string; // User email
  role: UserRole; // User role
  permissions: Permission[]; // User permissions
  clinicId?: string; // Clinic ID (for multi-clinic support)
  professionalId?: string; // Professional ID if applicable
  iat: number; // Issued at
  exp: number; // Expires at
  jti: string; // JWT ID
}

// User context interface
export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  clinicId?: string;
  professionalId?: string;
  isActive: boolean;
  lastLogin?: string;
}

// Mock user store (production should use database)
class UserStore {
  private readonly users = new Map<string, UserContext>([
    [
      "user_123",
      {
        id: "user_123",
        email: "admin@neonpro.com",
        role: UserRole.ADMIN,
        permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
        isActive: true,
      },
    ],
    [
      "user_456",
      {
        id: "user_456",
        email: "doctor@neonpro.com",
        role: UserRole.PROFESSIONAL,
        permissions: ROLE_PERMISSIONS[UserRole.PROFESSIONAL],
        clinicId: "clinic_123",
        professionalId: "prof_123",
        isActive: true,
      },
    ],
    [
      "user_789",
      {
        id: "user_789",
        email: "staff@neonpro.com",
        role: UserRole.STAFF,
        permissions: ROLE_PERMISSIONS[UserRole.STAFF],
        clinicId: "clinic_123",
        isActive: true,
      },
    ],
  ]);

  getUser(id: string): UserContext | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): UserContext | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return;
  }

  updateLastLogin(id: string): void {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
    }
  }
}

// Global user store
const userStore = new UserStore();

/**
 * Simulate JWT token verification
 * In production, use proper JWT library like 'jose'
 */
const verifyToken = async (token: string): Promise<JWTPayload> => {
  // Mock JWT verification - in production use proper JWT verification
  if (token === "mock-access-token") {
    return {
      sub: "user_123",
      email: "admin@neonpro.com",
      role: UserRole.ADMIN,
      permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      jti: "jwt_123",
    };
  }

  if (token === "mock-professional-token") {
    return {
      sub: "user_456",
      email: "doctor@neonpro.com",
      role: UserRole.PROFESSIONAL,
      permissions: ROLE_PERMISSIONS[UserRole.PROFESSIONAL],
      clinicId: "clinic_123",
      professionalId: "prof_123",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "jwt_456",
    };
  }

  throw new Error("Invalid token");
};

/**
 * Check if token is blacklisted (for logout/revocation)
 */
const isTokenBlacklisted = async (_jti: string): Promise<boolean> => {
  // TODO: Implement token blacklist check (Redis/Database)
  return false;
};

/**
 * Main authentication middleware
 */
export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw createError.authentication("Token de acesso obrigatório");
    }

    const token = authHeader.slice(7);

    try {
      // Verify JWT token
      const payload = await verifyToken(token);

      // Check if token is blacklisted
      if (await isTokenBlacklisted(payload.jti)) {
        throw createError.authentication("Token revogado");
      }

      // Check token expiration
      if (payload.exp < Date.now() / 1000) {
        throw createError.authentication("Token expirado");
      }

      // Get user context
      const user = userStore.getUser(payload.sub);
      if (!user) {
        throw createError.authentication("Usuário não encontrado");
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError.authorization("Usuário inativo");
      }

      // Update last login
      userStore.updateLastLogin(user.id);

      // Set user context in request
      c.set("user", user);
      c.set("userId", user.id);
      c.set("userRole", user.role);
      c.set("userPermissions", user.permissions);
      c.set("clinicId", user.clinicId);
      c.set("professionalId", user.professionalId);

      // Set authentication headers
      c.res.headers.set("X-User-ID", user.id);
      c.res.headers.set("X-User-Role", user.role);

      await next();
    } catch (error) {
      if (
        error.message.includes("Invalid token")
        || error.message.includes("jwt")
      ) {
        throw createError.authentication("Token inválido");
      }
      throw error;
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...allowedRoles: UserRole[]): MiddlewareHandler => {
  return async (c, next) => {
    const userRole = c.get("userRole") as UserRole;

    if (!userRole) {
      throw createError.authentication("Autenticação obrigatória");
    }

    if (!allowedRoles.includes(userRole)) {
      throw createError.authorization(
        `Acesso negado. Roles permitidas: ${allowedRoles.join(", ")}`,
      );
    }

    await next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (
  ...requiredPermissions: Permission[]
): MiddlewareHandler => {
  return async (c, next) => {
    const userPermissions = c.get("userPermissions") as Permission[];

    if (!userPermissions) {
      throw createError.authentication("Autenticação obrigatória");
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission),
      );

      throw createError.authorization("Permissões insuficientes", {
        required: requiredPermissions,
        missing: missingPermissions,
      });
    }

    await next();
  };
};

/**
 * Optional authentication middleware (doesn't throw on missing auth)
 */
export const optionalAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const payload = await verifyToken(token);

        if (payload.exp >= Date.now() / 1000) {
          const user = userStore.getUser(payload.sub);
          if (user?.isActive) {
            c.set("user", user);
            c.set("userId", user.id);
            c.set("userRole", user.role);
            c.set("userPermissions", user.permissions);
          }
        }
      } catch {
        // Ignore authentication errors for optional auth
      }
    }

    await next();
  };
};

/**
 * Clinic isolation middleware (ensure users only access their clinic's data)
 */
export const requireClinicAccess = (): MiddlewareHandler => {
  return async (c, next) => {
    const userRole = c.get("userRole") as UserRole;
    const userClinicId = c.get("clinicId") as string;

    // Admins can access any clinic
    if (userRole === UserRole.ADMIN) {
      await next();
      return;
    }

    // Check if user has clinic association
    if (!userClinicId) {
      throw createError.authorization("Usuário não associado a uma clínica");
    }

    // Extract clinic ID from request (URL parameter, query, or body)
    const requestClinicId = c.req.param("clinicId")
      || c.req.query("clinicId")
      || (await c.req.json().catch(() => ({})))?.clinicId;

    // If clinic ID is specified in request, verify access
    if (requestClinicId && requestClinicId !== userClinicId) {
      throw createError.authorization("Acesso negado à clínica especificada");
    }

    await next();
  };
};

/**
 * Rate limiting by user role
 */
export const roleBasedRateLimit = (): MiddlewareHandler => {
  return async (c, next) => {
    const userRole = c.get("userRole") as UserRole;

    // Set different rate limits based on role
    const rateLimits = {
      [UserRole.ADMIN]: 1000, // Higher limits for admins
      [UserRole.CLINIC_OWNER]: 500,
      [UserRole.PROFESSIONAL]: 300,
      [UserRole.STAFF]: 200,
      [UserRole.PATIENT]: 100, // Lower limits for patients
    };

    const limit = rateLimits[userRole] || 50;
    c.res.headers.set("X-Role-Rate-Limit", limit.toString());

    await next();
  };
};

/**
 * Authentication utilities
 */
export const authUtils = {
  // Check if user has specific role
  hasRole: (c: Context, role: UserRole): boolean => {
    return c.get("userRole") === role;
  },

  // Check if user has unknown of the specified roles
  hasAnyRole: (c: Context, roles: UserRole[]): boolean => {
    const userRole = c.get("userRole");
    return roles.includes(userRole);
  },

  // Check if user has specific permission
  hasPermission: (c: Context, permission: Permission): boolean => {
    const permissions = c.get("userPermissions") as Permission[];
    return permissions?.includes(permission);
  },

  // Check if user has all specified permissions
  hasAllPermissions: (c: Context, permissions: Permission[]): boolean => {
    const userPermissions = c.get("userPermissions") as Permission[];
    return permissions.every((p) => userPermissions?.includes(p));
  },

  // Get user context from request
  getUser: (c: Context): UserContext | undefined => {
    return c.get("user");
  },

  // Check if user can access specific clinic
  canAccessClinic: (c: Context, clinicId: string): boolean => {
    const userRole = c.get("userRole") as UserRole;
    const userClinicId = c.get("clinicId") as string;

    // Admins can access any clinic
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Users can only access their own clinic
    return userClinicId === clinicId;
  },

  // Get permissions for a role
  getPermissionsForRole: (role: UserRole): Permission[] => {
    return ROLE_PERMISSIONS[role] || [];
  },
};

// Export types and store for testing
export { Permission, ROLE_PERMISSIONS, UserRole, userStore };
