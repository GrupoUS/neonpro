// Global type definitions for NeonPro
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      DATABASE_URL: string;
      RESEND_API_KEY: string;
      CLERK_SECRET_KEY: string;
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      REDIS_URL: string;
      OPENAI_API_KEY: string;
      TRIGGER_API_KEY: string;
    }
  }

  // Fastify augmentations
  declare module "fastify" {
    interface FastifyInstance {
      requireRole(roles: string | string[]): any;
      jwtVerify(): Promise<any>;
      supabase: any;
      auditLog: any;
      insertAuditLog: (entry: any) => Promise<void>;
    }

    interface FastifyRequest {
      jwtVerify(): Promise<any>;
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
        permissions: string[];
        licenseNumber?: string;
        certifications: string[];
        userId?: string;
      };
    }
  }

  // Cloudflare Workers types
  declare global {
    interface Env {
      // KV Namespaces
      CACHE: KVNamespace;
      SESSIONS: KVNamespace;
      ANALYTICS: KVNamespace;
      CONFIG: KVNamespace;
      TEMP_STORAGE: KVNamespace;

      // R2 Buckets
      DOCUMENTS: R2Bucket;
      BACKUPS: R2Bucket;

      // D1 Database
      DB: D1Database;

      // Durable Objects
      SESSION_MANAGER: DurableObjectNamespace;
      RATE_LIMITER: DurableObjectNamespace;
      ANALYTICS_AGGREGATOR: DurableObjectNamespace;
    }

    // Cloudflare Workers global types
    declare const D1Database: any;
    declare const KVNamespace: any;
    declare const R2Bucket: any;
    declare const DurableObjectNamespace: any;
    declare const DurableObjectState: any;
    declare const WebSocketPair: any;
  }

  // Jest globals for testing
  declare const jest: any;
  declare const describe: any;
  declare const it: any;
  declare const test: any;
  declare const expect: any;
  declare const beforeEach: any;
  declare const afterEach: any;
  declare const beforeAll: any;
  declare const afterAll: any;

  // UUID module
  declare module "uuid" {
    export function v4(): string;
    export function v5(name: string, namespace: string): string;
  }

  // Hono validator
  declare module "@hono/zod-validator" {
    export const zValidator: any;
    export const validator: any;
  }

  // Common utility types
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };

  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

  // Healthcare specific types
  interface PatientData {
    id: string;
    name: string;
    cpf: string;
    email?: string;
    phone?: string;
    birthDate: string;
    createdAt: string;
    updatedAt: string;
  }

  interface MedicalRecord {
    id: string;
    patientId: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Appointment {
    id: string;
    patientId: string;
    providerId: string;
    dateTime: string;
    type: string;
    status: "scheduled" | "confirmed" | "cancelled" | "completed";
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
}

export {};
