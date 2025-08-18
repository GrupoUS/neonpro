import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Performance-optimized regex patterns (moved to top-level for healthcare performance)
const PHONE_11_REGEX = /(\d{2})(\d{5})(\d{4})/;
const PHONE_10_REGEX = /(\d{2})(\d{4})(\d{4})/;
const CPF_REGEX = /(\d{3})(\d{3})(\d{3})(\d{2})/;
const DIGITS_ONLY_REGEX = /\D/g;

export const formatters = {
  /**
   * Get initials from a name
   */
  initials: (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Format phone number to Brazilian standard
   */
  phone: (phoneNumber: string): string => {
    const numbers = phoneNumber.replace(DIGITS_ONLY_REGEX, "");

    if (numbers.length === 11) {
      return numbers.replace(PHONE_11_REGEX, "($1) $2-$3");
    }
    if (numbers.length === 10) {
      return numbers.replace(PHONE_10_REGEX, "($1) $2-$3");
    }

    return phoneNumber;
  },

  /**
   * Format date to Brazilian standard
   */
  date: (dateInput: Date | string): string => {
    const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  },

  /**
   * Format date to short Brazilian standard
   */
  shortDate: (dateInput: Date | string): string => {
    const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  },

  /**
   * Format relative time (e.g., "há 2 dias")
   */
  relativeTime: (dateInput: Date | string): string => {
    const dateObj = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: ptBR,
    });
  },

  /**
   * Calculate age from birth date
   */
  age: (birthDate: Date | string): number => {
    const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  },

  /**
   * Format currency to Brazilian Real
   */
  currency: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  /**
   * Format percentage
   */
  percentage: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  },

  /**
   * Format large numbers with abbreviations
   */
  compactNumber: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  },
};
// Date and time formatters
export const date = (dateInput: Date | string): string => {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const time = (timeInput: string | Date): string => {
  if (typeof timeInput === "string") {
    return timeInput;
  }
  return timeInput.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const dateTime = (dateInput: Date | string): string => {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const relativeTime = (dateInput: Date | string): string => {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "hoje";
  }
  if (diffInDays === 1) {
    return "ontem";
  }
  if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} semana${weeks > 1 ? "s" : ""} atrás`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} mês${months > 1 ? "es" : ""} atrás`;
  }
  const years = Math.floor(diffInDays / 365);
  return `${years} ano${years > 1 ? "s" : ""} atrás`;
};

// Document formatters
export const cpf = (cpfInput: string): string => {
  const numbers = cpfInput.replace(DIGITS_ONLY_REGEX, "");
  return numbers.replace(CPF_REGEX, "$1.$2.$3-$4");
};

export const phone = (phoneInput: string): string => {
  const numbers = phoneInput.replace(DIGITS_ONLY_REGEX, "");
  if (numbers.length === 11) {
    return numbers.replace(PHONE_11_REGEX, "($1) $2-$3");
  }
  if (numbers.length === 10) {
    return numbers.replace(PHONE_10_REGEX, "($1) $2-$3");
  }
  return phoneInput;
};

// Name formatters
export const initials = (name: string): string => {
  return name
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const firstName = (name: string): string => {
  return name.split(" ")[0];
};

// Age calculator
export const age = (birthDate: Date | string): number => {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let currentAge = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    currentAge--;
  }

  return currentAge;
};

// Currency formatter
export const currency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Individual exports for backward compatibility
export const formatDate = formatters.date;
export const formatPhone = formatters.phone;
