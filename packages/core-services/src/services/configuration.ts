// ================================================
// CONFIGURATION SERVICE
// Centralized configuration management with feature flags and environment management
// ================================================

import { createClient, } from '@supabase/supabase-js'

// ================================================
// TYPES AND INTERFACES
// ================================================

interface ConfigurationValue {
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  environment: string
  tenantId?: string
  description?: string
  isSecret: boolean
  createdAt: Date
  updatedAt: Date
  version: number
}

interface FeatureFlag {
  key: string
  enabled: boolean
  percentage?: number // For gradual rollout
  tenantIds?: string[] // Tenant-specific flags
  userRoles?: string[] // Role-specific flags
  startDate?: Date
  endDate?: Date
  environment: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

interface ConfigurationContext {
  environment: string
  tenantId?: string
  userId?: string
  userRoles?: string[]
}

interface ConfigurationUpdate {
  key: string
  value: unknown
  updatedBy: string
  reason?: string
}

// ================================================
// CONFIGURATION CACHE
// ================================================

class ConfigurationCache {
  private readonly cache: Map<string, { value: unknown; expiry: number }> = new Map()
  private readonly defaultTtl = 5 * 60 * 1000 // 5 minutes
  private readonly secretTtl = 60 * 1000 // 1 minute for secrets

  set(key: string, value: unknown, isSecret = false,): void {
    const ttl = isSecret ? this.secretTtl : this.defaultTtl
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    },)
  }

  get(key: string,): unknown | null {
    const cached = this.cache.get(key,)
    if (!cached) {
      return
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key,)
      return
    }

    return cached.value
  }

  invalidate(key?: string,): void {
    if (key) {
      this.cache.delete(key,)
    } else {
      this.cache.clear()
    }
  }

  keys(): string[] {
    return [...this.cache.keys(),]
  }
}

// ================================================
// CONFIGURATION SERVICE
// ================================================

