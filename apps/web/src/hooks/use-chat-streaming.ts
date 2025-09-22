// Phase 3.5 — T033: Chat streaming hook (SSE)
import { useEffect, useRef, useState } from 'react';

export function useChatStreaming(opts: {
  question?: string;
  auto?: boolean;
  mock?: boolean;
  onDelta?: (delta: string) => void;
}) {
  const { question, auto = false, mock = false, onDelta } = opts;
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!auto || !question) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    (async () => {
      try {
        setStreaming(true);
        const url = new URL('/api/v1/chat/query', window.location.origin);
        if (mock) url.searchParams.set('mock', 'true');
        const res = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ question }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          // Very simple SSE parsing for data: lines
          text.split('\n').forEach(line => {
            if (line.startsWith('data:')) {
              const payload = line.slice(5).trim();
              try {
                const evt = JSON.parse(payload);
                if (evt?.type === 'text' && typeof evt.delta === 'string') {
                  onDelta?.(evt.delta);
                }
              } catch {
                // ignore malformed JSON
              }
            }
          });
        }
      } catch (_error) {
<<<<<<< HEAD
        setError(_error instanceof Error ? _error.message : 'Unknown error');
=======
        setError(error instanceof Error ? error.message : 'Unknown error');
>>>>>>> origin/main
      } finally {
        setStreaming(false);
      }
    })();
    return () => controller.abort();
  }, [auto, question, mock, onDelta]);

  return {
    streaming,
    error,
    cancel: () => controllerRef.current?.abort(),
  } as const;
}
