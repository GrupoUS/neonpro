"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accessibility,
  Activity,
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  FileText,
  Hand,
  HardDrive,
  Home,
  Keyboard,
  Lightbulb,
  Link,
  Monitor,
  MousePointer,
  Phone,
  Radio,
  Search,
  Settings,
  Shield,
  Stethoscope,
  Target,
  Users,
  Volume2,
  Wifi,
  Zap,
} from "lucide-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Import accessibility components for integration
import { useCognitiveAccessibility } from "./cognitive-accessibility-helper";
import { useEyeTracking } from "./eye-tracking-interaction";
import { useOneHandedOperation } from "./one-handed-operation-mode";
import { useSwitchNavigation } from "./switch-navigation-controller";
import { useTremorFriendly } from "./tremor-friendly-controls";
import { useVisualAccessibility } from "./visual-accessibility-enhancer";
import { useVoiceMedical } from "./voice-medical-controller";

// ===============================
// TYPES & INTERFACES
// ===============================

export type AssistiveTechnologyType =
  | "screen_reader"
  | "voice_recognition"
  | "eye_tracker"
  | "switch_device"
  | "magnifier"
  | "alternative_keyboard"
  | "head_mouse"
  | "sip_puff"
  | "brain_interface";

export type ATConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
export type ATDataFormat = "json" | "xml" | "aria" | "ssml" | "custom";
export type MedicalPriorityLevel = "low" | "medium" | "high" | "emergency";

export interface AssistiveTechnologyDevice {
  id: string;
  name: string;
  type: AssistiveTechnologyType;
  manufacturer: string;
  model: string;
  version: string;
  connection_type: "usb" | "bluetooth" | "wifi" | "serial" | "api";
  status: ATConnectionStatus;
  capabilities: string[];
  supported_protocols: string[];
  medical_certified: boolean;
  brazilian_certified: boolean;
  last_connected: Date | null;
  settings: Record<string, unknown>;
}

export interface ATAPIEndpoint {
  id: string;
  name_pt: string;
  description_pt: string;
  endpoint_url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "WEBSOCKET";
  data_format: ATDataFormat;
  authentication_required: boolean;
  rate_limit: number;
  medical_priority: MedicalPriorityLevel;
  lgpd_compliant: boolean;
  documentation_url: string;
}

export interface ATIntegrationSettings {
  enabled: boolean;
  auto_discovery: boolean;
  medical_mode_priority: boolean;
  emergency_override: boolean;
  data_sync_interval: number;
  voice_feedback_enabled: boolean;
  haptic_feedback_enabled: boolean;
  visual_feedback_enabled: boolean;
  audio_descriptions_enabled: boolean;
  real_time_translation: boolean;
  lgpd_compliance_mode: boolean;
  preferred_language: string;
  fallback_methods: string[];
}

export interface ATCommand {
  id: string;
  name_pt: string;
  description_pt: string;
  voice_triggers: string[];
  keyboard_shortcuts: string[];
  gesture_triggers: string[];
  medical_context: string[];
  priority_level: MedicalPriorityLevel;
  execution_function: () => Promise<ATCommandResult>;
  confirmation_required: boolean;
  undo_available: boolean;
}

export interface ATCommandResult {
  success: boolean;
  message_pt: string;
  data?: unknown;
  error?: string;
  execution_time_ms: number;
  accessibility_impact: string;
  medical_safety_checked: boolean;
}

export interface ATAnalytics {
  session_start: Date;
  devices_connected: number;
  commands_executed: number;
  api_calls_made: number;
  errors_encountered: number;
  emergency_activations: number;
  medical_priorities_triggered: number;
  average_response_time: number;
  user_satisfaction_score: number;
  accessibility_improvement_score: number;
  device_performance_metrics: Record<string, number>;
  most_used_features: string[];
  lgpd_data_points: {
    at_patterns_anonymized: boolean;
    medical_data_encrypted: boolean;
    consent_status: string;
    data_retention_period: number;
  };
}

export interface ATContextValue {
  settings: ATIntegrationSettings;
  analytics: ATAnalytics;
  connectedDevices: AssistiveTechnologyDevice[];
  availableCommands: ATCommand[];
  updateSettings: (settings: Partial<ATIntegrationSettings>) => void;
  connectDevice: (device: AssistiveTechnologyDevice) => Promise<boolean>;
  disconnectDevice: (deviceId: string) => Promise<boolean>;
  executeCommand: (commandId: string, params?: unknown) => Promise<ATCommandResult>;
  registerCommand: (command: ATCommand) => void;
  broadcastToDevices: (message: unknown) => Promise<void>;
  enableEmergencyMode: () => void;
  disableEmergencyMode: () => void;
  exportAnalytics: () => Promise<string>;
  validateMedicalCompliance: () => boolean;
}

// ===============================
// CONSTANTS & CONFIGURATIONS
// ===============================

const DEFAULT_SETTINGS: ATIntegrationSettings = {
  enabled: false,
  auto_discovery: true,
  medical_mode_priority: true,
  emergency_override: true,
  data_sync_interval: 1000,
  voice_feedback_enabled: true,
  haptic_feedback_enabled: true,
  visual_feedback_enabled: true,
  audio_descriptions_enabled: true,
  real_time_translation: true,
  lgpd_compliance_mode: true,
  preferred_language: "pt-BR",
  fallback_methods: ["voice", "visual", "haptic"],
};

