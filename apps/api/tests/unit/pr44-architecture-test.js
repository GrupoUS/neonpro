import { describe, expect, it } from 'vitest';

// Test architecture fixes for PR #44
describe('PR #44 Architecture Tests', () => {
  it('should not have auditTrail misuse for state management', () => {
    const fs = require('fs');
    const path = require('path');

    // Read the crud.ts file
    const crudPath = path.join(__dirname, '../../src/trpc/routers/crud.ts');
    const content = fs.readFileSync(crudPath, 'utf8');

    // Check that auditTrail is not used for state management
    const auditTrailStatePatterns = [
      /auditTrail\.findFirst.*operationId/,
      /auditTrail\.create.*state/,
      /auditTrail\.update.*status/,
    ];

    for (const pattern of auditTrailStatePatterns) {
      const matches = content.match(pattern);
      expect(matches).toBeNull();
    }
  });

  it('should use proper state management service', () => {
    const fs = require('fs');
    const path = require('path');

    // Read the crud.ts file
    const crudPath = path.join(__dirname, '../../src/trpc/routers/crud.ts');
    const content = fs.readFileSync(crudPath, 'utf8');

    // Check that operation state service is used
    expect(content).toContain('createOperationStateService');
    expect(content).toContain('createAuditTrailCompatibility');
  });

  it('should have compatibility layer for auditTrail', () => {
    const fs = require('fs');
    const path = require('path');

    // Check that compatibility service exists
    const compatibilityPath = path.join(
      __dirname,
      '../../src/services/audit-trail-compatibility.ts',
    );
    const exists = fs.existsSync(compatibilityPath);
    expect(exists).toBe(true);

    if (exists) {
      const content = fs.readFileSync(compatibilityPath, 'utf8');
      expect(content).toContain('findFirstWithOperationId');
      expect(content).toContain('findFirstWithConfirmationId');
    }
  });

  it('should have proper operation state models', () => {
    const fs = require('fs');
    const path = require('path');

    // Check schema for operation state models
    const schemaPath = path.join(__dirname, '../../../database/prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf8');

    expect(content).toContain('model OperationState');
    expect(content).toContain('operation_id');
    expect(content).toContain('step');
    expect(content).toContain('status');
  });
});
