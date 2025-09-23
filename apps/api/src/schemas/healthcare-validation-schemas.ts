// =====================================
// BASE HEALTHCARE SCHEMAS
// =====================================

/**
 * Brazilian contact information schema
 */
export const ContactSchema = z.object({
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10-11 dígitos")
    .optional()
    .nullable(),
  emergencyPhone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone de emergência deve ter 10-11 dígitos")
    .optional()
    .nullable(),
});

/**
 * Brazilian address schema
 */
export const AddressSchema = z.object({
  street: z.string().min(5, "Logradouro deve ter pelo menos 5 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro deve ter pelo menos 3 caracteres"),
  city: z.string().min(3, "Cidade deve ter pelo menos 3 caracteres"),
  state: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado inválido"),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  country: z.string().default("Brasil"),
});

// =====================================
// PATIENT SCHEMAS
// =====================================

/**
 * Patient data schema with LGPD compliance
 */
export const PatientSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Nome completo deve ter pelo menos 3 caracteres")
      .max(100, "Nome completo não pode exceder 100 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s']+$/, "Nome deve conter apenas letras e espaços"),
    cpf: z
      .string()
      .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
      .refine((cpf) => validateCPF(cpf), "CPF inválido"),
    rg: z.string().optional().nullable(),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Data de nascimento inválida")
      .refine((date) => {
        const birthDate = new Date(date);
        const age = calculateAge(birthDate);
        return age >= 0 && age <= 150;
      }, "Idade deve estar entre 0 e 150 anos"),
    gender: z.enum(["M", "F", "X", "OUTRO"]).optional(),
    contact: ContactSchema.optional(),
    address: AddressSchema.optional(),
    bloodType: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
    maritalStatus: z
      .enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL"])
      .optional(),
    emergencyContact: z
      .object({
        name: z.string().min(3, "Nome do contato é obrigatório"),
        relationship: z.string().min(3, "Parentesco é obrigatório"),
        phone: z
          .string()
          .regex(/^\d{10,11}$/, "Telefone deve ter 10-11 dígitos"),
      })
      .optional(),
    medicalHistory: z
      .string()
      .max(2000, "Histórico médico não pode exceder 2000 caracteres")
      .optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    consentimentoLGPDPaciente: z.boolean().default(false),
    dataUltimoConsentimento: z.date().optional(),
  })
  .refine((data) => {
    // Validate that either email or phone is provided
    return data.contact?.email || data.contact?.phone;
  }, "É necessário fornecer email ou telefone");

// =====================================
// APPOINTMENT SCHEMAS
// =====================================

/**
 * Appointment schema with healthcare validation
 */
export const AppointmentSchema = z
  .object({
    patientId: z.string().min(1, "ID do paciente é obrigatório"),
    professionalId: z.string().min(1, "ID do profissional é obrigatório"),
    startTime: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Horário de início inválido")
      .refine((date) => {
        const startTime = new Date(date);
        const now = new Date();
        return startTime > now;
      }, "Horário da consulta não pode estar no passado")
      .refine((date) => {
        const startTime = new Date(date);
        const now = new Date();
        const maxFuture = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
        return startTime <= maxFuture;
      }, "Agendamento não pode ser feito com mais de 90 dias de antecedência"),
    endTime: z.string().optional(),
    duration: z
      .number()
      .min(5, "Duração mínima é 5 minutos")
      .max(180, "Duração máxima é 180 minutos")
      .optional(),
    appointmentType: z.enum(
      [
        "CONSULTA_INICIAL",
        "CONSULTA_RETORNO",
        "EXAME",
        "PROCEDIMENTO",
        "CIRURGIA",
        "TELEMEDICINA",
        "URGENCIA",
        "FOLLOW_UP",
      ],
      "Tipo de consulta inválido",
    ),
    status: z
      .enum([
        "AGENDADO",
        "CONFIRMADO",
        "EM_ANDAMENTO",
        "CONCLUIDO",
        "CANCELADO",
        "NAO_COMPARECEU",
      ])
      .default("AGENDADO"),
    reason: z
      .string()
      .min(5, "Motivo da consulta deve ter pelo menos 5 caracteres")
      .max(500, "Motivo não pode exceder 500 caracteres"),
    notes: z
      .string()
      .max(1000, "Observações não podem exceder 1000 caracteres")
      .optional(),
    location: z
      .string()
      .min(3, "Local deve ter pelo menos 3 caracteres")
      .optional(),
    isVirtual: z.boolean().default(false),
    virtualLink: z.string().url().optional().nullable(),
    priority: z.enum(["BAIXA", "NORMAL", "ALTA", "URGENCIA"]).default("NORMAL"),
    reminderSent: z.boolean().default(false),
  })
  .refine((data) => {
    // Validate endTime if provided
    if (data.endTime) {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      return endTime > startTime;
    }
    return true;
  }, "Horário de término deve ser após o início")
  .refine((data) => {
    // Validate virtual link for virtual appointments
    if (data.isVirtual && !data.virtualLink) {
      return false;
    }
    return true;
  }, "Consulta virtual requer link de acesso");