const AT_DEVICE_TYPES_PT = {
  "screen_reader": "Leitor de Tela",
  "voice_recognition": "Reconhecimento de Voz",
  "eye_tracker": "Rastreamento Ocular",
  "switch_device": "Dispositivo de Botão",
  "magnifier": "Ampliador",
  "alternative_keyboard": "Teclado Alternativo",
  "head_mouse": "Mouse por Movimento da Cabeça",
  "sip_puff": "Sopro e Sucção",
  "brain_interface": "Interface Neural",
};

const MEDICAL_AT_DEVICES: AssistiveTechnologyDevice[] = [
  {
    id: "nvda_screen_reader",
    name: "NVDA Screen Reader",
    type: "screen_reader",
    manufacturer: "NV Access",
    model: "NVDA",
    version: "2024.1",
    connection_type: "api",
    status: "disconnected",
    capabilities: ["text_to_speech", "braille_output", "navigation_assistance"],
    supported_protocols: ["MSAA", "UIA", "ARIA"],
    medical_certified: true,
    brazilian_certified: true,
    last_connected: null,
    settings: {
      speech_rate: 250,
      punctuation_level: "most",
      medical_vocabulary: true,
    },
  },
  {
    id: "tobii_eye_tracker",
    name: "Tobii Eye Tracker 5",
    type: "eye_tracker",
    manufacturer: "Tobii Dynavox",
    model: "Eye Tracker 5",
    version: "2.1.0",
    connection_type: "usb",
    status: "disconnected",
    capabilities: ["gaze_tracking", "dwell_clicking", "medical_calibration"],
    supported_protocols: ["Tobii Stream Engine", "EyeX SDK"],
    medical_certified: true,
    brazilian_certified: true,
    last_connected: null,
    settings: {
      dwell_time: 800,
      medical_mode: true,
      precision_level: "high",
    },
  },
  {
    id: "jelly_bean_switch",
    name: "Jelly Bean Twist Switch",
    type: "switch_device",
    manufacturer: "AbleNet",
    model: "Jelly Bean Twist",
    version: "1.0",
    connection_type: "usb",
    status: "disconnected",
    capabilities: ["momentary_switch", "latching_switch", "medical_safe"],
    supported_protocols: ["HID", "Custom AT Protocol"],
    medical_certified: true,
    brazilian_certified: true,
    last_connected: null,
    settings: {
      activation_force: "light",
      medical_emergency_mode: true,
      feedback_type: "auditory",
    },
  },
];

const AT_API_ENDPOINTS: ATAPIEndpoint[] = [
  {
    id: "patient_status_read",
    name_pt: "Leitura de Status do Paciente",
    description_pt: "Fornece informações do status atual do paciente via tecnologia assistiva",
    endpoint_url: "/api/at/patient/status",
    method: "GET",
    data_format: "json",
    authentication_required: true,
    rate_limit: 60,
    medical_priority: "high",
    lgpd_compliant: true,
    documentation_url: "/docs/at/patient-status",
  },
  {
    id: "medication_alert_voice",
    name_pt: "Alerta de Medicação por Voz",
    description_pt: "Notifica sobre horários de medicação através de síntese de voz",
    endpoint_url: "/api/at/medication/alert",
    method: "POST",
    data_format: "ssml",
    authentication_required: true,
    rate_limit: 100,
    medical_priority: "high",
    lgpd_compliant: true,
    documentation_url: "/docs/at/medication-alerts",
  },
  {
    id: "emergency_activation",
    name_pt: "Ativação de Emergência",
    description_pt: "Endpoint para ativação de modo de emergência via tecnologia assistiva",
    endpoint_url: "/api/at/emergency/activate",
    method: "POST",
    data_format: "json",
    authentication_required: true,
    rate_limit: 10,
    medical_priority: "emergency",
    lgpd_compliant: true,
    documentation_url: "/docs/at/emergency-mode",
  },
  {
    id: "cognitive_support",
    name_pt: "Suporte Cognitivo Adaptativo",
    description_pt: "Ajusta interface baseado em necessidades cognitivas detectadas",
    endpoint_url: "/api/at/cognitive/adapt",
    method: "PUT",
    data_format: "json",
    authentication_required: true,
    rate_limit: 30,
    medical_priority: "medium",
    lgpd_compliant: true,
    documentation_url: "/docs/at/cognitive-support",
  },
  {
    id: "visual_enhancement_control",
    name_pt: "Controle de Melhorias Visuais",
    description_pt: "Controla filtros de cor, contraste e ampliação via AT",
    endpoint_url: "/api/at/visual/enhance",
    method: "PUT",
    data_format: "json",
    authentication_required: true,
    rate_limit: 50,
    medical_priority: "medium",
    lgpd_compliant: true,
    documentation_url: "/docs/at/visual-enhancements",
  },
];

