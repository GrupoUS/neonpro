"use client";

import { GlassCheckbox, GlassInput } from "@/components/auth/glass-input";
import { SocialButtonsGroup } from "@/components/auth/social-buttons";
import { TwoFactorInput, TwoFactorStatus } from "@/components/auth/two-factor";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "two-factor">("credentials");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    github: false,
    twitter: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    twoFactor: "",
  });

  const [twoFactorEnabled] = useState(false); // This would come from user data

  const validateForm = () => {
    const newErrors = { email: "", password: "", twoFactor: "" };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (twoFactorEnabled) {
      setStep("two-factor");
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  const handleTwoFactorComplete = async (code: string) => {
    setLoading(true);

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (code === "123456") {
      router.push("/dashboard");
    } else {
      setErrors({ ...errors, twoFactor: "Invalid code. Please try again." });
    }

    setLoading(false);
  };

  const handleSocialLogin = async (
    provider: "google" | "github" | "twitter"
  ) => {
    setSocialLoading({ ...socialLoading, [provider]: true });

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));

    router.push("/dashboard");
  };

  return (
    <AnimatePresence mode="wait">
      {step === "credentials" ? (
        <motion.div
          key="credentials"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="w-full space-y-6"
        >
          {/* Logo */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold gradient-text">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to continue to NeonPro
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <GlassInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <GlassCheckbox
                label="Remember me"
                checked={formData.rememberMe}
                onChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked })
                }
              />

              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                "bg-gradient-to-r from-primary to-grupous-secondary",
                "text-white font-medium",
                "hover:opacity-90 transition-opacity",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Social Login */}
          <SocialButtonsGroup
            onGoogleClick={() => handleSocialLogin("google")}
            onGithubClick={() => handleSocialLogin("github")}
            onTwitterClick={() => handleSocialLogin("twitter")}
            loading={socialLoading}
          />

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="two-factor"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full space-y-6"
        >
          {/* Back button */}
          <button
            onClick={() => setStep("credentials")}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to login
          </button>

          {/* 2FA Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* 2FA Status */}
          <TwoFactorStatus enabled={true} method="authenticator" />

          {/* 2FA Input */}
          <TwoFactorInput
            onComplete={handleTwoFactorComplete}
            error={errors.twoFactor}
            loading={loading}
          />

          {/* Help text */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Lost your device?{" "}
            <Link
              href="/auth/recovery"
              className="text-primary hover:underline"
            >
              Use recovery code
            </Link>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
