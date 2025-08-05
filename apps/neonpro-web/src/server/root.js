"use strict";
/**
 * tRPC Root Router
 * Main router combining all healthcare modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var trpc_1 = require("./trpc");
var patients_1 = require("./routers/patients");
var appointments_1 = require("./routers/appointments");
var doctors_1 = require("./routers/doctors");
/**
 * Main tRPC router for NeonPro Healthcare
 *
 * Add new routers here as you migrate from REST APIs
 */
exports.appRouter = (0, trpc_1.createTRPCRouter)({
  patients: patients_1.patientsRouter,
  appointments: appointments_1.appointmentsRouter,
  doctors: doctors_1.doctorsRouter,
  // TODO: Add more routers as you migrate
  // communication: communicationRouter,
  // forecasting: forecastingRouter,
  // reports: reportsRouter,
  // audit: auditRouter,
});
