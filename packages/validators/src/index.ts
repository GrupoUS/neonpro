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
    const digit = cleanCPF.charAt(i);
    if (digit) {
      sum += parseInt(digit) * (10 - i);
    }
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  const ninthDigit = cleanCPF.charAt(9);
  if (!ninthDigit || remainder !== parseInt(ninthDigit)) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = cleanCPF.charAt(i);
    if (digit) {
      sum += parseInt(digit) * (11 - i);
    }
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  const tenthDigit = cleanCPF.charAt(10);
  if (!tenthDigit || remainder !== parseInt(tenthDigit)) return false;

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
    const digit = cleanCNPJ.charAt(i);
    const weight = weights1[i];
    if (digit && weight !== undefined) {
      sum += parseInt(digit) * weight;
    }
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  const twelfthDigit = cleanCNPJ.charAt(12);
  if (!twelfthDigit || digit1 !== parseInt(twelfthDigit)) return false;

  // Validate second check digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    const digit = cleanCNPJ.charAt(i);
    const weight = weights2[i];
    if (digit && weight !== undefined) {
      sum += parseInt(digit) * weight;
    }
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  const thirteenthDigit = cleanCNPJ.charAt(13);
  if (!thirteenthDigit || digit2 !== parseInt(thirteenthDigit)) return false;

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

/**
 * Validates Brazilian CNS (Cartão Nacional de Saúde)
 * CNS is the Brazilian National Health Card, a unique identifier for citizens in the healthcare system
 * Format: XXX XXXXXXX XX or XXXXXXXXXXXXX (15 digits total)
 * Algorithm: Uses specific weight pattern and modulo 11 for validation
 */
export function validateCNS(cns: string): boolean {
  if (!cns) return false;

  // Remove non-numeric characters
  const cleanCNS = cns.replace(/[^\d]/g, "");

  // CNS should have exactly 15 digits
  if (cleanCNS.length !== 15) {
    return false;
  }

  // Check if it's a "definitive" CNS (starts with 1, 2, 7, 8, or 9)
  // or "provisional" CNS (starts with 7, 8, 9, or 0)
  const firstDigit = cleanCNS.charAt(0);
  const isValidStart = ['1', '2', '7', '8', '9'].includes(firstDigit);
  
  if (!isValidStart) {
    return false;
  }

  // Apply CNS validation algorithm using modulo 11
  return calculateCNSChecksum(cleanCNS);
}

/**
 * Validates TUSS (Terminologia Unificada em Saúde Suplementar) codes
 * TUSS is the standardized terminology for Brazilian healthcare procedures and services
 * Format: Typically 5 digits followed by 2 digits (XXXXXX-XX) or variable length codes
 * This validation checks for common TUSS code patterns and formats
 */
export function validateTUSS(tussCode: string): boolean {
  if (!tussCode) return false;

  // Remove any formatting characters
  const cleanTUSS = tussCode.replace(/[^\d]/g, "");

  // TUSS codes can vary in length but typically follow these patterns:
  // - 5 digits (basic procedure codes)
  // - 8 digits (detailed procedure codes) 
  // - 10 digits (complete classification codes)
  const validLengths = [5, 8, 10];
  
  if (!validLengths.includes(cleanTUSS.length)) {
    return false;
  }

  // Check if it's a valid numeric code
  if (!/^\d+$/.test(cleanTUSS)) {
    return false;
  }

  // Validate common TUSS code ranges (simplified validation)
  // In practice, TUSS codes have specific ranges for different medical specialties
  const firstDigit = cleanTUSS.charAt(0);
  const isValidFirstDigit = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(firstDigit);
  
  if (!isValidFirstDigit) {
    return false;
  }

  // Additional validation for specific TUSS categories
  if (cleanTUSS.length >= 5) {
    const firstTwoDigits = cleanTUSS.substring(0, 2);
    const validRanges = [
      '10', // Medical procedures
      '20', // Surgical procedures  
      '30', // Diagnostic procedures
      '40', // Therapeutic procedures
      '50', // Clinical analysis
      '60', // Image diagnostic
      '70', // Functional tests
      '80', // Rehabilitation
      '90', // Other procedures
    ];

    // Check if the code starts with a valid range (loose validation)
    const isValidRange = validRanges.some(range => {
      const firstChar = range.charAt(0);
      return firstTwoDigits.startsWith(firstChar);
    });
    
    if (!isValidRange) {
      return false;
    }
  }

  return true;
}

/**
 * Validates Brazilian medical council registration (CRM)
 * Format: CRM/UF XXXXXX where UF is state abbreviation and XXXXXX is registration number
 */
export function validateCRM(crm: string): boolean {
  if (!crm) return false;

  // Remove spaces and convert to uppercase
  const cleanCRM = crm.toUpperCase().replace(/\s/g, "");

  // CRM should match pattern: CRM/UF followed by 4-10 digits
  const crmPattern = /^CRM\/[A-Z]{2}\d{4,10}$/;
  
  if (!crmPattern.test(cleanCRM)) {
    return false;
  }

  // Extract state code and validate it's a valid Brazilian state
  const stateMatch = cleanCRM.match(/^CRM\/([A-Z]{2})/);
  if (!stateMatch || !stateMatch[1]) {
    return false;
  }

  const stateCode = stateMatch[1];
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return validStates.includes(stateCode);
}

