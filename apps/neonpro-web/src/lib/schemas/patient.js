Object.defineProperty(exports, "__esModule", { value: true });
exports.patientEmergencyDataSchema =
  exports.treatmentConsentSchema =
  exports.patientMedicalHistorySchema =
  exports.patientSearchSchema =
  exports.patientFiltersSchema =
  exports.updatePatientSchema =
  exports.patientSchema =
    void 0;
var zod_1 = require("zod");
var medical_1 = require("./medical");
// Schema completo para paciente
exports.patientSchema = zod_1.z.object({
  id: zod_1.z.string().uuid().optional(),
  // Dados pessoais (obrigatórios)
  personalData: medical_1.personalDataSchema,
  // Informações médicas (opcionais para criação, obrigatórias para tratamento)
  medicalInfo: medical_1.medicalInfoSchema.optional(),
  // Consentimento LGPD (obrigatório)
  consent: medical_1.consentSchema,
  // Status do paciente
  status: zod_1.z.enum(["active", "inactive", "blocked"]).default("active"),
  // Preferências do paciente
  preferences: zod_1.z
    .object({
      preferredContactMethod: zod_1.z.enum(["email", "phone", "whatsapp"]).default("email"),
      reminderEnabled: zod_1.z.boolean().default(true),
      marketingOptIn: zod_1.z.boolean().default(false),
      language: zod_1.z.enum(["pt-BR", "en-US"]).default("pt-BR"),
    })
    .default({}),
  // Informações de relacionamento com a clínica
  clinicInfo: zod_1.z
    .object({
      registrationDate: zod_1.z.date().default(() => new Date()),
      lastVisit: zod_1.z.date().optional(),
      totalVisits: zod_1.z.number().min(0).default(0),
      totalSpent: zod_1.z.number().min(0).default(0),
      referredBy: zod_1.z.string().optional(),
      notes: zod_1.z.string().max(1000, "Notas não podem exceder 1000 caracteres").optional(),
    })
    .default({}),
  // Metadados
  createdAt: zod_1.z.date().default(() => new Date()),
  updatedAt: zod_1.z.date().default(() => new Date()),
  createdBy: zod_1.z.string().uuid(),
  updatedBy: zod_1.z.string().uuid().optional(),
});
// Schema para atualização de paciente (todos os campos opcionais exceto ID)
exports.updatePatientSchema = exports.patientSchema.partial().extend({
  id: zod_1.z.string().uuid(),
  updatedAt: zod_1.z.date().default(() => new Date()),
  updatedBy: zod_1.z.string().uuid(),
});
// Schema para listagem de pacientes com filtros
exports.patientFiltersSchema = zod_1.z.object({
  status: zod_1.z.enum(["active", "inactive", "blocked"]).optional(),
  search: zod_1.z.string().optional(), // Busca por nome, email ou CPF
  registrationDateFrom: zod_1.z.date().optional(),
  registrationDateTo: zod_1.z.date().optional(),
  lastVisitFrom: zod_1.z.date().optional(),
  lastVisitTo: zod_1.z.date().optional(),
  page: zod_1.z.number().min(1).default(1),
  limit: zod_1.z.number().min(1).max(100).default(20),
  sortBy: zod_1.z.enum(["name", "registrationDate", "lastVisit", "totalSpent"]).default("name"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("asc"),
});
// Schema para validação de busca de pacientes
exports.patientSearchSchema = zod_1.z.object({
  query: zod_1.z.string().min(2, "Busca deve ter pelo menos 2 caracteres"),
  searchFields: zod_1.z
    .array(zod_1.z.enum(["name", "email", "cpf", "phone"]))
    .default(["name", "email"]),
  limit: zod_1.z.number().min(1).max(50).default(10),
});
// Schema para histórico médico do paciente
exports.patientMedicalHistorySchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  entries: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string().uuid().optional(),
      date: zod_1.z.date(),
      type: zod_1.z.enum(["consultation", "treatment", "procedure", "follow_up", "emergency"]),
      title: zod_1.z.string().min(5, "Título é obrigatório"),
      description: zod_1.z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
      treatmentId: zod_1.z.string().uuid().optional(),
      professionalId: zod_1.z.string().uuid(),
      attachments: zod_1.z
        .array(
          zod_1.z.object({
            id: zod_1.z.string().uuid(),
            name: zod_1.z.string(),
            type: zod_1.z.enum(["image", "document", "video"]),
            url: zod_1.z.string().url(),
            uploadedAt: zod_1.z.date().default(() => new Date()),
          }),
        )
        .default([]),
      createdAt: zod_1.z.date().default(() => new Date()),
      updatedAt: zod_1.z.date().default(() => new Date()),
    }),
  ),
});
// Schema para consentimento específico de tratamento
exports.treatmentConsentSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  treatmentId: zod_1.z.string().uuid(),
  consentType: zod_1.z.enum(["informed_consent", "photo_consent", "data_sharing", "marketing"]),
  granted: zod_1.z.boolean(),
  consentDate: zod_1.z.date().default(() => new Date()),
  documnetPath: zod_1.z.string().url().optional(), // PDF do consentimento assinado
  witnessId: zod_1.z.string().uuid().optional(), // Profissional que testemunhou
  notes: zod_1.z.string().max(500).optional(),
  validUntil: zod_1.z.date().optional(), // Para consentimentos temporários
  revoked: zod_1.z.boolean().default(false),
  revokedAt: zod_1.z.date().optional(),
  revokedReason: zod_1.z.string().optional(),
});
// Schema para dados de emergência do paciente
exports.patientEmergencyDataSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  bloodType: zod_1.z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  allergies: zod_1.z
    .array(
      zod_1.z.object({
        allergen: zod_1.z.string(),
        severity: zod_1.z.enum(["mild", "moderate", "severe"]),
        reaction: zod_1.z.string(),
        verifiedDate: zod_1.z.date().optional(),
      }),
    )
    .default([]),
  medications: zod_1.z
    .array(
      zod_1.z.object({
        name: zod_1.z.string(),
        dosage: zod_1.z.string(),
        frequency: zod_1.z.string(),
        prescribedBy: zod_1.z.string(),
        startDate: zod_1.z.date(),
        endDate: zod_1.z.date().optional(),
      }),
    )
    .default([]),
  conditions: zod_1.z
    .array(
      zod_1.z.object({
        condition: zod_1.z.string(),
        severity: zod_1.z.enum(["mild", "moderate", "severe"]),
        diagnosedDate: zod_1.z.date().optional(),
        notes: zod_1.z.string().optional(),
      }),
    )
    .default([]),
  emergencyContacts: zod_1.z
    .array(
      zod_1.z.object({
        name: zod_1.z.string(),
        relationship: zod_1.z.string(),
        phone: zod_1.z.string(),
        isPrimary: zod_1.z.boolean().default(false),
      }),
    )
    .min(1, "Pelo menos um contato de emergência é obrigatório"),
});
