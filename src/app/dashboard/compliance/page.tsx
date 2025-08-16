// ================================================
// COMPLIANCE AUTOMATION PAGE
// Healthcare regulatory compliance dashboard page
// ================================================

import React from 'react';
import ComplianceAutomationDashboard from '@/components/compliance/ComplianceAutomationDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance Automation | NeonPro',
  description: 'Healthcare regulatory compliance monitoring and automation dashboard for LGPD, ANVISA, and CFM compliance',
  keywords: ['healthcare compliance', 'LGPD', 'ANVISA', 'CFM', 'regulatory automation', 'medical compliance'],
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background">
      <ComplianceAutomationDashboard />
    </div>
  );
}