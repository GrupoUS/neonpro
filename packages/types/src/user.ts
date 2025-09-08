import type { BaseEntity, } from './common'
import type { UserRole, } from './rbac'
import type { Permission, } from './rbac'

export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  permissions: Permission[]
  isActive: boolean
  mfaEnabled: boolean
  lastLogin?: Date
}

// Alias UserPermission to Permission from rbac for backwards compatibility
export type UserPermission = Permission

// UserRole is now defined in rbac.ts
