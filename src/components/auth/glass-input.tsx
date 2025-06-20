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
    <div className={cn("relative group", className)}>
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-300",
          "bg-white/60 dark:bg-gray-900/60 backdrop-blur-md",
          "border border-white/30 dark:border-gray-700/30",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          error && "ring-2 ring-red-500/50 border-red-500/30",
          success && "ring-2 ring-green-500/50 border-green-500/30",
          isFocused &&
            !error &&
            !success &&
            "ring-2 ring-primary/50 border-primary/30",
          "group-hover:shadow-xl group-hover:shadow-black/10 dark:group-hover:shadow-black/30"
        )}
      >
        {/* Gradient background on focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-grupous-secondary/5"
            />
          )}
        </AnimatePresence>

        {/* Input container */}
        <div className="relative flex items-center">
          {/* Icon */}
          {icon && (
            <motion.div
              className="absolute left-4 z-10"
              animate={{
                color: isFocused ? "rgb(172, 148, 105)" : "rgb(156, 163, 175)",
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

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
              "px-4 pt-7 pb-3 text-base",
              "text-gray-900 dark:text-white",
              "placeholder-transparent",
              "transition-all duration-200",
              icon && "pl-12",
              (isPassword || success || error) && "pr-12"
            )}
            placeholder={label}
            {...props}
          />

          {/* Floating label */}
          <motion.label
            animate={{
              top: hasValue || isFocused ? "0.75rem" : "1.75rem",
              fontSize: hasValue || isFocused ? "0.75rem" : "1rem",
              color: isFocused
                ? "rgb(172, 148, 105)"
                : error
                ? "#ef4444"
                : success
                ? "#10b981"
                : "#6b7280",
              fontWeight: hasValue || isFocused ? "500" : "400",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute pointer-events-none z-10",
              "transition-all duration-200",
              icon ? "left-12" : "left-4"
            )}
          >
            {label}
          </motion.label>

          {/* Password toggle */}
          {isPassword && (
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-4 p-1 text-gray-400 hover:text-primary dark:hover:text-primary transition-colors z-10"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </motion.button>
          )}

          {/* Success/Error icon */}
          {(error || success) && !isPassword && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 z-10"
            >
              {error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </motion.div>
          )}
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Checkbox component
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
    <motion.label
      className={cn("flex items-center gap-3 cursor-pointer group", className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          animate={{
            backgroundColor: checked
              ? "rgb(172, 148, 105)"
              : "rgba(255, 255, 255, 0.1)",
            borderColor: checked ? "rgb(172, 148, 105)" : "rgb(156, 163, 175)",
            scale: checked ? 1.05 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200",
            "flex items-center justify-center",
            "backdrop-blur-sm shadow-sm",
            "group-hover:shadow-md group-hover:border-primary/60"
          )}
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
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

        {/* Subtle glow when checked */}
        {checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-md bg-primary/20 blur-sm -z-10"
          />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.label>
  );
}
