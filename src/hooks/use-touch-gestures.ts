"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface PinchHandlers {
  onPinchIn?: (scale: number) => void;
  onPinchOut?: (scale: number) => void;
}

interface TapHandlers {
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

interface UseSwipeOptions extends SwipeHandlers {
  threshold?: number;
  timeThreshold?: number;
}

interface UsePinchOptions extends PinchHandlers {
  threshold?: number;
}

interface UseTapOptions extends TapHandlers {
  doubleTapDelay?: number;
  longPressDelay?: number;
}

// Swipe gesture hook
export function useSwipe(
  ref: RefObject<HTMLElement>,
  options: UseSwipeOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    timeThreshold = 500,
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.timestamp;

      if (deltaTime > timeThreshold) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Horizontal swipe
      if (absX > absY && absX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
      // Vertical swipe
      else if (absY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      touchStart.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    ref,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
    timeThreshold,
  ]);
}

// Pinch gesture hook
export function usePinch(
  ref: RefObject<HTMLElement>,
  options: UsePinchOptions = {}
) {
  const { onPinchIn, onPinchOut, threshold = 0.1 } = options;
  const initialDistance = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getDistance = (touches: TouchList) => {
      const [touch1, touch2] = Array.from(touches);
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance.current = getDistance(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance.current;

        if (Math.abs(scale - 1) > threshold) {
          if (scale > 1) {
            onPinchOut?.(scale);
          } else {
            onPinchIn?.(scale);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      initialDistance.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onPinchIn, onPinchOut, threshold]);
}

// Tap gesture hook
export function useTap(
  ref: RefObject<HTMLElement>,
  options: UseTapOptions = {}
) {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    doubleTapDelay = 300,
    longPressDelay = 500,
  } = options;

  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = () => {
      if (onLongPress) {
        longPressTimeout.current = setTimeout(() => {
          onLongPress();
        }, longPressDelay);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timeout
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }

      const now = Date.now();
      const timeSinceLastTap = now - lastTap.current;

      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        // Double tap detected
        if (tapTimeout.current) {
          clearTimeout(tapTimeout.current);
        }
        onDoubleTap();
        lastTap.current = 0;
      } else {
        // Single tap
        lastTap.current = now;
        if (onTap) {
          tapTimeout.current = setTimeout(() => {
            onTap();
          }, doubleTapDelay);
        }
      }
    };

    const handleTouchCancel = () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    };
  }, [ref, onTap, onDoubleTap, onLongPress, doubleTapDelay, longPressDelay]);
}

// Combined touch gestures hook
export function useTouchGestures(
  ref: RefObject<HTMLElement>,
  handlers: SwipeHandlers & PinchHandlers & TapHandlers = {}
) {
  useSwipe(ref, handlers);
  usePinch(ref, handlers);
  useTap(ref, handlers);
}

// Touch-friendly button hook
export function useTouchButton(onPress: () => void) {
  const [isPressed, setIsPressed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    onPress();
    setTimeout(() => setIsPressed(false), 150);
  }, [onPress]);

  useTap(ref, { onTap: handlePress });

  return { ref, isPressed };
}

// Mobile viewport hook
export function useMobileViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    isPortrait: true,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const isDesktop = width >= 1024;

      setViewport({
        width,
        height,
        isPortrait,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  return viewport;
}
