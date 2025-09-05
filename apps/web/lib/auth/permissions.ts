// NeonPro MVP - Basic Permission System

export type UserRole = 'admin' | 'professional' | 'patient' | 'staff'

export interface User {
  id: string
  email: string
  role: UserRole
  professionalId?: string
  patientId?: string
  clinicId?: string
}

export const PERMISSIONS = {
  // Admin permissions
  MANAGE_CLINIC: 'manage_clinic',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  
  // Professional permissions  
  MANAGE_APPOINTMENTS: 'manage_appointments',
  VIEW_PATIENTS: 'view_patients',
  MANAGE_PATIENTS: 'manage_patients',
  
  // Patient permissions
  VIEW_OWN_DATA: 'view_own_data',
  BOOK_APPOINTMENTS: 'book_appointments',
  
  // Staff permissions
  SCHEDULE_APPOINTMENTS: 'schedule_appointments',
  VIEW_SCHEDULE: 'view_schedule',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  professional: [
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_SCHEDULE,
  ],
  staff: [
    PERMISSIONS.SCHEDULE_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.VIEW_PATIENTS,
  ],
  patient: [
    PERMISSIONS.VIEW_OWN_DATA,
    PERMISSIONS.BOOK_APPOINTMENTS,
  ],
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export function canAccessResource(user: User, resourceType: string, resourceId?: string): boolean {
  switch (resourceType) {
    case 'patient':
      if (user.role === 'patient') {
        return user.patientId === resourceId
      }
      return hasPermission(user.role, PERMISSIONS.VIEW_PATIENTS)
      
    case 'appointment':
      return hasPermission(user.role, PERMISSIONS.VIEW_SCHEDULE)
      
    default:
      return false
  }
}