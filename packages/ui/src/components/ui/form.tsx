import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  Shield,
  User,
} from "lucide-react";
import type * as React from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useState,
} from "react";
import { cn } from "../../lib/utils";
import { FormInstruction, LGPDNotice, VisuallyHidden } from "./visually-hidden";

const formVariants = cva(
  "space-y-6 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        medical:
          "border-l-4 border-l-primary bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-950/10",
        patient:
          "border-l-4 border-l-secondary bg-gradient-to-r from-green-50/20 to-transparent dark:from-green-950/10",
        sensitive:
          "border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/20 to-transparent dark:from-orange-950/10",
        critical:
          "border-l-4 border-l-destructive bg-gradient-to-r from-red-50/20 to-transparent dark:from-red-950/10",
        simple: "border-0 bg-transparent p-0 shadow-none",
      },
      spacing: {
        default: "space-y-6",
        compact: "space-y-4",
        spacious: "space-y-8",
        tight: "space-y-2",
      },
      lgpdLevel: {
        none: "",
        basic: "ring-1 ring-green-200 dark:ring-green-800",
        enhanced: "ring-2 ring-green-300 dark:ring-green-700",
        strict: "shadow-lg ring-2 ring-green-500 dark:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "default",
      lgpdLevel: "basic",
    },
  },
);

// Healthcare form types
type HealthcareFormType =
  | "patient-registration"
  | "appointment-booking"
  | "medical-history"
  | "consent-form"
  | "emergency-contact"
  | "general";

interface FormContextValue {
  formId: string;
  formType: HealthcareFormType;
  lgpdCompliant: boolean;
  sensitiveData: boolean;
  validationLevel: "basic" | "strict" | "medical";
  // Enhanced accessibility features
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  announceToScreenReader: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void;
  currentStep?: number;
  totalSteps?: number;
}

const FormContext = createContext<FormContextValue | null>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form component");
  }
  return context;
};

