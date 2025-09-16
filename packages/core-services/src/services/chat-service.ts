// ChatService orchestrator (Phase 1) - minimal glue

import type { ChatMessage, ChatSession } from '@neonpro/types';
import { PIIRedactionService } from './pii-redaction.js';
import type { AIProvider } from './ai-provider.js';

export class ChatService {
  constructor(private ai: AIProvider, private pii = new PIIRedactionService()) {}

  async ask(session: ChatSession, input: string) {
    const redacted = this.pii.redact(input);
    const res = await this.ai.generateAnswer({ prompt: redacted, locale: session.locale });
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      role: 'assistant',
      content: res.content,
      createdAt: new Date().toISOString(),
      redactionFlags: ['lgpd']
    };
    return message;
  }
}
