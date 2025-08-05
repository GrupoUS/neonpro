import type { initTRPC } from "@trpc/server";
import type { type Context } from "./context";
import superjson from "superjson";
import type { ZodError } from "zod";

// Initialize tRPC with healthcare context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        healthcareCompliant: true,
        timestamp: new Date().toISOString(),
      },
    };
  },
});

// Export tRPC utilities
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
