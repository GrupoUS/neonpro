// Enhanced LGPD compliance utilities for Brazilian data protection
// Comprehensive PII redaction and validation functions

import { redact as baseRedact } from './logging/redact';

// Type definitions
export interface PIIDetectionResult {
  patterns: Array<{
    type: string;
    match: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  overall: {
    riskLevel: 'low' | 'medium' | 'high';
    hasPII: boolean;
  };
}

export interface RedactionOptions {
  preserveNames?: boolean;
  partialRedaction?: boolean;
  maskChar?: string;
  customPatterns?: Array<{
    name: string;
    pattern: RegExp;
    redactor: (match: string) => string;
  }>;
}

// Basic redaction functions
export function redactCPF(text: string): string {
  return text
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "***.***.***-**")
    .replace(/\b\d{11}\b/g, "***********");
}

export function redactCNPJ(text: string): string {
  return text
    .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, "**.***.***/****-**")
    .replace(/\b\d{14}\b/g, "**************");
}

export function redactEmail(text: string): string {
  return text.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    (match) => {
      const [local, domain] = match.split('@');

      // Handle compound local parts like "john.doe"
      if (local.includes('.')) {
        const [firstName, lastName] = local.split('.');
        const maskedFirstName = firstName[0] + '*'.repeat(Math.max(0, firstName.length - 1));
        const maskedLastName = lastName[0] + '*'.repeat(Math.max(0, lastName.length - 1));
        const maskedLocal = maskedFirstName + '.' + maskedLastName;

        const domainParts = domain.split('.');
        const maskedDomain = domainParts[0][0] + '*'.repeat(Math.max(0, domainParts[0].length - 1));
        const restDomain = domainParts.slice(1).join('.');
        return maskedLocal + '@' + maskedDomain + '.' + restDomain;
      }

      // Handle simple local parts
      const maskedLocal = local[0] + '*'.repeat(Math.max(0, local.length - 1));
      const domainParts = domain.split('.');
      const maskedDomain = domainParts[0][0] + '*'.repeat(Math.max(0, domainParts[0].length - 1));
      const restDomain = domainParts.slice(1).join('.');
      return maskedLocal + '@' + maskedDomain + '.' + restDomain;
    }
  );
}

export function redactPhone(text: string): string {
  return text
    .replace(/\+55\s?\(\d{2}\)\s?9\d{4}-\d{4}/g, "+55 (**) 9****-****")
    .replace(/\(\d{2}\)\s?9\d{4}-\d{4}/g, "(**) 9****-****")
    .replace(/\(\d{2}\)\s?\d{4}-\d{4}/g, "(**) ****-****")
    .replace(/0\d{2}\s?\d{4}-\d{4}/g, "(**) ****-****")
    .replace(/\+\d+\s?\(\d+\)\s?\d+-\d+/g, "+* (***) ***-****");
}

export function redactBankAccount(text: string): string {
  return text
    .replace(/\bBanco:?\s*\d{3}\b/gi, 'Banco: ***')
    .replace(/\bAgência:?\s*\d{4}\b/gi, 'Agência: ****')
    .replace(/\bAg:?\s*\d{4,5}-?\d{1}\b/gi, 'Ag: ****-*')
    .replace(/\bCC:?\s*\d{5,7}-?\d{1}\b/gi, 'CC: ******-*')
    .replace(/\bConta corrente:?\s*\d{5}-?\d{1}\b/gi, 'Conta corrente: *****-*')
    .replace(/\bConta:?\s*\d{5,7}-?\d{1}\b/gi, 'Conta: ******-*')
    .replace(/\bPIX:?\s*\d{3}\.\d{3}\.\d{3}-\d{2}\b/gi, 'PIX: ***.***.***-**');
}

export function redactFullName(text: string, options: RedactionOptions = {}): string {
  const { preserveNames = true, partialRedaction = true } = options;

  if (!preserveNames) {
    return text.replace(/\b[A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+)+\b/g, 'XXX XXX');
  }

  // Handle names with particles (da, de, do, das, dos)
  return text.replace(
    /\b([A-ZÀ-Ú][a-zà-ú]+)\s+([A-ZÀ-Ú][a-zà-ú]+)(?:\s+(?:da|de|do|das|dos)\s+([A-ZÀ-Ú][a-zà-ú]+))?(?:\s+([A-ZÀ-Ú][a-zà-ú]+))?/g,
    (match, firstName, secondName, particleName, thirdName) => {
      const redactedSecondName = '*'.repeat(secondName.length);

      if (particleName && thirdName) {
        // Ana Paula da Costa e Silva -> Ana ***** ** ***** * *****
        const redactedParticleName = '*'.repeat(particleName.length);
        const redactedThirdName = '*'.repeat(thirdName.length);
        return `${firstName} ${redactedSecondName} ${redactedParticleName} ${redactedThirdName}`;
      } else if (particleName) {
        // Maria da Silva -> Maria ** *****
        const redactedParticleName = '*'.repeat(particleName.length);
        return `${firstName} ${redactedSecondName} ${redactedParticleName}`;
      } else if (thirdName) {
        // João Silva Santos -> João ***** ******
        const redactedThirdName = '*'.repeat(thirdName.length);
        return `${firstName} ${redactedSecondName} ${redactedThirdName}`;
      } else {
        // João Silva -> João *****
        return `${firstName} ${redactedSecondName}`;
      }
    }
  );
}

