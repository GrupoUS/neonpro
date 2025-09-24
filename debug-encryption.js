// Debug script to test encryption
import * as crypto from 'crypto';

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.keyLength = 32;
    this.ivLength = 16;
  }

  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('base64');
  }

  validateKey(key) {
    try {
      const buffer = Buffer.from(key, 'base64');
      return buffer.length === this.keyLength;
    } catch {
      return false;
    }
  }

  encryptData(data, key) {
    if (!this.validateKey(key)) {
      throw new Error('Invalid encryption key');
    }

    const iv = crypto.randomBytes(this.ivLength);

    try {
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(key, 'base64'),
        iv,
      );

      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Combine IV + encrypted data and encode as base64
      const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decryptData(encryptedData, key) {
    if (!this.validateKey(key)) {
      throw new Error('Invalid encryption key');
    }

    try {
      const combined = Buffer.from(encryptedData, 'base64');

      // Extract IV (first 16 bytes) and encrypted data (rest)
      const iv = combined.subarray(0, this.ivLength);
      const encrypted = combined.subarray(this.ivLength);

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(key, 'base64'),
        iv,
      );

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Invalid encrypted data');
    }
  }

  hashData(data) {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }
}

// Test the encryption
const manager = new EncryptionManager();
const testKey = manager.generateKey();
console.log('Generated key:', testKey);
console.log('Key valid:', manager.validateKey(testKey));

const testData = 'Simple text';
console.log('Original data:', testData);

const encrypted = manager.encryptData(testData, testKey);
console.log('Encrypted:', encrypted);

const decrypted = manager.decryptData(encrypted, testKey);
console.log('Decrypted:', decrypted);

console.log('Match:', testData === decrypted);

// Test hashing
const hash1 = manager.hashData('Test data 1');
const hash2 = manager.hashData('Test data 2');
console.log('Hash 1:', hash1);
console.log('Hash 2:', hash2);
console.log('Hashes different:', hash1 !== hash2);

const sameHash1 = manager.hashData('Same data');
const sameHash2 = manager.hashData('Same data');
console.log('Same hash 1:', sameHash1);
console.log('Same hash 2:', sameHash2);
console.log('Same hashes match:', sameHash1 === sameHash2);