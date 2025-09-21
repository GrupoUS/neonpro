// Phase 3.4 — T016/T017: Zod schemas for chat
import { z } from "zod";

export const ChatQuerySchema = z.object({
  question: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
});

export const ExplanationRequestSchema = z.object({
  text: z.string().min(1).max(8000),
  locale: z.enum(["pt-BR", "en-US"]).default("pt-BR"),
});

export type ChatQuery = z.infer<typeof ChatQuerySchema>;
export type ExplanationRequest = z.infer<typeof ExplanationRequestSchema>;
