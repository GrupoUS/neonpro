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
import { cn } from "../utils/cn";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

export type AccessibilityPreferences = {
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
};

export type AccessibilityControlsProps = {
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
};

const _defaultPreferences: AccessibilityPreferences = {
  fontSize: 1.0,
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

const getWCAGComplianceLevel = (preferences: AccessibilityPreferences): "AA" | "AAA" => {
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

export const AccessibilityControls = React.forwardRef<HTMLDivElement, AccessibilityControlsProps>(
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
      const newSize = Math.max(0.8, Math.min(2.0, preferences.fontSize + delta));
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
            aria-controls="accessibility-panel"
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
        id="accessibility-panel"
        ref={ref}
        {...props}
        aria-describedby="accessibility-description"
        aria-labelledby="accessibility-title"
        role="dialog"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg" id="accessibility-title">
              Acessibilidade
            </h3>
            <p className="text-muted-foreground text-sm" id="accessibility-description">
              Personalize sua experiência
            </p>
          </div>

          <div className="flex items-center gap-2">
            {showComplianceStatus && (
              <Badge size="sm" variant={complianceLevel === "AAA" ? "confirmed" : "medium"}>
                WCAG {complianceLevel}
              </Badge>
            )}

            <Button
              aria-controls="accessibility-panel"
              aria-expanded={true}
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

              <span className="font-medium text-sm">{Math.round(preferences.fontSize * 100)}%</span>

              <Button
                aria-label="Aumentar tamanho da fonte"
                disabled={preferences.fontSize >= 2.0}
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
                htmlFor="high-contrast-checkbox"
              >
                <Checkbox
                  aria-describedby="high-contrast-description"
                  checked={preferences.highContrast}
                  id="high-contrast-checkbox"
                  onCheckedChange={(checked) => updatePreference("highContrast", Boolean(checked))}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Alto Contraste</span>
                  <p className="text-muted-foreground text-xs" id="high-contrast-description">
                    Melhora a visibilidade para baixa visão
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="color-blind-checkbox"
              >
                <Checkbox
                  aria-describedby="color-blind-description"
                  checked={preferences.colorBlindFriendly}
                  id="color-blind-checkbox"
                  onCheckedChange={(checked) =>
                    updatePreference("colorBlindFriendly", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Cores Acessíveis</span>
                  <p className="text-muted-foreground text-xs" id="color-blind-description">
                    Paleta otimizada para daltonismo
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="dyslexia-font-checkbox"
              >
                <Checkbox
                  aria-describedby="dyslexia-font-description"
                  checked={preferences.dyslexiaFont}
                  id="dyslexia-font-checkbox"
                  onCheckedChange={(checked) => updatePreference("dyslexiaFont", Boolean(checked))}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Fonte para Dislexia</span>
                  <p className="text-muted-foreground text-xs" id="dyslexia-font-description">
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
                htmlFor="reduced-motion-checkbox"
              >
                <Checkbox
                  aria-describedby="reduced-motion-description"
                  checked={preferences.reducedMotion}
                  id="reduced-motion-checkbox"
                  onCheckedChange={(checked) => updatePreference("reducedMotion", Boolean(checked))}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Reduzir Animações</span>
                  <p className="text-muted-foreground text-xs" id="reduced-motion-description">
                    Minimiza movimento para sensibilidade vestibular
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="simplified-interface-checkbox"
              >
                <Checkbox
                  aria-describedby="simplified-interface-description"
                  checked={preferences.simplifiedInterface}
                  id="simplified-interface-checkbox"
                  onCheckedChange={(checked) =>
                    updatePreference("simplifiedInterface", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Interface Simplificada</span>
                  <p
                    className="text-muted-foreground text-xs"
                    id="simplified-interface-description"
                  >
                    Remove elementos complexos desnecessários
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="enhanced-tooltips-checkbox"
              >
                <Checkbox
                  aria-describedby="enhanced-tooltips-description"
                  checked={preferences.enhancedTooltips}
                  id="enhanced-tooltips-checkbox"
                  onCheckedChange={(checked) =>
                    updatePreference("enhancedTooltips", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Dicas Detalhadas</span>
                  <p className="text-muted-foreground text-xs" id="enhanced-tooltips-description">
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
                htmlFor="screen-reader-checkbox"
              >
                <Checkbox
                  aria-describedby="screen-reader-description"
                  checked={preferences.screenReader}
                  id="screen-reader-checkbox"
                  onCheckedChange={(checked) => updatePreference("screenReader", Boolean(checked))}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Otimizar para Leitor de Tela</span>
                  <p className="text-muted-foreground text-xs" id="screen-reader-description">
                    Melhora compatibilidade com NVDA, JAWS, etc.
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="audio-feedback-checkbox"
              >
                <Checkbox
                  aria-describedby="audio-feedback-description"
                  checked={preferences.audioFeedback}
                  id="audio-feedback-checkbox"
                  onCheckedChange={(checked) => updatePreference("audioFeedback", Boolean(checked))}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Feedback Sonoro</span>
                  <p className="text-muted-foreground text-xs" id="audio-feedback-description">
                    Sons para confirmação de ações
                  </p>
                </div>
              </label>

              <label
                className="flex cursor-pointer items-center space-x-3"
                htmlFor="focus-indicators-checkbox"
              >
                <Checkbox
                  aria-describedby="focus-indicators-description"
                  checked={preferences.focusIndicators}
                  id="focus-indicators-checkbox"
                  onCheckedChange={(checked) =>
                    updatePreference("focusIndicators", Boolean(checked))
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">Indicadores de Foco</span>
                  <p className="text-muted-foreground text-xs" id="focus-indicators-description">
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
                {activeFeatures} de {Object.keys(preferences).length} recursos ativos
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
