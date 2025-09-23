/**
 * Permission Services Index
 *
 * Exports all permission-related services and utilities
 */

export { AgentPermissionService } from "./agent-permissions";
export type {
  PermissionContext,
  PermissionResult,
  UserRole,
} from "./agent-permissions";

// Re-export commonly used permission types
export type PermissionAction = "read" | "write" | "delete" | "admin";
export type PermissionResource =
  | "agent_sessions"
  | "agent_messages"
  | "agent_context"
  | "agent_audit"
  | "patient_data"
  | "financial_data";

export type UserRoleType =
  | "admin"
  | "clinic_admin"
  | "professional"
  | "staff"
  | "patient";

// Permission constants for easy reference
export const PERMISSIONS = {
  ACTIONS: {
    READ: "read",
    WRITE: "write",
    DELETE: "delete",
    ADMIN: "admin",
  } as const,

  RESOURCES: {
    AGENT_SESSIONS: "agent_sessions",
    AGENT_MESSAGES: "agent_messages",
    AGENT_CONTEXT: "agent_context",
    AGENT_AUDIT: "agent_audit",
    PATIENT_DATA: "patient_data",
    FINANCIAL_DATA: "financial_data",
  } as const,

  ROLES: {
    ADMIN: "admin",
    CLINIC_ADMIN: "clinic_admin",
    PROFESSIONAL: "professional",
    STAFF: "staff",
    PATIENT: "patient",
  } as const,
} as const;

// Common permission combinations
export const PERMISSION_TEMPLATES = {
  // Admin permissions
  ADMIN: ["*:*"],

  // Clinic admin permissions
  CLINIC_ADMIN: [
    "read:patient_data",
    "write:patient_data",
    "read:agent_sessions",
    "write:agent_sessions",
    "read:agent_messages",
    "write:agent_messages",
    "read:financial_data",
    "write:financial_data",
  ],

  // Professional permissions
  PROFESSIONAL: [
    "read:patient_data",
    "write:patient_data",
    "read:agent_sessions",
    "write:agent_sessions",
    "read:agent_messages",
    "write:agent_messages",
    "read:financial_data",
  ],

  // Staff permissions
  STAFF: ["read:patient_data", "read:agent_sessions", "read:agent_messages"],

  // Patient permissions
  PATIENT: ["read:agent_sessions", "read:agent_messages"],
} as const;

// Helper functions for permission checking
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string,
): boolean => {
  return (
    userPermissions.includes("*:*") ||
    userPermissions.includes(requiredPermission)
  );
};

export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.some((perm) =>
    hasPermission(userPermissions, perm),
  );
};

export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.every((perm) =>
    hasPermission(userPermissions, perm),
  );
};
