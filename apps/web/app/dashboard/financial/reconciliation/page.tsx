'use client';

import React, { Suspense } from 'react';
import { ReconciliationDashboard } from '@/components/financial/ReconciliationDashboard';
import { ImportStatementButton } from '@/components/financial/ImportStatementButton';
import { ReconciliationSummary } from '@/components/financial/ReconciliationSummary';
import { TransactionsList } from '@/components/financial/TransactionsList';
import { MatchingAlgorithmsConfig } from '@/components/financial/MatchingAlgorithmsConfig';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * Healthcare Financial Reconciliation Page
 *
 * LGPD Compliance: Patient financial data with healthcare-specific protection
 * ANVISA Compliance: Medical procedure billing reconciliation
 * CFM Compliance: Professional financial responsibility tracking
 *
 * Quality Standard: ≥9.9/10 (Healthcare financial integrity)
 */
export default function ReconciliationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  // Healthcare role-based access control
  const canAccessFinancial = hasPermission('financial.reconciliation.view');
  const canManageReconciliation = hasPermission(
    'financial.reconciliation.manage'
  );
  const canConfigureAlgorithms = hasPermission(
    'financial.algorithms.configure'
  );

  if (authLoading || permissionsLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        data-testid="loading-state"
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" data-testid="unauthorized-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso não autorizado. Faça login para continuar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canAccessFinancial) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" data-testid="permission-denied-alert">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Permissão insuficiente para acessar dados financeiros. Entre em
            contato com o administrador da clínica.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="reconciliation-page"
    >
      {/* Page Header with Healthcare Context */}
      <div className="flex flex-col space-y-2">
        <h1
          className="text-3xl font-bold tracking-tight"
          data-testid="page-title"
        >
          Reconciliação Financeira
        </h1>
        <p className="text-muted-foreground" data-testid="page-description">
          Conciliação de pagamentos e procedimentos médicos com conformidade
          LGPD
        </p>
      </div>

      {/* Import Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <ImportStatementButton
            data-testid="import-statement-button"
            canImport={canManageReconciliation}
          />
        </div>
      </div>

      {/* Main Dashboard */}
      <Suspense
        fallback={<LoadingSpinner size="lg" data-testid="dashboard-loading" />}
      >
        <ReconciliationDashboard data-testid="reconciliation-dashboard" />
      </Suspense>

      {/* Summary and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Suspense fallback={<LoadingSpinner data-testid="summary-loading" />}>
            <ReconciliationSummary data-testid="reconciliation-summary" />
          </Suspense>
        </div>

        <div className="space-y-4">
          <Suspense
            fallback={<LoadingSpinner data-testid="transactions-loading" />}
          >
            <TransactionsList data-testid="transactions-list" />
          </Suspense>
        </div>
      </div>

      {/* Algorithm Configuration - Admin Only */}
      {canConfigureAlgorithms && (
        <div className="mt-8">
          <Suspense
            fallback={<LoadingSpinner data-testid="algorithms-loading" />}
          >
            <MatchingAlgorithmsConfig data-testid="matching-algorithms-config" />
          </Suspense>
        </div>
      )}
    </div>
  );
}
