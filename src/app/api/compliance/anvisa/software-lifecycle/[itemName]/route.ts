// ================================================
// ANVISA SOFTWARE LIFECYCLE API ROUTE
// /api/compliance/anvisa/software-lifecycle/[itemName]
// ================================================

import { getSoftwareLifecycle } from '@/lib/api/compliance-automation';

export async function GET(request: Request, { params }: { params: { itemName: string } }) {
  return getSoftwareLifecycle(request, { params });
}