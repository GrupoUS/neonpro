import { NextRequest } from 'next/server';
import { terminateSession } from '@/lib/security/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  return terminateSession(request, { params });
}