export class ConfigurationService {
  private static instance: ConfigurationService
  private readonly cache = new ConfigurationCache()
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  )

  private constructor() {
    this.initializeRealtimeUpdates()
  }

  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService()
    }
    return ConfigurationService.instance
  }

  // ================================================
  // CONFIGURATION MANAGEMENT
  // ================================================

  async getConfiguration(
    key: string,
    context: ConfigurationContext,
    defaultValue?: unknown,
  ): Promise<unknown> {
    const cacheKey = this.buildCacheKey(key, context,)

    // Try cache first
    const cached = this.cache.get(cacheKey,)
    if (cached !== null) {
      return cached
    }

    try {
      // Query database
      let query = this.supabase
        .from('configurations',)
        .select('*',)
        .eq('key', key,)
        .eq('environment', context.environment,)

      // Add tenant filter if provided
      if (context.tenantId) {
        query = query.or(`tenant_id.is.null,tenant_id.eq.${context.tenantId}`,)
      } else {
        query = query.is('tenant_id', undefined,)
      }

      const { data, error, } = await query
        .order('tenant_id', { ascending: false, },)
        .limit(1,)

      if (error) {
        return defaultValue
      }

      if (!data || data.length === 0) {
        return defaultValue
      }

      const [config,] = data as ConfigurationValue
      const value = this.parseConfigValue(config,)

      // Cache the result
      this.cache.set(cacheKey, value, config.isSecret,)

      return value
    } catch {
      return defaultValue
    }
  }

  async setConfiguration(
    key: string,
    value: unknown,
    context: ConfigurationContext,
    update: ConfigurationUpdate,
  ): Promise<boolean> {
    try {
      const configValue: Partial<ConfigurationValue> = {
        key,
        value: JSON.stringify(value,),
        type: this.getValueType(value,),
        environment: context.environment,
        tenantId: context.tenantId,
        isSecret: this.isSecretKey(key,),
        updatedAt: new Date(),
        version: 1,
      }

      // Upsert configuration
      const { error, } = await this.supabase
        .from('configurations',)
        .upsert(configValue, {
          onConflict: 'key,environment,tenant_id',
        },)

      if (error) {
        return false
      }

      // Log the change
      await this.logConfigurationChange(key, value, update,)

      // Invalidate cache
      const cacheKey = this.buildCacheKey(key, context,)
      this.cache.invalidate(cacheKey,)

      return true
    } catch {
      return false
    }
  }

  async deleteConfiguration(
    key: string,
    context: ConfigurationContext,
    update: ConfigurationUpdate,
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from('configurations',)
        .delete()
        .eq('key', key,)
        .eq('environment', context.environment,)

      if (context.tenantId) {
        query = query.eq('tenant_id', context.tenantId,)
      } else {
        query = query.is('tenant_id', undefined,)
      }

      const { error, } = await query

      if (error) {
        return false
      }

      // Log the change
      await this.logConfigurationChange(key, undefined, {
        ...update,
        reason: 'Configuration deleted',
      },)

      // Invalidate cache
      const cacheKey = this.buildCacheKey(key, context,)
      this.cache.invalidate(cacheKey,)

      return true
    } catch {
      return false
    }
  }

  // ================================================
  // FEATURE FLAGS
  // ================================================

  async isFeatureEnabled(
    featureKey: string,
    context: ConfigurationContext,
  ): Promise<boolean> {
    const cacheKey = `feature:${this.buildCacheKey(featureKey, context,)}`

    // Try cache first
    const cached = this.cache.get(cacheKey,)
    if (cached !== null) {
      return cached
    }

    try {
      const query = this.supabase
        .from('feature_flags',)
        .select('*',)
        .eq('key', featureKey,)
        .eq('environment', context.environment,)
        .eq('enabled', true,)

      const { data, error, } = await query

      if (error) {
        return false
      }

      if (!data || data.length === 0) {
        return false
      }

      const [flag,] = data as FeatureFlag
      const isEnabled = this.evaluateFeatureFlag(flag, context,)

      // Cache the result
      this.cache.set(cacheKey, isEnabled,)

      return isEnabled
    } catch {
      return false
    }
  }

  async setFeatureFlag(
    featureKey: string,
    enabled: boolean,
    context: ConfigurationContext,
    options?: {
      percentage?: number
      tenantIds?: string[]
      userRoles?: string[]
      startDate?: Date
      endDate?: Date
      description?: string
    },
  ): Promise<boolean> {
    try {
      const flag: Partial<FeatureFlag> = {
        key: featureKey,
        enabled,
        environment: context.environment,
        percentage: options?.percentage,
        tenantIds: options?.tenantIds,
        userRoles: options?.userRoles,
        startDate: options?.startDate,
        endDate: options?.endDate,
        description: options?.description,
        updatedAt: new Date(),
      }

      const { error, } = await this.supabase.from('feature_flags',).upsert(flag, {
        onConflict: 'key,environment',
      },)

      if (error) {
        return false
      }

      // Invalidate cache
      const cacheKey = `feature:${this.buildCacheKey(featureKey, context,)}`
      this.cache.invalidate(cacheKey,)

      return true
    } catch {
      return false
    }
  }

  // ================================================
  // BULK OPERATIONS
  // ================================================

  async getConfigurations(
    keys: string[],
    context: ConfigurationContext,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {}

    await Promise.allSettled(
      keys.map(async (key,) => {
        results[key] = await this.getConfiguration(key, context,)
      },),
    )

    return results
  }

  async getAllConfigurations(
    context: ConfigurationContext,
  ): Promise<ConfigurationValue[]> {
    try {
      let query = this.supabase
        .from('configurations',)
        .select('*',)
        .eq('environment', context.environment,)

      if (context.tenantId) {
        query = query.or(`tenant_id.is.null,tenant_id.eq.${context.tenantId}`,)
      } else {
        query = query.is('tenant_id', undefined,)
      }

      const { data, error, } = await query.order('key',)

      if (error) {
        return []
      }

      return data as ConfigurationValue[]
    } catch {
      return []
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private buildCacheKey(key: string, context: ConfigurationContext,): string {
    return `${context.environment}:${context.tenantId || 'global'}:${key}`
  }

  private parseConfigValue(config: ConfigurationValue,): unknown {
    try {
      switch (config.type) {
        case 'string': {
          return String(config.value,)
        }
        case 'number': {
          return Number(config.value,)
        }
        case 'boolean': {
          return Boolean(config.value,)
        }
        case 'json':
        case 'array': {
          return JSON.parse(config.value,)
        }
        default: {
          return config.value
        }
      }
    } catch {
      return config.value
    }
  }

  private getValueType(value: unknown,): ConfigurationValue['type'] {
    if (typeof value === 'string') {
      return 'string'
    }
    if (typeof value === 'number') {
      return 'number'
    }
    if (typeof value === 'boolean') {
      return 'boolean'
    }
    if (Array.isArray(value,)) {
      return 'array'
    }
    return 'json'
  }

  private isSecretKey(key: string,): boolean {
    const secretPatterns = [
      /^.*_secret$/i,
      /^.*_password$/i,
      /^.*_key$/i,
      /^.*_token$/i,
      /^api_/i,
      /^db_/i,
    ]

    return secretPatterns.some((pattern,) => pattern.test(key,))
  }

  private evaluateFeatureFlag(
    flag: FeatureFlag,
    context: ConfigurationContext,
  ): boolean {
    // Check date range
    const now = new Date()
    if (flag.startDate && now < flag.startDate) {
      return false
    }
    if (flag.endDate && now > flag.endDate) {
      return false
    }

    // Check tenant restriction
    if (
      flag.tenantIds
      && flag.tenantIds.length > 0
      && !(context.tenantId && flag.tenantIds.includes(context.tenantId,))
    ) {
      return false
    }

    // Check role restriction
    if (
      flag.userRoles
      && flag.userRoles.length > 0
      && !context.userRoles?.some((role,) => flag.userRoles?.includes(role,))
    ) {
      return false
    }

    // Check percentage rollout
    if (flag.percentage && flag.percentage < 100) {
      // Use user ID for consistent rollout
      if (context.userId) {
        const hash = this.hashString(context.userId,)
        const userPercentage = hash % 100
        return userPercentage < flag.percentage
      }
      // Fallback to random for anonymous users
      return Math.random() * 100 < flag.percentage
    }

    return true
  }

  private hashString(str: string,): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.codePointAt(i,)
      hash = (hash << 5) - hash + char
      hash &= hash // Convert to 32bit integer
    }
    return Math.abs(hash,)
  }

  private async logConfigurationChange(
    key: string,
    value: unknown,
    update: ConfigurationUpdate,
  ): Promise<void> {
    try {
      await this.supabase.from('configuration_audit_log',).insert({
        configuration_key: key,
        old_value: undefined, // Would need to fetch previous value
        new_value: JSON.stringify(value,),
        updated_by: update.updatedBy,
        reason: update.reason,
        timestamp: new Date(),
      },)
    } catch {}
  }

  private initializeRealtimeUpdates(): void {
    // Subscribe to configuration changes
    this.supabase
      .channel('configuration_changes',)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configurations', },
        (payload,) => {
          // Invalidate relevant cache entries
          if (
            payload.new
            && typeof payload.new === 'object'
            && 'key' in payload.new
          ) {
            const config = payload.new as ConfigurationValue
            // Invalidate all cache entries for this key
            this.cache
              .keys()
              .filter((key,) => key.endsWith(`:${config.key}`,))
              .forEach((key,) => this.cache.invalidate(key,))
          }
        },
      )
      .subscribe()

    // Subscribe to feature flag changes
    this.supabase
      .channel('feature_flag_changes',)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feature_flags', },
        (payload,) => {
          // Invalidate relevant cache entries
          if (
            payload.new
            && typeof payload.new === 'object'
            && 'key' in payload.new
          ) {
            const flag = payload.new as FeatureFlag
            // Invalidate all cache entries for this feature flag
            this.cache
              .keys()
              .filter(
                (key,) => key.includes('feature:',) && key.endsWith(`:${flag.key}`,),
              )
              .forEach((key,) => this.cache.invalidate(key,))
          }
        },
      )
      .subscribe()
  }
}

// ================================================
// CONFIGURATION HELPERS
// ================================================

export const config = ConfigurationService.getInstance()

export async function getConfig<T = unknown,>(
  key: string,
  defaultValue?: T,
  context?: Partial<ConfigurationContext>,
): Promise<T> {
  const fullContext: ConfigurationContext = {
    environment: process.env.NODE_ENV || 'development',
    ...context,
  }

  return config.getConfiguration(key, fullContext, defaultValue,)
}

export async function isFeatureEnabled(
  featureKey: string,
  context?: Partial<ConfigurationContext>,
): Promise<boolean> {
  const fullContext: ConfigurationContext = {
    environment: process.env.NODE_ENV || 'development',
    ...context,
  }

  return config.isFeatureEnabled(featureKey, fullContext,)
}

// ================================================
// CONFIGURATION MIDDLEWARE
// ================================================

export async function withConfiguration<T,>(
  handler: (config: ConfigurationService,) => Promise<T>,
): Promise<T> {
  return handler(ConfigurationService.getInstance(),)
}
