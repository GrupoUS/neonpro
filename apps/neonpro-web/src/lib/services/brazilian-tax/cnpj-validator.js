"use strict";
/**
 * CNPJ Validation Service
 * Comprehensive CNPJ validation with Brasil API integration
 * Compliant with Brazilian fiscal regulations 2025
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CNPJRateLimiter = exports.CNPJCache = void 0;
exports.validateCNPJFormat = validateCNPJFormat;
exports.formatCNPJ = formatCNPJ;
exports.cleanCNPJ = cleanCNPJ;
exports.validateHealthcareCNAE = validateHealthcareCNAE;
/**
 * Validates CNPJ format and check digits
 */
function validateCNPJFormat(cnpj) {
    // Remove all non-digit characters
    var cleanCNPJ = cnpj.replace(/\D/g, '');
    // Check length
    if (cleanCNPJ.length !== 14) {
        return {
            valid: false,
            errors: ['CNPJ deve conter exatamente 14 dígitos']
        };
    }
    // Check for repeated digits (invalid CNPJs like 11111111111111)
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
        return {
            valid: false,
            errors: ['CNPJ não pode ter todos os dígitos iguais']
        };
    }
    // Validate check digits
    var digits = cleanCNPJ.split('').map(Number);
    // First check digit calculation
    var sum = 0;
    var weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (var i = 0; i < 12; i++) {
        sum += digits[i] * weights1[i];
    }
    var remainder1 = sum % 11;
    var checkDigit1 = remainder1 < 2 ? 0 : 11 - remainder1;
    if (digits[12] !== checkDigit1) {
        return {
            valid: false,
            errors: ['Primeiro dígito verificador inválido']
        };
    }
    // Second check digit calculation
    sum = 0;
    var weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (var i = 0; i < 13; i++) {
        sum += digits[i] * weights2[i];
    }
    var remainder2 = sum % 11;
    var checkDigit2 = remainder2 < 2 ? 0 : 11 - remainder2;
    if (digits[13] !== checkDigit2) {
        return {
            valid: false,
            errors: ['Segundo dígito verificador inválido']
        };
    }
    return {
        valid: true,
        formatted: formatCNPJ(cleanCNPJ)
    };
}
/**
 * Formats CNPJ with standard Brazilian format
 */
function formatCNPJ(cnpj) {
    var clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
        return cnpj; // Return original if invalid length
    }
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
/**
 * Removes CNPJ formatting
 */
function cleanCNPJ(cnpj) {
    return cnpj.replace(/\D/g, '');
}
/**
 * Validates if CNPJ belongs to healthcare/aesthetic clinic sector
 */
function validateHealthcareCNAE(cnae) {
    var healthcareCNAEs = [
        '8610-1', // Atividades de atendimento hospitalar
        '8630-5', // Atividades de atenção ambulatorial
        '8640-2', // Atividades de serviços de complementação diagnóstica
        '8650-0', // Atividades de profissionais da área de saúde
        '9609-2', // Outras atividades de serviços pessoais (estética)
        '8591-1', // Ensino de esportes (relacionado a estética/fitness)
        '8292-0', // Envasamento e empacotamento sob contrato (cosméticos)
        '4771-7', // Comércio varejista de produtos farmacêuticos
        '4772-5', // Comércio varejista de cosméticos
    ];
    return healthcareCNAEs.some(function (code) { return cnae.startsWith(code.replace('-', '')); });
}
/**
 * Rate limiting for CNPJ consultations
 */
var CNPJRateLimiter = /** @class */ (function () {
    function CNPJRateLimiter() {
    }
    CNPJRateLimiter.canMakeRequest = function (ip) {
        var _this = this;
        var now = Date.now();
        var requests = this.requests.get(ip) || [];
        // Remove old requests outside the window
        var validRequests = requests.filter(function (timestamp) { return now - timestamp < _this.WINDOW_MS; });
        if (validRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
            return false;
        }
        // Add current request
        validRequests.push(now);
        this.requests.set(ip, validRequests);
        return true;
    };
    CNPJRateLimiter.getRemainingRequests = function (ip) {
        var _this = this;
        var now = Date.now();
        var requests = this.requests.get(ip) || [];
        var validRequests = requests.filter(function (timestamp) { return now - timestamp < _this.WINDOW_MS; });
        return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - validRequests.length);
    };
    CNPJRateLimiter.getResetTime = function (ip) {
        var now = Date.now();
        var requests = this.requests.get(ip) || [];
        var oldestRequest = Math.min.apply(Math, requests);
        return new Date(oldestRequest + this.WINDOW_MS);
    };
    CNPJRateLimiter.requests = new Map();
    CNPJRateLimiter.MAX_REQUESTS_PER_MINUTE = 3;
    CNPJRateLimiter.WINDOW_MS = 60 * 1000; // 1 minute
    return CNPJRateLimiter;
}());
exports.CNPJRateLimiter = CNPJRateLimiter;
/**
 * Cache manager for CNPJ data
 */
var CNPJCache = /** @class */ (function () {
    function CNPJCache() {
    }
    CNPJCache.get = function (cnpj) {
        var clean = cleanCNPJ(cnpj);
        var cached = this.cache.get(clean);
        if (!cached || Date.now() > cached.expiry) {
            this.cache.delete(clean);
            return null;
        }
        return cached.data;
    };
    CNPJCache.set = function (cnpj, data) {
        var clean = cleanCNPJ(cnpj);
        this.cache.set(clean, {
            data: data,
            expiry: Date.now() + this.CACHE_DURATION
        });
    };
    CNPJCache.clear = function () {
        this.cache.clear();
    };
    CNPJCache.getCacheExpiry = function (cnpj) {
        var clean = cleanCNPJ(cnpj);
        var cached = this.cache.get(clean);
        return cached ? new Date(cached.expiry) : null;
    };
    CNPJCache.cache = new Map();
    CNPJCache.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    return CNPJCache;
}());
exports.CNPJCache = CNPJCache;
