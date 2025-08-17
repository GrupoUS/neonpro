// ================================================
// LGPD DATA CLASSIFICATION API ROUTE
// /api/compliance/lgpd/data-classification
// ================================================

import { classifyData } from '@/lib/api/compliance-automation';

export async function POST(request: Request) {
  return classifyData(request);
}