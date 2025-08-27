/**
 * Role-Based Access Control (RBAC) for Healthcare System
 * Implements granular permissions for clinic management
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
  category:
    | "patient"
    | "appointment"
    | "treatment"
    | "financial"
    | "admin"
    | "compliance";
  level: "read" | "write" | "delete" | "admin";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy_level: number;
}

export class HealthcareRBAC {
  private static instance: HealthcareRBAC;

  static getInstance(): HealthcareRBAC {
    if (!HealthcareRBAC.instance) {
      HealthcareRBAC.instance = new HealthcareRBAC();
    }
    return HealthcareRBAC.instance;
  }

  // Define all healthcare permissions
  private readonly permissions: Permission[] = [
    // Patient Management
    {
      id: "patient:read",
      name: "View Patients",
      description: "View patient information",
      category: "patient",
      level: "read",
    },
    {
      id: "patient:write",
      name: "Edit Patients",
      description: "Create and edit patient records",
      category: "patient",
      level: "write",
    },
    {
      id: "patient:delete",
      name: "Delete Patients",
      description: "Delete patient records",
      category: "patient",
      level: "delete",
    },
    {
      id: "patient:medical",
      name: "Medical Records",
      description: "Access medical records",
      category: "patient",
      level: "read",
    },

    // Appointment Management
    {
      id: "appointment:read",
      name: "View Appointments",
      description: "View appointment schedules",
      category: "appointment",
      level: "read",
    },
    {
      id: "appointment:write",
      name: "Manage Appointments",
      description: "Create and edit appointments",
      category: "appointment",
      level: "write",
    },
    {
      id: "appointment:delete",
      name: "Cancel Appointments",
      description: "Cancel appointments",
      category: "appointment",
      level: "delete",
    },

    // Treatment Management
    {
      id: "treatment:read",
      name: "View Treatments",
      description: "View treatment information",
      category: "treatment",
      level: "read",
    },
    {
      id: "treatment:write",
      name: "Prescribe Treatments",
      description: "Prescribe and modify treatments",
      category: "treatment",
      level: "write",
    },
    {
      id: "treatment:approve",
      name: "Approve Treatments",
      description: "Approve treatment plans",
      category: "treatment",
      level: "admin",
    },

    // Financial Management
    {
      id: "financial:read",
      name: "View Financial",
      description: "View financial information",
      category: "financial",
      level: "read",
    },
    {
      id: "financial:write",
      name: "Manage Financial",
      description: "Manage payments and billing",
      category: "financial",
      level: "write",
    },
    {
      id: "financial:reports",
      name: "Financial Reports",
      description: "Generate financial reports",
      category: "financial",
      level: "read",
    },

    // Administration
    {
      id: "admin:users",
      name: "Manage Users",
      description: "Manage system users",
      category: "admin",
      level: "admin",
    },
    {
      id: "admin:roles",
      name: "Manage Roles",
      description: "Manage user roles and permissions",
      category: "admin",
      level: "admin",
    },
    {
      id: "admin:settings",
      name: "System Settings",
      description: "Configure system settings",
      category: "admin",
      level: "admin",
    },

    // Compliance
    {
      id: "compliance:audit",
      name: "Audit Access",
      description: "Access audit logs and compliance reports",
      category: "compliance",
      level: "read",
    },
    {
      id: "compliance:manage",
      name: "Manage Compliance",
      description: "Manage compliance settings",
      category: "compliance",
      level: "admin",
    },
  ];

  // Define healthcare roles
  private readonly roles: Role[] = [
    {
      id: "patient",
      name: "Patient",
      description: "Clinic patient with access to own data",
      hierarchy_level: 1,
      permissions: [
        "appointment:read",
        "appointment:write", // Own appointments only
        "treatment:read", // Own treatments only
      ],
    },
    {
      id: "receptionist",
      name: "Receptionist",
      description: "Front desk staff managing appointments and basic patient info",
      hierarchy_level: 2,
      permissions: [
        "patient:read",
        "patient:write",
        "appointment:read",
        "appointment:write",
        "appointment:delete",
        "financial:read",
        "financial:write",
      ],
    },
    {
      id: "nurse",
      name: "Nurse",
      description: "Healthcare professional assisting with patient care",
      hierarchy_level: 3,
      permissions: [
        "patient:read",
        "patient:write",
        "patient:medical",
        "appointment:read",
        "appointment:write",
        "treatment:read",
        "treatment:write",
      ],
    },
    {
      id: "doctor",
      name: "Doctor",
      description: "Medical professional with full patient access",
      hierarchy_level: 4,
      permissions: [
        "patient:read",
        "patient:write",
        "patient:medical",
        "appointment:read",
        "appointment:write",
        "appointment:delete",
        "treatment:read",
        "treatment:write",
        "treatment:approve",
        "financial:read",
        "financial:reports",
      ],
    },
    {
      id: "admin",
      name: "Administrator",
      description: "System administrator with full access",
      hierarchy_level: 5,
      permissions: [
        // All permissions
        ...this.permissions.map((p) => p.id),
        "admin:users",
        "admin:roles",
        "admin:settings",
        "compliance:audit",
        "compliance:manage",
      ],
    },
  ];

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) {
        return false;
      }

      const role = this.roles.find((r) => r.name === userRole);
      if (!role) {
        return false;
      }

      return role.permissions.includes(permission);
    } catch {
      return false;
    }
  }

  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  async canAccessResource(
    userId: string,
    resourceType: string,
    action: "read" | "write" | "delete",
    resourceOwnerId?: string,
  ): Promise<boolean> {
    const permission = `${resourceType}:${action}`;

    // Check if user has general permission
    const hasGeneralPermission = await this.hasPermission(userId, permission);

    // If accessing own resource, allow with basic permission
    if (resourceOwnerId && resourceOwnerId === userId) {
      return hasGeneralPermission;
    }

    // For accessing other's resources, check role hierarchy
    if (hasGeneralPermission) {
      const userRole = await this.getUserRole(userId);
      const role = this.roles.find((r) => r.name === userRole);

      // Patients can only access their own data
      if (role?.name === "patient" && resourceOwnerId !== userId) {
        return false;
      }

      return true;
    }

    return false;
  }

  async getRolePermissions(roleName: string): Promise<Permission[]> {
    const role = this.roles.find((r) => r.name === roleName);
    if (!role) {
      return [];
    }

    return this.permissions.filter((p) => role.permissions.includes(p.id));
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRole = await this.getUserRole(userId);
    if (!userRole) {
      return [];
    }

    return this.getRolePermissions(userRole);
  }

  getAvailableRoles(): Role[] {
    return [...this.roles];
  }

  getAvailablePermissions(): Permission[] {
    return [...this.permissions];
  }

  async assignRole(_userId: string, _roleName: string): Promise<boolean> {
    try {
      return true;
    } catch {
      return false;
    }
  }

  async removeRole(_userId: string): Promise<boolean> {
    try {
      return true;
    } catch {
      return false;
    }
  }

  private async getUserRole(_userId: string): Promise<string | null> {
    // Implementation would query database
    // For now, return mock data
    return "doctor"; // Mock role
  }

  // Middleware helper for Next.js API routes
  static createPermissionMiddleware(requiredPermissions: string | string[]) {
    return async (req: any, res: any, next: any) => {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const rbac = HealthcareRBAC.getInstance();
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasPermission = await rbac.hasAnyPermission(userId, permissions);
      if (!hasPermission) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    };
  }
}
