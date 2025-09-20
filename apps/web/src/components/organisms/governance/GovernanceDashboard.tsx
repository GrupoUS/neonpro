import { AIGovernanceMetrics } from './AIGovernanceMetrics';
import { AuditTrailTable } from './AuditTrailTable';
import { ComplianceStatusPanel } from './ComplianceStatusPanel';
import { EscalationWorkflowStatus } from './EscalationWorkflowStatus';
import { KPIOverviewCards } from './KPIOverviewCards';
import { PolicyManagementPanel } from './PolicyManagementPanel';
import { RiskAssessmentTable } from './RiskAssessmentTable';

export function GovernanceDashboard() {
  return (
    <main className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Governance Dashboard
        </h1>
        <div className='text-sm text-muted-foreground'>
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        <section
          aria-label='KPI Overview'
          role='region'
          className='xl:col-span-3'
        >
          <KPIOverviewCards />
        </section>

        <section
          aria-label='Compliance Status'
          role='region'
          className='lg:col-span-2'
        >
          <ComplianceStatusPanel />
        </section>

        <section aria-label='Risk Assessment' role='region'>
          <RiskAssessmentTable />
        </section>

        <section aria-label='AI Governance' role='region'>
          <AIGovernanceMetrics />
        </section>

        <section
          aria-label='Policy Management'
          role='region'
          className='lg:col-span-2'
        >
          <PolicyManagementPanel />
        </section>

        <section aria-label='Escalation Workflow' role='region'>
          <EscalationWorkflowStatus />
        </section>

        <section
          aria-label='Audit Trail'
          role='region'
          className='xl:col-span-3'
        >
          <AuditTrailTable />
        </section>
      </div>
    </main>
  );
}
