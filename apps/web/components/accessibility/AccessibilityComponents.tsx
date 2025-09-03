/**
 * Accessibility Components and Utilities - FASE 3 Enhanced
 * Healthcare-specific accessibility patterns with Portuguese support
 * WCAG 2.1 AA+ compliance with medical terminology optimization
 * Compliance: LGPD/ANVISA/CFM with healthcare workflow accessibility
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Accessibility,
  Activity,
  AlertTriangle,
  Contrast,
  Eye,
  Focus,
  Heart,
  Keyboard,
  Languages,
  Mic,
  MousePointer,
  Speaker,
  Stethoscope,
  Type,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// FASE 3: Healthcare-specific skip navigation with medical context
export function SkipToContentLink() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:transition-all focus:duration-200 focus:text-sm sm:focus:top-4 sm:focus:left-4 sm:focus:px-4 sm:focus:py-2 md:focus:px-6 md:focus:py-3 md:focus:text-base lg:focus:top-6 lg:focus:left-6"
      >
        Pular para o conteúdo principal
      </a>

      {/* Healthcare-specific skip links */}
      <a
        href="#patient-search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:mt-12 focus:z-50 focus:px-3 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:transition-all focus:duration-200 focus:text-sm"
      >
        Pular para busca de pacientes
      </a>

      <a
        href="#emergency-actions"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:mt-24 focus:z-50 focus:px-3 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-md focus:shadow-lg focus:transition-all focus:duration-200 focus:text-sm"
      >
        Pular para ações de emergência
      </a>

      <a
        href="#compliance-info"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:mt-36 focus:z-50 focus:px-3 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-md focus:shadow-lg focus:transition-all focus:duration-200 focus:text-sm"
      >
        Pular para informações de compliance
      </a>
    </>
  );
}

// FASE 3: Medical terminology screen reader optimization
export function MedicalTermReader({
  term,
  pronunciation,
  definition,
  children,
}: {
  term: string;
  pronunciation?: string;
  definition?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-label={`Termo médico: ${term}. ${pronunciation ? `Pronúncia: ${pronunciation}. ` : ""}${
        definition ? `Definição: ${definition}` : ""
      }`}
      role="term"
      className="medical-term relative cursor-help border-b border-dotted border-blue-400 hover:border-solid focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {children}
    </span>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode; }) {
  return <span className="sr-only">{children}</span>;
}

// ARIA live region for dynamic announcements
export function LiveRegion({
  children,
  politeness = "polite",
}: {
  children: React.ReactNode;
  politeness?: "off" | "polite" | "assertive";
}) {
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
}

// Focus trap utility for modals and overlays
export function FocusTrap({ children }: { children: React.ReactNode; }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: container } = containerRef;
    if (!container) {
      return;
    }

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const [firstElement] = focusableElements as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  return (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}

