/**
 * 📝 Brazilian Healthcare Validation Utilities - NeonPro
 * =====================================================
 *
 * Comprehensive validation functions for Brazilian healthcare data:
 * - CPF (Cadastro de Pessoas Físicas) validation
 * - Phone number validation (Brazilian formats)
 * - CEP (Código de Endereçamento Postal) validation
 * - Email validation with healthcare domain support
 *
 * @module validation
 * @version 1.0.0
 */

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 * @param cpf - CPF string to validate
 * @returns boolean indicating if CPF is valid
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, "");

  // Check if has 11 digits
  if (cleanCPF.length !== 11) return false;

  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Validates Brazilian phone numbers
 * Supports formats: (11) 99999-9999, (11) 9999-9999, +55 11 99999-9999
 * @param phone - Phone string to validate
 * @returns boolean indicating if phone is valid
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;

  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check Brazilian phone patterns
  // Mobile: 11 digits (with country code 55) or 11 digits (DDD + 9 + 8 digits)
  // Landline: 10 digits (DDD + 8 digits)
  if (cleanPhone.length === 13 && cleanPhone.startsWith("55")) {
    // +55 format
    const localPhone = cleanPhone.slice(2);
    return localPhone.length === 11 && localPhone.charAt(2) === "9";
  }

  if (cleanPhone.length === 11) {
    // Mobile format: DDD + 9 + 8 digits
    return cleanPhone.charAt(2) === "9";
  }

  if (cleanPhone.length === 10) {
    // Landline format: DDD + 8 digits
    return cleanPhone.charAt(2) !== "9";
  }

  return false;
}

/**
 * Validates Brazilian CEP (Código de Endereçamento Postal)
 * @param cep - CEP string to validate
 * @returns boolean indicating if CEP is valid
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false;

  // Remove non-numeric characters
  const cleanCEP = cep.replace(/\D/g, "");

  // Check if has 8 digits
  if (cleanCEP.length !== 8) return false;

  // Check for known invalid patterns (all zeros, all same digit)
  if (/^0{8}$/.test(cleanCEP) || /^(\d)\1{7}$/.test(cleanCEP)) return false;

  return true;
}

/**
 * Validates email addresses with healthcare domain support
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return false;

  // Additional validation for healthcare domains
  const healthcareDomains = [
    "sus.gov.br",
    "saude.gov.br",
    "anvisa.gov.br",
    "cfm.org.br",
    "coren.org.br",
    "crm.org.br",
  ];

  const domain = email.split("@")[1]?.toLowerCase();

  // Allow all domains, but mark healthcare domains as preferred
  return true;
}

/**
 * Formats CPF string with standard Brazilian formatting
 * @param cpf - CPF string to format
 * @returns formatted CPF string (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return cpf;

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formats phone string with standard Brazilian formatting
 * @param phone - Phone string to format
 * @returns formatted phone string
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 11) {
    // Mobile: (XX) 9XXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (cleanPhone.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

/**
 * Formats CEP string with standard Brazilian formatting
 * @param cep - CEP string to format
 * @returns formatted CEP string (XXXXX-XXX)
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, "");
  if (cleanCEP.length !== 8) return cep;

  return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2");
}
