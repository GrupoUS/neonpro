import { NextRequest } from 'next/server';
import { getComplianceAudits, createComplianceAudit } from '@/lib/security/api';

export async function GET(request: NextRequest) {
  return getComplianceAudits(request);
}

export async function POST(request: NextRequest) {
  return createComplianceAudit(request);
}