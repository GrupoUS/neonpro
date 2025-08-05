"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenEncryptionService = void 0;
var crypto_1 = require("crypto");
/**
 * Token Encryption Service for NeonPro OAuth Integration
 * Implements AES-256-GCM encryption for secure token storage
 * Based on security best practices from OAuth 2.0 specifications
 */
var ALGORITHM = 'aes-256-gcm';
var IV_LENGTH = 16; // For GCM, this is always 16 bytes
var SALT_LENGTH = 64; // 64 bytes salt for key derivation
var TAG_LENGTH = 16; // GCM authentication tag length
var KEY_LENGTH = 32; // 256 bits key
var TokenEncryptionService = /** @class */ (function () {
    function TokenEncryptionService() {
    }
    TokenEncryptionService.getEncryptionKey = function () {
        var key = process.env.OAUTH_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('OAUTH_ENCRYPTION_KEY environment variable is required');
        }
        if (key.length < 32) {
            throw new Error('OAUTH_ENCRYPTION_KEY must be at least 32 characters');
        }
        return key;
    };
    TokenEncryptionService.deriveKey = function (masterKey, salt) {
        return crypto_1.default.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512');
    };
    /**
     * Encrypts sensitive token data using AES-256-GCM
     */
    TokenEncryptionService.encryptToken = function (token) {
        try {
            var masterKey = this.getEncryptionKey();
            var salt = crypto_1.default.randomBytes(SALT_LENGTH);
            var iv = crypto_1.default.randomBytes(IV_LENGTH);
            var key = this.deriveKey(masterKey, salt);
            var cipher = crypto_1.default.createCipher(ALGORITHM, key);
            cipher.setAAD(Buffer.from('neonpro-oauth-token'));
            var encrypted = cipher.update(token, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            var tag = cipher.getAuthTag();
            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                salt: salt.toString('hex'),
                tag: tag.toString('hex')
            };
        }
        catch (error) {
            throw new Error("Token encryption failed: ".concat(error instanceof Error ? error.message : 'Unknown error'));
        }
    };
    /**
     * Decrypts token data using stored encryption parameters
     */
    TokenEncryptionService.decryptToken = function (encryptionData) {
        try {
            var masterKey = this.getEncryptionKey();
            var salt = Buffer.from(encryptionData.salt, 'hex');
            var iv = Buffer.from(encryptionData.iv, 'hex');
            var tag = Buffer.from(encryptionData.tag, 'hex');
            var key = this.deriveKey(masterKey, salt);
            var decipher = crypto_1.default.createDecipher(ALGORITHM, key);
            decipher.setAAD(Buffer.from('neonpro-oauth-token'));
            decipher.setAuthTag(tag);
            var decrypted = decipher.update(encryptionData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error("Token decryption failed: ".concat(error instanceof Error ? error.message : 'Unknown error'));
        }
    };
    /**
     * Securely compares two strings to prevent timing attacks
     */
    TokenEncryptionService.secureCompare = function (a, b) {
        if (a.length !== b.length) {
            return false;
        }
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    };
    /**
     * Generates a cryptographically secure random state parameter
     */
    TokenEncryptionService.generateSecureState = function () {
        return crypto_1.default.randomBytes(32).toString('hex');
    };
    /**
     * Generates a secure nonce for CSRF protection
     */
    TokenEncryptionService.generateNonce = function () {
        return crypto_1.default.randomBytes(16).toString('hex');
    };
    /**
     * Validates encryption data format
     */
    TokenEncryptionService.validateEncryptionData = function (data) {
        return (typeof data === 'object' &&
            typeof data.encrypted === 'string' &&
            typeof data.iv === 'string' &&
            typeof data.salt === 'string' &&
            typeof data.tag === 'string');
    };
    return TokenEncryptionService;
}());
exports.TokenEncryptionService = TokenEncryptionService;
