/**
 * Advanced Route Protection System
 * 
 * This module provides granular route protection with subscription-based access control,
 * feature flags, and comprehensive audit logging for security compliance.
 * 
 * @author NeonPro Development Team
 * @version 1.0.0
 */

import type { NextRequest } from 'next/server'

// Core types for route protection
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise'
export type UserRole = 'patient' | 'staff' | 'doctor' | 'admin' | 'owner'
export type AccessLevel = 'read' | 'write' | 'admin' | 'owner'

export interface RoutePermission {
  pattern: string
  name: string
  description: string
  requiresAuth: boolean
  requiresSubscription: boolean
  minimumTier?: SubscriptionTier
  allowedRoles?: UserRole[]
  requiredPermissions?: AccessLevel[]
  allowGracePeriod?: boolean
  gracePeriodDays?: number
  featureFlags?: string[]
  rateLimitRpm?: number
  auditLevel?: 'none' | 'basic' | 'detailed'
  customValidator?: (req: NextRequest, context: RouteContext) => Promise<ValidationResult>
}

export interface RouteContext {
  userId: string
  userRole: UserRole
  subscriptionTier: SubscriptionTier
  subscriptionStatus: string
  subscriptionExpiresAt?: Date
  gracePeriodEndsAt?: Date
  permissions: AccessLevel[]
  featureFlags: Record<string, boolean>
  clinicId?: string
  clinicRole?: string
}

export interface ValidationResult {
  allowed: boolean
  reason?: string
  redirectTo?: string
  errorCode?: string
  metadata?: Record<string, any>
}

export interface AccessLog {
  userId: string
  route: string
  method: string
  allowed: boolean
  reason?: string
  timestamp: Date
  userAgent?: string
  ip?: string
  duration?: number
  metadata?: Record<string, any>
}

