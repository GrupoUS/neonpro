// Financial Dashboard Components
export { default as FinancialDashboard } from './FinancialDashboard';
export { default as FinancialKPICards } from './FinancialKPICards';
export { default as FinancialCharts } from './FinancialCharts';
export { default as FinancialReports } from './FinancialReports';
export { default as FinancialInsights } from './FinancialInsights';

// Re-export for convenience
export {
  FinancialDashboard,
  FinancialKPICards,
  FinancialCharts,
  FinancialReports,
  FinancialInsights
};

// Type exports (if needed)
export type {
  // Add type exports here if components export types
} from './FinancialDashboard';

/**
 * Financial Dashboard System
 * 
 * This module provides a complete financial dashboard and BI implementation
 * for the NeonPro dental clinic management system.
 * 
 * Components:
 * - FinancialDashboard: Main dashboard container with tabs and navigation
 * - FinancialKPICards: Key Performance Indicators display cards
 * - FinancialCharts: Interactive charts and visualizations
 * - FinancialReports: Report generation and management
 * - FinancialInsights: AI-powered insights and recommendations
 * 
 * Features:
 * - Real-time financial monitoring
 * - Interactive data visualizations
 * - Automated report generation
 * - AI-powered insights and recommendations
 * - Treatment profitability analysis
 * - Revenue trend analysis
 * - Custom reporting system
 * - BI tool integration
 * - Performance optimization
 * - Responsive design
 * 
 * Usage:
 * ```tsx
 * import { FinancialDashboard } from '@/components/financial';
 * 
 * function App() {
 *   return (
 *     <FinancialDashboard 
 *       timeframe="month"
 *       detailed={true}
 *     />
 *   );
 * }
 * ```
 */