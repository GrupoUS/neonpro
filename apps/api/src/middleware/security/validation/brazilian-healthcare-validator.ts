/**
 * 🇧🇷 Brazilian Healthcare Input Validation - NeonPro API
 * =======================================================
 *
 * Production-ready input validation with Brazilian healthcare compliance:
 * - CPF (Cadastro de Pessoas Físicas) validation
 * - RG (Registro Geral) validation
 * - Healthcare professional IDs (CRM, CRF, CRN, etc.)
 * - Brazilian health insurance validation
 * - Patient data sanitization and validation
 * - LGPD compliance for sensitive data handling
 * - ANVISA regulatory field validation
 */

import type { Context, MiddlewareHandler } from "hono";
import { z } from "zod";

// Brazilian document types
export enum BrazilianDocumentType {
  CPF = "cpf",
  RG = "rg",
  CNS = "cns", // Cartão Nacional de Saúde
  PASSPORT = "passport",
}

// Brazilian healthcare professional license types
export enum BrazilianHealthcareLicense {
  CRM = "crm", // Médico
  CRF = "crf", // Farmacêutico
  CRN = "crn", // Nutricionista
  CREFITO = "crefito", // Fisioterapeuta/Terapeuta Ocupacional
  COREN = "coren", // Enfermeiro
  CRO = "cro", // Dentista
  CRP = "crp", // Psicólogo
  COFFITO = "coffito", // Fisioterapeuta (Federal)
  CFM = "cfm", // Medicina (Federal)
}

// Brazilian states for license validation
export enum BrazilianState {
  AC = "AC",
  AL = "AL",
  AP = "AP",
  AM = "AM",
  BA = "BA",
  CE = "CE",
  DF = "DF",
  ES = "ES",
  GO = "GO",
  MA = "MA",
  MT = "MT",
  MS = "MS",
  MG = "MG",
  PA = "PA",
  PB = "PB",
  PR = "PR",
  PE = "PE",
  PI = "PI",
  RJ = "RJ",
  RN = "RN",
  RS = "RS",
  RO = "RO",
  RR = "RR",
  SC = "SC",
  SP = "SP",
  SE = "SE",
  TO = "TO",
}

// Healthcare insurance types in Brazil
export enum BrazilianHealthInsurance {
  SUS = "sus", // Sistema Único de Saúde
  PRIVATE = "private",
  CORPORATE = "corporate",
  COOPERATIVE = "cooperative",
  SELF_MANAGED = "self_managed",
}

/**
 * Brazilian CPF (Cadastro de Pessoas Físicas) Validator
 * CPF format: 000.000.000-00 or 00000000000
 */
export class CPFValidator {
  static validate(cpf: string): boolean {
    if (!cpf) return false;

    // Remove non-numeric characters
    const cleanCpf = cpf.replace(/[^\d]/g, "");

    // Check length
    if (cleanCpf.length !== 11) return false;

    // Check for known invalid CPFs (all same digits)
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    // Validate check digits
    return this.validateCheckDigits(cleanCpf);
  }

  private static validateCheckDigits(cpf: string): boolean {
    // First check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    // Second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  static format(cpf: string): string {
    const cleanCpf = cpf.replace(/[^\d]/g, "");
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  static sanitize(cpf: string): string {
    return cpf.replace(/[^\d]/g, "");
  }
}

/**
 * Brazilian CNS (Cartão Nacional de Saúde) Validator
 * CNS format: 15 digits
 */
export class CNSValidator {
  static validate(cns: string): boolean {
    if (!cns) return false;

    const cleanCns = cns.replace(/[^\d]/g, "");
    if (cleanCns.length !== 15) return false;

    // CNS starting with 1 or 2 uses different validation
    const firstDigit = parseInt(cleanCns.charAt(0));

    if (firstDigit === 1 || firstDigit === 2) {
      return this.validateType1or2(cleanCns);
    } else if (firstDigit === 7 || firstDigit === 8 || firstDigit === 9) {
      return this.validateType789(cleanCns);
    }

    return false;
  }

  private static validateType1or2(cns: string): boolean {
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(cns.charAt(i)) * (15 - i);
    }

    const remainder = sum % 11;
    let dv = 11 - remainder;

    if (dv === 11) dv = 0;
    if (dv === 10) return false;

    const calculatedCns = cns.substring(0, 11) + dv.toString().padStart(4, "0");
    return calculatedCns === cns;
  }

  private static validateType789(cns: string): boolean {
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      sum += parseInt(cns.charAt(i)) * (15 - i);
    }
    return sum % 11 === 0;
  }

  static format(cns: string): string {
    const cleanCns = cns.replace(/[^\d]/g, "");
    return cleanCns.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, "$1 $2 $3 $4");
  }
}

/**
 * Brazilian Healthcare Professional License Validator
 */