// Advanced route configuration
const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Public routes (no authentication required)
  {
    pattern: '^/$',
    name: 'home',
    description: 'Landing page',
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: 'none'
  },
  {
    pattern: '^/(login|signup|forgot-password|reset-password)$',
    name: 'auth',
    description: 'Authentication pages',
    requiresAuth: false,
    requiresSubscription: false,
    auditLevel: 'basic'
  },

  // Free tier routes (authentication required)
  {
    pattern: '^/dashboard/?$',
    name: 'dashboard',
    description: 'Main dashboard overview',
    requiresAuth: true,
    requiresSubscription: false,
    allowedRoles: ['patient', 'staff', 'doctor', 'admin', 'owner'],
    auditLevel: 'basic'
  },
  {
    pattern: '^/dashboard/profile',
    name: 'profile',
    description: 'User profile management',
    requiresAuth: true,
    requiresSubscription: false,
    requiredPermissions: ['read'],
    auditLevel: 'basic'
  },
  {
    pattern: '^/dashboard/settings/(account|notifications)$',
    name: 'settings_basic',
    description: 'Basic account settings',
    requiresAuth: true,
    requiresSubscription: false,
    requiredPermissions: ['read'],
    auditLevel: 'basic'
  },

  // Subscription management (always accessible to manage billing)
  {
    pattern: '^/dashboard/(subscription|billing)',
    name: 'billing',
    description: 'Subscription and billing management',
    requiresAuth: true,
    requiresSubscription: false,
    allowedRoles: ['admin', 'owner'],
    requiredPermissions: ['admin'],
    auditLevel: 'detailed'
  },

  // Basic tier routes
  {
    pattern: '^/dashboard/patients',
    name: 'patients',
    description: 'Patient management system',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'basic',
    allowedRoles: ['staff', 'doctor', 'admin', 'owner'],
    requiredPermissions: ['read'],
    allowGracePeriod: true,
    gracePeriodDays: 3,
    rateLimitRpm: 100,
    auditLevel: 'detailed'
  },
  {
    pattern: '^/dashboard/appointments',
    name: 'appointments',
    description: 'Appointment scheduling system',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'basic',
    allowedRoles: ['staff', 'doctor', 'admin', 'owner'],
    requiredPermissions: ['read'],
    allowGracePeriod: true,
    gracePeriodDays: 3,
    rateLimitRpm: 150,
    auditLevel: 'detailed'
  },

  // Premium tier routes
  {
    pattern: '^/dashboard/treatments',
    name: 'treatments',
    description: 'Treatment and procedure management',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'premium',
    allowedRoles: ['doctor', 'admin', 'owner'],
    requiredPermissions: ['write'],
    allowGracePeriod: true,
    gracePeriodDays: 1,
    featureFlags: ['advanced_treatments'],
    rateLimitRpm: 80,
    auditLevel: 'detailed'
  },
  {
    pattern: '^/dashboard/reports',
    name: 'reports',
    description: 'Analytics and reporting system',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'premium',
    allowedRoles: ['doctor', 'admin', 'owner'],
    requiredPermissions: ['read'],
    allowGracePeriod: false,
    featureFlags: ['advanced_reporting'],
    rateLimitRpm: 60,
    auditLevel: 'detailed'
  },
  {
    pattern: '^/dashboard/inventory',
    name: 'inventory',
    description: 'Inventory and stock management',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'premium',
    allowedRoles: ['staff', 'admin', 'owner'],
    requiredPermissions: ['write'],
    allowGracePeriod: true,
    gracePeriodDays: 2,
    rateLimitRpm: 70,
    auditLevel: 'detailed'
  },

  // Enterprise tier routes
  {
    pattern: '^/dashboard/(multi-clinic|franchise)',
    name: 'multi_clinic',
    description: 'Multi-clinic management system',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'enterprise',
    allowedRoles: ['admin', 'owner'],
    requiredPermissions: ['admin'],
    allowGracePeriod: false,
    featureFlags: ['multi_clinic_support'],
    rateLimitRpm: 50,
    auditLevel: 'detailed'
  },
  {
    pattern: '^/dashboard/analytics/(advanced|custom)',
    name: 'advanced_analytics',
    description: 'Advanced analytics and custom reports',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'enterprise',
    allowedRoles: ['admin', 'owner'],
    requiredPermissions: ['admin'],
    allowGracePeriod: false,
    featureFlags: ['advanced_analytics', 'custom_reports'],
    rateLimitRpm: 40,
    auditLevel: 'detailed'
  },

  // Admin only routes
  {
    pattern: '^/dashboard/admin',
    name: 'admin',
    description: 'System administration panel',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'premium',
    allowedRoles: ['admin', 'owner'],
    requiredPermissions: ['admin'],
    allowGracePeriod: false,
    rateLimitRpm: 30,
    auditLevel: 'detailed'
  },
  {
    pattern: '^/dashboard/settings/(security|integrations|api)$',
    name: 'admin_settings',
    description: 'Advanced system settings',
    requiresAuth: true,
    requiresSubscription: true,
    minimumTier: 'premium',
    allowedRoles: ['admin', 'owner'],
    requiredPermissions: ['admin'],
    allowGracePeriod: false,
    rateLimitRpm: 25,
    auditLevel: 'detailed'
  }
]

// Feature flags configuration
const FEATURE_FLAGS: Record<string, boolean> = {
  advanced_treatments: true,
  advanced_reporting: true,
  multi_clinic_support: true,
  advanced_analytics: true,
  custom_reports: true,
  ai_suggestions: false, // Feature in development
  mobile_app_sync: true,
  third_party_integrations: true
}

// Subscription tier hierarchy
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  premium: 2,
  enterprise: 3
}

// Route protection class
export class RouteProtector {
  private accessLogs: AccessLog[] = []
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>()

