/**
 * LGPD Data Minimization Service for Calendar Operations
 * Implements data minimization principles as required by LGPD Art. 6º, VII
 */

import type { CalendarAppointment } from '@/services/appointments.service';
import type {
  DataMinimizationLevel,
  MinimizedCalendarAppointment,
} from './calendar-consent.service';

// Patient data sensitivity levels
export enum PatientDataSensitivity {
  HIGH = 'high', // Full name, medical history, detailed health info
  MEDIUM = 'medium', // Service type, appointment duration, status
  LOW = 'low', // Time slots, general categories
  NONE = 'none', // Only appointment existence
}

// Data categories under LGPD
export enum LGPDDataCategory {
  PERSONAL_IDENTIFICATION = 'personal_identification',
  HEALTH_DATA = 'health_data',
  APPOINTMENT_DATA = 'appointment_data',
  SENSITIVE_HEALTH_DATA = 'sensitive_health_data',
}

// Data minimization configuration
export interface DataMinimizationConfig {
  level: DataMinimizationLevel;
  showPatientName: boolean;
  showServiceDetails: boolean;
  showMedicalInfo: boolean;
  allowExport: boolean;
  retentionDays: number;
  anonymizationMethod: 'none' | 'initials' | 'partial' | 'pseudonym';
}

// Minimization result with compliance info
export interface MinimizationResult {
  minimizedData: MinimizedCalendarAppointment;
  complianceScore: number;
  risksIdentified: string[];
  recommendations: string[];
  dataCategoriesShared: LGPDDataCategory[];
  legalBasis: string;
}

/**
 * LGPD Data Minimization Service
 */
export class CalendarDataMinimizationService {
  private readonly defaultConfig: DataMinimizationConfig = {
    level: DataMinimizationLevel.MINIMAL,
    showPatientName: false,
    showServiceDetails: false,
    showMedicalInfo: false,
    allowExport: false,
    retentionDays: 365,
    anonymizationMethod: 'initials',
  };

  /**
   * Get data minimization configuration based on consent and context
   */
  getMinimizationConfig(
    consentLevel: DataMinimizationLevel,
    userRole: string,
    dataSensitivity: PatientDataSensitivity,
  ): DataMinimizationConfig {
    const isHealthcareProfessional = this.isHealthcareRole(userRole);
    const isEmergencyContext = this.isEmergencyContext();

    const configs: Record<DataMinimizationLevel, DataMinimizationConfig> = {
      [DataMinimizationLevel.MINIMAL]: {
        level: DataMinimizationLevel.MINIMAL,
        showPatientName: false,
        showServiceDetails: false,
        showMedicalInfo: false,
        allowExport: false,
        retentionDays: 90,
        anonymizationMethod: 'none',
      },
      [DataMinimizationLevel.RESTRICTED]: {
        level: DataMinimizationLevel.RESTRICTED,
        showPatientName: false,
        showServiceDetails: true,
        showMedicalInfo: false,
        allowExport: false,
        retentionDays: 180,
        anonymizationMethod: 'initials',
      },
      [DataMinimizationLevel.STANDARD]: {
        level: DataMinimizationLevel.STANDARD,
        showPatientName: isHealthcareProfessional,
        showServiceDetails: true,
        showMedicalInfo: isHealthcareProfessional,
        allowExport: isHealthcareProfessional,
        retentionDays: 365,
        anonymizationMethod: 'initials',
      },
      [DataMinimizationLevel.FULL]: {
        level: DataMinimizationLevel.FULL,
        showPatientName: true,
        showServiceDetails: true,
        showMedicalInfo: true,
        allowExport: true,
        retentionDays: 2555, // 7 years for medical data
        anonymizationMethod: 'none',
      },
    };

    // Adjust for emergency context
    let config = configs[consentLevel];
    if (isEmergencyContext && dataSensitivity === PatientDataSensitivity.HIGH) {
      config = { ...config, showPatientName: true, showMedicalInfo: true };
    }

    return config;
  }

