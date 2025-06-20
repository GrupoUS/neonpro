"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Key,
  Shield,
  Smartphone,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface TwoFactorInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  error?: string;
  loading?: boolean;
  className?: string;
}

export function TwoFactorInput({
  length = 6,
  onComplete,
  error,
  loading,
  className,
}: TwoFactorInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, length).split("");
      const newCode = [...code];
      pastedCode.forEach((digit, i) => {
        if (index + i < length) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);

      const lastFilledIndex = Math.min(
        index + pastedCode.length - 1,
        length - 1
      );
      inputRefs.current[lastFilledIndex]?.focus();

      if (newCode.every((digit) => digit !== "")) {
        onComplete?.(newCode.join(""));
      }
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to next input
      if (value !== "" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if complete
      if (newCode.every((digit) => digit !== "")) {
        onComplete?.(newCode.join(""));
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2 justify-center">
        {code.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(index, e.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className={cn(
                "w-12 h-14 text-center text-lg font-semibold",
                "bg-white/50 dark:bg-gray-900/50",
                "backdrop-blur-md border-2 rounded-xl",
                "transition-all duration-200",
                "focus:ring-2 focus:ring-primary/50",
                error ? "border-red-500/50" : "border-white/20",
                digit && "border-primary/50"
              )}
            />
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 text-center flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

interface TwoFactorStatusProps {
  enabled: boolean;
  method?: "sms" | "authenticator";
  phoneNumber?: string;
  className?: string;
}

export function TwoFactorStatus({
  enabled,
  method = "authenticator",
  phoneNumber,
  className,
}: TwoFactorStatusProps) {
  const Icon = method === "sms" ? Smartphone : Key;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-white/50 dark:bg-gray-900/50",
        "backdrop-blur-md border border-white/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            enabled ? "bg-green-500/20" : "bg-gray-500/20"
          )}
        >
          <Shield
            className={cn(
              "w-5 h-5",
              enabled ? "text-green-500" : "text-gray-500"
            )}
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Two-Factor Authentication
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {enabled ? "Enabled" : "Disabled"}
            {enabled && method === "sms" && phoneNumber && ` • ${phoneNumber}`}
          </p>
        </div>

        {enabled && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
    </motion.div>
  );
}

interface TwoFactorSetupProps {
  onMethodSelect?: (method: "sms" | "authenticator") => void;
  className?: string;
}

export function TwoFactorSetup({
  onMethodSelect,
  className,
}: TwoFactorSetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "sms" | "authenticator" | null
  >(null);

  const methods = [
    {
      id: "authenticator" as const,
      icon: Key,
      title: "Authenticator App",
      description: "Use an app like Google Authenticator or Authy",
      recommended: true,
    },
    {
      id: "sms" as const,
      icon: Smartphone,
      title: "SMS Text Message",
      description: "Receive codes via text message",
      recommended: false,
    },
  ];

  const handleSelect = (method: "sms" | "authenticator") => {
    setSelectedMethod(method);
    onMethodSelect?.(method);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-primary/10">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Secure Your Account
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add an extra layer of security to your account
        </p>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(method.id)}
            className={cn(
              "w-full p-4 rounded-xl text-left transition-all",
              "bg-glass-light/50 dark:bg-glass-dark/50",
              "backdrop-blur-md border-2",
              selectedMethod === method.id
                ? "border-primary/50 ring-2 ring-primary/20"
                : "border-white/20 hover:border-white/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <method.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {method.title}
                  </p>
                  {method.recommended && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {method.description}
                </p>
              </div>

              <AnimatePresence>
                {selectedMethod === method.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
