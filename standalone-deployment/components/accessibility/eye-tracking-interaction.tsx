"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle2, Crosshair, Eye, Target, Zap } from "lucide-react";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ================================================================================
// TYPES & INTERFACES
// ================================================================================

export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
  confidence: number; // 0-1 scale
}

export interface EyeTrackingDevice {
  id: string;
  name: string;
  type: "webcam" | "dedicated" | "medical-grade";
  connected: boolean;
  accuracy: number; // pixels deviation
  frequency: number; // Hz
  calibrated: boolean;
  supports_medical_use: boolean;
}

export interface DwellTarget {
  id: string;
  element: HTMLElement;
  area: DOMRect;
  dwell_time: number; // milliseconds required
  activation_type: "click" | "hover" | "focus" | "medical-action";
  healthcare_priority: "emergency" | "high" | "normal" | "low";
  current_dwell: number; // current dwell time
  gaze_history: GazePoint[];
  activated: boolean;
  metadata?: unknown;
}

export interface GazePattern {
  id: string;
  name: string;
  description: string;
  pattern_type: "fixation" | "saccade" | "smooth_pursuit" | "medical_scan";
  medical_context: boolean;
  activation_threshold: number; // confidence threshold
}

export interface EyeTrackingSettings {
  enabled: boolean;
  device_id: string | null;
  calibrated: boolean;

  // Dwell Settings
  default_dwell_time: number; // milliseconds
  emergency_dwell_time: number; // milliseconds for emergency actions
  medical_dwell_time: number; // milliseconds for medical actions

  // Accuracy Settings
  gaze_accuracy: number; // pixels
  confidence_threshold: number; // 0-1
  smoothing_factor: number; // 0-1

  // Visual Feedback
  show_gaze_cursor: boolean;
  show_dwell_progress: boolean;
  highlight_targets: boolean;

  // Healthcare Mode
  healthcare_mode: boolean;
  medical_safety_mode: boolean; // extra confirmation for critical actions
  patient_monitoring: boolean;

  // Interaction Modes
  dwell_activation: boolean;
  blink_activation: boolean;
  gesture_activation: boolean;
}

export interface EyeTrackingContextType {
  // Device Management
  devices: EyeTrackingDevice[];
  settings: EyeTrackingSettings;
  updateSettings: (settings: Partial<EyeTrackingSettings>) => void;

  // Tracking State
  current_gaze: GazePoint | null;
  is_tracking: boolean;
  calibration_status: "not_calibrated" | "calibrating" | "calibrated" | "error";

  // Target Management
  targets: DwellTarget[];
  registerTarget: (id: string, element: HTMLElement, config?: Partial<DwellTarget>) => void;
  unregisterTarget: (id: string) => void;

  // Calibration
  startCalibration: () => void;
  completeCalibration: () => void;

  // Tracking Control
  startTracking: () => void;
  stopTracking: () => void;
}

// ================================================================================
// CONSTANTS & CONFIGURATIONS
// ================================================================================

const MEDICAL_GAZE_PATTERNS: GazePattern[] = [
  {
    id: "patient_scan",
    name: "Varredura de Paciente",
    description: "Padrão de visualização para exame de paciente",
    pattern_type: "medical_scan",
    medical_context: true,
    activation_threshold: 0.8,
  },
  {
    id: "emergency_focus",
    name: "Foco de Emergência",
    description: "Padrão de fixação para situações de emergência",
    pattern_type: "fixation",
    medical_context: true,
    activation_threshold: 0.9,
  },
  {
    id: "procedure_follow",
    name: "Acompanhamento de Procedimento",
    description: "Padrão de seguimento suave durante procedimentos",
    pattern_type: "smooth_pursuit",
    medical_context: true,
    activation_threshold: 0.75,
  },
];

const HEALTHCARE_TARGET_TYPES = {
  "patient-critical": {
    dwell_time: 2000,
    priority: "emergency" as const,
    confirmation_required: true,
  },
  "procedure-action": {
    dwell_time: 1500,
    priority: "high" as const,
    confirmation_required: true,
  },
  "navigation": {
    dwell_time: 800,
    priority: "normal" as const,
    confirmation_required: false,
  },
  "information": {
    dwell_time: 600,
    priority: "low" as const,
    confirmation_required: false,
  },
} as const;

