/**
 * Database Real-time Subscriptions Middleware (T074)
 * Supabase real-time subscriptions for patient data changes
 *
 * Features:
 * - Supabase real-time subscriptions for patient data changes
 * - LGPD compliant data filtering in real-time streams
 * - Audit trail integration for real-time operations
 * - Performance optimization for large datasets
 * - Integration with WebSocket middleware (T070)
 */

import {
  createClient,
  RealtimeChannel,
  SupabaseClient,
} from "@supabase/supabase-js";
import { Context, Next } from "hono";
import { z } from "zod";

// Real-time subscription configuration
const subscriptionConfigSchema = z.object({
  table: z.string().min(1),
  event: z.enum(["INSERT", "UPDATE", "DELETE", "*"]).default("*"),
  schema: z.string().default("public"),
  filter: z.string().optional(),
  lgpdCompliant: z.boolean().default(true),
  auditEnabled: z.boolean().default(true),
  userId: z.string().optional(),
  healthcareProfessional: z.boolean().default(false),
});

export type SubscriptionConfig = z.infer<typeof subscriptionConfigSchema>;

// Real-time event data
interface RealtimeEvent {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  old?: Record<string, any>;
  new?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// LGPD data filter
interface LGPDFilter {
  userId: string;
  consentedDataCategories: string[];
  canViewPersonalData: boolean;
  canViewHealthData: boolean;
  canViewContactData: boolean;
  dataRetentionDays: number;
}

// Real-time subscription manager
class RealtimeSubscriptionManager {
  private supabase: SupabaseClient | null = null;
  private subscriptions = new Map<string, RealtimeChannel>();
  private userSubscriptions = new Map<string, Set<string>>();
  private lgpdFilters = new Map<string, LGPDFilter>();

  constructor() {
    this.initializeSupabase();
  }

  // Initialize Supabase client
  private initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    }
  }

  // Create real-time subscription
  async createSubscription(
    subscriptionId: string,
    config: SubscriptionConfig,
    callback: (event: RealtimeEvent) => void,
  ): Promise<boolean> {
    if (!this.supabase) {
      console.error("Supabase client not initialized");
      return false;
    }

    try {
      // Validate configuration
      const validatedConfig = subscriptionConfigSchema.parse(config);

      // Create channel name
      const channelName = `${validatedConfig.schema}:${validatedConfig.table}:${subscriptionId}`;

      // Create subscription channel
      const channel = this.supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: validatedConfig.event,
            schema: validatedConfig.schema,
            table: validatedConfig.table,
            filter: validatedConfig.filter,
          },
          (payload) => {
            this.handleRealtimeEvent(payload, validatedConfig, callback);
          },
        )
        .subscribe();

      // Store subscription
      this.subscriptions.set(subscriptionId, channel);

      // Track user subscriptions
      if (validatedConfig.userId) {
        if (!this.userSubscriptions.has(validatedConfig.userId)) {
          this.userSubscriptions.set(validatedConfig.userId, new Set());
        }
        this.userSubscriptions.get(validatedConfig.userId)!.add(subscriptionId);
      }

      console.log(
        `Real-time subscription created: ${subscriptionId} for table ${validatedConfig.table}`,
      );
      return true;
    } catch (error) {
      console.error("Error creating real-time subscription:", error);
      return false;
    }
  }

  // Handle real-time event
  private async handleRealtimeEvent(
    payload: any,
    config: SubscriptionConfig,
    callback: (event: RealtimeEvent) => void,
  ) {
    try {
      // Create event object
      const event: RealtimeEvent = {
        eventType: payload.eventType,
        table: payload.table,
        schema: payload.schema,
        old: payload.old,
        new: payload.new,
        timestamp: new Date(),
        userId: config.userId,
      };

      // Apply LGPD filtering if enabled
      if (config.lgpdCompliant && config.userId) {
        const filteredEvent = await this.applyLGPDFiltering(
          event,
          config.userId,
        );
        if (!filteredEvent) {
          return; // Event filtered out due to LGPD compliance
        }
        callback(filteredEvent);
      } else {
        callback(event);
      }

      // Log audit trail if enabled
      if (config.auditEnabled) {
        await this.logAuditTrail(event, config);
      }
    } catch (error) {
      console.error("Error handling real-time event:", error);
    }
  }

  // Apply LGPD filtering to real-time events
  private async applyLGPDFiltering(
    event: RealtimeEvent,
    userId: string,
  ): Promise<RealtimeEvent | null> {
    const lgpdFilter = this.lgpdFilters.get(userId);
    if (!lgpdFilter) {
      // No LGPD filter configured, allow all data
      return event;
    }

    // Check data retention
    const eventAge = Date.now() - event.timestamp.getTime();
    const maxAge = lgpdFilter.dataRetentionDays * 24 * 60 * 60 * 1000;
    if (eventAge > maxAge) {
      return null; // Event too old, filter out
    }

    // Filter sensitive data based on consent
    const filteredEvent = { ...event };

    if (event.new) {
      filteredEvent.new = this.filterSensitiveData(event.new, lgpdFilter);
    }

    if (event.old) {
      filteredEvent.old = this.filterSensitiveData(event.old, lgpdFilter);
    }

    return filteredEvent;
  }

  // Filter sensitive data based on LGPD consent
  private filterSensitiveData(
    data: Record<string, any>,
    lgpdFilter: LGPDFilter,
  ): Record<string, any> {
    const filtered = { ...data };

    // Define sensitive fields by category
    const personalDataFields = ["name", "full_name", "cpf", "rg", "birth_date"];
    const healthDataFields = [
      "medical_history",
      "allergies",
      "medications",
      "diagnosis",
    ];
    const contactDataFields = ["email", "phone", "address", "cep"];

    // Filter personal data
    if (!lgpdFilter.canViewPersonalData) {
      personalDataFields.forEach((field) => {
        if (filtered[field]) {
          filtered[field] = "[FILTERED - LGPD]";
        }
      });
    }

    // Filter health data
    if (!lgpdFilter.canViewHealthData) {
      healthDataFields.forEach((field) => {
        if (filtered[field]) {
          filtered[field] = "[FILTERED - LGPD]";
        }
      });
    }

    // Filter contact data
    if (!lgpdFilter.canViewContactData) {
      contactDataFields.forEach((field) => {
        if (filtered[field]) {
          filtered[field] = "[FILTERED - LGPD]";
        }
      });
    }

    return filtered;
  }

  // Log audit trail for real-time operations
  private async logAuditTrail(
    event: RealtimeEvent,
    config: SubscriptionConfig,
  ) {
    try {
      // TODO: Integrate with audit service from T039
      const auditLog = {
        action: `realtime_${event.eventType.toLowerCase()}`,
        table: event.table,
        userId: config.userId,
        timestamp: event.timestamp,
        data: {
          eventType: event.eventType,
          table: event.table,
          hasOldData: !!event.old,
          hasNewData: !!event.new,
          lgpdCompliant: config.lgpdCompliant,
        },
      };

      console.log("Audit trail logged:", auditLog);
    } catch (error) {
      console.error("Error logging audit trail:", error);
    }
  }

  // Set LGPD filter for user
  setLGPDFilter(userId: string, filter: LGPDFilter) {
    this.lgpdFilters.set(userId, filter);
  }

  // Remove LGPD filter for user
  removeLGPDFilter(userId: string) {
    this.lgpdFilters.delete(userId);
  }

  // Remove subscription
  async removeSubscription(subscriptionId: string): Promise<boolean> {
    const channel = this.subscriptions.get(subscriptionId);
    if (!channel) {
      return false;
    }

    try {
      await this.supabase?.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);

      // Remove from user subscriptions
      for (const [userId, subscriptions] of this.userSubscriptions) {
        if (subscriptions.has(subscriptionId)) {
          subscriptions.delete(subscriptionId);
          if (subscriptions.size === 0) {
            this.userSubscriptions.delete(userId);
          }
          break;
        }
      }

      console.log(`Real-time subscription removed: ${subscriptionId}`);
      return true;
    } catch (error) {
      console.error("Error removing real-time subscription:", error);
      return false;
    }
  }

  // Get user subscriptions
  getUserSubscriptions(userId: string): string[] {
    const subscriptions = this.userSubscriptions.get(userId);
    return subscriptions ? Array.from(subscriptions) : [];
  }

  // Get all subscriptions count
  getSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  // Clean up all subscriptions
  async cleanup() {
    const subscriptionIds = Array.from(this.subscriptions.keys());
    for (const subscriptionId of subscriptionIds) {
      await this.removeSubscription(subscriptionId);
    }
  }
}

