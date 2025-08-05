"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var schemas_1 = require("@/lib/schemas");
(0, globals_1.describe)('Medical Schemas Validation', function () {
    (0, globals_1.describe)('CPF Validation', function () {
        (0, globals_1.test)('should validate correct CPF format with dots and dash', function () {
            var validCPF = '123.456.789-09';
            var result = schemas_1.cpfSchema.safeParse(validCPF);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should validate correct CPF format with numbers only', function () {
            var validCPF = '12345678909';
            var result = schemas_1.cpfSchema.safeParse(validCPF);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should reject invalid CPF format', function () {
            var invalidCPF = '123.456.789';
            var result = schemas_1.cpfSchema.safeParse(invalidCPF);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.test)('should reject CPF with all equal digits', function () {
            var invalidCPF = '111.111.111-11';
            var result = schemas_1.cpfSchema.safeParse(invalidCPF);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Phone Validation', function () {
        (0, globals_1.test)('should validate correct phone format with parentheses', function () {
            var validPhone = '(11) 99999-9999';
            var result = schemas_1.phoneSchema.safeParse(validPhone);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should validate correct phone format with numbers only', function () {
            var validPhone = '11999999999';
            var result = schemas_1.phoneSchema.safeParse(validPhone);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should reject invalid phone format', function () {
            var invalidPhone = '(11) 9999-999';
            var result = schemas_1.phoneSchema.safeParse(invalidPhone);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Personal Data Validation', function () {
        var validPersonalData = {
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999',
            cpf: '123.456.789-09',
            birthDate: '1990-01-01',
            address: {
                street: 'Rua das Flores, 123',
                number: '123',
                neighborhood: 'Centro',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567'
            }
        };
        (0, globals_1.test)('should validate complete personal data', function () {
            var result = schemas_1.personalDataSchema.safeParse(validPersonalData);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should reject incomplete personal data', function () {
            var incompleteData = __assign({}, validPersonalData);
            delete incompleteData.email;
            var result = schemas_1.personalDataSchema.safeParse(incompleteData);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.test)('should reject invalid birth date', function () {
            var invalidData = __assign(__assign({}, validPersonalData), { birthDate: '2030-01-01' // Future date
             });
            var result = schemas_1.personalDataSchema.safeParse(invalidData);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Treatment Schema Validation', function () {
        var validTreatment = {
            name: 'Botox Facial',
            category: 'facial',
            description: 'Aplicação de toxina botulínica',
            duration: 60,
            price: 500.00,
            requiresConsent: true,
            contraindications: ['Gravidez', 'Amamentação'],
            postTreatmentCare: ['Evitar exercícios por 24h']
        };
        (0, globals_1.test)('should validate correct treatment data', function () {
            var result = schemas_1.treatmentSchema.safeParse(validTreatment);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should reject treatment with invalid duration', function () {
            var invalidTreatment = __assign(__assign({}, validTreatment), { duration: 10 // Less than minimum 15 minutes
             });
            var result = schemas_1.treatmentSchema.safeParse(invalidTreatment);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.test)('should reject treatment with negative price', function () {
            var invalidTreatment = __assign(__assign({}, validTreatment), { price: -100 });
            var result = schemas_1.treatmentSchema.safeParse(invalidTreatment);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Financial Data Validation', function () {
        var validFinancialData = {
            amount: 500.00,
            currency: 'BRL',
            paymentMethod: 'credit_card',
            installments: 3,
            description: 'Tratamento Botox Facial',
            category: 'treatment'
        };
        (0, globals_1.test)('should validate correct financial data', function () {
            var result = schemas_1.financialDataSchema.safeParse(validFinancialData);
            (0, globals_1.expect)(result.success).toBe(true);
        });
        (0, globals_1.test)('should reject zero or negative amount', function () {
            var invalidData = __assign(__assign({}, validFinancialData), { amount: 0 });
            var result = schemas_1.financialDataSchema.safeParse(invalidData);
            (0, globals_1.expect)(result.success).toBe(false);
        });
        (0, globals_1.test)('should reject invalid installments', function () {
            var invalidData = __assign(__assign({}, validFinancialData), { installments: 15 // More than maximum 12
             });
            var result = schemas_1.financialDataSchema.safeParse(invalidData);
            (0, globals_1.expect)(result.success).toBe(false);
        });
    });
    (0, globals_1.describe)('Utility Functions', function () {
        (0, globals_1.test)('validateData should return success for valid data', function () {
            var data = { name: 'Test', email: 'test@email.com' };
            var schema = schemas_1.personalDataSchema.pick({ name: true, email: true });
            var result = (0, schemas_1.validateData)(schema, data);
            (0, globals_1.expect)(result.success).toBe(true);
            (0, globals_1.expect)(result.data).toEqual(data);
        });
        (0, globals_1.test)('validateData should return errors for invalid data', function () {
            var data = { name: '', email: 'invalid-email' };
            var schema = schemas_1.personalDataSchema.pick({ name: true, email: true });
            var result = (0, schemas_1.validateData)(schema, data);
            (0, globals_1.expect)(result.success).toBe(false);
            (0, globals_1.expect)(result.errors).toBeDefined();
            (0, globals_1.expect)(result.errors.length).toBeGreaterThan(0);
        });
    });
    (0, globals_1.describe)('Healthcare Validators', function () {
        (0, globals_1.test)('isAdult should validate adult age correctly', function () {
            var adultBirthDate = '1990-01-01';
            (0, globals_1.expect)(schemas_1.healthcareValidators.isAdult(adultBirthDate)).toBe(true);
        });
        (0, globals_1.test)('isAdult should reject minor age', function () {
            var minorBirthDate = '2010-01-01';
            (0, globals_1.expect)(schemas_1.healthcareValidators.isAdult(minorBirthDate)).toBe(false);
        });
        (0, globals_1.test)('isBusinessHours should validate business hours', function () {
            (0, globals_1.expect)(schemas_1.healthcareValidators.isBusinessHours('09:00')).toBe(true);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isBusinessHours('17:30')).toBe(true);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isBusinessHours('07:00')).toBe(false);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isBusinessHours('19:00')).toBe(false);
        });
        (0, globals_1.test)('isFutureDate should validate future dates', function () {
            var futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
            var pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
            (0, globals_1.expect)(schemas_1.healthcareValidators.isFutureDate(futureDate)).toBe(true);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isFutureDate(pastDate)).toBe(false);
        });
        (0, globals_1.test)('isValidTreatmentDuration should validate treatment duration', function () {
            (0, globals_1.expect)(schemas_1.healthcareValidators.isValidTreatmentDuration(30)).toBe(true);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isValidTreatmentDuration(120)).toBe(true);
            (0, globals_1.expect)(schemas_1.healthcareValidators.isValidTreatmentDuration(10)).toBe(false); // Too short
            (0, globals_1.expect)(schemas_1.healthcareValidators.isValidTreatmentDuration(500)).toBe(false); // Too long
        });
    });
});
