import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatters = {
  /**
   * Get initials from a name
   */
  initials: (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Format phone number to Brazilian standard
   */
  phone: (phone: string): string => {
    const numbers = phone.replace(/\D/g, '');

    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
  },

  /**
   * Format date to Brazilian standard
   */
  date: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  },

  /**
   * Format date to short Brazilian standard
   */
  shortDate: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  },

  /**
   * Format relative time (e.g., "há 2 dias")
   */
  relativeTime: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: ptBR,
    });
  },

  /**
   * Calculate age from birth date
   */
  age: (birthDate: Date | string): number => {
    const birth =
      typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  },

  /**
   * Format currency to Brazilian Real
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  /**
   * Format percentage
   */
  percentage: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  },

  /**
   * Format large numbers with abbreviations
   */
  compactNumber: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  },
};
// Date and time formatters
export const date = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const time = (time: string | Date): string => {
  if (typeof time === 'string') {
    return time;
  }
  return time.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const dateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const relativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'hoje';
  }
  if (diffInDays === 1) {
    return 'ontem';
  }
  if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} mês${months > 1 ? 'es' : ''} atrás`;
  }
  const years = Math.floor(diffInDays / 365);
  return `${years} ano${years > 1 ? 's' : ''} atrás`;
};

// Document formatters
export const cpf = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const phone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Name formatters
export const initials = (name: string): string => {
  return name
    .split(' ')
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const firstName = (name: string): string => {
  return name.split(' ')[0];
};

// Age calculator
export const age = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// Currency formatter
export const currency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Utility object export
export const formatters = {
  date,
  time,
  dateTime,
  relativeTime,
  cpf,
  phone,
  initials,
  firstName,
  age,
  currency,
};
