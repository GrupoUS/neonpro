"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle2, Pause, Play, RotateCcw, Settings, Zap } from "lucide-react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ================================================================================
// TYPES & INTERFACES
// ================================================================================

export interface SwitchDevice {
  id: string;
  name: string;
  type: "single" | "dual" | "joystick" | "sip-puff" | "head-switch";
  connected: boolean;
  batteryLevel?: number;
  sensitivity: number;
}

export interface SwitchAction {
  id: string;
  name: string;
  description: string;
  key: string;
  category: "navigation" | "selection" | "medical" | "emergency";
  healthcare_context: boolean;
}

export interface NavigationPattern {
  id: string;
  name: string;
  description: string;
  pattern: "sequential" | "grid" | "tree" | "custom";
  direction: "horizontal" | "vertical" | "both";
  wrap_around: boolean;
  auto_repeat: boolean;
  dwell_time: number; // milliseconds
}

export interface SwitchNavigationSettings {
  enabled: boolean;
  primary_device: string | null;
  navigation_pattern: string;
  activation_delay: number; // milliseconds
  repeat_rate: number; // ms between repeats
  audio_feedback: boolean;
  visual_feedback: boolean;
  emergency_mode: boolean;
  healthcare_mode: boolean;
  dwell_activation: boolean;
  sensitivity: number; // 1-10 scale
}

export interface SwitchNavigationContextType {
  // Device Management
  devices: SwitchDevice[];
  settings: SwitchNavigationSettings;
  updateSettings: (settings: Partial<SwitchNavigationSettings>) => void;

  // Navigation State
  current_element: string | null;
  navigation_active: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;

  // Actions
  registerElement: (id: string, element: HTMLElement, metadata?: unknown) => void;
  unregisterElement: (id: string) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  activateCurrent: () => void;
}

// ================================================================================
// CONSTANTS & CONFIGURATIONS
// ================================================================================

const HEALTHCARE_ACTIONS: SwitchAction[] = [
  {
    id: "patient_next",
    name: "Próximo Paciente",
    description: "Navegar para próximo paciente na lista",
    key: "ArrowRight",
    category: "navigation",
    healthcare_context: true,
  },
  {
    id: "patient_select",
    name: "Selecionar Paciente",
    description: "Abrir prontuário do paciente selecionado",
    key: "Enter",
    category: "selection",
    healthcare_context: true,
  },
  {
    id: "emergency_alert",
    name: "Alerta Emergência",
    description: "Acionar alerta de emergência médica",
    key: "Escape",
    category: "emergency",
    healthcare_context: true,
  },
  {
    id: "procedure_complete",
    name: "Procedimento Concluído",
    description: "Marcar procedimento como concluído",
    key: "Space",
    category: "medical",
    healthcare_context: true,
  },
  {
    id: "voice_activation",
    name: "Ativar Controle por Voz",
    description: "Iniciar reconhecimento de voz médico",
    key: "v",
    category: "medical",
    healthcare_context: true,
  },
];

const NAVIGATION_PATTERNS: NavigationPattern[] = [
  {
    id: "sequential",
    name: "Sequencial",
    description: "Navegação linear pelos elementos",
    pattern: "sequential",
    direction: "horizontal",
    wrap_around: true,
    auto_repeat: false,
    dwell_time: 1500,
  },
  {
    id: "grid_2d",
    name: "Grade 2D",
    description: "Navegação em grade bidimensional",
    pattern: "grid",
    direction: "both",
    wrap_around: true,
    auto_repeat: false,
    dwell_time: 2000,
  },
  {
    id: "tree_medical",
    name: "Árvore Médica",
    description: "Navegação hierárquica por categorias médicas",
    pattern: "tree",
    direction: "vertical",
    wrap_around: false,
    auto_repeat: false,
    dwell_time: 2500,
  },
];

