// ================================================
// COMPLIANCE ALERTS API ROUTE
// /api/compliance/alerts
// ================================================

import { createComplianceAlert } from '@/lib/api/compliance-automation';

export async function POST(request: Request) {
  return createComplianceAlert(request);
}