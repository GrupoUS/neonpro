/**
 * @neonpro/security - Security utilities and middleware for NeonPro
 * Provides encryption, authentication, authorization, and security middleware
 */

// Version export
export const SECURITY_VERSION = '1.0.0';

// Core encryption and key management
export {
  EncryptionManager,
  KeyManager,
  encryptionManager,
  keyManager,
} from './encryption';

// Security utilities and validation
export {
  SecurityUtils,
  RateLimiter,
  securityUtils,
  rateLimiter,
} from './utils';

// Security middleware for Hono framework
export {
  securityHeaders,
  inputValidation,
  rateLimiting,
  csrfProtection,
  authentication,
  authorization,
  requestId,
  securityLogging,
  healthcareDataProtection,
  getSecurityMiddlewareStack,
  getProtectedRoutesMiddleware,
} from './middleware';

// Import required classes for default export
import {
  EncryptionManager,
  KeyManager,
  encryptionManager,
  keyManager,
} from './encryption';

import {
  SecurityUtils,
  RateLimiter,
  securityUtils,
  rateLimiter,
} from './utils';

import {
  securityHeaders,
  inputValidation,
  rateLimiting,
  csrfProtection,
  authentication,
  authorization,
  requestId,
  securityLogging,
  healthcareDataProtection,
  getSecurityMiddlewareStack,
  getProtectedRoutesMiddleware,
} from './middleware';

// Default export with all components
export default {
  version: SECURITY_VERSION,
  
  // Core classes
  EncryptionManager,
  KeyManager,
  SecurityUtils,
  RateLimiter,
  
  // Singleton instances
  encryptionManager,
  keyManager,
  securityUtils,
  rateLimiter,
  
  // Middleware functions
  securityHeaders,
  inputValidation,
  rateLimiting,
  csrfProtection,
  authentication,
  authorization,
  requestId,
  securityLogging,
  healthcareDataProtection,
  getSecurityMiddlewareStack,
  getProtectedRoutesMiddleware,
  
  // Convenience exports
  utils: {
    SecurityUtils,
    RateLimiter,
    securityUtils,
    rateLimiter,
  },
  
  encryption: {
    EncryptionManager,
    KeyManager,
    encryptionManager,
    keyManager,
  },
  
  middleware: {
    securityHeaders,
    inputValidation,
    rateLimiting,
    csrfProtection,
    authentication,
    authorization,
    requestId,
    securityLogging,
    healthcareDataProtection,
    getSecurityMiddlewareStack,
    getProtectedRoutesMiddleware,
  },
};

// Re-export Hono types for convenience
export type { Context, Next } from 'hono';
