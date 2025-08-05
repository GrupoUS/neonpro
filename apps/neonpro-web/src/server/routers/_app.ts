import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const appRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}! Welcome to NeonPro Healthcare Platform.`,
      timestamp: new Date().toISOString(),
    };
  }),

  getSystemStatus: publicProcedure.query(() => {
    return {
      status: "online",
      version: "1.0.0",
      platform: "NeonPro Healthcare",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }),

  healthCheck: publicProcedure.query(() => {
    return {
      ok: true,
      message: "NeonPro tRPC API is running successfully",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };
  }),
});

export type AppRouter = typeof appRouter;
