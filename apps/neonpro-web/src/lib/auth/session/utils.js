"use strict";
/**
 * 🔐 Utilitários do Sistema de Gerenciamento de Sessões
 *
 * Este arquivo contém funções utilitárias para o sistema de sessões,
 * incluindo validação, formatação, criptografia e manipulação de dados.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionUtils = void 0;
exports.generateUUID = generateUUID;
exports.generateSessionToken = generateSessionToken;
exports.generateDeviceFingerprint = generateDeviceFingerprint;
exports.generateCorrelationId = generateCorrelationId;
exports.validateUUID = validateUUID;
exports.isValidUUID = isValidUUID;
exports.isValidEmail = isValidEmail;
exports.isValidIP = isValidIP;
exports.isSessionActive = isSessionActive;
exports.isSessionNearTimeout = isSessionNearTimeout;
exports.validatePasswordStrength = validatePasswordStrength;
exports.formatTimestamp = formatTimestamp;
exports.formatDuration = formatDuration;
exports.formatBytes = formatBytes;
exports.toTimestamp = toTimestamp;
exports.toDate = toDate;
exports.parseUserAgent = parseUserAgent;
exports.extractDeviceInfo = extractDeviceInfo;
exports.encryptData = encryptData;
exports.decryptData = decryptData;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.calculateDeviceRiskScore = calculateDeviceRiskScore;
exports.detectAnomalousActivity = detectAnomalousActivity;
exports.getLocationByIP = getLocationByIP;
exports.calculateDistance = calculateDistance;
exports.addTime = addTime;
exports.isInQuietHours = isInQuietHours;
exports.removeUndefined = removeUndefined;
exports.groupBy = groupBy;
exports.paginate = paginate;
exports.debounce = debounce;
exports.throttle = throttle;
var crypto_1 = require("crypto");
var ua_parser_js_1 = require("ua-parser-js");
// ============================================================================
// CONSTANTES
// ============================================================================
var ENCRYPTION_ALGORITHM = 'aes-256-gcm';
var ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production';
var SESSION_TOKEN_LENGTH = 64;
var DEVICE_FINGERPRINT_LENGTH = 32;
// ============================================================================
// GERAÇÃO DE TOKENS E IDs
// ============================================================================
/**
 * Gera um UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * Gera um token de sessão seguro
 */
function generateSessionToken() {
    return (0, crypto_1.randomBytes)(SESSION_TOKEN_LENGTH).toString('hex');
}
/**
 * Gera um fingerprint de dispositivo
 */
function generateDeviceFingerprint(deviceInfo) {
    var data = JSON.stringify({
        userAgent: deviceInfo.userAgent,
        type: deviceInfo.type,
        metadata: deviceInfo.metadata
    });
    return (0, crypto_1.createHash)('sha256')
        .update(data)
        .digest('hex')
        .substring(0, DEVICE_FINGERPRINT_LENGTH);
}
/**
 * Gera um ID de correlação para logs
 */
function generateCorrelationId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
// ============================================================================
// VALIDAÇÃO
// ============================================================================
/**
 * Valida se um UUID é válido
 */
