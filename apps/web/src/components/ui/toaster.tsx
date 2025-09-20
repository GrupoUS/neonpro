import { useEffect } from 'react';
import { toast } from 'sonner';

// Minimal in-app toast implementation (placeholder). For production, integrate sonner or radix-toast.
// Legacy placeholder Toaster kept for compatibility; real UI mounted via Sonner in ui/sonner.tsx

export function Toaster() {
  return null;
}

let listeners: ((msg: string, variant?: 'success' | 'error' | 'info') => void)[] = [];

export function showToast(message: string, variant: 'success' | 'error' | 'info' = 'info') {
  // Route to Sonner's toast while keeping the same API used across the app
  if (typeof window === 'undefined') return;
  switch (variant) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    default:
      toast(message);
  }
  listeners.forEach(l => l(message, variant));
}

export function useToastListener(
  cb: (message: string, variant?: 'success' | 'error' | 'info') => void,
) {
  useEffect(() => {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter(x => x !== cb);
    };
  }, [cb]);
}
