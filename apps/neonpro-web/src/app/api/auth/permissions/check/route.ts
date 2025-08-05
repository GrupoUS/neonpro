/**
 * API Route: Permission Check Endpoint
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Provides REST API for frontend permission validation
 * Integrates with RBAC permission system
 */

import type { NextRequest, NextResponse } from "next/server";
import type { authenticateRequest } from "@/lib/middleware/auth";
import type {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/auth/rbac/permissions";
import type { Permission, PermissionContext } from "@/types/rbac";
import type { z } from "zod";

/**
 * Request validation schemas
 */
const SinglePermissionSchema = z.object({
  permission: z.string(),
  resourceId: z.string().optional(),
  context: z
    .object({
      clinicId: z.string().optional(),
      departmentId: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    })
    .optional(),
});

const MultiplePermissionsSchema = z.object({
  permissions: z.array(z.string()),
  resourceId: z.string().optional(),
  context: z
    .object({
      clinicId: z.string().optional(),
      departmentId: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    })
    .optional(),
  requireAll: z.boolean().default(false),
});

const PermissionCheckSchema = z.union([SinglePermissionSchema, MultiplePermissionsSchema]);

/**
 * POST /api/auth/permissions/check
 *
 * Check user permissions against RBAC system
 *
 * @param request - NextRequest containing permission check data
 * @returns Permission check result with granted status and metadata
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          granted: false,
          reason: authResult.error || "Invalid authentication",
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          granted: false,
          reason: "Malformed request data",
        },
        { status: 400 },
      );
    }

    // Validate request schema
    const validationResult = PermissionCheckSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          granted: false,
          reason: "Request validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const user = authResult.user;

    // Handle single permission check
    if ("permission" in data) {
      const result = await hasPermission(
        user,
        data.permission as Permission,
        data.resourceId,
        data.context as PermissionContext,
      );

      return NextResponse.json({
        granted: result.granted,
        reason: result.reason,
        roleUsed: result.roleUsed,
        permission: data.permission,
        resourceId: data.resourceId,
        context: data.context,
        timestamp: new Date().toISOString(),
        userId: user.id,
      });
    }

    // Handle multiple permissions check
    if ("permissions" in data) {
      const permissions = data.permissions as Permission[];

      let result;
      if (data.requireAll) {
        result = await hasAllPermissions(user, permissions);
      } else {
        result = await hasAnyPermission(user, permissions);
      }

      return NextResponse.json({
        granted: result.granted,
        reason: result.reason,
        roleUsed: result.roleUsed,
        permissions: data.permissions,
        requireAll: data.requireAll,
        resourceId: data.resourceId,
        context: data.context,
        timestamp: new Date().toISOString(),
        userId: user.id,
      });
    }

    // Should not reach here due to schema validation
    return NextResponse.json(
      {
        error: "Invalid request type",
        granted: false,
        reason: "Unknown permission check format",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Permission check API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        granted: false,
        reason: "Permission validation failed due to server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/permissions/check
 *
 * Get current user's role and basic permission info
 * Useful for frontend initialization and caching
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          authenticated: false,
        },
        { status: 401 },
      );
    }

    const user = authResult.user;

    // Get basic user permission info
    const userInfo = {
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      authenticated: true,
      timestamp: new Date().toISOString(),
    };

    // Optionally include role capabilities (without specific permission checks)
    const roleCapabilities = getRoleCapabilities(user.role);

    return NextResponse.json({
      ...userInfo,
      capabilities: roleCapabilities,
    });
  } catch (error) {
    console.error("Permission info API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        authenticated: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Get general role capabilities without specific permission checks
 * Used for frontend optimization and caching
 */
function getRoleCapabilities(role: string) {
  const capabilities = {
    canManageUsers: false,
    canManagePatients: false,
    canManageAppointments: false,
    canViewBilling: false,
    canManageBilling: false,
    canManageClinic: false,
    canViewReports: false,
    canManageSystem: false,
  };

  switch (role) {
    case "owner":
      return {
        ...capabilities,
        canManageUsers: true,
        canManagePatients: true,
        canManageAppointments: true,
        canViewBilling: true,
        canManageBilling: true,
        canManageClinic: true,
        canViewReports: true,
        canManageSystem: true,
      };

    case "manager":
      return {
        ...capabilities,
        canManageUsers: true,
        canManagePatients: true,
        canManageAppointments: true,
        canViewBilling: true,
        canManageBilling: true,
        canViewReports: true,
      };

    case "staff":
      return {
        ...capabilities,
        canManagePatients: true,
        canManageAppointments: true,
      };

    case "patient":
      return {
        ...capabilities,
        // Patients have very limited capabilities
      };

    default:
      return capabilities;
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
