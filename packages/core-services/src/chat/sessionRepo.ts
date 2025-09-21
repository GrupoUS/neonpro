// Phase 3.3 — T013: Session repository (in-memory for Phase 1)
import type { ChatSession } from "@neonpro/types";

const mem = new Map<string, ChatSession>();

export class SessionRepo {
  async create(
    _userId: string,
    locale: ChatSession["locale"] = "pt-BR",
  ): Promise<ChatSession> {
    const id = crypto.randomUUID();
    const _now = new Date().toISOString();
    const sess: ChatSession = {
      id,
      userId,
      locale,
      startedAt: now,
      lastActivityAt: now,
    } as any;
    mem.set(id, sess);
    return sess;
  }

  async find(id: string): Promise<ChatSession | null> {
    return mem.get(id) || null;
  }

  async touch(id: string): Promise<void> {
    const s = mem.get(id);
    if (s) {
      (s as any).lastActivityAt = new Date().toISOString();
      mem.set(id, s);
    }
  }
}
