import type { BaseEntity } from "./common";
import { UserRole } from "./rbac";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  permissions: UserPermission[];
  isActive: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
}

export interface UserPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

// UserRole is now defined in rbac.ts
