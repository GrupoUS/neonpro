/**
 * NeonPro - Accessible Form Components
 * WCAG 2.1 AA compliant form components with healthcare-specific patterns
 *
 * Features:
 * - ARIA attributes and screen reader support
 * - Keyboard navigation
 * - Form validation with accessible error handling
 * - Brazilian healthcare form patterns
 * - Integration with React Hook Form and Zod
 */

"use client";

import type { AlertTriangle, CheckCircle, Info } from "lucide-react";
import React, { forwardRef, type ReactNode, useEffect, useId, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { useTranslation } from "@/hooks/use-translation";
import type {
  announceToScreenReader,
  generateAriaId,
} from "@/lib/accessibility/accessibility-utils";
import type { cn } from "@/lib/utils";

// Form field props with accessibility features
interface AccessibleFieldProps {
  id?: string;
  name: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Accessible Form Field Wrapper
 * Provides consistent ARIA labeling and error handling
 */
export function AccessibleFormField({
  id,
  name,
  label,
  description,
  error,
  required = false,
  disabled = false,
  className,
  children,
}: AccessibleFieldProps) {
  const fieldId = id || useId();
  const labelId = generateAriaId("label");
  const descriptionId = description ? generateAriaId("desc") : undefined;
  const errorId = error ? generateAriaId("error") : undefined;

  const { t } = useTranslation();

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        id={labelId}
        htmlFor={fieldId}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {label}
        {required && <span className="sr-only">{t("common.required")}</span>}
      </Label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: fieldId,
              name,
              "aria-required": required,
              "aria-invalid": !!error,
              "aria-labelledby": labelId,
              "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
              disabled,
              className: cn(
                child.props.className,
                error && "border-destructive focus:ring-destructive",
              ),
            });
          }
          return child;
        })}
      </div>

      {error && (
        <Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Accessible Text Input
 * Enhanced input with healthcare-specific validation
 */
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  format?: "cpf" | "phone" | "cep" | "rg" | "default";
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, description, error, required, format = "default", onChange, ...props }, ref) => {
    const [value, setValue] = useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let formattedValue = e.target.value;

      // Apply Brazilian formatting
      switch (format) {
        case "cpf":
          formattedValue = formatCPF(formattedValue);
          break;
        case "phone":
          formattedValue = formatPhone(formattedValue);
          break;
        case "cep":
          formattedValue = formatCEP(formattedValue);
          break;
        case "rg":
          formattedValue = formatRG(formattedValue);
          break;
      }

      setValue(formattedValue);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formattedValue },
        };
        onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <AccessibleFormField
        name={props.name || ""}
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <Input ref={ref} value={value} onChange={handleChange} {...props} />
      </AccessibleFormField>
    );
  },
);

AccessibleInput.displayName = "AccessibleInput";

/**
 * Accessible Select Component
 * Enhanced select with keyboard navigation and screen reader support
 */
interface AccessibleSelectProps {
  name: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function AccessibleSelect({
  name,
  label,
  description,
  error,
  required,
  disabled,
  placeholder,
  options,
  value,
  onValueChange,
}: AccessibleSelectProps) {
  const { t } = useTranslation();

  return (
    <AccessibleFormField
      name={name}
      label={label}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn(error && "border-destructive focus:ring-destructive")}>
          <SelectValue placeholder={placeholder || t("common.select")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AccessibleFormField>
  );
}

/**
 * Accessible Textarea
 * Enhanced textarea with character counting and screen reader support
 */
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, description, error, required, maxLength, showCharCount, ...props }, ref) => {
    const [value, setValue] = useState(props.value?.toString() || "");
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const charCount = value.length;
    const isNearLimit = maxLength && charCount > maxLength * 0.8;

    return (
      <AccessibleFormField
        name={props.name || ""}
        label={label}
        description={description}
        error={error}
        required={required}
      >
        <Textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && maxLength && (
          <div
            className={cn(
              "text-xs text-muted-foreground text-right",
              isNearLimit && "text-warning",
              charCount >= maxLength && "text-destructive",
            )}
            aria-live="polite"
          >
            {charCount} / {maxLength}
          </div>
        )}
      </AccessibleFormField>
    );
  },
);

AccessibleTextarea.displayName = "AccessibleTextarea";

/**
 * Accessible Checkbox Group
 * Screen reader friendly checkbox group with fieldset/legend
 */
interface AccessibleCheckboxGroupProps {
  name: string;
  legend: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string[];
  onChange?: (value: string[]) => void;
}

