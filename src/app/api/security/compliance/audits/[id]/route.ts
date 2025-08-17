import { NextRequest } from 'next/server';
import { getComplianceAudit } from '@/lib/security/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getComplianceAudit(request, { params });
}