const DEFAULT_SETTINGS: SwitchNavigationSettings = {
  enabled: false,
  primary_device: null,
  navigation_pattern: "sequential",
  activation_delay: 500,
  repeat_rate: 300,
  audio_feedback: true,
  visual_feedback: true,
  emergency_mode: false,
  healthcare_mode: true,
  dwell_activation: true,
  sensitivity: 5,
};

// ================================================================================
// CONTEXT & PROVIDER
// ================================================================================

const SwitchNavigationContext = createContext<SwitchNavigationContextType | null>(null);

export function SwitchNavigationProvider({ children }: { children: React.ReactNode; }) {
  // State Management
  const [devices, setDevices] = useState<SwitchDevice[]>([]);
  const [settings, setSettings] = useState<SwitchNavigationSettings>(DEFAULT_SETTINGS);
  const [currentElement, setCurrentElement] = useState<string | null>(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [elements, setElements] = useState<
    Map<string, { element: HTMLElement; metadata?: unknown; }>
  >(new Map());

  // Refs for intervals and timeouts
  const navigationInterval = useRef<NodeJS.Timeout | null>(null);
  const dwellTimeout = useRef<NodeJS.Timeout | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // ================================================================================
  // DEVICE DETECTION & MANAGEMENT
  // ================================================================================

  useEffect(() => {
    // Simulated device detection - in real implementation, would use HID API or similar
    const detectedDevices: SwitchDevice[] = [
      {
        id: "switch_single_1",
        name: "Switch Simples USB",
        type: "single",
        connected: true,
        batteryLevel: 85,
        sensitivity: 5,
      },
      {
        id: "switch_dual_1",
        name: "Switch Duplo Adaptado",
        type: "dual",
        connected: false,
        sensitivity: 7,
      },
      {
        id: "head_switch_1",
        name: "Switch de Cabeça Hospitalar",
        type: "head-switch",
        connected: true,
        batteryLevel: 92,
        sensitivity: 8,
      },
    ];

    setDevices(detectedDevices);
  }, []);

  // ================================================================================
  // AUDIO FEEDBACK SYSTEM
  // ================================================================================

  const initAudioContext = useCallback(() => {
    if (!audioContext.current && window.AudioContext) {
      audioContext.current = new AudioContext();
    }
  }, []);

  const playFeedbackSound = useCallback((frequency: number, duration: number = 100) => {
    if (!settings.audio_feedback || !audioContext.current) {return;}

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.current.currentTime + duration / 1000,
    );

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration / 1000);
  }, [settings.audio_feedback]);

  // ================================================================================
  // ELEMENT REGISTRATION & MANAGEMENT
  // ================================================================================

  const registerElement = useCallback((id: string, element: HTMLElement, metadata?: unknown) => {
    setElements(prev => new Map(prev.set(id, { element, metadata })));

    // Enhanced ARIA attributes for switch navigation
    element.setAttribute("data-switch-navigable", "true");
    element.setAttribute("data-switch-id", id);
    element.setAttribute("role", element.getAttribute("role") || "button");
    element.setAttribute("tabindex", element.getAttribute("tabindex") || "0");

    // Healthcare-specific attributes
    if (settings.healthcare_mode && metadata?.healthcare_context) {
      element.setAttribute("data-healthcare-priority", metadata.priority || "normal");
      element.setAttribute("aria-describedby", `${id}_healthcare_description`);
    }
  }, [settings.healthcare_mode]);

  const unregisterElement = useCallback((id: string) => {
    const elementData = elements.get(id);
    if (elementData) {
      const { element } = elementData;
      element.removeAttribute("data-switch-navigable");
      element.removeAttribute("data-switch-id");
    }

    setElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, [elements]);

  // ================================================================================
  // NAVIGATION LOGIC
  // ================================================================================

  const getNavigableElements = useCallback(() => {
    return Array.from(elements.keys()).sort((a, b) => {
      const aElement = elements.get(a)?.element;
      const bElement = elements.get(b)?.element;

      if (!aElement || !bElement) {return 0;}

      // Healthcare priority sorting
      if (settings.healthcare_mode) {
        const aPriority = aElement.getAttribute("data-healthcare-priority") || "normal";
        const bPriority = bElement.getAttribute("data-healthcare-priority") || "normal";

        const priorityOrder = { "emergency": 0, "high": 1, "normal": 2, "low": 3 };
        const aPriorityNum = priorityOrder[aPriority as keyof typeof priorityOrder] || 2;
        const bPriorityNum = priorityOrder[bPriority as keyof typeof priorityOrder] || 2;

        if (aPriorityNum !== bPriorityNum) {
          return aPriorityNum - bPriorityNum;
        }
      }

      // DOM order fallback
      return aElement.compareDocumentPosition(bElement) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }, [elements, settings.healthcare_mode]);

  const navigateNext = useCallback(() => {
    const navigableIds = getNavigableElements();
    if (navigableIds.length === 0) {return;}

    const currentIndex = currentElement ? navigableIds.indexOf(currentElement) : -1;
    const nextIndex = (currentIndex + 1) % navigableIds.length;

    setCurrentElement(navigableIds[nextIndex]);
    playFeedbackSound(800, 80);

    // Visual feedback
    if (settings.visual_feedback) {
      const element = elements.get(navigableIds[nextIndex])?.element;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentElement, elements, getNavigableElements, playFeedbackSound, settings.visual_feedback]);

  const navigatePrevious = useCallback(() => {
    const navigableIds = getNavigableElements();
    if (navigableIds.length === 0) {return;}

    const currentIndex = currentElement ? navigableIds.indexOf(currentElement) : 0;
    const prevIndex = currentIndex === 0 ? navigableIds.length - 1 : currentIndex - 1;

    setCurrentElement(navigableIds[prevIndex]);
    playFeedbackSound(600, 80);

    // Visual feedback
    if (settings.visual_feedback) {
      const element = elements.get(navigableIds[prevIndex])?.element;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentElement, elements, getNavigableElements, playFeedbackSound, settings.visual_feedback]);

  const activateCurrent = useCallback(() => {
    if (!currentElement) {return;}

    const elementData = elements.get(currentElement);
    if (!elementData) {return;}

    const { element } = elementData;

    // Play activation sound
    playFeedbackSound(1000, 150);

    // Trigger click event
    element.click();

    // Healthcare-specific activation handling
    if (settings.healthcare_mode) {
      const healthcarePriority = element.getAttribute("data-healthcare-priority");

      if (healthcarePriority === "emergency") {
        // Emergency activation - additional feedback
        playFeedbackSound(1200, 300);

        // Vibration feedback if available
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    }
  }, [currentElement, elements, playFeedbackSound, settings.healthcare_mode]);

  // ================================================================================
  // NAVIGATION CONTROL
  // ================================================================================

  const startNavigation = useCallback(() => {
    if (navigationActive) {return;}

    setNavigationActive(true);
    initAudioContext();

    // Start with first element if none selected
    if (!currentElement) {
      const navigableIds = getNavigableElements();
      if (navigableIds.length > 0) {
        setCurrentElement(navigableIds[0]);
      }
    }

    playFeedbackSound(440, 200); // Start sound
  }, [navigationActive, currentElement, getNavigableElements, initAudioContext, playFeedbackSound]);

  const stopNavigation = useCallback(() => {
    if (!navigationActive) {return;}

    setNavigationActive(false);
    setCurrentElement(null);

    if (navigationInterval.current) {
      clearInterval(navigationInterval.current);
      navigationInterval.current = null;
    }

    if (dwellTimeout.current) {
      clearTimeout(dwellTimeout.current);
      dwellTimeout.current = null;
    }

    playFeedbackSound(220, 300); // Stop sound
  }, [navigationActive, playFeedbackSound]);

  // ================================================================================
  // KEYBOARD & SWITCH INPUT HANDLING
  // ================================================================================

  useEffect(() => {
    if (!settings.enabled || !navigationActive) {return;}

    const handleKeyDown = (event: KeyboardEvent) => {
      // Switch navigation keys
      switch (event.key) {
        case "ArrowRight":
        case "Tab":
          event.preventDefault();
          navigateNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          navigatePrevious();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          activateCurrent();
          break;
        case "Escape":
          if (settings.healthcare_mode && settings.emergency_mode) {
            // Emergency stop
            stopNavigation();
            playFeedbackSound(100, 500); // Emergency sound
          }
          break;
      }
    };

    // Switch device simulation - would integrate with actual device API
    const handleSwitchInput = (switchType: string, action: string) => {
      switch (action) {
        case "single_press":
          navigateNext();
          break;
        case "double_press":
          activateCurrent();
          break;
        case "long_press":
          if (settings.emergency_mode) {
            stopNavigation();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Custom event listeners for switch devices
    document.addEventListener(
      "switch-input",
      ((event: CustomEvent) => {
        handleSwitchInput(event.detail.switchType, event.detail.action);
      }) as EventListener,
    );

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener(
        "switch-input",
        ((event: CustomEvent) => {
          handleSwitchInput(event.detail.switchType, event.detail.action);
        }) as EventListener,
      );
    };
  }, [
    settings.enabled,
    navigationActive,
    navigateNext,
    navigatePrevious,
    activateCurrent,
    stopNavigation,
    settings.healthcare_mode,
    settings.emergency_mode,
    playFeedbackSound,
  ]);

  // ================================================================================
  // SETTINGS UPDATE
  // ================================================================================

  const updateSettings = useCallback((newSettings: Partial<SwitchNavigationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ================================================================================
  // CONTEXT VALUE
  // ================================================================================

  const contextValue: SwitchNavigationContextType = {
    devices,
    settings,
    updateSettings,
    current_element: currentElement,
    navigation_active: navigationActive,
    startNavigation,
    stopNavigation,
    registerElement,
    unregisterElement,
    navigateNext,
    navigatePrevious,
    activateCurrent,
  };

  return (
    <SwitchNavigationContext.Provider value={contextValue}>
      {children}
    </SwitchNavigationContext.Provider>
  );
}

// ================================================================================
// CUSTOM HOOKS
// ================================================================================

export function useSwitchNavigation() {
  const context = useContext(SwitchNavigationContext);
  if (!context) {
    throw new Error("useSwitchNavigation must be used within SwitchNavigationProvider");
  }
  return context;
}

export function useSwitchElement(id: string, metadata?: unknown) {
  const { registerElement, unregisterElement } = useSwitchNavigation();
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerElement(id, elementRef.current, metadata);
    }

    return () => {
      unregisterElement(id);
    };
  }, [id, metadata, registerElement, unregisterElement]);

  return elementRef;
}

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export interface SwitchNavigationControllerProps {
  className?: string;
  onSettingsChange?: (settings: SwitchNavigationSettings) => void;
  healthcareMode?: boolean;
  emergencyMode?: boolean;
  initialSettings?: Partial<SwitchNavigationSettings>;
}

export function SwitchNavigationController({
  className,
  onSettingsChange,
  healthcareMode = true,
  emergencyMode = false,
  initialSettings,
}: SwitchNavigationControllerProps) {
  const {
    devices,
    settings,
    updateSettings,
    navigation_active,
    startNavigation,
    stopNavigation,
    current_element,
  } = useSwitchNavigation();

  // Initialize settings
  useEffect(() => {
    if (initialSettings) {
      updateSettings({
        ...initialSettings,
        healthcare_mode: healthcareMode,
        emergency_mode: emergencyMode,
      });
    }
  }, [initialSettings, healthcareMode, emergencyMode, updateSettings]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const connectedDevices = devices.filter(device => device.connected);
  const primaryDevice = devices.find(device => device.id === settings.primary_device);

  return (
    <Card className={`w-full max-w-4xl ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Controle por Switch</h3>
              <p className="text-sm text-muted-foreground">
                Navegação por dispositivos switch externos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={settings.enabled ? "default" : "secondary"}>
              {settings.enabled ? "Ativo" : "Inativo"}
            </Badge>

            {settings.healthcare_mode && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Modo Médico
              </Badge>
            )}

            {settings.emergency_mode && (
              <Badge variant="destructive">
                Emergência
              </Badge>
            )}
          </div>
        </div>

        {/* Device Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Dispositivos Conectados
            </h4>

            {connectedDevices.length === 0
              ? (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Nenhum switch conectado</span>
                </div>
              )
              : (
                <div className="space-y-2">
                  {connectedDevices.map(device => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium">{device.name}</span>
                      </div>

                      {device.batteryLevel && (
                        <span className="text-xs text-muted-foreground">
                          {device.batteryLevel}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Status de Navegação</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado</span>
                <Badge variant={navigation_active ? "default" : "secondary"}>
                  {navigation_active ? "Navegando" : "Parado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Elemento Atual</span>
                <span className="text-xs font-mono">
                  {current_element || "Nenhum"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Controles</h4>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={navigation_active ? stopNavigation : startNavigation}
                disabled={!settings.enabled || connectedDevices.length === 0}
                className="flex-1"
              >
                {navigation_active
                  ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Parar
                    </>
                  )
                  : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </>
                  )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  stopNavigation();
                  // Reset to defaults
                  updateSettings(DEFAULT_SETTINGS);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <h4 className="font-medium">Configurações Básicas</h4>

            <div className="flex items-center justify-between">
              <span className="text-sm">Habilitar Controle Switch</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => updateSettings({ enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Feedback Sonoro</span>
              <Switch
                checked={settings.audio_feedback}
                onCheckedChange={(checked) => updateSettings({ audio_feedback: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Feedback Visual</span>
              <Switch
                checked={settings.visual_feedback}
                onCheckedChange={(checked) => updateSettings({ visual_feedback: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Ativação por Permanência</span>
              <Switch
                checked={settings.dwell_activation}
                onCheckedChange={(checked) => updateSettings({ dwell_activation: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Configurações Avançadas</h4>

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
            </div>

            <div className="space-y-2">
              <span className="text-sm">Delay de Ativação: {settings.activation_delay}ms</span>
              <Slider
                value={[settings.activation_delay]}
                onValueChange={([value]) => updateSettings({ activation_delay: value })}
                min={100}
                max={2000}
                step={100}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm">Taxa de Repetição: {settings.repeat_rate}ms</span>
              <Slider
                value={[settings.repeat_rate]}
                onValueChange={([value]) => updateSettings({ repeat_rate: value })}
                min={100}
                max={1000}
                step={50}
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
                <span className="text-sm">Modo Emergência</span>
                <Switch
                  checked={settings.emergency_mode}
                  onCheckedChange={(checked) => updateSettings({ emergency_mode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Prioridade Médica</span>
                <Switch
                  checked={settings.healthcare_mode}
                  onCheckedChange={(checked) => updateSettings({ healthcare_mode: checked })}
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Modo Médico Ativo:</strong>{" "}
                Elementos serão priorizados por importância clínica. Tecla ESC aciona parada de
                emergência quando habilitada.
              </p>
            </div>
          </div>
        )}

        {/* Device Information */}
        {primaryDevice && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Dispositivo Primário</h4>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">{primaryDevice.name}</span>
                <Badge>{primaryDevice.type}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Sensibilidade: {primaryDevice.sensitivity}/10
                {primaryDevice.batteryLevel && ` • Bateria: ${primaryDevice.batteryLevel}%`}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SwitchNavigationController;
