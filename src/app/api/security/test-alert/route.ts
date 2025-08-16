import { NextRequest } from 'next/server';
import { createTestAlert } from '@/lib/security/api';

export async function POST(request: NextRequest) {
  return createTestAlert(request);
}