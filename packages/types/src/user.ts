import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  PATIENT = 'patient',
}
