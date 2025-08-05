/**
 * LGPD Consent Automation Manager
 * Story 1.5: LGPD Compliance Automation
 *
 * This module provides comprehensive automated consent management for LGPD compliance
 * throughout the authentication system with granular permission tracking.
 */

import type { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { SecurityAuditLogger } from "@/lib/auth/security-audit-logger";
import type { logger } from "@/lib/logger";

/**
 * LGPD Data Types for consent management
 */
export enum LGPDDataType {
  AUTHENTICATION = "authentication",
  PROFILE = "profile",
  MEDICAL_RECORDS = "medical_records",
  FINANCIAL = "financial",
  COMMUNICATION = "communication",
  ANALYTICS = "analytics",
  MARKETING = "marketing",
  THIRD_PARTY_SHARING = "third_party_sharing",
}

/**
 * LGPD Processing Purposes
 */
export enum LGPDPurpose {
  SERVICE_PROVISION = "service_provision",
  LEGAL_OBLIGATION = "legal_obligation",
  LEGITIMATE_INTEREST = "legitimate_interest",
  CONSENT = "consent",
  VITAL_INTEREST = "vital_interest",
  PUBLIC_INTEREST = "public_interest",
  CONTRACT_PERFORMANCE = "contract_performance",
}

/**
 * Consent Record Interface
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  clinicId: string;
  dataType: LGPDDataType;
  purpose: LGPDPurpose;
  consentGiven: boolean;
  consentVersion: string;
  consentText: string;
  legalBasis: string;
  expiresAt?: Date;
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

/**
 * Consent Collection Request
 */
export interface ConsentCollectionRequest {
  userId: string;
  clinicId: string;
  dataTypes: LGPDDataType[];
  purposes: LGPDPurpose[];
  consentText: string;
  version: string;
  expirationDays?: number;
  metadata?: Record<string, any>;
}

/**
 * Consent Analytics
 */
export interface ConsentAnalytics {
  totalConsents: number;
  activeConsents: number;
  withdrawnConsents: number;
  expiredConsents: number;
  consentsByDataType: Record<LGPDDataType, number>;
  consentsByPurpose: Record<LGPDPurpose, number>;
  recentWithdrawals: ConsentRecord[];
  expiringConsents: ConsentRecord[];
}

/**
 * LGPD Consent Automation Manager
 */
export class ConsentAutomationManager {
  private supabase;
  private auditLogger: SecurityAuditLogger;
  private currentVersion = "1.0.0";

  constructor() {
    this.supabase = createClient();
    this.auditLogger = new SecurityAuditLogger();
  }

  /**
   * Collect consent from user with comprehensive tracking
   */
  async collectConsent(
    request: ConsentCollectionRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<ConsentRecord[]> {
    try {
      const consentRecords: ConsentRecord[] = [];
      const timestamp = new Date();
      const expiresAt = request.expirationDays
        ? new Date(timestamp.getTime() + request.expirationDays * 24 * 60 * 60 * 1000)
        : undefined;

      // Create consent records for each data type and purpose combination
      for (const dataType of request.dataTypes) {
        for (const purpose of request.purposes) {
          const consentRecord: Partial<ConsentRecord> = {
            userId: request.userId,
            clinicId: request.clinicId,
            dataType,
            purpose,
            consentGiven: true,
            consentVersion: request.version,
            consentText: request.consentText,
            legalBasis: this.getLegalBasisForPurpose(purpose),
            expiresAt,
            createdAt: timestamp,
            updatedAt: timestamp,
            ipAddress,
            userAgent,
            metadata: request.metadata,
          };

          const { data, error } = await this.supabase
            .from("lgpd_consent_records")
            .insert(consentRecord)
            .select()
            .single();

          if (error) {
            logger.error("Error creating consent record:", error);
            throw new Error(`Failed to create consent record: ${error.message}`);
          }

          consentRecords.push(data);

          // Log consent collection for audit
          await this.auditLogger.logSecurityEvent({
            userId: request.userId,
            action: "consent_collected",
            resource: "lgpd_consent",
            details: {
              dataType,
              purpose,
              version: request.version,
              expiresAt: expiresAt?.toISOString(),
            },
            ipAddress,
            userAgent,
            severity: "info",
          });
        }
      }

      logger.info(`Collected ${consentRecords.length} consent records for user ${request.userId}`);
      return consentRecords;
    } catch (error) {
      logger.error("Error in collectConsent:", error);
      throw error;
    }
  }

  /**
   * Withdraw consent with immediate effect
   */
  async withdrawConsent(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      const withdrawnAt = new Date();

      const { data, error } = await this.supabase
        .from("lgpd_consent_records")
        .update({
          consentGiven: false,
          withdrawnAt,
          updatedAt: withdrawnAt,
          metadata: { withdrawalReason: reason },
        })
        .eq("userId", userId)
        .eq("clinicId", clinicId)
        .eq("dataType", dataType)
        .eq("purpose", purpose)
        .eq("consentGiven", true)
        .is("withdrawnAt", null)
        .select();

      if (error) {
        logger.error("Error withdrawing consent:", error);
        throw new Error(`Failed to withdraw consent: ${error.message}`);
      }

      if (!data || data.length === 0) {
        logger.warn(`No active consent found for withdrawal: ${userId}, ${dataType}, ${purpose}`);
        return false;
      }

      // Log consent withdrawal for audit
      await this.auditLogger.logSecurityEvent({
        userId,
        action: "consent_withdrawn",
        resource: "lgpd_consent",
        details: {
          dataType,
          purpose,
          reason,
          recordsAffected: data.length,
        },
        ipAddress,
        userAgent,
        severity: "info",
      });

      // Trigger data processing stop for withdrawn consent
      await this.triggerDataProcessingStop(userId, clinicId, dataType, purpose);

      logger.info(`Consent withdrawn for user ${userId}: ${dataType}/${purpose}`);
      return true;
    } catch (error) {
      logger.error("Error in withdrawConsent:", error);
      throw error;
    }
  }

  /**
   * Check if user has valid consent for specific data processing
   */
  async hasValidConsent(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("lgpd_consent_records")
        .select("*")
        .eq("userId", userId)
        .eq("clinicId", clinicId)
        .eq("dataType", dataType)
        .eq("purpose", purpose)
        .eq("consentGiven", true)
        .is("withdrawnAt", null)
        .or(`expiresAt.is.null,expiresAt.gt.${new Date().toISOString()}`)
        .order("createdAt", { ascending: false })
        .limit(1);

      if (error) {
        logger.error("Error checking consent:", error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      logger.error("Error in hasValidConsent:", error);
      return false;
    }
  }

  /**
   * Get all consents for a user
   */
  async getUserConsents(
    userId: string,
    clinicId: string,
    activeOnly: boolean = false,
  ): Promise<ConsentRecord[]> {
    try {
      let query = this.supabase
        .from("lgpd_consent_records")
        .select("*")
        .eq("userId", userId)
        .eq("clinicId", clinicId);

      if (activeOnly) {
        query = query
          .eq("consentGiven", true)
          .is("withdrawnAt", null)
          .or(`expiresAt.is.null,expiresAt.gt.${new Date().toISOString()}`);
      }

      const { data, error } = await query.order("createdAt", { ascending: false });

      if (error) {
        logger.error("Error fetching user consents:", error);
        throw new Error(`Failed to fetch user consents: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getUserConsents:", error);
      throw error;
    }
  }

  /**
   * Update consent version and re-collect if needed
   */
  async updateConsentVersion(
    userId: string,
    clinicId: string,
    newVersion: string,
    newConsentText: string,
    forceRecollection: boolean = false,
  ): Promise<boolean> {
    try {
      const currentConsents = await this.getUserConsents(userId, clinicId, true);

      if (currentConsents.length === 0) {
        logger.info(`No active consents found for user ${userId} to update`);
        return true;
      }

      // Check if version update requires re-collection
      const requiresRecollection =
        forceRecollection ||
        this.versionRequiresRecollection(currentConsents[0].consentVersion, newVersion);

      if (requiresRecollection) {
        // Mark current consents as requiring re-collection
        for (const consent of currentConsents) {
          await this.supabase
            .from("lgpd_consent_records")
            .update({
              consentGiven: false,
              updatedAt: new Date(),
              metadata: {
                ...consent.metadata,
                versionUpdateRequired: true,
                newVersion,
                requiresRecollection: true,
              },
            })
            .eq("id", consent.id);
        }

        // Log version update requirement
        await this.auditLogger.logSecurityEvent({
          userId,
          action: "consent_version_update_required",
          resource: "lgpd_consent",
          details: {
            oldVersion: currentConsents[0].consentVersion,
            newVersion,
            consentsAffected: currentConsents.length,
          },
          severity: "info",
        });

        return false; // Indicates re-collection needed
      }

      // Update version without requiring re-collection
      for (const consent of currentConsents) {
        await this.supabase
          .from("lgpd_consent_records")
          .update({
            consentVersion: newVersion,
            consentText: newConsentText,
            updatedAt: new Date(),
          })
          .eq("id", consent.id);
      }

      logger.info(`Updated consent version for user ${userId} to ${newVersion}`);
      return true;
    } catch (error) {
      logger.error("Error in updateConsentVersion:", error);
      throw error;
    }
  }

  /**
   * Get consent analytics for clinic
   */
  async getConsentAnalytics(
    clinicId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ConsentAnalytics> {
    try {
      let query = this.supabase.from("lgpd_consent_records").select("*").eq("clinicId", clinicId);

      if (startDate) {
        query = query.gte("createdAt", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("createdAt", endDate.toISOString());
      }

      const { data: allConsents, error } = await query;

      if (error) {
        logger.error("Error fetching consent analytics:", error);
        throw new Error(`Failed to fetch consent analytics: ${error.message}`);
      }

      const now = new Date();
      const activeConsents =
        allConsents?.filter(
          (c) => c.consentGiven && !c.withdrawnAt && (!c.expiresAt || new Date(c.expiresAt) > now),
        ) || [];

      const withdrawnConsents = allConsents?.filter((c) => c.withdrawnAt) || [];
      const expiredConsents =
        allConsents?.filter((c) => c.expiresAt && new Date(c.expiresAt) <= now) || [];

      // Group by data type
      const consentsByDataType = {} as Record<LGPDDataType, number>;
      Object.values(LGPDDataType).forEach((type) => {
        consentsByDataType[type] = activeConsents.filter((c) => c.dataType === type).length;
      });

      // Group by purpose
      const consentsByPurpose = {} as Record<LGPDPurpose, number>;
      Object.values(LGPDPurpose).forEach((purpose) => {
        consentsByPurpose[purpose] = activeConsents.filter((c) => c.purpose === purpose).length;
      });

      // Recent withdrawals (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentWithdrawals = withdrawnConsents
        .filter((c) => c.withdrawnAt && new Date(c.withdrawnAt) > thirtyDaysAgo)
        .slice(0, 10);

      // Expiring consents (next 30 days)
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expiringConsents = activeConsents
        .filter((c) => c.expiresAt && new Date(c.expiresAt) <= thirtyDaysFromNow)
        .slice(0, 10);

      return {
        totalConsents: allConsents?.length || 0,
        activeConsents: activeConsents.length,
        withdrawnConsents: withdrawnConsents.length,
        expiredConsents: expiredConsents.length,
        consentsByDataType,
        consentsByPurpose,
        recentWithdrawals,
        expiringConsents,
      };
    } catch (error) {
      logger.error("Error in getConsentAnalytics:", error);
      throw error;
    }
  }

  /**
   * Clean up expired consents
   */
  async cleanupExpiredConsents(clinicId?: string): Promise<number> {
    try {
      let query = this.supabase
        .from("lgpd_consent_records")
        .update({
          consentGiven: false,
          updatedAt: new Date(),
          metadata: { expiredAutomatically: true },
        })
        .lt("expiresAt", new Date().toISOString())
        .eq("consentGiven", true)
        .is("withdrawnAt", null);

      if (clinicId) {
        query = query.eq("clinicId", clinicId);
      }

      const { data, error } = await query.select();

      if (error) {
        logger.error("Error cleaning up expired consents:", error);
        throw new Error(`Failed to cleanup expired consents: ${error.message}`);
      }

      const cleanedCount = data?.length || 0;

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired consents`);

        // Log cleanup for audit
        await this.auditLogger.logSecurityEvent({
          userId: "system",
          action: "consent_cleanup_expired",
          resource: "lgpd_consent",
          details: {
            cleanedCount,
            clinicId: clinicId || "all",
          },
          severity: "info",
        });
      }

      return cleanedCount;
    } catch (error) {
      logger.error("Error in cleanupExpiredConsents:", error);
      throw error;
    }
  }

  /**
   * Get legal basis for processing purpose
   */
  private getLegalBasisForPurpose(purpose: LGPDPurpose): string {
    const legalBasisMap = {
      [LGPDPurpose.SERVICE_PROVISION]: "Art. 7º, V - execução de contrato",
      [LGPDPurpose.LEGAL_OBLIGATION]: "Art. 7º, II - cumprimento de obrigação legal",
      [LGPDPurpose.LEGITIMATE_INTEREST]: "Art. 7º, IX - interesse legítimo",
      [LGPDPurpose.CONSENT]: "Art. 7º, I - consentimento",
      [LGPDPurpose.VITAL_INTEREST]: "Art. 7º, IV - proteção da vida",
      [LGPDPurpose.PUBLIC_INTEREST]: "Art. 7º, III - interesse público",
      [LGPDPurpose.CONTRACT_PERFORMANCE]: "Art. 7º, V - execução de contrato",
    };

    return legalBasisMap[purpose] || "Art. 7º, I - consentimento";
  }

  /**
   * Check if version change requires consent re-collection
   */
  private versionRequiresRecollection(oldVersion: string, newVersion: string): boolean {
    // Simple version comparison - in production, implement semantic versioning
    const oldParts = oldVersion.split(".").map(Number);
    const newParts = newVersion.split(".").map(Number);

    // Major version change requires re-collection
    if (newParts[0] > oldParts[0]) {
      return true;
    }

    // Minor version change with significant changes requires re-collection
    if (newParts[0] === oldParts[0] && newParts[1] > oldParts[1]) {
      return true;
    }

    return false;
  }

  /**
   * Trigger data processing stop for withdrawn consent
   */
  private async triggerDataProcessingStop(
    userId: string,
    clinicId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
  ): Promise<void> {
    try {
      // This would integrate with other systems to stop data processing
      // For now, we'll log the requirement
      await this.auditLogger.logSecurityEvent({
        userId,
        action: "data_processing_stop_required",
        resource: "lgpd_compliance",
        details: {
          dataType,
          purpose,
          clinicId,
          stopReason: "consent_withdrawn",
        },
        severity: "warning",
      });

      logger.info(`Data processing stop triggered for ${userId}: ${dataType}/${purpose}`);
    } catch (error) {
      logger.error("Error triggering data processing stop:", error);
    }
  }
}

// Export singleton instance
export const createconsentAutomationManager = () => new ConsentAutomationManager();
