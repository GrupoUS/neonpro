// SSE helper utilities for Hono routes (Phase 3.4 T029)
// Provides minimal helpers for setting SSE headers and creating simple SSE streams.

export function sseHeaders(extra?: Record<string, string>) {
  return new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Chat-Started-At': new Date().toISOString(),
    ...extra,
  });
}

// Simple demo stream helper useful for mocks and failover
export function sseStreamFromChunks(chunks: string[], intervalMs = 15): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      let i = 0;
      const id = setInterval(() => {
        const line = `data: ${JSON.stringify({ type: 'text', delta: chunks[i] })}\n\n`;
        controller.enqueue(enc.encode(line));
        i++;
        if (i >= chunks.length) {
          clearInterval(id);
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        }
      }, intervalMs);
    },
  });
}

// Generic SSE stream with imperative writer
export function createSSEStream() {
  const encoder = new TextEncoder();
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
    },
    cancel() {
      controllerRef = null;
    },
  });

  function write(data: unknown) {
    if (!controllerRef) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    controllerRef.enqueue(encoder.encode(payload));
  }

  function close() {
    if (!controllerRef) return;
    controllerRef.close();
    controllerRef = null;
  }

  return { stream, write, close };
}
