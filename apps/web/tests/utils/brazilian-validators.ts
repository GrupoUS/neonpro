/**
 * Brazilian Data Format Validators
 *
 * Validation utilities for Brazilian healthcare data formats including CPF,
 * phone numbers, CEP, and other healthcare-specific identifiers.
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

/**
 * Validate CPF (Cadastro de Pessoas Físicas) format
 * @param cpf CPF string to validate
 * @returns boolean indicating if CPF is valid
 */
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;

  // Remove non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '');

  // Check basic length
  if (cleanCPF.length !== 11) return false;

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder > 9 ? 0 : remainder;

  if (parseInt(cleanCPF[9]) !== digit1) return false;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder > 9 ? 0 : remainder;

  return parseInt(cleanCPF[10]) === digit2;
};

/**
 * Validate Brazilian phone number format
 * @param phone Phone string to validate
 * @returns boolean indicating if phone is valid
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;

  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check valid lengths (10 or 11 digits)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;

  // Check if starts with valid DDD codes
  const ddd = parseInt(cleanPhone.substring(0, 2));
  const validDDDs = [
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19, // São Paulo
    21,
    22,
    24, // Rio de Janeiro
    27,
    28, // Espírito Santo
    31,
    32,
    33,
    34,
    35,
    37,
    38, // Minas Gerais
    41,
    42,
    43,
    44,
    45,
    46, // Paraná
    47,
    48,
    49, // Santa Catarina
    51,
    53,
    54,
    55, // Rio Grande do Sul
    61, // Distrito Federal
    62,
    64,
    63,
    65,
    66,
    67,
    68,
    69, // Centro-Oeste
    71,
    73,
    74,
    75,
    77,
    79, // Bahia
    81,
    87,
    82,
    83,
    84,
    85,
    86,
    88,
    89, // Nordeste
    91,
    92,
    93,
    94,
    95,
    96,
    97,
    98,
    99, // Norte
  ];

  return validDDDs.includes(ddd);
};

/**
 * Validate CEP (Código de Endereçamento Postal) format
 * @param cep CEP string to validate
 * @returns boolean indicating if CEP is valid
 */
export const validateCEP = (cep: string): boolean => {
  if (!cep) return false;

  // Remove non-numeric characters
  const cleanCEP = cep.replace(/\D/g, '');

  // Check length
  if (cleanCEP.length !== 8) return false;

  // Basic format validation
  return /^\d{8}$/.test(cleanCEP);
};

/**
 * Validate CRM (Conselho Regional de Medicina) format
 * @param crm CRM string to validate
 * @returns boolean indicating if CRM is valid
 */
export const validateCRM = (crm: string): boolean => {
  if (!crm) return false;

  // Remove spaces and special characters
  const cleanCRM = crm.replace(/[\s-]/g, '');

  // Extract number and state
  const match = cleanCRM.match(/^(\d+)([A-Z]{2})$/i);
  if (!match) return false;

  const [_, number, state] = match;

  // Validate CRM number (basic validation)
  if (!/^\d{4,10}$/.test(number)) return false;

  // Validate Brazilian state codes
  const validStates = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  return validStates.includes(state.toUpperCase());
};

/**
 * Validate CNS (Cartão Nacional de Saúde) format
 * @param cns CNS string to validate
 * @returns boolean indicating if CNS is valid
 */
export const validateCNS = (cns: string): boolean => {
  if (!cns) return false;

  // Remove non-numeric characters
  const cleanCNS = cns.replace(/\D/g, '');

  // Check length
  if (cleanCNS.length !== 15) return false;

  // Check if starts with valid digits (1 or 2 for Brazil)
  if (!['1', '2', '7', '8', '9'].includes(cleanCNS[0])) return false;

  // Basic validation algorithm for CNS
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += parseInt(cleanCNS[i]) * (15 - i);
  }

  return sum % 11 === 0;
};

/**
 * Validate Brazilian email format
 * @param email Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate date in Brazilian format (DD/MM/YYYY)
 * @param date Date string to validate
 * @returns boolean indicating if date is valid
 */
export const validateBrazilianDate = (date: string): boolean => {
  if (!date) return false;

  // Check DD/MM/YYYY format
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(dateRegex);

  if (!match) return false;

  const [_, day, month, year] = match;

  // Convert to numbers
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  // Basic validation
  if (dayNum < 1 || dayNum > 31) return false;
  if (monthNum < 1 || monthNum > 12) return false;
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;

  // Check specific month days
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  if (dayNum > daysInMonth) return false;

  return true;
};

