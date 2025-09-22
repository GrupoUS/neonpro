/**
 * Authentication Test Helpers
 * For healthcare compliance testing
 */

export function createTestClient(options: { _role: 'admin' | 'user' }) {
  return {
    _role: options.role,
    _userId: 'test-user-id',
    clinicId: 'test-clinic-id',
    headers: {
      'x-user-id': 'test-user-id',
      'x-clinic-id': 'test-clinic-id',
      'x-session-id': 'test-session-id',
    },
  };
}

export function generateTestCPF(): string {
  return '123.456.789-01';
}
