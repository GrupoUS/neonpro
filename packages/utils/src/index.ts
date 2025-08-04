/**
 * NeonPro Utils Package
 * Shared utilities for healthcare platform
 */

// CPF utilities (LGPD compliant)
export function maskCPF(cpf: string): string {
  return cpf.replace(/(\d{3})\d{3}(\d{3})\d{2}/, '$1.***.***-**');
}

export function validateCPF(cpf: string): boolean {
  // Basic CPF validation (simplified)
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11 && !/^(\d)\1+$/.test(cleanCPF);
}

// Email utilities
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  const maskedUser = user.charAt(0) + '*'.repeat(user.length - 1);
  return `${maskedUser}@${domain}`;
}

// Date utilities for healthcare
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Healthcare specific utilities
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Audit utilities
export function createAuditLog(action: string, resource: string, userId: string) {
  return {
    action,
    resource,
    user_id: userId,
    timestamp: new Date().toISOString(),
    ip_address: 'masked', // LGPD compliance
  };
}