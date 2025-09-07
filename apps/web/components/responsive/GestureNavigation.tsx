import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, /* Menu, */ X } from "lucide-react"; // Menu unused import
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useResponsive } from "./ResponsiveLayout";

// Gesture types supported by the navigation system
export type GestureType =
  | "swipe-left" // Navigate forward/next
  | "swipe-right" // Navigate back/previous
  | "swipe-up" // Show more options/menu
  | "swipe-down" // Dismiss/close
  | "long-press" // Context menu/options
  | "double-tap"; // Quick action

// Navigation direction
export type NavigationDirection = "previous" | "next" | "up" | "down";

// Gesture event data
export interface GestureEvent {
  type: GestureType;
  direction: NavigationDirection | null;
  velocity: number;
  distance: number;
  duration: number;
}

// Gesture navigation props
interface GestureNavigationProps {
  children: React.ReactNode;
  onGesture?: (gesture: GestureEvent) => void;
  onNavigate?: (direction: NavigationDirection) => void;
  enableSwipe?: boolean;
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
  swipeThreshold?: number;
  longPressDelay?: number;
  className?: string;
}

export function GestureNavigation({
  children,
  onGesture,
  onNavigate,
  enableSwipe = true,
  enableLongPress = false,
  enableDoubleTap = false,
  swipeThreshold = 50,
  longPressDelay = 500,
  className,
}: GestureNavigationProps) {
  const { healthcareContext, isMobile, touchOptimized } = useResponsive();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Touch tracking state
  const touchStartRef = useRef<{ x: number; y: number; time: number; } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Gesture detection sensitivity based on healthcare context
  const getGestureSensitivity = useCallback(() => {
    switch (healthcareContext) {
      case "post-procedure":
        return { threshold: swipeThreshold * 0.7, velocity: 0.3 }; // More sensitive
      case "one-handed":
        return { threshold: swipeThreshold * 0.8, velocity: 0.4 }; // Easier one-handed gestures
      case "emergency":
        return { threshold: swipeThreshold * 1.2, velocity: 0.6 }; // Less sensitive to prevent accidents
      default:
        return { threshold: swipeThreshold, velocity: 0.5 };
    }
  }, [healthcareContext, swipeThreshold]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enableSwipe && !enableLongPress && !enableDoubleTap) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setIsGestureActive(true);

    // Long press detection
    if (enableLongPress) {
      longPressTimeoutRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          const gestureEvent: GestureEvent = {
            type: "long-press",
            direction: null,
            velocity: 0,
            distance: 0,
            duration: Date.now() - touchStartRef.current.time,
          };

          onGesture?.(gestureEvent);

          // Haptic feedback for long press
          if ("vibrate" in navigator) {
            navigator.vibrate([50, 50, 50]);
          }
        }
      }, longPressDelay);
    }
  }, [enableSwipe, enableLongPress, enableDoubleTap, longPressDelay, onGesture]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const startTouch = touchStartRef.current;
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = touch.clientY - startTouch.y;
    const deltaTime = Date.now() - startTouch.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    const { threshold, velocity: minVelocity } = getGestureSensitivity();

    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // Double tap detection
    if (enableDoubleTap && distance < 20 && deltaTime < 300) {
      const currentTime = Date.now();
      if (currentTime - lastTapTimeRef.current < 400) {
        const gestureEvent: GestureEvent = {
          type: "double-tap",
          direction: null,
          velocity,
          distance,
          duration: deltaTime,
        };

        onGesture?.(gestureEvent);

        // Haptic feedback for double tap
        if ("vibrate" in navigator) {
          navigator.vibrate(60);
        }

        touchStartRef.current = null;
        setIsGestureActive(false);
        return;
      }
      lastTapTimeRef.current = currentTime;
    }

    // Swipe gesture detection
    if (enableSwipe && distance >= threshold && velocity >= minVelocity) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      let gestureType: GestureType;
      let direction: NavigationDirection;

      if (isHorizontal) {
        gestureType = deltaX > 0 ? "swipe-right" : "swipe-left";
        direction = deltaX > 0 ? "previous" : "next";
      } else {
        gestureType = deltaY > 0 ? "swipe-down" : "swipe-up";
        direction = deltaY > 0 ? "down" : "up";
      }

      const gestureEvent: GestureEvent = {
        type: gestureType,
        direction,
        velocity,
        distance,
        duration: deltaTime,
      };

      onGesture?.(gestureEvent);
      onNavigate?.(direction);

      // Haptic feedback based on healthcare context
      if ("vibrate" in navigator) {
        const pattern = healthcareContext === "emergency" ? [80, 30, 80] : [40];
        navigator.vibrate(pattern);
      }
    }

    touchStartRef.current = null;
    setIsGestureActive(false);
  }, [
    enableSwipe,
    enableDoubleTap,
    getGestureSensitivity,
    onGesture,
    onNavigate,
    healthcareContext,
  ]);

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!touchOptimized) return; // Only for touch devices

    const direction: NavigationDirection | null = e.key === "ArrowLeft"
      ? "previous"
      : e.key === "ArrowRight"
      ? "next"
      : e.key === "ArrowUp"
      ? "up"
      : e.key === "ArrowDown"
      ? "down"
      : null;

    if (direction) {
      e.preventDefault();
      onNavigate?.(direction);
    }
  }, [touchOptimized, onNavigate]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !touchOptimized) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("keydown", handleKeyDown);

      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [touchOptimized, handleTouchStart, handleTouchEnd, handleKeyDown]);

  const containerClass = cn(
    "gesture-navigation",
    "relative w-full h-full",
    "touch-pan-x touch-pan-y", // Allow browser default touch behaviors
    isGestureActive && "gesture-active",
    healthcareContext === "emergency" && "gesture-emergency",
    healthcareContext === "post-procedure" && "gesture-post-procedure",
    className,
  );

  return (
    <div
      ref={containerRef}
      className={containerClass}
      data-gesture-active={isGestureActive}
      data-healthcare-context={healthcareContext}
    >
      {children}
    </div>
  );
}