// Global real-time subscription manager
export const realtimeManager = new RealtimeSubscriptionManager();

// Real-time subscription middleware
export function realtimeSubscription() {
  return async (c: Context, next: Next) => {
    // Add real-time utilities to context
    c.set("realtimeManager", realtimeManager);
    c.set(
      "createSubscription",
      (
        config: SubscriptionConfig,
        callback: (event: RealtimeEvent) => void,
      ) => {
        const subscriptionId = crypto.randomUUID();
        return realtimeManager.createSubscription(
          subscriptionId,
          config,
          callback,
        );
      },
    );

    return next();
  };
}

// Patient data subscription middleware
export function patientDataSubscription() {
  return async (c: Context, next: Next) => {
    const userId = c.get("userId");
    const lgpdConsent = c.get("lgpdConsent");
    const healthcareProfessional = c.get("healthcareProfessional");

    if (!userId) {
      return next();
    }

    // Set LGPD filter based on user consent
    if (lgpdConsent) {
      const lgpdFilter: LGPDFilter = {
        userId,
        consentedDataCategories: lgpdConsent.dataCategories || [],
        canViewPersonalData:
          lgpdConsent.dataCategories?.includes("personal_data") || false,
        canViewHealthData:
          lgpdConsent.dataCategories?.includes("health_data") || false,
        canViewContactData:
          lgpdConsent.dataCategories?.includes("contact_data") || false,
        dataRetentionDays: lgpdConsent.retentionPeriod || 365,
      };

      realtimeManager.setLGPDFilter(userId, lgpdFilter);
    }

    // Add patient data subscription helper to context
    c.set(
      "subscribeToPatientData",
      (patientId: string, callback: (event: RealtimeEvent) => void) => {
        const config: SubscriptionConfig = {
          table: "patients",
          event: "*",
          filter: `id=eq.${patientId}`,
          lgpdCompliant: true,
          auditEnabled: true,
          userId,
          healthcareProfessional: !!healthcareProfessional,
        };

        const subscriptionId = `patient-${patientId}-${userId}`;
        return realtimeManager.createSubscription(
          subscriptionId,
          config,
          callback,
        );
      },
    );

    return next();
  };
}

// Export types and utilities
export type { LGPDFilter, RealtimeEvent, SubscriptionConfig };
