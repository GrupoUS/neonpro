/**
 * Financial Components - Export Index
 * NeonPro Healthcare System - Story 4.3, 4.4, 4.5 Architecture Alignment
 *
 * Central export for all financial management components including
 * dashboard, reconciliation, and NFSe management systems.
 */

export { Alert, AlertDescription } from '@/components/ui/alert';
export { Badge } from '@/components/ui/badge';
export { Button } from '@/components/ui/button';
// Re-export common UI components used across financial modules
export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
export { Progress } from '@/components/ui/progress';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Component Types (for TypeScript support)
export type {
  FinancialKPI,
  RevenueAnalytics,
  TreatmentProfitability,
} from './FinancialDashboard';
// Main Dashboard Components
export { default as FinancialDashboard } from './FinancialDashboard';
export type {
  MunicipalConfig,
  NFSeDocument,
  TaxSummary,
} from './NFSeDashboard';
export { default as NFSeDashboard } from './NFSeDashboard';
export type {
  BankAccount,
  DiscrepancyItem,
  ReconciliationSummary,
  ReconciliationTransaction,
} from './ReconciliationDashboard';
export { default as ReconciliationDashboard } from './ReconciliationDashboard';
