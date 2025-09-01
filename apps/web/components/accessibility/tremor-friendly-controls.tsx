"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Hand, 
  Target, 
  Timer, 
  Settings, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  MousePointer,
  Smartphone,
  Clock
} from 'lucide-react';

// ================================================================================
// TYPES & INTERFACES
// ================================================================================

export interface TremorPattern {
  frequency: number; // Hz
  amplitude: number; // pixels
  consistency: number; // 0-1, how regular the tremor is
  dominant_axis: 'x' | 'y' | 'both';
  medical_classification: 'essential' | 'parkinsonian' | 'physiological' | 'medication-induced' | 'stress-related';
}

export interface StabilizationSettings {
  enabled: boolean;
  sensitivity: number; // 1-10 scale
  stabilization_window: number; // milliseconds to average movement
  movement_threshold: number; // pixels - ignore smaller movements
  dwell_confirmation: boolean;
  dwell_time: number; // milliseconds
  large_targets: boolean;
  target_size_multiplier: number; // multiply standard sizes
  hover_expansion: boolean;
  hover_expansion_factor: number; // expand hover area by factor
  touch_hold_delay: number; // milliseconds before registering touch
  double_tap_prevention: boolean;
  double_tap_window: number; // milliseconds
}

export interface TremorFriendlyElement {
  id: string;
  element: HTMLElement;
  original_size: { width: number; height: number };
  expanded_area: DOMRect;
  healthcare_priority: 'emergency' | 'high' | 'normal' | 'low';
  activation_method: 'click' | 'hover' | 'dwell' | 'touch';
  tremor_compensation: boolean;
  stabilized_position: { x: number; y: number } | null;
  interaction_history: InteractionEvent[];
  metadata?: any;
}

export interface InteractionEvent {
  timestamp: number;
  type: 'move' | 'click' | 'hover' | 'touch_start' | 'touch_end';
  position: { x: number; y: number };
  stabilized_position: { x: number; y: number };
  tremor_detected: boolean;
  confidence: number; // 0-1
}

export interface TremorDetectionResult {
  has_tremor: boolean;
  pattern: TremorPattern | null;
  confidence: number;
  recommendations: string[];
}

export interface TremorFriendlyContextType {
  // Settings & Configuration
  settings: StabilizationSettings;
  updateSettings: (settings: Partial<StabilizationSettings>) => void;
  
  // Tremor Detection
  tremor_detection: TremorDetectionResult | null;
  detectTremor: () => void;
  
  // Element Management
  elements: TremorFriendlyElement[];
  registerElement: (id: string, element: HTMLElement, config?: Partial<TremorFriendlyElement>) => void;
  unregisterElement: (id: string) => void;
  
  // Interaction State
  active_element: string | null;
  stabilized_cursor: { x: number; y: number } | null;
  
  // Healthcare Mode
  healthcare_mode: boolean;
  post_procedure_mode: boolean;
  setHealthcareMode: (mode: boolean) => void;
  setPostProcedureMode: (mode: boolean) => void;
}

// ================================================================================
// CONSTANTS & CONFIGURATIONS
// ================================================================================

const HEALTHCARE_TARGET_CONFIGS = {
  'emergency-button': {
    target_size_multiplier: 2,
    dwell_time: 2000,
    priority: 'emergency' as const,
    background_color: '#ef4444',
    hover_color: '#dc2626'
  },
  'procedure-action': {
    target_size_multiplier: 1.8,
    dwell_time: 1500,
    priority: 'high' as const,
    background_color: '#f97316',
    hover_color: '#ea580c'
  },
  'patient-navigation': {
    target_size_multiplier: 1.5,
    dwell_time: 800,
    priority: 'normal' as const,
    background_color: '#3b82f6',
    hover_color: '#2563eb'
  },
  'information-display': {
    target_size_multiplier: 1.3,
    dwell_time: 600,
    priority: 'low' as const,
    background_color: '#6b7280',
    hover_color: '#4b5563'
  }
} as const;

