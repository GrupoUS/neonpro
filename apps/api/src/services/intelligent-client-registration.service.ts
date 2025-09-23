/**
 * Intelligent Client Registration Service with OCR Processing
 *
 * AI-powered client registration service that handles document OCR,
 * automatic form completion, data validation, and intelligent suggestions.
 */

import { createClient } from '@supabase/supabase-js';
import {
  AguiClientRegistrationMessage,
  /* AguiClientValidationMessage, */
  /* AguiDocumentOCRMessage, */
  /* AguiErrorCode, */
  AISuggestion,
  OCRResult,
  ValidationResult,
} from './agui-protocol/types';
import { LGPDCompliantDataHandler } from './lgpd-compliant-data-handler';

export interface RegistrationConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  ocrServiceUrl?: string;
  aiServiceUrl?: string;
  encryptionKey?: string;
  enableAutoValidation: boolean;
  enableOCRProcessing: boolean;
  enableAISuggestions: boolean;
}

export interface DocumentProcessingResult {
  success: boolean;
  documentId: string;
  ocrResult?: OCRResult;
  extractedData?: Record<string, any>;
  validationResults?: ValidationResult[];
  suggestions?: AISuggestion[];
  processingTime: number;
  error?: string;
}

export interface RegistrationValidation {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationResult[];
  warnings: ValidationResult[];
  suggestions: AISuggestion[];
  completeness: {
    personal: number; // 0-100
    contact: number; // 0-100
    medical: number; // 0-100
    documents: number; // 0-100
    overall: number; // 0-100
  };
}

export interface RegistrationFlow {
  id: string;
  clientId?: string;
  currentStep:
    | 'personal'
    | 'contact'
    | 'medical'
    | 'documents'
    | 'consent'
    | 'review'
    | 'completed';
  stepProgress: Record<string, number>; // 0-100 for each step
  data: Partial<AguiClientRegistrationMessage['clientData']>;
  documents: Record<string, DocumentProcessingResult>;
  validations: RegistrationValidation;
  startTime: string;
  lastActivity: string;
  estimatedCompletionTime?: string;
}

export class IntelligentClientRegistrationService {
  private supabase: any;
  private lgpdHandler: LGPDCompliantDataHandler;
  private config: RegistrationConfig;
  private activeFlows: Map<string, RegistrationFlow> = new Map();

  constructor(config: RegistrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    this.lgpdHandler = new LGPDCompliantDataHandler({
      supabaseUrl: config.supabaseUrl,
      supabaseServiceKey: config.supabaseServiceKey,
      encryptionKey: config.encryptionKey,
      dataRetentionPeriod: 2555, // 7 years default
      auditLogEnabled: true,
      piiDetectionEnabled: true,
    });
  }

  // Start new registration flow
  async startRegistrationFlow(
    userId: string,
    initialData?: Partial<AguiClientRegistrationMessage['clientData']>,
  ): Promise<{ success: boolean; flowId?: string; error?: string }> {
    try {
      const flowId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const flow: RegistrationFlow = {
        id: flowId,
        currentStep: 'personal',
        stepProgress: {
          personal: 0,
          contact: 0,
          medical: 0,
          documents: 0,
          consent: 0,
          review: 0,
        },
        data: initialData || {},
        documents: {},
        validations: await this.validateRegistrationData(initialData || {}),
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };

      this.activeFlows.set(flowId, flow);

      // Auto-estimate completion time based on data completeness
      this.updateEstimatedCompletionTime(flowId);

      return { success: true, flowId };
    } catch {
      console.error('Error starting registration flow:', error);
      return { success: false, error: error.message };
    }
  }

