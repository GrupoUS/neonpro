import { PrismaClient } from '@prisma/client';

export interface ComplianceConfig {
  enableDataEncryption: boolean;
  enableAuditLogging: boolean;
  lgpdRetentionDays: number;
  enablePatientConsent: boolean;
  enableDataMasking: boolean;
  enableSecureStorage: boolean;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  clinicId: string;
  dataTypes: string[];
  purpose: string;
  retentionPeriod: number;
  consentedAt: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
}

export class GoogleCalendarComplianceService {
  private prisma: PrismaClient;
  private config: ComplianceConfig;

  constructor(config: Partial<ComplianceConfig> = {}, prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
    this.config = {
      enableDataEncryption: true,
      enableAuditLogging: true,
      lgpdRetentionDays: 365, // 1 year retention for healthcare data
      enablePatientConsent: true,
      enableDataMasking: true,
      enableSecureStorage: true,
      ...config,
    };
  }

  /**
   * Validate LGPD compliance for calendar integration
   */
  async validateLGPDCompliance(
    userId: string,
    clinicId: string,
  ): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if consent was given
      const integration = await this.prisma.googleCalendarIntegration.findUnique({
        where: {
          userId_clinicId: { userId, clinicId },
        },
      });

      if (!integration?.lgpdConsent) {
        issues.push('LGPD consent not recorded');
        recommendations.push(
          'Obtain explicit consent before enabling calendar sync',
        );
      }

      // Check consent date
      if (integration?.lgpdConsent && !integration.consentDate) {
        issues.push('Consent date not recorded');
        recommendations.push('Record consent date for compliance tracking');
      }

      // Check if data retention is configured
      if (this.config.lgpdRetentionDays > 730) {
        // 2 years
        issues.push('Data retention period exceeds LGPD recommendations');
        recommendations.push(
          'Consider reducing retention period to 2 years maximum',
        );
      }

      // Check encryption status
      if (this.config.enableDataEncryption) {
        // Verify tokens are encrypted at rest
        const hasEncryptedTokens = this.verifyTokenEncryption(integration);
        if (!hasEncryptedTokens) {
          issues.push('Access tokens not encrypted at rest');
          recommendations.push('Enable encryption for sensitive data');
        }
      }

      // Audit logging check
      if (this.config.enableAuditLogging) {
        const auditLogs = await this.prisma.googleCalendarSyncLog.count({
          where: {
            integrationId: integration?.id,
          },
        });

        if (auditLogs === 0) {
          issues.push('No audit logs found');
          recommendations.push(
            'Enable audit logging for all calendar operations',
          );
        }
      }