interface FormProps
  extends React.ComponentProps<"form">,
    VariantProps<typeof formVariants> {
  formType?: HealthcareFormType;
  lgpdCompliant?: boolean;
  sensitiveData?: boolean;
  validationLevel?: "basic" | "strict" | "medical";
  showHeader?: boolean;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  // Enhanced accessibility props
  currentStep?: number;
  totalSteps?: number;
  stepTitle?: string;
  required?: boolean;
  instructions?: string;
  errorSummary?: boolean;
  liveValidation?: boolean;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      className,
      variant = "default",
      spacing = "default",
      lgpdLevel = "basic",
      formType = "general",
      lgpdCompliant = true,
      sensitiveData = false,
      validationLevel = "basic",
      showHeader = true,
      title,
      description,
      icon,
      onValidationChange,
      currentStep,
      totalSteps,
      stepTitle,
      required = false,
      instructions,
      errorSummary = true,
      liveValidation = true,
      children,
      ...props
    },
    ref,
  ) => {
    const formId = useId();

    // Enhanced state management for accessibility
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [announcements, setAnnouncements] = useState<string>("");

    // Screen reader announcement function
    const announceToScreenReader = useCallback(
      (message: string, _priority: "polite" | "assertive" = "polite") => {
        setAnnouncements(message);

        // Clear announcement after screen reader processes it
        setTimeout(() => setAnnouncements(""), 3000);
      },
      [],
    );

    // Auto-determine variant based on form type
    const autoVariant =
      variant === "default"
        ? formType === "patient-registration"
          ? "patient"
          : formType === "medical-history"
            ? "medical"
            : formType === "consent-form"
              ? "sensitive"
              : formType === "appointment-booking"
                ? "medical"
                : "default"
        : variant;

    // Auto-set LGPD level based on sensitivity
    const autoLgpdLevel = sensitiveData ? "strict" : lgpdLevel;

    const contextValue: FormContextValue = {
      formId,
      formType,
      lgpdCompliant,
      sensitiveData,
      validationLevel,
      errors,
      setErrors,
      announceToScreenReader,
      currentStep,
      totalSteps,
    };

    const getFormIcon = () => {
      if (icon) {
        return icon;
      }

      switch (formType) {
        case "patient-registration": {
          return <User className="h-5 w-5" />;
        }
        case "appointment-booking": {
          return <Calendar className="h-5 w-5" />;
        }
        case "medical-history": {
          return <Heart className="h-5 w-5" />;
        }
        case "consent-form": {
          return <Shield className="h-5 w-5" />;
        }
        case "emergency-contact": {
          return <AlertCircle className="h-5 w-5" />;
        }
        default: {
          return <FileText className="h-5 w-5" />;
        }
      }
    };

    const getFormTitle = () => {
      if (title) {
        return title;
      }

      switch (formType) {
        case "patient-registration": {
          return "Cadastro de Paciente";
        }
        case "appointment-booking": {
          return "Agendamento de Consulta";
        }
        case "medical-history": {
          return "Histórico Médico";
        }
        case "consent-form": {
          return "Termo de Consentimento";
        }
        case "emergency-contact": {
          return "Contato de Emergência";
        }
        default: {
          return "Formulário";
        }
      }
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          aria-describedby={`${formId}-description ${
            instructions ? `${formId}-instructions` : ""
          } ${lgpdCompliant ? `${formId}-lgpd` : ""}`.trim()}
          aria-labelledby={showHeader ? `${formId}-title` : undefined}
          aria-live={liveValidation ? "polite" : undefined}
          aria-required={required}
          className={cn(
            formVariants({
              variant: autoVariant,
              spacing,
              lgpdLevel: autoLgpdLevel,
            }),
            className,
          )}
          data-form-type={formType}
          data-lgpd-compliant={lgpdCompliant}
          data-sensitive={sensitiveData}
          data-validation-level={validationLevel}
          id={formId}
          noValidate
          ref={ref}
          {...props}
        >
          {/* Screen reader announcements for form state changes */}
          <VisuallyHidden aria-atomic="true" aria-live="polite" role="status">
            {announcements}
          </VisuallyHidden>

          {/* Multi-step form progress indicator */}
          {totalSteps && currentStep && (
            <div
              aria-valuemax={totalSteps}
              aria-valuemin={1}
              aria-valuenow={currentStep}
              className="form-progress mb-4"
              role="progressbar"
            >
              <VisuallyHidden>
                Etapa {currentStep} de {totalSteps}:{" "}
                {stepTitle || getFormTitle()}
              </VisuallyHidden>
              <div className="mb-2 flex items-center justify-between text-muted-foreground text-sm">
                <span>
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span>
                  {Math.round((currentStep / totalSteps) * 100)}% concluído
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              {stepTitle && (
                <div className="mt-2 font-medium text-foreground">
                  {stepTitle}
                </div>
              )}
            </div>
          )}

          {/* Form instructions */}
          {instructions && (
            <>
              <div
                className="mb-4 rounded-md bg-muted/50 p-3"
                id={`${formId}-instructions`}
              >
                <p className="text-muted-foreground text-sm">{instructions}</p>
              </div>
              <FormInstruction fieldId={formId} instruction={instructions} />
            </>
          )}

          {/* Error summary for accessibility */}
          {errorSummary && Object.keys(errors).length > 0 && (
            <div
              aria-labelledby={`${formId}-error-summary-title`}
              className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-4"
              role="alert"
            >
              <h3
                className="mb-2 flex items-center gap-2 font-medium text-destructive"
                id={`${formId}-error-summary-title`}
              >
                <AlertCircle className="h-4 w-4" />
                Erros encontrados no formulário
              </h3>
              <ul className="space-y-1 text-destructive text-sm">
                {Object.entries(errors).map(([fieldId, error]) => (
                  <li key={fieldId}>
                    <a
                      className="rounded underline hover:no-underline focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                      href={`#${fieldId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(fieldId)?.focus();
                      }}
                    >
                      {error}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showHeader && (
            <div className="form-header border-border/50 border-b pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="rounded-lg bg-primary/10 p-2 text-primary"
                >
                  {getFormIcon()}
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-foreground text-lg"
                    id={`${formId}-title`}
                  >
                    {getFormTitle()}
                    {required && (
                      <span
                        aria-label="obrigatório"
                        className="ml-1 text-destructive"
                      >
                        *
                      </span>
                    )}
                  </h3>
                  {description && (
                    <p
                      className="mt-1 text-muted-foreground text-sm"
                      id={`${formId}-description`}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {lgpdCompliant && (
                <>
                  <div
                    aria-label="Informações de conformidade LGPD"
                    className="mt-3 flex items-center gap-2 rounded-lg bg-green-50/50 px-3 py-2 text-muted-foreground text-xs dark:bg-green-950/20"
                    id={`${formId}-lgpd`}
                    role="region"
                  >
                    <Shield
                      aria-hidden="true"
                      className="h-3 w-3 text-green-600"
                    />
                    <span>
                      {sensitiveData
                        ? "Dados sensíveis protegidos pela LGPD com nível de segurança máximo"
                        : "Formulário em conformidade com a LGPD"}
                    </span>
                    <CheckCircle
                      aria-hidden="true"
                      className="ml-auto h-3 w-3 text-green-600"
                    />
                  </div>

                  {/* Hidden LGPD notice for screen readers */}
                  <LGPDNotice
                    context={sensitiveData ? "processing" : "collection"}
                    notice={
                      sensitiveData
                        ? "Este formulário processa dados sensíveis com proteções LGPD máximas. Seus dados são criptografados e processados com consentimento explícito."
                        : "Este formulário coleta dados pessoais em conformidade total com a LGPD. Você pode exercer seus direitos a qualquer momento."
                    }
                  />
                </>
              )}
            </div>
          )}

          <div className="form-content">{children}</div>
        </form>
      </FormContext.Provider>
    );
  },
);

Form.displayName = "Form";

// Form Section Component for organizing form content
interface FormSectionProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  (
    { className, title, description, icon, required, children, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "form-section space-y-4 border-border/30 border-b pb-6 last:border-b-0 last:pb-0",
          className,
        )}
        ref={ref}
        {...props}
      >
        {(title || description) && (
          <div className="form-section-header">
            <div className="mb-2 flex items-center gap-2">
              {icon && <div className="text-primary">{icon}</div>}
              {title && (
                <h4 className="flex items-center gap-1 font-medium text-base text-foreground">
                  {title}
                  {required && (
                    <span
                      aria-label="obrigatório"
                      className="text-destructive text-sm"
                    >
                      *
                    </span>
                  )}
                </h4>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        )}
        <div className="form-section-content space-y-4">{children}</div>
      </div>
    );
  },
);

FormSection.displayName = "FormSection";

// Additional Form Field Components for React Hook Form integration
const FormField = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { name: string }
>(({ className, name, children, ...props }, ref) => {
  return (
    <div className={cn("space-y-2", className)} ref={ref} {...props}>
      {children}
    </div>
  );
});
FormField.displayName = "FormField";

const FormItem = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className={cn("space-y-2", className)} ref={ref} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      ref={ref}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      className={cn("font-medium text-destructive text-sm", className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  type FormContextValue,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  type FormProps,
  FormSection,
  type FormSectionProps,
  formVariants,
  type HealthcareFormType,
};
