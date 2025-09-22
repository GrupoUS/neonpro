/**
 * Digital Prescription Valibot Schemas for Brazilian Healthcare System
 *
 * Comprehensive validation for digital prescriptions with Brazilian compliance
 * Supports ANVISA regulation, CFM standards, digital certificate validation
 * Optimized for Edge Runtime with Brazilian medication standards
 *
 * @package @neonpro/types
 * @author Claude AI Agent
 * @version 1.0.0
 * @compliance CFM, ANVISA, Brazilian Pharmaceutical Standards
 */

import * as v from "valibot";

// =====================================
// BRANDED TYPES FOR TYPE SAFETY
// =====================================

/**
 * Branded type for Prescription ID - ensures type safety
 */
export type PrescriptionId = string & { readonly __brand: "PrescriptionId" };

/**
 * Branded type for Brazilian medication code (EAN/GTIN or Register Number)
 */
export type MedicationCode = string & { readonly __brand: "MedicationCode" };

/**
 * Branded type for ANVISA Registration Number
 */
export type ANVISARegisterNumber = string & {
  readonly __brand: "ANVISARegisterNumber";
};

/**
 * Branded type for Digital Certificate ID
 */
export type DigitalCertificateId = string & {
  readonly __brand: "DigitalCertificateId";
};

/**
 * Branded type for Dosage value with unit
 */
export type Dosage = string & { readonly __brand: "Dosage" };

/**
 * Branded type for Brazilian pharmaceutical barcode (EAN-13)
 */
export type PharmaceuticalBarcode = string & {
  readonly __brand: "PharmaceuticalBarcode";
};

// =====================================
// BRAZILIAN PHARMACEUTICAL VALIDATION UTILITIES
// =====================================

/**
 * Validates ANVISA registration number format
 * Format: X.XXXX.XXXX.XXX-X (pharmaceutical registration)
 */
const validateANVISARegisterNumber = (register: string): boolean => {
  // ANVISA register format: X.XXXX.XXXX.XXX-X
  const anvisaRegex = /^\d\.\d{4}\.\d{4}\.\d{3}-\d$/;

  if (!anvisaRegex.test(register)) return false;

  // Basic validation - first digit should be 1-9
  const firstDigit = register.charAt(0);
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(firstDigit);
};

/**
 * Validates EAN-13 barcode for pharmaceutical products
 */
const validatePharmaceuticalBarcode = (barcode: string): boolean => {
  const cleanBarcode = barcode.replace(/[^\d]/g, "");

  if (cleanBarcode.length !== 13) return false;

  // EAN-13 check digit validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleanBarcode[i] || '0');
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleanBarcode[12] || '0');
};

/**
 * Validates medication dosage format
 * Examples: "500mg", "5ml", "1 comprimido", "2 gotas"
 */
const validateDosage = (dosage: string): boolean => {
  // Common dosage patterns in Portuguese
  const dosagePatterns = [
    /^\d+(\.\d+)?\s*(mg|g|ml|l|mcg|µg|ui|comprimido|cápsula|gota|aplicação|spray|inalação|sachê|envelope)s?$/i,
    /^\d+(\.\d+)?\s*(mg|g|ml|l|mcg|µg|ui)\s*\/\s*\d+(\.\d+)?\s*(mg|ml|g|l|mcg|µg|ui)$/i, // Concentration format: 500mg/5ml
    /^\d+(\s*a\s*\d+)?\s*(mg|g|ml|l|mcg|µg|ui|comprimido|cápsula|gota|aplicação|spray|inalação|sachê|envelope)s?$/i,
  ];

  return dosagePatterns.some((pattern) => pattern.test(dosage.trim()));
};

/**
 * Validates prescription frequency (posologia)
 * Examples: "1x ao dia", "2x ao dia", "de 8 em 8 horas", "conforme necessário"
 */
