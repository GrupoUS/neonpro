// ================================================
// CFM PROFESSIONAL STATUS API ROUTE
// /api/compliance/cfm/professional-status/[professionalId]
// ================================================

import { getProfessionalStatus } from '@/lib/api/compliance-automation';

export async function GET(request: Request, { params }: { params: { professionalId: string } }) {
  return getProfessionalStatus(request, { params });
}