/**
 * Validate RG (Registro Geral) format (basic validation)
 * @param rg RG string to validate
 * @returns boolean indicating if RG is valid
 */
export const validateRG = (rg: string): boolean => {
  if (!rg) return false;

  // Remove non-alphanumeric characters
  const cleanRG = rg.replace(/[\W_]/g, '');

  // RG formats vary by state, basic length validation
  return (
    cleanRG.length >= 7 && cleanRG.length <= 14 && /^[0-9A-Z]+$/i.test(cleanRG)
  );
};

/**
 * Validate Brazilian bank account format
 * @param bankAccount Bank account string to validate
 * @returns boolean indicating if bank account is valid
 */
export const validateBankAccount = (bankAccount: string): boolean => {
  if (!bankAccount) return false;

  // Remove non-numeric characters
  const cleanAccount = bankAccount.replace(/\D/g, '');

  // Basic validation (account numbers vary by bank)
  return (
    cleanAccount.length >= 3
    && cleanAccount.length <= 12
    && /^\d+$/.test(cleanAccount)
  );
};

/**
 * Format CPF with mask
 * @param cpf CPF string to format
 * @returns Formatted CPF string
 */
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return cpf;

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Format phone number with mask
 * @param phone Phone string to format
 * @returns Formatted phone string
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

/**
 * Format CEP with mask
 * @param cep CEP string to format
 * @returns Formatted CEP string
 */
export const formatCEP = (cep: string): string => {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return cep;

  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Generate a valid test CPF
 * @returns Valid CPF string
 */
export const generateTestCPF = (): string => {
  // Generate 9 random digits
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit1 = remainder > 9 ? 0 : remainder;
  cpf += digit1;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const digit2 = remainder > 9 ? 0 : remainder;
  cpf += digit2;

  return formatCPF(cpf);
};

/**
 * Generate a valid test phone number
 * @returns Valid phone string
 */
export const generateTestPhone = (): string => {
  const ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91]; // Major city DDDs
  const ddd = ddds[Math.floor(Math.random() * ddds.length)];

  let phone = ddd.toString();

  if (Math.random() > 0.5) {
    // Mobile number (9 digits after DDD)
    phone += '9';
    for (let i = 0; i < 8; i++) {
      phone += Math.floor(Math.random() * 10);
    }
  } else {
    // Landline (8 digits after DDD)
    for (let i = 0; i < 8; i++) {
      phone += Math.floor(Math.random() * 10);
    }
  }

  return formatPhone(phone);
};

/**
 * Generate a valid test CEP
 * @returns Valid CEP string
 */
export const generateTestCEP = (): string => {
  // Generate realistic CEP ranges for major Brazilian cities
  const cepRanges = [
    { start: '01000000', end: '05999999' }, // São Paulo
    { start: '20000000', end: '23999999' }, // Rio de Janeiro
    { start: '30000000', end: '31999999' }, // Belo Horizonte
    { start: '40000000', end: '41999999' }, // Salvador
    { start: '70000000', end: '70999999' }, // Brasília
  ];

  const range = cepRanges[Math.floor(Math.random() * cepRanges.length)];
  const startNum = parseInt(range.start);
  const endNum = parseInt(range.end);

  const cepNum = Math.floor(Math.random() * (endNum - startNum + 1)) + startNum;
  const cep = cepNum.toString().padStart(8, '0');

  return formatCEP(cep);
};

export default {
  validateCPF,
  validatePhone,
  validateCEP,
  validateCRM,
  validateCNS,
  validateEmail,
  validateBrazilianDate,
  validateRG,
  validateBankAccount,
  formatCPF,
  formatPhone,
  formatCEP,
  generateTestCPF,
  generateTestPhone,
  generateTestCEP,
};

// Named exports for ES6 modules
export {
  formatCEP,
  formatCPF,
  formatPhone,
  generateTestCEP,
  generateTestCPF,
  generateTestPhone,
  validateBankAccount,
  validateBrazilianDate,
  validateCEP,
  validateCNS,
  validateCPF,
  validateCRM,
  validateEmail,
  validatePhone,
  validateRG,
};
