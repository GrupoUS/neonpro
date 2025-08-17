import { NextRequest } from 'next/server';
import { getSecurityAlerts } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getSecurityAlerts(request);
}