  /**
   * Check if user has access to a specific route
   */
  async checkAccess(req: NextRequest, context: RouteContext): Promise<ValidationResult> {
    const startTime = Date.now()
    const route = req.nextUrl.pathname
    const method = req.method
    
    try {
      // Find matching route permission
      const permission = this.findRoutePermission(route)
      if (!permission) {
        return this.createResult(false, 'Route not found', '/dashboard', 'ROUTE_NOT_FOUND')
      }

      // Check authentication requirement
      if (permission.requiresAuth && !context.userId) {
        return this.createResult(false, 'Authentication required', '/login', 'AUTH_REQUIRED')
      }

      // Check rate limiting
      const rateLimitResult = this.checkRateLimit(context.userId, permission)
      if (!rateLimitResult.allowed) {
        return rateLimitResult
      }

      // Check subscription requirement
      if (permission.requiresSubscription) {
        const subscriptionResult = this.checkSubscription(context, permission)
        if (!subscriptionResult.allowed) {
          return subscriptionResult
        }
      }

      // Check role permissions
      const roleResult = this.checkRolePermissions(context, permission)
      if (!roleResult.allowed) {
        return roleResult
      }

      // Check feature flags
      const featureResult = this.checkFeatureFlags(context, permission)
      if (!featureResult.allowed) {
        return featureResult
      }

      // Run custom validator if provided
      if (permission.customValidator) {
        const customResult = await permission.customValidator(req, context)
        if (!customResult.allowed) {
          return customResult
        }
      }

      const result = this.createResult(true, 'Access granted', undefined, 'ACCESS_GRANTED')
      
      // Log access if audit level requires it
      this.logAccess(req, context, permission, result, Date.now() - startTime)
      
      return result

    } catch (error) {
      const result = this.createResult(false, 'System error during access check', '/dashboard', 'SYSTEM_ERROR')
      this.logAccess(req, context, null, result, Date.now() - startTime)
      return result
    }
  }

  /**
   * Find matching route permission based on pattern matching
   */
  private findRoutePermission(route: string): RoutePermission | null {
    for (const permission of ROUTE_PERMISSIONS) {
      const regex = new RegExp(permission.pattern)
      if (regex.test(route)) {
        return permission
      }
    }
    return null
  }

  /**
   * Check subscription requirements
   */
  private checkSubscription(context: RouteContext, permission: RoutePermission): ValidationResult {
    // Check minimum tier requirement
    if (permission.minimumTier) {
      const requiredLevel = TIER_HIERARCHY[permission.minimumTier]
      const currentLevel = TIER_HIERARCHY[context.subscriptionTier]
      
      if (currentLevel < requiredLevel) {
        return this.createResult(
          false, 
          `Subscription tier ${permission.minimumTier} required`, 
          '/dashboard/subscription', 
          'TIER_REQUIRED'
        )
      }
    }

    // Check subscription status
    if (context.subscriptionStatus !== 'active' && context.subscriptionStatus !== 'trialing') {
      // Check grace period
      if (permission.allowGracePeriod && context.gracePeriodEndsAt) {
        const now = new Date()
        if (now <= context.gracePeriodEndsAt) {
          return this.createResult(true, 'Access granted (grace period)', undefined, 'GRACE_PERIOD')
        }
      }
      
      return this.createResult(
        false, 
        'Active subscription required', 
        '/dashboard/subscription', 
        'SUBSCRIPTION_REQUIRED'
      )
    }

    return this.createResult(true, 'Subscription check passed', undefined, 'SUBSCRIPTION_OK')
  }

  /**
   * Check role and permission requirements
   */
  private checkRolePermissions(context: RouteContext, permission: RoutePermission): ValidationResult {
    // Check allowed roles
    if (permission.allowedRoles && !permission.allowedRoles.includes(context.userRole)) {
      return this.createResult(
        false, 
        `Role ${context.userRole} not allowed for this resource`, 
        '/dashboard', 
        'ROLE_NOT_ALLOWED'
      )
    }

    // Check required permissions
    if (permission.requiredPermissions) {
      const hasRequiredPermissions = permission.requiredPermissions.every(
        required => context.permissions.includes(required)
      )
      
      if (!hasRequiredPermissions) {
        return this.createResult(
          false, 
          'Insufficient permissions', 
          '/dashboard', 
          'INSUFFICIENT_PERMISSIONS'
        )
      }
    }

    return this.createResult(true, 'Role check passed', undefined, 'ROLE_OK')
  }

