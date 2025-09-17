// Phase 3.5 — T032: Chat session hook
import { useEffect, useState } from 'react';

export interface ChatSessionInfo {
  id: string;
  userId: string;
  locale: 'pt-BR' | 'en-US';
  startedAt: string;
  lastActivityAt: string;
}

export function useChatSession(sessionId: string, opts?: { mock?: boolean }) {
  const [data, setData] = useState<ChatSessionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const url = new URL(`/api/v1/chat/session/${sessionId}`, window.location.origin);
        if (opts?.mock) url.searchParams.set('mock', 'true');
        const res = await fetch(url.toString(), {
          headers: { 'x-locale': navigator.language as any },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ChatSessionInfo;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, opts?.mock]);

  return { data, loading, error } as const;
}
