/**
 * Utilitários para hooks do Supabase
 *
 * @description Helper functions para processamento de dados,
 * cache management e error handling dos hooks React.
 */

import type { Database } from "@/types/supabase";

type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>;

/**
 * Interface para resultados com cache
 */
interface CachedResult<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache em memória para queries
 */
const queryCache = new Map<string, CachedResult<any>>();

/**
 * Configurações de cache por tipo de dados
 */
/**
 * Gera chave de cache baseada em parâmetros
 */
export const generateCacheKey = (
  prefix: string,
  params: Record<string, unknown> = {},
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key];
        return result;
      },
      {} as Record<string, unknown>,
    );

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};

/**
 * Busca dados do cache se válidos
 */
export const getCachedData = <T>(cacheKey: string): T | null => {
  const cached = queryCache.get(cacheKey);

  if (!cached) {
    return;
  }

  const now = Date.now();
  const isExpired = now - cached.timestamp > cached.ttl * 1000;

  if (isExpired) {
    queryCache.delete(cacheKey);
    return;
  }

  return cached.data;
};

/**
 * Armazena dados no cache
 */
export const setCachedData = <T>(
  cacheKey: string,
  data: T,
  ttlSeconds = 60,
): void => {
  queryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  });
};

/**
 * Executa query com cache automático
 */
export const executeWithCache = async <T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttlSeconds = 60,
): Promise<T> => {
  // Tenta buscar do cache primeiro
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Executa query e armazena no cache
  const data = await queryFn();
  setCachedData(cacheKey, data, ttlSeconds);

  return data;
};

/**
 * Limpa cache expirado periodicamente
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();

  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > value.ttl * 1000) {
      queryCache.delete(key);
    }
  }
};

/**
 * Limpa cache específico por padrão
 */
export const clearCacheByPattern = (pattern: string): void => {
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
};

/**
 * Executa query com retry automático
 */
export const executeWithRetry = async <T>(
  queryFn: () => Promise<{ data: T; error: unknown }>,
  maxRetries = 3,
  retryDelayMs = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await queryFn();

      if (error) {
        lastError = error;

        // Se não for o último retry, aguarda e tenta novamente
        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelayMs * 2 ** (attempt - 1)),
          );
          continue;
        }

        throw error;
      }

      return data;
    } catch (_error) {
      lastError = error;

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs * 2 ** (attempt - 1)),
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

/**
 * Calcula crescimento percentual
 */
export const calculateGrowthPercentage = (
  current: number,
  previous: number,
): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

/**
 * Formata valores monetários
 */
export const formatCurrency = (value: number, currency = "BRL"): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata datas para o padrão brasileiro
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    ...options,
  }).format(dateObj);
};

/**
 * Formata data e hora completa
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Agrupa dados por período (mês, semana, etc.)
 */
export const groupByPeriod = <T>(
  data: T[],
  getDate: (item: T) => string | Date,
  period: "day" | "week" | "month" | "year" = "month",
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};

  data.forEach((item) => {
    const date = new Date(getDate(item));
    let key: string;

    switch (period) {
      case "day": {
        key = date.toISOString().split("T")[0];
        break;
      }
      case "week": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
        break;
      }
      case "month": {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        break;
      }
      case "year": {
        key = date.getFullYear().toString();
        break;
      }
      default: {
        key = date.toISOString().split("T")[0];
      }
    }

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
  });

  return groups;
};

/**
 * Debounce para otimizar queries em tempo real
 */
export const debounce = <T extends (...args: unknown[]) => any>(
  func: T,
  waitMs: number,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(undefined, args), waitMs);
  }) as T;
};

/**
 * Throttle para limitar frequência de execução
 */
export const throttle = <T extends (...args: unknown[]) => any>(
  func: T,
  limitMs: number,
): T => {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(undefined, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  }) as T;
};

/**
 * Verifica se duas datas são do mesmo dia
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

/**
 * Gera horários disponíveis para agendamento
 */
export const generateTimeSlots = (
  startHour = 8,
  endHour = 18,
  intervalMinutes = 60,
  breakStart?: number,
  breakEnd?: number,
): string[] => {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    // Pula horário de almoço se definido
    if (breakStart && breakEnd && hour >= breakStart && hour < breakEnd) {
      continue;
    }

    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    slots.push(timeString);

    // Adiciona intervalos se menores que 60 minutos
    if (intervalMinutes < 60) {
      const intervalsPerHour = 60 / intervalMinutes;
      for (let i = 1; i < intervalsPerHour; i++) {
        const minutes = i * intervalMinutes;
        const intervalTime = `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        slots.push(intervalTime);
      }
    }
  }

  return slots;
};

/**
 * Valida se data está em horário comercial
 */
export const isBusinessHour = (
  date: Date,
  startHour = 8,
  endHour = 18,
  workDays: number[] = [1, 2, 3, 4, 5], // Segunda a sexta
): boolean => {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();

  return workDays.includes(dayOfWeek) && hour >= startHour && hour < endHour;
};

/**
 * Converte string de erro para mensagem amigável
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    // Converte erros comuns do Supabase
    const message = error.message.toLowerCase();

    if (message.includes("network")) {
      return "Erro de conexão. Verifique sua internet.";
    }

    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return "Acesso negado. Verifique suas permissões.";
    }

    if (message.includes("not found")) {
      return "Dados não encontrados.";
    }

    if (message.includes("constraint") || message.includes("duplicate")) {
      return "Dados já existem ou são inválidos.";
    }

    return error.message;
  }

  return "Erro desconhecido. Tente novamente.";
};

/**
 * Inicialização automática do limpador de cache
 */
if (typeof window !== "undefined") {
  // Limpa cache expirado a cada 5 minutos
  setInterval(clearExpiredCache, 5 * 60 * 1000);
}
