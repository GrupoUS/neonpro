"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nfeDocumentSchema = exports.nfeGenerationRequestSchema = exports.taxConfigurationSchema = exports.taxCalculationRequestSchema = exports.customerInfoSchema = void 0;
var zod_1 = require("zod");
exports.customerInfoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    document: zod_1.z.string().min(11).max(14), // CPF or CNPJ
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.object({
        street: zod_1.z.string(),
        number: zod_1.z.string(),
        neighborhood: zod_1.z.string(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        zipCode: zod_1.z.string(),
        country: zod_1.z.string().default('Brasil')
    })
});
exports.taxCalculationRequestSchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    customerId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        category: zod_1.z.string(),
        taxCode: zod_1.z.string().optional()
    })),
    serviceLocation: zod_1.z.object({
        state: zod_1.z.string(),
        city: zod_1.z.string(),
        zipCode: zod_1.z.string()
    }),
    calculationType: zod_1.z.enum(['service', 'product', 'mixed'])
});
exports.taxConfigurationSchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    taxRegime: zod_1.z.enum(['simples_nacional', 'lucro_presumido', 'lucro_real']),
    issRate: zod_1.z.number().min(0).max(5), // ISS rate percentage
    pisRate: zod_1.z.number().default(0.65),
    cofinsRate: zod_1.z.number().default(3),
    csllRate: zod_1.z.number().default(1),
    irRate: zod_1.z.number().default(1.5),
    simplexNacionalRate: zod_1.z.number().optional(),
    municipalTaxId: zod_1.z.string().optional(),
    stateTaxId: zod_1.z.string().optional(),
    federalTaxId: zod_1.z.string().optional(),
    active: zod_1.z.boolean().default(true),
    updatedAt: zod_1.z.date().default(function () { return new Date(); })
});
exports.nfeGenerationRequestSchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    customerId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        total: zod_1.z.number().positive(),
        taxCode: zod_1.z.string().optional(),
        serviceCode: zod_1.z.string().optional()
    })),
    services: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        issRate: zod_1.z.number(),
        serviceCode: zod_1.z.string()
    })).optional(),
    totalAmount: zod_1.z.number().positive(),
    observations: zod_1.z.string().optional(),
    dueDate: zod_1.z.date().optional()
});
exports.nfeDocumentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    number: zod_1.z.string(),
    series: zod_1.z.string(),
    clinicId: zod_1.z.string().uuid(),
    customerId: zod_1.z.string().uuid(),
    totalAmount: zod_1.z.number(),
    taxes: zod_1.z.object({
        iss: zod_1.z.number(),
        pis: zod_1.z.number(),
        cofins: zod_1.z.number(),
        csll: zod_1.z.number(),
        ir: zod_1.z.number()
    }),
    status: zod_1.z.enum(['draft', 'pending', 'issued', 'cancelled', 'error']),
    issuedAt: zod_1.z.date().optional(),
    cancelledAt: zod_1.z.date().optional(),
    xmlContent: zod_1.z.string().optional(),
    pdfUrl: zod_1.z.string().optional(),
    verificationCode: zod_1.z.string().optional(),
    errors: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.date().default(function () { return new Date(); }),
    updatedAt: zod_1.z.date().default(function () { return new Date(); })
});