  /**
   * Check feature flag requirements
   */
  private checkFeatureFlags(context: RouteContext, permission: RoutePermission): ValidationResult {
    if (!permission.featureFlags) {
      return this.createResult(true, 'No feature flags required', undefined, 'NO_FLAGS')
    }

    const missingFlags = permission.featureFlags.filter(flag => {
      const globalEnabled = FEATURE_FLAGS[flag]
      const userEnabled = context.featureFlags[flag]
      return !globalEnabled || !userEnabled
    })

    if (missingFlags.length > 0) {
      return this.createResult(
        false, 
        `Feature not available: ${missingFlags.join(', ')}`, 
        '/dashboard', 
        'FEATURE_DISABLED'
      )
    }

    return this.createResult(true, 'Feature flags check passed', undefined, 'FLAGS_OK')
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(userId: string, permission: RoutePermission): ValidationResult {
    if (!permission.rateLimitRpm) {
      return this.createResult(true, 'No rate limit', undefined, 'NO_RATE_LIMIT')
    }

    const key = `${userId}:${permission.name}`
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    
    let rateLimitInfo = this.rateLimitCache.get(key)
    
    if (!rateLimitInfo || now >= rateLimitInfo.resetTime) {
      rateLimitInfo = { count: 1, resetTime: now + windowMs }
      this.rateLimitCache.set(key, rateLimitInfo)
      return this.createResult(true, 'Rate limit OK', undefined, 'RATE_LIMIT_OK')
    }
    
    if (rateLimitInfo.count >= permission.rateLimitRpm) {
      return this.createResult(
        false, 
        'Rate limit exceeded', 
        '/dashboard', 
        'RATE_LIMIT_EXCEEDED'
      )
    }
    
    rateLimitInfo.count++
    return this.createResult(true, 'Rate limit OK', undefined, 'RATE_LIMIT_OK')
  }

  /**
   * Create validation result
   */
  private createResult(
    allowed: boolean, 
    reason?: string, 
    redirectTo?: string, 
    errorCode?: string
  ): ValidationResult {
    return {
      allowed,
      reason,
      redirectTo,
      errorCode,
      metadata: {
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Log access attempt
   */
  private logAccess(
    req: NextRequest, 
    context: RouteContext, 
    permission: RoutePermission | null, 
    result: ValidationResult,
    duration: number
  ): void {
    if (!permission || permission.auditLevel === 'none') return

    const log: AccessLog = {
      userId: context.userId,
      route: req.nextUrl.pathname,
      method: req.method,
      allowed: result.allowed,
      reason: result.reason,
      timestamp: new Date(),
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      duration,
      metadata: {
        errorCode: result.errorCode,
        subscriptionTier: context.subscriptionTier,
        userRole: context.userRole,
        ...(permission.auditLevel === 'detailed' && {
          subscriptionStatus: context.subscriptionStatus,
          clinicId: context.clinicId
        })
      }
    }

    this.accessLogs.push(log)
    
    // Keep only last 1000 logs to prevent memory leaks
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000)
    }
  }

  /**
   * Get access logs for audit purposes
   */
  getAccessLogs(userId?: string, limit = 100): AccessLog[] {
    let logs = this.accessLogs
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId)
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  /**
   * Get route permissions configuration
   */
  getRoutePermissions(): RoutePermission[] {
    return ROUTE_PERMISSIONS
  }

  /**
   * Update feature flags (for dynamic feature toggles)
   */
  updateFeatureFlag(flag: string, enabled: boolean): void {
    FEATURE_FLAGS[flag] = enabled
  }

  /**
   * Get current feature flags state
   */
  getFeatureFlags(): Record<string, boolean> {
    return { ...FEATURE_FLAGS }
  }
}

// Global route protector instance
export const routeProtector = new RouteProtector()

// Utility functions
export function getSubscriptionTier(tierString: string): SubscriptionTier {
  const validTiers = ['free', 'basic', 'premium', 'enterprise']
  return validTiers.includes(tierString) ? tierString as SubscriptionTier : 'free'
}

export function getUserRole(roleString: string): UserRole {
  const validRoles = ['patient', 'staff', 'doctor', 'admin', 'owner']
  return validRoles.includes(roleString) ? roleString as UserRole : 'patient'
}

export function calculateGracePeriodEnd(expiresAt: Date, graceDays = 3): Date {
  const gracePeriodEnd = new Date(expiresAt)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + graceDays)
  return gracePeriodEnd
}