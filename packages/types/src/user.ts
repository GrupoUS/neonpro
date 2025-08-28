import type { BaseEntity } from "./common";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  permissions: Permission[];
  isActive: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export enum UserRole {
  ADMIN = "admin",
  PROFESSIONAL = "professional",
  PATIENT = "patient",
}
