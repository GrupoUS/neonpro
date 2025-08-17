import { NextRequest } from 'next/server';
import { getSecurityEvents } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getSecurityEvents(request);
}