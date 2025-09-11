import { useEffect, useState } from 'react';

// Minimal in-app toast implementation (placeholder). For production, integrate sonner or radix-toast.
export function Toaster() {
  return null;
}

let listeners: ((msg: string, variant?: 'success' | 'error' | 'info') => void)[] = [];

export function showToast(message: string, variant: 'success' | 'error' | 'info' = 'info') {
  // In this placeholder, we simply use alert as a fallback.
  // The project includes a Sonner placeholder; swap this to your preferred toast.
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-alert
    alert(`${variant.toUpperCase()}: ${message}`);
  }
  listeners.forEach((l) => l(message, variant));
}

export function useToastListener(cb: (message: string, variant?: 'success' | 'error' | 'info') => void) {
  useEffect(() => {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter((x) => x !== cb);
    };
  }, [cb]);
}
