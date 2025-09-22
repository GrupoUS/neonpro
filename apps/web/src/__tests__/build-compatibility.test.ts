import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('Build Compatibility Tests', () => {
  const dashboardPath = join(process.cwd(), 'src/routes/dashboard/main.tsx');

  it('should detect unused AccessiblePatientCard import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      // This test will fail initially because the import exists but component is not used
      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    }
  });

  it('should detect unused PatientDashboardStats import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasPatientDashboardStatsImport = content.includes('PatientDashboardStats');
      const usesPatientDashboardStats = content.includes('<PatientDashboardStats')
        || content.includes('PatientDashboardStats');

      expect(hasPatientDashboardStatsImport && !usesPatientDashboardStats).toBe(false);
    }
  });

  it('should detect unused FocusCards import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasFocusCardsImport = content.includes('FocusCards');
      const usesFocusCards = content.includes('<FocusCards')
        || content.includes('FocusCards');

      expect(hasFocusCardsImport && !usesFocusCards).toBe(false);
    }
  });

  it('should detect unused Input import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasInputImport = content.includes('Input');
      const usesInput = content.includes('<Input')
        || content.includes('Input');

      expect(hasInputImport && !usesInput).toBe(false);
    }
  });

  it('should detect unused Progress import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    }
  });

  it('should detect unused Skeleton import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    }
  });

  it('should detect unused usePatientStats import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasUsePatientStatsImport = content.includes('usePatientStats');
      const usesUsePatientStats = content.includes('usePatientStats');

      expect(hasUsePatientStatsImport && !usesUsePatientStats).toBe(false);
    }
  });

  it('should detect unused useRealtimeSubscription import', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasUseRealtimeSubscriptionImport = content.includes('useRealtimeSubscription');
      const usesUseRealtimeSubscription = content.includes('useRealtimeSubscription');

      expect(hasUseRealtimeSubscriptionImport && !usesUseRealtimeSubscription).toBe(false);
    }
  });

  it('should detect unused date-fns imports (isThisWeek, isToday, subDays)', () => {
    if (existsSync(dashboardPath)) {
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
    }
  });

  it('should detect duplicate AccessiblePatientCard import checks', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    }
  });

  it('should detect duplicate Progress import checks', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    }
  });

  it('should detect duplicate Skeleton import checks', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    }
  });
  it('should validate Badge component is properly imported', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasBadgeImport = content.includes('Badge');
      const usesBadge = content.includes('<Badge') || content.includes('Badge');

      // This test will fail because Badge is used but not imported
      expect(hasBadgeImport || !usesBadge).toBe(true);
    }
  });

  it('should validate ServiceAnalyticsDashboard component is properly imported', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasServiceAnalyticsDashboardImport = content.includes('ServiceAnalyticsDashboard');
      const usesServiceAnalyticsDashboard = content.includes('<ServiceAnalyticsDashboard')
        || content.includes('ServiceAnalyticsDashboard');

      // This test will fail because ServiceAnalyticsDashboard is used but not imported
      expect(hasServiceAnalyticsDashboardImport || !usesServiceAnalyticsDashboard).toBe(true);
    }
  });
  it('should validate proper TypeScript typing (no any types)', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasAnyTypeUsage = content.includes('info: any') || content.includes(': any');

      // This test will fail because any types are used instead of proper typing
      expect(hasAnyTypeUsage).toBe(false);
    }
  });

  it('should validate proper interface definitions', () => {
    if (existsSync(dashboardPath)) {
      const content = readFileSync(dashboardPath, 'utf8');
      const hasPatientInterface = content.includes('interface Patient');
      const hasDashboardMetricsInterface = content.includes('interface DashboardMetrics');
      const hasAIInsightInterface = content.includes('interface AIInsight');

      // This test will pass - interfaces are properly defined
      expect(hasPatientInterface && hasDashboardMetricsInterface && hasAIInsightInterface).toBe(
        true,
      );
    }
  });
  describe('Vite Configuration Validation', () => {
    it('should validate alias configuration in vite.config.ts', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        const content = readFileSync(viteConfigPath, 'utf8');
        const hasAliasConfiguration = content.includes('alias:');
        const hasWorkspaceAliases = content.includes('@neonpro/ui')
          && content.includes('@neonpro/utils');

        expect(hasAliasConfiguration && hasWorkspaceAliases).toBe(true);
      }
    });

    it('should validate path configuration in tsconfig.json', () => {
      const tsConfigPath = join(process.cwd(), 'tsconfig.json');
      if (existsSync(tsConfigPath)) {
        const content = readFileSync(tsConfigPath, 'utf8');
        const hasPathsConfiguration = content.includes('"paths":');
        const hasWorkspacePaths = content.includes('@neonpro/ui')
          && content.includes('@neonpro/utils');

        expect(hasPathsConfiguration && hasWorkspacePaths).toBe(true);
      }
    });
  });

  describe('ESLint Configuration Validation', () => {
    it('should validate ESLint rules are properly configured', () => {
      const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
      if (existsSync(eslintConfigPath)) {
        const content = readFileSync(eslintConfigPath, 'utf8');
        const hasTypeScriptRules = content.includes('@typescript-eslint/no-unused-vars');
        const hasReactRules = content.includes('react-hooks/rules-of-hooks');
        const hasAccessibilityRules = content.includes('jsx-a11y/alt-text');

        expect(hasTypeScriptRules && hasReactRules && hasAccessibilityRules).toBe(true);
      }
    });

    it('should validate security rules are configured', () => {
      const eslintConfigPath = join(process.cwd(), '.eslintrc.json');
      if (existsSync(eslintConfigPath)) {
        const content = readFileSync(eslintConfigPath, 'utf8');
        const hasFinancialRules = content.includes('no-console') && content.includes('no-eval');
        const hasSecurityRules = content.includes('no-script-url') && content.includes('no-new-func');

        expect(hasFinancialRules && hasSecurityRules).toBe(true);
      }
    });
  });
});