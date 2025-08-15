/**
 * Financial Components - Export Index
 * NeonPro Healthcare System - Story 4.3, 4.4, 4.5 Architecture Alignment
 * 
 * Central export for all financial management components including
 * dashboard, reconciliation, and NFSe management systems.
 */

// Main Dashboard Components
export { default as FinancialDashboard } from './FinancialDashboard';
export { default as ReconciliationDashboard } from './ReconciliationDashboard';
export { default as NFSeDashboard } from './NFSeDashboard';

// Component Types (for TypeScript support)
export type { 
  FinancialKPI,
  TreatmentProfitability,
  RevenueAnalytics
} from './FinancialDashboard';

export type {
  BankAccount,
  ReconciliationTransaction,
  ReconciliationSummary,
  DiscrepancyItem
} from './ReconciliationDashboard';

export type {
  NFSeDocument,
  TaxSummary,
  MunicipalConfig
} from './NFSeDashboard';

// Re-export common UI components used across financial modules
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { Badge } from '@/components/ui/badge';
export { Button } from '@/components/ui/button';
export { Progress } from '@/components/ui/progress';
export { Alert, AlertDescription } from '@/components/ui/alert';