const DEFAULT_SETTINGS: EyeTrackingSettings = {
  enabled: false,
  device_id: null,
  calibrated: false,
  default_dwell_time: 1200,
  emergency_dwell_time: 2500,
  medical_dwell_time: 1800,
  gaze_accuracy: 50,
  confidence_threshold: 0.7,
  smoothing_factor: 0.3,
  show_gaze_cursor: true,
  show_dwell_progress: true,
  highlight_targets: true,
  healthcare_mode: true,
  medical_safety_mode: true,
  patient_monitoring: false,
  dwell_activation: true,
  blink_activation: false,
  gesture_activation: false,
};

// ================================================================================
// CONTEXT & PROVIDER
// ================================================================================

const EyeTrackingContext = createContext<EyeTrackingContextType | null>(null);

export function EyeTrackingProvider({ children }: { children: React.ReactNode; }) {
  // State Management
  const [devices, setDevices] = useState<EyeTrackingDevice[]>([]);
  const [settings, setSettings] = useState<EyeTrackingSettings>(DEFAULT_SETTINGS);
  const [currentGaze, setCurrentGaze] = useState<GazePoint | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState<
    "not_calibrated" | "calibrating" | "calibrated" | "error"
  >("not_calibrated");
  const [targets, setTargets] = useState<DwellTarget[]>([]);

  // Refs
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const gazeHistory = useRef<GazePoint[]>([]);
  const calibrationPoints = useRef<{ x: number; y: number; }[]>([]);

  // ================================================================================
  // DEVICE DETECTION & MANAGEMENT
  // ================================================================================

  useEffect(() => {
    // Simulated eye-tracking device detection
    const detectedDevices: EyeTrackingDevice[] = [
      {
        id: "webcam_basic",
        name: "Webcam Básica",
        type: "webcam",
        connected: true,
        accuracy: 80,
        frequency: 30,
        calibrated: false,
        supports_medical_use: false,
      },
      {
        id: "tobii_medical",
        name: "Tobii Eye Tracker Médico",
        type: "medical-grade",
        connected: true,
        accuracy: 15,
        frequency: 120,
        calibrated: false,
        supports_medical_use: true,
      },
      {
        id: "eyetech_pro",
        name: "EyeTech TM5 Pro",
        type: "dedicated",
        connected: false,
        accuracy: 25,
        frequency: 60,
        calibrated: false,
        supports_medical_use: true,
      },
    ];

    setDevices(detectedDevices);
  }, []);

  // ================================================================================
  // GAZE SIMULATION & TRACKING
  // ================================================================================

  const simulateGazePoint = useCallback((): GazePoint => {
    // Simulate realistic gaze data with some noise
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Add realistic eye movement patterns
    const time = Date.now();
    const waveX = Math.sin(time / 1000) * 100;
    const waveY = Math.cos(time / 1500) * 80;

    // Add noise based on device accuracy
    const currentDevice = devices.find(d => d.id === settings.device_id);
    const accuracy = currentDevice?.accuracy || 50;

    const noiseX = (Math.random() - 0.5) * accuracy;
    const noiseY = (Math.random() - 0.5) * accuracy;

    return {
      x: Math.max(0, Math.min(window.innerWidth, centerX + waveX + noiseX)),
      y: Math.max(0, Math.min(window.innerHeight, centerY + waveY + noiseY)),
      timestamp: time,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
    };
  }, [devices, settings.device_id]);

  // ================================================================================
  // TARGET MANAGEMENT
  // ================================================================================

  const registerTarget = useCallback((
    id: string,
    element: HTMLElement,
    config?: Partial<DwellTarget>,
  ) => {
    const rect = element.getBoundingClientRect();

    // Enhance element for eye-tracking
    element.setAttribute("data-eye-tracking-target", "true");
    element.setAttribute("data-target-id", id);

    // Add healthcare-specific attributes
    if (settings.healthcare_mode && config?.healthcare_priority) {
      element.setAttribute("data-healthcare-priority", config.healthcare_priority);
      element.setAttribute("aria-describedby", `${id}_eye_tracking_description`);
    }

    const newTarget: DwellTarget = {
      id,
      element,
      area: rect,
      dwell_time: config?.dwell_time || settings.default_dwell_time,
      activation_type: config?.activation_type || "click",
      healthcare_priority: config?.healthcare_priority || "normal",
      current_dwell: 0,
      gaze_history: [],
      activated: false,
      metadata: config?.metadata,
    };

    setTargets(prev => [...prev.filter(t => t.id !== id), newTarget]);
  }, [settings.healthcare_mode, settings.default_dwell_time]);

  const unregisterTarget = useCallback((id: string) => {
    setTargets(prev => {
      const target = prev.find(t => t.id === id);
      if (target) {
        target.element.removeAttribute("data-eye-tracking-target");
        target.element.removeAttribute("data-target-id");
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // ================================================================================
  // GAZE PROCESSING & DWELL DETECTION
  // ================================================================================

  const processGazePoint = useCallback((gazePoint: GazePoint) => {
    setCurrentGaze(gazePoint);
    gazeHistory.current.push(gazePoint);

    // Keep only recent gaze history (last 2 seconds)
    const cutoffTime = gazePoint.timestamp - 2000;
    gazeHistory.current = gazeHistory.current.filter(p => p.timestamp > cutoffTime);

    // Update target states
    setTargets(prevTargets =>
      prevTargets.map(target => {
        const { area } = target;
        const isGazing = gazePoint.x >= area.left
          && gazePoint.x <= area.right
          && gazePoint.y >= area.top
          && gazePoint.y <= area.bottom
          && gazePoint.confidence >= settings.confidence_threshold;

        if (isGazing) {
          // Add to gaze history for this target
          const newGazeHistory = [...target.gaze_history, gazePoint];

          // Calculate dwell time
          const dwellStart = newGazeHistory[0]?.timestamp || gazePoint.timestamp;
          const currentDwell = gazePoint.timestamp - dwellStart;

          // Check for activation
          let shouldActivate = false;
          if (settings.dwell_activation && currentDwell >= target.dwell_time && !target.activated) {
            // Healthcare safety check
            if (settings.medical_safety_mode && target.healthcare_priority === "emergency") {
              // Require extra confirmation for emergency actions
              const steadyGaze = newGazeHistory.slice(-10).every(p =>
                Math.abs(p.x - gazePoint.x) < 20 && Math.abs(p.y - gazePoint.y) < 20
              );
              shouldActivate = steadyGaze;
            } else {
              shouldActivate = true;
            }
          }

          if (shouldActivate) {
            // Activate target
            setTimeout(() => {
              switch (target.activation_type) {
                case "click":
                  target.element.click();
                  break;
                case "hover":
                  target.element.dispatchEvent(new MouseEvent("mouseenter"));
                  break;
                case "focus":
                  target.element.focus();
                  break;
                case "medical-action":
                  // Special handling for medical actions
                  const medicalEvent = new CustomEvent("medical-eye-activation", {
                    detail: {
                      targetId: target.id,
                      priority: target.healthcare_priority,
                      dwellTime: currentDwell,
                    },
                  });
                  target.element.dispatchEvent(medicalEvent);
                  break;
              }
            }, 0);

            return {
              ...target,
              current_dwell: currentDwell,
              gaze_history: newGazeHistory,
              activated: true,
            };
          } else {
            return {
              ...target,
              current_dwell: currentDwell,
              gaze_history: newGazeHistory,
              activated: false,
            };
          }
        } else {
          // Reset if not gazing
          return {
            ...target,
            current_dwell: 0,
            gaze_history: [],
            activated: false,
          };
        }
      })
    );
  }, [settings.confidence_threshold, settings.dwell_activation, settings.medical_safety_mode]);

  // ================================================================================
  // CALIBRATION SYSTEM
  // ================================================================================

  const startCalibration = useCallback(() => {
    if (!isTracking) return;

    setCalibrationStatus("calibrating");
    calibrationPoints.current = [
      { x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 },
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.1 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
      { x: window.innerWidth * 0.1, y: window.innerHeight * 0.9 },
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.9 },
    ];

    // Simulate calibration process
    let currentPoint = 0;
    const calibrationInterval = setInterval(() => {
      if (currentPoint >= calibrationPoints.current.length) {
        clearInterval(calibrationInterval);
        completeCalibration();
        return;
      }

      // Show calibration point at current position
      const point = calibrationPoints.current[currentPoint];
      const calibrationDot = document.createElement("div");
      calibrationDot.style.position = "fixed";
      calibrationDot.style.left = `${point.x - 10}px`;
      calibrationDot.style.top = `${point.y - 10}px`;
      calibrationDot.style.width = "20px";
      calibrationDot.style.height = "20px";
      calibrationDot.style.borderRadius = "50%";
      calibrationDot.style.backgroundColor = "#ff0000";
      calibrationDot.style.zIndex = "9999";
      calibrationDot.style.animation = "pulse 1s infinite";
      calibrationDot.id = "eye-calibration-dot";

      // Remove previous dot
      const prevDot = document.getElementById("eye-calibration-dot");
      if (prevDot) prevDot.remove();

      document.body.append(calibrationDot);

      currentPoint++;
    }, 3000);
  }, [isTracking]);

  const completeCalibration = useCallback(() => {
    setCalibrationStatus("calibrated");
    setSettings(prev => ({ ...prev, calibrated: true }));

    // Remove calibration dot
    const calibrationDot = document.getElementById("eye-calibration-dot");
    if (calibrationDot) calibrationDot.remove();

    // Update device calibration status
    setDevices(prev =>
      prev.map(device =>
        device.id === settings.device_id
          ? { ...device, calibrated: true }
          : device
      )
    );
  }, [settings.device_id]);

  // ================================================================================
  // TRACKING CONTROL
  // ================================================================================

  const startTracking = useCallback(() => {
    if (isTracking || !settings.device_id) return;

    setIsTracking(true);

    // Start gaze simulation/tracking
    trackingInterval.current = setInterval(() => {
      if (settings.enabled) {
        const gazePoint = simulateGazePoint();
        processGazePoint(gazePoint);
      }
    }, 1000 / 60); // 60 FPS
  }, [isTracking, settings.device_id, settings.enabled, simulateGazePoint, processGazePoint]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);
    setCurrentGaze(null);

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }

    // Reset all targets
    setTargets(prev =>
      prev.map(target => ({
        ...target,
        current_dwell: 0,
        gaze_history: [],
        activated: false,
      }))
    );
  }, [isTracking]);

  // ================================================================================
  // SETTINGS UPDATE
  // ================================================================================

  const updateSettings = useCallback((newSettings: Partial<EyeTrackingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ================================================================================
  // CONTEXT VALUE
  // ================================================================================

  const contextValue: EyeTrackingContextType = {
    devices,
    settings,
    updateSettings,
    current_gaze: currentGaze,
    is_tracking: isTracking,
    calibration_status: calibrationStatus,
    targets,
    registerTarget,
    unregisterTarget,
    startCalibration,
    completeCalibration,
    startTracking,
    stopTracking,
  };

  return (
    <EyeTrackingContext.Provider value={contextValue}>
      {children}
    </EyeTrackingContext.Provider>
  );
}

// ================================================================================
// CUSTOM HOOKS
// ================================================================================

export function useEyeTracking() {
  const context = useContext(EyeTrackingContext);
  if (!context) {
    throw new Error("useEyeTracking must be used within EyeTrackingProvider");
  }
  return context;
}

export function useEyeTrackingTarget(
  id: string,
  config?: Partial<DwellTarget>,
) {
  const { registerTarget, unregisterTarget, settings } = useEyeTracking();
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elementRef.current && settings.enabled) {
      registerTarget(id, elementRef.current, config);
    }

    return () => {
      if (settings.enabled) {
        unregisterTarget(id);
      }
    };
  }, [id, config, registerTarget, unregisterTarget, settings.enabled]);

  return elementRef;
}

