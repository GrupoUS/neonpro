// Minimal LGPD helpers for tests and scaffolding
// NOTE: This is a placeholder; full implementation tracked by T006

export function redactCPF(text: string): string {
  return text.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "***.***.***-**");
}

export function redactCNPJ(text: string): string {
  return text.replace(
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
    "**.***.***/****-**",
  );
}

export function redactEmail(text: string): string {
  return text.replace(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    "***@***",
  );
}

export function redactPhone(text: string): string {
  return text.replace(/\b\(?\d{2}\)?\s?9?\d{4}-\d{4}\b/g, "(**) *****-****");
}

export function lgpdCompliance(input: string): string {
  return [redactCPF, redactCNPJ, redactEmail, redactPhone].reduce((acc, fn) => fn(acc),
    input,
  );
}
