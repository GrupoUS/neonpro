/**
 * LGPD Data Retention Manager
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides automated data retention policy management for LGPD compliance
 * with configurable retention periods, automated cleanup, and audit trail integration.
 */

import type { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { logger } from "@/lib/logger";
import type { LGPDDataType, LGPDPurpose } from "./consent-automation-manager";
import type {
  auditTrailManager,
  LGPDAuditEventType,
  LGPDAuditSeverity,
} from "./audit-trail-manager";

/**
 * Data Retention Policy Interface
 */
export interface DataRetentionPolicy {
  id: string;
  clinicId: string;
  dataType: LGPDDataType;
  purpose: LGPDPurpose;
  retentionPeriodDays: number;
  legalBasis: string;
  description: string;
  isActive: boolean;
  autoDelete: boolean;
  anonymizeAfterRetention: boolean;
  notificationDaysBefore: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Data Retention Record Interface
 */
export interface DataRetentionRecord {
  id: string;
  policyId: string;
  dataSubjectId: string;
  dataType: LGPDDataType;
  purpose: LGPDPurpose;
  dataCreatedAt: Date;
  retentionExpiresAt: Date;
  status: "active" | "expiring_soon" | "expired" | "deleted" | "anonymized";
  lastNotificationSent?: Date;
  deletedAt?: Date;
  anonymizedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Retention Analytics Interface
 */
export interface RetentionAnalytics {
  totalRecords: number;
  activeRecords: number;
  expiringSoonRecords: number;
  expiredRecords: number;
  deletedRecords: number;
  anonymizedRecords: number;
  retentionByDataType: Record<
    LGPDDataType,
    {
      total: number;
      expiring: number;
      expired: number;
    }
  >;
  upcomingExpirations: DataRetentionRecord[];
  retentionCompliance: number;
}

/**
 * Data Anonymization Configuration
 */
export interface AnonymizationConfig {
  dataType: LGPDDataType;
  fields: {
    fieldName: string;
    anonymizationMethod: "hash" | "mask" | "remove" | "generalize" | "substitute";
    preserveFormat?: boolean;
    substitutionValue?: string;
  }[];
}

/**
 * LGPD Data Retention Manager
 */
export class DataRetentionManager {
  private supabase;
  private defaultRetentionPeriods: Record<LGPDDataType, number> = {
    [LGPDDataType.AUTHENTICATION]: 1095, // 3 years
    [LGPDDataType.PROFILE]: 2555, // 7 years
    [LGPDDataType.MEDICAL_RECORDS]: 7300, // 20 years
    [LGPDDataType.FINANCIAL]: 1825, // 5 years
    [LGPDDataType.COMMUNICATION]: 365, // 1 year
    [LGPDDataType.ANALYTICS]: 730, // 2 years
    [LGPDDataType.MARKETING]: 365, // 1 year
    [LGPDDataType.THIRD_PARTY_SHARING]: 1095, // 3 years
  };

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Create or update data retention policy
   */
  async createRetentionPolicy(
    policy: Omit<DataRetentionPolicy, "id" | "createdAt" | "updatedAt">,
  ): Promise<DataRetentionPolicy> {
    try {
      const timestamp = new Date();
      const retentionPolicy: Partial<DataRetentionPolicy> = {
        ...policy,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const { data, error } = await this.supabase
        .from("lgpd_retention_policies")
        .insert(retentionPolicy)
        .select()
        .single();

      if (error) {
        logger.error("Error creating retention policy:", error);
        throw new Error(`Failed to create retention policy: ${error.message}`);
      }

      // Log policy creation
      await auditTrailManager.logAuditEvent({
        eventType: LGPDAuditEventType.DATA_RETENTION_APPLIED,
        clinicId: policy.clinicId,
        dataType: policy.dataType,
        purpose: policy.purpose,
        severity: LGPDAuditSeverity.INFO,
        description: `Data retention policy created: ${policy.retentionPeriodDays} days`,
        details: {
          policyId: data.id,
          retentionPeriodDays: policy.retentionPeriodDays,
          autoDelete: policy.autoDelete,
          anonymizeAfterRetention: policy.anonymizeAfterRetention,
        },
        legalBasis: policy.legalBasis,
        complianceStatus: "compliant",
      });

      logger.info(`Retention policy created: ${data.id} for ${policy.dataType}`);
      return data;
    } catch (error) {
      logger.error("Error in createRetentionPolicy:", error);
      throw error;
    }
  }

  /**
   * Register data for retention tracking
   */
  async registerDataForRetention(
    dataSubjectId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
    dataCreatedAt: Date = new Date(),
    customRetentionDays?: number,
  ): Promise<DataRetentionRecord> {
    try {
      // Get applicable retention policy
      const policy = await this.getRetentionPolicy(clinicId, dataType, purpose);

      if (!policy) {
        // Create default policy if none exists
        const defaultPolicy = await this.createDefaultRetentionPolicy(clinicId, dataType, purpose);
        return this.registerDataForRetention(
          dataSubjectId,
          clinicId,
          dataType,
          purpose,
          dataCreatedAt,
          customRetentionDays,
        );
      }

      const retentionPeriodDays = customRetentionDays || policy.retentionPeriodDays;
      const retentionExpiresAt = new Date(
        dataCreatedAt.getTime() + retentionPeriodDays * 24 * 60 * 60 * 1000,
      );

      const retentionRecord: Partial<DataRetentionRecord> = {
        policyId: policy.id,
        dataSubjectId,
        dataType,
        purpose,
        dataCreatedAt,
        retentionExpiresAt,
        status: "active",
      };

      const { data, error } = await this.supabase
        .from("lgpd_retention_records")
        .insert(retentionRecord)
        .select()
        .single();

      if (error) {
        logger.error("Error registering data for retention:", error);
        throw new Error(`Failed to register data for retention: ${error.message}`);
      }

      logger.info(
        `Data registered for retention: ${data.id} expires ${retentionExpiresAt.toISOString()}`,
      );
      return data;
    } catch (error) {
      logger.error("Error in registerDataForRetention:", error);
      throw error;
    }
  }

  /**
   * Process retention expiration (automated cleanup)
   */
  async processRetentionExpiration(clinicId?: string): Promise<{
    processed: number;
    deleted: number;
    anonymized: number;
    errors: number;
  }> {
    try {
      const now = new Date();
      const results = {
        processed: 0,
        deleted: 0,
        anonymized: 0,
        errors: 0,
      };

      // Get expired retention records
      let query = this.supabase
        .from("lgpd_retention_records")
        .select(`
          *,
          lgpd_retention_policies!inner(*)
        `)
        .lt("retentionExpiresAt", now.toISOString())
        .in("status", ["active", "expiring_soon"]);

      if (clinicId) {
        query = query.eq("lgpd_retention_policies.clinicId", clinicId);
      }

      const { data: expiredRecords, error } = await query;

      if (error) {
        logger.error("Error fetching expired retention records:", error);
        throw new Error(`Failed to fetch expired retention records: ${error.message}`);
      }

      if (!expiredRecords || expiredRecords.length === 0) {
        logger.info("No expired retention records found");
        return results;
      }

      // Process each expired record
      for (const record of expiredRecords) {
        try {
          results.processed++;
          const policy = record.lgpd_retention_policies;

          if (policy.autoDelete) {
            if (policy.anonymizeAfterRetention) {
              // Anonymize data
              await this.anonymizeData(record);
              await this.updateRetentionRecordStatus(record.id, "anonymized");
              results.anonymized++;

              // Log anonymization
              await auditTrailManager.logAuditEvent({
                eventType: LGPDAuditEventType.DATA_ANONYMIZED,
                clinicId: policy.clinicId,
                dataType: record.dataType,
                purpose: record.purpose,
                severity: LGPDAuditSeverity.INFO,
                description: `Data anonymized due to retention expiration`,
                details: {
                  retentionRecordId: record.id,
                  dataSubjectId: record.dataSubjectId,
                  expiredAt: record.retentionExpiresAt,
                },
                legalBasis: "Art. 16 - Eliminação de dados",
                dataSubjectId: record.dataSubjectId,
                complianceStatus: "compliant",
              });
            } else {
              // Delete data
              await this.deleteData(record);
              await this.updateRetentionRecordStatus(record.id, "deleted");
              results.deleted++;

              // Log deletion
              await auditTrailManager.logDataDeletion(
                "system",
                policy.clinicId,
                record.dataType,
                record.dataSubjectId,
                "Retention period expired",
                {
                  retentionRecordId: record.id,
                  method: "automated_retention",
                  retentionExpired: true,
                },
              );
            }
          } else {
            // Mark as expired but don't auto-delete
            await this.updateRetentionRecordStatus(record.id, "expired");

            // Log expiration
            await auditTrailManager.logAuditEvent({
              eventType: LGPDAuditEventType.DATA_RETENTION_APPLIED,
              clinicId: policy.clinicId,
              dataType: record.dataType,
              purpose: record.purpose,
              severity: LGPDAuditSeverity.WARNING,
              description: `Data retention expired - manual review required`,
              details: {
                retentionRecordId: record.id,
                dataSubjectId: record.dataSubjectId,
                expiredAt: record.retentionExpiresAt,
                requiresManualReview: true,
              },
              legalBasis: "Art. 16 - Eliminação de dados",
              dataSubjectId: record.dataSubjectId,
              complianceStatus: "pending_review",
            });
          }
        } catch (recordError) {
          logger.error(`Error processing retention record ${record.id}:`, recordError);
          results.errors++;
        }
      }

      logger.info(`Retention processing completed: ${JSON.stringify(results)}`);
      return results;
    } catch (error) {
      logger.error("Error in processRetentionExpiration:", error);
      throw error;
    }
  }

  /**
   * Check for expiring data and send notifications
   */
  async checkExpiringData(clinicId?: string): Promise<number> {
    try {
      const now = new Date();
      let notificationsSent = 0;

      // Get records expiring soon
      let query = this.supabase
        .from("lgpd_retention_records")
        .select(`
          *,
          lgpd_retention_policies!inner(*)
        `)
        .eq("status", "active");

      if (clinicId) {
        query = query.eq("lgpd_retention_policies.clinicId", clinicId);
      }

      const { data: records, error } = await query;

      if (error) {
        logger.error("Error fetching retention records:", error);
        throw new Error(`Failed to fetch retention records: ${error.message}`);
      }

      if (!records) return 0;

      for (const record of records) {
        const policy = record.lgpd_retention_policies;
        const daysUntilExpiration = Math.ceil(
          (new Date(record.retentionExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Check if notification should be sent
        if (daysUntilExpiration <= policy.notificationDaysBefore && daysUntilExpiration > 0) {
          const lastNotification = record.lastNotificationSent
            ? new Date(record.lastNotificationSent)
            : null;

          // Send notification if not sent in the last 24 hours
          if (
            !lastNotification ||
            now.getTime() - lastNotification.getTime() > 24 * 60 * 60 * 1000
          ) {
            await this.sendExpirationNotification(record, policy, daysUntilExpiration);
            await this.updateRetentionRecordStatus(record.id, "expiring_soon", {
              lastNotificationSent: now,
            });
            notificationsSent++;
          }
        }
      }

      if (notificationsSent > 0) {
        logger.info(`Sent ${notificationsSent} expiration notifications`);
      }

      return notificationsSent;
    } catch (error) {
      logger.error("Error in checkExpiringData:", error);
      throw error;
    }
  }

  /**
   * Get retention analytics
   */
  async getRetentionAnalytics(
    clinicId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<RetentionAnalytics> {
    try {
      let query = this.supabase
        .from("lgpd_retention_records")
        .select(`
          *,
          lgpd_retention_policies!inner(*)
        `)
        .eq("lgpd_retention_policies.clinicId", clinicId);

      if (startDate) {
        query = query.gte("dataCreatedAt", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("dataCreatedAt", endDate.toISOString());
      }

      const { data: records, error } = await query;

      if (error) {
        logger.error("Error fetching retention analytics:", error);
        throw new Error(`Failed to fetch retention analytics: ${error.message}`);
      }

      const now = new Date();
      const allRecords = records || [];

      const activeRecords = allRecords.filter((r) => r.status === "active");
      const expiringSoonRecords = allRecords.filter((r) => r.status === "expiring_soon");
      const expiredRecords = allRecords.filter((r) => r.status === "expired");
      const deletedRecords = allRecords.filter((r) => r.status === "deleted");
      const anonymizedRecords = allRecords.filter((r) => r.status === "anonymized");

      // Group by data type
      const retentionByDataType = {} as Record<
        LGPDDataType,
        {
          total: number;
          expiring: number;
          expired: number;
        }
      >;

      Object.values(LGPDDataType).forEach((dataType) => {
        const typeRecords = allRecords.filter((r) => r.dataType === dataType);
        retentionByDataType[dataType] = {
          total: typeRecords.length,
          expiring: typeRecords.filter((r) => r.status === "expiring_soon").length,
          expired: typeRecords.filter((r) => r.status === "expired").length,
        };
      });

      // Upcoming expirations (next 30 days)
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingExpirations = activeRecords
        .filter((r) => new Date(r.retentionExpiresAt) <= thirtyDaysFromNow)
        .sort(
          (a, b) =>
            new Date(a.retentionExpiresAt).getTime() - new Date(b.retentionExpiresAt).getTime(),
        )
        .slice(0, 20);

      // Calculate compliance rate
      const totalManagedRecords = allRecords.length;
      const compliantRecords = allRecords.filter(
        (r) =>
          r.status === "active" ||
          r.status === "expiring_soon" ||
          r.status === "deleted" ||
          r.status === "anonymized",
      ).length;
      const retentionCompliance =
        totalManagedRecords > 0 ? (compliantRecords / totalManagedRecords) * 100 : 100;

      return {
        totalRecords: allRecords.length,
        activeRecords: activeRecords.length,
        expiringSoonRecords: expiringSoonRecords.length,
        expiredRecords: expiredRecords.length,
        deletedRecords: deletedRecords.length,
        anonymizedRecords: anonymizedRecords.length,
        retentionByDataType,
        upcomingExpirations,
        retentionCompliance,
      };
    } catch (error) {
      logger.error("Error in getRetentionAnalytics:", error);
      throw error;
    }
  }

  /**
   * Get retention policy for data type and purpose
   */
  private async getRetentionPolicy(
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
  ): Promise<DataRetentionPolicy | null> {
    try {
      const { data, error } = await this.supabase
        .from("lgpd_retention_policies")
        .select("*")
        .eq("clinicId", clinicId)
        .eq("dataType", dataType)
        .eq("purpose", purpose)
        .eq("isActive", true)
        .order("createdAt", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        logger.error("Error fetching retention policy:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error in getRetentionPolicy:", error);
      return null;
    }
  }

  /**
   * Create default retention policy
   */
  private async createDefaultRetentionPolicy(
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
  ): Promise<DataRetentionPolicy> {
    const retentionPeriodDays = this.defaultRetentionPeriods[dataType];

    return this.createRetentionPolicy({
      clinicId,
      dataType,
      purpose,
      retentionPeriodDays,
      legalBasis: "Art. 16 - Eliminação de dados",
      description: `Default retention policy for ${dataType}`,
      isActive: true,
      autoDelete: false, // Conservative default
      anonymizeAfterRetention: true,
      notificationDaysBefore: 30,
    });
  }

  /**
   * Update retention record status
   */
  private async updateRetentionRecordStatus(
    recordId: string,
    status: DataRetentionRecord["status"],
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const updateData: Partial<DataRetentionRecord> = { status };

      if (status === "deleted") {
        updateData.deletedAt = new Date();
      } else if (status === "anonymized") {
        updateData.anonymizedAt = new Date();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await this.supabase
        .from("lgpd_retention_records")
        .update(updateData)
        .eq("id", recordId);

      if (error) {
        logger.error("Error updating retention record status:", error);
        throw new Error(`Failed to update retention record status: ${error.message}`);
      }
    } catch (error) {
      logger.error("Error in updateRetentionRecordStatus:", error);
      throw error;
    }
  }

  /**
   * Anonymize data (placeholder implementation)
   */
  private async anonymizeData(record: DataRetentionRecord): Promise<void> {
    try {
      // This would implement actual data anonymization based on data type
      // For now, we'll log the requirement
      logger.info(`Anonymizing data for record ${record.id}: ${record.dataType}`);

      // In a real implementation, this would:
      // 1. Identify all data tables containing the data subject's information
      // 2. Apply appropriate anonymization techniques based on data type
      // 3. Ensure referential integrity is maintained
      // 4. Verify anonymization was successful
    } catch (error) {
      logger.error("Error in anonymizeData:", error);
      throw error;
    }
  }

  /**
   * Delete data (placeholder implementation)
   */
  private async deleteData(record: DataRetentionRecord): Promise<void> {
    try {
      // This would implement actual data deletion based on data type
      // For now, we'll log the requirement
      logger.info(`Deleting data for record ${record.id}: ${record.dataType}`);

      // In a real implementation, this would:
      // 1. Identify all data tables containing the data subject's information
      // 2. Perform cascading deletes while maintaining referential integrity
      // 3. Create backup before deletion if required
      // 4. Verify deletion was successful
    } catch (error) {
      logger.error("Error in deleteData:", error);
      throw error;
    }
  }

  /**
   * Send expiration notification (placeholder implementation)
   */
  private async sendExpirationNotification(
    record: DataRetentionRecord,
    policy: DataRetentionPolicy,
    daysUntilExpiration: number,
  ): Promise<void> {
    try {
      // This would integrate with notification systems
      logger.info(
        `Sending expiration notification for record ${record.id}: ${daysUntilExpiration} days remaining`,
      );

      // Log notification
      await auditTrailManager.logAuditEvent({
        eventType: LGPDAuditEventType.DATA_RETENTION_APPLIED,
        clinicId: policy.clinicId,
        dataType: record.dataType,
        purpose: record.purpose,
        severity: LGPDAuditSeverity.INFO,
        description: `Data retention expiration notification sent`,
        details: {
          retentionRecordId: record.id,
          daysUntilExpiration,
          notificationType: "expiration_warning",
        },
        legalBasis: "Art. 16 - Eliminação de dados",
        dataSubjectId: record.dataSubjectId,
        complianceStatus: "compliant",
      });
    } catch (error) {
      logger.error("Error in sendExpirationNotification:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const createdataRetentionManager = () => new DataRetentionManager();