  // Process registration step
  async processRegistrationStep(
    flowId: string,
    step: RegistrationFlow['currentStep'],
    data: any,
    documents?: Record<string, File>,
  ): Promise<{ success: boolean; flow?: RegistrationFlow; errors: string[] }> {
    const errors: string[] = [];

    try {
      const flow = this.activeFlows.get(flowId);
      if (!flow) {
        errors.push('Fluxo de registro não encontrado');
        return { success: false, errors };
      }

      // Update flow data
      flow.data = { ...flow.data, ...data };
      flow.currentStep = step;
      flow.lastActivity = new Date().toISOString();

      // Process documents if provided
      if (documents && this.config.enableOCRProcessing) {
        for (const [docType, file] of Object.entries(documents)) {
          const result = await this.processDocument(file, docType);
          flow.documents[docType] = result;

          if (result.success && result.extractedData) {
            // Auto-fill form with extracted data
            await this.autoFillFromOCR(flow, result.extractedData);
          }
        }
      }

      // Validate current step
      const validation = await this.validateRegistrationStep(step, flow.data);
      flow.validations = validation;

      // Update step progress
      flow.stepProgress[step] = this.calculateStepProgress(step, flow.data);

      // Generate AI suggestions if enabled
      if (this.config.enableAISuggestions) {
        const suggestions = await this.generateAISuggestions(step, flow.data);
        flow.validations.suggestions = [
          ...flow.validations.suggestions,
          ...suggestions,
        ];
      }

      // Auto-advance if step is complete and valid
      if (validation.isValid && flow.stepProgress[step] === 100) {
        flow.currentStep = this.getNextStep(step);
      }

      // Update estimated completion time
      this.updateEstimatedCompletionTime(flowId);

      return { success: true, flow, errors };
    } catch {
      console.error('Error processing registration step:', error);
      errors.push(`Erro no processamento: ${error.message}`);
      return { success: false, errors };
    }
  }

  // Document OCR Processing
  async processDocument(
    _file: File,
    documentType: string,
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${documentType}_${file.name}`;
      const { data: _uploadData, error: uploadError } = await this.supabase.storage
        .from('client-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('client-documents')
        .getPublicUrl(fileName);

      // Process OCR
      let ocrResult: OCRResult | undefined;

      if (this.config.enableOCRProcessing && this.config.ocrServiceUrl) {
        ocrResult = await this.callOCRService(
          urlData.publicUrl,
          documentType,
          file,
        );
      } else {
        // Mock OCR result for demo
        ocrResult = await this.generateMockOCRResult(documentType, file);
      }

      // Extract and validate data
      const extractedData = this.extractDataFromOCR(ocrResult, documentType);
      const validationResults = await this.validateExtractedData(
        extractedData,
        documentType,
      );

      // Generate AI suggestions
      const suggestions = await this.generateDocumentSuggestions(
        extractedData,
        documentType,
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        documentId: fileName,
        ocrResult,
        extractedData,
        validationResults,
        suggestions,
        processingTime,
      };
    } catch {
      console.error('Error processing document:', error);
      return {
        success: false,
        documentId: '',
        processingTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private async callOCRService(
    documentUrl: string,
    documentType: string,
    _file: File,
  ): Promise<OCRResult> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      const response = await fetch(`${this.config.ocrServiceUrl}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentUrl,
          documentType,
          fileData: base64,
          fileName: file.name,
          options: {
            extractFields: this.getExpectedFieldsForDocumentType(documentType),
            language: 'por',
            format: 'structured',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR service error: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      console.error('OCR service call failed:', error);
      throw error;
    }
  }

  private async generateMockOCRResult(
    documentType: string,
    _file: File,
  ): Promise<OCRResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockResults: Record<string, OCRResult> = {
      idCard: {
        documentId: 'mock-doc-1',
        extractedFields: {
          fullName: 'João Silva Santos',
          cpf: '123.456.789-00',
          dateOfBirth: '1990-05-15',
          rg: '12.345.678-9',
          issuingState: 'SP',
          issueDate: '2015-03-20',
          motherName: 'Maria Silva Santos',
          fatherName: 'José Silva Santos',
        },
        confidence: 0.92,
        processingTime: 1500,
        errors: [],
      },
      medicalRecord: {
        documentId: 'mock-doc-2',
        extractedFields: {
          patientName: 'João Silva Santos',
          bloodType: 'O+',
          allergies: ['Penicilina', 'Amoxicilina'],
          medications: ['Losartana 50mg', 'Atorvastatina 20mg'],
          conditions: ['Hipertensão', 'Dislipidemia'],
          lastVisit: '2024-01-10',
          nextAppointment: '2024-02-15',
        },
        confidence: 0.88,
        processingTime: 1800,
        errors: [],
      },
      consentForm: {
        documentId: 'mock-doc-3',
        extractedFields: {
          patientName: 'João Silva Santos',
          treatmentType: 'Tratamento Dermatológico',
          consentDate: '2024-01-13',
          physicianName: 'Dra. Ana Oliveira',
          procedures: ['Peeling químico', 'Preenchimento facial'],
          risksAcknowledged: true,
          benefitsExplained: true,
        },
        confidence: 0.95,
        processingTime: 1200,
        errors: [],
      },
      insuranceCard: {
        documentId: 'mock-doc-4',
        extractedFields: {
          fullName: 'João Silva Santos',
          planName: 'Plano Saúde Premium',
          cardNumber: '**** **** **** 1234',
          validity: '12/2025',
          coverageLevel: 'Completo',
          network: 'Rede Nacional',
        },
        confidence: 0.9,
        processingTime: 1300,
        errors: [],
      },
    };