const validateFrequency = (frequency: string): boolean => {
  const frequencyPatterns = [
    /^\d+x?\s*(ao?\s*)?(dia|semana|mês|vez|vezes)/i,
    /^de\s+\d+\s+em\s+\d+\s+(hora|horas|min|minutos|dia|dias)/i,
    /^a\s+cada\s+\d+\s+(hora|horas|min|minutos|dia|dias)/i,
    /^(conforme\s+necessário|se\s+necessário|sos|prn)/i,
    /^(em\s+jejum|antes\s+das\s+refeições|após\s+as\s+refeições|ao\s+deitar)/i,
    /^\d+\s+(gota|gotas).*\s+(olho|ouvido|nariz)/i,
  ];

  return frequencyPatterns.some((pattern) => pattern.test(frequency.trim()));
};

/**
 * Validates treatment duration
 * Examples: "7 dias", "2 semanas", "uso contínuo", "até melhora dos sintomas"
 */
const validateDuration = (duration: string): boolean => {
  const durationPatterns = [
    /^\d+\s+(dia|dias|semana|semanas|mês|meses|ano|anos)$/i,
    /^(uso\s+contínuo|contínuo|permanente)/i,
    /^até\s+(melhora|resolução|alta\s+médica)/i,
    /^por\s+tempo\s+indeterminado$/i,
  ];

  return durationPatterns.some((pattern) => pattern.test(duration.trim()));
};

/**
 * Validates prescription expiration (maximum 180 days for most medications)
 */
const validatePrescriptionExpiration = (
  issueDate: string,
  expirationDate: string,
): boolean => {
  const issue = new Date(issueDate);
  const expiration = new Date(expirationDate);

  // Prescription should not be expired at issue
  if (expiration <= issue) return false;

  // Maximum validity period (CFM regulation)
  const maxValidityDays = 180; // 6 months for most medications
  const maxExpiration = new Date(
    issue.getTime() + maxValidityDays * 24 * 60 * 60 * 1000,
  );

  return expiration <= maxExpiration;
};

/**
 * Validates controlled substance prescription (special rules)
 */
const validateControlledSubstanceRules = (
  medicationType: string,
  prescriptionDuration: string,
  quantity: number,
): boolean => {
  // Special rules for controlled substances
  if (
    medicationType === "controlled_a1" ||
    medicationType === "controlled_a2"
  ) {
    // Maximum 30 days for A1/A2 controlled substances
    const maxDays = 30;
    const daysMatch = prescriptionDuration.match(/^(\d+)\s+dias?$/i);

    if (daysMatch && daysMatch[1]) {
      const days = parseInt(daysMatch[1]);
      if (days > maxDays) return false;
    }

    // Maximum quantity restrictions
    if (quantity > 60) return false; // Typically max 60 units for controlled substances
  }

  return true;
};

// =====================================
// PRESCRIPTION ENUM SCHEMAS
// =====================================

/**
 * Prescription Status Schema
 */
export const PrescriptionStatusSchema = v.picklist(
  [
    "draft", // Rascunho
    "issued", // Emitida
    "dispensed", // Dispensada
    "partially_dispensed", // Parcialmente dispensada
    "expired", // Expirada
    "cancelled", // Cancelada
    "renewed", // Renovada
    "under_review", // Em revisão
  ],
  "Status da receita inválido",
);

/**
 * Medication Type Schema (Brazilian classification)
 */
export const MedicationTypeSchema = v.picklist(
  [
    "common", // Medicamento comum
    "generic", // Medicamento genérico
    "similar", // Medicamento similar
    "reference", // Medicamento de referência
    "controlled_a1", // Controlada A1 (entorpecentes)
    "controlled_a2", // Controlada A2 (psicotrópicos)
    "controlled_a3", // Controlada A3 (outros)
    "controlled_b1", // Controlada B1 (psicotrópicos)
    "controlled_b2", // Controlada B2 (psicotrópicos anorexígenos)
    "controlled_c1", // Controlada C1 (outras substâncias)
    "controlled_c2", // Controlada C2 (retinóides)
    "controlled_c3", // Controlada C3 (imunossupressores)
    "controlled_c4", // Controlada C4 (antirretrovirais)
    "controlled_c5", // Controlada C5 (anabolizantes)
    "antibiotic", // Antibiótico
    "antimicrobial", // Antimicrobiano
    "high_cost", // Alto custo
    "exceptional", // Medicamento excepcional
    "strategic", // Medicamento estratégico
    "oncologic", // Medicamento oncológico
    "insulin", // Insulina
    "vaccine", // Vacina
  ],
  "Tipo de medicamento inválido",
);