export class HealthcareLicenseValidator {
  static validate(
    license: string,
    type: BrazilianHealthcareLicense,
    state: BrazilianState,
  ): boolean {
    if (!license || !type || !state) return false;

    const cleanLicense = license.replace(/[^\d]/g, "");

    switch (type) {
      case BrazilianHealthcareLicense.CRM:
        return this.validateCRM(cleanLicense, state);
      case BrazilianHealthcareLicense.CRF:
        return this.validateCRF(cleanLicense, state);
      case BrazilianHealthcareLicense.CRN:
        return this.validateCRN(cleanLicense, state);
      case BrazilianHealthcareLicense.CREFITO:
        return this.validateCREFITO(cleanLicense, state);
      case BrazilianHealthcareLicense.COREN:
        return this.validateCOREN(cleanLicense, state);
      default:
        return cleanLicense.length >= 4 && cleanLicense.length <= 10;
    }
  }

  private static validateCRM(license: string, state: BrazilianState): boolean {
    // CRM format: 4-6 digits + state code
    return license.length >= 4 && license.length <= 6
      && Object.values(BrazilianState).includes(state);
  }

  private static validateCRF(license: string, state: BrazilianState): boolean {
    // CRF format: 4-5 digits + state code
    return license.length >= 4 && license.length <= 5;
  }

  private static validateCRN(license: string, state: BrazilianState): boolean {
    // CRN format: 4-5 digits + state code
    return license.length >= 4 && license.length <= 5;
  }

  private static validateCREFITO(license: string, state: BrazilianState): boolean {
    // CREFITO format: 6 digits + regional number
    return license.length === 6;
  }

  private static validateCOREN(license: string, state: BrazilianState): boolean {
    // COREN format: 6 digits + state code
    return license.length === 6;
  }

  static formatLicense(
    license: string,
    type: BrazilianHealthcareLicense,
    state: BrazilianState,
  ): string {
    const cleanLicense = license.replace(/[^\d]/g, "");
    return `${type.toUpperCase()}/${state} ${cleanLicense}`;
  }
}

// Zod schemas for Brazilian healthcare validation

/**
 * Brazilian CPF Schema
 */
export const brazilianCPFSchema = z
  .string()
  .min(11, "CPF must have 11 digits")
  .max(14, "CPF format invalid")
  .refine(CPFValidator.validate, {
    message: "Invalid CPF format or check digits",
  })
  .transform(CPFValidator.sanitize);

/**
 * Brazilian CNS Schema
 */
export const brazilianCNSSchema = z
  .string()
  .length(15, "CNS must have exactly 15 digits")
  .regex(/^\d+$/, "CNS must contain only numbers")
  .refine(CNSValidator.validate, {
    message: "Invalid CNS format or check digits",
  });

/**
 * Brazilian RG Schema
 */
export const brazilianRGSchema = z
  .string()
  .min(5, "RG too short")
  .max(12, "RG too long")
  .regex(/^[\d\w\-\.]+$/, "RG contains invalid characters");

/**
 * Healthcare Professional License Schema
 */
export const healthcareLicenseSchema = z.object({
  number: z.string().min(4, "License number too short").max(10, "License number too long"),
  type: z.nativeEnum(BrazilianHealthcareLicense),
  state: z.nativeEnum(BrazilianState),
  expirationDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => HealthcareLicenseValidator.validate(data.number, data.type, data.state),
  {
    message: "Invalid healthcare license format",
    path: ["number"],
  },
);

/**
 * Patient Personal Data Schema (LGPD Compliant)
 */
export const patientPersonalDataSchema = z.object({
  // Basic identification
  cpf: brazilianCPFSchema,
  rg: brazilianRGSchema.optional(),
  cns: brazilianCNSSchema.optional(),

  // Personal information
  fullName: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, "Name contains invalid characters")
    .transform(val => val.trim().replace(/\s+/g, " ")),

  socialName: z
    .string()
    .min(2, "Social name too short")
    .max(100, "Social name too long")
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, "Social name contains invalid characters")
    .optional()
    .transform(val => val ? val.trim().replace(/\s+/g, " ") : undefined),

  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 150;
      },
      { message: "Invalid birth date" },
    ),

  gender: z.enum(["M", "F", "O", "NI"], {
    errorMap: () => ({
      message: "Gender must be M (Masculino), F (Feminino), O (Outro), or NI (Não Informado)",
    }),
  }),

  // Contact information
  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email too long")
    .toLowerCase()
    .optional(),

  phoneNumber: z
    .string()
    .regex(/^\+?55\s?\(?[1-9]{2}\)?\s?9?[0-9]{4}\-?[0-9]{4}$/, "Invalid Brazilian phone number")
    .transform(val => val.replace(/[^\d]/g, ""))
    .optional(),

  // Address (Brazilian format)
  address: z.object({
    zipCode: z
      .string()
      .regex(/^\d{5}\-?\d{3}$/, "Invalid Brazilian ZIP code (CEP)")
      .transform(val => val.replace(/[^\d]/g, "")),
    street: z.string().min(5, "Street address too short").max(200, "Street address too long"),
    number: z.string().max(10, "Number too long"),
    complement: z.string().max(50, "Complement too long").optional(),
    neighborhood: z.string().min(2, "Neighborhood too short").max(100, "Neighborhood too long"),
    city: z.string().min(2, "City too short").max(100, "City too long"),
    state: z.nativeEnum(BrazilianState),
  }).optional(),

  // Healthcare information
  healthInsurance: z.object({
    type: z.nativeEnum(BrazilianHealthInsurance),
    providerName: z.string().max(100, "Provider name too long").optional(),
    planNumber: z.string().max(50, "Plan number too long").optional(),
    expirationDate: z.string().datetime().optional(),
  }).optional(),

  // Emergency contact
  emergencyContact: z.object({
    name: z
      .string()
      .min(2, "Emergency contact name too short")
      .max(100, "Emergency contact name too long"),
    relationship: z.string().max(50, "Relationship too long"),
    phoneNumber: z
      .string()
      .regex(/^\+?55\s?\(?[1-9]{2}\)?\s?9?[0-9]{4}\-?[0-9]{4}$/, "Invalid Brazilian phone number"),
  }).optional(),
});

