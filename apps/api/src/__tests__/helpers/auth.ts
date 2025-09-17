/**
 * Authentication helpers for integration tests
 */

// Mock user for testing
export const testUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'patient',
  permissions: ['read', 'write'],
};

// Mock professional user for testing
export const testProfessional = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  email: 'doctor@example.com',
  role: 'professional',
  permissions: ['read', 'write', 'admin'],
  clinicId: '123e4567-e89b-12d3-a456-426614174002',
};

// Mock clinic for testing
export const testClinic = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  name: 'Test Clinic',
  code: 'TEST001',
};

/**
 * Create authenticated context for testing
 */
export function createTestAuthContext(user = testUser) {
  return {
    user,
    session: {
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_at: Date.now() + 3600 * 1000, // 1 hour from now
      token_type: 'bearer',
      user,
    },
    authenticated: true,
  };
}

/**
 * Create mock user for integration tests
 */
export async function createMockUser(role: 'patient' | 'professional' = 'patient') {
  if (role === 'professional') {
    return testProfessional;
  }
  return testUser;
}

/**
 * Create mock patient for integration tests
 */
export async function createMockPatient() {
  return {
    id: '123e4567-e89b-12d3-a456-426614174003',
    email: 'patient@example.com',
    name: 'Test Patient',
    cpf: '123.456.789-00',
    phone: '+55 11 99999-9999',
    birthDate: '1990-01-01',
    gender: 'other',
    address: {
      street: 'Test Street, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
  };
}

/**
 * Setup test authentication
 */
export async function setupTestAuth(userId: string): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer test-token`,
    'Content-Type': 'application/json',
    'X-User-ID': userId,
    'X-User-Role': 'professional',
  };
}

/**
 * Create mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  // Return a mock client that doesn't make real API calls
  return {
    from: (_table: string) => ({
      select: (_columns = '*') => ({
        eq: (_column: string, _value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: (_n: number) => Promise.resolve({ data: [], error: null }),
        }),
        limit: (_n: number) => Promise.resolve({ data: [], error: null }),
        order: (_column: string, _options?: any) => ({
          limit: (_n: number) => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: (_data: any) => Promise.resolve({ data: null, error: null }),
      update: (_data: any) => ({
        eq: (_column: string, _value: any) => Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (_column: string, _value: any) => Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: (_credentials: any) =>
        Promise.resolve({ data: { user: testUser, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
      from: (_bucket: string) => ({
        upload: (_path: string, _file: any) => Promise.resolve({ data: null, error: null }),
        download: (_path: string) => Promise.resolve({ data: null, error: null }),
        remove: (_paths: string[]) => Promise.resolve({ data: null, error: null }),
      }),
    },
  };
}

/**
 * Create test headers with authentication
 */
export function createTestHeaders(user = testUser) {
  return {
    Authorization: `Bearer test-token`,
    'Content-Type': 'application/json',
    'X-User-ID': user.id,
    'X-User-Role': user.role,
  };
}

/**
 * Mock authentication middleware for testing
 */
export function mockAuthMiddleware(user = testUser) {
  return (req: any, res: any, next: any) => {
    req.user = user;
    req.session = createTestAuthContext(user).session;
    next();
  };
}

/**
 * Validate test environment variables
 */
export function validateTestEnvironment() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing test environment variables: ${missing.join(', ')}`);
    console.warn('Some integration tests may be skipped or use mock data.');
    return false;
  }

  return true;
}

/**
 * Skip test if environment is not properly configured
 */
export function skipIfNoTestEnv(description: string) {
  if (!validateTestEnvironment()) {
    console.log(`⏭️  Skipping ${description} - test environment not configured`);
    return true;
  }
  return false;
}