/**
 * Administration Route Schema
 */
export const AdministrationRouteSchema = v.picklist(
  [
    "oral", // Via oral
    "sublingual", // Sublingual
    "intramuscular", // Intramuscular
    "intravenous", // Intravenosa
    "subcutaneous", // Subcutânea
    "topical", // Tópica
    "ophthalmic", // Oftálmica
    "otic", // Ótica (ouvido)
    "nasal", // Nasal
    "rectal", // Retal
    "vaginal", // Vaginal
    "inhalation", // Inalatória
    "transdermal", // Transdérmica
    "intradermal", // Intradérmica
    "epidural", // Epidural
    "intrathecal", // Intratecal
    "intraperitoneal", // Intraperitoneal
    "intraarticular", // Intra-articular
    "intravitreal", // Intravítreo
  ],
  "Via de administração inválida",
);

/**
 * Prescription Type Schema
 */
export const PrescriptionTypeSchema = v.picklist(
  [
    "simple", // Receita simples
    "special_white", // Receita especial branca
    "special_blue", // Receita especial azul (A1)
    "special_yellow", // Receita especial amarela (A2)
    "retention", // Receita de retenção
    "control", // Receita de controle especial
    "antimicrobial", // Receita antimicrobiano
    "digital", // Receita digital
    "telemedicine", // Receita de telemedicina
  ],
  "Tipo de receita inválido",
);

/**
 * Digital Certificate Type Schema
 */
export const DigitalCertificateTypeSchema = v.picklist(
  [
    "a1", // Certificado A1 (arquivo)
    "a3", // Certificado A3 (token/smartcard)
    "cloud", // Certificado em nuvem
    "mobile", // Certificado mobile
  ],
  "Tipo de certificado digital inválido",
);

// =====================================
// BASIC VALIDATION SCHEMAS
// =====================================

/**
 * ANVISA Register Number Validation Schema
 */
export const ANVISARegisterNumberSchema = v.pipe(
  v.string("Registro ANVISA deve ser uma string válida"),
  v.trim(),
  v.nonEmpty("Registro ANVISA é obrigatório"),
  v.regex(
    /^\d\.\d{4}\.\d{4}\.\d{3}-\d$/,
    "Registro ANVISA deve estar no formato X.XXXX.XXXX.XXX-X",
  ),
  v.check(validateANVISARegisterNumber, "Número de registro ANVISA inválido"),
  v.transform((value) => value as ANVISARegisterNumber),
);

/**
 * Pharmaceutical Barcode Validation Schema (EAN-13)
 */
export const PharmaceuticalBarcodeSchema = v.pipe(
  v.string("Código de barras deve ser uma string válida"),
  v.trim(),
  v.nonEmpty("Código de barras é obrigatório"),
  v.regex(/^\d{13}$/, "Código de barras deve ter exatamente 13 dígitos"),
  v.check(
    validatePharmaceuticalBarcode,
    "Código de barras farmacêutico inválido",
  ),
  v.transform((value) => value as PharmaceuticalBarcode),
);

/**
 * Medication Dosage Validation Schema
 */
export const DosageSchema = v.pipe(
  v.string("Dosagem deve ser uma string válida"),
  v.trim(),
  v.nonEmpty("Dosagem é obrigatória"),
  v.minLength(2, "Dosagem deve ter pelo menos 2 caracteres"),
  v.maxLength(50, "Dosagem não pode exceder 50 caracteres"),
  v.check(
    validateDosage,
    'Formato de dosagem inválido. Use formatos como "500mg", "5ml", "1 comprimido"',
  ),
  v.transform((value) => value.toLowerCase() as Dosage),
);

/**
 * Medication Frequency Validation Schema (Posologia)
 */
