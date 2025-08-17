import { NextRequest } from 'next/server';
import { getSecurityAlert } from '@/lib/security/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getSecurityAlert(request, { params });
}