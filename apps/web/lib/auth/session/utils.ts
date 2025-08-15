/**
 * 🔐 Utilitários do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo contém funções utilitárias para o sistema de sessões,
 * incluindo validação, formatação, criptografia e manipulação de dados.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { UAParser } from 'ua-parser-js';
import type {
  DeviceFingerprint,
  DeviceInfo,
  DeviceType,
  IPAddress,
  RiskLevel,
  Timestamp,
  UserAgent,
  UserDevice,
  UserSession,
  UUID,
} from './types';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY =
  process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production';
const SESSION_TOKEN_LENGTH = 64;
const DEVICE_FINGERPRINT_LENGTH = 32;

// ============================================================================
// GERAÇÃO DE TOKENS E IDs
// ============================================================================

/**
 * Gera um UUID v4
 */
export function generateUUID(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gera um token de sessão seguro
 */
export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_LENGTH).toString('hex');
}

/**
 * Gera um fingerprint de dispositivo
 */
export function generateDeviceFingerprint(
  deviceInfo: Partial<DeviceInfo>
): DeviceFingerprint {
  const data = JSON.stringify({
    userAgent: deviceInfo.userAgent,
    type: deviceInfo.type,
    metadata: deviceInfo.metadata,
  });

  return createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, DEVICE_FINGERPRINT_LENGTH);
}

/**
 * Gera um ID de correlação para logs
 */
export function generateCorrelationId(): string {
  return randomBytes(16).toString('hex');
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

/**
 * Valida se um UUID é válido
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida se um IP é válido
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Valida se uma sessão está ativa
 */
export function isSessionActive(session: UserSession): boolean {
  if (!session.isActive) return false;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);

  return expiresAt > now;
}

/**
 * Valida se uma sessão está próxima do timeout
 */
export function isSessionNearTimeout(
  session: UserSession,
  thresholdMinutes = 5
): boolean {
  if (!isSessionActive(session)) return false;

  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  const thresholdMs = thresholdMinutes * 60 * 1000;

  return expiresAt.getTime() - now.getTime() <= thresholdMs;
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Comprimento mínimo
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  }

  // Letras maiúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos uma letra maiúscula');
  }

  // Letras minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos uma letra minúscula');
  }

  // Números
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos um número');
  }

  // Caracteres especiais
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua pelo menos um caractere especial');
  }

  // Comprimento extra
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

// ============================================================================
// FORMATAÇÃO E CONVERSÃO
// ============================================================================

/**
 * Formata timestamp para string legível
 */
