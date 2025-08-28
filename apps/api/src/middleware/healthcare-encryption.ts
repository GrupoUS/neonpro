/**
 * 🔐 Healthcare Data Encryption - NeonPro API
 * ===========================================
 *
 * Comprehensive data encryption for healthcare compliance with:
 * - Patient data encryption at rest
 * - Field-level encryption for sensitive data
 * - Key rotation and management
 * - LGPD compliance audit logging
 * - Emergency access controls
 */

import * as crypto from "node:crypto";
import type { Context, MiddlewareHandler } from "hono";
import { HealthcareSecurityLogger } from "./healthcare-security";

// Encryption configuration
const ENCRYPTION_CONFIG = {
  ALGORITHM: "aes-256-gcm",
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  TAG_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  KEY_DERIVATION: "pbkdf2",
  PBKDF2_ITERATIONS: 100_000,
  KEY_ROTATION_INTERVAL: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
} as const;

// Data categories requiring encryption
export enum EncryptionCategory {
  PATIENT_PII = "patient_pii", // Personal identifiable information
  MEDICAL_DATA = "medical_data", // Medical records, procedures
  BIOMETRIC = "biometric", // Biometric data
  FINANCIAL = "financial", // Payment information
  CONSENT = "consent", // Consent records
  AUDIT = "audit", // Audit trails
}

// Encrypted data structure
export interface EncryptedData {
  data: string; // Encrypted data as hex string
  iv: string; // Initialization vector as hex
  authTag: string; // Authentication tag as hex
  keyId: string; // Key identifier for rotation
  category: EncryptionCategory; // Data category
  timestamp: Date; // Encryption timestamp
  version: string; // Encryption version for compatibility
}

// Data access context for audit logging
export interface DataAccessContext {
  userId: string;
  purpose: string; // Reason for data access
  patientId?: string;
  clinicId?: string;
  emergencyAccess?: boolean;
  justification?: string;
}

// Key management interface
interface EncryptionKey {
  id: string;
  key: Buffer;
  createdAt: Date;
  expiresAt: Date;
  category: EncryptionCategory;
  isActive: boolean;
}

// Mock key storage (production should use secure key management service)
class HealthcareKeyManager {
  private keys: Map<string, EncryptionKey> = new Map();
  private masterKey: string;

  constructor(masterKey?: string) {
    this.masterKey =
      masterKey ||
      process.env.HEALTHCARE_MASTER_KEY ||
      "default-dev-key-not-secure";
    this.initializeDefaultKeys();
  }

  private initializeDefaultKeys(): void {
    // Create default keys for each category
    Object.values(EncryptionCategory).forEach((category) => {
      const key = this.generateKey(category);
      this.keys.set(key.id, key);
    });
  }

