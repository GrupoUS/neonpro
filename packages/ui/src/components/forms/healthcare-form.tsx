/**
 * Healthcare Form Component
 *
 * Enhanced form wrapper with healthcare-specific validation, LGPD compliance,
 * accessibility features, and medical data handling capabilities.
 *
 * @fileoverview Healthcare form foundation with compliance and accessibility
 */

"use client";

import React, {
  FormHTMLAttributes,
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { z } from "zod";
import { cn } from "../../lib/utils";
import { useHealthcareTheme } from "../healthcare/healthcare-theme-provider";
import {
  DataSensitivity,
  validateEmergencyData,
} from "../../utils/healthcare-validation";
import {
  announceToScreenReader,
  HealthcarePriority,
  useFocusTrap,
  generateAccessibleId,
} from "../../utils/accessibility";

// Healthcare form validation context
export interface HealthcareFormContext {
  // Form state
  isSubmitting: boolean;
  hasErrors: boolean;
  dataSensitivity: DataSensitivity;

  // LGPD compliance
  consentRequired: boolean;
  consentGiven: boolean;

  // Healthcare-specific
  emergencyForm: boolean;
  patientDataForm: boolean;

  // Validation
  errors: Record<string, string[]>;
  setFieldError: (field: string, errors: string[]) => void;
  clearFieldError: (field: string) => void;

  // Accessibility
  formId: string;
  announceError: (message: string) => void;
}

const HealthcareFormContext = createContext<HealthcareFormContext | null>(null);

// Healthcare form props
export interface HealthcareFormProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onError"> {
  children: ReactNode;

  // Form configuration
  dataSensitivity?: DataSensitivity;
  emergencyForm?: boolean;
  patientDataForm?: boolean;

  // LGPD compliance
  requireConsent?: boolean;
  consentVersion?: string;

  // Validation
  validationSchema?: z.ZodSchema;
  validationErrors?: Record<string, string[]>;

  // Form submission
  onSubmit?: (
    data: FormData,
    context: HealthcareFormContext,
  ) => Promise<void> | void;
  onError?: (errors: Record<string, string[]>) => void;

  // Accessibility
  ariaLabel?: string;
  emergencyShortcuts?: boolean;

  className?: string;
}

/**
 * Healthcare Form Component
 *
 * Provides a form wrapper with healthcare-specific features including
 * LGPD compliance, medical data validation, and accessibility enhancements.
 */
