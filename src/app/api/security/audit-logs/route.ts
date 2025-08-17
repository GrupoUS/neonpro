import { NextRequest } from 'next/server';
import { getAuditLogs } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getAuditLogs(request);
}