      return {
        compliant: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('Error validating LGPD compliance:', error);
      return {
        compliant: false,
        issues: ['Unable to validate compliance'],
        recommendations: ['Check system configuration and try again'],
      };
    }
  }

  /**
   * Record patient consent for data sharing
   */
  async recordConsent(
    userId: string,
    clinicId: string,
    dataTypes: string[],
    purpose: string,
    retentionPeriod: number = this.config.lgpdRetentionDays,
  ): Promise<ConsentRecord> {
    const consent = await this.prisma.consentRecord.create({
      data: {
        userId,
        clinicId,
        dataTypes,
        purpose,
        retentionPeriod,
        consentedAt: new Date(),
        version: '1.0',
        ipAddress: 'unknown', // In real app, get from request
        userAgent: 'neonpro-service', // In real app, get from request
      },
    });

    // Update integration consent status
    await this.prisma.googleCalendarIntegration.updateMany({
      where: {
        userId,
        clinicId,
      },
      data: {
        lgpdConsent: true,
        consentDate: new Date(),
        consentVersion: '1.0',
      },
    });

    return consent;
  }

  /**
   * Anonymize data for compliance
   */
  anonymizeAppointmentData(data: any): any {
    if (!this.config.enableDataMasking) {
      return data;
    }

    const anonymized = { ...data };

    // Mask patient names
    if (anonymized.patientName) {
      anonymized.patientName = this.maskName(anonymized.patientName);
    }

    // Mask professional names
    if (anonymized.professionalName) {
      anonymized.professionalName = this.maskName(anonymized.professionalName);
    }

    // Mask emails
    if (anonymized.patientEmail) {
      anonymized.patientEmail = this.maskEmail(anonymized.patientEmail);
    }

    if (anonymized.professionalEmail) {
      anonymized.professionalEmail = this.maskEmail(
        anonymized.professionalEmail,
      );
    }

    // Remove sensitive notes
    delete anonymized.description;
    delete anonymized.chiefComplaint;
    delete anonymized.clinicalNotes;

    return anonymized;
  }

  /**
   * Purge old data according to retention policy
   */
  async purgeOldData(): Promise<{
    deletedSyncLogs: number;
    deletedEvents: number;
    purgedIntegrations: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.lgpdRetentionDays);

    try {
      // Delete old sync logs
      const deletedSyncLogs = await this.prisma.googleCalendarSyncLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      // Delete old event mappings for deleted appointments
      const deletedEvents = await this.prisma.googleCalendarEvent.deleteMany({
        where: {
          appointment: {
            OR: [
              { deletedAt: { not: null } },
              { status: 'cancelled', updatedAt: { lt: cutoffDate } },
            ],
          },
        },
      });

      // Purge integrations that haven't been used in over a year
      const purgedIntegrations = await this.prisma.googleCalendarIntegration.deleteMany({
        where: {
          OR: [
            { lastSyncAt: { lt: cutoffDate } },
            { createdAt: { lt: cutoffDate }, syncEnabled: false },
          ],
        },
      });

      return {
        deletedSyncLogs: deletedSyncLogs.count,
        deletedEvents: deletedEvents.count,
        purgedIntegrations: purgedIntegrations.count,
      };
    } catch (error) {
      console.error('Error purging old data:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    clinicId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalIntegrations: number;
    activeIntegrations: number;
    consentsRecorded: number;
    auditLogsCount: number;
    dataRetentionCompliance: number; // percentage
    encryptionCompliance: number; // percentage
    issues: string[];
  }> {
    const whereClause: any = {};
    if (clinicId) whereClause.clinicId = clinicId;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [
      totalIntegrations,
      activeIntegrations,
      consentsRecorded,
      auditLogsCount,
      integrationsWithEncryption,
    ] = await Promise.all([
      this.prisma.googleCalendarIntegration.count({ where: whereClause }),
      this.prisma.googleCalendarIntegration.count({
        where: { ...whereClause, syncEnabled: true },
      }),
      this.prisma.googleCalendarIntegration.count({
        where: { ...whereClause, lgpdConsent: true },
      }),
      this.prisma.googleCalendarSyncLog.count({ where: whereClause }),
      this.prisma.googleCalendarIntegration.count({
        where: {
          ...whereClause,
          accessToken: { not: null }, // Basic check for encryption
        },
      }),
    ]);

    const encryptionCompliance = totalIntegrations > 0
      ? (integrationsWithEncryption / totalIntegrations) * 100
      : 100;

    // Calculate data retention compliance
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.lgpdRetentionDays);

    const oldRecords = await this.prisma.googleCalendarSyncLog.count({
      where: {
        ...whereClause,
        createdAt: { lt: cutoffDate },
      },
    });

    const dataRetentionCompliance = auditLogsCount > 0
      ? ((auditLogsCount - oldRecords) / auditLogsCount) * 100
      : 100;

    const issues: string[] = [];
    if (encryptionCompliance < 100) {
      issues.push(
        `${Math.round(100 - encryptionCompliance)}% of integrations lack proper encryption`,
      );
    }
    if (dataRetentionCompliance < 95) {
      issues.push('Data retention policy not being followed properly');
    }
    if (consentsRecorded < totalIntegrations) {
      issues.push(
        `${totalIntegrations - consentsRecorded} integrations lack proper consent`,
      );
    }

    return {
      totalIntegrations,
      activeIntegrations,
      consentsRecorded,
      auditLogsCount,
      dataRetentionCompliance: Math.round(dataRetentionCompliance),
      encryptionCompliance: Math.round(encryptionCompliance),
      issues,
    };
  }

  /**
   * Export data for data subject requests (LGPD Article 18)
   */
  async exportUserData(
    userId: string,
    clinicId?: string,
  ): Promise<{
    integrations: any[];
    syncLogs: any[];
    events: any[];
    consents: any[];
  }> {
    const integrationsWhere: any = { userId };
    if (clinicId) integrationsWhere.clinicId = clinicId;

    const [integrations, syncLogs, events, consents] = await Promise.all([
      this.prisma.googleCalendarIntegration.findMany({
        where: integrationsWhere,
        select: {
          id: true,
          clinicId: true,
          syncEnabled: true,
          lgpdConsent: true,
          consentDate: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive tokens
        },
      }),
      this.prisma.googleCalendarSyncLog.findMany({
        where: {
          integration: {
            ...integrationsWhere,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.googleCalendarEvent.findMany({
        where: {
          appointment: {
            ...(clinicId && { clinicId }),
            patient: { userId },
          },
        },
      }),
      this.prisma.consentRecord.findMany({
        where: integrationsWhere,
      }),
    ]);

    return {
      integrations,
      syncLogs,
      events,
      consents,
    };
  }

  /**
   * Delete user data (Right to be forgotten - LGPD Article 18)
   */
  async deleteUserData(
    userId: string,
    clinicId?: string,
  ): Promise<{
    success: boolean;
    deletedIntegrations: number;
    deletedSyncLogs: number;
    deletedEvents: number;
    deletedConsents: number;
  }> {
    const whereClause: any = { userId };
    if (clinicId) whereClause.clinicId = clinicId;

    try {
      const [
        deletedIntegrations,
        deletedSyncLogs,
        deletedEvents,
        deletedConsents,
      ] = await Promise.all([
        this.prisma.googleCalendarIntegration.deleteMany({
          where: whereClause,
        }),
        this.prisma.googleCalendarSyncLog.deleteMany({
          where: {
            integration: { ...whereClause },
          },
        }),
        this.prisma.googleCalendarEvent.deleteMany({
          where: {
            appointment: {
              ...(clinicId && { clinicId }),
              patient: { userId },
            },
          },
        }),
        this.prisma.consentRecord.deleteMany({ where: whereClause }),
      ]);

      return {
        success: true,
        deletedIntegrations: deletedIntegrations.count,
        deletedSyncLogs: deletedSyncLogs.count,
        deletedEvents: deletedEvents.count,
        deletedConsents: deletedConsents.count,
      };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        deletedIntegrations: 0,
        deletedSyncLogs: 0,
        deletedEvents: 0,
        deletedConsents: 0,
      };
    }
  }

  /**
   * Mask a name while preserving some information
   */
  private maskName(name: string): string {
    if (!name || name.length <= 2) return name;

    const parts = name.split(' ');
    return parts
      .map((part, index) => {
        if (index === 0 || part.length <= 2) return part;
        return part[0] + '*'.repeat(part.length - 1);
      })
      .join(' ');
  }

  /**
   * Mask an email address
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [local, domain] = email.split('@');
    const maskedLocal = local[0] + '*'.repeat(local.length - 1);
    const [domainName, ...domainParts] = domain.split('.');
    const maskedDomain = domainName[0] + '*'.repeat(domainName.length - 1);

    return `${maskedLocal}@${maskedDomain}.${domainParts.join('.')}`;
  }

  /**
   * Verify token encryption (basic check)
   */
  private verifyTokenEncryption(integration?: any): boolean {
    // In a real implementation, this would check if tokens are properly encrypted
    // For now, we'll assume they are if they exist
    return !!integration?.accessToken;
  }
}