export const FrequencySchema = v.pipe(
  v.string("Frequência deve ser uma string válida"),
  v.trim(),
  v.nonEmpty("Frequência é obrigatória"),
  v.minLength(3, "Frequência deve ter pelo menos 3 caracteres"),
  v.maxLength(100, "Frequência não pode exceder 100 caracteres"),
  v.check(
    validateFrequency,
    'Formato de frequência inválido. Use formatos como "1x ao dia", "de 8 em 8 horas"',
  ),
  v.transform((value) => value.toLowerCase()),
);

/**
 * Treatment Duration Validation Schema
 */
export const DurationSchema = v.pipe(
  v.string("Duração deve ser uma string válida"),
  v.trim(),
  v.nonEmpty("Duração do tratamento é obrigatória"),
  v.minLength(3, "Duração deve ter pelo menos 3 caracteres"),
  v.maxLength(50, "Duração não pode exceder 50 caracteres"),
  v.check(
    validateDuration,
    'Formato de duração inválido. Use formatos como "7 dias", "uso contínuo"',
  ),
  v.transform((value) => value.toLowerCase()),
);

/**
 * Prescription Expiration Validation Schema
 */
const PrescriptionExpirationBaseSchema = v.object({
  issue_date: v.pipe(
    v.string(),
    v.isoDate("Data de emissão deve estar em formato ISO"),
  ),
  expiration_date: v.pipe(
    v.string(),
    v.isoDate("Data de validade deve estar em formato ISO"),
  ),
});

export const PrescriptionExpirationSchema = v.pipe(
  PrescriptionExpirationBaseSchema,
  v.check(
    (data: v.InferInput<typeof PrescriptionExpirationBaseSchema>) =>
      validatePrescriptionExpiration(data.issue_date, data.expiration_date),
    "Data de validade inválida ou excede o prazo máximo de 180 dias",
  ),
);

/**
 * Brazilian Currency for medication prices
 */
export const MedicationPriceSchema = v.pipe(
  v.number("Preço deve ser um número"),
  v.minValue(0, "Preço deve ser maior ou igual a zero"),
  v.maxValue(999999.99, "Preço máximo excedido"),
  v.transform((value) => Math.round(value * 100) / 100), // Round to 2 decimal places
);

// =====================================
// COMPLEX OBJECT SCHEMAS
// =====================================

/**
 * Medication Information Schema
 */
export const MedicationInformationSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(200)),
  active_principle: v.pipe(v.string(), v.minLength(2), v.maxLength(200)),
  medication_type: MedicationTypeSchema,
  anvisa_register: v.optional(
    v.pipe(
      v.string("Registro ANVISA deve ser uma string válida"),
      v.trim(),
      v.nonEmpty("Registro ANVISA é obrigatório"),
      v.regex(
        /^\d\.\d{4}\.\d{4}\.\d{3}-\d$/,
        "Registro ANVISA deve estar no formato X.XXXX.XXXX.XXX-X",
      ),
      v.check(validateANVISARegisterNumber, "Número de registro ANVISA inválido"),
    ),
  ),
  barcode: v.optional(PharmaceuticalBarcodeSchema),
  manufacturer: v.optional(
    v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
  ),
  presentation: v.optional(
    v.pipe(v.string(), v.minLength(5), v.maxLength(200)),
  ),
  concentration: v.optional(
    v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
  ),
  administration_route: AdministrationRouteSchema,
  therapeutic_class: v.optional(
    v.pipe(v.string(), v.minLength(5), v.maxLength(100)),
  ),
  pharmacological_class: v.optional(
    v.pipe(v.string(), v.minLength(5), v.maxLength(100)),
  ),
  controlled_substance: v.boolean(),
  requires_prescription: v.boolean(),
  generic_available: v.boolean(),
  reference_price: v.optional(MedicationPriceSchema),
});

/**
 * Prescription Instructions Schema
 */