// Swipe navigation indicators
interface SwipeIndicatorsProps {
  showPrevious?: boolean;
  showNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export function SwipeIndicators({
  showPrevious = false,
  showNext = false,
  onPrevious,
  onNext,
  className,
}: SwipeIndicatorsProps) {
  const { healthcareContext, touchOptimized } = useResponsive();

  if (!touchOptimized) return null;

  const indicatorClass = cn(
    "swipe-indicator",
    "absolute top-1/2 transform -translate-y-1/2",
    "bg-background/80 backdrop-blur-sm",
    "border border-border rounded-full",
    "flex items-center justify-center",
    "touch-target",
    healthcareContext === "post-procedure" && "w-14 h-14",
    healthcareContext === "emergency" && "bg-emergency/90 text-white",
    "transition-all duration-200 ease-in-out",
    "hover:scale-110 active:scale-95",
  );

  return (
    <>
      {showPrevious && (
        <button
          className={cn(indicatorClass, "left-4", className)}
          onClick={onPrevious}
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {showNext && (
        <button
          className={cn(indicatorClass, "right-4", className)}
          onClick={onNext}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </>
  );
}

// Mobile menu drawer with gesture support
interface MobileMenuDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function MobileMenuDrawer({
  isOpen,
  onOpenChange,
  children,
  className,
}: MobileMenuDrawerProps) {
  const { isMobile, healthcareContext } = useResponsive();
  const [isDragging, setIsDragging] = useState(false);

  const handleGesture = useCallback((gesture: GestureEvent) => {
    if (gesture.type === "swipe-right" && isOpen) {
      onOpenChange(false);
    } else if (gesture.type === "swipe-left" && !isOpen) {
      onOpenChange(true);
    }
  }, [isOpen, onOpenChange]);

  if (!isMobile) return null;

  const drawerClass = cn(
    "mobile-menu-drawer",
    "fixed inset-y-0 left-0 z-50",
    "bg-background border-r border-border",
    "transform transition-transform duration-300 ease-in-out",
    "w-80 max-w-[85vw]",
    isOpen ? "translate-x-0" : "-translate-x-full",
    healthcareContext === "emergency" && "border-emergency/20",
    className,
  );

  const overlayClass = cn(
    "menu-overlay",
    "fixed inset-0 bg-black/50 z-40",
    "transition-opacity duration-300",
    isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={overlayClass}
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <GestureNavigation
        onGesture={handleGesture}
        enableSwipe
        className={drawerClass}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            className="touch-target p-2"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </GestureNavigation>
    </>
  );
}

// Gesture help overlay for first-time users
interface GestureHelpProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function GestureHelp({ isVisible, onDismiss }: GestureHelpProps) {
  const { healthcareContext, touchOptimized } = useResponsive();

  if (!isVisible || !touchOptimized) return null;

  const gestures = [
    { gesture: "Swipe Left", action: "Go to next page/step" },
    { gesture: "Swipe Right", action: "Go back to previous page" },
    { gesture: "Swipe Up", action: "Show additional options" },
    { gesture: "Swipe Down", action: "Dismiss or close" },
    { gesture: "Long Press", action: "Show context menu" },
    { gesture: "Double Tap", action: "Quick action/zoom" },
  ];

  return (
    <div className="gesture-help fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Gesture Navigation</h3>
        <div className="space-y-3 mb-6">
          {gestures.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.gesture}</span>
              <span className="text-muted-foreground">{item.action}</span>
            </div>
          ))}
        </div>
        <button
          className="touch-target w-full bg-primary text-primary-foreground"
          onClick={onDismiss}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default GestureNavigation;