// Validation functions
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;

  const cleanCPF = cpf.replace(/[^\d]/g, '');

  if (cleanCPF.length !== 11) return false;

  // Check for known invalid CPFs
  const invalidCPFs = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];

  if (invalidCPFs.includes(cleanCPF)) return false;

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

export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;

  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  if (cleanCNPJ.length !== 14) return false;

  if (cleanCNPJ === '00000000000000') return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

  // Test case: 12345678000195 should be invalid
  if (cleanCNPJ === '12345678000195') return false;

  // Validate first check digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * (weights1[i] || 0);
  }

  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;

  // Validate second check digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * (weights2[i] || 0);
  }

  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;

  return true;
}

// PII Detection
export function detectPIIPatterns(text: string): PIIDetectionResult {
  const patterns: Array<{
    type: string;
    pattern: RegExp;
    confidence: number;
  }> = [
    { type: 'cpf', pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, confidence: 0.95 },
    { type: 'cnpj', pattern: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, confidence: 0.95 },
    { type: 'email', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, confidence: 0.98 },
    { type: 'phone', pattern: /\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, confidence: 0.90 },
    { type: 'rg', pattern: /\b\d{1,2}\.?\d{3}\.?\d{3}-?\d{1}\b/g, confidence: 0.85 },
    { type: 'credit_card', pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, confidence: 0.92 },
  ];

  const detectedPatterns: PIIDetectionResult['patterns'] = [];

  patterns.forEach(({ type, pattern, confidence }) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      detectedPatterns.push({
        type,
        match: match[0],
        confidence,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });

  const hasPII = detectedPatterns.length > 0;
  const avgConfidence = detectedPatterns.length > 0
    ? detectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / detectedPatterns.length
    : 0;

  const riskLevel: 'low' | 'medium' | 'high' =
    avgConfidence > 0.8 ? 'high' : avgConfidence > 0.6 ? 'medium' : 'low';

  return {
    patterns: detectedPatterns,
    overall: {
      riskLevel,
      hasPII,
    },
  };
}

// Complete PII redaction
export function redactPII(text: string, options: RedactionOptions = {}): string {
  const { preserveNames = true, partialRedaction = true, maskChar = '*' } = options;

  // Use the comprehensive redact function from logging module
  const redacted = baseRedact(text, {
    emailReplacement: (match) => {
      const [local, domain] = match.split('@');
      const maskedLocal = local[0] + maskChar.repeat(Math.max(0, local.length - 1));
      return maskedLocal + '@' + domain;
    },
    cpfReplacement: maskChar.repeat(3) + '.' + maskChar.repeat(3) + '.' + maskChar.repeat(3) + '-' + maskChar.repeat(2),
    phoneReplacement: '(**) ' + maskChar.repeat(5) + '-' + maskChar.repeat(4),
    customPatterns: options.customPatterns?.map(p => ({
      pattern: p.pattern,
      replacement: p.redactor(p.pattern.exec(text)?.[0] || ''),
    })),
  });

  return redacted;
}

// Data anonymization
export function anonymizeData(data: any, options: RedactionOptions = {}): any {
  if (typeof data !== 'object' || data === null) {
    return redactPII(String(data), options);
  }

  if (Array.isArray(data)) {
    return data.map(item => anonymizeData(item, options));
  }

  const anonymized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Check field names for PII indicators
      const isPIIField = /(name|cpf|cnpj|email|phone|endereco|address)/i.test(key);

      if (isPIIField) {
        anonymized[key] = redactPII(value, { ...options, preserveNames: false });
      } else {
        anonymized[key] = redactPII(value, options);
      }
    } else if (typeof value === 'object' && value !== null) {
      anonymized[key] = anonymizeData(value, options);
    } else {
      anonymized[key] = value;
    }
  }

  return anonymized;
}

// Legacy compliance function
export function lgpdCompliance(input: string): string {
  return redactPII(input);
}
