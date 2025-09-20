/**
 * Brazilian Document Validators
 * Validation utilities for CPF, CNPJ, phone numbers, and CEP
 */

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  // Check basic format
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  // Validate second check digit
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
 * Validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;

  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

  // Check basic format
  if (cleanCNPJ.length !== 14 || /^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validate first check digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;

  // Validate second check digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
}

/**
 * Validates Brazilian phone number formats
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;

  const cleanPhone = phone.replace(/[^\d]/g, "");

  // Mobile: 11 digits (2 digit area code + 9 + 8 digits)
  // Landline: 10 digits (2 digit area code + 8 digits)
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Validates Brazilian CEP (Código de Endereçamento Postal)
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false;

  const cleanCEP = cep.replace(/[^\d]/g, "");

  // CEP should have exactly 8 digits
  return cleanCEP.length === 8;
}