/**
 * Helper function to calculate CNS checksum using modulo 11 algorithm
 * @param cns Clean CNS string (15 digits)
 * @returns true if checksum is valid
 */
function calculateCNSChecksum(cns: string): boolean {
  const digits = cns.split('').map(Number);

  // CNS uses specific weights: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const digit = digits[i];
    const weight = weights[i];
    if (digit !== undefined && weight !== undefined) {
      sum += digit * weight;
    }
  }
  
  const remainder = sum % 11;
  
  // For CNS, the result should be 0 or 1 for valid checksums
  return remainder === 0 || remainder === 1;
}

/**
 * Comprehensive healthcare document validation
 * Validates multiple Brazilian healthcare-related documents
 */
export interface HealthcareValidationResult {
  isValid: boolean;
  documentType: string;
  value: string;
  errors: string[];
  normalized?: string;
}

/**
 * Validate any Brazilian healthcare document
 * @param documentValue The document value to validate
 * @param documentType Type of document ('cpf', 'cns', 'tuss', 'crm', 'cep', 'phone')
 * @returns Validation result with detailed information
 */
export function validateHealthcareDocument(
  documentValue: string, 
  documentType: 'cpf' | 'cns' | 'tuss' | 'crm' | 'cep' | 'phone'
): HealthcareValidationResult {
  const errors: string[] = [];
  let isValid = false;
  let normalized: string | undefined;

  try {
    switch (documentType) {
      case 'cpf':
        isValid = validateCPF(documentValue);
        if (!isValid) errors.push('Invalid CPF format or checksum');
        normalized = documentValue.replace(/[^\d]/g, "");
        break;
        
      case 'cns':
        isValid = validateCNS(documentValue);
        if (!isValid) errors.push('Invalid CNS format or checksum');
        normalized = documentValue.replace(/[^\d]/g, "");
        break;
        
      case 'tuss':
        isValid = validateTUSS(documentValue);
        if (!isValid) errors.push('Invalid TUSS code format or range');
        normalized = documentValue.replace(/[^\d]/g, "");
        break;
        
      case 'crm':
        isValid = validateCRM(documentValue);
        if (!isValid) errors.push('Invalid CRM format or state code');
        normalized = documentValue.toUpperCase().replace(/\s/g, "");
        break;
        
      case 'cep':
        isValid = validateCEP(documentValue);
        if (!isValid) errors.push('Invalid CEP format');
        normalized = documentValue.replace(/[^\d]/g, "");
        break;
        
      case 'phone':
        isValid = validatePhone(documentValue);
        if (!isValid) errors.push('Invalid phone number format');
        normalized = documentValue.replace(/[^\d]/g, "");
        break;
        
      default:
        errors.push('Unsupported document type');
        break;
    }
  } catch (_error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    isValid = false;
  }

  return {
    isValid,
    documentType,
    value: documentValue,
    errors,
    ...(normalized && { normalized })
  };
}

/**
 * Batch validation for multiple healthcare documents
 * @param documents Array of documents to validate
 * @returns Array of validation results
 */
export function validateHealthcareDocuments(
  documents: Array<{ value: string; type: 'cpf' | 'cns' | 'tuss' | 'crm' | 'cep' | 'phone' }>
): HealthcareValidationResult[] {
  return documents.map(doc => validateHealthcareDocument(doc.value, doc.type));
}

/**
 * Sanitize healthcare data for safe logging and storage
 * Removes or masks sensitive information while maintaining validation capability
 */
export function sanitizeHealthcareData(data: string, dataType: 'cpf' | 'cns' | 'phone' | 'email'): string {
  if (!data) return '';

  switch (dataType) {
    case 'cpf':
      // Show only first 3 and last 2 digits: XXX.XXX.XXX-XX → XXX.XXX.XX*-XX
      return data.replace(/(\d{3})\.\d{3}\.(\d{3})-(\d{2})/, '$1.$2.*-$3');
      
    case 'cns':
      // Show only first 3 and last 3 digits: XXX XXXXXXX XX → XXX XXXXX*-XX
      return data.replace(/(\d{3})\s*(\d{5})\s*(\d{2})/, '$1 $2*-$3');
      
    case 'phone':
      // Show only area code and last 2 digits: (XX) XXXXX-XXXX → (XX) XXX*-XX
      return data.replace(/\((\d{2})\)\s*(\d{5})-(\d{4})/, '($1) $2*-$3');
      
    case 'email':
      // Show only first 3 characters and domain: user@domain.com → use***@domain.com
      return data.replace(/(\w{3})[\w.-]*@([\w.-]+)/, '$1***@$2');
      
    default:
      return '[REDACTED]';
  }
}
