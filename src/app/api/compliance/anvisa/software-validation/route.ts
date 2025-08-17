// ================================================
// ANVISA SOFTWARE VALIDATION API ROUTE
// /api/compliance/anvisa/software-validation
// ================================================

import { validateSoftware } from '@/lib/api/compliance-automation';

export async function POST(request: Request) {
  return validateSoftware(request);
}