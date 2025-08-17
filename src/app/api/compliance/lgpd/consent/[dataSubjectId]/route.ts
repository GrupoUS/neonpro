// ================================================
// LGPD CONSENT STATUS API ROUTE
// /api/compliance/lgpd/consent/[dataSubjectId]
// ================================================

import { getConsentStatus } from '@/lib/api/compliance-automation';

export async function GET(request: Request, { params }: { params: { dataSubjectId: string } }) {
  return getConsentStatus(request, { params });
}