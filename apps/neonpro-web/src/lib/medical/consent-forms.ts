/**
 * NeonPro Consent Forms System
 * Story 2.2: Medical History & Records - Consent Form Integration
 *
 * Sistema avançado de formulários de consentimento:
 * - Formulários dinâmicos e personalizáveis
 * - Integração com LGPD e privacidade
 * - Assinatura digital integrada
 * - Versionamento de formulários
 * - Auditoria completa
 */

import type { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import type { AuditLogger } from "../audit/audit-logger";
import type { LGPDManager } from "../auth/lgpd/lgpd-manager";
import type { DigitalSignatureManager, SignatureType, SignerRole } from "./digital-signature";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ConsentForm {
  id: string;
  clinic_id: string;
  form_type: ConsentFormType;
  title: string;
  description?: string;
  version: string;
  language: string;
  content: FormContent;
  fields: FormField[];
  validation_rules: ValidationRule[];
  legal_basis: LegalBasis[];
  retention_period: number; // in days
  is_active: boolean;
  is_required: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  effective_from: string;
  effective_until?: string;
}

export interface ConsentResponse {
  id: string;
  form_id: string;
  patient_id: string;
  clinic_id: string;
  responses: FieldResponse[];
  consent_given: boolean;
  consent_date: string;
  consent_method: ConsentMethod;
  ip_address?: string;
  user_agent?: string;
  geolocation?: GeolocationData;
  witness_id?: string;
  witness_name?: string;
  signature_id?: string;
  is_valid: boolean;
  expires_at?: string;
  withdrawn_at?: string;
  withdrawal_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface FormContent {
  introduction: string;
  sections: FormSection[];
  conclusion: string;
  legal_notice: string;
  privacy_policy_link?: string;
  contact_info: ContactInfo;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  is_required: boolean;
  conditional_logic?: ConditionalLogic;
}

export interface FormField {
  id: string;
  section_id?: string;
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  validation: FieldValidation;
  is_required: boolean;
  order: number;
  conditional_logic?: ConditionalLogic;
  data_category: DataCategory;
  retention_period?: number;
}

export interface FieldResponse {
  field_id: string;
  field_name: string;
  value: any;
  data_category: DataCategory;
  consent_given: boolean;
  timestamp: string;
}

export interface ValidationRule {
  id: string;
  field_id: string;
  rule_type: ValidationType;
  parameters: Record<string, any>;
  error_message: string;
}

export interface LegalBasis {
  type: LegalBasisType;
  description: string;
  article_reference?: string;
  purpose: string;
  data_categories: DataCategory[];
}

export interface ConditionalLogic {
  condition: LogicCondition;
  action: LogicAction;
  target_fields?: string[];
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  is_default?: boolean;
}

export interface FieldValidation {
  required?: boolean;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  min_value?: number;
  max_value?: number;
  custom_validator?: string;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface ContactInfo {
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  dpo_contact?: string;
}

// Enums
export enum ConsentFormType {
  TREATMENT_CONSENT = "treatment_consent",
  DATA_PROCESSING = "data_processing",
  PHOTOGRAPHY = "photography",
  RESEARCH_PARTICIPATION = "research_participation",
  MARKETING_COMMUNICATION = "marketing_communication",
  THIRD_PARTY_SHARING = "third_party_sharing",
  TELEMEDICINE = "telemedicine",
  EMERGENCY_CONTACT = "emergency_contact",
  MINOR_CONSENT = "minor_consent",
  CUSTOM = "custom",
}

export enum ConsentMethod {
  DIGITAL_SIGNATURE = "digital_signature",
  ELECTRONIC_CONSENT = "electronic_consent",
  VERBAL_RECORDED = "verbal_recorded",
  WRITTEN_PHYSICAL = "written_physical",
  BIOMETRIC = "biometric",
  WITNESSED = "witnessed",
}

export enum FieldType {
  TEXT = "text",
  TEXTAREA = "textarea",
  EMAIL = "email",
  PHONE = "phone",
  NUMBER = "number",
  DATE = "date",
  DATETIME = "datetime",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  SELECT = "select",
  MULTISELECT = "multiselect",
  FILE_UPLOAD = "file_upload",
  SIGNATURE = "signature",
  CONSENT_CHECKBOX = "consent_checkbox",
}

export enum DataCategory {
  PERSONAL_DATA = "personal_data",
  SENSITIVE_DATA = "sensitive_data",
  HEALTH_DATA = "health_data",
  BIOMETRIC_DATA = "biometric_data",
  CONTACT_DATA = "contact_data",
  DEMOGRAPHIC_DATA = "demographic_data",
  BEHAVIORAL_DATA = "behavioral_data",
  TECHNICAL_DATA = "technical_data",
}

export enum LegalBasisType {
  CONSENT = "consent",
  CONTRACT = "contract",
  LEGAL_OBLIGATION = "legal_obligation",
  VITAL_INTERESTS = "vital_interests",
  PUBLIC_TASK = "public_task",
  LEGITIMATE_INTERESTS = "legitimate_interests",
}

export enum ValidationType {
  REQUIRED = "required",
  MIN_LENGTH = "min_length",
  MAX_LENGTH = "max_length",
  PATTERN = "pattern",
  EMAIL = "email",
  PHONE = "phone",
  DATE_RANGE = "date_range",
  NUMERIC_RANGE = "numeric_range",
  CUSTOM = "custom",
}

export enum LogicCondition {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  CONTAINS = "contains",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
}

export enum LogicAction {
  SHOW = "show",
  HIDE = "hide",
  REQUIRE = "require",
  DISABLE = "disable",
  SET_VALUE = "set_value",
}

export interface ConsentFormOptions {
  includeSignature?: boolean;
  requireWitness?: boolean;
  enableGeolocation?: boolean;
  customValidation?: boolean;
  autoSave?: boolean;
  multiLanguage?: boolean;
}

// ============================================================================
// CONSENT FORMS MANAGER
// ============================================================================

export class ConsentFormsManager {
  private supabase;
  private auditLogger: AuditLogger;
  private lgpdManager: LGPDManager;
  private signatureManager: DigitalSignatureManager;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    this.auditLogger = new AuditLogger();
    this.lgpdManager = new LGPDManager();
    this.signatureManager = new DigitalSignatureManager();
  }

  // ========================================================================
  // FORM MANAGEMENT
  // ========================================================================

  async createConsentForm(
    clinicId: string,
    formData: Omit<ConsentForm, "id" | "created_at" | "updated_at">,
    createdBy: string,
  ): Promise<{ success: boolean; data?: ConsentForm; error?: string }> {
    try {
      const formId = crypto.randomUUID();
      const now = new Date().toISOString();

      const form: ConsentForm = {
        ...formData,
        id: formId,
        clinic_id: clinicId,
        created_at: now,
        updated_at: now,
      };

      // Validate form structure
      const validation = await this.validateFormStructure(form);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Save to database
      const { data, error } = await this.supabase
        .from("consent_forms")
        .insert(form)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await this.auditLogger.log({
        event_type: "consent_form_created",
        user_id: createdBy,
        resource_type: "consent_form",
        resource_id: formId,
        details: {
          clinic_id: clinicId,
          form_type: formData.form_type,
          version: formData.version,
          fields_count: formData.fields.length,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error creating consent form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getConsentForm(
    formId: string,
  ): Promise<{ success: boolean; data?: ConsentForm; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("consent_forms")
        .select("*")
        .eq("id", formId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      if (!data) {
        return { success: false, error: "Consent form not found" };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error getting consent form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getClinicConsentForms(
    clinicId: string,
    formType?: ConsentFormType,
    activeOnly: boolean = true,
  ): Promise<{ success: boolean; data?: ConsentForm[]; error?: string }> {
    try {
      let query = this.supabase.from("consent_forms").select("*").eq("clinic_id", clinicId);

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      if (formType) {
        query = query.eq("form_type", formType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting clinic consent forms:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateConsentForm(
    formId: string,
    updates: Partial<ConsentForm>,
    updatedBy: string,
  ): Promise<{ success: boolean; data?: ConsentForm; error?: string }> {
    try {
      // Get current form
      const currentForm = await this.getConsentForm(formId);
      if (!currentForm.success || !currentForm.data) {
        return { success: false, error: "Consent form not found" };
      }

      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // If content is being updated, create new version
      if (updates.content || updates.fields) {
        await this.createFormVersion(formId, currentForm.data, updatedBy);
      }

      const { data, error } = await this.supabase
        .from("consent_forms")
        .update(updatedData)
        .eq("id", formId)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await this.auditLogger.log({
        event_type: "consent_form_updated",
        user_id: updatedBy,
        resource_type: "consent_form",
        resource_id: formId,
        details: {
          changes: Object.keys(updates),
          version: data.version,
        },
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error updating consent form:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ========================================================================
  // CONSENT RESPONSE MANAGEMENT
  // ========================================================================

  async submitConsentResponse(
    formId: string,
    patientId: string,
    responses: FieldResponse[],
    consentMethod: ConsentMethod,
    options?: {
      witnessId?: string;
      witnessName?: string;
      ipAddress?: string;
      userAgent?: string;
      geolocation?: GeolocationData;
      requireSignature?: boolean;
    },
  ): Promise<{ success: boolean; data?: ConsentResponse; error?: string }> {
    try {
      // Get form
      const formResult = await this.getConsentForm(formId);
      if (!formResult.success || !formResult.data) {
        return { success: false, error: "Consent form not found" };
      }

      const form = formResult.data;
      const responseId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Validate responses
      const validation = await this.validateResponses(form, responses);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check if consent is given for required fields
      const consentGiven = this.checkConsentGiven(form, responses);

      // Calculate expiration date
      const expiresAt =
        form.retention_period > 0
          ? new Date(Date.now() + form.retention_period * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

      const consentResponse: ConsentResponse = {
        id: responseId,
        form_id: formId,
        patient_id: patientId,
        clinic_id: form.clinic_id,
        responses,
        consent_given: consentGiven,
        consent_date: now,
        consent_method: consentMethod,
        ip_address: options?.ipAddress,
        user_agent: options?.userAgent,
        geolocation: options?.geolocation,
        witness_id: options?.witnessId,
        witness_name: options?.witnessName,
        is_valid: true,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      };

      // Save consent response
      const { data, error } = await this.supabase
        .from("consent_responses")
        .insert(consentResponse)
        .select()
        .single();

      if (error) throw error;

      // Create digital signature if required
      if (options?.requireSignature && consentGiven) {
        const signatureResult = await this.signatureManager.signDocument(
          responseId, // Use response ID as document ID
          patientId,
          `Patient Consent - ${form.title}`,
          "", // Email would be retrieved from patient data
          SignerRole.PATIENT,
          {
            signatureType: SignatureType.ELECTRONIC_SIGNATURE,
            includeTimestamp: true,
            includeGeolocation: !!options?.geolocation,
          },
        );

        if (signatureResult.success && signatureResult.data) {
          // Update response with signature ID
          await this.supabase
            .from("consent_responses")
            .update({ signature_id: signatureResult.data.id })
            .eq("id", responseId);

          consentResponse.signature_id = signatureResult.data.id;
        }
      }

      // Update LGPD consent records
      await this.updateLGPDConsent(patientId, form, responses, consentGiven);

      // Log audit event
      await this.auditLogger.log({
        event_type: "consent_response_submitted",
        user_id: patientId,
        resource_type: "consent_response",
        resource_id: responseId,
        details: {
          form_id: formId,
          form_type: form.form_type,
          consent_given: consentGiven,
          consent_method: consentMethod,
          has_signature: !!consentResponse.signature_id,
        },
      });

      return { success: true, data: consentResponse };
    } catch (error) {
      console.error("Error submitting consent response:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getPatientConsentResponses(
    patientId: string,
    formType?: ConsentFormType,
    activeOnly: boolean = true,
  ): Promise<{ success: boolean; data?: ConsentResponse[]; error?: string }> {
    try {
      let query = this.supabase
        .from("consent_responses")
        .select(`
          *,
          consent_form:consent_forms(*)
        `)
        .eq("patient_id", patientId);

      if (activeOnly) {
        query = query.is("withdrawn_at", null);
      }

      if (formType) {
        query = query.eq("consent_forms.form_type", formType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting patient consent responses:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async withdrawConsent(
    responseId: string,
    patientId: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();

      const { error } = await this.supabase
        .from("consent_responses")
        .update({
          withdrawn_at: now,
          withdrawal_reason: reason,
          is_valid: false,
          updated_at: now,
        })
        .eq("id", responseId)
        .eq("patient_id", patientId);

      if (error) throw error;

      // Update LGPD records
      await this.lgpdManager.withdrawConsent(patientId, "medical_data", reason);

      // Log audit event
      await this.auditLogger.log({
        event_type: "consent_withdrawn",
        user_id: patientId,
        resource_type: "consent_response",
        resource_id: responseId,
        details: {
          reason,
          withdrawn_at: now,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error withdrawing consent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ========================================================================
  // FORM TEMPLATES
  // ========================================================================

  async createFormTemplate(
    templateType: ConsentFormType,
    language: string = "pt-BR",
  ): Promise<{ success: boolean; data?: Partial<ConsentForm>; error?: string }> {
    try {
      const template = this.getFormTemplate(templateType, language);
      return { success: true, data: template };
    } catch (error) {
      console.error("Error creating form template:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private getFormTemplate(templateType: ConsentFormType, language: string): Partial<ConsentForm> {
    const baseTemplate = {
      form_type: templateType,
      language,
      version: "1.0",
      is_active: true,
      is_required: true,
      retention_period: 3650, // 10 years default
    };

    switch (templateType) {
      case ConsentFormType.TREATMENT_CONSENT:
        return {
          ...baseTemplate,
          title: "Termo de Consentimento para Tratamento",
          description: "Consentimento informado para procedimentos médicos",
          content: this.getTreatmentConsentContent(),
          fields: this.getTreatmentConsentFields(),
          legal_basis: [
            {
              type: LegalBasisType.CONSENT,
              description: "Consentimento do titular para tratamento de dados de saúde",
              article_reference: "Art. 7º, I e Art. 11º, I da LGPD",
              purpose: "Prestação de cuidados médicos",
              data_categories: [DataCategory.HEALTH_DATA, DataCategory.PERSONAL_DATA],
            },
          ],
        };

      case ConsentFormType.DATA_PROCESSING:
        return {
          ...baseTemplate,
          title: "Consentimento para Tratamento de Dados Pessoais",
          description: "Autorização para coleta e processamento de dados pessoais",
          content: this.getDataProcessingContent(),
          fields: this.getDataProcessingFields(),
          legal_basis: [
            {
              type: LegalBasisType.CONSENT,
              description: "Consentimento livre, informado e inequívoco",
              article_reference: "Art. 7º, I da LGPD",
              purpose: "Prestação de serviços médicos e administrativos",
              data_categories: [DataCategory.PERSONAL_DATA, DataCategory.CONTACT_DATA],
            },
          ],
        };

      case ConsentFormType.PHOTOGRAPHY:
        return {
          ...baseTemplate,
          title: "Autorização para Uso de Imagem",
          description: "Consentimento para captura e uso de fotografias médicas",
          content: this.getPhotographyContent(),
          fields: this.getPhotographyFields(),
          legal_basis: [
            {
              type: LegalBasisType.CONSENT,
              description: "Consentimento específico para uso de imagem",
              article_reference: "Art. 7º, I da LGPD e Art. 20 do CC",
              purpose: "Documentação médica e acompanhamento de tratamento",
              data_categories: [DataCategory.BIOMETRIC_DATA, DataCategory.HEALTH_DATA],
            },
          ],
        };

      default:
        return {
          ...baseTemplate,
          title: "Formulário de Consentimento",
          description: "Formulário personalizado de consentimento",
          content: this.getGenericContent(),
          fields: this.getGenericFields(),
          legal_basis: [
            {
              type: LegalBasisType.CONSENT,
              description: "Consentimento do titular",
              purpose: "Conforme especificado no formulário",
              data_categories: [DataCategory.PERSONAL_DATA],
            },
          ],
        };
    }
  }

  // ========================================================================
  // TEMPLATE CONTENT GENERATORS
  // ========================================================================

  private getTreatmentConsentContent(): FormContent {
    return {
      introduction:
        "Este documento tem por objetivo obter seu consentimento livre e esclarecido para a realização do tratamento médico proposto.",
      sections: [
        {
          id: "treatment-info",
          title: "Informações sobre o Tratamento",
          content: "Descrição detalhada do procedimento, riscos, benefícios e alternativas.",
          order: 1,
          is_required: true,
        },
        {
          id: "risks-benefits",
          title: "Riscos e Benefícios",
          content: "Explicação dos possíveis riscos e benefícios do tratamento.",
          order: 2,
          is_required: true,
        },
        {
          id: "alternatives",
          title: "Alternativas de Tratamento",
          content: "Outras opções de tratamento disponíveis.",
          order: 3,
          is_required: true,
        },
      ],
      conclusion:
        "Declaro que recebi todas as informações necessárias e concordo com o tratamento proposto.",
      legal_notice: "Este consentimento está em conformidade com a LGPD e regulamentações médicas.",
      contact_info: {
        clinic_name: "Clínica NeonPro",
        address: "Endereço da clínica",
        phone: "(11) 9999-9999",
        email: "contato@neonpro.com.br",
        dpo_contact: "dpo@neonpro.com.br",
      },
    };
  }

  private getTreatmentConsentFields(): FormField[] {
    return [
      {
        id: "patient-name",
        name: "patient_name",
        label: "Nome Completo do Paciente",
        type: FieldType.TEXT,
        validation: { required: true, min_length: 2 },
        is_required: true,
        order: 1,
        data_category: DataCategory.PERSONAL_DATA,
      },
      {
        id: "treatment-understanding",
        name: "treatment_understanding",
        label: "Declaro que compreendi as informações sobre o tratamento",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 2,
        data_category: DataCategory.HEALTH_DATA,
      },
      {
        id: "risks-understanding",
        name: "risks_understanding",
        label: "Declaro que compreendi os riscos e benefícios",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 3,
        data_category: DataCategory.HEALTH_DATA,
      },
      {
        id: "consent-signature",
        name: "consent_signature",
        label: "Assinatura Digital",
        type: FieldType.SIGNATURE,
        validation: { required: true },
        is_required: true,
        order: 4,
        data_category: DataCategory.BIOMETRIC_DATA,
      },
    ];
  }

  private getDataProcessingContent(): FormContent {
    return {
      introduction:
        "Solicitamos seu consentimento para o tratamento de seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD).",
      sections: [
        {
          id: "data-collection",
          title: "Coleta de Dados",
          content: "Informações sobre quais dados são coletados e como.",
          order: 1,
          is_required: true,
        },
        {
          id: "data-usage",
          title: "Uso dos Dados",
          content: "Como seus dados serão utilizados pela clínica.",
          order: 2,
          is_required: true,
        },
        {
          id: "data-sharing",
          title: "Compartilhamento",
          content: "Com quem seus dados podem ser compartilhados.",
          order: 3,
          is_required: true,
        },
        {
          id: "data-rights",
          title: "Seus Direitos",
          content: "Direitos do titular dos dados conforme a LGPD.",
          order: 4,
          is_required: true,
        },
      ],
      conclusion:
        "Ao concordar, você autoriza o tratamento de seus dados pessoais conforme descrito.",
      legal_notice: "Este consentimento está em conformidade com a LGPD (Lei 13.709/2018).",
      privacy_policy_link: "https://neonpro.com.br/privacidade",
      contact_info: {
        clinic_name: "Clínica NeonPro",
        address: "Endereço da clínica",
        phone: "(11) 9999-9999",
        email: "contato@neonpro.com.br",
        dpo_contact: "dpo@neonpro.com.br",
      },
    };
  }

  private getDataProcessingFields(): FormField[] {
    return [
      {
        id: "data-collection-consent",
        name: "data_collection_consent",
        label: "Autorizo a coleta de meus dados pessoais",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 1,
        data_category: DataCategory.PERSONAL_DATA,
      },
      {
        id: "data-processing-consent",
        name: "data_processing_consent",
        label: "Autorizo o processamento de meus dados para prestação de serviços",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 2,
        data_category: DataCategory.PERSONAL_DATA,
      },
      {
        id: "marketing-consent",
        name: "marketing_consent",
        label: "Autorizo o envio de comunicações de marketing (opcional)",
        type: FieldType.CHECKBOX,
        validation: { required: false },
        is_required: false,
        order: 3,
        data_category: DataCategory.CONTACT_DATA,
      },
    ];
  }

  private getPhotographyContent(): FormContent {
    return {
      introduction:
        "Solicitamos sua autorização para captura e uso de fotografias para fins médicos.",
      sections: [
        {
          id: "photo-purpose",
          title: "Finalidade das Fotografias",
          content:
            "As fotografias serão utilizadas para documentação médica e acompanhamento do tratamento.",
          order: 1,
          is_required: true,
        },
        {
          id: "photo-storage",
          title: "Armazenamento e Segurança",
          content: "Como as imagens serão armazenadas e protegidas.",
          order: 2,
          is_required: true,
        },
      ],
      conclusion: "Autorizo a captura e uso das fotografias conforme descrito.",
      legal_notice: "Esta autorização respeita seus direitos de imagem e privacidade.",
      contact_info: {
        clinic_name: "Clínica NeonPro",
        address: "Endereço da clínica",
        phone: "(11) 9999-9999",
        email: "contato@neonpro.com.br",
      },
    };
  }

  private getPhotographyFields(): FormField[] {
    return [
      {
        id: "photo-consent",
        name: "photo_consent",
        label: "Autorizo a captura de fotografias médicas",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 1,
        data_category: DataCategory.BIOMETRIC_DATA,
      },
      {
        id: "photo-usage",
        name: "photo_usage",
        label: "Autorizo o uso das fotografias para documentação médica",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 2,
        data_category: DataCategory.BIOMETRIC_DATA,
      },
    ];
  }

  private getGenericContent(): FormContent {
    return {
      introduction: "Formulário de consentimento personalizado.",
      sections: [],
      conclusion: "Declaro meu consentimento conforme especificado.",
      legal_notice: "Este formulário está em conformidade com a legislação aplicável.",
      contact_info: {
        clinic_name: "Clínica NeonPro",
        address: "Endereço da clínica",
        phone: "(11) 9999-9999",
        email: "contato@neonpro.com.br",
      },
    };
  }

  private getGenericFields(): FormField[] {
    return [
      {
        id: "generic-consent",
        name: "generic_consent",
        label: "Declaro meu consentimento",
        type: FieldType.CONSENT_CHECKBOX,
        validation: { required: true },
        is_required: true,
        order: 1,
        data_category: DataCategory.PERSONAL_DATA,
      },
    ];
  }

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  private async validateFormStructure(
    form: ConsentForm,
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check required fields
      if (!form.title || !form.content || !form.fields) {
        return { isValid: false, error: "Missing required form fields" };
      }

      // Validate fields structure
      for (const field of form.fields) {
        if (!field.name || !field.label || !field.type) {
          return { isValid: false, error: `Invalid field structure: ${field.id}` };
        }
      }

      // Validate legal basis
      if (!form.legal_basis || form.legal_basis.length === 0) {
        return { isValid: false, error: "At least one legal basis is required" };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Validation error",
      };
    }
  }

  private async validateResponses(
    form: ConsentForm,
    responses: FieldResponse[],
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Check required fields
      const requiredFields = form.fields.filter((f) => f.is_required);
      for (const field of requiredFields) {
        const response = responses.find((r) => r.field_id === field.id);
        if (!response || !response.value) {
          return { isValid: false, error: `Required field missing: ${field.label}` };
        }

        // Validate field-specific rules
        const validation = this.validateFieldResponse(field, response.value);
        if (!validation.isValid) {
          return { isValid: false, error: validation.error };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Response validation error",
      };
    }
  }

  private validateFieldResponse(
    field: FormField,
    value: any,
  ): { isValid: boolean; error?: string } {
    try {
      const validation = field.validation;

      // Required check
      if (validation.required && (!value || value === "")) {
        return { isValid: false, error: `${field.label} is required` };
      }

      // Type-specific validation
      switch (field.type) {
        case FieldType.EMAIL: {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            return { isValid: false, error: `${field.label} must be a valid email` };
          }
          break;
        }

        case FieldType.PHONE: {
          const phoneRegex = /^\+?[1-9]\d{1,14}$/;
          if (value && !phoneRegex.test(value.replace(/\s/g, ""))) {
            return { isValid: false, error: `${field.label} must be a valid phone number` };
          }
          break;
        }

        case FieldType.NUMBER:
          if (value && isNaN(Number(value))) {
            return { isValid: false, error: `${field.label} must be a number` };
          }
          if (validation.min_value !== undefined && Number(value) < validation.min_value) {
            return {
              isValid: false,
              error: `${field.label} must be at least ${validation.min_value}`,
            };
          }
          if (validation.max_value !== undefined && Number(value) > validation.max_value) {
            return {
              isValid: false,
              error: `${field.label} must be at most ${validation.max_value}`,
            };
          }
          break;

        case FieldType.TEXT:
        case FieldType.TEXTAREA:
          if (validation.min_length && value.length < validation.min_length) {
            return {
              isValid: false,
              error: `${field.label} must be at least ${validation.min_length} characters`,
            };
          }
          if (validation.max_length && value.length > validation.max_length) {
            return {
              isValid: false,
              error: `${field.label} must be at most ${validation.max_length} characters`,
            };
          }
          if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              return { isValid: false, error: `${field.label} format is invalid` };
            }
          }
          break;
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Field validation error",
      };
    }
  }

  private checkConsentGiven(form: ConsentForm, responses: FieldResponse[]): boolean {
    try {
      // Check if all required consent fields are true
      const consentFields = form.fields.filter(
        (f) => f.type === FieldType.CONSENT_CHECKBOX && f.is_required,
      );

      for (const field of consentFields) {
        const response = responses.find((r) => r.field_id === field.id);
        if (!response || !response.value || response.value !== true) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking consent:", error);
      return false;
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private async createFormVersion(
    formId: string,
    currentForm: ConsentForm,
    updatedBy: string,
  ): Promise<void> {
    try {
      const versionId = crypto.randomUUID();
      const version = {
        id: versionId,
        form_id: formId,
        version_number: currentForm.version,
        content: currentForm.content,
        fields: currentForm.fields,
        created_by: updatedBy,
        created_at: new Date().toISOString(),
      };

      await this.supabase.from("consent_form_versions").insert(version);
    } catch (error) {
      console.error("Error creating form version:", error);
    }
  }

  private async updateLGPDConsent(
    patientId: string,
    form: ConsentForm,
    responses: FieldResponse[],
    consentGiven: boolean,
  ): Promise<void> {
    try {
      // Update LGPD consent for each data category
      const dataCategories = new Set<string>();

      responses.forEach((response) => {
        if (response.consent_given) {
          dataCategories.add(response.data_category);
        }
      });

      for (const category of dataCategories) {
        if (consentGiven) {
          await this.lgpdManager.recordConsent(
            patientId,
            category,
            form.legal_basis[0]?.purpose || "Medical services",
            form.retention_period,
          );
        }
      }
    } catch (error) {
      console.error("Error updating LGPD consent:", error);
    }
  }

  // ========================================================================
  // ANALYTICS AND REPORTING
  // ========================================================================

  async getConsentStatistics(
    clinicId: string,
    period?: { from: string; to: string },
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let query = this.supabase
        .from("consent_responses")
        .select("form_id, consent_given, consent_method, created_at")
        .eq("clinic_id", clinicId);

      if (period) {
        query = query.gte("created_at", period.from).lte("created_at", period.to);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process statistics
      const stats = {
        total_responses: data?.length || 0,
        consent_given: data?.filter((r) => r.consent_given).length || 0,
        consent_denied: data?.filter((r) => !r.consent_given).length || 0,
        by_method: {} as Record<string, number>,
        by_month: {} as Record<string, number>,
      };

      data?.forEach((response) => {
        // Count by method
        stats.by_method[response.consent_method] =
          (stats.by_method[response.consent_method] || 0) + 1;

        // Count by month
        const month = new Date(response.created_at).toISOString().slice(0, 7);
        stats.by_month[month] = (stats.by_month[month] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting consent statistics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// ============================================================================
// EXPORT DEFAULT INSTANCE
// ============================================================================

export const consentFormsManager = new ConsentFormsManager();
export default consentFormsManager;
