/**
 * Address interface with Brazilian CEP validation
 */
export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Brazilian CEP validation
 */
export function validateCEP(cep: string): boolean {
  // Remove formatting
  const cleanCEP = cep.replace(/[^\d]/g, "");

  // Check length
  if (cleanCEP.length !== 8) return false;

  // Check for valid pattern (not all zeros)
  if (cleanCEP === "00000000") return false;

  return true;
}

/**
 * Format CEP for display
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/[^\d]/g, "");
  return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2");
}