  /**
   * Apply comprehensive data minimization with compliance scoring
   */
  async minimizeAppointmentWithCompliance(
    appointment: CalendarAppointment,
    consentLevel: DataMinimizationLevel,
    userRole: string,
    context: 'view' | 'edit' | 'export' = 'view',
  ): Promise<MinimizationResult> {
    try {
      // Determine data sensitivity
      const sensitivity = this.assessDataSensitivity(appointment);

      // Get minimization configuration
      const config = this.getMinimizationConfig(
        consentLevel,
        userRole,
        sensitivity,
      );

      // Apply minimization rules
      const minimizedData = this.applyMinimizationRules(
        appointment,
        config,
        context,
      );

      // Assess compliance
      const complianceScore = this.calculateComplianceScore(
        config,
        sensitivity,
        context,
      );

      // Identify risks
      const risksIdentified = this.identifyRisks(config, sensitivity, context);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        complianceScore,
        risksIdentified,
      );

      // Determine data categories shared
      const dataCategoriesShared = this.getDataCategoriesShared(
        config,
        appointment,
      );

      // Get legal basis
      const legalBasis = this.getLegalBasis(consentLevel, context);

      return {
        minimizedData,
        complianceScore,
        risksIdentified,
        recommendations,
        dataCategoriesShared,
        legalBasis,
      };
    } catch (error) {
      console.error('Error in minimizeAppointmentWithCompliance:', error);
      // Return minimal data on error
      return {
        minimizedData: this.getMinimalFallback(appointment),
        complianceScore: 0,
        risksIdentified: ['System error in data minimization'],
        recommendations: ['Contact system administrator'],
        dataCategoriesShared: [LGPDDataCategory.APPOINTMENT_DATA],
        legalBasis: 'error_handling',
      };
    }
  }

  /**
   * Batch minimize appointments with aggregate compliance reporting
   */
  async batchMinimizeAppointments(
    appointments: CalendarAppointment[],
    consentLevel: DataMinimizationLevel,
    userRole: string,
    context: 'view' | 'edit' | 'export' = 'view',
  ): Promise<{
    minimizedAppointments: MinimizedCalendarAppointment[];
    aggregateCompliance: {
      totalScore: number;
      averageScore: number;
      criticalRisks: string[];
      allRecommendations: string[];
      dataCategoriesShared: Set<LGPDDataCategory>;
    };
  }> {
    const minimizedAppointments: MinimizedCalendarAppointment[] = [];
    const allScores: number[] = [];
    const allRisks: string[] = [];
    const allRecommendations: string[] = [];
    const dataCategoriesShared = new Set<LGPDDataCategory>();

    try {
      for (const appointment of appointments) {
        const result = await this.minimizeAppointmentWithCompliance(
          appointment,
          consentLevel,
          userRole,
          context,
        );

        minimizedAppointments.push(result.minimizedData);
        allScores.push(result.complianceScore);
        allRisks.push(...result.risksIdentified);
        allRecommendations.push(...result.recommendations);

        result.dataCategoriesShared.forEach(category => dataCategoriesShared.add(category));
      }

      const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
      const totalScore = Math.min(100, Math.round(averageScore));

      // Identify critical risks
      const criticalRisks = allRisks.filter(
        risk =>
          risk.toLowerCase().includes('critical')
          || risk.toLowerCase().includes('violation')
          || risk.toLowerCase().includes('non-compliance'),
      );

      return {
        minimizedAppointments,
        aggregateCompliance: {
          totalScore,
          averageScore,
          criticalRisks: [...new Set(criticalRisks)],
          allRecommendations: [...new Set(allRecommendations)],
          dataCategoriesShared,
        },
      };
    } catch (error) {
      console.error('Error in batch minimization:', error);
      return {
        minimizedAppointments: appointments.map(apt => this.getMinimalFallback(apt)),
        aggregateCompliance: {
          totalScore: 0,
          averageScore: 0,
          criticalRisks: ['Batch processing failed'],
          allRecommendations: ['Contact system administrator'],
          dataCategoriesShared: new Set([LGPDDataCategory.APPOINTMENT_DATA]),
        },
      };
    }
  }

  /**
   * Assess data sensitivity level of appointment
   */
  private assessDataSensitivity(
    appointment: CalendarAppointment,
  ): PatientDataSensitivity {
    let sensitivityScore = 0;

    // Check for sensitive medical information
    if (appointment.description?.toLowerCase().includes('hiv')) {
      sensitivityScore += 3;
    }
    if (appointment.description?.toLowerCase().includes('mental')) {
      sensitivityScore += 2;
    }
    if (appointment.description?.toLowerCase().includes('psychiatric')) {
      sensitivityScore += 3;
    }
    if (appointment.description?.toLowerCase().includes('addiction')) {
      sensitivityScore += 2;
    }

    // Check for sensitive procedures
    if (appointment.serviceName?.toLowerCase().includes('plastic')) {
      sensitivityScore += 2;
    }
    if (appointment.serviceName?.toLowerCase().includes('psychiatric')) {
      sensitivityScore += 3;
    }
    if (appointment.serviceName?.toLowerCase().includes('therapy')) {
      sensitivityScore += 2;
    }

    // Check appointment status
    if (appointment.status === 'emergency') sensitivityScore += 2;
    if (appointment.notes?.toLowerCase().includes('confidential')) {
      sensitivityScore += 2;
    }

    // Determine sensitivity level
    if (sensitivityScore >= 5) return PatientDataSensitivity.HIGH;
    if (sensitivityScore >= 3) return PatientDataSensitivity.MEDIUM;
    if (sensitivityScore >= 1) return PatientDataSensitivity.LOW;
    return PatientDataSensitivity.NONE;
  }

  /**
   * Apply minimization rules based on configuration
   */
  private applyMinimizationRules(
    appointment: CalendarAppointment,
    config: DataMinimizationConfig,
    context: 'view' | 'edit' | 'export',
  ): MinimizedCalendarAppointment {
    const minimized: MinimizedCalendarAppointment = {
      id: appointment.id,
      start: appointment.start,
      end: appointment.end,
      color: appointment.color,
      status: appointment.status,
      consentLevel: config.level,
      requiresConsent: config.level !== DataMinimizationLevel.FULL,
    };

    // Apply patient name anonymization
    if (config.showPatientName) {
      minimized.patientInfo = appointment.patientName;
      minimized.title = `Consulta - ${appointment.patientName}`;
    } else {
      minimized.patientInfo = this.anonymizePatientName(
        appointment.patientName,
        config.anonymizationMethod,
      );
      minimized.title = 'Consulta Reservada';
    }

    // Apply service details
    if (config.showServiceDetails) {
      minimized.description = appointment.serviceName;
    } else {
      minimized.description = 'Consulta';
    }

    // Apply medical information
    if (config.showMedicalInfo && appointment.notes) {
      minimized.description += ` - ${this.sanitizeMedicalInfo(appointment.notes)}`;
    }

    // Export-specific restrictions
    if (context === 'export' && !config.allowExport) {
      minimized.description = 'Dados não disponíveis para exportação';
      minimized.patientInfo = 'Anonimizado';
    }

    return minimized;
  }

  /**
   * Anonymize patient name based on method
   */
  private anonymizePatientName(
    fullName: string,
    method: 'none' | 'initials' | 'partial' | 'pseudonym',
  ): string {
    if (!fullName || method === 'none') return 'Paciente';

    switch (method) {
      case 'initials':
        return this.getInitials(fullName);

      case 'partial':
        const names = fullName.trim().split(' ');
        if (names.length === 1) return `${names[0].charAt(0)}.***`;
        return `${names[0].charAt(0)}. ${names[names.length - 1].charAt(0)}.***`;

      case 'pseudonym':
        return `Paciente-${this.generateHash(fullName).substring(0, 8)}`;

      default:
        return 'Paciente';
    }
  }

  /**
   * Sanitize medical information for display
   */
  private sanitizeMedicalInfo(medicalInfo: string): string {
    // Remove highly sensitive medical terms
    const sensitiveTerms = [
      'hiv',
      'aids',
      'std',
      'mental illness',
      'psychiatric',
      'addiction',
      'substance abuse',
      'cancer diagnosis',
    ];

    let sanitized = medicalInfo;
    sensitiveTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      sanitized = sanitized.replace(regex, '[informação médica sensível]');
    });

    return sanitized;
  }

  /**
   * Calculate compliance score (0-100)
   */
  private calculateComplianceScore(
    config: DataMinimizationConfig,
    sensitivity: PatientDataSensitivity,
    context: 'view' | 'edit' | 'export',
  ): number {
    let score = 100;

    // Deduct for unnecessary data exposure
    if (config.showPatientName && sensitivity === PatientDataSensitivity.LOW) {
      score -= 10;
    }
    if (config.showMedicalInfo && sensitivity === PatientDataSensitivity.MEDIUM) {
      score -= 15;
    }
    if (
      config.showMedicalInfo
      && sensitivity === PatientDataSensitivity.HIGH
      && context === 'view'
    ) {
      score -= 20;
    }

    // Deduct for inappropriate export permissions
    if (
      context === 'export'
      && config.allowExport
      && sensitivity === PatientDataSensitivity.HIGH
    ) {
      score -= 25;
    }

    // Deduct for excessive retention
    if (
      config.retentionDays > 365
      && sensitivity === PatientDataSensitivity.LOW
    ) {
      score -= 10;
    }
    if (
      config.retentionDays > 2555
      && sensitivity === PatientDataSensitivity.HIGH
    ) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Identify compliance risks
   */
  private identifyRisks(
    config: DataMinimizationConfig,
    sensitivity: PatientDataSensitivity,
    context: 'view' | 'edit' | 'export',
  ): string[] {
    const risks: string[] = [];

    if (config.showPatientName && sensitivity === PatientDataSensitivity.HIGH) {
      risks.push('Exposição de dados sensíveis de pacientes');
    }

    if (context === 'export' && config.allowExport) {
      risks.push(
        'Permissão de exportação pode violar princípios de minimização',
      );
    }

    if (
      config.showMedicalInfo
      && !this.isHealthcareRole(config.level.toString())
    ) {
      risks.push('Informações médicas acessíveis a não-profissionais de saúde');
    }

    if (
      config.retentionDays > 365
      && sensitivity === PatientDataSensitivity.LOW
    ) {
      risks.push(
        'Período de retenção excessivo para dados de baixa sensibilidade',
      );
    }

    return risks;
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(score: number, risks: string[]): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push(
        'Revisar configurações de minimização de dados imediatamente',
      );
    }

    if (risks.some(r => r.includes('sensíveis'))) {
      recommendations.push(
        'Implementar controle de acesso baseado em sensibilidade dos dados',
      );
    }

    if (risks.some(r => r.includes('exportação'))) {
      recommendations.push(
        'Restringir permissões de exportação de dados sensíveis',
      );
    }

    if (score < 50) {
      recommendations.push(
        'Consultar equipe de compliance LGPD para revisão completa',
      );
    }

    if (score >= 90) {
      recommendations.push(
        'Manter configurações atuais e monitorar regularmente',
      );
    }

    return recommendations;
  }

  /**
   * Get data categories shared based on configuration
   */
  private getDataCategoriesShared(
    config: DataMinimizationConfig,
    appointment: CalendarAppointment,
  ): LGPDDataCategory[] {
    const categories: LGPDDataCategory[] = [LGPDDataCategory.APPOINTMENT_DATA];

    if (config.showPatientName) {
      categories.push(LGPDDataCategory.PERSONAL_IDENTIFICATION);
    }

    if (config.showServiceDetails || config.showMedicalInfo) {
      categories.push(LGPDDataCategory.HEALTH_DATA);
    }

    if (
      config.showMedicalInfo
      && this.assessDataSensitivity(appointment) === PatientDataSensitivity.HIGH
    ) {
      categories.push(LGPDDataCategory.SENSITIVE_HEALTH_DATA);
    }

    return categories;
  }

  /**
   * Get legal basis for data processing
   */
  private getLegalBasis(
    consentLevel: DataMinimizationLevel,
    context: 'view' | 'edit' | 'export',
  ): string {
    if (consentLevel === DataMinimizationLevel.FULL) {
      return 'LGPD Art. 7º, I - Consentimento explícito do titular';
    } else if (context === 'view') {
      return 'LGPD Art. 7º, V - Execução de contrato';
    } else if (context === 'edit') {
      return 'LGPD Art. 7º, II - Legítimo interesse do controlador';
    } else {
      return 'LGPD Art. 7º, IX - Proteção da vida ou segurança física';
    }
  }

  /**
   * Get minimal fallback appointment data
   */
  private getMinimalFallback(
    appointment: CalendarAppointment,
  ): MinimizedCalendarAppointment {
    return {
      id: appointment.id,
      title: 'Agendamento Reservado',
      start: appointment.start,
      end: appointment.end,
      color: '#999999',
      status: 'protected',
      consentLevel: DataMinimizationLevel.MINIMAL,
      requiresConsent: true,
    };
  }

  /**
   * Helper methods
   */
  private isHealthcareRole(userRole: string): boolean {
    const healthcareRoles = [
      'doctor',
      'nurse',
      'healthcare_professional',
      'medical_staff',
    ];
    return healthcareRoles.some(role => userRole.toLowerCase().includes(role.toLowerCase()));
  }

  private isEmergencyContext(): boolean {
    // In a real implementation, this would check for emergency flags
    return false;
  }

  private getInitials(fullName: string): string {
    if (!fullName) return 'P';
    const names = fullName.trim().split(' ');
    return names
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('.');
  }

  private generateHash(str: string): string {
    // Simple hash for pseudonymization
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

export const calendarDataMinimizationService = new CalendarDataMinimizationService();
