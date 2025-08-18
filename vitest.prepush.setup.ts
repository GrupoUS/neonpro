/**
 * Minimal Vitest Setup for Pre-push Healthcare Compliance Tests
 * NeonPro - Essential setup without heavy dependencies
 */

import { vi } from 'vitest';

// Basic environment setup
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';
process.env.LANG = 'en_US.UTF-8';
process.env.LC_ALL = 'en_US.UTF-8';

// Basic test environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock global fetch
global.fetch = vi.fn();

// biome-ignore lint/suspicious/noConsole: Test setup log needed for debugging
console.log('🏥 Minimal setup for healthcare compliance tests ready');
