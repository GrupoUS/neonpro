import { ANVISAComplianceService } from './anvisa-compliance';
import { LGPDService } from './lgpd-service';

export interface HealthcareValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  aiScore: number;
  transformedData?: any;
  lgpdCompliance?: any;
  anvisaCompliance?: any;
  professionalAuthorization?: boolean;
}

export interface HealthcareProfessional {
  id: string;
  licenseNumber: string;
  licenseState: string;
  specialty: string;
  isActive: boolean;
  validationDate: Date;
}

export class HealthcareValidationService {
  private lgpdService: LGPDService;
  private anvisaService: ANVISAComplianceService;

  constructor() {
    this.lgpdService = new LGPDService();
    this.anvisaService = new ANVISAComplianceService();
  }

  /**
   * Validate healthcare data with comprehensive compliance checking
   */
  async validateHealthcareData(
    operation: 'create' | 'update' | 'delete' | 'read',
    entity: string,
    data: any,
    _context?: {
      professionalId?: string;
      patientId?: string;
      organizationId?: string;
    },
  ): Promise<HealthcareValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      let aiScore = 1.0;

      // Initialize validation result
      const result: HealthcareValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        aiScore: 1.0,
      };

      // Step 1: Validate healthcare professional authorization
      if (context?.professionalId) {
        const professionalAuth = await this.validateProfessionalAuthorization(
          context.professionalId,
          operation,
          entity,
        );

        result.professionalAuthorization = professionalAuth.authorized;

        if (!professionalAuth.authorized) {
          errors.push(
            `Profissional não autorizado para ${operation} em ${entity}`,
          );
          result.isValid = false;
          aiScore -= 0.3;
        }
      } else {
        // For operations without professional context, validate minimum required fields
        warnings.push('Operação sem validação de autorização profissional');
      }

      // Step 2: LGPD Compliance Validation
      try {
        const lgpdValidation = await this.validateLGPDCompliance(
          operation,
          entity,
          data,
        );
        result.lgpdCompliance = lgpdValidation;

        if (!lgpdValidation.isValid) {
          errors.push(...lgpdValidation.errors);
          result.isValid = false;
          aiScore -= lgpdValidation.errors.length * 0.1;
        }

        if (lgpdValidation.warnings.length > 0) {
          warnings.push(...lgpdValidation.warnings);
          aiScore -= lgpdValidation.warnings.length * 0.05;
        }
      } catch {
        void _error;
        errors.push('Erro na validação LGPD');
        result.isValid = false;
        aiScore -= 0.2;
      }

      // Step 3: Entity-specific validation
      const entityValidation = await this.validateEntitySpecific(
        operation,
        entity,
        data,
      );
      if (!entityValidation.isValid) {
        errors.push(...entityValidation.errors);
        result.isValid = false;
        aiScore -= entityValidation.errors.length * 0.1;
      }

      if (entityValidation.warnings.length > 0) {
        warnings.push(...entityValidation.warnings);
        aiScore -= entityValidation.warnings.length * 0.05;
      }

      // Step 4: ANVISA Compliance (for medical entities)
      if (thisRequiresANVISACompliance(entity)) {
        try {
          const anvisaCompliance = await this.anvisaService.validateCompliance();
          result.anvisaCompliance = anvisaCompliance;

          if (anvisaCompliance.score < 70) {
            errors.push('Conformidade ANVISA insuficiente');
            result.isValid = false;
            aiScore -= 0.25;
          } else if (anvisaCompliance.score < 90) {
            warnings.push('Conformidade ANVISA requer atenção');
            aiScore -= 0.1;
          }
        } catch {
          void _error;
          warnings.push('Não foi possível validar conformidade ANVISA');
          aiScore -= 0.1;
        }
      }

      // Step 5: Data format and type validation
      const formatValidation = this.validateDataFormat(entity, data);
      if (!formatValidation.isValid) {
        errors.push(...formatValidation.errors);
        result.isValid = false;
        aiScore -= formatValidation.errors.length * 0.1;
      }

      // Step 6: Business rules validation
      const businessValidation = this.validateBusinessRules(
        operation,
        entity,
        data,
      );
      if (!businessValidation.isValid) {
        errors.push(...businessValidation.errors);
        result.isValid = false;
        aiScore -= businessValidation.errors.length * 0.15;
      }

      // Ensure AI score is within bounds
      result.aiScore = Math.max(0, Math.min(1, aiScore));
      result.errors = errors;
      result.warnings = warnings;

      // Apply final validation threshold
      result.isValid = result.isValid && result.aiScore >= 0.7;

      return result;
    } catch {
      void _error;
      console.error('Healthcare validation error:', error);
      return {
        isValid: false,
        errors: ['Erro crítico na validação de dados de saúde'],
        warnings: [],
        aiScore: 0,
      };
    }
  }

  /**
   * Validate healthcare professional authorization
   */
  private async validateProfessionalAuthorization(
    professionalId: string,
    operation: string,
    entity: string,
  ): Promise<{ authorized: boolean; licenseInfo?: HealthcareProfessional }> {
    try {
      // In a real implementation, this would query the database for professional license
      // For now, implement mock validation that simulates real license checking
      const licenseInfo: HealthcareProfessional = {
        id: professionalId,
        licenseNumber: 'CRM/SP 123456', // Mock license
        licenseState: 'SP',
        specialty: 'CLINICA_GERAL',
        isActive: true,
        validationDate: new Date(),
      };

      // Validate license format and state
      const isValidLicense = this.validateMedicalLicense(
        licenseInfo.licenseNumber,
      );
      const isActive = licenseInfo.isActive;
      const isValidForEntity = this.validateProfessionalScope(
        licenseInfo.specialty,
        entity,
      );

      const authorized = isValidLicense && isActive && isValidForEntity;

      return {
        authorized,
        licenseInfo: authorized ? licenseInfo : undefined,
      };
    } catch {
      void _error;
      console.error('Professional authorization error:', error);
      return { authorized: false };
    }
  }

  /**
   * Validate LGPD compliance for data operations
   */
  private async validateLGPDCompliance(
    operation: string,
    entity: string,
    data: any,
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for sensitive personal data
      if (thisContainsSensitiveData(data)) {
        // Verify data minimization principle
        if (thisContainsExcessiveData(data, entity)) {
          errors.push('Violação do princípio da minimização de dados LGPD');
        }

        // Check for explicit consent when required
        if (operation === 'create' && !data.consentimentoLGPDPaciente) {
          warnings.push(
            'Consentimento LGPD do paciente não explicitamente documentado',
          );
        }
      }

      // Validate data retention policies
      if (operation === 'delete') {
        warnings.push(
          'Operação de exclusão deve respeitar política de retenção LGPD',
        );
      }

      // Check for data encryption requirements
      if (thisContainsHighlySensitiveData(data)) {
        warnings.push(
          'Dados altamente sensíveis devem ser criptografados (AES-256)',
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch {
      void _error;
      return {
        isValid: false,
        errors: ['Erro na validação LGPD'],
        warnings: [],
      };
    }
  }

  /**
   * Entity-specific validation logic
   */
  private async validateEntitySpecific(
    operation: string,
    entity: string,
    data: any,
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (entity) {
      case 'patients':
        return this.validatePatientData(operation, data);

      case 'appointments':
        return this.validateAppointmentData(operation, data);

      case 'medical_records':
        return this.validateMedicalRecordData(operation, data);

      case 'prescriptions':
        return this.validatePrescriptionData(operation, data);

      default:
        // Generic validation for unknown entities
        if (operation === 'create' && !data.id) {
          errors.push('ID é obrigatório para criação');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Patient data validation
   */
  private validatePatientData(
    operation: string,
    data: any,
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields for patient creation
    if (operation === 'create') {
      if (!data.fullName || data.fullName.trim().length < 3) {
        errors.push(
          'Nome completo do paciente é obrigatório (mínimo 3 caracteres)',
        );
      }

      if (!data.cpf || !this.validateCPF(data.cpf)) {
        errors.push('CPF inválido ou ausente');
      }

      if (!data.dateOfBirth) {
        errors.push('Data de nascimento é obrigatória');
      } else {
        const age = this.calculateAge(new Date(data.dateOfBirth));
        if (age < 0 || age > 150) {
          errors.push('Data de nascimento inválida');
        }
      }
    }

    // Contact information validation
    if (data.email && !this.validateEmail(data.email)) {
      warnings.push('Email inválido');
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      warnings.push('Formato de telefone inválido');
    }

    // Address validation for Brazilian addresses
    if (data.address) {
      if (!data.address.cep || !this.validateCEP(data.address.cep)) {
        warnings.push('CEP inválido');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Appointment data validation
   */
  private validateAppointmentData(
    operation: string,
    data: any,
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (operation === 'create') {
      if (!data.patientId) {
        errors.push('ID do paciente é obrigatório');
      }

      if (!data.professionalId) {
        errors.push('ID do profissional é obrigatório');
      }

      if (!data.startTime) {
        errors.push('Horário de início é obrigatório');
      } else {
        const startTime = new Date(data.startTime);
        const now = new Date();

        if (startTime < now) {
          errors.push('Horário da consulta não pode estar no passado');
        }

        if (startTime > new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
          warnings.push('Agendamento com mais de 90 dias de antecedência');
        }
      }

      if (!data.appointmentType) {
        errors.push('Tipo de consulta é obrigatório');
      }
    }

    // Duration validation
    if (data.duration && (data.duration < 5 || data.duration > 180)) {
      warnings.push('Duração da consulta deve ser entre 5 e 180 minutos');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Medical record data validation
   */
  private validateMedicalRecordData(
    operation: string,
    data: any,
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (operation === 'create') {
      if (!data.patientId) {
        errors.push('ID do paciente é obrigatório');
      }

      if (!data.professionalId) {
        errors.push('ID do profissional é obrigatório');
      }

      if (!data.recordType) {
        errors.push('Tipo de registro é obrigatório');
      }

      if (!data.content || data.content.trim().length < 10) {
        errors.push('Conteúdo do registro deve ter pelo menos 10 caracteres');
      }
    }

    // Content validation for sensitive information
    if (data.content && thisContainsSensitiveKeywords(data.content)) {
      warnings.push(
        'Registro contém termos sensíveis que requerem atenção especial',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Prescription data validation
   */
  private validatePrescriptionData(
    operation: string,
    data: any,
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (operation === 'create') {
      if (!data.patientId) {
        errors.push('ID do paciente é obrigatório');
      }

      if (!data.professionalId) {
        errors.push('ID do profissional é obrigatório');
      }

      if (
        !data.medications
        || !Array.isArray(data.medications)
        || data.medications.length === 0
      ) {
        errors.push('Prescrição deve conter pelo menos um medicamento');
      }

      // Validate each medication
      data.medications?.forEach((med: any, index: number) => {
        if (!med.name || med.name.trim().length < 3) {
          errors.push(`Medicamento ${index + 1}: nome é obrigatório`);
        }

        if (!med.dosage || med.dosage.trim().length < 1) {
          errors.push(`Medicamento ${index + 1}: dosagem é obrigatória`);
        }

        if (!med.frequency) {
          errors.push(`Medicamento ${index + 1}: frequência é obrigatória`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Data format validation
   */
  private validateDataFormat(
    entity: string,
    data: any,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic type checking
    if (data.id && typeof data.id !== 'string') {
      errors.push('ID deve ser uma string');
    }

    if (
      data.createdAt
      && !(data.createdAt instanceof Date || typeof data.createdAt === 'string')
    ) {
      errors.push('createdAt deve ser uma data ou string de data');
    }

    if (
      data.updatedAt
      && !(data.updatedAt instanceof Date || typeof data.updatedAt === 'string')
    ) {
      errors.push('updatedAt deve ser uma data ou string de data');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Business rules validation
   */
  private validateBusinessRules(
    operation: string,
    entity: string,
    data: any,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Rule: Cannot create records for inactive patients
    if (entity === 'appointments' && operation === 'create') {
      // In real implementation, check patient status
      // errors.push('Não é possível agendar para paciente inativo');
    }

    // Rule: Professional cannot schedule appointments outside working hours
    if (entity === 'appointments' && data.startTime) {
      const startTime = new Date(data.startTime);
      const hours = startTime.getHours();

      if (hours < 7 || hours > 22) {
        warnings.push('Agendamento fora do horário comercial padrão (7h-22h)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Helper methods
  private validateMedicalLicense(licenseNumber: string): boolean {
    // Basic Brazilian medical license validation
    const patterns = [
      /^CRM\/[A-Z]{2}\s*\d{6}$/, // CRM/SP 123456
      /^CRO\/[A-Z]{2}\s*\d{6}$/, // CRO/SP 123456
    ];

    return patterns.some(pattern => pattern.test(licenseNumber));
  }

  private validateProfessionalScope(
    specialty: string,
    entity: string,
  ): boolean {
    // Validate if professional specialty allows operations on entity
    const scopeMap: Record<string, string[]> = {
      CLINICA_GERAL: ['patients', 'appointments', 'medical_records'],
      PEDIATRIA: [
        'patients',
        'appointments',
        'medical_records',
        'prescriptions',
      ],
      CARDIOLOGIA: [
        'patients',
        'appointments',
        'medical_records',
        'prescriptions',
      ],
    };

    return scopeMap[specialty]?.includes(entity) ?? false;
  }

  private thisRequiresANVISACompliance(entity: string): boolean {
    const medicalEntities = [
      'medical_devices',
      'prescriptions',
      'medical_records',
    ];
    return medicalEntities.includes(entity);
  }

  private thisContainsSensitiveData(data: any): boolean {
    const sensitiveFields = ['cpf', 'rg', 'email', 'phone', 'address'];
    return sensitiveFields.some(field => data[field]);
  }

  private thisContainsExcessiveData(data: any, _entity: string): boolean {
    // Check if data contains fields not necessary for the entity
    // This is a simplified check
    return Object.keys(data).length > 20; // Arbitrary threshold
  }

  private thisContainsHighlySensitiveData(data: any): boolean {
    const highlySensitive = [
      'diagnosticos',
      'historicoMedico',
      'resultadosExames',
    ];
    return highlySensitive.some(field => data[field]);
  }

  private validateCPF(cpf: string): boolean {
    // Basic CPF validation
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && /^\d{11}$/.test(cleanCPF);
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  private validateCEP(cep: string): boolean {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0
      || (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private thisContainsSensitiveKeywords(content: string): boolean {
    const sensitiveKeywords = ['hiv', 'aids', 'câncer', 'doença terminal'];
    return sensitiveKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }
}