const TREMOR_CLASSIFICATIONS = {
  'essential': {
    name: 'Tremor Essencial',
    description: 'Tremor hereditário, piora com movimento',
    typical_frequency: [4, 12], // Hz range
    compensation_strategy: 'high_stabilization',
    recommended_settings: {
      sensitivity: 8,
      stabilization_window: 300,
      dwell_time: 1200
    }
  },
  'parkinsonian': {
    name: 'Tremor Parkinsoniano',
    description: 'Tremor de repouso, melhora com movimento',
    typical_frequency: [3, 6], // Hz range
    compensation_strategy: 'medium_stabilization',
    recommended_settings: {
      sensitivity: 6,
      stabilization_window: 500,
      dwell_time: 1500
    }
  },
  'physiological': {
    name: 'Tremor Fisiológico',
    description: 'Tremor normal aumentado por stress/cafeína',
    typical_frequency: [8, 12], // Hz range
    compensation_strategy: 'low_stabilization',
    recommended_settings: {
      sensitivity: 4,
      stabilization_window: 150,
      dwell_time: 800
    }
  },
  'medication-induced': {
    name: 'Tremor Medicamentoso',
    description: 'Causado por medicamentos',
    typical_frequency: [5, 10], // Hz range
    compensation_strategy: 'adaptive_stabilization',
    recommended_settings: {
      sensitivity: 7,
      stabilization_window: 250,
      dwell_time: 1000
    }
  },
  'stress-related': {
    name: 'Tremor por Ansiedade',
    description: 'Relacionado ao stress do ambiente hospitalar',
    typical_frequency: [6, 10], // Hz range
    compensation_strategy: 'comfort_stabilization',
    recommended_settings: {
      sensitivity: 5,
      stabilization_window: 200,
      dwell_time: 900
    }
  }
} as const;

const DEFAULT_SETTINGS: StabilizationSettings = {
  enabled: false,
  sensitivity: 5,
  stabilization_window: 200,
  movement_threshold: 8,
  dwell_confirmation: true,
  dwell_time: 1000,
  large_targets: true,
  target_size_multiplier: 1.5,
  hover_expansion: true,
  hover_expansion_factor: 1.3,
  touch_hold_delay: 300,
  double_tap_prevention: true,
  double_tap_window: 500
};

// ================================================================================
// CONTEXT & PROVIDER
// ================================================================================

const TremorFriendlyContext = createContext<TremorFriendlyContextType | null>(null);

