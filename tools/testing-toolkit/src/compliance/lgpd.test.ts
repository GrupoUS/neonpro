/**
 * LGPD Compliance Tests
 *
 * Tests for LGPD (Lei Geral de Proteção de Dados) compliance validation
 * Brazilian data protection law compliance testing
 */

import { describe, it, expect } from 'vitest';
import {
  LGPDValidator,
  createLGPDTestSuite,
  createMockLGPDData,
} from './lgpd';

describe('LGPDValidator', () => {
  describe('validateConsent', () => {
    it('should return true for valid consent', () => {
      const data = createMockLGPDData({
        consentGiven: true,
        dataProcessingPurpose: 'Healthcare service provision',
      });
      expect(LGPDValidator.validateConsent(data)).toBe(true);
    });

    it('should return false for missing consent', () => {
      const data = createMockLGPDData({
        consentGiven: false,
        dataProcessingPurpose: 'Healthcare service provision',
      });
      expect(LGPDValidator.validateConsent(data)).toBe(false);
    });

    it('should return false for empty purpose', () => {
      const data = createMockLGPDData({
        consentGiven: true,
        dataProcessingPurpose: '',
      });
      expect(LGPDValidator.validateConsent(data)).toBe(false);
    });
  });

  describe('validateDataMinimization', () => {
    it('should return true for exact required fields', () => {
      const data = createMockLGPDData({
        personalData: {
          name: 'João Silva',
          email: 'joao@example.com',
        },
      });
      const requiredFields = ['name', 'email'];
      expect(LGPDValidator.validateDataMinimization(data, requiredFields)).toBe(true);
    });

    it('should return false for extra fields', () => {
      const data = createMockLGPDData({
        personalData: {
          name: 'João Silva',
          email: 'joao@example.com',
          extraField: 'extra',
        },
      });
      const requiredFields = ['name', 'email'];
      expect(LGPDValidator.validateDataMinimization(data, requiredFields)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      const data = createMockLGPDData({
        personalData: {
          name: 'João Silva',
        },
      });
      const requiredFields = ['name', 'email'];
      expect(LGPDValidator.validateDataMinimization(data, requiredFields)).toBe(false);
    });
  });

  describe('validateAuditTrail', () => {
    it('should return true for valid audit trail', () => {
      const data = createMockLGPDData({
        auditTrail: [
          {
            timestamp: new Date(),
            action: 'data_access',
            userId: 'user-123',
            dataType: 'personal_data',
            purpose: 'Healthcare service provision',
          },
        ],
      });
      expect(LGPDValidator.validateAuditTrail(data)).toBe(true);
    });

    it('should return false for empty audit trail', () => {
      const data = createMockLGPDData({
        auditTrail: [],
      });
      expect(LGPDValidator.validateAuditTrail(data)).toBe(false);
    });

    it('should return false for invalid audit entry', () => {
      const data = createMockLGPDData({
        auditTrail: [
          {
            timestamp: new Date(),
            action: 'data_access',
            userId: 'user-123',
            dataType: 'personal_data',
            purpose: '', // Invalid: empty purpose
          },
        ],
      });
      expect(LGPDValidator.validateAuditTrail(data)).toBe(false);
    });
  });

  describe('validateDataSubjectRights', () => {
    it('should return true for valid data subject rights', () => {
      const data = createMockLGPDData();
      expect(LGPDValidator.validateDataSubjectRights(data)).toBe(true);
    });

    it('should return false for missing rights', () => {
      const data = createMockLGPDData({
        dataSubjectRights: {
          accessRight: true,
          rectificationRight: true,
          erasureRight: true,
          portabilityRight: true,
          objectionRight: true,
        } as any, // Force cast to test missing properties
      });
      delete (data.dataSubjectRights as any).accessRight;
      expect(LGPDValidator.validateDataSubjectRights(data)).toBe(false);
    });
  });

  describe('validateCompliance', () => {
    it('should return compliant for valid data', () => {
      const data = createMockLGPDData();
      const requiredFields = ['name', 'email', 'cpf'];
      const result = LGPDValidator.validateCompliance(data, requiredFields);
      
      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it('should return violations for non-compliant data', () => {
      const data = createMockLGPDData({
        consentGiven: false,
        auditTrail: [],
      });
      const requiredFields = ['name', 'email', 'cpf'];
      const result = LGPDValidator.validateCompliance(data, requiredFields);
      
      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify specific violations', () => {
      const data = createMockLGPDData({
        consentGiven: false,
        auditTrail: [],
        personalData: { name: 'João' }, // Missing required fields
      });
      const requiredFields = ['name', 'email', 'cpf'];
      const result = LGPDValidator.validateCompliance(data, requiredFields);
      
      expect(result.violations).toContain('Invalid or missing consent');
      expect(result.violations).toContain('Incomplete or missing audit trail');
      expect(result.violations).toContain('Data minimization principle violated');
    });
  });
});

describe('createLGPDTestSuite', () => {
    it('should create comprehensive test suite', () => {
      const testData = createMockLGPDData();
      const requiredFields = ['name', 'email', 'cpf'];
      
      // This creates a describe block with multiple tests
      createLGPDTestSuite('Healthcare Data', testData, requiredFields);
    });
  });

describe('createMockLGPDData', () => {
  it('should create valid mock data by default', () => {
    const data = createMockLGPDData();
    
    expect(data.consentGiven).toBe(true);
    expect(data.dataProcessingPurpose).toBe('Healthcare service provision');
    expect(data.auditTrail).toHaveLength(1);
    expect(data.personalData).toHaveProperty('name');
    expect(data.personalData).toHaveProperty('email');
    expect(data.personalData).toHaveProperty('cpf');
  });

  it('should allow overriding default values', () => {
    const customData = {
      consentGiven: false,
      dataProcessingPurpose: 'Research purposes',
    };
    
    const data = createMockLGPDData(customData);
    
    expect(data.consentGiven).toBe(false);
    expect(data.dataProcessingPurpose).toBe('Research purposes');
  });

  it('should preserve other default values when overriding', () => {
    const customData = {
      personalData: {
        name: 'Maria Souza',
      },
    };
    
    const data = createMockLGPDData(customData);
    
    expect(data.personalData.name).toBe('Maria Souza');
    expect(data.consentGiven).toBe(true); // Default value
    expect(data.auditTrail).toHaveLength(1); // Default value
  });
});