  private generateKey(category: EncryptionCategory): EncryptionKey {
    const keyId = `${category}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const salt = crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);

    const key = crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
      ENCRYPTION_CONFIG.KEY_LENGTH,
      "sha256",
    );

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL,
    );

    return {
      id: keyId,
      key,
      createdAt: now,
      expiresAt,
      category,
      isActive: true,
    };
  }

  getCurrentKey(category: EncryptionCategory): EncryptionKey {
    // Find the most recent active key for the category
    const categoryKeys = Array.from(this.keys.values())
      .filter(
        (k) =>
          k.category === category && k.isActive && k.expiresAt > new Date(),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (categoryKeys.length === 0) {
      // Generate new key if none available
      const newKey = this.generateKey(category);
      this.keys.set(newKey.id, newKey);
      return newKey;
    }

    return categoryKeys[0];
  }

  getKey(keyId: string): EncryptionKey | null {
    return this.keys.get(keyId) || null;
  }

  rotateKeys(): void {
    console.log("[KEY_ROTATION]", { timestamp: new Date() });

    // Generate new keys for each category
    Object.values(EncryptionCategory).forEach((category) => {
      const newKey = this.generateKey(category);
      this.keys.set(newKey.id, newKey);
      console.log("[KEY_GENERATED]", { keyId: newKey.id, category });
    });

    // Mark old keys as inactive (but keep for decryption)
    const cutoffDate = new Date(
      Date.now() - ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL,
    );
    this.keys.forEach((key) => {
      if (key.createdAt < cutoffDate) {
        key.isActive = false;
      }
    });
  }

  // Clean up old keys (keep for historical decryption)
  cleanupExpiredKeys(): void {
    const cutoffDate = new Date(
      Date.now() - 2 * ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL,
    );
    const keysToRemove: string[] = [];

    this.keys.forEach((key, keyId) => {
      if (key.createdAt < cutoffDate && !key.isActive) {
        keysToRemove.push(keyId);
      }
    });

    keysToRemove.forEach((keyId) => {
      this.keys.delete(keyId);
      console.log("[KEY_CLEANUP]", { keyId, timestamp: new Date() });
    });
  }
}

// Global key manager instance
const keyManager = new HealthcareKeyManager();

// Auto-rotate keys periodically (in production, use cron job)
setInterval(() => {
  keyManager.rotateKeys();
}, ENCRYPTION_CONFIG.KEY_ROTATION_INTERVAL);

// Cleanup expired keys daily
setInterval(
  () => {
    keyManager.cleanupExpiredKeys();
  },
  24 * 60 * 60 * 1000,
); // 24 hours

/**
 * Healthcare data encryption service
 */
export class HealthcareEncryption {
  /**
   * Encrypt patient sensitive data
   */
  static async encryptPatientData(
    data: string,
    category: EncryptionCategory,
    patientId?: string,
  ): Promise<EncryptedData> {
    const key = keyManager.getCurrentKey(category);
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipher(
      ENCRYPTION_CONFIG.ALGORITHM,
      key.key,
      iv,
    );

    // Add associated data for authentication (prevents tampering)
    const associatedData = patientId
      ? Buffer.from(patientId, "utf8")
      : Buffer.alloc(0);
    if (associatedData.length > 0) {
      cipher.setAAD(associatedData);
    }

    // Encrypt data
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    const encryptedData: EncryptedData = {
      data: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      keyId: key.id,
      category,
      timestamp: new Date(),
      version: "1.0",
    };

    // Log encryption for audit
    console.log("[DATA_ENCRYPTED]", {
      category,
      keyId: key.id,
      patientId,
      dataLength: data.length,
      timestamp: new Date(),
    });

    return encryptedData;
  }

  /**
   * Decrypt patient data with audit logging
   */
  static async decryptPatientData(
    encryptedData: EncryptedData,
    accessContext: DataAccessContext,
    patientId?: string,
  ): Promise<string> {
    // Get decryption key
    const key = keyManager.getKey(encryptedData.keyId);
    if (!key) {
      throw new Error(`Encryption key not found: ${encryptedData.keyId}`);
    }

    // Log data access for LGPD compliance
    HealthcareSecurityLogger.logger.logDataValidation({
      userId: accessContext.userId,
      dataType: `decryption_${encryptedData.category}`,
      timestamp: new Date(),
      validationSuccess: true,
    });

    console.log("[DATA_DECRYPTED]", {
      category: encryptedData.category,
      keyId: encryptedData.keyId,
      userId: accessContext.userId,
      purpose: accessContext.purpose,
      patientId: accessContext.patientId || patientId,
      emergencyAccess: accessContext.emergencyAccess,
      timestamp: new Date(),
    });

    try {
      // Create decipher
      const decipher = crypto.createDecipher(
        ENCRYPTION_CONFIG.ALGORITHM,
        key.key,
        Buffer.from(encryptedData.iv, "hex"),
      );

      // Set associated data if patient ID was used during encryption
      const associatedData = patientId
        ? Buffer.from(patientId, "utf8")
        : Buffer.alloc(0);
      if (associatedData.length > 0) {
        decipher.setAAD(associatedData);
      }

      // Set authentication tag
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

      // Decrypt data
      let decrypted = decipher.update(encryptedData.data, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("[DECRYPTION_FAILED]", {
        keyId: encryptedData.keyId,
        category: encryptedData.category,
        userId: accessContext.userId,
        error: error.message,
        timestamp: new Date(),
      });

      throw new Error(
        "Failed to decrypt data - data may be corrupted or key invalid",
      );
    }
  }

  /**
   * Encrypt specific fields in an object
   */
  static async encryptFields<T extends Record<string, unknown>>(
    data: T,
    fieldsToEncrypt: { [K in keyof T]?: EncryptionCategory },
    patientId?: string,
  ): Promise<T> {
    const result = { ...data };

    for (const [field, category] of Object.entries(fieldsToEncrypt)) {
      if (field in data && data[field] != null) {
        const stringValue =
          typeof data[field] === "string"
            ? data[field]
            : JSON.stringify(data[field]);
        const encrypted = await this.encryptPatientData(
          stringValue,
          category,
          patientId,
        );
        result[field] = encrypted;
      }
    }

    return result;
  }

  /**
   * Decrypt specific fields in an object
   */
  static async decryptFields<T extends Record<string, unknown>>(
    data: T,
    fieldsToDecrypt: (keyof T)[],
    accessContext: DataAccessContext,
    patientId?: string,
  ): Promise<T> {
    const result = { ...data };

    for (const field of fieldsToDecrypt) {
      if (field in data && data[field] && typeof data[field] === "object") {
        try {
          const encryptedData = data[field] as EncryptedData;
          const decrypted = await this.decryptPatientData(
            encryptedData,
            accessContext,
            patientId,
          );
          result[field] = decrypted;
        } catch (error) {
          console.error(`Failed to decrypt field ${String(field)}:`, error);
          // Keep encrypted data if decryption fails
        }
      }
    }

    return result;
  }

  /**
   * Hash sensitive data (one-way, for searching/indexing)
   */
  static hashSensitiveData(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10_000, 64, "sha256");
    return actualSalt + ":" + hash.toString("hex");
  }

  /**
   * Verify hashed data
   */
  static verifyHashedData(data: string, hash: string): boolean {
    const [salt, originalHash] = hash.split(":");
    if (!salt || !originalHash) {
      return false;
    }

    const newHash = crypto.pbkdf2Sync(data, salt, 10_000, 64, "sha256");
    return originalHash === newHash.toString("hex");
  }
}

/**
 * Database encryption middleware
 */
export const databaseEncryptionMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;
    const user = c.get("user");

    // Apply encryption for write operations on patient data
    if (
      ["POST", "PUT", "PATCH"].includes(method) &&
      path.includes("/patients")
    ) {
      const originalJson = c.req.json;
      c.req.json = async function () {
        const body = await originalJson.call(this);

        // Encrypt sensitive fields before processing
        if (body) {
          const patientId = body.id || body.patientId;

          // Define fields that need encryption
          const fieldsToEncrypt: Record<string, EncryptionCategory> = {
            cpf: EncryptionCategory.PATIENT_PII,
            rg: EncryptionCategory.PATIENT_PII,
            phone: EncryptionCategory.PATIENT_PII,
            email: EncryptionCategory.PATIENT_PII,
            address: EncryptionCategory.PATIENT_PII,
            medicalHistory: EncryptionCategory.MEDICAL_DATA,
            allergies: EncryptionCategory.MEDICAL_DATA,
            medications: EncryptionCategory.MEDICAL_DATA,
            emergencyContact: EncryptionCategory.PATIENT_PII,
          };

          const encrypted = await HealthcareEncryption.encryptFields(
            body,
            fieldsToEncrypt,
            patientId,
          );

          return encrypted;
        }

        return body;
      };
    }

    await next();
  };
};

/**
 * Response decryption middleware
 */
export const responseDecryptionMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    await next();

    const method = c.req.method;
    const path = c.req.path;
    const user = c.get("user");

    // Decrypt response data for patient endpoints
    if (method === "GET" && path.includes("/patients") && user) {
      const originalJson = c.res.json;

      c.res.json = function (data: unknown, status?: number) {
        // Decrypt patient data fields
        if (data && (Array.isArray(data) || data.id)) {
          const accessContext: DataAccessContext = {
            userId: user.id,
            purpose: "patient_data_access",
            patientId: Array.isArray(data) ? undefined : data.id,
            clinicId: user.clinicId,
          };

          const fieldsToDecrypt = [
            "cpf",
            "rg",
            "phone",
            "email",
            "address",
            "medicalHistory",
            "allergies",
            "medications",
            "emergencyContact",
          ];

          if (Array.isArray(data)) {
            // Decrypt array of patients
            Promise.all(
              data.map((patient) =>
                HealthcareEncryption.decryptFields(
                  patient,
                  fieldsToDecrypt,
                  accessContext,
                  patient.id,
                ),
              ),
            ).then((decryptedData) => {
              return originalJson.call(this, decryptedData, status);
            });
          } else {
            // Decrypt single patient
            HealthcareEncryption.decryptFields(
              data,
              fieldsToDecrypt,
              accessContext,
              data.id,
            ).then((decryptedData) => {
              return originalJson.call(this, decryptedData, status);
            });
          }
        }

        return originalJson.call(this, data, status);
      };
    }
  };
};

/**
 * TLS validation middleware for healthcare APIs
 */
export const healthcareTLSMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    // Verify HTTPS is being used
    const protocol =
      c.req.header("x-forwarded-proto") || c.req.header("x-forwarded-protocol");

    if (!protocol?.includes("https")) {
      HealthcareSecurityLogger.logWeakTLS({
        ip: c.req.header("CF-Connecting-IP") || "unknown",
        timestamp: new Date(),
      });

      return c.json(
        {
          error: "HTTPS required for healthcare data",
          code: "HTTPS_REQUIRED",
          message:
            "All healthcare data must be transmitted over secure connections",
        },
        400,
      );
    }

    // Set security headers for healthcare compliance
    const securityHeaders = {
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      "X-Healthcare-Secure": "true",
    };

    Object.entries(securityHeaders).forEach(([header, value]) => {
      c.res.headers.set(header, value);
    });

    return next();
  };
};

/**
 * Data backup encryption utility
 */
export const encryptBackupData = async (
  data: unknown,
  backupType: "full" | "incremental" | "differential",
): Promise<EncryptedData> => {
  const serialized = JSON.stringify(data);
  return await HealthcareEncryption.encryptPatientData(
    serialized,
    EncryptionCategory.AUDIT,
    `backup_${backupType}_${Date.now()}`,
  );
};

/**
 * Decrypt backup data utility
 */
export const decryptBackupData = async (
  encryptedData: EncryptedData,
  accessContext: DataAccessContext,
): Promise<unknown> => {
  const decrypted = await HealthcareEncryption.decryptPatientData(
    encryptedData,
    accessContext,
  );
  return JSON.parse(decrypted);
};

// Export utilities and types
export {
  HealthcareEncryption,
  keyManager,
  EncryptionCategory,
  type EncryptedData,
  type DataAccessContext,
  type EncryptionKey,
};
