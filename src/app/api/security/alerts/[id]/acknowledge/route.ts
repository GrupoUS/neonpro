import { NextRequest } from 'next/server';
import { acknowledgeSecurityAlert } from '@/lib/security/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return acknowledgeSecurityAlert(request, { params });
}