function validateUUID(uuid) {
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Valida se um UUID é válido
 */
function isValidUUID(uuid) {
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Valida se um email é válido
 */
function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Valida se um IP é válido
 */
function isValidIP(ip) {
    var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    var ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
/**
 * Valida se uma sessão está ativa
 */
function isSessionActive(session) {
    if (!session.isActive)
        return false;
    var now = new Date();
    var expiresAt = new Date(session.expiresAt);
    return expiresAt > now;
}
/**
 * Valida se uma sessão está próxima do timeout
 */
function isSessionNearTimeout(session, thresholdMinutes) {
    if (thresholdMinutes === void 0) { thresholdMinutes = 5; }
    if (!isSessionActive(session))
        return false;
    var now = new Date();
    var expiresAt = new Date(session.expiresAt);
    var thresholdMs = thresholdMinutes * 60 * 1000;
    return (expiresAt.getTime() - now.getTime()) <= thresholdMs;
}
/**
 * Valida força da senha
 */
function validatePasswordStrength(password) {
    var feedback = [];
    var score = 0;
    // Comprimento mínimo
    if (password.length >= 8) {
        score += 1;
    }
    else {
        feedback.push('Senha deve ter pelo menos 8 caracteres');
    }
    // Letras maiúsculas
    if (/[A-Z]/.test(password)) {
        score += 1;
    }
    else {
        feedback.push('Inclua pelo menos uma letra maiúscula');
    }
    // Letras minúsculas
    if (/[a-z]/.test(password)) {
        score += 1;
    }
    else {
        feedback.push('Inclua pelo menos uma letra minúscula');
    }
    // Números
    if (/\d/.test(password)) {
        score += 1;
    }
    else {
        feedback.push('Inclua pelo menos um número');
    }
    // Caracteres especiais
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        score += 1;
    }
    else {
        feedback.push('Inclua pelo menos um caractere especial');
    }
    // Comprimento extra
    if (password.length >= 12) {
        score += 1;
    }
    return {
        isValid: score >= 4,
        score: score,
        feedback: feedback
    };
}
// ============================================================================
// FORMATAÇÃO E CONVERSÃO
// ============================================================================
/**
 * Formata timestamp para string legível
 */
function formatTimestamp(timestamp, locale) {
    if (locale === void 0) { locale = 'pt-BR'; }
    var date = new Date(timestamp);
    return date.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
/**
 * Formata duração em milissegundos para string legível
 */
function formatDuration(ms, locale) {
    if (locale === void 0) { locale = 'pt-BR'; }
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    if (days > 0) {
        return "".concat(days, "d ").concat(hours % 24, "h ").concat(minutes % 60, "m");
    }
    else if (hours > 0) {
        return "".concat(hours, "h ").concat(minutes % 60, "m");
    }
    else if (minutes > 0) {
        return "".concat(minutes, "m ").concat(seconds % 60, "s");
    }
    else {
        return "".concat(seconds, "s");
    }
}
/**
 * Formata bytes para string legível
 */
function formatBytes(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return '0 Bytes';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
/**
 * Converte string para timestamp
 */
function toTimestamp(value) {
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
function toDate(timestamp) {
    return new Date(timestamp);
}
// ============================================================================
// ANÁLISE DE USER AGENT
// ============================================================================
/**
 * Analisa User-Agent e extrai informações do dispositivo
 */
function parseUserAgent(userAgent) {
    var parser = new ua_parser_js_1.UAParser(userAgent);
    var result = parser.getResult();
    // Determinar tipo de dispositivo
    var deviceType = 'unknown';
    if (result.device.type === 'mobile') {
        deviceType = 'mobile';
    }
    else if (result.device.type === 'tablet') {
        deviceType = 'tablet';
    }
    else if (result.device.type === undefined && result.os.name) {
        deviceType = 'desktop';
    }
    return {
        browser: {
            name: result.browser.name,
            version: result.browser.version,
            engine: result.engine.name
        },
        os: {
            name: result.os.name,
            version: result.os.version,
            platform: result.cpu.architecture
        },
        device: {
            type: deviceType,
            vendor: result.device.vendor,
            model: result.device.model
        }
    };
}
/**
 * Extrai informações básicas do dispositivo
 */
function extractDeviceInfo(userAgent, ipAddress) {
    var parsed = parseUserAgent(userAgent);
    // Gerar nome amigável do dispositivo
    var deviceName = 'Dispositivo Desconhecido';
    if (parsed.browser.name && parsed.os.name) {
        deviceName = "".concat(parsed.browser.name, " em ").concat(parsed.os.name);
    }
    else if (parsed.browser.name) {
        deviceName = parsed.browser.name;
    }
    else if (parsed.os.name) {
        deviceName = parsed.os.name;
    }
    var deviceInfo = {
        name: deviceName,
        type: parsed.device.type || 'unknown',
        fingerprint: '', // Será gerado posteriormente
        userAgent: userAgent,
        ipAddress: ipAddress,
        metadata: {
            browser: parsed.browser,
            os: parsed.os,
            hardware: {
                touchSupport: parsed.device.type === 'mobile' || parsed.device.type === 'tablet'
            }
        }
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
function encryptData(data) {
    try {
        var key = Buffer.from(ENCRYPTION_KEY, 'utf8');
        var iv = (0, crypto_1.randomBytes)(16);
        var cipher = (0, crypto_1.createCipheriv)(ENCRYPTION_ALGORITHM, key, iv);
        var encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        var authTag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }
    catch (error) {
        console.error('Erro ao criptografar dados:', error);
        return data; // Fallback para dados não criptografados
    }
}
/**
 * Descriptografa dados sensíveis
 */
function decryptData(encryptedData) {
    try {
        var parts = encryptedData.split(':');
        if (parts.length !== 3) {
            return encryptedData; // Dados não criptografados
        }
        var ivHex = parts[0], authTagHex = parts[1], encrypted = parts[2];
        var key = Buffer.from(ENCRYPTION_KEY, 'utf8');
        var iv = Buffer.from(ivHex, 'hex');
        var authTag = Buffer.from(authTagHex, 'hex');
        var decipher = (0, crypto_1.createDecipheriv)(ENCRYPTION_ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Erro ao descriptografar dados:', error);
        return encryptedData; // Fallback para dados originais
    }
}
/**
 * Gera hash seguro para senhas
 */
function hashPassword(password, salt) {
    var actualSalt = salt || (0, crypto_1.randomBytes)(32).toString('hex');
    var hash = (0, crypto_1.createHash)('sha256')
        .update(password + actualSalt)
        .digest('hex');
    return { hash: hash, salt: actualSalt };
}
/**
 * Verifica senha contra hash
 */
function verifyPassword(password, hash, salt) {
    var computedHash = hashPassword(password, salt).hash;
    return computedHash === hash;
}
// ============================================================================
// ANÁLISE DE RISCO
// ============================================================================
/**
 * Calcula score de risco para um dispositivo
 */
function calculateDeviceRiskScore(device, recentActivity) {
    var _a, _b;
    var factors = {
        newDevice: 0,
        locationChange: 0,
        timeAnomaly: 0,
        browserChange: 0,
        suspiciousActivity: 0
    };
    // Dispositivo novo (últimos 7 dias)
    var deviceAge = Date.now() - new Date(device.createdAt).getTime();
    var sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (deviceAge < sevenDays) {
        factors.newDevice = Math.max(0, 1 - (deviceAge / sevenDays));
    }
    // Mudança de localização (se disponível)
    if (device.location && ((_a = device.metadata) === null || _a === void 0 ? void 0 : _a.lastLocation)) {
        if (device.location !== device.metadata.lastLocation) {
            factors.locationChange = 0.5;
        }
    }
    // Anomalia de horário (atividade fora do padrão)
    var now = new Date();
    var hour = now.getHours();
    if (hour < 6 || hour > 23) {
        factors.timeAnomaly = 0.3;
    }
    // Atividade suspeita marcada
    if ((_b = device.metadata) === null || _b === void 0 ? void 0 : _b.suspiciousActivity) {
        factors.suspiciousActivity = 0.8;
    }
    // Calcular score total
    var score = Object.values(factors).reduce(function (sum, factor) { return sum + factor; }, 0) / Object.keys(factors).length;
    // Determinar nível de risco
    var level = 'low';
    if (score >= 0.7) {
        level = 'high';
    }
    else if (score >= 0.4) {
        level = 'medium';
    }
    return { score: score, level: level, factors: factors };
}
/**
 * Detecta padrões anômalos em atividades
 */
function detectAnomalousActivity(activities, userBaseline) {
    var anomalies = [];
    var confidence = 0;
    if (!activities.length) {
        return { isAnomalous: false, anomalies: anomalies, confidence: confidence };
    }
    // Verificar frequência de atividades
    var activityCount = activities.length;
    var timeSpan = new Date(activities[activities.length - 1].createdAt).getTime() -
        new Date(activities[0].createdAt).getTime();
    var activityRate = activityCount / (timeSpan / (60 * 1000)); // atividades por minuto
    if (activityRate > 10) { // Mais de 10 atividades por minuto
        anomalies.push('Taxa de atividade muito alta');
        confidence += 0.3;
    }
    // Verificar padrões de navegação
    var pageViews = activities.filter(function (a) { return a.type === 'page_view'; });
    var uniquePages = new Set(pageViews.map(function (a) { return a.pageUrl; })).size;
    if (pageViews.length > 0 && uniquePages / pageViews.length < 0.3) {
        anomalies.push('Padrão de navegação repetitivo');
        confidence += 0.2;
    }
    // Verificar horários incomuns
    var nightActivities = activities.filter(function (a) {
        var hour = new Date(a.createdAt).getHours();
        return hour < 6 || hour > 23;
    });
    if (nightActivities.length / activityCount > 0.5) {
        anomalies.push('Atividade em horários incomuns');
        confidence += 0.2;
    }
    return {
        isAnomalous: confidence > 0.5,
        anomalies: anomalies,
        confidence: Math.min(confidence, 1)
    };
}
// ============================================================================
// GEOLOCALIZAÇÃO
// ============================================================================
/**
 * Obtém informações de localização por IP (mock - implementar com serviço real)
 */
function getLocationByIP(ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Mock implementation - substituir por serviço real como MaxMind ou IPGeolocation
            try {
                // Simular resposta baseada no IP
                if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
                    return [2 /*return*/, {
                            country: 'Brasil',
                            region: 'São Paulo',
                            city: 'São Paulo',
                            timezone: 'America/Sao_Paulo',
                            coordinates: [-23.5505, -46.6333]
                        }];
                }
                // Para outros IPs, retornar dados genéricos
                return [2 /*return*/, {
                        country: 'Brasil',
                        region: 'Desconhecido',
                        city: 'Desconhecido',
                        timezone: 'America/Sao_Paulo'
                    }];
            }
            catch (error) {
                console.error('Erro ao obter localização por IP:', error);
                return [2 /*return*/, {}];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Calcula distância entre duas coordenadas (em km)
 */
function calculateDistance(coord1, coord2) {
    var lat1 = coord1[0], lon1 = coord1[1];
    var lat2 = coord2[0], lon2 = coord2[1];
    var R = 6371; // Raio da Terra em km
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// ============================================================================
// UTILITÁRIOS DE TEMPO
// ============================================================================
/**
 * Adiciona tempo a uma data
 */
function addTime(date, amount, unit) {
    var result = new Date(date);
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
function isInQuietHours(quietHours, date) {
    if (date === void 0) { date = new Date(); }
    try {
        var timeStr = date.toLocaleTimeString('en-US', {
            timeZone: quietHours.timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        var currentTime = timeStr.replace(':', '');
        var startTime = quietHours.start.replace(':', '');
        var endTime = quietHours.end.replace(':', '');
        if (startTime <= endTime) {
            // Mesmo dia (ex: 22:00 - 08:00 do dia seguinte)
            return currentTime >= startTime && currentTime <= endTime;
        }
        else {
            // Atravessa meia-noite (ex: 22:00 - 08:00)
            return currentTime >= startTime || currentTime <= endTime;
        }
    }
    catch (error) {
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
function removeUndefined(obj) {
    var result = {};
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Agrupa array por propriedade
 */
function groupBy(array, key) {
    return array.reduce(function (groups, item) {
        var group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}
/**
 * Pagina um array
 */
function paginate(array, page, limit) {
    var total = array.length;
    var totalPages = Math.ceil(total / limit);
    var offset = (page - 1) * limit;
    var data = array.slice(offset, offset + limit);
    return {
        data: data,
        pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}
/**
 * Debounce para funções
 */
function debounce(func, wait) {
    var timeout = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            func.apply(void 0, args);
        }, wait);
    };
}
/**
 * Throttle para funções
 */
function throttle(func, limit) {
    var inThrottle = false;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!inThrottle) {
            func.apply(void 0, args);
            inThrottle = true;
            setTimeout(function () { return inThrottle = false; }, limit);
        }
    };
}
// ============================================================================
// EXPORTAÇÕES
// ============================================================================
exports.SessionUtils = {
    // Geração
    generateUUID: generateUUID,
    generateSessionToken: generateSessionToken,
    generateDeviceFingerprint: generateDeviceFingerprint,
    generateCorrelationId: generateCorrelationId,
    // Validação
    isValidUUID: isValidUUID,
    isValidEmail: isValidEmail,
    isValidIP: isValidIP,
    isSessionActive: isSessionActive,
    isSessionNearTimeout: isSessionNearTimeout,
    validatePasswordStrength: validatePasswordStrength,
    // Formatação
    formatTimestamp: formatTimestamp,
    formatDuration: formatDuration,
    formatBytes: formatBytes,
    toTimestamp: toTimestamp,
    toDate: toDate,
    // User Agent
    parseUserAgent: parseUserAgent,
    extractDeviceInfo: extractDeviceInfo,
    // Criptografia
    encryptData: encryptData,
    decryptData: decryptData,
    hashPassword: hashPassword,
    verifyPassword: verifyPassword,
    // Análise de Risco
    calculateDeviceRiskScore: calculateDeviceRiskScore,
    detectAnomalousActivity: detectAnomalousActivity,
    // Geolocalização
    getLocationByIP: getLocationByIP,
    calculateDistance: calculateDistance,
    // Tempo
    addTime: addTime,
    isInQuietHours: isInQuietHours,
    // Utilitários
    removeUndefined: removeUndefined,
    groupBy: groupBy,
    paginate: paginate,
    debounce: debounce,
    throttle: throttle
};
exports.default = exports.SessionUtils;