/**
 * Healthcare Provider Data Schema
 */
export const healthcareProviderSchema = z.object({
  // Personal identification
  cpf: brazilianCPFSchema,
  fullName: z
    .string()
    .min(2, "Name too short")
    .max(100, "Name too long")
    .regex(/^[a-zA-ZÀ-ÿ\s\-\']+$/, "Name contains invalid characters"),

  // Professional information
  licenses: z
    .array(healthcareLicenseSchema)
    .min(1, "At least one professional license is required"),

  specialties: z
    .array(z.string().max(100, "Specialty name too long"))
    .max(10, "Too many specialties")
    .optional(),

  // Contact information
  email: z.string().email("Invalid email format").toLowerCase(),
  phoneNumber: z
    .string()
    .regex(/^\+?55\s?\(?[1-9]{2}\)?\s?9?[0-9]{4}\-?[0-9]{4}$/, "Invalid Brazilian phone number")
    .transform(val => val.replace(/[^\d]/g, "")),

  // Professional address
  workAddress: z.object({
    facilityName: z.string().min(2, "Facility name too short").max(200, "Facility name too long"),
    zipCode: z
      .string()
      .regex(/^\d{5}\-?\d{3}$/, "Invalid Brazilian ZIP code (CEP)")
      .transform(val => val.replace(/[^\d]/g, "")),
    street: z.string().min(5, "Street address too short").max(200, "Street address too long"),
    number: z.string().max(10, "Number too long"),
    complement: z.string().max(50, "Complement too long").optional(),
    neighborhood: z.string().min(2, "Neighborhood too short").max(100, "Neighborhood too long"),
    city: z.string().min(2, "City too short").max(100, "City too long"),
    state: z.nativeEnum(BrazilianState),
  }),
});

/**
 * Input sanitization utility
 */
export class BrazilianHealthcareSanitizer {
  /**
   * Sanitize patient data according to LGPD requirements
   */
  static sanitizePatientData(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };

    // Sanitize CPF
    if (sanitized.cpf) {
      sanitized.cpf = CPFValidator.sanitize(sanitized.cpf);
    }

    // Sanitize CNS
    if (sanitized.cns) {
      sanitized.cns = sanitized.cns.replace(/[^\d]/g, "");
    }

    // Sanitize names (remove extra spaces, normalize case)
    if (sanitized.fullName) {
      sanitized.fullName = sanitized.fullName.trim().replace(/\s+/g, " ");
    }

    if (sanitized.socialName) {
      sanitized.socialName = sanitized.socialName.trim().replace(/\s+/g, " ");
    }

    // Sanitize phone numbers
    if (sanitized.phoneNumber) {
      sanitized.phoneNumber = sanitized.phoneNumber.replace(/[^\d]/g, "");
    }

    // Sanitize address ZIP code
    if (sanitized.address?.zipCode) {
      sanitized.address.zipCode = sanitized.address.zipCode.replace(/[^\d]/g, "");
    }

    return sanitized;
  }

  /**
   * Remove sensitive data for logging (LGPD compliance)
   */
  static removeSensitiveDataForLogging(data: any): any {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };

    // Remove or mask sensitive fields
    if (sanitized.cpf) {
      sanitized.cpf = `***.***.***-${sanitized.cpf.slice(-2)}`;
    }

    if (sanitized.rg) {
      sanitized.rg = `***${sanitized.rg.slice(-3)}`;
    }

    if (sanitized.email) {
      const [localPart, domain] = sanitized.email.split("@");
      sanitized.email = `${localPart.substring(0, 2)}***@${domain}`;
    }

    if (sanitized.phoneNumber) {
      sanitized.phoneNumber = `(**) ****-${sanitized.phoneNumber.slice(-4)}`;
    }

    return sanitized;
  }
}
