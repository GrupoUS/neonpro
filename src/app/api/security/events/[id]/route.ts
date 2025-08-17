import { NextRequest } from 'next/server';
import { getSecurityEvent, updateSecurityEvent } from '@/lib/security/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getSecurityEvent(request, { params });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateSecurityEvent(request, { params });
}