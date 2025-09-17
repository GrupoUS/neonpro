// Minimal Supabase client re-exports (stubs) to satisfy imports during build
export const supabaseAdmin: any = null;
export const supabaseClient: any = null;

export function createAdminClient(): any {
  return null;
}
export function createServerClient(): any {
  return null;
}
export function createUserClient(): any {
  return null;
}

export const healthcareRLS = {
  canAccessClinic: async () => true,
  canAccessPatient: async () => true,
};

export class RLSQueryBuilder {
  constructor(public userId?: string, public role?: string) {}
}
