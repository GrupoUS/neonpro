import { describe, it, expect } from 'vitest';
import { authenticate, extractClinicId } from '../auth/index.js';

describe('Authentication Core', () => {
  describe('authenticate', () => {
    it('should validate valid JWT tokens', async () => {
      // Mock JWT token (simplified for testing)
      const validToken = btoa(JSON.stringify({ header: 'mock' })) + '.' + 
                        btoa(JSON.stringify({ 
                          sub: 'user123', 
                          clinic_id: 'clinic456',
                          role: 'professional',
                          permissions: ['read:appointments']
                        })) + '.' + 'signature';
      
      const result = await authenticate(validToken);
      
      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.sub).toBe('user123');
      expect(result.user?.clinic_id).toBe('clinic456');
    });
    
    it('should reject invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';
      const result = await authenticate(invalidToken);
      
      expect(result.error).toBe('Invalid token');
      expect(result.user).toBeNull();
    });

    it('should handle missing tokens', async () => {
      const result = await authenticate('');
      
      expect(result.error).toBe('No token provided');
      expect(result.user).toBeNull();
    });

    it('should handle Bearer prefix', async () => {
      const validToken = btoa(JSON.stringify({ header: 'mock' })) + '.' + 
                        btoa(JSON.stringify({ 
                          sub: 'user123', 
                          clinic_id: 'clinic456',
                          role: 'professional',
                          permissions: ['read:appointments']
                        })) + '.' + 'signature';
      
      const result = await authenticate(`Bearer ${validToken}`);
      
      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
    });
  });

  describe('extractClinicId', () => {
    it('should extract clinic ID from valid token', () => {
      const token = btoa(JSON.stringify({ header: 'mock' })) + '.' + 
                   btoa(JSON.stringify({ clinic_id: 'clinic789' })) + '.' + 'signature';
      
      const clinicId = extractClinicId(token);
      expect(clinicId).toBe('clinic789');
    });

    it('should return null for invalid token', () => {
      const clinicId = extractClinicId('invalid.token');
      expect(clinicId).toBeNull();
    });

    it('should return null for token without clinic_id', () => {
      const token = btoa(JSON.stringify({ header: 'mock' })) + '.' + 
                   btoa(JSON.stringify({ sub: 'user123' })) + '.' + 'signature';
      
      const clinicId = extractClinicId(token);
      expect(clinicId).toBeNull();
    });
  });
});