// Keyboard navigation helper
export function KeyboardHelper() {
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        setShowHelper(!showHelper);
      }
      if (e.key === "Escape") {
        setShowHelper(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showHelper]);

  const shortcuts = [
    { keys: ["Ctrl", "?"], description: "Mostrar/ocultar esta ajuda" },
    { keys: ["Tab"], description: "Navegar para próximo elemento" },
    { keys: ["Shift", "Tab"], description: "Navegar para elemento anterior" },
    { keys: ["Enter", "Space"], description: "Ativar botão ou link" },
    { keys: ["Escape"], description: "Fechar modal ou menu" },
    { keys: ["Home"], description: "Ir para o início da página" },
    { keys: ["End"], description: "Ir para o fim da página" },
    { keys: ["Arrow Keys"], description: "Navegar em listas e menus" },
  ];

  if (!showHelper) {
    return;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </CardTitle>
          <CardDescription>
            Navegue pelo sistema usando apenas o teclado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <Badge key={keyIndex} variant="outline" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>
          <Button onClick={() => setShowHelper(false)} className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// FASE 3: Enhanced healthcare accessibility preferences
interface AccessibilityPreferences {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  soundEnabled: boolean;
  autoplay: boolean;
  // Healthcare-specific preferences
  medicalTerminologyHelp: boolean;
  emergencyHighContrast: boolean;
  voiceNavigation: boolean;
  largerTouchTargets: boolean;
  medicalAlertsAudio: boolean;
  portugueseScreenReader: boolean;
  dyslexiaFriendlyFont: boolean;
  colorBlindnessSupport: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  cognitiveAssistance: boolean;
  slowAnimations: boolean;
}

export function AccessibilityPanel() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    fontSize: 16,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    soundEnabled: true,
    autoplay: false,
    // Healthcare-specific defaults
    medicalTerminologyHelp: true,
    emergencyHighContrast: false,
    voiceNavigation: false,
    largerTouchTargets: false,
    medicalAlertsAudio: true,
    portugueseScreenReader: true,
    dyslexiaFriendlyFont: false,
    colorBlindnessSupport: "none",
    cognitiveAssistance: false,
    slowAnimations: false,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "healthcare" | "language"
  >("general");

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem("neonpro-accessibility-preferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem(
      "neonpro-accessibility-preferences",
      JSON.stringify(preferences),
    );

    // Apply preferences to document
    document.documentElement.style.fontSize = `${preferences.fontSize}px`;

    // Standard accessibility classes
    if (preferences.highContrast || preferences.emergencyHighContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    if (preferences.reducedMotion || preferences.slowAnimations) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }

    // Healthcare-specific accessibility classes
    if (preferences.largerTouchTargets) {
      document.documentElement.classList.add("large-touch-targets");
    } else {
      document.documentElement.classList.remove("large-touch-targets");
    }

    if (preferences.dyslexiaFriendlyFont) {
      document.documentElement.classList.add("dyslexia-friendly");
    } else {
      document.documentElement.classList.remove("dyslexia-friendly");
    }

    if (preferences.colorBlindnessSupport !== "none") {
      document.documentElement.classList.add(
        `color-blind-${preferences.colorBlindnessSupport}`,
      );
    } else {
      document.documentElement.classList.remove(
        "color-blind-protanopia",
        "color-blind-deuteranopia",
        "color-blind-tritanopia",
      );
    }

    if (preferences.cognitiveAssistance) {
      document.documentElement.classList.add("cognitive-assistance");
    } else {
      document.documentElement.classList.remove("cognitive-assistance");
    }

    // Portuguese language settings
    if (preferences.portugueseScreenReader) {
      document.documentElement.setAttribute("lang", "pt-BR");
    }
  }, [preferences]);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-2 right-2 z-40 h-10 w-10 rounded-full p-0 sm:bottom-4 sm:right-4 sm:h-12 sm:w-12 md:bottom-6 md:right-6 lg:h-14 lg:w-14"
          aria-label="Configurações de acessibilidade"
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="w-80 sm:w-96 md:w-[28rem]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Acessibilidade Healthcare
            </h3>
            <p className="text-sm text-muted-foreground">
              Configurações otimizadas para profissionais de saúde e pacientes
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-muted p-1" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "general"}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === "general"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("general")}
            >
              <Type className="h-4 w-4 mr-2 inline" />
              Geral
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "healthcare"}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === "healthcare"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("healthcare")}
            >
              <Stethoscope className="h-4 w-4 mr-2 inline" />
              Médico
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "language"}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === "language"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab("language")}
            >
              <Languages className="h-4 w-4 mr-2 inline" />
              Idioma
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4" role="tabpanel">
            {activeTab === "general" && (
              <div className="space-y-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="font-size-slider"
                      className="text-sm font-medium"
                    >
                      Tamanho da Fonte
                    </label>
                    <Badge variant="outline">{preferences.fontSize}px</Badge>
                  </div>
                  <Slider
                    id="font-size-slider"
                    value={[preferences.fontSize]}
                    onValueChange={([value]) => updatePreference("fontSize", value)}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <label
                      htmlFor="high-contrast-switch"
                      className="text-sm font-medium"
                    >
                      Alto Contraste
                    </label>
                  </div>
                  <Switch
                    id="high-contrast-switch"
                    checked={preferences.highContrast}
                    onCheckedChange={(checked) => updatePreference("highContrast", checked)}
                  />
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    <label
                      htmlFor="reduceMotion"
                      className="text-sm font-medium"
                    >
                      Reduzir Movimento
                    </label>
                  </div>
                  <Switch
                    id="reduceMotion"
                    checked={preferences.reducedMotion}
                    onCheckedChange={(checked) => updatePreference("reducedMotion", checked)}
                  />
                </div>

                {/* Screen Reader */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Speaker className="h-4 w-4" />
                    <label htmlFor="screen-reader-switch" className="text-sm font-medium">
                      Leitor de Tela
                    </label>
                  </div>
                  <Switch
                    id="screen-reader-switch"
                    checked={preferences.screenReader}
                    onCheckedChange={(checked) => updatePreference("screenReader", checked)}
                  />
                </div>

                {/* Keyboard Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    <label htmlFor="keyboard-navigation-switch" className="text-sm font-medium">
                      Navegação por Teclado
                    </label>
                  </div>
                  <Switch
                    id="keyboard-navigation-switch"
                    checked={preferences.keyboardNavigation}
                    onCheckedChange={(checked) => updatePreference("keyboardNavigation", checked)}
                  />
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {preferences.soundEnabled
                      ? <Volume2 className="h-4 w-4" />
                      : <VolumeX className="h-4 w-4" />}
                    <label htmlFor="sound-enabled-switch" className="text-sm font-medium">
                      Sons do Sistema
                    </label>
                  </div>
                  <Switch
                    id="sound-enabled-switch"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => updatePreference("soundEnabled", checked)}
                  />
                </div>
              </div>
            )}

            {/* Healthcare Tab */}
            {activeTab === "healthcare" && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Configurações Médicas
                </h4>

                {/* Medical Terminology Help */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <label
                      htmlFor="medical-terminology-help-switch"
                      className="text-sm font-medium"
                    >
                      Ajuda com Terminologia Médica
                    </label>
                  </div>
                  <Switch
                    id="medical-terminology-help-switch"
                    checked={preferences.medicalTerminologyHelp}
                    onCheckedChange={(checked) =>
                      updatePreference("medicalTerminologyHelp", checked)}
                  />
                </div>

                {/* Emergency High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <label htmlFor="emergency-high-contrast-switch" className="text-sm font-medium">
                      Alto Contraste para Emergências
                    </label>
                  </div>
                  <Switch
                    id="emergency-high-contrast-switch"
                    checked={preferences.emergencyHighContrast}
                    onCheckedChange={(checked) =>
                      updatePreference("emergencyHighContrast", checked)}
                  />
                </div>

                {/* Voice Navigation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <label htmlFor="voice-navigation-switch" className="text-sm font-medium">
                        Navegação por Voz
                      </label>
                    </div>
                    <Switch
                      id="voice-navigation-switch"
                      checked={preferences.voiceNavigation}
                      onCheckedChange={(checked) => updatePreference("voiceNavigation", checked)}
                    />
                  </div>
                  {preferences.voiceNavigation && (
                    <div className="ml-6 space-y-2 text-xs text-muted-foreground">
                      <p>Comandos disponíveis:</p>
                      <ul className="space-y-1 text-[11px]">
                        <li>
                          • &quot;Mostrar pacientes&quot; - Abrir lista de pacientes
                        </li>
                        <li>• &quot;Buscar paciente [nome]&quot; - Procurar paciente</li>
                        <li>• &quot;Agenda de hoje&quot; - Ver consultas do dia</li>
                        <li>• "Estoque de [produto]" - Verificar estoque</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Larger Touch Targets */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    <label htmlFor="larger-touch-targets-switch" className="text-sm font-medium">
                      Alvos de Toque Maiores
                    </label>
                  </div>
                  <Switch
                    id="larger-touch-targets-switch"
                    checked={preferences.largerTouchTargets}
                    onCheckedChange={(checked) => updatePreference("largerTouchTargets", checked)}
                  />
                </div>

                {/* Medical Alerts Audio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <label htmlFor="medical-alerts-audio-switch" className="text-sm font-medium">
                      Alertas Médicos por Áudio
                    </label>
                  </div>
                  <Switch
                    id="medical-alerts-audio-switch"
                    checked={preferences.medicalAlertsAudio}
                    onCheckedChange={(checked) => updatePreference("medicalAlertsAudio", checked)}
                  />
                </div>

                {/* Cognitive Assistance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <label htmlFor="cognitive-assistance-switch" className="text-sm font-medium">
                      Assistência Cognitiva
                    </label>
                  </div>
                  <Switch
                    id="cognitive-assistance-switch"
                    checked={preferences.cognitiveAssistance}
                    onCheckedChange={(checked) => updatePreference("cognitiveAssistance", checked)}
                  />
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Languages className="h-4 w-4 text-blue-500" />
                  Configurações de Idioma
                </h4>

                {/* Portuguese Screen Reader */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Speaker className="h-4 w-4" />
                    <label
                      htmlFor="portuguese-screen-reader-switch"
                      className="text-sm font-medium"
                    >
                      Leitor de Tela em Português
                    </label>
                  </div>
                  <Switch
                    id="portuguese-screen-reader-switch"
                    checked={preferences.portugueseScreenReader}
                    onCheckedChange={(checked) =>
                      updatePreference("portugueseScreenReader", checked)}
                  />
                </div>

                {/* Dyslexia Friendly Font */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <label htmlFor="dyslexia-friendly-font-switch" className="text-sm font-medium">
                      Fonte Amigável para Dislexia
                    </label>
                  </div>
                  <Switch
                    id="dyslexia-friendly-font-switch"
                    checked={preferences.dyslexiaFriendlyFont}
                    onCheckedChange={(checked) => updatePreference("dyslexiaFriendlyFont", checked)}
                  />
                </div>

                {/* Color Blindness Support */}
                <div className="space-y-2">
                  <label htmlFor="color-blindness-support" className="text-sm font-medium">
                    Suporte para Daltonismo
                  </label>
                  <select
                    id="color-blindness-support"
                    value={preferences.colorBlindnessSupport}
                    onChange={(e) =>
                      updatePreference(
                        "colorBlindnessSupport",
                        e.target.value as unknown,
                      )}
                    className="w-full p-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="none">Nenhum</option>
                    <option value="protanopia">
                      Protanopia (Vermelho-verde)
                    </option>
                    <option value="deuteranopia">
                      Deuteranopia (Verde-vermelho)
                    </option>
                    <option value="tritanopia">
                      Tritanopia (Azul-amarelo)
                    </option>
                  </select>
                </div>

                {/* Slow Animations */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Focus className="h-4 w-4" />
                    <label htmlFor="slow-animations-switch" className="text-sm font-medium">
                      Animações Mais Lentas
                    </label>
                  </div>
                  <Switch
                    id="slow-animations-switch"
                    checked={preferences.slowAnimations}
                    onCheckedChange={(checked) => updatePreference("slowAnimations", checked)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setPreferences({
                fontSize: 16,
                highContrast: false,
                reducedMotion: false,
                screenReader: false,
                keyboardNavigation: true,
                soundEnabled: true,
                autoplay: false,
                medicalTerminologyHelp: true,
                emergencyHighContrast: false,
                voiceNavigation: false,
                largerTouchTargets: false,
                medicalAlertsAudio: true,
                portugueseScreenReader: true,
                dyslexiaFriendlyFont: false,
                colorBlindnessSupport: "none",
                cognitiveAssistance: false,
                slowAnimations: false,
              });
            }}
          >
            Restaurar Padrões Healthcare
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ARIA status announcer for dynamic content changes
export function StatusAnnouncer() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleStatusChange = (event: CustomEvent) => {
      setMessage(event.detail.message);
      // Clear message after announcement
      setTimeout(() => setMessage(""), 1000);
    };

    document.addEventListener(
      "announce-status",
      handleStatusChange as EventListener,
    );
    return () => {
      document.removeEventListener(
        "announce-status",
        handleStatusChange as EventListener,
      );
    };
  }, []);

  return <LiveRegion politeness="assertive">{message}</LiveRegion>;
}

// Utility function to announce status changes
export function announceStatus(message: string) {
  const event = new CustomEvent("announce-status", {
    detail: { message },
  });
  document.dispatchEvent(event);
}

// Color contrast checker utility
export function checkColorContrast(
  _foreground: string,
  _background: string,
): "AAA" | "AA" | "FAIL" {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  const { 5: ratio } = 4; // Mock ratio for demo

  if (ratio >= 7) {
    return "AAA";
  }
  if (ratio >= 4.5) {
    return "AA";
  }
  return "FAIL";
}

// Focus management hook
export function useFocusManagement() {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const trapFocus = (container: HTMLElement) => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusableElements[0] as HTMLElement)?.focus();
  };

  const releaseFocus = () => {
    previouslyFocusedElement.current?.focus();
    previouslyFocusedElement.current = undefined;
  };

  return { trapFocus, releaseFocus };
}
