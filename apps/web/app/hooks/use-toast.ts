'use client'

/**
 * Simple Toast Hook for NeonPro Healthcare
 * Basic toast functionality for user notifications
 */

import { useCallback, useEffect, useRef, useState, } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

export const useToast = () => {
  const [toasts, setToasts,] = useState<Toast[]>([],)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map(),)

  const toast = useCallback((options: ToastOptions,) => {
    const id = Math.random().toString(36,).slice(2, 9,)
    const newToast: Toast = {
      id,
      ...options,
    }

    setToasts(prev => [...prev, newToast,])

    // Auto-remove toast after duration
    const duration = options.duration || 5000
    const timerId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      timersRef.current.delete(id,)
    }, duration,)
    timersRef.current.set(id, timerId,)

    // Debug logging only in non-production
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`Toast: ${options.title}`, options.description,)
    }
  }, [],)

  const dismiss = useCallback((id: string,) => {
    const timerId = timersRef.current.get(id,)
    if (timerId) {
      clearTimeout(timerId,)
      timersRef.current.delete(id,)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [],)

  useEffect(() => {
    const map = timersRef.current
    return () => {
      map.forEach((timerId,) => clearTimeout(timerId,))
      map.clear()
    }
  }, [],)

  return {
    toast,
    toasts,
    dismiss,
  }
}
