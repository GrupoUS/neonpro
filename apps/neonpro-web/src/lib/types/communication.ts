import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  type: z.enum(['text', 'image', 'file', 'voice']),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  channelId: z.string().uuid(),
  timestamp: z.date(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  metadata: z.record(z.any()).optional()
});

export type Message = z.infer<typeof MessageSchema>;

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['direct', 'group', 'broadcast']),
  participants: z.array(z.string().uuid()),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  lastActivity: z.date(),
  settings: z.record(z.any()).optional()
});

export type Channel = z.infer<typeof ChannelSchema>;
