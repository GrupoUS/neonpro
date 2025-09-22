/**
 * Tests for encryption utilities
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { EncryptionManager, KeyManager } from '../encryption';

describe('EncryptionManager_, () => {
  let encryptionManager: EncryptionManager;
  let testKey: string;

  beforeEach(() => {
    encryptionManager = new EncryptionManager(
    testKey = encryptionManager.generateKey(
  }

  describe('Key Generation_, () => {
    it('should generate a valid encryption key_, () => {
<<<<<<< HEAD
      const key = encryptionManager.generateKey(
      expect(key).toBeDefined(
      expect(typeof key).toBe('string')
=======
      const key = encryptionManager.generateKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
>>>>>>> origin/main
      expect(encryptionManager.validateKey(key)).toBe(true);
    }

    it('should validate keys correctly_, () => {
<<<<<<< HEAD
      const validKey = encryptionManager.generateKey(
=======
      const validKey = encryptionManager.generateKey();
>>>>>>> origin/main
      expect(encryptionManager.validateKey(validKey)).toBe(true);

      expect(encryptionManager.validateKey('invalid')).toBe(false);
      expect(encryptionManager.validateKey(')).toBe(false);
      expect(encryptionManager.validateKey('short')).toBe(false);
    }
  }

  describe('Data Encryption/Decryption_, () => {
    it('should encrypt and decrypt data correctly_, () => {
      const plaintext = 'Sensitive healthcare data';
      const encrypted = encryptionManager.encryptData(plaintext, testKey
      const decrypted = encryptionManager.decryptData(encrypted, testKey

      expect(encrypted).toBeDefined(
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(plaintext
      expect(decrypted).toBe(plaintext
    }

    it('should handle different data types_, () => {
      const testCases = [
        'Simple text',
        'Text with numbers 123',
        'Text with special chars !@#$%',
        'Text with emojis 👨‍⚕️🏥',
        'Long text '.repeat(100),
      ];

      testCases.forEach(text => {
        const encrypted = encryptionManager.encryptData(text, testKey
        const decrypted = encryptionManager.decryptData(encrypted, testKey
        expect(decrypted).toBe(text
      }
    }

    it('should throw error for invalid key_, () => {
      const plaintext = 'Test data';

      expect(() => {
        encryptionManager.encryptData(plaintext, 'invalid')
      }).toThrow('Invalid encryption key')

      expect(() => {
        encryptionManager.decryptData('encrypted', 'invalid')
      }).toThrow('Invalid decryption key')
    }

    it('should throw error for invalid encrypted data_, () => {
      expect(() => {
        encryptionManager.decryptData('invalid', testKey
      }).toThrow(
    }
  }

  describe('Object Encryption/Decryption_, () => {
    it('should encrypt and decrypt object fields_, () => {
      const obj = {
        name: 'John Doe',
        cpf: '12345678900',
        email: 'john@example.com',
        age: 30,
        active: true,
      };

      const sensitiveFields = ['cpf', 'email'];
      const encrypted = encryptionManager.encryptObject(
        obj,
        testKey,
        sensitiveFields,
      
      const decrypted = encryptionManager.decryptObject(
        encrypted,
        testKey,
        sensitiveFields,
      

      expect(decrypted.name).toBe(obj.name
      expect(decrypted.cpf).toBe(obj.cpf
      expect(decrypted.email).toBe(obj.email
      expect(decrypted.age).toBe(obj.age
      expect(decrypted.active).toBe(obj.active
    }

    it('should not encrypt non-sensitive fields_, () => {
      const obj = {
        name: 'John Doe',
        cpf: '12345678900',
        age: 30,
      };

      const sensitiveFields = ['cpf'];
      const encrypted = encryptionManager.encryptObject(
        obj,
        testKey,
        sensitiveFields,
      

      expect(encrypted.name).toBe(obj.name); // Not encrypted
      expect(encrypted.age).toBe(obj.age); // Not encrypted
      expect(encrypted.cpf).not.toBe(obj.cpf); // Encrypted
    }

    it('should handle missing fields gracefully_, () => {
      const obj = {
        name: 'John Doe',
        age: 30,
      };

      const sensitiveFields = ['cpf', 'email'];
      const encrypted = encryptionManager.encryptObject(
        obj,
        testKey,
        sensitiveFields,
      
      const decrypted = encryptionManager.decryptObject(
        encrypted,
        testKey,
        sensitiveFields,
      

      expect(decrypted.name).toBe(obj.name
      expect(decrypted.age).toBe(obj.age
      expect(decrypted.cpf).toBeUndefined(
      expect(decrypted.email).toBeUndefined(
    }
  }

  describe('Data Hashing_, () => {
    it('should generate consistent hashes_, () => {
      const data = 'Test data';
      const hash1 = encryptionManager.hashData(data
      const hash2 = encryptionManager.hashData(data

      expect(hash1).toBeDefined(
      expect(typeof hash1).toBe('string')
      expect(hash1).toBe(hash2
    }

    it('should generate different hashes for different data_, () => {
      const data1 = 'Test data 1';
      const data2 = 'Test data 2';
      const hash1 = encryptionManager.hashData(data1
      const hash2 = encryptionManager.hashData(data2

      expect(hash1).not.toBe(hash2
    }

    it('should compare hashes correctly_, () => {
      const data = 'Test data';
      const hash = encryptionManager.hashData(data

      expect(encryptionManager.compareHash(data, hash)).toBe(true);
      expect(encryptionManager.compareHash('Different data', hash)).toBe(false);
    }
  }
}

describe('KeyManager_, () => {
  let keyManager: KeyManager;
  let testKeyId: string;
  let testKey: string;

  beforeEach(() => {
    // Reset singleton for each test
    (KeyManager as any).instance = null;
    keyManager = KeyManager.getInstance(
    testKeyId = 'test-key';
    testKey = new EncryptionManager().generateKey(
  }

  describe('Key Storage_, () => {
    it('should store and retrieve keys_, () => {
<<<<<<< HEAD
      keyManager.storeKey(testKeyId, testKey
      const retrievedKey = keyManager.getKey(testKeyId
=======
      keyManager.storeKey(testKeyId, testKey);
      const retrievedKey = keyManager.getKey(testKeyId);
>>>>>>> origin/main

      expect(retrievedKey).toBe(testKey
    }

    it('should return null for non-existent keys_, () => {
<<<<<<< HEAD
      const retrievedKey = keyManager.getKey('non-existent')
      expect(retrievedKey).toBeNull(
    }
=======
      const retrievedKey = keyManager.getKey('non-existent');
      expect(retrievedKey).toBeNull();
    });
>>>>>>> origin/main

    it('should handle key expiration_, () => {
      const expiredKey = 'expired-key';
      const expirationDate = new Date(Date.now() - 1000); // 1 second ago

      keyManager.storeKey(testKeyId, expiredKey, expirationDate
      const retrievedKey = keyManager.getKey(testKeyId

      expect(retrievedKey).toBeNull(
    }

    it('should remove keys_, () => {
<<<<<<< HEAD
      keyManager.storeKey(testKeyId, testKey
      expect(keyManager.getKey(testKeyId)).toBe(testKey
=======
      keyManager.storeKey(testKeyId, testKey);
      expect(keyManager.getKey(testKeyId)).toBe(testKey);
>>>>>>> origin/main

      keyManager.removeKey(testKeyId
      expect(keyManager.getKey(testKeyId)).toBeNull(
    }

    it('should list all stored keys_, () => {
<<<<<<< HEAD
      keyManager.storeKey('key1', 'value1')
      keyManager.storeKey('key2', 'value2')
      keyManager.storeKey('key3', 'value3')
=======
      keyManager.storeKey('key1', 'value1');
      keyManager.storeKey('key2', 'value2');
      keyManager.storeKey('key3', 'value3');
>>>>>>> origin/main

      const keys = keyManager.listKeys(
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
      expect(keys.length).toBe(3
    }
  }

  describe('Key Rotation_, () => {
    it('should rotate keys and keep old key for TTL_, () => {
      const oldKey = testKey;
      keyManager.storeKey(testKeyId, oldKey

      const newKey = keyManager.rotateKey(testKeyId, 3600); // 1 hour TTL

      expect(newKey).toBeDefined(
      expect(newKey).not.toBe(oldKey

      // New key should be retrievable
      expect(keyManager.getKey(testKeyId)).toBe(newKey

      // Old key should be available with old key ID
      expect(keyManager.getKey(`${testKeyId}_old`)).toBe(oldKey
    }

    it('should work even when no old key exists_, () => {
<<<<<<< HEAD
      const newKey = keyManager.rotateKey(testKeyId, 3600
=======
      const newKey = keyManager.rotateKey(testKeyId, 3600);
>>>>>>> origin/main

      expect(newKey).toBeDefined(
      expect(keyManager.getKey(testKeyId)).toBe(newKey
      expect(keyManager.getKey(`${testKeyId}_old`)).toBeNull(
    }
  }

  describe('Cleanup_, () => {
    it('should clean up expired keys_, () => {
      // Store keys with different expiration times
      keyManager.storeKey('expired1', 'value1', new Date(Date.now() - 1000)
      keyManager.storeKey('expired2', 'value2', new Date(Date.now() - 1000)
      keyManager.storeKey('valid', 'value3', new Date(Date.now() + 1000)

      expect(keyManager.listKeys().length).toBe(3

      keyManager.cleanup(

      const remainingKeys = keyManager.listKeys(
      expect(remainingKeys).toContain('valid')
      expect(remainingKeys).not.toContain('expired1')
      expect(remainingKeys).not.toContain('expired2')
      expect(remainingKeys.length).toBe(1
    }
  }
}
