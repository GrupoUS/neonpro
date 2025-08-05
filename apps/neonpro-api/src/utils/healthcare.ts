/**
 * Healthcare-specific utility functions for NeonPro
 * Compliant with ANS, ANVISA, and CFM regulations
 */

/**
 * Generate ANS-compliant medical record number
 * Format: [Prefix][8-digit-sequence]
 * Example: NP12345678
 */
export function generateMedicalRecordNumber(): string {
  const prefix = "NP"; // NeonPro prefix
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  return `${prefix}${timestamp}`;
}

/**
 * Validate Brazilian CPF number
 * @param cpf CPF number in format XXX.XXX.XXX-XX
 */
export function validateCPF(cpf: string): boolean {
  // Remove dots and dashes
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  // Check if it has 11 digits
  if (cleanCPF.length !== 11) return false;

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  let remainder;

  // Validate first check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * Format Brazilian CEP (postal code)
 * @param cep CEP number
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/[^\d]/g, "");
  if (cleanCEP.length !== 8) return cep;
  return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
}

/**
 * Validate Brazilian phone number
 * @param phone Phone number
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  // Brazilian phone: 2-3 digits (country code) + 2 digits (area code) + 8-9 digits (number)
  return /^55\d{2}[6789]\d{8}$/.test(cleanPhone) || /^55\d{2}[2-5]\d{7}$/.test(cleanPhone);
}

/**
 * Generate secure patient identifier for audit logs
 * @param patientId Original patient ID
 */
export function generateSecurePatientId(patientId: string): string {
  // Create a hash of the patient ID for audit logs (LGPD compliance)
  const crypto = require("node:crypto");
  return crypto.createHash("sha256").update(patientId).digest("hex").slice(0, 16);
}

/**
 * Calculate patient age from date of birth
 * @param dateOfBirth Date of birth in YYYY-MM-DD format
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate healthcare professional license number (CRM format)
 * @param licenseNumber License number
 * @param state Brazilian state code
 */
export function validateCRM(licenseNumber: string, state: string): boolean {
  // CRM format: state code + numbers (varies by state)
  const cleanLicense = licenseNumber.replace(/[^\d]/g, "");
  const statePattern = new RegExp(`^${state.toUpperCase()}\\d{4,6}$`);

  return statePattern.test(`${state.toUpperCase()}${cleanLicense}`);
}

/**
 * Generate LGPD-compliant data retention date
 * @param category Data category ('medical' | 'personal' | 'administrative')
 */
export function calculateDataRetentionDate(
  category: "medical" | "personal" | "administrative",
): Date {
  const now = new Date();

  switch (category) {
    case "medical":
      // Medical records: 20 years (CFM Resolution)
      return new Date(now.getFullYear() + 20, now.getMonth(), now.getDate());
    case "personal":
      // Personal data: 5 years after last interaction (LGPD)
      return new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
    case "administrative":
      // Administrative data: 10 years (general business requirement)
      return new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
  }
}

/**
 * Validate Brazilian CNPJ number
 * @param cnpj CNPJ number in format XX.XXX.XXX/XXXX-XX
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validate check digits
  let sum = 0;
  let remainder;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // First check digit
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * (weights1[i] || 0);
  }
  remainder = sum % 11;
  remainder = remainder < 2 ? 0 : 11 - remainder;
  if (remainder !== parseInt(cleanCNPJ.charAt(12))) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * (weights2[i] || 0);
  }
  remainder = sum % 11;
  remainder = remainder < 2 ? 0 : 11 - remainder;
  if (remainder !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
}

/**
 * Calculate Brazilian taxes for healthcare services
 * @param amount Base amount
 * @param serviceType Type of healthcare service
 */
export function calculateBrazilianTaxes(
  amount: number,
  _serviceType: "consultation" | "procedure" | "medication" | "other" = "other",
): {
  amount: number;
  taxes: {
    issQn: number;
    cofins: number;
    csll: number;
    irpj: number;
    pis: number;
    total: number;
  };
  totalWithTaxes: number;
} {
  const taxes = {
    issQn: amount * 0.02, // 2% ISS for healthcare services
    cofins: amount * 0.0076, // 0.76% COFINS
    csll: amount * 0.01, // 1% CSLL
    irpj: amount * 0.0025, // 0.25% IRPJ
    pis: amount * 0.0165, // 1.65% PIS
    total: 0,
  };

  taxes.total = taxes.issQn + taxes.cofins + taxes.csll + taxes.irpj + taxes.pis;

  return {
    amount,
    taxes,
    totalWithTaxes: amount + taxes.total,
  };
}

/**
 * Format currency in Brazilian Real
 * @param amount Amount to format
 * @param currency Currency code (default: BRL)
 */
export function formatCurrency(amount: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Sanitize healthcare data for logging (remove PHI)
 * @param data Data object to sanitize
 */
export function sanitizeHealthcareData(data: any): any {
  const sensitiveFields = ["cpf", "rg", "dateOfBirth", "phone", "email", "address", "ssn"];
  const sanitized = { ...data };

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      if (typeof sanitized[field] === "string") {
        sanitized[field] = "*".repeat(sanitized[field].length);
      } else {
        sanitized[field] = "[REDACTED]";
      }
    }
  });

  return sanitized;
}