export function TremorFriendlyProvider({ children }: { children: React.ReactNode }) {
  // State Management
  const [settings, setSettings] = useState<StabilizationSettings>(DEFAULT_SETTINGS);
  const [tremorDetection, setTremorDetection] = useState<TremorDetectionResult | null>(null);
  const [elements, setElements] = useState<TremorFriendlyElement[]>([]);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [stabilizedCursor, setStabilizedCursor] = useState<{ x: number; y: number } | null>(null);
  const [healthcareMode, setHealthcareMode] = useState(true);
  const [postProcedureMode, setPostProcedureMode] = useState(false);
  
  // Refs for tracking
  const movementHistory = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const lastInteraction = useRef<number>(0);
  const dwellTimeout = useRef<NodeJS.Timeout | null>(null);
  const stabilizationInterval = useRef<NodeJS.Timeout | null>(null);

  // ================================================================================
  // MOVEMENT STABILIZATION SYSTEM
  // ================================================================================

  const stabilizePosition = useCallback((
    x: number, 
    y: number
  ): { x: number; y: number } => {
    if (!settings.enabled) {return { x, y };}
    
    const now = Date.now();
    const windowMs = settings.stabilization_window;
    
    // Add current position to history
    movementHistory.current.push({ x, y, timestamp: now });
    
    // Remove old entries outside the window
    movementHistory.current = movementHistory.current.filter(
      entry => now - entry.timestamp <= windowMs
    );
    
    if (movementHistory.current.length < 2) {
      return { x, y };
    }
    
    // Apply different stabilization algorithms based on settings
    switch (settings.sensitivity) {
      case 1:
      case 2: // Low sensitivity - minimal stabilization
        return { x, y };
        
      case 3:
      case 4: // Low-medium sensitivity - simple average
        const simpleAvg = movementHistory.current.reduce(
          (acc, entry) => ({ x: acc.x + entry.x, y: acc.y + entry.y }),
          { x: 0, y: 0 }
        );
        return {
          x: simpleAvg.x / movementHistory.current.length,
          y: simpleAvg.y / movementHistory.current.length
        };
        
      case 5:
      case 6: // Medium sensitivity - weighted average (recent positions matter more)
        let totalWeight = 0;
        const weightedAvg = movementHistory.current.reduce((acc, entry) => {
          const age = now - entry.timestamp;
          const weight = Math.exp(-age / (windowMs / 3)); // Exponential decay
          totalWeight += weight;
          return {
            x: acc.x + entry.x * weight,
            y: acc.y + entry.y * weight
          };
        }, { x: 0, y: 0 });
        
        return {
          x: weightedAvg.x / totalWeight,
          y: weightedAvg.y / totalWeight
        };
        
      case 7:
      case 8: // High sensitivity - Kalman-like filtering
        // Simple Kalman filter implementation
        const positions = movementHistory.current;
        if (positions.length < 3) {return { x, y };}
        
        // Predict next position based on trend
        const recent = positions.slice(-3);
        const dt = Math.max(recent[2].timestamp - recent[0].timestamp, 1); // Protect against identical timestamps
        const velocityX = (recent[2].x - recent[0].x) / dt;
        const velocityY = (recent[2].y - recent[0].y) / dt;
        
        // Clamp velocities to reasonable bounds
        const clampedVelX = Math.max(-1000, Math.min(1000, velocityX));
        const clampedVelY = Math.max(-1000, Math.min(1000, velocityY));
        
        const predicted = {
          x: recent[2].x + clampedVelX * 16, // ~1 frame ahead
          y: recent[2].y + clampedVelY * 16
        };
        
        // Blend prediction with measurement
        const blendFactor = 0.7;
        return {
          x: predicted.x * blendFactor + x * (1 - blendFactor),
          y: predicted.y * blendFactor + y * (1 - blendFactor)
        };
        
      case 9:
      case 10: // Maximum sensitivity - Heavy smoothing
        // Exponential moving average with strong smoothing
        if (movementHistory.current.length < 5) {return { x, y };}
        
        const alpha = 0.1; // Very strong smoothing
        let smoothedX = movementHistory.current[0].x;
        let smoothedY = movementHistory.current[0].y;
        
        for (let i = 1; i < movementHistory.current.length; i++) {
          const entry = movementHistory.current[i];
          smoothedX = alpha * entry.x + (1 - alpha) * smoothedX;
          smoothedY = alpha * entry.y + (1 - alpha) * smoothedY;
        }
        
        return { x: smoothedX, y: smoothedY };
        
      default:
        return { x, y };
    }
  }, [settings.enabled, settings.stabilization_window, settings.sensitivity]);

  // ================================================================================
  // TREMOR DETECTION ALGORITHM
  // ================================================================================

  const detectTremor = useCallback(() => {
    const movements = movementHistory.current;
    if (movements.length < 50) { // Need enough data points
      setTremorDetection({
        has_tremor: false,
        pattern: null,
        confidence: 0,
        recommendations: ['Coletar mais dados de movimento para análise']
      });
      return;
    }
    
    // Analyze frequency content using simplified FFT approximation
    const timeWindow = 5000; // 5 seconds
    const recentMovements = movements.filter(
      m => Date.now() - m.timestamp <= timeWindow
    );
    
    if (recentMovements.length < 20) {
      setTremorDetection({
        has_tremor: false,
        pattern: null,
        confidence: 0,
        recommendations: ['Dados insuficientes para detecção de tremor']
      });
      return;
    }
    
    // Calculate movement metrics
    let totalDistance = 0;
    let xVariance = 0;
    let yVariance = 0;
    const meanX = recentMovements.reduce((sum, m) => sum + m.x, 0) / recentMovements.length;
    const meanY = recentMovements.reduce((sum, m) => sum + m.y, 0) / recentMovements.length;
    
    for (let i = 1; i < recentMovements.length; i++) {
      const prev = recentMovements[i - 1];
      const curr = recentMovements[i];
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      totalDistance += distance;
      
      xVariance += Math.pow(curr.x - meanX, 2);
      yVariance += Math.pow(curr.y - meanY, 2);
    }
    
    xVariance /= recentMovements.length;
    yVariance /= recentMovements.length;
    
    const avgMovementPerFrame = totalDistance / (recentMovements.length - 1);
    const movementVariability = Math.sqrt(xVariance + yVariance);
    
    // Simple tremor detection heuristics
    const hasTremor = avgMovementPerFrame > 3 && movementVariability > 15;
    const confidence = Math.min(
      (avgMovementPerFrame / 10 + movementVariability / 50) / 2,
      1
    );
    
    // Estimate dominant frequency (simplified)
    let peakCount = 0;
    let lastDirection = 0;
    for (let i = 1; i < recentMovements.length; i++) {
      const direction = recentMovements[i].x - recentMovements[i - 1].x;
      if (direction * lastDirection < 0) { // Direction change
        peakCount++;
      }
      lastDirection = direction;
    }
    
    const estimatedFrequency = (peakCount / 2) / (timeWindow / 1000); // Hz
    
    // Classify tremor type based on frequency and characteristics
    let classification: keyof typeof TREMOR_CLASSIFICATIONS = 'physiological';
    if (estimatedFrequency >= 3 && estimatedFrequency <= 6) {
      classification = 'parkinsonian';
    } else if (estimatedFrequency >= 4 && estimatedFrequency <= 12) {
      classification = 'essential';
    } else if (estimatedFrequency >= 8 && estimatedFrequency <= 12) {
      classification = 'physiological';
    } else if (healthcareMode) {
      classification = 'stress-related';
    }
    
    const tremorPattern: TremorPattern = {
      frequency: estimatedFrequency,
      amplitude: movementVariability,
      consistency: confidence,
      dominant_axis: xVariance > yVariance * 1.5 ? 'x' : yVariance > xVariance * 1.5 ? 'y' : 'both',
      medical_classification: classification
    };
    
    const recommendations: string[] = [];
    if (hasTremor) {
      const classificationInfo = TREMOR_CLASSIFICATIONS[classification];
      recommendations.push(`Detectado: ${classificationInfo.name}`);
      recommendations.push(`Frequência estimada: ${estimatedFrequency.toFixed(1)}Hz`);
      recommendations.push(`Recomendação: ${classificationInfo.compensation_strategy}`);
      
      if (healthcareMode) {
        recommendations.push('Modo hospitalar: considere fatores de stress');
      }
    }
    
    setTremorDetection({
      has_tremor: hasTremor,
      pattern: hasTremor ? tremorPattern : null,
      confidence,
      recommendations
    });
    
    // Auto-apply recommended settings if tremor detected
    if (hasTremor && classification in TREMOR_CLASSIFICATIONS) {
      const recommended = TREMOR_CLASSIFICATIONS[classification].recommended_settings;
      setSettings(prev => ({
        ...prev,
        ...recommended,
        enabled: true
      }));
    }
  }, [healthcareMode]);

  // ================================================================================
  // ELEMENT MANAGEMENT
  // ================================================================================

  const registerElement = useCallback((
    id: string,
    element: HTMLElement,
    config?: Partial<TremorFriendlyElement>
  ) => {
    const rect = element.getBoundingClientRect();
    
    // Enhance element for tremor-friendly interaction
    element.setAttribute('data-tremor-friendly', 'true');
    element.setAttribute('data-element-id', id);
    
    // Apply size multiplier if enabled
    if (settings.large_targets && settings.enabled) {
      const multiplier = settings.target_size_multiplier;
      
      // Store original size
      if (!element.dataset.originalWidth) {
        element.dataset.originalWidth = element.offsetWidth.toString();
        element.dataset.originalHeight = element.offsetHeight.toString();
      }
      
      // Apply larger size
      const newWidth = Math.max(44, element.offsetWidth * multiplier);
      const newHeight = Math.max(44, element.offsetHeight * multiplier);
      
      element.style.minWidth = `${newWidth}px`;
      element.style.minHeight = `${newHeight}px`;
      element.style.padding = `${Math.max(8, 8 * multiplier)}px`;
    }
    
    // Healthcare-specific enhancements
    if (healthcareMode) {
      const priority = config?.healthcare_priority || 'normal';
      element.setAttribute('data-healthcare-priority', priority);
      
      if (priority === 'emergency') {
        element.style.fontSize = '18px';
        element.style.fontWeight = '600';
      }
      
      // Post-procedure mode adjustments
      if (postProcedureMode) {
        element.style.minWidth = '56px';
        element.style.minHeight = '56px';
        element.style.fontSize = '16px';
      }
    }
    
    const newElement: TremorFriendlyElement = {
      id,
      element,
      original_size: {
        width: parseInt(element.dataset.originalWidth || '0') || rect.width,
        height: parseInt(element.dataset.originalHeight || '0') || rect.height
      },
      expanded_area: rect,
      healthcare_priority: config?.healthcare_priority || 'normal',
      activation_method: config?.activation_method || 'click',
      tremor_compensation: settings.enabled,
      stabilized_position: null,
      interaction_history: [],
      metadata: config?.metadata
    };
    
    setElements(prev => [...prev.filter(e => e.id !== id), newElement]);
  }, [settings.large_targets, settings.enabled, settings.target_size_multiplier, healthcareMode, postProcedureMode]);

  const unregisterElement = useCallback((id: string) => {
    setElements(prev => {
      const element = prev.find(e => e.id === id);
      if (element) {
        element.element.removeAttribute('data-tremor-friendly');
        element.element.removeAttribute('data-element-id');
        
        // Restore original size
        if (element.element.dataset.originalWidth) {
          element.element.style.minWidth = `${element.element.dataset.originalWidth}px`;
          element.element.style.minHeight = `${element.element.dataset.originalHeight}px`;
        }
      }
      return prev.filter(e => e.id !== id);
    });
  }, []);

  // ================================================================================
  // GLOBAL MOUSE TRACKING & STABILIZATION
  // ================================================================================

  useEffect(() => {
    if (!settings.enabled) {return;}
    
    const handleMouseMove = (event: MouseEvent) => {
      const stabilized = stabilizePosition(event.clientX, event.clientY);
      setStabilizedCursor(stabilized);
      
      // Check if stabilized position is significantly different
      const originalDistance = Math.sqrt(
        Math.pow(event.clientX - stabilized.x, 2) + 
        Math.pow(event.clientY - stabilized.y, 2)
      );
      
      // Update elements with interaction data
      const interactionEvent: InteractionEvent = {
        timestamp: Date.now(),
        type: 'move',
        position: { x: event.clientX, y: event.clientY },
        stabilized_position: stabilized,
        tremor_detected: originalDistance > settings.movement_threshold,
        confidence: Math.max(0, 1 - originalDistance / 50)
      };
      
      setElements(prev => prev.map(element => {
        const rect = element.element.getBoundingClientRect();
        const isInside = stabilized.x >= rect.left && 
                        stabilized.x <= rect.right && 
                        stabilized.y >= rect.top && 
                        stabilized.y <= rect.bottom;
        
        if (isInside) {
          return {
            ...element,
            stabilized_position: stabilized,
            interaction_history: [...element.interaction_history.slice(-20), interactionEvent]
          };
        }
        
        return element;
      }));
    };
    
    // Dwell activation handler
    const handleMouseEnter = (event: MouseEvent) => {
      if (!settings.dwell_confirmation) {return;}
      
      const target = event.target as HTMLElement;
      if (!target.getAttribute('data-tremor-friendly')) {return;}
      
      const elementId = target.getAttribute('data-element-id');
      if (!elementId) {return;}
      
      setActiveElement(elementId);
      
      // Clear existing dwell timeout
      if (dwellTimeout.current) {
        clearTimeout(dwellTimeout.current);
      }
      
      // Start dwell timer
      dwellTimeout.current = setTimeout(() => {
        const element = elements.find(e => e.id === elementId);
        if (element && settings.dwell_confirmation && element.element.isConnected) {
          // Trigger activation only if element is still in DOM
          element.element.click();
          setActiveElement(null);
        } else if (element && !element.element.isConnected) {
          // Clean up stale element reference
          setElements(prev => prev.filter(e => e.id !== elementId));
        }
      }, settings.dwell_time);
    };
    
    const handleMouseLeave = () => {
      if (dwellTimeout.current) {
        clearTimeout(dwellTimeout.current);
        dwellTimeout.current = null;
      }
      setActiveElement(null);
    };
    
    // Enhanced click handling with double-tap prevention
    const handleClick = (event: MouseEvent) => {
      const now = Date.now();
      
      if (settings.double_tap_prevention && 
          now - lastInteraction.current < settings.double_tap_window) {
        event.preventDefault();
        return;
      }
      
      lastInteraction.current = now;
      
      // Allow the click to proceed normally
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    
    // Add hover listeners to tremor-friendly elements
    const addHoverListeners = () => {
      elements.forEach(element => {
        element.element.addEventListener('mouseenter', handleMouseEnter);
        element.element.addEventListener('mouseleave', handleMouseLeave);
      });
    };
    
    addHoverListeners();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      
      elements.forEach(element => {
        element.element.removeEventListener('mouseenter', handleMouseEnter);
        element.element.removeEventListener('mouseleave', handleMouseLeave);
      });
      
      if (dwellTimeout.current) {
        clearTimeout(dwellTimeout.current);
      }
    };
  }, [settings, elements, stabilizePosition]);

  // ================================================================================
  // AUTO TREMOR DETECTION
  // ================================================================================

  useEffect(() => {
    if (settings.enabled) {
      // Start automatic tremor detection
      const detectionInterval = setInterval(detectTremor, 10_000); // Every 10 seconds
      
      return () => clearInterval(detectionInterval);
    }
  }, [settings.enabled, detectTremor]);

  // ================================================================================
  // ELEMENT CLEANUP
  // ================================================================================

  // Periodically clean up stale element references
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setElements(prev => prev.filter(element => {
        if (!element.element.isConnected) {
          console.log(`Cleaning up stale element reference: ${element.id}`);
          return false;
        }
        return true;
      }));
    }, 30_000); // Check every 30 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  // ================================================================================
  // SETTINGS UPDATE
  // ================================================================================

  const updateSettings = useCallback((newSettings: Partial<StabilizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ================================================================================
  // CONTEXT VALUE
  // ================================================================================

  const contextValue: TremorFriendlyContextType = {
    settings,
    updateSettings,
    tremor_detection: tremorDetection,
    detectTremor,
    elements,
    registerElement,
    unregisterElement,
    active_element: activeElement,
    stabilized_cursor: stabilizedCursor,
    healthcare_mode: healthcareMode,
    post_procedure_mode: postProcedureMode,
    setHealthcareMode,
    setPostProcedureMode
  };

  return (
    <TremorFriendlyContext.Provider value={contextValue}>
      {children}
    </TremorFriendlyContext.Provider>
  );
}

// ================================================================================
// CUSTOM HOOKS
// ================================================================================

export function useTremorFriendly() {
  const context = useContext(TremorFriendlyContext);
  if (!context) {
    throw new Error('useTremorFriendly must be used within TremorFriendlyProvider');
  }
  return context;
}

export function useTremorFriendlyElement(
  id: string,
  config?: Partial<TremorFriendlyElement>
) {
  const { registerElement, unregisterElement, settings } = useTremorFriendly();
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elementRef.current && settings.enabled) {
      registerElement(id, elementRef.current, config);
    }
    
    return () => {
      if (settings.enabled) {
        unregisterElement(id);
      }
    };
  }, [id, config, registerElement, unregisterElement, settings.enabled]);

  return elementRef;
}

