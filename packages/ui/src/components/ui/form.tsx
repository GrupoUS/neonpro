import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  Heart,
  Shield,
  User,
} from 'lucide-react';
import type * as React from 'react';
import { createContext, forwardRef, useContext, useId } from 'react';
import { cn } from '../../lib/utils';

const formVariants = cva(
  'space-y-6 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        medical:
          'border-l-4 border-l-primary bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-950/10',
        patient:
          'border-l-4 border-l-secondary bg-gradient-to-r from-green-50/20 to-transparent dark:from-green-950/10',
        sensitive:
          'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/20 to-transparent dark:from-orange-950/10',
        critical:
          'border-l-4 border-l-destructive bg-gradient-to-r from-red-50/20 to-transparent dark:from-red-950/10',
        simple: 'border-0 bg-transparent p-0 shadow-none',
      },
      spacing: {
        default: 'space-y-6',
        compact: 'space-y-4',
        spacious: 'space-y-8',
        tight: 'space-y-2',
      },
      lgpdLevel: {
        none: '',
        basic: 'ring-1 ring-green-200 dark:ring-green-800',
        enhanced: 'ring-2 ring-green-300 dark:ring-green-700',
        strict: 'shadow-lg ring-2 ring-green-500 dark:ring-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'default',
      lgpdLevel: 'basic',
    },
  }
);

// Healthcare form types
type HealthcareFormType =
  | 'patient-registration'
  | 'appointment-booking'
  | 'medical-history'
  | 'consent-form'
  | 'emergency-contact'
  | 'general';

interface FormContextValue {
  formId: string;
  formType: HealthcareFormType;
  lgpdCompliant: boolean;
  sensitiveData: boolean;
  validationLevel: 'basic' | 'strict' | 'medical';
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

interface FormProps
  extends React.ComponentProps<'form'>,
    VariantProps<typeof formVariants> {
  formType?: HealthcareFormType;
  lgpdCompliant?: boolean;
  sensitiveData?: boolean;
  validationLevel?: 'basic' | 'strict' | 'medical';
  showHeader?: boolean;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      className,
      variant = 'default',
      spacing = 'default',
      lgpdLevel = 'basic',
      formType = 'general',
      lgpdCompliant = true,
      sensitiveData = false,
      validationLevel = 'basic',
      showHeader = true,
      title,
      description,
      icon,
      onValidationChange,
      children,
      ...props
    },
    ref
  ) => {
    const formId = useId();

    // Auto-determine variant based on form type
    const autoVariant =
      variant === 'default'
        ? formType === 'patient-registration'
          ? 'patient'
          : formType === 'medical-history'
            ? 'medical'
            : formType === 'consent-form'
              ? 'sensitive'
              : formType === 'appointment-booking'
                ? 'medical'
                : 'default'
        : variant;

    // Auto-set LGPD level based on sensitivity
    const autoLgpdLevel = sensitiveData ? 'strict' : lgpdLevel;

    const contextValue: FormContextValue = {
      formId,
      formType,
      lgpdCompliant,
      sensitiveData,
      validationLevel,
    };

    const getFormIcon = () => {
      if (icon) return icon;

      switch (formType) {
        case 'patient-registration':
          return <User className="h-5 w-5" />;
        case 'appointment-booking':
          return <Calendar className="h-5 w-5" />;
        case 'medical-history':
          return <Heart className="h-5 w-5" />;
        case 'consent-form':
          return <Shield className="h-5 w-5" />;
        case 'emergency-contact':
          return <AlertCircle className="h-5 w-5" />;
        default:
          return <FileText className="h-5 w-5" />;
      }
    };

    const getFormTitle = () => {
      if (title) return title;

      switch (formType) {
        case 'patient-registration':
          return 'Cadastro de Paciente';
        case 'appointment-booking':
          return 'Agendamento de Consulta';
        case 'medical-history':
          return 'Histórico Médico';
        case 'consent-form':
          return 'Termo de Consentimento';
        case 'emergency-contact':
          return 'Contato de Emergência';
        default:
          return 'Formulário';
      }
    };

    return (
      <FormContext.Provider value={contextValue}>
        <form
          className={cn(
            formVariants({
              variant: autoVariant,
              spacing,
              lgpdLevel: autoLgpdLevel,
            }),
            className
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
          {showHeader && (
            <div className="form-header border-border/50 border-b pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {getFormIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {getFormTitle()}
                  </h3>
                  {description && (
                    <p className="mt-1 text-muted-foreground text-sm">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {lgpdCompliant && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50/50 px-3 py-2 text-muted-foreground text-xs dark:bg-green-950/20">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span>
                    {sensitiveData
                      ? 'Dados sensíveis protegidos pela LGPD com nível de segurança máximo'
                      : 'Formulário em conformidade com a LGPD'}
                  </span>
                  <CheckCircle className="ml-auto h-3 w-3 text-green-600" />
                </div>
              )}
            </div>
          )}

          <div className="form-content">{children}</div>
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';

// Form Section Component for organizing form content
interface FormSectionProps extends React.ComponentProps<'div'> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  (
    { className, title, description, icon, required, children, ...props },
    ref
  ) => {
    return (
      <div
        className={cn(
          'form-section space-y-4 border-border/30 border-b pb-6 last:border-b-0 last:pb-0',
          className
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
  }
);

FormSection.displayName = 'FormSection';

export {
  Form,
  FormSection,
  formVariants,
  useFormContext,
  type FormProps,
  type FormSectionProps,
  type HealthcareFormType,
  type FormContextValue,
};
