/**
 * NeonPro API - Hono.dev Backend
 * ===============================
 *
 * Sistema de gestão para clínicas de estética multiprofissionais brasileiras
 * Foco em gerenciamento de pacientes e inteligência financeira através de IA
 *
 * Características:
 * - Framework Hono.dev (ultrarrápido: 402,820 ops/sec)
 * - TypeScript first-class support
 * - Vercel Edge Functions deployment nativo
 * - Sistema não médico (sem CFM, telemedicina)
 * - Compliance: LGPD + ANVISA (produtos estéticos)
 * - Multi-profissional: Esteticistas, dermatologistas estéticos, terapeutas
 *
 * Tech Stack:
 * - Hono.dev (TypeScript/JavaScript runtime)
 * - Prisma ORM (PostgreSQL via Supabase)
 * - Supabase Database + Auth + Edge Functions
 * - IA para otimização de agendamento e analytics
 * - Zod para validação de schemas
 * - JOSE para JWT handling
 */
import "dotenv/config";
import { Hono } from "hono";
declare const app: Hono<AppEnv, import("hono/types").BlankSchema, "/">;
declare const apiV1: import("hono/hono-base").HonoBase<any, {
    "/professionals/*": {};
} | {
    "/professionals/*": {
        [x: `$${Lowercase<string>}`]: {
            input: any;
            output: any;
            outputFormat: string;
            status: import("hono/utils/http-status").StatusCode;
        };
    };
} | {
    "/professionals/*": {
        [x: `$${Lowercase<string>}`]: {
            input: any;
            output: any;
            outputFormat: string;
            status: import("hono/utils/http-status").StatusCode;
        };
    };
} | {
    "/professionals/*": {
        [x: `$${Lowercase<string>}`]: {
            input: any;
            output: any;
            outputFormat: string;
            status: import("hono/utils/http-status").StatusCode;
        };
    };
} | import("hono/types").MergeSchemaPath<import("hono").Schema, "/professionals"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/services"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/analytics"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/compliance"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/compliance-automation"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/ai"> | import("hono/types").MergeSchemaPath<import("hono").Schema, "/audit">, "/">;
export type AppType = typeof app;
export type ApiV1Type = typeof apiV1;
export default app;
//# sourceMappingURL=index.d.ts.map