// ================================================================================
// STABILIZED CURSOR OVERLAY
// ================================================================================

function StabilizedCursorOverlay({ 
  position, 
  originalPosition 
}: { 
  position: { x: number; y: number } | null;
  originalPosition: { x: number; y: number } | null;
}) {
  if (!position) {return null;}
  
  return (
    <>
      {/* Stabilized cursor */}
      <div
        style={{
          position: 'fixed',
          left: position.x - 8,
          top: position.y - 8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          border: '2px solid #22c55e',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'all 0.1s ease'
        }}
      />
      
      {/* Connection line to original cursor */}
      {originalPosition && (
        <svg
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9998
          }}
        >
          <line
            x1={originalPosition.x}
            y1={originalPosition.y}
            x2={position.x}
            y2={position.y}
            stroke="rgba(34, 197, 94, 0.4)"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </svg>
      )}
    </>
  );
}

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export interface TremorFriendlyControlsProps {
  className?: string;
  onSettingsChange?: (settings: StabilizationSettings) => void;
  healthcareMode?: boolean;
  postProcedureMode?: boolean;
  initialSettings?: Partial<StabilizationSettings>;
}

export function TremorFriendlyControls({
  className,
  onSettingsChange,
  healthcareMode = true,
  postProcedureMode = false,
  initialSettings
}: TremorFriendlyControlsProps) {
  const {
    settings,
    updateSettings,
    tremor_detection,
    detectTremor,
    elements,
    active_element,
    stabilized_cursor,
    setHealthcareMode,
    setPostProcedureMode
  } = useTremorFriendly();

  const [originalCursor, setOriginalCursor] = useState<{ x: number; y: number } | null>(null);

  // Initialize settings and modes
  useEffect(() => {
    if (initialSettings) {
      updateSettings(initialSettings);
    }
    setHealthcareMode(healthcareMode);
    setPostProcedureMode(postProcedureMode);
  }, [initialSettings, healthcareMode, postProcedureMode, updateSettings, setHealthcareMode, setPostProcedureMode]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  // Track original cursor position for overlay
  useEffect(() => {
    if (!settings.enabled) {return;}
    
    const handleMouseMove = (event: MouseEvent) => {
      setOriginalCursor({ x: event.clientX, y: event.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [settings.enabled]);

  const activeElements = elements.filter(e => e.stabilized_position !== null);
  const currentClassification = tremor_detection?.pattern?.medical_classification;

  return (
    <>
      {/* Stabilized Cursor Overlay */}
      {settings.enabled && (
        <StabilizedCursorOverlay 
          position={stabilized_cursor} 
          originalPosition={originalCursor}
        />
      )}

      <Card className={`w-full max-w-4xl ${className}`}>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hand className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Controles Anti-Tremor</h3>
                <p className="text-sm text-muted-foreground">
                  Estabilização de interação para usuários com tremor
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={settings.enabled ? "default" : "secondary"}>
                {settings.enabled ? "Ativo" : "Inativo"}
              </Badge>
              
              {tremor_detection?.has_tremor && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Tremor Detectado
                </Badge>
              )}
              
              {healthcareMode && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Modo Médico
                </Badge>
              )}
              
              {postProcedureMode && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Pós-Procedimento
                </Badge>
              )}
            </div>
          </div>

          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Detecção de Tremor
              </h4>
              
              {tremor_detection ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={tremor_detection.has_tremor ? "destructive" : "default"}>
                      {tremor_detection.has_tremor ? "Detectado" : "Normal"}
                    </Badge>
                  </div>
                  
                  {tremor_detection.has_tremor && tremor_detection.pattern && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tipo</span>
                        <span className="text-xs">
                          {TREMOR_CLASSIFICATIONS[currentClassification!]?.name || 'Desconhecido'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Frequência</span>
                        <span className="text-xs font-mono">
                          {tremor_detection.pattern.frequency.toFixed(1)}Hz
                        </span>
                      </div>
                    </>
                  )}
                  
                  <Progress 
                    value={tremor_detection.confidence * 100} 
                    className="h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    Confiança: {Math.round(tremor_detection.confidence * 100)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Coletando dados...</span>
                </div>
              )}
              
              <Button
                size="sm"
                onClick={detectTremor}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                Detectar Agora
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Elementos Ativos</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Registrado</span>
                  <span className="text-sm font-mono">{elements.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Com Interação</span>
                  <span className="text-sm font-mono">{activeElements.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Elemento Ativo</span>
                  <span className="text-xs font-mono">
                    {active_element || "Nenhum"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Estabilização</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sensibilidade</span>
                  <Badge variant="outline">
                    {settings.sensitivity}/10
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Janela</span>
                  <span className="text-xs font-mono">
                    {settings.stabilization_window}ms
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Limiar</span>
                  <span className="text-xs font-mono">
                    {settings.movement_threshold}px
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Controles</h4>
              
              <div className="space-y-2">
                <Button
                  size="sm"
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  variant={settings.enabled ? "default" : "outline"}
                  className="w-full"
                >
                  {settings.enabled ? (
                    <>
                      <Hand className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Desativar
                    </>
                  )}
                </Button>
                
                {tremor_detection?.has_tremor && currentClassification && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const recommended = TREMOR_CLASSIFICATIONS[currentClassification].recommended_settings;
                      updateSettings({ ...recommended, enabled: true });
                    }}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Auto-Configurar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Estabilização</h4>
              
              <div className="space-y-2">
                <span className="text-sm">Sensibilidade: {settings.sensitivity}</span>
                <Slider
                  value={[settings.sensitivity]}
                  onValueChange={([value]) => updateSettings({ sensitivity: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Mínima</span>
                  <span>Máxima</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm">Janela de Estabilização: {settings.stabilization_window}ms</span>
                <Slider
                  value={[settings.stabilization_window]}
                  onValueChange={([value]) => updateSettings({ stabilization_window: value })}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Limiar de Movimento: {settings.movement_threshold}px</span>
                <Slider
                  value={[settings.movement_threshold]}
                  onValueChange={([value]) => updateSettings({ movement_threshold: value })}
                  min={2}
                  max={50}
                  step={2}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Interação</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Confirmação por Permanência</span>
                <Switch
                  checked={settings.dwell_confirmation}
                  onCheckedChange={(checked) => updateSettings({ dwell_confirmation: checked })}
                />
              </div>

              {settings.dwell_confirmation && (
                <div className="space-y-2">
                  <span className="text-sm">Tempo de Permanência: {settings.dwell_time}ms</span>
                  <Slider
                    value={[settings.dwell_time]}
                    onValueChange={([value]) => updateSettings({ dwell_time: value })}
                    min={300}
                    max={3000}
                    step={100}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm">Alvos Grandes</span>
                <Switch
                  checked={settings.large_targets}
                  onCheckedChange={(checked) => updateSettings({ large_targets: checked })}
                />
              </div>

              {settings.large_targets && (
                <div className="space-y-2">
                  <span className="text-sm">Multiplicador de Tamanho: {settings.target_size_multiplier.toFixed(1)}x</span>
                  <Slider
                    value={[settings.target_size_multiplier]}
                    onValueChange={([value]) => updateSettings({ target_size_multiplier: value })}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm">Prevenção Toque Duplo</span>
                <Switch
                  checked={settings.double_tap_prevention}
                  onCheckedChange={(checked) => updateSettings({ double_tap_prevention: checked })}
                />
              </div>
            </div>
          </div>

          {/* Healthcare Mode Settings */}
          {healthcareMode && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-4 flex items-center text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Configurações Médicas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Modo Pós-Procedimento</span>
                  <Switch
                    checked={postProcedureMode}
                    onCheckedChange={setPostProcedureMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Expansão de Hover</span>
                  <Switch
                    checked={settings.hover_expansion}
                    onCheckedChange={(checked) => updateSettings({ hover_expansion: checked })}
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Modo Médico:</strong> Alvos otimizados para uso hospitalar. 
                  Modo pós-procedimento aumenta tamanhos para mãos enfaixadas.
                </p>
              </div>
            </div>
          )}

          {/* Tremor Detection Results */}
          {tremor_detection?.has_tremor && tremor_detection.recommendations.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2 flex items-center text-orange-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Recomendações de Tremor
              </h4>
              
              <div className="space-y-2">
                {tremor_detection.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-2 bg-orange-50 rounded text-sm text-orange-700">
                    {recommendation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default TremorFriendlyControls;