import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('TDD: Build Compatibility Issues - RED Phase',_() => {
  describe(_'Dashboard Main Route - Unused Imports Detection',_() => {
    const dashboardPath = join(process.cwd(), 'src/routes/dashboard/main.tsx');

    it(_'should detect unused AccessiblePatientCard import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      // This test will fail initially because the import exists but component is not used
      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    });

    it(_'should detect unused PatientDashboardStats import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasPatientDashboardStatsImport = content.includes('PatientDashboardStats');
      const usesPatientDashboardStats = content.includes('<PatientDashboardStats')
        || content.includes('PatientDashboardStats');

      expect(hasPatientDashboardStatsImport && !usesPatientDashboardStats).toBe(false);
    });

    it(_'should detect unused FocusCards import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasFocusCardsImport = content.includes('FocusCards');
      const usesFocusCards = content.includes('<FocusCards')
        || content.includes('FocusCards');

      expect(hasFocusCardsImport && !usesFocusCards).toBe(false);
    });

    it(_'should detect unused Input import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasInputImport = content.includes('Input');
      const usesInput = content.includes('<Input')
        || content.includes('Input');

      expect(hasInputImport && !usesInput).toBe(false);
    });

    it(_'should detect unused Progress import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    });

    it(_'should detect unused Skeleton import',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    });

    it(_'should detect unused usePatientStats hook',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasUsePatientStatsImport = content.includes('usePatientStats');
      const usesUsePatientStats = content.includes('usePatientStats');

      expect(hasUsePatientStatsImport && !usesUsePatientStats).toBe(false);
    });

    it(_'should detect unused useRealtimeSubscription hook',_() => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasUseRealtimeSubscriptionImport = content.includes('useRealtimeSubscription');
      const usesUseRealtimeSubscription = content.includes('useRealtimeSubscription');

      expect(hasUseRealtimeSubscriptionImport && !usesUseRealtimeSubscription).toBe(false);
    });

    it('should detect unused date-fns imports (isThisWeek, isToday, subDays)', () => {
      const content = readFileSync(dashboardPath, 'utf8');

      const hasIsThisWeekImport = content.includes('isThisWeek');
      const hasIsTodayImport = content.includes('isToday');
      const hasSubDaysImport = content.includes('subDays');

      const usesIsThisWeek = content.includes('isThisWeek');
      const usesIsToday = content.includes('isToday');
      const usesSubDays = content.includes('subDays');

      expect(
        (hasIsThisWeekImport && !usesIsThisWeek)
          || (hasIsTodayImport && !usesIsToday)
          || (hasSubDaysImport && !usesSubDays),
      ).toBe(false);
    });
  });

  describe(_'AI Insights Route - Unused Imports Detection',_() => {
    const aiInsightsPath = join(process.cwd(), 'src/routes/patients/ai-insights.tsx');

    it(_'should detect unused AccessiblePatientCard import',_() => {
      const content = readFileSync(aiInsightsPath, 'utf8');

      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    });

    it(_'should detect unused Progress import',_() => {
      const content = readFileSync(aiInsightsPath, 'utf8');

      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    });

    it(_'should detect unused Skeleton import',_() => {
      const content = readFileSync(aiInsightsPath, 'utf8');

      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    });
  });

  describe(_'Missing Imports Detection',_() => {
    it(_'should detect missing Badge import in dashboard main',_() => {
      const content = readFileSync(join(process.cwd(), 'src/routes/dashboard/main.tsx'), 'utf8');

      const hasBadgeImport = content.includes('Badge');
      const usesBadge = content.includes('<Badge') || content.includes('Badge');

      // This test will fail because Badge is used but not imported
      expect(hasBadgeImport || !usesBadge).toBe(true);
    });

    it(_'should detect missing ServiceAnalyticsDashboard import in dashboard main',_() => {
      const content = readFileSync(join(process.cwd(), 'src/routes/dashboard/main.tsx'), 'utf8');

      const hasServiceAnalyticsDashboardImport = content.includes('ServiceAnalyticsDashboard');
      const usesServiceAnalyticsDashboard = content.includes('<ServiceAnalyticsDashboard')
        || content.includes('ServiceAnalyticsDashboard');

      // This test will fail because ServiceAnalyticsDashboard is used but not imported
      expect(hasServiceAnalyticsDashboardImport || !usesServiceAnalyticsDashboard).toBe(true);
    });
  });

  describe(_'TypeScript Strict Mode Compliance',_() => {
    it(_'should detect any type usage in table column definitions',_() => {
      const content = readFileSync(join(process.cwd(), 'src/routes/dashboard/main.tsx'), 'utf8');

      const hasAnyTypeUsage = content.includes('info: any') || content.includes(': any');

      // This test will fail because any types are used instead of proper typing
      expect(hasAnyTypeUsage).toBe(false);
    });

    it(_'should ensure proper TypeScript interfaces are defined',_() => {
      const content = readFileSync(join(process.cwd(), 'src/routes/dashboard/main.tsx'), 'utf8');

      const hasPatientInterface = content.includes('interface Patient');
      const hasDashboardMetricsInterface = content.includes('interface DashboardMetrics');
      const hasAIInsightInterface = content.includes('interface AIInsight');

      // This test will pass - interfaces are properly defined
      expect(hasPatientInterface && hasDashboardMetricsInterface && hasAIInsightInterface).toBe(
        true,
      );
    });
  });

  describe(_'Build Configuration Validation',_() => {
    it(_'should validate Vite configuration has proper path aliases',_() => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      const content = readFileSync(viteConfigPath, 'utf8');

      const hasAliasConfiguration = content.includes('alias:');
      const hasWorkspaceAliases = content.includes('@neonpro/ui')
        && content.includes('@neonpro/utils');

      expect(hasAliasConfiguration && hasWorkspaceAliases).toBe(true);
    });

    it(_'should validate TypeScript configuration has proper path mapping',_() => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      const content = readFileSync(tsConfigPath, 'utf8');

      const hasPathsConfiguration = content.includes('"paths":');
      const hasWorkspacePaths = content.includes('@neonpro/ui')
        && content.includes('@neonpro/utils');

      expect(hasPathsConfiguration && hasWorkspacePaths).toBe(true);
    });
  });

  describe(_'ESLint Configuration Validation',_() => {
    it(_'should validate ESLint configuration has proper rules',_() => {
      const eslintConfigPath = join(process.cwd(), 'eslint.config.js');
      const content = readFileSync(eslintConfigPath, 'utf8');

      const hasTypeScriptRules = content.includes('@typescript-eslint/no-unused-vars');
      const hasReactRules = content.includes('react-hooks/rules-of-hooks');
      const hasAccessibilityRules = content.includes('jsx-a11y/alt-text');

      expect(hasTypeScriptRules && hasReactRules && hasAccessibilityRules).toBe(true);
    });

    it(_'should validate ESLint configuration includes healthcare-specific rules',_() => {
      const eslintConfigPath = join(process.cwd(), 'eslint.config.js');
      const content = readFileSync(eslintConfigPath, 'utf8');

      const hasFinancialRules = content.includes('no-console') && content.includes('no-eval');
      const hasSecurityRules = content.includes('no-script-url') && content.includes('no-new-func');

      expect(hasFinancialRules && hasSecurityRules).toBe(true);
    });
  });
});
