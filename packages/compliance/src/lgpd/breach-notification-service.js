/**
 * @fileoverview LGPD Breach Notification Service (Art. 48 LGPD)
 * Constitutional Brazilian Healthcare Breach Notification Implementation
 *
 * Constitutional Healthcare Principle: Patient Safety First + Immediate Transparency
 * Quality Standard: ≥9.9/10
 *
 * LGPD Article 48 - Security Incident Notification:
 * - Notification to ANPD within reasonable timeframe
 * - Notification may include risk assessment
 * - Notification to data subjects if high risk to rights and freedoms
 * - Constitutional requirement: 72 hours for healthcare data breaches
 */
import { z } from 'zod';
import { PatientDataClassification } from '../types';
/**
 * Breach Severity Classification
 */
export var BreachSeverity;
(function (BreachSeverity) {
    BreachSeverity["LOW"] = "LOW";
    BreachSeverity["MEDIUM"] = "MEDIUM";
    BreachSeverity["HIGH"] = "HIGH";
    BreachSeverity["CRITICAL"] = "CRITICAL";
})(BreachSeverity || (BreachSeverity = {}));
/**
 * Breach Category Classification
 */
export var BreachCategory;
(function (BreachCategory) {
    BreachCategory["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    BreachCategory["DATA_THEFT"] = "DATA_THEFT";
    BreachCategory["SYSTEM_INTRUSION"] = "SYSTEM_INTRUSION";
    BreachCategory["ACCIDENTAL_DISCLOSURE"] = "ACCIDENTAL_DISCLOSURE";
    BreachCategory["DATA_CORRUPTION"] = "DATA_CORRUPTION";
    BreachCategory["RANSOMWARE_ATTACK"] = "RANSOMWARE_ATTACK";
    BreachCategory["INSIDER_THREAT"] = "INSIDER_THREAT";
    BreachCategory["VENDOR_BREACH"] = "VENDOR_BREACH";
    BreachCategory["CONSTITUTIONAL_VIOLATION"] = "CONSTITUTIONAL_VIOLATION";
})(BreachCategory || (BreachCategory = {}));
/**
 * Breach Detection Schema
 */
export const BreachDetectionSchema = z.object({
    incidentId: z.string().uuid().optional(),
    detectedAt: z.date(),
    detectedBy: z.string().uuid(),
    detectionMethod: z.enum([
        'AUTOMATED_MONITORING', // Sistema de monitoramento
        'MANUAL_DISCOVERY', // Descoberta manual
        'THIRD_PARTY_REPORT', // Relatório de terceiros
        'PATIENT_COMPLAINT', // Reclamação de paciente
        'AUDIT_FINDING', // Achado de auditoria
        'PENETRATION_TEST', // Teste de penetração
    ]),
    tenantId: z.string().uuid(),
    affectedSystems: z.array(z.string()),
    breachCategory: z.nativeEnum(BreachCategory),
    initialSeverity: z.nativeEnum(BreachSeverity),
    dataTypesAffected: z.array(z.nativeEnum(PatientDataClassification)),
    estimatedAffectedRecords: z.number().min(0),
    estimatedAffectedPatients: z.number().min(0),
    breachDescription: z.string().min(50).max(2000),
    immediateActions: z.array(z.string()),
    containmentMeasures: z.array(z.string()),
    potentialImpact: z.string().min(20).max(1000),
    rootCause: z.string().max(500).optional(),
    vulnerabilityExploited: z.string().max(500).optional(),
    attackVector: z.string().max(500).optional(),
    constitutionalViolation: z.boolean().default(false),
    patientSafetyRisk: z.boolean().default(false),
    reportingMetadata: z.object({
        internalTeamNotified: z.boolean().default(false),
        dpoNotified: z.boolean().default(false),
        executiveTeamNotified: z.boolean().default(false),
        legalTeamNotified: z.boolean().default(false),
    }),
});
/**
 * Constitutional Breach Notification Service for Healthcare LGPD Compliance
 */
export class BreachNotificationService {
    constructor() {
        this.constitutionalQualityStandard = 9.9;
        this.constitutionalTimelineHours = 72; // Constitutional healthcare requirement
    }
    /**
     * Process Breach Detection and Initiate Constitutional Notification
     * Implements LGPD Art. 48 with constitutional healthcare validation
     */
    async processBreachDetection(detection) {
        try {
            // Step 1: Validate breach detection data
            const validatedDetection = BreachDetectionSchema.parse(detection);
            // Step 2: Constitutional healthcare validation and severity assessment
            const severityAssessment = await this.assessConstitutionalSeverity(validatedDetection);
            // Step 3: Immediate containment validation
            const containmentStatus = await this.validateImmediateContainment(validatedDetection);
            if (!containmentStatus.adequate) {
                return {
                    success: false,
                    error: `Inadequate breach containment: ${containmentStatus.issues.join(', ')}`,
                    complianceScore: containmentStatus.score,
                    regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
                    auditTrail: await this.createAuditEvent('BREACH_CONTAINMENT_FAILURE', validatedDetection),
                    timestamp: new Date(),
                };
            }
            // Step 4: Execute constitutional notification workflow
            const notificationResult = await this.executeConstitutionalNotification(validatedDetection, severityAssessment);
            // Step 5: Monitor constitutional timeline compliance
            const timelineCompliance = await this.monitorConstitutionalTimeline(notificationResult);
            // Step 6: Generate comprehensive audit trail
            const auditTrail = await this.createAuditEvent('BREACH_NOTIFICATION_COMPLETED', validatedDetection);
            // Step 7: Initiate remediation and prevention measures
            await this.initiateRemediationMeasures(validatedDetection, severityAssessment);
            return {
                success: true,
                data: notificationResult,
                complianceScore: timelineCompliance.complianceScore,
                regulatoryValidation: {
                    lgpd: timelineCompliance.lgpdCompliant,
                    anvisa: timelineCompliance.anvisaCompliant,
                    cfm: timelineCompliance.cfmCompliant,
                },
                auditTrail,
                timestamp: new Date(),
            };
        }
        catch (error) {
            // Critical error handling for breach notifications
            const emergencyAudit = await this.createAuditEvent('BREACH_NOTIFICATION_CRITICAL_ERROR', detection);
            // Escalate to constitutional emergency response
            await this.escalateToEmergencyResponse(detection, error);
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Critical breach notification error',
                complianceScore: 0,
                regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
                auditTrail: emergencyAudit,
                timestamp: new Date(),
            };
        }
    }
    /**
     * Assess Constitutional Severity with Healthcare Context
     */
    async assessConstitutionalSeverity(detection) {
        let severity = detection.initialSeverity;
        let riskScore = 7.0; // Start with moderate risk
        const patientImpact = [];
        const regulatoryImpact = [];
        const constitutionalViolations = [];
        // Healthcare data severity escalation
        if (detection.dataTypesAffected.includes(PatientDataClassification.HEALTH) ||
            detection.dataTypesAffected.includes(PatientDataClassification.GENETIC)) {
            if (severity === BreachSeverity.LOW) {
                severity = BreachSeverity.MEDIUM;
            }
            else if (severity === BreachSeverity.MEDIUM) {
                severity = BreachSeverity.HIGH;
            }
            patientImpact.push('Health data compromised - patient privacy violated');
            riskScore += 1;
        }
        // Child data severity escalation
        if (detection.dataTypesAffected.includes(PatientDataClassification.CHILD)) {
            if (severity === BreachSeverity.LOW ||
                severity === BreachSeverity.MEDIUM) {
                severity = BreachSeverity.HIGH;
            }
            constitutionalViolations.push('Child data protection violated (Art. 14 LGPD)');
            riskScore += 1.5;
        }
        // Constitutional violation assessment
        if (detection.constitutionalViolation) {
            severity = BreachSeverity.CRITICAL;
            constitutionalViolations.push('Direct constitutional healthcare violation detected');
            riskScore += 2;
        }
        // Patient safety risk assessment
        if (detection.patientSafetyRisk) {
            severity = BreachSeverity.CRITICAL;
            patientImpact.push('Immediate patient safety risk identified');
            riskScore += 2;
        }
        // Scale of impact assessment
        if (detection.estimatedAffectedPatients > 1000) {
            if (severity !== BreachSeverity.CRITICAL) {
                severity = BreachSeverity.HIGH;
            }
            regulatoryImpact.push('Large-scale patient data breach');
            riskScore += 1;
        }
        // System impact assessment
        if (detection.affectedSystems.length > 3) {
            patientImpact.push('Multiple systems compromised - extensive patient data exposure');
            riskScore += 0.5;
        }
        const finalScore = Math.min(10, riskScore);
        // Determine notification requirements based on severity
        const notificationRequirements = {
            anpd: severity === BreachSeverity.HIGH ||
                severity === BreachSeverity.CRITICAL,
            patients: severity === BreachSeverity.MEDIUM ||
                severity === BreachSeverity.HIGH ||
                severity === BreachSeverity.CRITICAL,
            authorities: severity === BreachSeverity.CRITICAL ||
                detection.constitutionalViolation,
            immediateAction: severity === BreachSeverity.CRITICAL || detection.patientSafetyRisk,
        };
        return {
            finalSeverity: severity,
            riskScore: finalScore,
            patientImpact,
            regulatoryImpact,
            constitutionalViolations,
            notificationRequirements,
        };
    } /**
     * Execute Constitutional Notification Workflow
     */
    async executeConstitutionalNotification(detection, severityAssessment) {
        const _startTime = new Date();
        const auditTrail = [];
        // Initialize notification result
        const result = {
            incidentId: detection.incidentId || crypto.randomUUID(),
            notificationStatus: 'IN_PROGRESS',
            breachSeverity: severityAssessment.finalSeverity,
            constitutionalCompliance: {
                timelineMet: false,
                notificationQuality: 0,
                patientRightsHonored: false,
                transparencyProvided: false,
                complianceScore: 0,
            },
            anpdNotification: {
                required: severityAssessment.notificationRequirements.anpd,
                sent: false,
            },
            patientNotifications: {
                required: severityAssessment.notificationRequirements.patients,
                totalPatients: detection.estimatedAffectedPatients,
                notified: 0,
                notificationMethods: [],
            },
            internalNotifications: {
                dpo: { notified: false },
                executive: { notified: false },
                legal: { notified: false },
                it: { notified: false },
            },
            remediation: {
                immediateActions: detection.immediateActions,
                longTermActions: [],
                preventiveMeasures: [],
                completionEstimate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            timeline: {
                detectedAt: detection.detectedAt,
                totalHours: 0,
            },
            auditTrail,
        };
        try {
            // Step 1: Immediate internal notifications (Constitutional requirement: immediate)
            await this.executeInternalNotifications(detection, result, auditTrail);
            // Step 2: ANPD notification (if required - 72 hours maximum)
            if (severityAssessment.notificationRequirements.anpd) {
                await this.notifyANPD(detection, severityAssessment, result, auditTrail);
            }
            // Step 3: Patient notifications (Constitutional transparency mandate)
            if (severityAssessment.notificationRequirements.patients) {
                await this.notifyAffectedPatients(detection, severityAssessment, result, auditTrail);
            }
            // Step 4: Authority notifications (for critical/constitutional violations)
            if (severityAssessment.notificationRequirements.authorities) {
                await this.notifyHealthcareAuthorities(detection, severityAssessment, result, auditTrail);
            }
            // Step 5: Calculate final timeline and compliance
            result.timeline.notificationsCompletedAt = new Date();
            result.timeline.totalHours =
                (result.timeline.notificationsCompletedAt.getTime() -
                    detection.detectedAt.getTime()) /
                    (1000 * 60 * 60);
            // Step 6: Assess constitutional compliance
            result.constitutionalCompliance = this.assessConstitutionalCompliance(result, severityAssessment);
            // Step 7: Update final status
            result.notificationStatus =
                result.constitutionalCompliance.complianceScore >=
                    this.constitutionalQualityStandard
                    ? 'COMPLETED'
                    : 'PARTIAL';
            return result;
        }
        catch (error) {
            result.notificationStatus = 'FAILED';
            result.constitutionalCompliance.complianceScore = 0;
            auditTrail.push({
                action: 'NOTIFICATION_FAILURE',
                timestamp: new Date(),
                performedBy: 'SYSTEM',
                details: `Notification execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                complianceImpact: [
                    'CONSTITUTIONAL_VIOLATION',
                    'PATIENT_RIGHTS_VIOLATION',
                ],
            });
            throw error;
        }
    }
    /**
     * Execute Internal Notifications (Immediate Constitutional Requirement)
     */
    async executeInternalNotifications(detection, result, auditTrail) {
        const notificationTime = new Date();
        // DPO Notification (LGPD requirement)
        if (!detection.reportingMetadata.dpoNotified) {
            await this.notifyDPO(detection);
            result.internalNotifications.dpo = {
                notified: true,
                notifiedAt: notificationTime,
            };
            auditTrail.push({
                action: 'DPO_NOTIFIED',
                timestamp: notificationTime,
                performedBy: detection.detectedBy,
                details: 'Data Protection Officer notified of breach incident',
                complianceImpact: ['LGPD_COMPLIANCE'],
            });
        }
        // Executive Team Notification (Constitutional healthcare requirement)
        if (!detection.reportingMetadata.executiveTeamNotified) {
            await this.notifyExecutiveTeam(detection);
            result.internalNotifications.executive = {
                notified: true,
                notifiedAt: notificationTime,
            };
            auditTrail.push({
                action: 'EXECUTIVE_NOTIFIED',
                timestamp: notificationTime,
                performedBy: detection.detectedBy,
                details: 'Executive team notified for constitutional healthcare compliance',
                complianceImpact: ['CONSTITUTIONAL_COMPLIANCE'],
            });
        }
        // Legal Team Notification
        if (!detection.reportingMetadata.legalTeamNotified) {
            await this.notifyLegalTeam(detection);
            result.internalNotifications.legal = {
                notified: true,
                notifiedAt: notificationTime,
            };
        }
        // IT Team Notification (for technical remediation)
        await this.notifyITTeam(detection);
        result.internalNotifications.it = {
            notified: true,
            notifiedAt: notificationTime,
        };
    }
    /**
     * Notify ANPD (Brazilian Data Protection Authority)
     */
    async notifyANPD(detection, severityAssessment, result, auditTrail) {
        try {
            const notificationData = {
                incidentId: result.incidentId,
                organizationCNPJ: process.env.COMPANY_CNPJ,
                breachDescription: detection.breachDescription,
                affectedDataTypes: detection.dataTypesAffected,
                estimatedAffectedRecords: detection.estimatedAffectedRecords,
                containmentMeasures: detection.containmentMeasures,
                riskAssessment: severityAssessment,
                remedialActions: detection.immediateActions,
                contactInformation: {
                    dpo: process.env.DPO_EMAIL,
                    legal: process.env.LEGAL_EMAIL,
                },
            };
            // Submit to ANPD portal (would integrate with actual ANPD API)
            const anpdResponse = await this.submitToANPD(notificationData);
            result.anpdNotification.sent = true;
            result.anpdNotification.sentAt = new Date();
            result.anpdNotification.protocolNumber = anpdResponse.protocol;
            auditTrail.push({
                action: 'ANPD_NOTIFIED',
                timestamp: new Date(),
                performedBy: 'SYSTEM',
                details: `ANPD notification submitted - Protocol: ${anpdResponse.protocol}`,
                complianceImpact: ['LGPD_REGULATORY_COMPLIANCE'],
            });
        }
        catch (error) {
            auditTrail.push({
                action: 'ANPD_NOTIFICATION_FAILED',
                timestamp: new Date(),
                performedBy: 'SYSTEM',
                details: `Failed to notify ANPD: ${error instanceof Error ? error.message : 'Unknown error'}`,
                complianceImpact: ['REGULATORY_NON_COMPLIANCE'],
            });
            throw error;
        }
    }
    /**
     * Notify Affected Patients (Constitutional Transparency Mandate)
     */
    async notifyAffectedPatients(detection, severityAssessment, result, auditTrail) {
        try {
            // Get list of affected patients
            const affectedPatients = await this.getAffectedPatients(detection);
            let notifiedCount = 0;
            const notificationMethods = new Set();
            // Constitutional requirement: Clear, accessible communication
            for (const patient of affectedPatients) {
                const patientNotification = await this.createPatientNotification(detection, severityAssessment, patient);
                // Send via preferred method with accessibility support
                const notificationMethod = await this.sendPatientNotification(patient, patientNotification);
                notificationMethods.add(notificationMethod);
                notifiedCount++;
                // Constitutional audit trail for each patient notification
                auditTrail.push({
                    action: 'PATIENT_NOTIFIED',
                    timestamp: new Date(),
                    performedBy: 'SYSTEM',
                    details: `Patient ${patient.id} notified via ${notificationMethod}`,
                    complianceImpact: ['PATIENT_RIGHTS', 'TRANSPARENCY_MANDATE'],
                });
            }
            result.patientNotifications.notified = notifiedCount;
            result.patientNotifications.notificationMethods =
                Array.from(notificationMethods);
            result.patientNotifications.completedAt = new Date();
        }
        catch (error) {
            auditTrail.push({
                action: 'PATIENT_NOTIFICATION_FAILED',
                timestamp: new Date(),
                performedBy: 'SYSTEM',
                details: `Failed to notify patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
                complianceImpact: ['PATIENT_RIGHTS_VIOLATION', 'TRANSPARENCY_FAILURE'],
            });
            throw error;
        }
    }
    /**
     * Assess Constitutional Compliance
     */
    assessConstitutionalCompliance(result, severityAssessment) {
        let complianceScore = 10;
        let timelineMet = true;
        let patientRightsHonored = true;
        let transparencyProvided = true;
        // Timeline compliance (72-hour constitutional requirement)
        if (result.timeline.totalHours > this.constitutionalTimelineHours) {
            timelineMet = false;
            complianceScore -= 3;
        }
        // Patient notification compliance
        if (result.patientNotifications.required &&
            result.patientNotifications.notified === 0) {
            patientRightsHonored = false;
            transparencyProvided = false;
            complianceScore -= 3;
        }
        // ANPD notification compliance (if required)
        if (result.anpdNotification.required && !result.anpdNotification.sent) {
            complianceScore -= 2;
        }
        // Internal notification compliance
        if (!(result.internalNotifications.dpo.notified &&
            result.internalNotifications.executive.notified)) {
            complianceScore -= 1;
        }
        // Constitutional violation handling
        if (severityAssessment.constitutionalViolations.length > 0) {
            complianceScore += 0.5; // Bonus for proper handling
        }
        const finalScore = Math.max(0, Math.min(10, complianceScore));
        return {
            timelineMet,
            notificationQuality: finalScore,
            patientRightsHonored,
            transparencyProvided,
            complianceScore: finalScore,
        };
    }
    // ============================================================================
    // HELPER METHODS (Implementation Stubs)
    // ============================================================================
    async validateImmediateContainment(detection) {
        const issues = [];
        let score = 10;
        if (detection.containmentMeasures.length === 0) {
            issues.push('No containment measures specified');
            score -= 5;
        }
        if (detection.immediateActions.length === 0) {
            issues.push('No immediate actions taken');
            score -= 3;
        }
        return {
            adequate: issues.length === 0,
            score: Math.max(0, score),
            issues,
        };
    }
    async monitorConstitutionalTimeline(result) {
        return {
            complianceScore: result.constitutionalCompliance.complianceScore,
            lgpdCompliant: result.constitutionalCompliance.timelineMet,
            anvisaCompliant: true,
            cfmCompliant: result.constitutionalCompliance.patientRightsHonored,
        };
    }
    async initiateRemediationMeasures(_detection, _severityAssessment) { }
    async escalateToEmergencyResponse(_detection, _error) { }
    async notifyDPO(_detection) { }
    async notifyExecutiveTeam(_detection) { }
    async notifyLegalTeam(_detection) { }
    async notifyITTeam(_detection) { }
    async submitToANPD(_data) {
        return { protocol: `ANPD-${Date.now()}` };
    }
    async getAffectedPatients(_detection) {
        return []; // Would query database for affected patients
    }
    async createPatientNotification(_detection, _assessment, patient) {
        return {
            subject: 'Importante: Notificação sobre Seus Dados de Saúde',
            content: `Prezado(a) ${patient.name}, informamos sobre um incidente que pode ter afetado seus dados...`,
            accessibility: true,
            plainLanguage: true,
        };
    }
    async sendPatientNotification(_patient, _notification) {
        return 'EMAIL'; // Would send via patient's preferred method
    }
    async notifyHealthcareAuthorities(_detection, _assessment, _result, _auditTrail) { }
    async createAuditEvent(action, data) {
        return {
            id: crypto.randomUUID(),
            eventType: 'BREACH_NOTIFICATION',
            action,
            timestamp: new Date(),
            metadata: data,
        };
    }
    /**
     * Get Breach Notification Status
     */
    async getBreachNotificationStatus(incidentId, _tenantId) {
        try {
            const auditTrail = await this.createAuditEvent('BREACH_STATUS_ACCESSED', {
                incidentId,
            });
            return {
                success: true,
                data: null, // Would be actual status from database
                complianceScore: 9.9,
                regulatoryValidation: { lgpd: true, anvisa: true, cfm: true },
                auditTrail,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const auditTrail = await this.createAuditEvent('BREACH_STATUS_ERROR', {
                incidentId,
            });
            return {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : 'Failed to retrieve breach notification status',
                complianceScore: 0,
                regulatoryValidation: { lgpd: false, anvisa: false, cfm: false },
                auditTrail,
                timestamp: new Date(),
            };
        }
    }
}
