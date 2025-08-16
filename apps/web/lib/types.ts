// lib/types.ts
// Type definitions for NeonPro application

import type {
  Product,
  Profile,
  SubscriptionPlan,
  SubscriptionStatus,
  Tenant,
} from '@prisma/client';

// =============================================================================================
// 🎯 CORE TYPES FROM PRISMA SCHEMA
// =============================================================================================

// Re-export Prisma types for easier imports
export type { Tenant, Profile, Product, SubscriptionPlan, SubscriptionStatus };

// =============================================================================================
// 🔧 EXTENDED TYPES
// =============================================================================================

// Tenant with related data
export interface TenantWithProducts extends Tenant {
  products: Product[];
  _count?: {
    products: number;
    profiles: number;
  };
}

// Profile with tenant data
export interface ProfileWithTenant extends Profile {
  tenant: Tenant;
}

// Product with tenant data
export interface ProductWithTenant extends Product {
  tenant: Tenant;
}

// =============================================================================================
// 🌐 API RESPONSE TYPES
// =============================================================================================

// Standard API response wrapper
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Paginated response
export type PaginatedResponse<T = any> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Tenant list response
export interface TenantsResponse
  extends PaginatedResponse<TenantWithProducts> {}

// =============================================================================================
// 📝 FORM TYPES
// =============================================================================================

// Tenant creation form
export type CreateTenantForm = {
  name: string;
  slug: string;
  description?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
};

// Tenant update form
export interface UpdateTenantForm extends Partial<CreateTenantForm> {
  id: string;
}

// Product creation form
export type CreateProductForm = {
  name: string;
  description?: string;
  price: number;
  category: string;
  tenantId: string;
};

// Product update form
export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: string;
}

// Profile creation form
export type CreateProfileForm = {
  name: string;
  email: string;
  role: string;
  tenantId: string;
};

// Profile update form
export interface UpdateProfileForm extends Partial<CreateProfileForm> {
  id: string;
}

// =============================================================================================
// 🎨 UI COMPONENT TYPES
// =============================================================================================

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Filter options for tenant list
export type TenantFilters = {
  search?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};

// Component props for TenantList
export type TenantListProps = {
  initialTenants?: TenantWithProducts[];
  filters?: TenantFilters;
  onTenantSelect?: (tenant: TenantWithProducts) => void;
};

// =============================================================================================
// 🔐 AUTH TYPES
// =============================================================================================

// User session
export type UserSession = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  tenant?: Tenant;
};

// Auth context
export type AuthContextType = {
  user: UserSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
};

// =============================================================================================
// 📊 ANALYTICS TYPES
// =============================================================================================

// Tenant statistics
export type TenantStats = {
  totalProducts: number;
  totalProfiles: number;
  revenue: number;
  growth: number;
};

// Dashboard data
export type DashboardData = {
  tenantStats: TenantStats;
  recentProducts: Product[];
  recentProfiles: Profile[];
};

// =============================================================================================
// 🛠️ UTILITY TYPES
// =============================================================================================

// Generic ID type
export type ID = string;

// Generic timestamp type
export type Timestamp = Date | string;

// Generic status type
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// Generic error type
export type AppError = {
  code: string;
  message: string;
  details?: any;
};

// Generic success response
export type SuccessResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
};

// Generic error response
export type ErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: any;
};

// Union type for API responses
export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;
