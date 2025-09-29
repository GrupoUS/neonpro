import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  recipient_id: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  content: z.string().min(1),
  type: z.enum(['text', 'system', 'appointment_update', 'lead_update']).default('text'),
  metadata: z.record(z.string(), z.any()).default({}),
  read_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
});

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true,
}).extend({
  content: z.string().min(1, { message: 'Message content cannot be empty' }).max(2000, { message: 'Message too long' }),
});

export const UpdateMessageSchema = MessageSchema.partial().extend({
  id: z.string().uuid(),
});

export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;