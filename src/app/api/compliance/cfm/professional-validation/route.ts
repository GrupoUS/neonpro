// ================================================
// CFM PROFESSIONAL VALIDATION API ROUTE
// /api/compliance/cfm/professional-validation
// ================================================

import { validateProfessional } from '@/lib/api/compliance-automation';

export async function POST(request: Request) {
  return validateProfessional(request);
}