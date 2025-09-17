/**
 * Healthcare Components Integration Test
 * 
 * Simple smoke test to verify healthcare components are properly exported
 * and can be imported without errors.
 */

import { describe, it, expect } from 'vitest';

describe('Healthcare Components Integration', () => {
  it('should export healthcare validation utilities', async () => {
    const { healthcareValidationSchemas, DataSensitivity, ConsentType } = await import(
      '@neonpro/ui/utils'
    );
    
    expect(healthcareValidationSchemas).toBeDefined();
    expect(DataSensitivity).toBeDefined();
    expect(ConsentType).toBeDefined();
  });
  
  it('should export accessibility utilities', async () => {
    const { announceToScreenReader, HealthcarePriority, generateAccessibleId } = await import(
      '@neonpro/ui/utils'
    );
    
    expect(announceToScreenReader).toBeDefined();
    expect(HealthcarePriority).toBeDefined();
    expect(generateAccessibleId).toBeDefined();
  });
  
  it('should export healthcare theme provider', async () => {
    const { HealthcareThemeProvider, useHealthcareTheme } = await import(
      '@neonpro/ui'
    );
    
    expect(HealthcareThemeProvider).toBeDefined();
    expect(useHealthcareTheme).toBeDefined();
  });
  
  it('should export LGPD consent banner', async () => {
    const { LGPDConsentBanner, useLGPDConsent } = await import(
      '@neonpro/ui'
    );
    
    expect(LGPDConsentBanner).toBeDefined();
    expect(useLGPDConsent).toBeDefined();
  });
  
  it('should export healthcare form components', async () => {
    const { HealthcareForm, HealthcareTextField, HealthcareSelect } = await import(
      '@neonpro/ui'
    );
    
    expect(HealthcareForm).toBeDefined();
    expect(HealthcareTextField).toBeDefined();
    expect(HealthcareSelect).toBeDefined();
  });
});