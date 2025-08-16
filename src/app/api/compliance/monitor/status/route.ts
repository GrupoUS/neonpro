// ================================================
// COMPLIANCE MONITORING STATUS API ROUTE
// /api/compliance/monitor/status
// ================================================

import { getComplianceStatus } from '@/lib/api/compliance-automation';

export async function GET(request: Request) {
  return getComplianceStatus(request);
}