import { useEffect, useRef } from 'react'

/**
 * Custom hook for managing timer cleanup in useEffect hooks
 * Prevents memory leaks and ensures proper cleanup of timers
 */
export const useTimerCleanup = () => {
  const timersRef = useRef<{
    timeouts: NodeJS.Timeout[]
    intervals: NodeJS.Timeout[]
  }>({
    timeouts: [],
    intervals: [],
  })

  const setTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = global.setTimeout(callback, delay)
    timersRef.current.timeouts.push(timer)
    return timer
  }

  const setInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = global.setInterval(callback, delay)
    timersRef.current.intervals.push(timer)
    return timer
  }

  const clearTimeout = (timer: NodeJS.Timeout) => {
    global.clearTimeout(timer)
    timersRef.current.timeouts = timersRef.current.timeouts.filter(t => t !== timer)
  }

  const clearInterval = (timer: NodeJS.Timeout) => {
    global.clearInterval(timer)
    timersRef.current.intervals = timersRef.current.intervals.filter(t => t !== timer)
  }

  const cleanup = () => {
    timersRef.current.timeouts.forEach(timer => global.clearTimeout(timer))
    timersRef.current.intervals.forEach(timer => global.clearInterval(timer))
    timersRef.current.timeouts = []
    timersRef.current.intervals = []
  }

  return {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    cleanup,
    timers: timersRef.current,
  }
}

/**
 * Higher-order function for useEffect with automatic timer cleanup
 */
export const useEffectWithTimerCleanup = (
  effect: () => (() => void) | void,
  deps: React.DependencyList
) => {
  const { cleanup } = useTimerCleanup()

  useEffect(() => {
    const cleanupEffect = effect()
    return () => {
      cleanup()
      if (cleanupEffect) {
        cleanupEffect()
      }
    }
  }, deps)
}

/**
 * Debounce hook with automatic cleanup
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const { setTimeout, clearTimeout } = useTimerCleanup()
  const timeoutRef = useRef<NodeJS.Timeout>()

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }) as T
}

/**
 * Throttle hook with automatic cleanup
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const { setTimeout, clearTimeout } = useTimerCleanup()
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now()
        callback(...args)
      }, delay - (now - lastCallRef.current))
    }
  }) as T
}