export function HealthcareForm({
  children,
  dataSensitivity = DataSensitivity.CONFIDENTIAL,
  emergencyForm = false,
  patientDataForm = false,
  requireConsent = true,
  consentVersion = "1.0",
  validationSchema,
  validationErrors = {},
  onSubmit,
  onError,
  ariaLabel,
  emergencyShortcuts = false,
  className,
  ...props
}: HealthcareFormProps) {
  // Theme and accessibility context
  const { accessibility } = useHealthcareTheme();
  // TODO: Implement theme usage
  // const { theme, accessibility } = useHealthcareTheme();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] =
    useState<Record<string, string[]>>(validationErrors);
  const [consentGiven, setConsentGiven] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Generate unique form ID
  const formId = generateAccessibleId("healthcare-form");

  // Focus trap for emergency forms
  const focusTrapRef = useFocusTrap(
    emergencyForm && accessibility.isEmergencyMode,
  );

  // Merge refs for emergency forms
  const mergedRef = emergencyForm
    ? (node: HTMLFormElement | null) => {
        formRef.current = node as HTMLFormElement | null;
        const ft = focusTrapRef as unknown as
          | ((n: HTMLElement) => void)
          | React.RefObject<HTMLElement>
          | null;
        if (typeof ft === "function" && node) {
          ft(node);
        } else if (ft && "current" in ft && node) {
          (ft as React.RefObject<HTMLElement | null>).current =
            node as unknown as HTMLElement | null;
        }
      }
    : formRef;

  // Error management functions
  const setFieldError = (field: string, fieldErrors: string[]) => {
    setErrors((prev) => ({
      ...prev,
      [field]: fieldErrors,
    }));
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const announceError = (message: string) => {
    const priority = emergencyForm
      ? HealthcarePriority.EMERGENCY
      : HealthcarePriority.HIGH;
    announceToScreenReader(message, priority);
  };

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

    try {
      // Clear previous errors
      setErrors({});

      // LGPD consent validation
      if (requireConsent && !consentGiven) {
        const consentError = ["Consentimento LGPD é obrigatório"];
        setFieldError("consent", consentError);
        announceError(
          "Consentimento para processamento de dados é obrigatório",
        );
        return;
      }

      // Healthcare-specific validations
      const formDataObject = Object.fromEntries(formData.entries());

      // Emergency data validation for patient forms
      if (patientDataForm) {
        const emergencyValidation = validateEmergencyData(formDataObject);
        if (!emergencyValidation.isValid) {
          emergencyValidation.errors.forEach((error) => {
            announceError(error);
          });
          setFieldError("emergency", emergencyValidation.errors);
          return;
        }
      }

      // Schema validation if provided
      if (validationSchema) {
        try {
          await validationSchema.parseAsync(formDataObject);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const fieldErrors: Record<string, string[]> = {};

            validationError.errors.forEach((error) => {
              const field = error.path.join(".");
              if (!fieldErrors[field]) {
                fieldErrors[field] = [];
              }
              fieldErrors[field].push(error.message);
            });

            setErrors(fieldErrors);
            onError?.(fieldErrors);

            // Announce first error
            const firstError = Object.values(fieldErrors)[0]?.[0];
            if (firstError) {
              announceError(firstError);
            }

            return;
          }
        }
      }

      // Form context for submission
      const context: HealthcareFormContext = {
        isSubmitting: true,
        hasErrors: false,
        dataSensitivity,
        consentRequired: requireConsent,
        consentGiven,
        emergencyForm,
        patientDataForm,
        errors: {},
        setFieldError,
        clearFieldError,
        formId,
        announceError,
      };

      // Call onSubmit handler
      await onSubmit?.(formData, context);

      // Success announcement
      announceToScreenReader(
        emergencyForm
          ? "Formulário de emergência enviado com sucesso"
          : "Formulário enviado com sucesso",
        emergencyForm ? HealthcarePriority.EMERGENCY : HealthcarePriority.HIGH,
      );
    } catch (error) {
      console.error("Healthcare form submission error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao enviar formulário";

      setFieldError("submit", [errorMessage]);
      announceError(`Erro ao enviar formulário: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts for emergency forms
  useEffect(() => {
    if (!emergencyShortcuts || !emergencyForm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+S: Quick save for emergency
      if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        formRef.current?.requestSubmit();
        announceToScreenReader(
          "Salvamento rápido de emergência ativado",
          HealthcarePriority.EMERGENCY,
        );
      }

      // Alt+H: Help/assistance call
      if (event.altKey && event.key === "h") {
        event.preventDefault();
        announceToScreenReader(
          "Chamando assistência médica",
          HealthcarePriority.EMERGENCY,
        );
        // Could trigger help modal or notification
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [emergencyShortcuts, emergencyForm]);

  // Context value
  const contextValue: HealthcareFormContext = {
    isSubmitting,
    hasErrors: Object.keys(errors).length > 0,
    dataSensitivity,
    consentRequired: requireConsent,
    consentGiven,
    emergencyForm,
    patientDataForm,
    errors,
    setFieldError,
    clearFieldError,
    formId,
    announceError,
  };

  // Form CSS classes
  const formClasses = cn(
    "healthcare-form",
    "space-y-4",
    {
      "healthcare-form--emergency": emergencyForm,
      "healthcare-form--patient-data": patientDataForm,
      "healthcare-form--submitting": isSubmitting,
      "healthcare-form--has-errors": contextValue.hasErrors,
    },
    className,
  );

  return (
    <HealthcareFormContext.Provider value={contextValue}>
      <form
        ref={mergedRef}
        onSubmit={handleSubmit}
        className={formClasses}
        id={formId}
        aria-label={
          ariaLabel ||
          (emergencyForm
            ? "Formulário de emergência médica"
            : "Formulário de dados de saúde")
        }
        aria-describedby={`${formId}-description`}
        data-sensitivity={dataSensitivity}
        data-emergency={emergencyForm}
        data-patient-data={patientDataForm}
        noValidate // We handle validation ourselves
        {...props}
      >
        {/* Form description for screen readers */}
        <div id={`${formId}-description`} className="sr-only">
          {emergencyForm && "Formulário para situações de emergência médica. "}
          {patientDataForm &&
            "Formulário contendo dados sensíveis do paciente. "}
          {requireConsent &&
            "Consentimento LGPD necessário para processamento. "}
          Navegue com Tab entre os campos. Use Ctrl+Shift+S para salvamento
          rápido.
        </div>

        {/* Emergency mode indicator */}
        {emergencyForm && accessibility.isEmergencyMode && (
          <div className="healthcare-emergency-indicator bg-destructive text-destructive-foreground p-3 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="Emergência">
                🚨
              </span>
              <span className="font-semibold">MODO DE EMERGÊNCIA ATIVO</span>
            </div>
            <p className="text-sm mt-1">
              Formulário otimizado para entrada rápida de dados críticos
            </p>
          </div>
        )}

        {/* Data sensitivity indicator */}
        {(dataSensitivity === DataSensitivity.RESTRICTED ||
          dataSensitivity === DataSensitivity.CONFIDENTIAL) && (
          <div className="healthcare-sensitivity-indicator border-l-4 border-warning bg-warning/10 p-3">
            <div className="flex items-center gap-2">
              <span role="img" aria-label="Dados sensíveis">
                🔒
              </span>
              <span className="font-semibold text-sm">
                {dataSensitivity === DataSensitivity.RESTRICTED
                  ? "DADOS ALTAMENTE SENSÍVEIS"
                  : "DADOS CONFIDENCIAIS"}
              </span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              Informações protegidas pela LGPD. Acesso controlado e auditado.
            </p>
          </div>
        )}

        {/* LGPD consent notice */}
        {requireConsent && !consentGiven && (
          <div className="healthcare-consent-notice bg-info/10 border border-info/20 p-4 rounded-md">
            <h3 className="font-semibold text-sm mb-2">
              Consentimento LGPD Necessário
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Para processar os dados deste formulário, precisamos do seu
              consentimento conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5"
                aria-describedby={`${formId}-consent-description`}
              />
              <span>
                Autorizo o processamento dos meus dados para os fins descritos
                neste formulário.
              </span>
            </label>
            <p
              id={`${formId}-consent-description`}
              className="text-xs text-muted-foreground mt-2"
            >
              Versão do consentimento: {consentVersion}. Você pode revogar este
              consentimento a qualquer momento.
            </p>
          </div>
        )}

        {/* Global form errors */}
        {(errors.submit || errors.consent || errors.emergency) && (
          <div className="healthcare-form-errors bg-destructive/10 border border-destructive/20 p-4 rounded-md">
            <h3 className="font-semibold text-sm text-destructive mb-2">
              Erros no formulário:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
              {errors.submit?.map((error, index) => (
                <li key={`submit-${index}`}>{error}</li>
              ))}
              {errors.consent?.map((error, index) => (
                <li key={`consent-${index}`}>{error}</li>
              ))}
              {errors.emergency?.map((error, index) => (
                <li key={`emergency-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {children}
      </form>
    </HealthcareFormContext.Provider>
  );
}

/**
 * Hook to use healthcare form context
 */
export function useHealthcareForm(): HealthcareFormContext {
  const context = useContext(HealthcareFormContext);

  if (!context) {
    throw new Error("useHealthcareForm must be used within a HealthcareForm");
  }

  return context;
}
