// ================================================
// LGPD DATA SUBJECT REQUEST API ROUTE
// /api/compliance/lgpd/data-subject-request
// ================================================

import { createDataSubjectRequest } from '@/lib/api/compliance-automation';

export async function POST(request: Request) {
  return createDataSubjectRequest(request);
}