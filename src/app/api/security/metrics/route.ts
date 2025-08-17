import { NextRequest } from 'next/server';
import { getSecurityMetrics } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getSecurityMetrics(request);
}