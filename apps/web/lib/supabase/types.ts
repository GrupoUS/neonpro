// lib/supabase/types.ts
// Types for additional database tables (tenants, profiles, products)

export type TenantDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          professional_title: string | null;
          medical_license: string | null;
          department: string | null;
          phone: string | null;
          role: string;
          tenant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          professional_title?: string | null;
          medical_license?: string | null;
          department?: string | null;
          phone?: string | null;
          role?: string;
          tenant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          professional_title?: string | null;
          medical_license?: string | null;
          department?: string | null;
          phone?: string | null;
          role?: string;
          tenant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string;
          subscription_status: string;
          subscription_plan: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          subscription_status?: string;
          subscription_plan?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          subscription_status?: string;
          subscription_plan?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          price: number;
          currency: string;
          category: string | null;
          duration_minutes: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          price: number;
          currency?: string;
          category?: string | null;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          category?: string | null;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Type aliases for easier use
export type Profile = TenantDatabase['public']['Tables']['profiles']['Row'];
export type Tenant = TenantDatabase['public']['Tables']['tenants']['Row'];
export type Product = TenantDatabase['public']['Tables']['products']['Row'];

export type ProfileInsert =
  TenantDatabase['public']['Tables']['profiles']['Insert'];
export type TenantInsert =
  TenantDatabase['public']['Tables']['tenants']['Insert'];
export type ProductInsert =
  TenantDatabase['public']['Tables']['products']['Insert'];

export type ProfileUpdate =
  TenantDatabase['public']['Tables']['profiles']['Update'];
export type TenantUpdate =
  TenantDatabase['public']['Tables']['tenants']['Update'];
export type ProductUpdate =
  TenantDatabase['public']['Tables']['products']['Update'];
