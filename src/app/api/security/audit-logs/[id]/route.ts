import { NextRequest } from 'next/server';
import { getAuditLog } from '@/lib/security/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getAuditLog(request, { params });
}