import { NextRequest } from 'next/server';
import { getUserSessions } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getUserSessions(request);
}