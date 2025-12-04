/**
 * @fileoverview Security infrastructure for NeonPro healthcare platform
 * @version 0.1.0
 *
 * Provides encryption, hashing, and masking for PII data
 * LGPD Article 46 - Security measures for personal data protection
 */

export const SECURITY_VERSION = '0.1.0';

// Encryption functions for PII data (CPF, RG, etc.)
export {
  encryptPII,
  decryptPII,
  hashPII,
  maskPII,
  isEncrypted,
  encryptPIIFields,
  decryptPIIFields,
  testEncryption,
} from './encryption';

export default {
  version: SECURITY_VERSION,
};
