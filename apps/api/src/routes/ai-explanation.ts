import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

const ExplanationRequest = z
  .object({
    text: z.string().min(1).optional(),
    messages: z
      .array(
        z.object({
          _role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
        }),
      )
      .optional(),
    audience: z.enum(['patient', 'admin', 'professional']).default('patient'),
    locale: z.string().default('pt-BR'),
  })
  .refine(v => Boolean(v.text) || (v.messages && v.messages.length > 0), {
    message: 'text or messages is required',
  });

type ExplanationResponse = {
  summary: string;
  wordCount: number;
  traceId: string;
  citations?: Array<{ title: string; url: string }>;
};

app.post('/summary', zValidator('json', ExplanationRequest), async c => {
  const body: ExplanationRequest = c.req.valid('json');

  // Minimal GREEN: echo-style summary with safe trimming and trace id
  const base = body.text ?? body.messages?.map(m => m.content).join(' ') ?? '';
  const summary = base.length > 160 ? base.slice(0, 157) + '…' : base;
  const wordCount = summary.split(/\s+/).filter(Boolean).length;
  const traceId = crypto.randomUUID();

  const resp: ExplanationResponse = { summary, wordCount, traceId };
  return c.json(resp);
});

app.get('/health', c => c.json({ status: 'ok' }));

export default app;