export function AccessibleCheckboxGroup({
  name,
  legend,
  description,
  error,
  required,
  disabled,
  options,
  value = [],
  onChange,
}: AccessibleCheckboxGroupProps) {
  const fieldsetId = useId();
  const legendId = generateAriaId("legend");
  const descriptionId = description ? generateAriaId("desc") : undefined;
  const errorId = error ? generateAriaId("error") : undefined;

  const handleCheckedChange = (optionValue: string) => (checked: boolean) => {
    if (onChange) {
      const newValue = checked ? [...value, optionValue] : value.filter((v) => v !== optionValue);
      onChange(newValue);
    }
  };

  return (
    <fieldset
      id={fieldsetId}
      className="space-y-3"
      disabled={disabled}
      aria-labelledby={legendId}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend
        id={legendId}
        className={cn(
          "text-sm font-medium leading-none",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {legend}
      </legend>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="space-y-2">
        {options.map((option) => {
          const optionId = generateAriaId("checkbox");
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={optionId}
                name={`${name}[]`}
                value={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={handleCheckedChange(option.value)}
                disabled={disabled || option.disabled}
                aria-describedby={error ? errorId : undefined}
              />
              <Label htmlFor={optionId} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>

      {error && (
        <Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </fieldset>
  );
}

/**
 * Accessible Radio Group
 * Screen reader friendly radio group with fieldset/legend
 */
interface AccessibleRadioGroupProps {
  name: string;
  legend: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function AccessibleRadioGroup({
  name,
  legend,
  description,
  error,
  required,
  disabled,
  options,
  value,
  onValueChange,
}: AccessibleRadioGroupProps) {
  const fieldsetId = useId();
  const legendId = generateAriaId("legend");
  const descriptionId = description ? generateAriaId("desc") : undefined;
  const errorId = error ? generateAriaId("error") : undefined;

  return (
    <fieldset
      id={fieldsetId}
      className="space-y-3"
      disabled={disabled}
      aria-labelledby={legendId}
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
    >
      <legend
        id={legendId}
        className={cn(
          "text-sm font-medium leading-none",
          required && 'after:content-["*"] after:ml-1 after:text-destructive',
          error && "text-destructive",
        )}
      >
        {legend}
      </legend>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <RadioGroup
        name={name}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        className="space-y-2"
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((option) => {
          const optionId = generateAriaId("radio");
          return (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={disabled || option.disabled}
              />
              <Label htmlFor={optionId} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {error && (
        <Alert
          id={errorId}
          variant="destructive"
          className="py-2 px-3"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </fieldset>
  );
}

/**
 * Form Error Summary
 * WCAG compliant error summary for form validation
 */
interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
  className?: string;
}

export function FormErrorSummary({ errors, title, className }: FormErrorSummaryProps) {
  const { t } = useTranslation();
  const summaryId = useId();
  const titleId = generateAriaId("error-title");

  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) return null;

  // Announce errors to screen readers
  useEffect(() => {
    const message =
      errorCount === 1
        ? t("errors.validationError")
        : `${errorCount} erros encontrados no formulário`;
    announceToScreenReader(message, "assertive");
  }, [errors, errorCount, t]);

  return (
    <Alert
      id={summaryId}
      variant="destructive"
      className={cn("mb-6", className)}
      role="alert"
      tabIndex={-1}
    >
      <AlertTriangle className="h-4 w-4" />
      <div className="ml-2">
        <h2 id={titleId} className="text-sm font-medium text-destructive mb-2">
          {title ||
            (errorCount === 1 ? t("errors.validationError") : `${errorCount} erros encontrados`)}
        </h2>
        <ul className="space-y-1">
          {Object.entries(errors).map(([field, message]) => (
            <li key={field}>
              <button
                type="button"
                className="text-sm text-destructive underline hover:no-underline focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded"
                onClick={() => {
                  const element = document.getElementById(field);
                  element?.focus();
                  element?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {message}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Alert>
  );
}

/**
 * Success/Status Messages
 * Accessible success and status notifications
 */
interface StatusMessageProps {
  type: "success" | "info" | "warning" | "error";
  title?: string;
  message: string;
  className?: string;
}

export function StatusMessage({ type, title, message, className }: StatusMessageProps) {
  const iconMap = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: AlertTriangle,
  };

  const Icon = iconMap[type];

  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={cn("mb-4", className)}
      role="alert"
      aria-live="polite"
    >
      <Icon className="h-4 w-4" />
      <div className="ml-2">
        {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
        <AlertDescription className="text-sm">{message}</AlertDescription>
      </div>
    </Alert>
  );
}

/**
 * Brazilian formatting utilities
 */
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return value;
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return value;
}

function formatRG(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 9) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4");
  }
  return value;
}