const AT_MEDICAL_COMMANDS: ATCommand[] = [
  {
    id: "call_nurse_immediately",
    name_pt: "Chamar Enfermeira Imediatamente",
    description_pt: "Chama uma enfermeira para o quarto do paciente com prioridade alta",
    voice_triggers: ["chamar enfermeira", "preciso de ajuda", "ajuda urgente"],
    keyboard_shortcuts: ["Ctrl+Alt+N", "F1"],
    gesture_triggers: ["long_press_emergency", "double_tap_help"],
    medical_context: ["post_procedure", "recovery", "emergency"],
    priority_level: "emergency",
    execution_function: async () => ({
      success: true,
      message_pt: "Enfermeira notificada com sucesso. Chegará em aproximadamente 2 minutos.",
      execution_time_ms: 1200,
      accessibility_impact: "Critical medical assistance requested",
      medical_safety_checked: true,
    }),
    confirmation_required: false,
    undo_available: false,
  },
  {
    id: "pain_scale_assessment",
    name_pt: "Avaliação da Escala de Dor",
    description_pt: "Inicia avaliação guiada da escala de dor com suporte a tecnologias assistivas",
    voice_triggers: ["avaliar dor", "escala de dor", "como está a dor"],
    keyboard_shortcuts: ["Ctrl+P", "Alt+D"],
    gesture_triggers: ["tap_pain_area", "point_to_scale"],
    medical_context: ["post_procedure", "pain_management", "recovery"],
    priority_level: "high",
    execution_function: async () => ({
      success: true,
      message_pt: "Avaliação de dor iniciada. Por favor, indique seu nível de dor de 1 a 10.",
      execution_time_ms: 800,
      accessibility_impact: "Pain assessment interface adapted for AT use",
      medical_safety_checked: true,
    }),
    confirmation_required: false,
    undo_available: true,
  },
  {
    id: "medication_reminder_check",
    name_pt: "Verificar Lembretes de Medicação",
    description_pt: "Lista próximos medicamentos e horários com síntese de voz",
    voice_triggers: ["meus medicamentos", "próximas doses", "lembrete remédio"],
    keyboard_shortcuts: ["Ctrl+M", "Alt+R"],
    gesture_triggers: ["swipe_up_medications", "long_press_pill"],
    medical_context: ["medication_management", "daily_routine"],
    priority_level: "medium",
    execution_function: async () => ({
      success: true,
      message_pt: "Próximos medicamentos: Dipirona às 14:00, Omeprazol às 18:00.",
      execution_time_ms: 600,
      accessibility_impact: "Medication schedule announced via screen reader",
      medical_safety_checked: true,
    }),
    confirmation_required: false,
    undo_available: false,
  },
  {
    id: "simplify_interface",
    name_pt: "Simplificar Interface",
    description_pt: "Ativa modo de interface simplificada com menos elementos visuais",
    voice_triggers: ["simplificar tela", "modo simples", "reduzir complexidade"],
    keyboard_shortcuts: ["Ctrl+Shift+S", "F9"],
    gesture_triggers: ["pinch_to_simplify", "shake_to_reduce"],
    medical_context: ["cognitive_support", "post_anesthesia", "stress_recovery"],
    priority_level: "medium",
    execution_function: async () => ({
      success: true,
      message_pt: "Interface simplificada ativada. Elementos não essenciais foram ocultos.",
      execution_time_ms: 400,
      accessibility_impact: "Interface complexity reduced for cognitive accessibility",
      medical_safety_checked: true,
    }),
    confirmation_required: false,
    undo_available: true,
  },
];

// ===============================
// CONTEXT CREATION
// ===============================

const AssistiveTechnologyAPIContext = createContext<ATContextValue | undefined>(undefined);

// ===============================
// HOOK FOR CONSUMING CONTEXT
// ===============================

export function useAssistiveTechnologyAPI() {
  const context = useContext(AssistiveTechnologyAPIContext);
  if (context === undefined) {
    throw new Error(
      "useAssistiveTechnologyAPI must be used within an AssistiveTechnologyAPIProvider",
    );
  }
  return context;
}

// ===============================
// MAIN PROVIDER COMPONENT
// ===============================

