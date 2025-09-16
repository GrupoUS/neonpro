/**
 * Brazilian Data Formatters
 * Utility functions for formatting Brazilian data (CPF, phone, CEP, etc.)
 * Used by frontend components for consistent data display
 *
 * Note: formatPhone is deprecated in favor of formatBRPhone from @neonpro/utils.
 */

/**
 * Format CPF with mask (000.000.000-00)
 */
import { formatBRPhone } from '@neonpro/utils';

export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  // Remove all non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');

  // Apply CPF mask
  if (cleaned.length <= 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  return cpf; // Return original if invalid length
}

/**
 * Format CNPJ with mask (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';

  // Remove all non-numeric characters
  const cleaned = cnpj.replace(/\D/g, '');

  // Apply CNPJ mask
  if (cleaned.length <= 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return cnpj; // Return original if invalid length
}

/**
 * Format Brazilian phone number with mask
 * Supports both landline (00) 0000-0000 and mobile (00) 00000-0000
 */
/**
 * DEPRECATED: Use formatBRPhone from @neonpro/utils directly.
 * This wrapper delegates to shared utils to keep backward compatibility.
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return formatBRPhone(cleaned);
}

/**
 * Format CEP with mask (00000-000)
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';

  // Remove all non-numeric characters
  const cleaned = cep.replace(/\D/g, '');

  // Apply CEP mask
  if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  return cep; // Return original if invalid length
}

/**
 * Format currency in Brazilian Real (R$)
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Format date in Brazilian format (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Format date and time in Brazilian format (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time in Brazilian format (HH:mm)
 */
export function formatTime(date: string | Date): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Remove formatting from CPF (keep only numbers)
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Remove formatting from CNPJ (keep only numbers)
 */
export function unformatCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Remove formatting from phone (keep only numbers)
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Remove formatting from CEP (keep only numbers)
 */
export function unformatCEP(cep: string): string {
  return cep.replace(/\D/g, '');
}

/**
 * Mask sensitive data for LGPD compliance
 */
export function maskSensitiveData(
  data: string,
  type: 'cpf' | 'phone' | 'email' | 'address',
): string {
  if (!data) return '';

  switch (type) {
    case 'cpf':
      return '***.***.***-**';
    case 'phone':
      return '(**) ****-****';
    case 'email':
      const [, domain] = data.split('@');
      return `***@${domain || '***.***'}`;
    case 'address':
      return 'Endereço restrito';
    default:
      return '***';
  }
}

/**
 * Format Brazilian state abbreviation
 */
export function formatState(state: string): string {
  const stateMap: Record<string, string> = {
    AC: 'Acre',
    AL: 'Alagoas',
    AP: 'Amapá',
    AM: 'Amazonas',
    BA: 'Bahia',
    CE: 'Ceará',
    DF: 'Distrito Federal',
    ES: 'Espírito Santo',
    GO: 'Goiás',
    MA: 'Maranhão',
    MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais',
    PA: 'Pará',
    PB: 'Paraíba',
    PR: 'Paraná',
    PE: 'Pernambuco',
    PI: 'Piauí',
    RJ: 'Rio de Janeiro',
    RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul',
    RO: 'Rondônia',
    RR: 'Roraima',
    SC: 'Santa Catarina',
    SP: 'São Paulo',
    SE: 'Sergipe',
    TO: 'Tocantins',
  };

  return stateMap[state.toUpperCase()] || state;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
