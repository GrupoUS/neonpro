"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var trpc_1 = require("./trpc");
var auth_1 = require("./routers/auth");
/**
 * Main tRPC router for NeonPro Healthcare
 *
 * Healthcare-compliant API with:
 * - LGPD compliance validation
 * - Medical role-based access control
 * - Comprehensive audit trail
 * - Tenant data isolation
 * - Type-safe end-to-end communication
 */
exports.appRouter = (0, trpc_1.createTRPCRouter)({
    auth: auth_1.authRouter,
    // Additional routers will be added here:
    // patients: patientsRouter,
    // appointments: appointmentsRouter,
    // medical: medicalRouter,
    // reports: reportsRouter,
});
