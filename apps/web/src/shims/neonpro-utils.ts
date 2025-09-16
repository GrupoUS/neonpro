/**
 * Shim for @neonpro/utils currency utilities
 */

export function formatBRL(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

export function maskBRLInput(input: string): string {
  // Remove tudo que não é dígito
  const digits = input.replace(/\D/g, '');
  
  // Se não há dígitos, retorna vazio
  if (!digits) return '';
  
  // Converte para número (centavos)
  const cents = parseInt(digits, 10);
  
  // Converte para valor decimal
  const value = cents / 100;
  
  // Formata como moeda
  return formatBRL(value);
}