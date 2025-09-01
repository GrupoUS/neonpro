import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { forwardRef, useState } from "react";
import { useResponsive } from "./ResponsiveLayout";

// Touch-optimized button with healthcare context awareness
interface TouchButtonProps extends React.ComponentProps<typeof Button> {
  priority?: "normal" | "emergency" | "critical";
  hapticFeedback?: boolean;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, priority = "normal", hapticFeedback = true, onClick, children, ...props }, ref) => {
    const { healthcareContext, touchOptimized } = useResponsive();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for supported devices
      if (hapticFeedback && "vibrate" in navigator) {
        const pattern = priority === "critical"
          ? [100, 50, 100]
          : priority === "emergency"
          ? [80]
          : [40];
        navigator.vibrate(pattern);
      }

      onClick?.(e);
    };

    const buttonClass = cn(
      "touch-target",
      priority === "emergency" && "touch-target--emergency",
      priority === "critical" && "touch-target--critical",
      healthcareContext === "post-procedure" && "text-lg font-semibold",
      healthcareContext === "one-handed" && "min-h-12 mb-4",
      className,
    );

    return (
      <Button
        ref={ref}
        className={buttonClass}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

TouchButton.displayName = "TouchButton";

// Touch-optimized input with enhanced targets
interface TouchInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
  ({ className, label, helperText, required, id, ...props }, ref) => {
    const { healthcareContext, touchOptimized } = useResponsive();
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    const inputClass = cn(
      "touch-target",
      healthcareContext === "post-procedure" && "text-lg h-14",
      healthcareContext === "high-contrast" && "border-2",
      touchOptimized && "min-h-11",
      className,
    );

    return (
      <div className="touch-input-group">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "touch-input-label",
              healthcareContext === "post-procedure" && "text-lg font-medium",
              required && 'after:content-["*"] after:text-red-500 after:ml-1',
            )}
          >
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={inputClass}
          aria-describedby={helperText ? `${inputId}-help` : undefined}
          {...props}
        />
        {helperText && (
          <p
            id={`${inputId}-help`}
            className="text-sm text-muted-foreground mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TouchInput.displayName = "TouchInput";

// Touch-optimized textarea
interface TouchTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  helperText?: string;
  required?: boolean;
}

export const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(
  ({ className, label, helperText, required, id, ...props }, ref) => {
    const { healthcareContext, touchOptimized } = useResponsive();
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    const textareaClass = cn(
      "touch-target",
      healthcareContext === "post-procedure" && "text-lg",
      healthcareContext === "high-contrast" && "border-2",
      "min-h-24",
      className,
    );

    return (
      <div className="touch-textarea-group">
        {label && (
          <Label
            htmlFor={textareaId}
            className={cn(
              "touch-textarea-label",
              healthcareContext === "post-procedure" && "text-lg font-medium",
              required && 'after:content-["*"] after:text-red-500 after:ml-1',
            )}
          >
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={textareaId}
          className={textareaClass}
          aria-describedby={helperText ? `${textareaId}-help` : undefined}
          {...props}
        />
        {helperText && (
          <p
            id={`${textareaId}-help`}
            className="text-sm text-muted-foreground mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TouchTextarea.displayName = "TouchTextarea";

// Touch-optimized select/dropdown
interface TouchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TouchSelectProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  options: TouchSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function TouchSelect({
  label,
  helperText,
  required,
  options,
  value,
  onValueChange,
  placeholder,
  className,
  id,
}: TouchSelectProps) {
  const { healthcareContext, touchOptimized } = useResponsive();
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

  const selectClass = cn(
    "touch-target w-full p-3 border rounded-md bg-background",
    healthcareContext === "post-procedure" && "text-lg h-14",
    healthcareContext === "high-contrast" && "border-2",
    className,
  );

  return (
    <div className="touch-select-group">
      {label && (
        <Label
          htmlFor={selectId}
          className={cn(
            "touch-select-label",
            healthcareContext === "post-procedure" && "text-lg font-medium",
            required && 'after:content-["*"] after:text-red-500 after:ml-1',
          )}
        >
          {label}
        </Label>
      )}
      <select
        id={selectId}
        className={selectClass}
        value={value || ""}
        onChange={(e) => onValueChange?.(e.target.value)}
        aria-describedby={helperText ? `${selectId}-help` : undefined}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p
          id={`${selectId}-help`}
          className="text-sm text-muted-foreground mt-1"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

// Touch-optimized checkbox with enhanced target area
interface TouchCheckboxProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  helperText?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export function TouchCheckbox({
  label,
  checked = false,
  onCheckedChange,
  helperText,
  required,
  className,
  id,
}: TouchCheckboxProps) {
  const { healthcareContext } = useResponsive();
  const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

  const containerClass = cn(
    "touch-checkbox-container touch-target flex items-start gap-3 p-3 rounded-md cursor-pointer",
    "hover:bg-muted/50 transition-colors",
    checked && "bg-primary/5",
    className,
  );

  const checkboxClass = cn(
    "w-5 h-5 mt-0.5 flex-shrink-0",
    healthcareContext === "post-procedure" && "w-6 h-6",
  );

  return (
    <div className="touch-checkbox-group">
      <label htmlFor={checkboxId} className={containerClass}>
        <input
          type="checkbox"
          id={checkboxId}
          className={checkboxClass}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          aria-describedby={helperText ? `${checkboxId}-help` : undefined}
        />
        <div className="flex-1">
          <span
            className={cn(
              "font-medium",
              healthcareContext === "post-procedure" && "text-lg",
              required && 'after:content-["*"] after:text-red-500 after:ml-1',
            )}
          >
            {label}
          </span>
          {helperText && (
            <p
              id={`${checkboxId}-help`}
              className="text-sm text-muted-foreground mt-1"
            >
              {helperText}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}

// Touch-optimized radio group
interface TouchRadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

interface TouchRadioGroupProps {
  label?: string;
  options: TouchRadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  className?: string;
  name?: string;
}

export function TouchRadioGroup({
  label,
  options,
  value,
  onValueChange,
  required,
  className,
  name,
}: TouchRadioGroupProps) {
  const { healthcareContext } = useResponsive();
  const groupName = name || `radio-group-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={cn("touch-radio-group", className)}>
      {label && (
        <div
          className={cn(
            "touch-radio-group-label font-medium mb-3",
            healthcareContext === "post-procedure" && "text-lg",
            required && 'after:content-["*"] after:text-red-500 after:ml-1',
          )}
          role="group"
          aria-label={label}
        >
          {label}
        </div>
      )}
      <div className="space-y-2">
        {options.map((option) => {
          const radioId = `${groupName}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={radioId}
              className={cn(
                "touch-radio-option touch-target flex items-start gap-3 p-3 rounded-md cursor-pointer",
                "hover:bg-muted/50 transition-colors",
                value === option.value && "bg-primary/5",
                option.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <input
                type="radio"
                id={radioId}
                name={groupName}
                value={option.value}
                checked={value === option.value}
                onChange={() => onValueChange?.(option.value)}
                disabled={option.disabled}
                className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  healthcareContext === "post-procedure" && "w-5 h-5",
                )}
              />
              <div className="flex-1">
                <span
                  className={cn(
                    "font-medium",
                    healthcareContext === "post-procedure" && "text-lg",
                  )}
                >
                  {option.label}
                </span>
                {option.helperText && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.helperText}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default {
  TouchButton,
  TouchInput,
  TouchTextarea,
  TouchSelect,
  TouchCheckbox,
  TouchRadioGroup,
};