export function formatTimestamp(
  timestamp: Timestamp,
  locale = 'pt-BR'
): string {
  const date = new Date(timestamp);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Formata duração em milissegundos para string legível
 */
export function formatDuration(ms: number, _locale = 'pt-BR'): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Formata bytes para string legível
 */
export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${sizes[i]}`;
}

/**
 * Converte string para timestamp
 */
export function toTimestamp(value: string | Date | number): Timestamp {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  return value;
}

/**
 * Converte timestamp para Date
 */
export function toDate(timestamp: Timestamp): Date {
  return new Date(timestamp);
}

// ============================================================================
// ANÁLISE DE USER AGENT
// ============================================================================

/**
 * Analisa User-Agent e extrai informações do dispositivo
 */
export function parseUserAgent(userAgent: UserAgent): {
  browser: { name?: string; version?: string; engine?: string };
  os: { name?: string; version?: string; platform?: string };
  device: { type?: DeviceType; vendor?: string; model?: string };
} {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Determinar tipo de dispositivo
  let deviceType: DeviceType = 'unknown';
  if (result.device.type === 'mobile') {
    deviceType = 'mobile';
  } else if (result.device.type === 'tablet') {
    deviceType = 'tablet';
  } else if (result.device.type === undefined && result.os.name) {
    deviceType = 'desktop';
  }

  return {
    browser: {
      name: result.browser.name,
      version: result.browser.version,
      engine: result.engine.name,
    },
    os: {
      name: result.os.name,
      version: result.os.version,
      platform: result.cpu.architecture,
    },
    device: {
      type: deviceType,
      vendor: result.device.vendor,
      model: result.device.model,
    },
  };
}

/**
 * Extrai informações básicas do dispositivo
 */
export function extractDeviceInfo(
  userAgent: UserAgent,
  ipAddress?: IPAddress
): DeviceInfo {
  const parsed = parseUserAgent(userAgent);

  // Gerar nome amigável do dispositivo
  let deviceName = 'Dispositivo Desconhecido';
  if (parsed.browser.name && parsed.os.name) {
    deviceName = `${parsed.browser.name} em ${parsed.os.name}`;
  } else if (parsed.browser.name) {
    deviceName = parsed.browser.name;
  } else if (parsed.os.name) {
    deviceName = parsed.os.name;
  }

  const deviceInfo: DeviceInfo = {
    name: deviceName,
    type: parsed.device.type || 'unknown',
    fingerprint: '', // Será gerado posteriormente
    userAgent,
    ipAddress,
    metadata: {
      browser: parsed.browser,
      os: parsed.os,
      hardware: {
        touchSupport:
          parsed.device.type === 'mobile' || parsed.device.type === 'tablet',
      },
    },
  };

  // Gerar fingerprint
  deviceInfo.fingerprint = generateDeviceFingerprint(deviceInfo);

  return deviceInfo;
}

// ============================================================================
// CRIPTOGRAFIA
// ============================================================================

/**
 * Criptografa dados sensíveis
 */
export function encryptData(data: string): string {
  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    const iv = randomBytes(16);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    return data; // Fallback para dados não criptografados
  }
}

/**
 * Descriptografa dados sensíveis
 */
export function decryptData(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      return encryptedData; // Dados não criptografados
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    return encryptedData; // Fallback para dados originais
  }
}

/**
 * Gera hash seguro para senhas
 */
export function hashPassword(
  password: string,
  salt?: string
): { hash: string; salt: string } {
  const actualSalt = salt || randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(password + actualSalt)
    .digest('hex');

  return { hash, salt: actualSalt };
}

/**
 * Verifica senha contra hash
 */
export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

// ============================================================================
// ANÁLISE DE RISCO
// ============================================================================

/**
 * Calcula score de risco para um dispositivo
 */
export function calculateDeviceRiskScore(
  device: UserDevice,
  _recentActivity?: any[]
): {
  score: number;
  level: RiskLevel;
  factors: Record<string, number>;
} {
  const factors: Record<string, number> = {
    newDevice: 0,
    locationChange: 0,
    timeAnomaly: 0,
    browserChange: 0,
    suspiciousActivity: 0,
  };

  // Dispositivo novo (últimos 7 dias)
  const deviceAge = Date.now() - new Date(device.createdAt).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (deviceAge < sevenDays) {
    factors.newDevice = Math.max(0, 1 - deviceAge / sevenDays);
  }

  // Mudança de localização (se disponível)
  if (
    device.location &&
    device.metadata?.lastLocation &&
    device.location !== device.metadata.lastLocation
  ) {
    factors.locationChange = 0.5;
  }

  // Anomalia de horário (atividade fora do padrão)
  const now = new Date();
  const hour = now.getHours();
  if (hour < 6 || hour > 23) {
    factors.timeAnomaly = 0.3;
  }

  // Atividade suspeita marcada
  if (device.metadata?.suspiciousActivity) {
    factors.suspiciousActivity = 0.8;
  }

  // Calcular score total
  const score =
    Object.values(factors).reduce((sum, factor) => sum + factor, 0) /
    Object.keys(factors).length;

  // Determinar nível de risco
  let level: RiskLevel = 'low';
  if (score >= 0.7) {
    level = 'high';
  } else if (score >= 0.4) {
    level = 'medium';
  }

  return { score, level, factors };
}

/**
 * Detecta padrões anômalos em atividades
 */
export function detectAnomalousActivity(
  activities: any[],
  _userBaseline?: any
): {
  isAnomalous: boolean;
  anomalies: string[];
  confidence: number;
} {
  const anomalies: string[] = [];
  let confidence = 0;

  if (!activities.length) {
    return { isAnomalous: false, anomalies, confidence };
  }

  // Verificar frequência de atividades
  const activityCount = activities.length;
  const timeSpan =
    new Date(activities[activities.length - 1].createdAt).getTime() -
    new Date(activities[0].createdAt).getTime();
  const activityRate = activityCount / (timeSpan / (60 * 1000)); // atividades por minuto

  if (activityRate > 10) {
    // Mais de 10 atividades por minuto
    anomalies.push('Taxa de atividade muito alta');
    confidence += 0.3;
  }

  // Verificar padrões de navegação
  const pageViews = activities.filter((a) => a.type === 'page_view');
  const uniquePages = new Set(pageViews.map((a) => a.pageUrl)).size;

  if (pageViews.length > 0 && uniquePages / pageViews.length < 0.3) {
    anomalies.push('Padrão de navegação repetitivo');
    confidence += 0.2;
  }

  // Verificar horários incomuns
  const nightActivities = activities.filter((a) => {
    const hour = new Date(a.createdAt).getHours();
    return hour < 6 || hour > 23;
  });

  if (nightActivities.length / activityCount > 0.5) {
    anomalies.push('Atividade em horários incomuns');
    confidence += 0.2;
  }

  return {
    isAnomalous: confidence > 0.5,
    anomalies,
    confidence: Math.min(confidence, 1),
  };
}

// ============================================================================
// GEOLOCALIZAÇÃO
// ============================================================================

/**
 * Obtém informações de localização por IP (mock - implementar com serviço real)
 */
export async function getLocationByIP(ipAddress: IPAddress): Promise<{
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: [number, number];
}> {
  // Mock implementation - substituir por serviço real como MaxMind ou IPGeolocation
  try {
    // Simular resposta baseada no IP
    if (
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.')
    ) {
      return {
        country: 'Brasil',
        region: 'São Paulo',
        city: 'São Paulo',
        timezone: 'America/Sao_Paulo',
        coordinates: [-23.5505, -46.6333],
      };
    }

    // Para outros IPs, retornar dados genéricos
    return {
      country: 'Brasil',
      region: 'Desconhecido',
      city: 'Desconhecido',
      timezone: 'America/Sao_Paulo',
    };
  } catch (error) {
    console.error('Erro ao obter localização por IP:', error);
    return {};
  }
}

/**
 * Calcula distância entre duas coordenadas (em km)
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// UTILITÁRIOS DE TEMPO
// ============================================================================

/**
 * Adiciona tempo a uma data
 */
export function addTime(
  date: Date,
  amount: number,
  unit: 'ms' | 's' | 'm' | 'h' | 'd'
): Date {
  const result = new Date(date);

  switch (unit) {
    case 'ms':
      result.setMilliseconds(result.getMilliseconds() + amount);
      break;
    case 's':
      result.setSeconds(result.getSeconds() + amount);
      break;
    case 'm':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'h':
      result.setHours(result.getHours() + amount);
      break;
    case 'd':
      result.setDate(result.getDate() + amount);
      break;
  }

  return result;
}

/**
 * Verifica se está dentro do horário de silêncio
 */
export function isInQuietHours(
  quietHours: { start: string; end: string; timezone: string },
  date: Date = new Date()
): boolean {
  try {
    const timeStr = date.toLocaleTimeString('en-US', {
      timeZone: quietHours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const currentTime = timeStr.replace(':', '');
    const startTime = quietHours.start.replace(':', '');
    const endTime = quietHours.end.replace(':', '');

    if (startTime <= endTime) {
      // Mesmo dia (ex: 22:00 - 08:00 do dia seguinte)
      return currentTime >= startTime && currentTime <= endTime;
    }
    // Atravessa meia-noite (ex: 22:00 - 08:00)
    return currentTime >= startTime || currentTime <= endTime;
  } catch (error) {
    console.error('Erro ao verificar horário de silêncio:', error);
    return false;
  }
}

// ============================================================================
// UTILITÁRIOS DE ARRAY E OBJETO
// ============================================================================

/**
 * Remove propriedades undefined de um objeto
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value;
    }
  }

  return result;
}

/**
 * Agrupa array por propriedade
 */
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Pagina um array
 */
export function paginate<T>(
  array: T[],
  page: number,
  limit: number
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const total = array.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = array.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Debounce para funções
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle para funções
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export const SessionUtils = {
  // Geração
  generateUUID,
  generateSessionToken,
  generateDeviceFingerprint,
  generateCorrelationId,

  // Validação
  isValidUUID,
  isValidEmail,
  isValidIP,
  isSessionActive,
  isSessionNearTimeout,
  validatePasswordStrength,

  // Formatação
  formatTimestamp,
  formatDuration,
  formatBytes,
  toTimestamp,
  toDate,

  // User Agent
  parseUserAgent,
  extractDeviceInfo,

  // Criptografia
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,

  // Análise de Risco
  calculateDeviceRiskScore,
  detectAnomalousActivity,

  // Geolocalização
  getLocationByIP,
  calculateDistance,

  // Tempo
  addTime,
  isInQuietHours,

  // Utilitários
  removeUndefined,
  groupBy,
  paginate,
  debounce,
  throttle,
};

export default SessionUtils;
