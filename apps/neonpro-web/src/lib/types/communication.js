"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelSchema = exports.MessageSchema = void 0;
var zod_1 = require("zod");
exports.MessageSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  content: zod_1.z.string().min(1),
  type: zod_1.z.enum(["text", "image", "file", "voice"]),
  senderId: zod_1.z.string().uuid(),
  receiverId: zod_1.z.string().uuid(),
  channelId: zod_1.z.string().uuid(),
  timestamp: zod_1.z.date(),
  status: zod_1.z.enum(["sent", "delivered", "read", "failed"]),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ChannelSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  name: zod_1.z.string(),
  type: zod_1.z.enum(["direct", "group", "broadcast"]),
  participants: zod_1.z.array(zod_1.z.string().uuid()),
  createdBy: zod_1.z.string().uuid(),
  createdAt: zod_1.z.date(),
  lastActivity: zod_1.z.date(),
  settings: zod_1.z.record(zod_1.z.any()).optional(),
});