// ================================================================================
// GAZE CURSOR OVERLAY
// ================================================================================

function GazeCursor({ gaze }: { gaze: GazePoint | null; }) {
  if (!gaze) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: gaze.x - 10,
        top: gaze.y - 10,
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: `rgba(59, 130, 246, ${gaze.confidence})`,
        border: "2px solid #3b82f6",
        pointerEvents: "none",
        zIndex: 9998,
        transition: "all 0.1s ease",
      }}
    >
      <Crosshair className="w-4 h-4 text-white" />
    </div>
  );
}

// ================================================================================
// DWELL PROGRESS INDICATORS
// ================================================================================

function DwellProgressOverlay({ targets }: { targets: DwellTarget[]; }) {
  return (
    <>
      {targets
        .filter(target => target.current_dwell > 0 && !target.activated)
        .map(target => {
          const progress = (target.current_dwell / target.dwell_time) * 100;
          const rect = target.area;

          return (
            <div
              key={target.id}
              style={{
                position: "fixed",
                left: rect.left,
                top: rect.top - 8,
                width: rect.width,
                height: 4,
                pointerEvents: "none",
                zIndex: 9997,
              }}
            >
              <div className="w-full bg-gray-200 rounded-full h-full">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    target.healthcare_priority === "emergency"
                      ? "bg-red-500"
                      : target.healthcare_priority === "high"
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
    </>
  );
}

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export interface EyeTrackingInteractionProps {
  className?: string;
  onSettingsChange?: (settings: EyeTrackingSettings) => void;
  healthcareMode?: boolean;
  medicalSafetyMode?: boolean;
  initialSettings?: Partial<EyeTrackingSettings>;
}

export function EyeTrackingInteraction({
  className,
  onSettingsChange,
  healthcareMode = true,
  medicalSafetyMode = true,
  initialSettings,
}: EyeTrackingInteractionProps) {
  const {
    devices,
    settings,
    updateSettings,
    current_gaze,
    is_tracking,
    calibration_status,
    targets,
    startCalibration,
    startTracking,
    stopTracking,
  } = useEyeTracking();

  // Initialize settings
  useEffect(() => {
    if (initialSettings) {
      updateSettings({
        ...initialSettings,
        healthcare_mode: healthcareMode,
        medical_safety_mode: medicalSafetyMode,
      });
    }
  }, [initialSettings, healthcareMode, medicalSafetyMode, updateSettings]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const connectedDevices = devices.filter(device => device.connected);
  const selectedDevice = devices.find(device => device.id === settings.device_id);
  const activeTargets = targets.filter(target => target.current_dwell > 0);

  return (
    <>
      {/* Gaze Cursor Overlay */}
      {settings.show_gaze_cursor && is_tracking && <GazeCursor gaze={current_gaze} />}

      {/* Dwell Progress Overlay */}
      {settings.show_dwell_progress && is_tracking && <DwellProgressOverlay targets={targets} />}

      <Card className={`w-full max-w-4xl ${className}`}>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Controle por Rastreamento Ocular</h3>
                <p className="text-sm text-muted-foreground">
                  Navegação e interação baseada no movimento dos olhos
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={is_tracking ? "default" : "secondary"}>
                {is_tracking ? "Rastreando" : "Parado"}
              </Badge>

              <Badge
                variant={calibration_status === "calibrated" ? "default" : "outline"}
                className={calibration_status === "calibrated"
                  ? "text-green-600 border-green-200"
                  : ""}
              >
                {calibration_status === "calibrated" ? "Calibrado" : "Não Calibrado"}
              </Badge>

              {settings.healthcare_mode && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Modo Médico
                </Badge>
              )}
            </div>
          </div>

          {/* Device Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Dispositivos Detectados
              </h4>

              {connectedDevices.length === 0
                ? (
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Nenhum dispositivo conectado</span>
                  </div>
                )
                : (
                  <div className="space-y-2">
                    {connectedDevices.map(device => (
                      <div key={device.id} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                device.connected ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            <span className="text-sm font-medium">{device.name}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {device.type}
                            </Badge>
                            {device.supports_medical_use && (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          Precisão: ±{device.accuracy}px • {device.frequency}Hz
                          {device.calibrated && " • Calibrado"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Status do Rastreamento</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estado</span>
                  <Badge variant={is_tracking ? "default" : "secondary"}>
                    {is_tracking ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Alvos Ativos</span>
                  <span className="text-sm font-mono">
                    {activeTargets.length}/{targets.length}
                  </span>
                </div>

                {current_gaze && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confiança</span>
                    <span className="text-sm font-mono">
                      {Math.round(current_gaze.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Controles</h4>

              <div className="space-y-2">
                {calibration_status !== "calibrated" && (
                  <Button
                    size="sm"
                    onClick={startCalibration}
                    disabled={!is_tracking}
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Calibrar
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={is_tracking ? stopTracking : startTracking}
                  disabled={!settings.enabled || connectedDevices.length === 0}
                  className="w-full"
                >
                  {is_tracking
                    ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Parar
                      </>
                    )
                    : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Iniciar
                      </>
                    )}
                </Button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações Básicas</h4>

              <div className="flex items-center justify-between">
                <span className="text-sm">Habilitar Eye Tracking</span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Cursor de Olhar</span>
                <Switch
                  checked={settings.show_gaze_cursor}
                  onCheckedChange={(checked) => updateSettings({ show_gaze_cursor: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Progresso de Permanência</span>
                <Switch
                  checked={settings.show_dwell_progress}
                  onCheckedChange={(checked) => updateSettings({ show_dwell_progress: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Realçar Alvos</span>
                <Switch
                  checked={settings.highlight_targets}
                  onCheckedChange={(checked) => updateSettings({ highlight_targets: checked })}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Dispositivo Primário</span>
                <select
                  value={settings.device_id || ""}
                  onChange={(e) => updateSettings({ device_id: e.target.value || null })}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Selecionar dispositivo...</option>
                  {connectedDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name} ({device.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Permanência</h4>

              <div className="space-y-2">
                <span className="text-sm">Tempo Padrão: {settings.default_dwell_time}ms</span>
                <Slider
                  value={[settings.default_dwell_time]}
                  onValueChange={([value]) => updateSettings({ default_dwell_time: value })}
                  min={300}
                  max={3000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Tempo Médico: {settings.medical_dwell_time}ms</span>
                <Slider
                  value={[settings.medical_dwell_time]}
                  onValueChange={([value]) => updateSettings({ medical_dwell_time: value })}
                  min={500}
                  max={5000}
                  step={100}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Emergência: {settings.emergency_dwell_time}ms</span>
                <Slider
                  value={[settings.emergency_dwell_time]}
                  onValueChange={([value]) => updateSettings({ emergency_dwell_time: value })}
                  min={1000}
                  max={5000}
                  step={200}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">
                  Limiar de Confiança: {Math.round(settings.confidence_threshold * 100)}%
                </span>
                <Slider
                  value={[settings.confidence_threshold]}
                  onValueChange={([value]) => updateSettings({ confidence_threshold: value })}
                  min={0.5}
                  max={1}
                  step={0.05}
                  className="w-full"
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
                  <span className="text-sm">Modo Segurança Médica</span>
                  <Switch
                    checked={settings.medical_safety_mode}
                    onCheckedChange={(checked) => updateSettings({ medical_safety_mode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Monitoramento de Paciente</span>
                  <Switch
                    checked={settings.patient_monitoring}
                    onCheckedChange={(checked) => updateSettings({ patient_monitoring: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Ativação por Piscada</span>
                  <Switch
                    checked={settings.blink_activation}
                    onCheckedChange={(checked) => updateSettings({ blink_activation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Ativação por Gesto</span>
                  <Switch
                    checked={settings.gesture_activation}
                    onCheckedChange={(checked) => updateSettings({ gesture_activation: checked })}
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Modo Médico Ativo:</strong>{" "}
                  Ações críticas requerem confirmação adicional. Tempos de permanência ajustados
                  para contexto hospitalar.
                </p>
              </div>
            </div>
          )}

          {/* Device Information */}
          {selectedDevice && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Dispositivo Selecionado</h4>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedDevice.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge>{selectedDevice.type}</Badge>
                    {selectedDevice.supports_medical_use && (
                      <Badge className="text-green-600 border-green-200">
                        Uso Médico
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Precisão: ±{selectedDevice.accuracy}px • Frequência: {selectedDevice.frequency}Hz
                  {selectedDevice.calibrated ? " • Calibrado" : " • Requer Calibração"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default EyeTrackingInteraction;
