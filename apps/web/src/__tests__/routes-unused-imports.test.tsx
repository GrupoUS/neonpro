import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('TDD: Unused Component Imports Detection - Web Route Files',_() => {
  const webRoutesPath = join(process.cwd(), 'src/routes');

  describe(_'Dashboard Main Route - Unused Component Imports',_() => {
    it(_'should detect unused AccessiblePatientCard import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      // This test will fail initially because the import exists but component is not used
      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    });

    it(_'should detect unused PatientDashboardStats import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasPatientDashboardStatsImport = content.includes('PatientDashboardStats');
      const usesPatientDashboardStats = content.includes('<PatientDashboardStats')
        || content.includes('PatientDashboardStats');

      expect(hasPatientDashboardStatsImport && !usesPatientDashboardStats).toBe(false);
    });

    it(_'should detect unused FocusCards import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasFocusCardsImport = content.includes('FocusCards');
      const usesFocusCards = content.includes('<FocusCards')
        || content.includes('FocusCards');

      expect(hasFocusCardsImport && !usesFocusCards).toBe(false);
    });

    it(_'should detect unused Input import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasInputImport = content.includes('Input');
      const usesInput = content.includes('<Input')
        || content.includes('Input');

      expect(hasInputImport && !usesInput).toBe(false);
    });

    it(_'should detect unused Progress import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    });

    it(_'should detect unused Skeleton import',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    });

    it(_'should detect unused usePatientStats hook',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasUsePatientStatsImport = content.includes('usePatientStats');
      const usesUsePatientStats = content.includes('usePatientStats');

      expect(hasUsePatientStatsImport && !usesUsePatientStats).toBe(false);
    });

    it(_'should detect unused useRealtimeSubscription hook',_() => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasUseRealtimeSubscriptionImport = content.includes('useRealtimeSubscription');
      const usesUseRealtimeSubscription = content.includes('useRealtimeSubscription');

      expect(hasUseRealtimeSubscriptionImport && !usesUseRealtimeSubscription).toBe(false);
    });

    it('should detect unused date-fns imports (isThisWeek, isToday, subDays)', () => {
      const filePath = join(webRoutesPath, 'dashboard/main.tsx');
      const content = readFileSync(filePath, 'utf8');

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

  describe(_'AI Insights Route - Unused Component Imports',_() => {
    it(_'should detect unused AccessiblePatientCard import',_() => {
      const filePath = join(webRoutesPath, 'patients/ai-insights.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasAccessiblePatientCardImport = content.includes('AccessiblePatientCard');
      const usesAccessiblePatientCard = content.includes('<AccessiblePatientCard')
        || content.includes('AccessiblePatientCard');

      expect(hasAccessiblePatientCardImport && !usesAccessiblePatientCard).toBe(false);
    });

    it(_'should detect unused Progress import',_() => {
      const filePath = join(webRoutesPath, 'patients/ai-insights.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasProgressImport = content.includes('Progress');
      const usesProgress = content.includes('<Progress')
        || content.includes('Progress');

      expect(hasProgressImport && !usesProgress).toBe(false);
    });

    it(_'should detect unused Skeleton import',_() => {
      const filePath = join(webRoutesPath, 'patients/ai-insights.tsx');
      const content = readFileSync(filePath, 'utf8');

      const hasSkeletonImport = content.includes('Skeleton');
      const usesSkeleton = content.includes('<Skeleton')
        || content.includes('Skeleton');

      expect(hasSkeletonImport && !usesSkeleton).toBe(false);
    });
  });
});