// =====================================
// MEDICAL RECORD SCHEMAS
// =====================================

/**
 * Medical record schema with healthcare compliance
 */
export const MedicalRecordSchema = z
  .object({
    patientId: z.string().min(1, "ID do paciente é obrigatório"),
    professionalId: z.string().min(1, "ID do profissional é obrigatório"),
    recordType: z.enum(
      [
        "ANAMNESE",
        "EVOLUCAO",
        "PRESCRICAO",
        "EXAME",
        "RESULTADO",
        "ALTA",
        "ENCAMINHAMENTO",
        "ATESTADO",
        "DECLARACAO",
      ],
      "Tipo de registro inválido",
    ),
    content: z
      .string()
      .min(10, "Conteúdo deve ter pelo menos 10 caracteres")
      .max(10000, "Conteúdo não pode exceder 10000 caracteres"),
    appointmentId: z.string().optional(),
    diagnosis: z.array(z.string()).optional(),
    symptoms: z.array(z.string()).optional(),
    procedures: z.array(z.string()).optional(),
    medications: z
      .array(
        z.object({
          name: z.string().min(3, "Nome do medicamento é obrigatório"),
          dosage: z.string().min(1, "Dosagem é obrigatória"),
          frequency: z.string().min(1, "Frequência é obrigatória"),
          duration: z.string().min(1, "Duração é obrigatória"),
          instructions: z.string().optional(),
        }),
      )
      .optional(),
    vitalSigns: z
      .object({
        bloodPressure: z.string().optional(),
        heartRate: z
          .number()
          .min(40, "Frequência cardíaca inválida")
          .max(200, "Frequência cardíaca inválida")
          .optional(),
        temperature: z
          .number()
          .min(35, "Temperatura inválida")
          .max(42, "Temperatura inválida")
          .optional(),
        oxygenSaturation: z
          .number()
          .min(70, "Saturação inválida")
          .max(100, "Saturação inválida")
          .optional(),
        respiratoryRate: z
          .number()
          .min(8, "Frequência respiratória inválida")
          .max(40, "Frequência respiratória inválida")
          .optional(),
      })
      .optional(),
    isConfidential: z.boolean().default(false),
  })
  .refine((data) => {
    // Validate sensitive content marking
    const sensitiveKeywords = [
      "hiv",
      "aids",
      "câncer",
      "doença terminal",
      "psiquiátrico",
    ];
    const hasSensitiveContent = sensitiveKeywords.some((keyword) =>
      data.content.toLowerCase().includes(keyword),
    );

    if (hasSensitiveContent && !data.isConfidential) {
      return false;
    }
    return true;
  }, "Conteúdo sensível deve ser marcado como confidencial");

// =====================================
// PRESCRIPTION SCHEMAS
// =====================================

/**
 * Prescription schema with ANVISA compliance
 */