export const PrescriptionInstructionsSchema = v.object({
  dosage: v.pipe(
    v.string("Dosagem deve ser uma string válida"),
    v.trim(),
    v.nonEmpty("Dosagem é obrigatória"),
    v.minLength(2, "Dosagem deve ter pelo menos 2 caracteres"),
    v.maxLength(50, "Dosagem não pode exceder 50 caracteres"),
    v.check(
      validateDosage,
      'Formato de dosagem inválido. Use formatos como "500mg", "5ml", "1 comprimido"',
    ),
    v.transform((value) => value.toLowerCase()),
  ),
  frequency: FrequencySchema,
  duration: DurationSchema,
  quantity_prescribed: v.pipe(v.number(), v.minValue(1), v.maxValue(999)),
  quantity_unit: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),

  // Special instructions
  instructions: v.optional(v.pipe(v.string(), v.maxLength(500))),
  precautions: v.optional(v.pipe(v.string(), v.maxLength(500))),
  contraindications: v.optional(v.pipe(v.string(), v.maxLength(500))),
  side_effects: v.optional(v.pipe(v.string(), v.maxLength(500))),

  // Administration details
  administration_time: v.optional(
    v.picklist(
      [
        "jejum", // Em jejum
        "antes_refeicao", // Antes das refeições
        "apos_refeicao", // Após as refeições
        "durante_refeicao", // Durante as refeições
        "ao_deitar", // Ao deitar
        "qualquer_horario", // Qualquer horário
        "horario_especifico", // Horário específico
      ],
      "Horário de administração inválido",
    ),
  ),

  special_storage: v.optional(v.pipe(v.string(), v.maxLength(200))),
  renewal_allowed: v.boolean(),
  max_renewals: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(12))),
});

/**
 * Digital Certificate Information Schema
 */
export const DigitalCertificateSchema = v.object({
  certificate_id: v.pipe(
    v.string(),
    v.uuid("ID do certificado deve ser UUID válido"),
  ),
  certificate_type: DigitalCertificateTypeSchema,
  certificate_serial: v.pipe(v.string(), v.minLength(10), v.maxLength(50)),
  issuer_name: v.pipe(v.string(), v.minLength(5), v.maxLength(200)),
  subject_name: v.pipe(v.string(), v.minLength(5), v.maxLength(200)),
  valid_from: v.pipe(v.string(), v.isoDate()),
  valid_until: v.pipe(v.string(), v.isoDate()),
  is_valid: v.boolean(),
  thumbprint: v.pipe(v.string(), v.minLength(40), v.maxLength(64)),
  key_usage: v.array(v.string()),
  crm_number: v.optional(v.pipe(v.string(), v.regex(/^\d{4,6}\/[A-Z]{2}$/))),
  cfm_validation_status: v.optional(
    v.picklist(["validated", "pending", "expired"], "Status CFM inválido"),
  ),
});

/**
 * Prescription Audit Trail Schema
 */
export const PrescriptionAuditTrailSchema = v.object({
  action: v.picklist(
    [
      "created", // Criada
      "issued", // Emitida
      "modified", // Modificada
      "cancelled", // Cancelada
      "dispensed", // Dispensada
      "renewed", // Renovada
      "reviewed", // Revisada
      "expired", // Expirada
    ],
    "Ação de auditoria inválida",
  ),

  performed_by: v.pipe(
    v.string(),
    v.uuid("ID do usuário deve ser UUID válido"),
  ),
  performed_at: v.pipe(v.string(), v.isoDate()),
  ip_address: v.optional(v.pipe(v.string(), v.ip("Endereço IP inválido"))),
  user_agent: v.optional(v.pipe(v.string(), v.maxLength(500))),
  location: v.optional(v.pipe(v.string(), v.maxLength(200))),
  notes: v.optional(v.pipe(v.string(), v.maxLength(1000))),

  // Digital signature information
  digital_signature: v.optional(v.pipe(v.string(), v.minLength(100))),
  signature_algorithm: v.optional(v.pipe(v.string(), v.maxLength(50))),
  certificate_used: v.optional(DigitalCertificateSchema),
});

// =====================================
// MAIN PRESCRIPTION SCHEMAS
// =====================================

/**
 * Prescription Creation Schema
 */
