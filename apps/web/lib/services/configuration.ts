// Migrated from src/services/configuration.ts
import { supabase } from "@/lib/supabase";

export interface TenantConfiguration {
  id: string;
  tenant_id: string;
  key: string;
  value: unknown;
  type: "string" | "number" | "boolean" | "object" | "array";
  category: "general" | "healthcare" | "compliance" | "integration" | "ui";
  description?: string;
  is_encrypted: boolean;
  updated_at: string;
}

export interface ConfigurationUpdate {
  key: string;
  value: unknown;
  category?: string;
  description?: string;
}

export class ConfigurationService {
  private cache = new Map<string, TenantConfiguration>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getConfiguration(
    tenantId: string,
    key: string,
  ): Promise<{ value?: unknown; error?: string }> {
    try {
      const cacheKey = `${tenantId}:${key}`;

      // Check cache first
      if (this.isValidCache(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        return { value: cached?.value };
      }

      const { data, error } = await supabase
        .from("tenant_configurations")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("key", key)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Configuration not found
          return { value: null };
        }
        return { error: error.message };
      }

      // Cache the result
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return { value: this.parseConfigValue(data) };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get configuration",
      };
    }
  }

  async setConfiguration(
    tenantId: string,
    config: ConfigurationUpdate,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const configData: Partial<TenantConfiguration> = {
        tenant_id: tenantId,
        key: config.key,
        value: config.value,
        type: this.getValueType(config.value),
        category: config.category || "general",
        description: config.description,
        is_encrypted: this.shouldEncrypt(config.key),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("tenant_configurations").upsert(configData, {
        onConflict: "tenant_id,key",
      });

      if (error) {
        return { error: error.message };
      }

      // Invalidate cache
      const cacheKey = `${tenantId}:${config.key}`;
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to set configuration",
      };
    }
  }

  async getAllConfigurations(
    tenantId: string,
    category?: string,
  ): Promise<{ configurations?: TenantConfiguration[]; error?: string }> {
    try {
      let query = supabase
        .from("tenant_configurations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("category", { ascending: true })
        .order("key", { ascending: true });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { configurations: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get configurations",
      };
    }
  }

  async deleteConfiguration(
    tenantId: string,
    key: string,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("tenant_configurations")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("key", key);

      if (error) {
        return { error: error.message };
      }

      // Invalidate cache
      const cacheKey = `${tenantId}:${key}`;
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to delete configuration",
      };
    }
  }

  // Healthcare-specific configuration helpers
  async getHealthcareSettings(tenantId: string): Promise<{
    settings?: Record<string, unknown>;
    error?: string;
  }> {
    const { configurations, error } = await this.getAllConfigurations(tenantId, "healthcare");

    if (error) {
      return { error };
    }

    const settings: Record<string, unknown> = {};
    configurations?.forEach((config) => {
      settings[config.key] = this.parseConfigValue(config);
    });

    return { settings };
  }

  async setHealthcareSetting(
    tenantId: string,
    key: string,
    value: unknown,
    description?: string,
  ): Promise<{ success?: boolean; error?: string }> {
    return this.setConfiguration(tenantId, {
      key,
      value,
      category: "healthcare",
      description,
    });
  }

  // Compliance-specific configuration helpers
  async getComplianceSettings(tenantId: string): Promise<{
    settings?: Record<string, unknown>;
    error?: string;
  }> {
    const { configurations, error } = await this.getAllConfigurations(tenantId, "compliance");

    if (error) {
      return { error };
    }

    const settings: Record<string, unknown> = {};
    configurations?.forEach((config) => {
      settings[config.key] = this.parseConfigValue(config);
    });

    return { settings };
  }

  // UI configuration helpers
  async getUISettings(tenantId: string): Promise<{
    settings?: Record<string, unknown>;
    error?: string;
  }> {
    const { configurations, error } = await this.getAllConfigurations(tenantId, "ui");

    if (error) {
      return { error };
    }

    const settings: Record<string, unknown> = {};
    configurations?.forEach((config) => {
      settings[config.key] = this.parseConfigValue(config);
    });

    return { settings };
  }

  private isValidCache(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private parseConfigValue(config: TenantConfiguration): unknown {
    if (!config.value) return null;

    try {
      switch (config.type) {
        case "string":
          return String(config.value);
        case "number":
          return Number(config.value);
        case "boolean":
          return Boolean(config.value);
        case "object":
        case "array":
          return typeof config.value === "string" ? JSON.parse(config.value) : config.value;
        default:
          return config.value;
      }
    } catch {
      return config.value;
    }
  }

  private getValueType(value: unknown): TenantConfiguration["type"] {
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "string";
  }

  private shouldEncrypt(key: string): boolean {
    const sensitiveKeys = ["api_key", "secret", "password", "token", "credential", "private_key"];

    return sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive));
  }

  // Clear cache manually if needed
  clearCache(tenantId?: string): void {
    if (tenantId) {
      // Clear cache for specific tenant
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${tenantId}:`)) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }
}

export const configurationService = new ConfigurationService();