export const PrescriptionSchema = z
  .object({
    patientId: z.string().min(1, "ID do paciente é obrigatório"),
    professionalId: z.string().min(1, "ID do profissional é obrigatório"),
    medications: z
      .array(
        z.object({
          name: z
            .string()
            .min(3, "Nome do medicamento é obrigatório")
            .max(100, "Nome do medicamento não pode exceder 100 caracteres"),
          dosage: z
            .string()
            .min(1, "Dosagem é obrigatória")
            .max(50, "Dosagem não pode exceder 50 caracteres"),
          frequency: z
            .string()
            .min(1, "Frequência é obrigatória")
            .max(50, "Frequência não pode exceder 50 caracteres"),
          duration: z
            .string()
            .min(1, "Duração é obrigatória")
            .max(50, "Duração não pode exceder 50 caracteres"),
          quantity: z
            .number()
            .min(1, "Quantidade deve ser maior que 0")
            .optional(),
          instructions: z
            .string()
            .max(200, "Instruções não podem exceder 200 caracteres")
            .optional(),
          isControlled: z.boolean().default(false),
          registrationNumber: z.string().optional().nullable(),
        }),
      )
      .min(1, "Prescrição deve conter pelo menos um medicamento"),
    diagnosis: z
      .string()
      .min(3, "Diagnóstico é obrigatório")
      .max(500, "Diagnóstico não pode exceder 500 caracteres"),
    prescriptionDate: z.date().default(new Date()),
    validityDays: z
      .number()
      .min(1, "Validade mínima é 1 dia")
      .max(365, "Validade máxima é 365 dias")
      .default(30),
    isChronic: z.boolean().default(false),
    notes: z
      .string()
      .max(500, "Observações não podem exceder 500 caracteres")
      .optional(),
  })
  .refine((data) => {
    // Validate controlled medications
    const hasControlled = data.medications.some((med) => med.isControlled);
    if (
      hasControlled &&
      !data.medications.every((med) => med.registrationNumber)
    ) {
      return false;
    }
    return true;
  }, "Medicamentos controlados requerem número de registro");

// =====================================
// PROFESSIONAL SCHEMAS
// =====================================

/**
 * Healthcare professional schema with license validation
 */
export const ProfessionalSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome completo deve ter pelo menos 3 caracteres")
    .max(100, "Nome completo não pode exceder 100 caracteres"),
  licenseNumber: z
    .string()
    .regex(
      /^(CRM|CRO|CRF|COREN)\/[A-Z]{2}\s*\d{6}$/,
      "Número de registro profissional inválido",
    ),
  licenseState: z
    .string()
    .length(2, "Estado deve ter 2 caracteres")
    .regex(/^[A-Z]{2}$/, "Estado inválido"),
  specialty: z.enum(
    [
      "CLINICA_GERAL",
      "PEDIATRIA",
      "CARDIOLOGIA",
      "ORTOPEDIA",
      "GINECOLOGIA",
      "OFTALMOLOGIA",
      "DERMATOLOGIA",
      "PSIQUIATRIA",
      "NEUROLOGIA",
      "UROLOGIA",
      "CIRURGIA_GERAL",
      "ANESTESIOLOGIA",
      "RADIOLOGIA",
      "PATOLOGIA",
    ],
    "Especialidade inválida",
  ),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10-11 dígitos"),
  isActive: z.boolean().default(true),
  organizationId: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  availableServices: z.array(z.string()).optional(),
});

// =====================================
// DYNAMIC VALIDATION FUNCTIONS
// =====================================

/**
 * Get validation schema for entity type
 */
export function getEntitySchema(entity: string): z.ZodSchema<any> {
  switch (entity) {
    case "patients":
      return PatientSchema;
    case "appointments":
      return AppointmentSchema;
    case "medical_records":
      return MedicalRecordSchema;
    case "prescriptions":
      return PrescriptionSchema;
    case "professionals":
      return ProfessionalSchema;
    default:
      // Fallback schema for unknown entities
      return z
        .object({
          id: z.string().optional(),
          createdAt: z.date().optional(),
          updatedAt: z.date().optional(),
        })
        .passthrough();
  }
}

/**
 * Validate data against entity schema
 */
export function validateEntityData(
  entity: string,
  data: any,
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData: any;
} {
  try {
    const schema = getEntitySchema(entity);
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedData: result.data,
      };
    } else {
      const errors = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`,
      );

      return {
        isValid: false,
        errors,
        warnings: [],
        sanitizedData: data,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      errors: ["Erro na validação do esquema"],
      warnings: [],
      sanitizedData: data,
    };
  }
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * CPF validation algorithm
 */
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[10])) return false;

  return true;
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// =====================================
// UTILITY TYPES
// =====================================

export type Patient = z.infer<typeof PatientSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;
export type Prescription = z.infer<typeof PrescriptionSchema>;
export type Professional = z.infer<typeof ProfessionalSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Address = z.infer<typeof AddressSchema>;