const PrescriptionCreationBaseSchema = v.object({
  // Basic prescription info
  clinic_id: v.pipe(v.string(), v.uuid("ID da clínica deve ser UUID válido")),
    patient_id: v.pipe(
      v.string(),
      v.uuid("ID do paciente deve ser UUID válido"),
    ),
    professional_id: v.pipe(
      v.string(),
      v.uuid("ID do profissional deve ser UUID válido"),
    ),
    appointment_id: v.optional(
      v.pipe(v.string(), v.uuid("ID do agendamento deve ser UUID válido")),
    ),

    // Prescription metadata
    prescription_type: PrescriptionTypeSchema,
    prescription_number: v.optional(
      v.pipe(v.string(), v.minLength(5), v.maxLength(50)),
    ),

    // Medications
    medications: v.pipe(
      v.array(
        v.object({
          medication: MedicationInformationSchema,
          instructions: PrescriptionInstructionsSchema,

          // Validation for controlled substances
          controlled_substance_validation: v.optional(
            v.object({
              requires_special_prescription: v.boolean(),
              prescription_series: v.optional(
                v.pipe(v.string(), v.minLength(5), v.maxLength(20)),
              ),
              special_authorization: v.optional(
                v.pipe(v.string(), v.maxLength(200)),
              ),
            }),
          ),
        }),
      ),
      v.minLength(1, "Pelo menos um medicamento deve ser prescrito"),
    ),

    // Digital signature
    digital_certificate: DigitalCertificateSchema,

    // Validity
    issue_date: v.pipe(
      v.string(),
      v.isoDate("Data de emissão deve estar em formato ISO"),
    ),
    expiration_date: v.pipe(
      v.string(),
      v.isoDate("Data de validade deve estar em formato ISO"),
    ),

    // Clinical context
    diagnosis: v.optional(
      v.pipe(v.string(), v.minLength(10), v.maxLength(500)),
    ),
    clinical_indication: v.optional(
      v.pipe(v.string(), v.minLength(5), v.maxLength(500)),
    ),

    // Special notes
    general_instructions: v.optional(v.pipe(v.string(), v.maxLength(1000))),
    pharmacy_notes: v.optional(v.pipe(v.string(), v.maxLength(500))),

    // Regulatory compliance
    cfm_compliance_verified: v.pipe(
      v.boolean(),
      v.literal(true, "Conformidade CFM deve ser verificada"),
    ),
    anvisa_compliance_verified: v.pipe(
      v.boolean(),
      v.literal(true, "Conformidade ANVISA deve ser verificada"),
    ),

    // Emergency contact
    emergency_contact: v.optional(
      v.object({
        name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
        phone: v.pipe(v.string(), v.minLength(10), v.maxLength(20)),
        relationship: v.pipe(v.string(), v.maxLength(50)),
      }),
    ),
  });

export const PrescriptionCreationSchema = PrescriptionCreationBaseSchema;

/**
 * Prescription Update Schema
 */
export const PrescriptionUpdateSchema = v.object({
  prescription_id: v.pipe(
    v.string(),
    v.uuid("ID da receita deve ser UUID válido"),
  ),

  // Updatable fields (limited after issuance)
  status: v.optional(PrescriptionStatusSchema),
  pharmacy_notes: v.optional(v.pipe(v.string(), v.maxLength(500))),
  dispensed_at: v.optional(v.pipe(v.string(), v.isoDate())),
  dispensed_by: v.optional(v.pipe(v.string(), v.uuid())),
  pharmacy_id: v.optional(v.pipe(v.string(), v.uuid())),

  // Partial dispensing tracking
  partially_dispensed_items: v.optional(
    v.array(
      v.object({
        medication_index: v.pipe(v.number(), v.minValue(0)),
        quantity_dispensed: v.pipe(v.number(), v.minValue(0)),
        dispensed_at: v.pipe(v.string(), v.isoDate()),
        remaining_quantity: v.pipe(v.number(), v.minValue(0)),
      }),
    ),
  ),

  // Renewal information
  renewal_of: v.optional(
    v.pipe(v.string(), v.uuid("ID da receita original deve ser UUID válido")),
  ),
  renewal_count: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(12))),

  // Update context
  updated_by: v.pipe(v.string(), v.uuid("ID do usuário deve ser UUID válido")),
  update_reason: v.pipe(v.string(), v.minLength(5), v.maxLength(500)),
});

