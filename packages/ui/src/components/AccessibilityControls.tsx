import {
  Accessibility,
  Eye,
  Minus,
  Monitor,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Settings,
  Sun,
  Type,
  Volume2,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

export interface AccessibilityPreferences {
  /** Font size scale (0.8x to 2.0x) */
  fontSize: number;
  /** High contrast mode for visual impairments */
  highContrast: boolean;
  /** Theme preference */
  theme: "light" | "dark" | "system";
  /** Reduced motion for vestibular disorders */
  reducedMotion: boolean;
  /** Screen reader optimizations */
  screenReader: boolean;
  /** Keyboard navigation focus indicators */
  focusIndicators: boolean;
  /** Audio feedback for interactions */
  audioFeedback: boolean;
  /** Simplified interface for cognitive accessibility */
  simplifiedInterface: boolean;
  /** Color blind friendly palette */
  colorBlindFriendly: boolean;
  /** Dyslexia-friendly font */
  dyslexiaFont: boolean;
  /** Enhanced tooltips and descriptions */
  enhancedTooltips: boolean;
}

export interface AccessibilityControlsProps {
  /**
   * Current accessibility preferences
   */
  preferences: AccessibilityPreferences;
  /**
   * Callback when preferences change
   */
  onPreferencesChange: (preferences: AccessibilityPreferences) => void;
  /**
   * Whether the controls are in expanded mode
   */
  expanded?: boolean;
  /**
   * Callback for expand/collapse
   */
  onExpandToggle?: () => void;
  /**
   * Reset to default preferences
   */
  onReset?: () => void;
  /**
   * Show WCAG compliance status
   */
  showComplianceStatus?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

const _defaultPreferences: AccessibilityPreferences = {
  fontSize: 1,
  highContrast: false,
  theme: "system",
  reducedMotion: false,
  screenReader: false,
  focusIndicators: true,
  audioFeedback: false,
  simplifiedInterface: false,
  colorBlindFriendly: false,
  dyslexiaFont: false,
  enhancedTooltips: false,
};

const getWCAGComplianceLevel = (
  preferences: AccessibilityPreferences,
): "AA" | "AAA" => {
  // AAA level criteria
  const aaaFeatures = [
    preferences.highContrast,
    preferences.enhancedTooltips,
    preferences.audioFeedback,
    preferences.simplifiedInterface,
  ];

  const activeAAAFeatures = aaaFeatures.filter(Boolean).length;
  return activeAAAFeatures >= 2 ? "AAA" : "AA";
};

export const AccessibilityControls = React.forwardRef<
  HTMLDivElement,
  AccessibilityControlsProps
>(
  (
    {
      preferences,
      onPreferencesChange,
      expanded = false,
      onExpandToggle,
      onReset,
      showComplianceStatus = true,
      className,
      ...props
    },
    ref,
  ) => {
    // Generate unique IDs for accessibility
    const panelId = useId();
    const titleId = useId();
    const descriptionId = useId();
    const highContrastId = useId();
    const highContrastDescId = useId();
    const colorBlindId = useId();
    const colorBlindDescId = useId();
    const dyslexiaFontId = useId();
    const dyslexiaFontDescId = useId();
    const reducedMotionId = useId();
    const reducedMotionDescId = useId();
    const simplifiedInterfaceId = useId();
    const simplifiedInterfaceDescId = useId();
    const enhancedTooltipsId = useId();
    const enhancedTooltipsDescId = useId();
    const screenReaderId = useId();
    const screenReaderDescId = useId();
    const audioFeedbackId = useId();
    const audioFeedbackDescId = useId();
    const focusIndicatorsId = useId();
    const focusIndicatorsDescId = useId();

    const updatePreference = <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K],
    ) => {
      onPreferencesChange({
        ...preferences,
        [key]: value,
      });
    };

    const handleFontSizeChange = (delta: number) => {
      const newSize = Math.max(0.8, Math.min(2, preferences.fontSize + delta));
      updatePreference("fontSize", Number(newSize.toFixed(1)));
    };

    const complianceLevel = getWCAGComplianceLevel(preferences);
    const activeFeatures = Object.values(preferences).filter(Boolean).length;

    if (!expanded) {
      return (
        <div
          className={cn(
            "fixed right-4 bottom-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:shadow-xl",
            className,
          )}
          ref={ref}
          {...props}
        >
          <Button
            aria-controls={panelId}
            aria-expanded={false}
            aria-label="Abrir controles de acessibilidade"
            className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
            onClick={onExpandToggle}
            size="icon"
            variant="ghost"
          >
            <Accessibility className="h-5 w-5" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "fixed right-4 bottom-4 z-50 w-80 rounded-lg border bg-card p-6 text-card-foreground shadow-xl",
          className,
        )}
        id={panelId}
        ref={ref}
        {...props}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        role="dialog"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg" id={titleId}>
              Acessibilidade
            </h3>
            <p className="text-muted-foreground text-sm" id={descriptionId}>
              Personalize sua experiência
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showComplianceStatus && (
              <Badge
                size="sm"
                variant={complianceLevel === "AAA" ? "confirmed" : "medium"}
              >
                WCAG {complianceLevel}
              </Badge>
            )}

            <Button
              aria-controls={panelId}
              aria-expanded
              aria-label="Fechar controles de acessibilidade"
              onClick={onExpandToggle}
              size="icon"
              variant="ghost"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Font Size Controls */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Type className="h-4 w-4" />
              Tamanho da Fonte
            </h4>
            <div className="flex items-center justify-between">
              <Button
                aria-label="Diminuir tamanho da fonte"
                disabled={preferences.fontSize <= 0.8}
                onClick={() => handleFontSizeChange(-0.1)}
                size="icon"
                variant="outline"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <span className="font-medium text-sm">
                {Math.round(preferences.fontSize * 100)}%
              </span>

              <Button
                aria-label="Aumentar tamanho da fonte"
                disabled={preferences.fontSize >= 2}
                onClick={() => handleFontSizeChange(0.1)}
                size="icon"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Theme Controls */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Palette className="h-4 w-4" />
              Tema
            </h4>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((theme) => (
                <Button
                  aria-pressed={preferences.theme === theme}
                  className="flex-1"
                  key={theme}
                  onClick={() => updatePreference("theme", theme)}
                  size="sm"
                  variant={preferences.theme === theme ? "default" : "outline"}
                >
                  {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
                  {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
                  {theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
                  {theme === "light" && "Claro"}
                  {theme === "dark" && "Escuro"}
                  {theme === "system" && "Sistema"}
                </Button>
              ))}
            </div>
          </div>

          {/* Visual Accessibility */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Eye className="h-4 w-4" />
              Acessibilidade Visual
            </h4>
            <div className="space-y-2">
              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={highContrastId}
              >
                <Checkbox
                  aria-describedby={highContrastDescId}
                  checked={preferences.highContrast}
                  id={highContrastId}
                  onCheckedChange={(checked) =>
                    updatePreference("highContrast", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Alto Contraste</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={highContrastDescId}
                  >
                    Melhora a visibilidade para baixa visão
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={colorBlindId}
              >
                <Checkbox
                  aria-describedby={colorBlindDescId}
                  checked={preferences.colorBlindFriendly}
                  id={colorBlindId}
                  onCheckedChange={(checked) =>
                    updatePreference("colorBlindFriendly", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Cores Acessíveis</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={colorBlindDescId}
                  >
                    Paleta otimizada para daltonismo
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={dyslexiaFontId}
              >
                <Checkbox
                  aria-describedby={dyslexiaFontDescId}
                  checked={preferences.dyslexiaFont}
                  id={dyslexiaFontId}
                  onCheckedChange={(checked) =>
                    updatePreference("dyslexiaFont", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    Fonte para Dislexia
                  </span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={dyslexiaFontDescId}
                  >
                    Fonte otimizada para leitura
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Motor & Cognitive Accessibility */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Zap className="h-4 w-4" />
              Navegação e Cognição
            </h4>
            <div className="space-y-2">
              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={reducedMotionId}
              >
                <Checkbox
                  aria-describedby={reducedMotionDescId}
                  checked={preferences.reducedMotion}
                  id={reducedMotionId}
                  onCheckedChange={(checked) =>
                    updatePreference("reducedMotion", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Reduzir Animações</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={reducedMotionDescId}
                  >
                    Minimiza movimento para sensibilidade vestibular
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={simplifiedInterfaceId}
              >
                <Checkbox
                  aria-describedby={simplifiedInterfaceDescId}
                  checked={preferences.simplifiedInterface}
                  id={simplifiedInterfaceId}
                  onCheckedChange={(checked) =>
                    updatePreference("simplifiedInterface", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    Interface Simplificada
                  </span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={simplifiedInterfaceDescId}
                  >
                    Remove elementos complexos desnecessários
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={enhancedTooltipsId}
              >
                <Checkbox
                  aria-describedby={enhancedTooltipsDescId}
                  checked={preferences.enhancedTooltips}
                  id={enhancedTooltipsId}
                  onCheckedChange={(checked) =>
                    updatePreference("enhancedTooltips", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Dicas Detalhadas</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={enhancedTooltipsDescId}
                  >
                    Explicações adicionais para reduzir ansiedade
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Screen Reader & Audio */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-medium text-sm">
              <Volume2 className="h-4 w-4" />
              Áudio e Leitores de Tela
            </h4>
            <div className="space-y-2">
              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={screenReaderId}
              >
                <Checkbox
                  aria-describedby={screenReaderDescId}
                  checked={preferences.screenReader}
                  id={screenReaderId}
                  onCheckedChange={(checked) =>
                    updatePreference("screenReader", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    Otimizar para Leitor de Tela
                  </span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={screenReaderDescId}
                  >
                    Melhora compatibilidade com NVDA, JAWS, etc.
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={audioFeedbackId}
              >
                <Checkbox
                  aria-describedby={audioFeedbackDescId}
                  checked={preferences.audioFeedback}
                  id={audioFeedbackId}
                  onCheckedChange={(checked) =>
                    updatePreference("audioFeedback", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Feedback Sonoro</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={audioFeedbackDescId}
                  >
                    Sons para confirmação de ações
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor={focusIndicatorsId}
              >
                <Checkbox
                  aria-describedby={focusIndicatorsDescId}
                  checked={preferences.focusIndicators}
                  id={focusIndicatorsId}
                  onCheckedChange={(checked) =>
                    updatePreference("focusIndicators", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">
                    Indicadores de Foco
                  </span>
                  <p
                    className="text-muted-foreground text-xs"
                    id={focusIndicatorsDescId}
                  >
                    Destaque visual para navegação por teclado
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {activeFeatures} de {Object.keys(preferences).length} recursos
                ativos
              </span>
              <Badge size="sm" variant="outline">
                WCAG {complianceLevel}
              </Badge>
            </div>

            {onReset && (
              <Button
                aria-label="Redefinir configurações de acessibilidade para padrão"
                className="w-full"
                onClick={onReset}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Redefinir Padrões
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

AccessibilityControls.displayName = "AccessibilityControls";
