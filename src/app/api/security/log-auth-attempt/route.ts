import { NextRequest } from 'next/server';
import { logAuthAttempt } from '@/lib/security/api';

export async function POST(request: NextRequest) {
  return logAuthAttempt(request);
}