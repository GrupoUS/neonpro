/**
 * CNPJ Validation Service
 * Comprehensive CNPJ validation with Brasil API integration
 * Compliant with Brazilian fiscal regulations 2025
 */

export interface CNPJValidationResult {
  valid: boolean;
  formatted?: string;
  errors?: string[];
}

export interface CNPJCompanyData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  porte: string;
  atividade_principal: {
    code: string;
    text: string;
  };
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  telefone?: string;
  email?: string;
  situacao: string;
  data_situacao: string;
  motivo_situacao?: string;
  natureza_juridica: string;
  capital_social: number;
  data_inicio_atividade: string;
  qsa?: Array<{
    nome: string;
    qual: string;
    pais_origem?: string;
    nome_rep_legal?: string;
    qual_rep_legal?: string;
  }>;
}

export interface CNPJConsultationResult {
  success: boolean;
  data?: CNPJCompanyData;
  cached: boolean;
  cache_expiry?: string;
  errors?: string[];
  rate_limit?: {
    remaining: number;
    reset_time: string;
  };
}

/**
 * Validates CNPJ format and check digits
 */
export function validateCNPJFormat(cnpj: string): CNPJValidationResult {
  // Remove all non-digit characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Check length
  if (cleanCNPJ.length !== 14) {
    return {
      valid: false,
      errors: ['CNPJ deve conter exatamente 14 dígitos']
    };
  }
  
  // Check for repeated digits (invalid CNPJs like 11111111111111)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return {
      valid: false,
      errors: ['CNPJ não pode ter todos os dígitos iguais']
    };
  }
  
  // Validate check digits
  const digits = cleanCNPJ.split('').map(Number);
  
  // First check digit calculation
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  
  const remainder1 = sum % 11;
  const checkDigit1 = remainder1 < 2 ? 0 : 11 - remainder1;
  
  if (digits[12] !== checkDigit1) {
    return {
      valid: false,
      errors: ['Primeiro dígito verificador inválido']
    };
  }
  
  // Second check digit calculation
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  
  const remainder2 = sum % 11;
  const checkDigit2 = remainder2 < 2 ? 0 : 11 - remainder2;
  
  if (digits[13] !== checkDigit2) {
    return {
      valid: false,
      errors: ['Segundo dígito verificador inválido']
    };
  }
  
  return {
    valid: true,
    formatted: formatCNPJ(cleanCNPJ)
  };
}

/**
 * Formats CNPJ with standard Brazilian format
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  
  if (clean.length !== 14) {
    return cnpj; // Return original if invalid length
  }
  
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Removes CNPJ formatting
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Validates if CNPJ belongs to healthcare/aesthetic clinic sector
 */
export function validateHealthcareCNAE(cnae: string): boolean {
  const healthcareCNAEs = [
    '8610-1', // Atividades de atendimento hospitalar
    '8630-5', // Atividades de atenção ambulatorial
    '8640-2', // Atividades de serviços de complementação diagnóstica
    '8650-0', // Atividades de profissionais da área de saúde
    '9609-2', // Outras atividades de serviços pessoais (estética)
    '8591-1', // Ensino de esportes (relacionado a estética/fitness)
    '8292-0', // Envasamento e empacotamento sob contrato (cosméticos)
    '4771-7', // Comércio varejista de produtos farmacêuticos
    '4772-5', // Comércio varejista de cosméticos
  ];
  
  return healthcareCNAEs.some(code => cnae.startsWith(code.replace('-', '')));
}

/**
 * Rate limiting for CNPJ consultations
 */
class CNPJRateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly MAX_REQUESTS_PER_MINUTE = 3;
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  
  static canMakeRequest(ip: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    if (validRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    return true;
  }
  
  static getRemainingRequests(ip: string): number {
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - validRequests.length);
  }
  
  static getResetTime(ip: string): Date {
    const now = Date.now();
    const requests = this.requests.get(ip) || [];
    const oldestRequest = Math.min(...requests);
    
    return new Date(oldestRequest + this.WINDOW_MS);
  }
}

/**
 * Cache manager for CNPJ data
 */
class CNPJCache {
  private static cache: Map<string, {
    data: CNPJCompanyData;
    expiry: number;
  }> = new Map();
  
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  static get(cnpj: string): CNPJCompanyData | null {
    const clean = cleanCNPJ(cnpj);
    const cached = this.cache.get(clean);
    
    if (!cached || Date.now() > cached.expiry) {
      this.cache.delete(clean);
      return null;
    }
    
    return cached.data;
  }
  
  static set(cnpj: string, data: CNPJCompanyData): void {
    const clean = cleanCNPJ(cnpj);
    this.cache.set(clean, {
      data,
      expiry: Date.now() + this.CACHE_DURATION
    });
  }
  
  static clear(): void {
    this.cache.clear();
  }
  
  static getCacheExpiry(cnpj: string): Date | null {
    const clean = cleanCNPJ(cnpj);
    const cached = this.cache.get(clean);
    
    return cached ? new Date(cached.expiry) : null;
  }
}

export { CNPJCache, CNPJRateLimiter };

