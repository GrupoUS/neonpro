import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

// Healthcare-optimized regex patterns for Brazilian formats (performance optimization)
const CPF_REGEX_1 = /(\d{3})(\d)/;
const CPF_REGEX_2 = /(\d{3})(\d)/;
const CPF_REGEX_3 = /(\d{3})(\d{1,2})/;
const PHONE_REGEX_1 = /(\d{2})(\d)/;
const PHONE_REGEX_2 = /(\d{4})(\d)/;
const PHONE_REGEX_3 = /(\d{5})(\d)/;
const DATE_REGEX_1 = /(\d{2})(\d)/;
const DATE_REGEX_2 = /(\d{2})(\d)/;

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
        warning: "border-yellow-500 focus-visible:ring-yellow-500",
      },
      size: {
        default: "h-10",
        sm: "h-9 px-2 py-1",
        lg: "h-11 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants>
{
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mask?: "cpf" | "phone" | "currency" | "date";
  loading?: boolean;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      mask,
      loading,
      disabled,
      value,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const generatedId = React.useId(); // Generate unique ID for accessibility
    const inputId = id || generatedId;

    React.useEffect(() => {
      setInternalValue(value || "");
    }, [value]);

    const applyMask = (inputValue: string, maskType?: string) => {
      if (!maskType) {
        return inputValue;
      }

      const cleaned = inputValue.replaceAll(/\D/g, "");

      switch (maskType) {
        case "cpf": {
          return cleaned
            .slice(0, 11)
            .replace(CPF_REGEX_1, "$1.$2")
            .replace(CPF_REGEX_2, "$1.$2")
            .replace(CPF_REGEX_3, "$1-$2");
        }

        case "phone": {
          if (cleaned.length <= 10) {
            return cleaned
              .replace(PHONE_REGEX_1, "($1) $2")
              .replace(PHONE_REGEX_2, "$1-$2");
          }
          return cleaned
            .slice(0, 11)
            .replace(PHONE_REGEX_1, "($1) $2")
            .replace(PHONE_REGEX_3, "$1-$2");
        }
        case "currency": {
          const numberValue = `${cleaned.slice(0, -2)}.${cleaned.slice(-2)}`;
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(numberValue) || 0);
        }

        case "date": {
          return cleaned
            .slice(0, 8)
            .replace(DATE_REGEX_1, "$1/$2")
            .replace(DATE_REGEX_2, "$1/$2");
        }

        default: {
          return inputValue;
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const maskedValue = applyMask(rawValue, mask);
      setInternalValue(maskedValue);

      if (onChange) {
        const event = { ...e, target: { ...e.target, value: maskedValue } };
        onChange(event);
      }
    };

    const inputVariantClass = variant === "error" && error ? "error" : variant;

    return (
      <div className="space-y-2">
        {label && (
          <label
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor={inputId}
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            className={cn(
              inputVariants({ variant: inputVariantClass, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              loading && "pr-10",
              className,
            )}
            disabled={disabled || loading}
            id={inputId}
            onChange={handleChange}
            ref={ref}
            type={type}
            value={internalValue}
            {...props}
          />

          {(rightIcon || loading) && (
            <div className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground">
              {loading
                ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )
                : rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        {helperText && !error && <p className="text-muted-foreground text-sm">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