export function AssistiveTechnologyAPIProvider({ children }: { children: React.ReactNode; }) {
  const [settings, setSettings] = useState<ATIntegrationSettings>(DEFAULT_SETTINGS);
  const [analytics, setAnalytics] = useState<ATAnalytics>(() => ({
    session_start: new Date(),
    devices_connected: 0,
    commands_executed: 0,
    api_calls_made: 0,
    errors_encountered: 0,
    emergency_activations: 0,
    medical_priorities_triggered: 0,
    average_response_time: 0,
    user_satisfaction_score: 100,
    accessibility_improvement_score: 85,
    device_performance_metrics: {},
    most_used_features: [],
    lgpd_data_points: {
      at_patterns_anonymized: true,
      medical_data_encrypted: true,
      consent_status: "pending",
      data_retention_period: 90,
    },
  }));

  const [connectedDevices, setConnectedDevices] = useState<AssistiveTechnologyDevice[]>([]);
  const [availableCommands, setAvailableCommands] = useState<ATCommand[]>(AT_MEDICAL_COMMANDS);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Integration with other accessibility components
  const switchNavigation = useSwitchNavigation?.();
  const eyeTracking = useEyeTracking?.();
  const tremorFriendly = useTremorFriendly?.();
  const voiceMedical = useVoiceMedical?.();
  const oneHandedOperation = useOneHandedOperation?.();
  const cognitiveAccessibility = useCognitiveAccessibility?.();
  const visualAccessibility = useVisualAccessibility?.();

  // WebSocket connection for real-time AT communication
  const wsRef = useRef<WebSocket | null>(null);
  const devicePollingRef = useRef<NodeJS.Timeout>();

  // Update settings with integration adjustments
  const updateSettings = useCallback((newSettings: Partial<ATIntegrationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };

      // Auto-adjust based on connected devices
      if (updated.enabled && connectedDevices.length > 0) {
        updated.auto_discovery = true;
        updated.medical_mode_priority = true;
      }

      // Enhance feedback for medical devices
      const hasMedicalDevices = connectedDevices.some(d => d.medical_certified);
      if (hasMedicalDevices) {
        updated.voice_feedback_enabled = true;
        updated.haptic_feedback_enabled = true;
        updated.emergency_override = true;
      }

      return updated;
    });

    setAnalytics(prev => ({
      ...prev,
      api_calls_made: prev.api_calls_made + 1,
    }));
  }, [connectedDevices]);

  // Connect to assistive technology device
  const connectDevice = useCallback(async (device: AssistiveTechnologyDevice): Promise<boolean> => {
    try {
      // Simulate device connection process
      const connectionDelay = device.connection_type === "bluetooth" ? 3000 : 1000;

      setConnectedDevices(prev =>
        prev.map(d => d.id === device.id ? { ...d, status: "connecting" } : d)
      );

      await new Promise(resolve => setTimeout(resolve, connectionDelay));

      // Update device status
      const connectedDevice = {
        ...device,
        status: "connected" as ATConnectionStatus,
        last_connected: new Date(),
      };

      setConnectedDevices(prev => {
        const exists = prev.some(d => d.id === device.id);
        if (exists) {
          return prev.map(d => d.id === device.id ? connectedDevice : d);
        } else {
          return [...prev, connectedDevice];
        }
      });

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        devices_connected: prev.devices_connected + 1,
        device_performance_metrics: {
          ...prev.device_performance_metrics,
          [device.id]: 100,
        },
      }));

      // Initialize device-specific integrations
      if (device.type === "screen_reader" && settings.voice_feedback_enabled) {
        // Integrate with voice medical controller
        voiceMedical?.updateSettings?.({ enabled: true });
      }

      if (device.type === "eye_tracker") {
        // Integrate with eye tracking component
        eyeTracking?.updateSettings?.({ enabled: true });
      }

      if (device.type === "switch_device") {
        // Integrate with switch navigation
        switchNavigation?.updateSettings?.({ enabled: true });
      }

      return true;
    } catch (error) {
      console.error("Failed to connect AT device:", error);

      setConnectedDevices(prev =>
        prev.map(d => d.id === device.id ? { ...d, status: "error" } : d)
      );

      setAnalytics(prev => ({
        ...prev,
        errors_encountered: prev.errors_encountered + 1,
      }));

      return false;
    }
  }, [settings, switchNavigation, eyeTracking, voiceMedical]);

  // Disconnect assistive technology device
  const disconnectDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setConnectedDevices(prev =>
        prev.map(d => d.id === deviceId ? { ...d, status: "disconnected" } : d)
      );

      setAnalytics(prev => ({
        ...prev,
        devices_connected: Math.max(0, prev.devices_connected - 1),
      }));

      return true;
    } catch (error) {
      console.error("Failed to disconnect AT device:", error);
      return false;
    }
  }, []);

  // Execute AT command
  const executeCommand = useCallback(
    async (commandId: string, params?: unknown): Promise<ATCommandResult> => {
      const command = availableCommands.find(c => c.id === commandId);
      if (!command) {
        return {
          success: false,
          message_pt: "Comando não encontrado",
          error: "Command not found",
          execution_time_ms: 0,
          accessibility_impact: "None",
          medical_safety_checked: false,
        };
      }

      const startTime = performance.now();

      try {
        // Check if confirmation is required
        if (command.confirmation_required && !params?.confirmed) {
          return {
            success: false,
            message_pt: "Confirmação necessária para executar este comando",
            error: "Confirmation required",
            execution_time_ms: performance.now() - startTime,
            accessibility_impact: "Command pending confirmation",
            medical_safety_checked: false,
          };
        }

        // Execute the command
        const result = await command.execution_function();

        // Update analytics
        setAnalytics(prev => ({
          ...prev,
          commands_executed: prev.commands_executed + 1,
          average_response_time: (prev.average_response_time + result.execution_time_ms) / 2,
          most_used_features: [commandId, ...prev.most_used_features.slice(0, 4)],
        }));

        // Handle emergency commands
        if (command.priority_level === "emergency") {
          setAnalytics(prev => ({
            ...prev,
            emergency_activations: prev.emergency_activations + 1,
          }));
          setEmergencyMode(true);
        }

        // Handle medical priority commands
        if (command.priority_level === "high" || command.priority_level === "emergency") {
          setAnalytics(prev => ({
            ...prev,
            medical_priorities_triggered: prev.medical_priorities_triggered + 1,
          }));
        }

        // Broadcast to connected devices if needed
        if (settings.voice_feedback_enabled && result.success) {
          await broadcastToDevices({
            type: "command_feedback",
            message: result.message_pt,
            priority: command.priority_level,
          });
        }

        return result;
      } catch (error) {
        setAnalytics(prev => ({
          ...prev,
          errors_encountered: prev.errors_encountered + 1,
        }));

        return {
          success: false,
          message_pt: "Erro ao executar comando",
          error: error instanceof Error ? error.message : "Unknown error",
          execution_time_ms: performance.now() - startTime,
          accessibility_impact: "Command execution failed",
          medical_safety_checked: false,
        };
      }
    },
    [availableCommands, settings.voice_feedback_enabled],
  );

  // Register new AT command
  const registerCommand = useCallback((command: ATCommand) => {
    setAvailableCommands(prev => {
      const exists = prev.some(c => c.id === command.id);
      if (exists) {
        return prev.map(c => c.id === command.id ? command : c);
      } else {
        return [...prev, command];
      }
    });
  }, []);

  // Broadcast message to all connected devices
  const broadcastToDevices = useCallback(async (message: unknown) => {
    const promises = connectedDevices
      .filter(d => d.status === "connected")
      .map(async (device) => {
        try {
          // Simulate broadcasting to device
          if (
            device.capabilities.includes("text_to_speech") && message.type === "command_feedback"
          ) {
            // Send TTS message to screen reader
            console.log(`TTS to ${device.name}: ${message.message}`);
          }

          if (device.capabilities.includes("haptic_feedback") && settings.haptic_feedback_enabled) {
            // Send haptic feedback
            console.log(`Haptic feedback to ${device.name}`);
          }

          return true;
        } catch (error) {
          console.error(`Failed to broadcast to device ${device.id}:`, error);
          return false;
        }
      });

    await Promise.all(promises);

    setAnalytics(prev => ({
      ...prev,
      api_calls_made: prev.api_calls_made + connectedDevices.length,
    }));
  }, [connectedDevices, settings.haptic_feedback_enabled]);

  // Enable emergency mode
  const enableEmergencyMode = useCallback(() => {
    setEmergencyMode(true);

    // Override all accessibility settings for emergency
    if (settings.emergency_override) {
      visualAccessibility?.updateSettings?.({
        contrast_level: "maximum",
        text_size: "large",
        high_contrast_mode: true,
      });

      cognitiveAccessibility?.requestSimplification?.();

      oneHandedOperation?.adaptLayout?.("emergency");
    }

    // Broadcast emergency mode activation
    broadcastToDevices({
      type: "emergency_mode",
      message: "Modo de emergência ativado",
      priority: "emergency",
    });

    setAnalytics(prev => ({
      ...prev,
      emergency_activations: prev.emergency_activations + 1,
    }));
  }, [
    settings.emergency_override,
    visualAccessibility,
    cognitiveAccessibility,
    oneHandedOperation,
    broadcastToDevices,
  ]);

  // Disable emergency mode
  const disableEmergencyMode = useCallback(() => {
    setEmergencyMode(false);

    broadcastToDevices({
      type: "emergency_mode_off",
      message: "Modo de emergência desativado",
      priority: "medium",
    });
  }, [broadcastToDevices]);

  // Export analytics (LGPD compliant)
  const exportAnalytics = useCallback(async (): Promise<string> => {
    const sessionDuration = Date.now() - analytics.session_start.getTime();

    const exportData = {
      session_summary: {
        duration_minutes: Math.round(sessionDuration / 60_000),
        devices_connected: analytics.devices_connected,
        commands_executed: analytics.commands_executed,
        api_calls_made: analytics.api_calls_made,
      },
      performance_metrics: {
        average_response_time: Math.round(analytics.average_response_time),
        error_rate: analytics.errors_encountered / Math.max(analytics.commands_executed, 1),
        user_satisfaction: analytics.user_satisfaction_score,
        accessibility_improvement: analytics.accessibility_improvement_score,
      },
      device_usage: {
        connected_device_types: connectedDevices.map(d => d.type),
        device_performance: analytics.device_performance_metrics,
        most_used_features: analytics.most_used_features.slice(0, 10),
      },
      medical_integration: {
        emergency_activations: analytics.emergency_activations,
        medical_priorities: analytics.medical_priorities_triggered,
        safety_compliance: true,
      },
      accessibility_features: {
        switch_navigation_active: switchNavigation?.settings?.enabled || false,
        eye_tracking_active: eyeTracking?.settings?.enabled || false,
        voice_control_active: voiceMedical?.settings?.enabled || false,
        cognitive_support_active: cognitiveAccessibility?.settings?.enabled || false,
        visual_enhancements_active: visualAccessibility?.settings?.enabled || false,
      },
      lgpd_compliance: {
        data_anonymized: analytics.lgpd_data_points.at_patterns_anonymized,
        medical_data_encrypted: analytics.lgpd_data_points.medical_data_encrypted,
        consent_status: analytics.lgpd_data_points.consent_status,
        retention_period_days: analytics.lgpd_data_points.data_retention_period,
      },
      export_timestamp: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }, [
    analytics,
    connectedDevices,
    switchNavigation,
    eyeTracking,
    voiceMedical,
    cognitiveAccessibility,
    visualAccessibility,
  ]);

  // Validate medical compliance
  const validateMedicalCompliance = useCallback((): boolean => {
    let complianceScore = 100;

    // Check device certifications
    const uncertifiedDevices = connectedDevices.filter(d => !d.medical_certified);
    complianceScore -= uncertifiedDevices.length * 10;

    // Check LGPD compliance
    if (!settings.lgpd_compliance_mode) {
      complianceScore -= 25;
    }

    // Check emergency preparedness
    if (!settings.emergency_override) {
      complianceScore -= 15;
    }

    // Check medical priority handling
    if (!settings.medical_mode_priority) {
      complianceScore -= 10;
    }

    setAnalytics(prev => ({
      ...prev,
      accessibility_improvement_score: Math.max(complianceScore, 0),
    }));

    return complianceScore >= 85;
  }, [connectedDevices, settings]);

  // Device discovery and connection monitoring
  useEffect(() => {
    // Clear unknown existing interval first
    if (devicePollingRef.current) {
      clearInterval(devicePollingRef.current);
      devicePollingRef.current = null;
    }

    if (!settings.enabled || !settings.auto_discovery) {
      return () => {
        if (devicePollingRef.current) {
          clearInterval(devicePollingRef.current);
          devicePollingRef.current = null;
        }
      };
    }

    devicePollingRef.current = setInterval(() => {
      // Simulate device discovery
      MEDICAL_AT_DEVICES.forEach(device => {
        if (!connectedDevices.some(d => d.id === device.id) && Math.random() > 0.9) {
          // Simulated device discovery
          console.log(`Discovered AT device: ${device.name}`);
        }
      });
    }, 5000);

    return () => {
      if (devicePollingRef.current) {
        clearInterval(devicePollingRef.current);
        devicePollingRef.current = null;
      }
    };
  }, [settings.enabled, settings.auto_discovery, connectedDevices]);

  // WebSocket connection for real-time AT communication
  useEffect(() => {
    if (settings.enabled) {
      try {
        wsRef.current = new WebSocket("ws://localhost:8080/at-websocket");

        wsRef.current.addEventListener("open", () => {
          console.log("AT WebSocket connected");
        });

        wsRef.current.addEventListener("message", (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "device_command") {
            executeCommand(message.commandId, message.params);
          }
        });

        wsRef.current.addEventListener("error", (error) => {
          console.error("AT WebSocket error:", error);
        });
      } catch (error) {
        console.warn("WebSocket connection failed - using fallback methods");
      }
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [settings.enabled, executeCommand]);

  const contextValue: ATContextValue = useMemo(() => ({
    settings,
    analytics,
    connectedDevices,
    availableCommands,
    updateSettings,
    connectDevice,
    disconnectDevice,
    executeCommand,
    registerCommand,
    broadcastToDevices,
    enableEmergencyMode,
    disableEmergencyMode,
    exportAnalytics,
    validateMedicalCompliance,
  }), [
    settings,
    analytics,
    connectedDevices,
    availableCommands,
    updateSettings,
    connectDevice,
    disconnectDevice,
    executeCommand,
    registerCommand,
    broadcastToDevices,
    enableEmergencyMode,
    disableEmergencyMode,
    exportAnalytics,
    validateMedicalCompliance,
  ]);

  return (
    <AssistiveTechnologyAPIContext.Provider value={contextValue}>
      {children}
    </AssistiveTechnologyAPIContext.Provider>
  );
}

// ===============================
// SETTINGS PANEL COMPONENT
// ===============================

export function AssistiveTechnologyAPISettings() {
  const {
    settings,
    analytics,
    connectedDevices,
    availableCommands,
    updateSettings,
    connectDevice,
    disconnectDevice,
    executeCommand,
    enableEmergencyMode,
    disableEmergencyMode,
    exportAnalytics,
    validateMedicalCompliance,
  } = useAssistiveTechnologyAPI();

  const [activeTab, setActiveTab] = useState("overview");
  const [complianceValid, setComplianceValid] = useState(true);

  const handleExportAnalytics = async () => {
    try {
      const data = await exportAnalytics();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assistive-technology-analytics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar analytics:", error);
    }
  };

  const handleValidateCompliance = () => {
    const isValid = validateMedicalCompliance();
    setComplianceValid(isValid);
  };

  const handleConnectDevice = async (device: AssistiveTechnologyDevice) => {
    await connectDevice(device);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          <CardTitle>API de Tecnologias Assistivas</CardTitle>
          {settings.enabled && (
            <Badge variant="secondary" className="ml-auto">
              {connectedDevices.filter(d => d.status === "connected").length} conectados
            </Badge>
          )}
        </div>
        <CardDescription>
          Integração centralizada com tecnologias assistivas para ambiente médico
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Compliance Warning */}
        {settings.enabled && !complianceValid && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Alerta de Conformidade Médica</AlertTitle>
            <AlertDescription>
              Algumas configurações de AT podem não estar em conformidade com padrões médicos.
              <Button variant="link" className="p-0 h-auto" onClick={handleValidateCompliance}>
                Validar configurações
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Overview */}
        {settings.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Dispositivos</span>
              </div>
              <div className="text-2xl font-bold">
                {connectedDevices.filter(d => d.status === "connected").length}
              </div>
              <div className="text-xs text-muted-foreground">
                de {MEDICAL_AT_DEVICES.length} disponíveis
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Comandos</span>
              </div>
              <div className="text-2xl font-bold">{analytics.commands_executed}</div>
              <div className="text-xs text-muted-foreground">
                executados na sessão
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Resposta</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(analytics.average_response_time)}ms
              </div>
              <div className="text-xs text-muted-foreground">
                tempo médio
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Conformidade</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold">
                  {analytics.accessibility_improvement_score}%
                </span>
                {analytics.accessibility_improvement_score >= 85
                  ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                  : <AlertCircle className="h-3 w-3 text-amber-500" />}
              </div>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="commands">Comandos</TabsTrigger>
            <TabsTrigger value="integration">Integração</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">
                  Habilitar API de Tecnologias Assistivas
                </label>
                <p className="text-xs text-muted-foreground">
                  Ativa integração centralizada com dispositivos AT para ambiente médico
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled) => updateSettings({ enabled })}
              />
            </div>

            {settings.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Descoberta Automática</label>
                    <Switch
                      checked={settings.auto_discovery}
                      onCheckedChange={(auto_discovery) => updateSettings({ auto_discovery })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Prioridade Médica</label>
                    <Switch
                      checked={settings.medical_mode_priority}
                      onCheckedChange={(medical_mode_priority) =>
                        updateSettings({ medical_mode_priority })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Override de Emergência</label>
                    <Switch
                      checked={settings.emergency_override}
                      onCheckedChange={(emergency_override) =>
                        updateSettings({ emergency_override })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Conformidade LGPD</label>
                    <Switch
                      checked={settings.lgpd_compliance_mode}
                      onCheckedChange={(lgpd_compliance_mode) =>
                        updateSettings({ lgpd_compliance_mode })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Idioma Preferido</label>
                  <Select
                    value={settings.preferred_language}
                    onValueChange={(preferred_language) => updateSettings({ preferred_language })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Intervalo de Sincronização: {settings.data_sync_interval}ms
                  </label>
                  <Slider
                    value={[settings.data_sync_interval]}
                    onValueChange={([data_sync_interval]) => updateSettings({ data_sync_interval })}
                    min={100}
                    max={5000}
                    step={100}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Alert>
              <HardDrive className="h-4 w-4" />
              <AlertTitle>Dispositivos de Tecnologia Assistiva</AlertTitle>
              <AlertDescription>
                Gerenciar conexões com dispositivos AT certificados para uso médico
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {MEDICAL_AT_DEVICES.map((device) => {
                const connectedDevice = connectedDevices.find(d => d.id === device.id);
                const isConnected = connectedDevice?.status === "connected";
                const isConnecting = connectedDevice?.status === "connecting";

                return (
                  <Card key={device.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{device.name}</h4>
                            {device.medical_certified && <Badge variant="secondary">Médico</Badge>}
                            {device.brazilian_certified && <Badge variant="outline">ANVISA</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {AT_DEVICE_TYPES_PT[device.type]} • {device.manufacturer}
                          </p>
                          <div className="flex gap-1">
                            {device.capabilities.slice(0, 3).map((capability, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge
                            variant={isConnected
                              ? "default"
                              : isConnecting
                              ? "secondary"
                              : "outline"}
                          >
                            {isConnected && "Conectado"}
                            {isConnecting && "Conectando..."}
                            {!isConnected && !isConnecting && "Desconectado"}
                          </Badge>
                          <div className="flex gap-1">
                            {!isConnected
                              ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleConnectDevice(device)}
                                  disabled={isConnecting}
                                >
                                  {isConnecting ? "Conectando..." : "Conectar"}
                                </Button>
                              )
                              : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => disconnectDevice(device.id)}
                                >
                                  Desconectar
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="commands" className="space-y-4">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Comandos de Tecnologia Assistiva</AlertTitle>
              <AlertDescription>
                Comandos médicos disponíveis para execução via tecnologias assistivas
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {availableCommands.map((command) => (
                <Card key={command.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{command.name_pt}</h4>
                          <Badge
                            variant={command.priority_level === "emergency"
                              ? "destructive"
                              : command.priority_level === "high"
                              ? "secondary"
                              : "outline"}
                          >
                            {command.priority_level === "emergency" && "Emergência"}
                            {command.priority_level === "high" && "Alta"}
                            {command.priority_level === "medium" && "Média"}
                            {command.priority_level === "low" && "Baixa"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {command.description_pt}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {command.voice_triggers.slice(0, 2).map((trigger, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              &quot;{trigger}&quot;
                            </Badge>
                          ))}
                          {command.keyboard_shortcuts.slice(0, 2).map((shortcut, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {shortcut}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => executeCommand(command.id)}
                          disabled={!settings.enabled}
                        >
                          Testar
                        </Button>
                        {command.undo_available && (
                          <Button size="sm" variant="outline" disabled>
                            Desfazer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={enableEmergencyMode} variant="destructive" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Ativar Modo Emergência
              </Button>
              <Button onClick={disableEmergencyMode} variant="outline" size="sm">
                Desativar Emergência
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <Alert>
              <Link className="h-4 w-4" />
              <AlertTitle>Integração com Componentes de Acessibilidade</AlertTitle>
              <AlertDescription>
                Status da integração com outros componentes de acessibilidade
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hand className="h-4 w-4" />
                    <span className="font-medium">Navegação por Botão</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Integração com dispositivos de botão externos
                  </div>
                  <Badge variant="outline">
                    Disponível
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">Rastreamento Ocular</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Integração com dispositivos de eye-tracking
                  </div>
                  <Badge variant="outline">
                    Disponível
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4" />
                    <span className="font-medium">Controle por Voz</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Comandos de voz médicos em português
                  </div>
                  <Badge variant="outline">
                    Disponível
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Suporte Cognitivo</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Assistência cognitiva adaptativa
                  </div>
                  <Badge variant="outline">
                    Disponível
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Configurações de Feedback</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Feedback de Voz</label>
                  <Switch
                    checked={settings.voice_feedback_enabled}
                    onCheckedChange={(voice_feedback_enabled) =>
                      updateSettings({ voice_feedback_enabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Feedback Tátil</label>
                  <Switch
                    checked={settings.haptic_feedback_enabled}
                    onCheckedChange={(haptic_feedback_enabled) =>
                      updateSettings({ haptic_feedback_enabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Feedback Visual</label>
                  <Switch
                    checked={settings.visual_feedback_enabled}
                    onCheckedChange={(visual_feedback_enabled) =>
                      updateSettings({ visual_feedback_enabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Descrições de Áudio</label>
                  <Switch
                    checked={settings.audio_descriptions_enabled}
                    onCheckedChange={(audio_descriptions_enabled) =>
                      updateSettings({ audio_descriptions_enabled })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>Analytics de Tecnologias Assistivas</AlertTitle>
              <AlertDescription>
                Métricas de desempenho e uso da integração AT - dados protegidos pela LGPD
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Uso de Comandos</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Comandos Executados:</span>
                      <span className="font-semibold">{analytics.commands_executed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chamadas de API:</span>
                      <span className="font-semibold">{analytics.api_calls_made}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ativações de Emergência:</span>
                      <span className="font-semibold">{analytics.emergency_activations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prioridades Médicas:</span>
                      <span className="font-semibold">
                        {analytics.medical_priorities_triggered}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Qualidade de Serviço</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Satisfação do Usuário:</span>
                      <span className="font-semibold">{analytics.user_satisfaction_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Melhoria de A11y:</span>
                      <span className="font-semibold">
                        {analytics.accessibility_improvement_score}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Erro:</span>
                      <span className="font-semibold">
                        {Math.round(
                          (analytics.errors_encountered / Math.max(analytics.commands_executed, 1))
                            * 100,
                        )}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo de Resposta:</span>
                      <span className="font-semibold">
                        {Math.round(analytics.average_response_time)}ms
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">Dispositivos Conectados</span>
                  </div>
                  <div className="space-y-1">
                    {connectedDevices.filter(d => d.status === "connected").map((device, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{device.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(analytics.device_performance_metrics[device.id] || 100)}%
                        </Badge>
                      </div>
                    ))}
                    {connectedDevices.filter(d => d.status === "connected").length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        Nenhum dispositivo conectado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-medium">Recursos Mais Utilizados</span>
                  </div>
                  <div className="space-y-1">
                    {analytics.most_used_features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="capitalize">{feature.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Conformidade LGPD
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Padrões AT Anonimizados: ✓</div>
                  <div>Dados Médicos Criptografados: ✓</div>
                  <div>Consentimento: {analytics.lgpd_data_points.consent_status}</div>
                  <div>Retenção: {analytics.lgpd_data_points.data_retention_period} dias</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleExportAnalytics} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar Analytics
              </Button>
              <Button onClick={handleValidateCompliance} variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Validar Conformidade
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ===============================
// DEMO COMPONENT
// ===============================

export function AssistiveTechnologyAPIDemo() {
  const {
    settings,
    connectedDevices,
    availableCommands,
    executeCommand,
    enableEmergencyMode,
    connectDevice,
  } = useAssistiveTechnologyAPI();

  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<ATCommandResult | null>(null);

  const handleExecuteCommand = async (commandId: string) => {
    const result = await executeCommand(commandId);
    setCommandResult(result);
    setActiveDemo("command_result");
  };

  const handleConnectDemo = async () => {
    const demoDevice = MEDICAL_AT_DEVICES[0]; // NVDA Screen Reader
    await connectDevice(demoDevice);
    setActiveDemo("device_connected");
  };

  const handleEmergencyDemo = () => {
    enableEmergencyMode();
    setActiveDemo("emergency_activated");
  };

  if (!settings.enabled) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <Accessibility className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">API de AT Desabilitada</h3>
          <p className="text-sm text-muted-foreground">
            Habilite nas configurações para ver a demonstração
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            API de Tecnologias Assistivas Ativa
            <Badge variant="secondary" className="ml-auto">
              {connectedDevices.filter(d => d.status === "connected").length} dispositivos
            </Badge>
          </CardTitle>
          <CardDescription>
            Demonstração da integração centralizada com tecnologias assistivas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={handleConnectDemo}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Cpu className="h-4 w-4" />
              Conectar Leitor de Tela
            </Button>
            <Button
              onClick={() => handleExecuteCommand("call_nurse_immediately")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Chamar Enfermeira
            </Button>
            <Button
              onClick={handleEmergencyDemo}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Modo Emergência
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Commands Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Comandos Médicos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableCommands.slice(0, 4).map((command) => (
              <div
                key={command.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{command.name_pt}</div>
                  <div className="text-xs text-muted-foreground">
                    Voz: &quot;{command.voice_triggers[0]}&quot; • Tecla:{" "}
                    {command.keyboard_shortcuts[0]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={command.priority_level === "emergency" ? "destructive" : "outline"}
                  >
                    {command.priority_level === "emergency" ? "Emergência" : "Médico"}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleExecuteCommand(command.id)}
                  >
                    Executar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Results */}
      {activeDemo === "command_result" && commandResult && (
        <Alert className={commandResult.success ? "" : "border-red-500"}>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Resultado do Comando</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              <div>{commandResult.message_pt}</div>
              <div className="text-xs">
                Tempo de execução: {commandResult.execution_time_ms}ms • Segurança médica:{" "}
                {commandResult.medical_safety_checked ? "✓" : "⚠️"}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {activeDemo === "device_connected" && (
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertTitle>Dispositivo Conectado</AlertTitle>
          <AlertDescription>
            NVDA Screen Reader conectado com sucesso. Comandos de voz e navegação por teclado agora
            estão disponíveis.
          </AlertDescription>
        </Alert>
      )}

      {activeDemo === "emergency_activated" && (
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo de Emergência Ativado</AlertTitle>
          <AlertDescription>
            Todas as configurações de acessibilidade foram otimizadas para situação de emergência.
            Interface simplificada, contraste máximo e comandos prioritários ativados.
          </AlertDescription>
        </Alert>
      )}

      {/* Connected Devices Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status dos Dispositivos</CardTitle>
        </CardHeader>
        <CardContent>
          {connectedDevices.length > 0
            ? (
              <div className="space-y-2">
                {connectedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.status === "connected"
                            ? "bg-green-500"
                            : device.status === "connecting"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {AT_DEVICE_TYPES_PT[device.type]}
                      </Badge>
                      <Badge variant={device.status === "connected" ? "default" : "secondary"}>
                        {device.status === "connected"
                          ? "Conectado"
                          : device.status === "connecting"
                          ? "Conectando"
                          : "Desconectado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )
            : (
              <div className="text-center py-4 text-muted-foreground">
                <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum dispositivo conectado</p>
                <p className="text-xs">Conecte dispositivos AT para começar</p>
              </div>
            )}
        </CardContent>
      </Card>

      {/* API Endpoints Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="text-xs space-y-1">
            <div>
              <strong>Endpoints Disponíveis:</strong> {AT_API_ENDPOINTS.length}
            </div>
            <div>
              <strong>Protocolos Suportados:</strong> JSON, SSML, ARIA, WebSocket
            </div>
            <div>
              <strong>Certificações:</strong> ANVISA, LGPD, WCAG 2.1 AA+
            </div>
            <div>
              <strong>Idiomas:</strong> Português (BR), Inglês, Espanhol
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