    return (
      mockResults[documentType] || {
        documentId: 'mock-doc-default',
        extractedFields: {},
        confidence: 0.75,
        processingTime: 1000,
        errors: ['Document type not recognized'],
      }
    );
  }

  private extractDataFromOCR(
    ocrResult: OCRResult,
    documentType: string,
  ): Record<string, any> {
    const data: Record<string, any> = {};

    switch (documentType) {
      case 'idCard':
        if (ocrResult.extractedFields.fullName) {
          data.personalInfo = { fullName: ocrResult.extractedFields.fullName };
        }
        if (ocrResult.extractedFields.cpf) {
          data.personalInfo = {
            ...data.personalInfo,
            cpf: ocrResult.extractedFields.cpf,
          };
        }
        if (ocrResult.extractedFields.dateOfBirth) {
          data.personalInfo = {
            ...data.personalInfo,
            dateOfBirth: ocrResult.extractedFields.dateOfBirth,
          };
        }
        break;

      case 'medicalRecord':
        if (ocrResult.extractedFields.allergies) {
          data.medicalHistory = {
            allergies: ocrResult.extractedFields.allergies,
          };
        }
        if (ocrResult.extractedFields.medications) {
          data.medicalHistory = {
            ...data.medicalHistory,
            medications: ocrResult.extractedFields.medications,
          };
        }
        if (ocrResult.extractedFields.conditions) {
          data.medicalHistory = {
            ...data.medicalHistory,
            conditions: ocrResult.extractedFields.conditions,
          };
        }
        break;

      case 'consentForm':
        if (ocrResult.extractedFields.consentDate) {
          data.consent = {
            consentDate: ocrResult.extractedFields.consentDate,
            treatmentConsent: true,
          };
        }
        break;
    }

    return data;
  }

  private async validateExtractedData(
    data: Record<string, any>,
    documentType: string,
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    switch (documentType) {
      case 'idCard':
        if (
          data.personalInfo?.cpf
          && !this.validateCPF(data.personalInfo.cpf)
        ) {
          results.push({
            field: 'cpf',
            isValid: false,
            message: 'CPF inválido',
            severity: 'error',
            suggestedValue: this.formatCPF(data.personalInfo.cpf),
          });
        }

        if (
          data.personalInfo?.dateOfBirth
          && !this.validateDate(data.personalInfo.dateOfBirth)
        ) {
          results.push({
            field: 'dateOfBirth',
            isValid: false,
            message: 'Data de nascimento inválida',
            severity: 'error',
          });
        }
        break;

      case 'medicalRecord':
        if (
          data.medicalHistory?.allergies
          && Array.isArray(data.medicalHistory.allergies)
        ) {
          data.medicalHistory.allergies.forEach(
            (allergy: string, index: number) => {
              if (allergy.length < 2) {
                results.push({
                  field: `medicalHistory.allergies[${index}]`,
                  isValid: false,
                  message: 'Alergia muito curta ou inválida',
                  severity: 'warning',
                });
              }
            },
          );
        }
        break;
    }

    return results;
  }

  private async generateDocumentSuggestions(
    data: Record<string, any>,
    documentType: string,
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    switch (documentType) {
      case 'idCard':
        if (data.personalInfo?.dateOfBirth) {
          const age = this.calculateAge(data.personalInfo.dateOfBirth);
          if (age < 18) {
            suggestions.push({
              id: 'sug-1',
              type: 'data_correction',
              title: 'Verificar responsável legal',
              description: 'Paciente menor de idade, necessário incluir responsável legal',
              confidence: 0.95,
              priority: 'high',
              action: {
                field: 'emergencyContact',
                value: {
                  name: 'Responsável Legal',
                  relationship: 'Responsável Legal',
                },
                reason: 'Menor de idade requer responsável legal',
              },
            });
          }
        }
        break;

      case 'medicalRecord':
        if (
          data.medicalHistory?.allergies
          && data.medicalHistory.allergies.length > 0
        ) {
          suggestions.push({
            id: 'sug-2',
            type: 'process_optimization',
            title: 'Alerta de alergia importante',
            description: 'Paciente possui alergias que requerem atenção especial',
            confidence: 0.9,
            priority: 'high',
            estimatedImpact: 'Segurança do paciente aumentada',
          });
        }
        break;
    }

    return suggestions;
  }

  private async autoFillFromOCR(
    flow: RegistrationFlow,
    extractedData: Record<string, any>,
  ): Promise<void> {
    // Merge extracted data with existing data
    flow.data = this.mergeData(flow.data, extractedData);

    // Update step progress based on new data
    flow.stepProgress.personal = this.calculateStepProgress(
      'personal',
      flow.data,
    );
    flow.stepProgress.medical = this.calculateStepProgress(
      'medical',
      flow.data,
    );

    // Re-validate
    flow.validations = await this.validateRegistrationData(flow.data);
  }

  // Validation Methods
  private async validateRegistrationData(
    data: Partial<AguiClientRegistrationMessage['clientData']>,
  ): Promise<RegistrationValidation> {
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const suggestions: AISuggestion[] = [];

    // Personal info validation
    if (!data.personalInfo?.fullName) {
      errors.push({
        field: 'personalInfo.fullName',
        isValid: false,
        message: 'Nome completo é obrigatório',
        severity: 'error',
      });
    }

    if (data.personalInfo?.cpf && !this.validateCPF(data.personalInfo.cpf)) {
      errors.push({
        field: 'personalInfo.cpf',
        isValid: false,
        message: 'CPF inválido',
        severity: 'error',
        suggestedValue: this.formatCPF(data.personalInfo.cpf),
      });
    }

    if (
      data.personalInfo?.email
      && !this.validateEmail(data.personalInfo.email)
    ) {
      warnings.push({
        field: 'personalInfo.email',
        isValid: false,
        message: 'Email inválido',
        severity: 'warning',
      });
    }

    // Generate AI suggestions
    if (this.config.enableAISuggestions) {
      const aiSuggestions = await this.generateAISuggestions('personal', data);
      suggestions.push(...aiSuggestions);
    }

    // Calculate completeness
    const completeness = this.calculateCompleteness(data);

    // Calculate overall score
    const errorWeight = errors.length * 20;
    const warningWeight = warnings.length * 5;
    const baseScore = completeness.overall;
    const score = Math.max(0, baseScore - errorWeight - warningWeight);

    return {
      isValid: errors.length === 0,
      score,
      errors,
      warnings,
      suggestions,
      completeness,
    };
  }

  private async validateRegistrationStep(
    step: RegistrationFlow['currentStep'],
    data: Partial<AguiClientRegistrationMessage['clientData']>,
  ): Promise<RegistrationValidation> {
    // Focus validation on current step
    const stepData = this.getStepData(step, data);
    return await this.validateRegistrationData(stepData);
  }

  private getStepData(step: string, fullData: any): any {
    switch (step) {
      case 'personal':
        return { personalInfo: fullData.personalInfo };
      case 'contact':
        return {
          personalInfo: fullData.personalInfo,
          address: fullData.address,
        };
      case 'medical':
        return {
          medicalHistory: fullData.medicalHistory,
          emergencyContact: fullData.emergencyContact,
        };
      case 'documents':
        return { documents: fullData.documents };
      case 'consent':
        return { consent: fullData.consent };
      default:
        return fullData;
    }
  }

  // AI Suggestions
  private async generateAISuggestions(
    step: string,
    data: any,
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    try {
      // This would call an AI service in production
      // For now, we'll generate rule-based suggestions

      if (step === 'personal' && data.personalInfo?.dateOfBirth) {
        const age = this.calculateAge(data.personalInfo.dateOfBirth);

        if (age > 65) {
          suggestions.push({
            id: 'sug-age-1',
            type: 'personalization',
            title: 'Atendimento especial para idosos',
            description: 'Paciente acima de 65 anos pode necessitar de cuidados especiais',
            confidence: 0.85,
            priority: 'medium',
            estimatedImpact: 'Melhoria na experiência do paciente',
          });
        }

        if (age < 18) {
          suggestions.push({
            id: 'sug-age-2',
            type: 'process_optimization',
            title: 'Verificar documentos do responsável',
            description: 'Menor de idade requer documentação do responsável legal',
            confidence: 0.95,
            priority: 'high',
            estimatedImpact: 'Conformidade legal e segurança',
          });
        }
      }

      if (
        step === 'contact'
        && data.personalInfo?.email
        && data.personalInfo?.phone
      ) {
        suggestions.push({
          id: 'sug-contact-1',
          type: 'process_optimization',
          title: 'Preferência de contato',
          description: 'Ambos email e telefone fornecidos - oferecer múltiplos canais',
          confidence: 0.75,
          priority: 'low',
          estimatedImpact: 'Melhoria na taxa de resposta',
        });
      }
    } catch {
      console.error('Error generating AI suggestions:', error);
    }

    return suggestions;
  }

  // Utility Methods
  private calculateStepProgress(step: string, data: any): number {
    const requiredFields = this.getRequiredFieldsForStep(step);
    const completedFields = requiredFields.filter(field => {
      const value = this.getNestedValue(data, field);
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }

  private getRequiredFieldsForStep(step: string): string[] {
    const fieldMap: Record<string, string[]> = {
      personal: ['personalInfo.fullName', 'personalInfo.dateOfBirth'],
      contact: [
        'address.street',
        'address.number',
        'address.city',
        'address.state',
      ],
      medical: [],
      documents: [],
      consent: ['consent.treatmentConsent', 'consent.dataSharingConsent'],
      review: [],
    };

    return fieldMap[step] || [];
  }

  private calculateCompleteness(
    data: any,
  ): RegistrationValidation['completeness'] {
    const personalFields = [
      'personalInfo.fullName',
      'personalInfo.dateOfBirth',
    ];
    const contactFields = [
      'address.street',
      'address.number',
      'address.city',
      'address.state',
    ];
    const medicalFields = [
      'medicalHistory.allergies',
      'medicalHistory.medications',
    ];

    const calculatePercentage = (fields: string[]) => {
      const completed = fields.filter(field => {
        const value = this.getNestedValue(data, field);
        return value !== undefined && value !== null && value !== '';
      });
      return Math.round((completed.length / fields.length) * 100);
    };

    return {
      personal: calculatePercentage(personalFields),
      contact: calculatePercentage(contactFields),
      medical: calculatePercentage(medicalFields),
      documents: data.documents ? 100 : 0,
      overall: Math.round(
        calculatePercentage(personalFields) * 0.3
          + calculatePercentage(contactFields) * 0.3
          + calculatePercentage(medicalFields) * 0.2
          + (data.documents ? 100 : 0) * 0.2,
      ),
    };
  }

  private getNextStep(
    currentStep: RegistrationFlow['currentStep'],
  ): RegistrationFlow['currentStep'] {
    const stepOrder: RegistrationFlow['currentStep'][] = [
      'personal',
      'contact',
      'medical',
      'documents',
      'consent',
      'review',
      'completed',
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[currentIndex + 1] || currentStep;
  }

  private updateEstimatedCompletionTime(flowId: string): void {
    const flow = this.activeFlows.get(flowId);
    if (!flow) return;

    const currentProgress = Object.values(flow.stepProgress).reduce(
      (sum, progress) => sum + progress,
      0,
    );
    const totalProgress = Object.keys(flow.stepProgress).length * 100;
    const completionPercentage = currentProgress / totalProgress;

    const timeSpent = Date.now() - new Date(flow.startTime).getTime();
    const estimatedTotalTime = timeSpent / completionPercentage;
    const remainingTime = estimatedTotalTime - timeSpent;

    if (completionPercentage > 0 && remainingTime > 0) {
      flow.estimatedCompletionTime = new Date(
        Date.now() + remainingTime,
      ).toISOString();
    }
  }

  // Validation utility methods
  private validateCPF(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;

    // Basic CPF validation algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(clean[10])) return false;

    return true;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date < new Date();
  }

  private formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${
        clean.substring(9, 11)
      }`;
    }
    return cpf;
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0
      || (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private mergeData(target: any, source: any): any {
    const result = { ...target };

    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && source[key] !== null) {
        result[key] = this.mergeData(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });

    return result;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private getExpectedFieldsForDocumentType(documentType: string): string[] {
    const fieldMap: Record<string, string[]> = {
      idCard: ['fullName', 'cpf', 'dateOfBirth', 'rg'],
      medicalRecord: ['patientName', 'bloodType', 'allergies', 'medications'],
      consentForm: [
        'patientName',
        'treatmentType',
        'consentDate',
        'physicianName',
      ],
      insuranceCard: ['fullName', 'planName', 'cardNumber', 'validity'],
    };

    return fieldMap[documentType] || [];
  }

  // Public Methods
  getRegistrationFlow(flowId: string): RegistrationFlow | undefined {
    return this.activeFlows.get(flowId);
  }

  getAllActiveFlows(): RegistrationFlow[] {
    return Array.from(this.activeFlows.values());
  }

  async completeRegistration(
    flowId: string,
  ): Promise<{ success: boolean; clientId?: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      const flow = this.activeFlows.get(flowId);
      if (!flow) {
        errors.push('Fluxo de registro não encontrado');
        return { success: false, errors };
      }

      // Final validation
      if (!flow.validations.isValid) {
        errors.push('Dados incompletos ou inválidos');
        return { success: false, errors };
      }

      // Process with LGPD handler
      const registrationMessage: AguiClientRegistrationMessage = {
        clientData: flow.data as any,
        documents: Object.values(flow.documents).map(d => ({
          id: d.documentId,
          type: 'id_card' as any,
          fileName: d.documentId,
          fileUrl: `https://storage.url/${d.documentId}`,
          uploadedAt: new Date().toISOString(),
        })),
        consent: flow.data.consent,
      };

      const result = await this.lgpdHandler.processClientRegistrationWithCompliance(
        registrationMessage,
        {
          userId: 'system', // Would be actual user ID
          ipAddress: '127.0.0.1',
          userAgent: 'IntelligentRegistrationService',
        },
      );

      if (result.success) {
        // Update flow status
        flow.currentStep = 'completed';
        flow.clientId = result.clientId;
        flow.lastActivity = new Date().toISOString();

        // Remove from active flows (or move to completed flows)
        this.activeFlows.delete(flowId);

        return { success: true, clientId: result.clientId, errors: [] };
      } else {
        errors.push(...result.errors);
        return { success: false, errors };
      }
    } catch {
      console.error('Error completing registration:', error);
      errors.push(`Erro na conclusão do registro: ${error.message}`);
      return { success: false, errors };
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const checks = await Promise.allSettled([
        this.checkDatabaseConnection(),
        this.checkOCRService(),
        this.checkLgpdService(),
      ]);

      const passedChecks = checks.filter(
        check => check.status === 'fulfilled' && check.value,
      ).length;
      const totalChecks = checks.length;

      return {
        status: passedChecks === totalChecks
          ? 'healthy'
          : passedChecks > 0
          ? 'degraded'
          : 'unhealthy',
        details: {
          totalChecks,
          passedChecks,
          failedChecks: totalChecks - passedChecks,
          activeFlows: this.activeFlows.size,
          ocrEnabled: this.config.enableOCRProcessing,
          aiSuggestionsEnabled: this.config.enableAISuggestions,
        },
      };
    } catch {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { data: _data, error } = await this.supabase
        .from('patients')
        .select('count')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  private async checkOCRService(): Promise<boolean> {
    if (!this.config.ocrServiceUrl) return false;

    try {
      const response = await fetch(`${this.config.ocrServiceUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkLgpdService(): Promise<boolean> {
    try {
      const health = await this.lgpdHandler.healthCheck();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }
}
