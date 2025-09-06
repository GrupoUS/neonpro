"use client";

/**
 * Simple Toast Hook for NeonPro Healthcare
 * Basic toast functionality for user notifications
 */

import { useCallback, useState } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    // For now, just log to console
    console.log(`Toast: ${options.title}`, options.description);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
};