/**
 * Prescription Query Schema
 */
export const PrescriptionQuerySchema = v.object({
  // Basic filters
  clinic_id: v.optional(v.pipe(v.string(), v.uuid())),
  patient_id: v.optional(v.pipe(v.string(), v.uuid())),
  professional_id: v.optional(v.pipe(v.string(), v.uuid())),
  status: v.optional(PrescriptionStatusSchema),
  prescription_type: v.optional(PrescriptionTypeSchema),

  // Date filters
  issue_date_from: v.optional(v.pipe(v.string(), v.isoDate())),
  issue_date_to: v.optional(v.pipe(v.string(), v.isoDate())),
  expiration_date_from: v.optional(v.pipe(v.string(), v.isoDate())),
  expiration_date_to: v.optional(v.pipe(v.string(), v.isoDate())),

  // Medication filters
  medication_name: v.optional(v.pipe(v.string(), v.minLength(2))),
  medication_type: v.optional(MedicationTypeSchema),
  controlled_substances_only: v.optional(v.boolean()),

  // Search parameters
  search_term: v.optional(v.pipe(v.string(), v.minLength(2), v.maxLength(100))),

  // Pagination
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(1000))),
  offset: v.optional(v.pipe(v.number(), v.minValue(0))),

  // Sorting
  sort_by: v.optional(
    v.picklist(
      [
        "issue_date",
        "expiration_date",
        "patient_name",
        "professional_name",
        "status",
      ],
      "Campo de ordenação inválido",
    ),
  ),
  sort_order: v.optional(
    v.picklist(["asc", "desc"], "Ordem de classificação inválida"),
  ),
});

// =====================================
// VALIDATION HELPER FUNCTIONS
// =====================================

/**
 * Validates prescription for controlled substances compliance
 */
export const validateControlledSubstanceCompliance = (
  medications: Array<{
    medication: { medication_type: string; controlled_substance: boolean };
    instructions: { duration: string; quantity_prescribed: number };
  }>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (const med of medications) {
    if (med.medication.controlled_substance) {
      const isValid = validateControlledSubstanceRules(
        med.medication.medication_type,
        med.instructions.duration,
        med.instructions.quantity_prescribed,
      );

      if (!isValid) {
        errors.push(
          `Medicamento controlado ${med.medication.medication_type} não atende aos critérios regulamentares`,
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generates prescription number following Brazilian standards
 */
export const generatePrescriptionNumber = (
  clinicId: string,
  professionalCRM: string,
  issueDate: string,
): string => {
  const date = new Date(issueDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Extract CRM number (before the slash)
  const crmNumber = professionalCRM.split("/")[0];

  // Generate unique sequence (simplified - in production, use database sequence)
  const sequence = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  // Format: CLINICPREFIX-CRMNUM-YYYYMMDD-SEQUENCE
  const clinicPrefix = clinicId.slice(0, 6).toUpperCase();
  return `${clinicPrefix}-${crmNumber}-${year}${month}${day}-${sequence}`;
};

/**
 * Calculates prescription expiration date based on medication type
 */
export const calculateExpirationDate = (
  issueDate: string,
  medicationType: string,
): string => {
  const issue = new Date(issueDate);
  let validityDays = 180; // Default validity

  // Special rules for different medication types
  switch (medicationType) {
    case "controlled_a1":
    case "controlled_a2":
      validityDays = 30; // 30 days for controlled substances A1/A2
      break;
    case "controlled_b1":
    case "controlled_b2":
      validityDays = 60; // 60 days for controlled substances B1/B2
      break;
    case "antibiotic":
    case "antimicrobial":
      validityDays = 30; // 30 days for antibiotics
      break;
    case "insulin":
      validityDays = 90; // 90 days for insulin
      break;
    default:
      validityDays = 180; // 180 days for common medications
  }

  const expiration = new Date(
    issue.getTime() + validityDays * 24 * 60 * 60 * 1000,
  );
  return expiration.toISOString();
};
