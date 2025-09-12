import { toast } from '@/components/ui/sonner';

/**
 * Simple hook wrapper for consistent toast usage across the app.
 * Uses Sonner under the hood with type-safe variants.
 */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast(message),
    // For compatibility with existing showToast API
    toast: (message: string, variant: 'success' | 'error' | 'info' = 'info') => {
      switch (variant) {
        case 'success':
          return toast.success(message);
        case 'error':
          return toast.error(message);
        default:
          return toast(message);
      }
    },
  };
}