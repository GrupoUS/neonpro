"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialDataSchema = exports.treatmentSchema = exports.medicalAuditSchema = exports.consentSchema = exports.medicalInfoSchema = exports.personalDataSchema = exports.medicalEmailSchema = exports.phoneSchema = exports.cpfSchema = void 0;
var zod_1 = require("zod");
// Schema para CPF brasileiro
exports.cpfSchema = zod_1.z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos')
    .refine(function (cpf) {
    // Remove pontos e traços
    var numbers = cpf.replace(/[.-]/g, '');
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11)
        return false;
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers))
        return false;
    // Validação do CPF
    var sum = 0;
    for (var i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i);
    }
    var remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(numbers[9]))
        return false;
    sum = 0;
    for (var i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(numbers[10]))
        return false;
    return true;
}, 'CPF inválido');
// Schema para telefone brasileiro
exports.phoneSchema = zod_1.z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/, 'Telefone deve estar no formato (11) 99999-9999');
// Schema para email médico
exports.medicalEmailSchema = zod_1.z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório');
// Schema para dados pessoais básicos
exports.personalDataSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
    email: exports.medicalEmailSchema,
    phone: exports.phoneSchema,
    cpf: exports.cpfSchema,
    birthDate: zod_1.z.string().refine(function (date) {
        var birthDate = new Date(date);
        var today = new Date();
        var age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 120;
    }, 'Data de nascimento inválida'),
    address: zod_1.z.object({
        street: zod_1.z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
        number: zod_1.z.string().min(1, 'Número é obrigatório'),
        complement: zod_1.z.string().optional(),
        neighborhood: zod_1.z.string().min(2, 'Bairro é obrigatório'),
        city: zod_1.z.string().min(2, 'Cidade é obrigatória'),
        state: zod_1.z.string().length(2, 'Estado deve ter 2 caracteres'),
        zipCode: zod_1.z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000')
    })
});
// Schema para informações médicas sensíveis
exports.medicalInfoSchema = zod_1.z.object({
    allergies: zod_1.z.array(zod_1.z.string()).default([]),
    medications: zod_1.z.array(zod_1.z.string()).default([]),
    medicalHistory: zod_1.z.array(zod_1.z.string()).default([]),
    emergencyContact: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Nome do contato de emergência é obrigatório'),
        phone: exports.phoneSchema,
        relationship: zod_1.z.string().min(2, 'Parentesco é obrigatório')
    }),
    healthInsurance: zod_1.z.object({
        provider: zod_1.z.string().optional(),
        planNumber: zod_1.z.string().optional(),
        validUntil: zod_1.z.string().optional()
    }).optional()
});
// Schema para consentimento LGPD
exports.consentSchema = zod_1.z.object({
    dataProcessing: zod_1.z.boolean().refine(function (val) { return val === true; }, 'Consentimento para processamento de dados é obrigatório'),
    marketingCommunication: zod_1.z.boolean().default(false),
    dataSharing: zod_1.z.boolean().default(false),
    consentDate: zod_1.z.date().default(function () { return new Date(); }),
    ipAddress: zod_1.z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido').optional(),
    userAgent: zod_1.z.string().optional()
});
// Schema para auditoria médica
exports.medicalAuditSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['create', 'read', 'update', 'delete', 'export']),
    resourceType: zod_1.z.enum(['patient', 'appointment', 'treatment', 'medical_record']),
    resourceId: zod_1.z.string(),
    timestamp: zod_1.z.date().default(function () { return new Date(); }),
    ipAddress: zod_1.z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'IP inválido'),
    userAgent: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.any()).optional()
});
// Schema para dados de tratamento estético
exports.treatmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(2, 'Nome do tratamento é obrigatório'),
    category: zod_1.z.enum(['facial', 'corporal', 'capilar', 'preventivo', 'reparador']),
    description: zod_1.z.string().optional(),
    duration: zod_1.z.number().min(15, 'Duração mínima de 15 minutos').max(480, 'Duração máxima de 8 horas'),
    price: zod_1.z.number().min(0, 'Preço deve ser positivo'),
    requiresConsent: zod_1.z.boolean().default(true),
    contraindications: zod_1.z.array(zod_1.z.string()).default([]),
    postTreatmentCare: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedAt: zod_1.z.date().default(function () { return new Date(); })
});
// Schema para validação de dados financeiros
exports.financialDataSchema = zod_1.z.object({
    amount: zod_1.z.number().min(0.01, 'Valor deve ser maior que zero'),
    currency: zod_1.z.string().length(3, 'Moeda deve ter 3 caracteres').default('BRL'),
    paymentMethod: zod_1.z.enum(['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer']),
    installments: zod_1.z.number().min(1).max(12).default(1),
    dueDate: zod_1.z.date().optional(),
    description: zod_1.z.string().min(5, 'Descrição é obrigatória'),
    category: zod_1.z.enum(['treatment', 'consultation', 'product', 'other']),
    taxId: zod_1.z.string().optional() // Para nota fiscal
});
