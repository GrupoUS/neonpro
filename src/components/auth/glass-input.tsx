"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import React, { useRef, useState } from "react";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  onIconClick?: () => void;
}

export function GlassInput({
  label,
  error,
  success,
  icon,
  onIconClick,
  className,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPassword = type === "password";
  const hasValue = value && String(value).length > 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("relative", className)}>
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-glass-light/50 dark:bg-glass-dark/50",
          "backdrop-blur-md",
          "transition-all duration-200",
          error && "ring-2 ring-red-500/50",
          success && "ring-2 ring-green-500/50",
          isFocused && !error && !success && "ring-2 ring-primary/50"
        )}
      >
        {/* Glow effect */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-grupous-secondary/10"
            />
          )}
        </AnimatePresence>

        {/* Input container */}
        <div className="relative flex items-center">
          {/* Icon */}
          {icon && <div className="absolute left-4 text-gray-400">{icon}</div>}

          {/* Input */}
          <input
            ref={inputRef}
            type={isPassword && !showPassword ? "password" : "text"}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "px-4 pt-6 pb-2",
              "text-gray-900 dark:text-white",
              "placeholder-transparent",
              icon && "pl-12",
              isPassword && "pr-12"
            )}
            placeholder={label}
            {...props}
          />

          {/* Floating label */}
          <motion.label
            animate={{
              top: hasValue || isFocused ? "0.5rem" : "1.25rem",
              fontSize: hasValue || isFocused ? "0.75rem" : "0.875rem",
              color: isFocused
                ? "rgb(var(--primary))"
                : error
                ? "#ef4444"
                : "#9ca3af",
            }}
            className={cn(
              "absolute pointer-events-none",
              "transition-all duration-200",
              icon ? "left-12" : "left-4"
            )}
          >
            {label}
          </motion.label>

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Success/Error icon */}
          {(error || success) && !isPassword && (
            <div className="absolute right-4">
              {error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Checkbox component
interface GlassCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function GlassCheckbox({
  label,
  checked = false,
  onChange,
  className,
}: GlassCheckboxProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          animate={{
            backgroundColor: checked ? "rgb(var(--primary))" : "transparent",
            borderColor: checked ? "rgb(var(--primary))" : "rgb(156, 163, 175)",
          }}
          className={cn(
            "w-5 h-5 rounded border-2 transition-colors",
            "flex items-center justify-center",
            "bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}
