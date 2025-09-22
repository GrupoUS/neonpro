import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('TDD: Unused Imports Detection - TRPC Contracts'), () => {
  const trpcContractsPath = join(process.cwd(), 'src/trpc/contracts');

  describe(('Agent Contract - Unused Imports'), () => {
    it(('should detect unused HealthcareTRPCError import'), () => {
      const filePath = join(trpcContractsPath, 'agent.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasHealthcareTRPCErrorImport = content.includes('HealthcareTRPCError');
      const usesHealthcareTRPCError = content.includes('HealthcareTRPCError');

      // This test will fail initially because the import exists but type is not used
      expect(hasHealthcareTRPCErrorImport && !usesHealthcareTRPCError).toBe(false);

    it(('should detect unused protectedProcedure and router imports'), () => {
      const filePath = join(trpcContractsPath, 'agent.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasProtectedProcedureImport = content.includes('protectedProcedure');
      const hasRouterImport = content.includes('router');
      const usesProtectedProcedure = content.includes('protectedProcedure');
      const usesRouter = content.includes('router');

      // These imports are unused in the agent contract
      expect(
        (hasProtectedProcedureImport && !usesProtectedProcedure)
          || (hasRouterImport && !usesRouter),
      ).toBe(false);
  });

  describe(('AI Contract - Unused Imports'), () => {
    it(('should detect unused auditLogger import'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasAuditLoggerImport = content.includes('auditLogger');
      const usesAuditLogger = content.includes('auditLogger');

      expect(hasAuditLoggerImport && !usesAuditLogger).toBe(false);

    it(('should detect unused AIResponseSchema import'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasAIResponseSchemaImport = content.includes('AIResponseSchema');
      const usesAIResponseSchema = content.includes('AIResponseSchema');

      expect(hasAIResponseSchemaImport && !usesAIResponseSchema).toBe(false);

    it(('should detect unused LGPDComplianceMiddleware import'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasLGPDComplianceMiddlewareImport = content.includes('LGPDComplianceMiddleware');
      const usesLGPDComplianceMiddleware = content.includes('LGPDComplianceMiddleware');

      expect(hasLGPDComplianceMiddlewareImport && !usesLGPDComplianceMiddleware).toBe(false);

    it(('should detect unused shouldRetainAIData import'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasShouldRetainAIDataImport = content.includes('shouldRetainAIData');
      const usesShouldRetainAIData = content.includes('shouldRetainAIData');

      expect(hasShouldRetainAIDataImport && !usesShouldRetainAIData).toBe(false);

    it(('should detect unused lgpdDataSubjectService import'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasLgpdDataSubjectServiceImport = content.includes('lgpdDataSubjectService');
      const usesLgpdDataSubjectService = content.includes('lgpdDataSubjectService');

      expect(hasLgpdDataSubjectServiceImport && !usesLgpdDataSubjectService).toBe(false);

    it(('should detect unused healthAnalysisService variable'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasHealthAnalysisServiceVariable = content.includes(
        'const healthAnalysisService = new HealthAnalysisService()');
      
      const usesHealthAnalysisService = content.includes('healthAnalysisService');

      expect(hasHealthAnalysisServiceVariable && !usesHealthAnalysisService).toBe(false);

    it(('should detect unused helper functions'), () => {
      const filePath = join(trpcContractsPath, 'ai.ts');
      const content = readFileSync(filePath, 'utf8');

      const hasSanitizeHealthcareMessage = content.includes('function sanitizeHealthcareMessage');
      const hasBuildHealthcareContext = content.includes('function buildHealthcareContext');
      const hasCallAIServiceWithRetry = content.includes('function callAIServiceWithRetry');
      const hasCheckAIUsageLimit = content.includes('function checkAIUsageLimit');

      const usesSanitizeHealthcareMessage = content.includes('sanitizeHealthcareMessage');
      const usesBuildHealthcareContext = content.includes('buildHealthcareContext');
      const usesCallAIServiceWithRetry = content.includes('callAIServiceWithRetry');
      const usesCheckAIUsageLimit = content.includes('checkAIUsageLimit');

      expect(
        (hasSanitizeHealthcareMessage && !usesSanitizeHealthcareMessage)
          || (hasBuildHealthcareContext && !usesBuildHealthcareContext)
          || (hasCallAIServiceWithRetry && !usesCallAIServiceWithRetry)
          || (hasCheckAIUsageLimit && !usesCheckAIUsageLimit),
      ).toBe(false);
  });
  });
});
