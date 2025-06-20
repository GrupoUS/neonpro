"use client";

import { GlassCheckbox, GlassInput } from "@/components/auth/glass-input";
import { SocialButtonsGroup } from "@/components/auth/social-buttons";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Lock, Mail, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({
    google: false,
    github: false,
    twitter: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: "",
  });

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "Weak",
    color: "bg-red-500",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;

    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordCriteria(criteria);

    const score = Object.values(criteria).filter(Boolean).length;

    let strength: PasswordStrength;
    if (score === 0) {
      strength = { score: 0, label: "Weak", color: "bg-red-500" };
    } else if (score <= 2) {
      strength = { score: 1, label: "Fair", color: "bg-orange-500" };
    } else if (score <= 4) {
      strength = { score: 2, label: "Good", color: "bg-yellow-500" };
    } else {
      strength = { score: 3, label: "Strong", color: "bg-green-500" };
    }

    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: "",
    };

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 2) {
      newErrors.password = "Password is too weak";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    router.push("/auth/verify-email");

    setLoading(false);
  };

  const handleSocialSignup = async (
    provider: "google" | "github" | "twitter"
  ) => {
    setSocialLoading({ ...socialLoading, [provider]: true });

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000));

    router.push("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">
          Create your account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get started with NeonPro today
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
        />

        <GlassInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div className="space-y-2">
          <GlassInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />

          {/* Password strength indicator */}
          {formData.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full transition-all",
                      passwordStrength.color
                    )}
                    animate={{ width: `${(passwordStrength.score + 1) * 25}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {passwordStrength.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(passwordCriteria).map(([key, met]) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-1 transition-colors",
                      met
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    )}
                  >
                    {met ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    <span>
                      {key === "length" && "8+ characters"}
                      {key === "uppercase" && "Uppercase"}
                      {key === "lowercase" && "Lowercase"}
                      {key === "number" && "Number"}
                      {key === "special" && "Special char"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <GlassInput
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          error={errors.confirmPassword}
          success={
            formData.confirmPassword !== "" &&
            formData.password === formData.confirmPassword
          }
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <div className="space-y-2">
          <GlassCheckbox
            label="I accept the terms and conditions"
            checked={formData.acceptTerms}
            onChange={(checked) =>
              setFormData({ ...formData, acceptTerms: checked })
            }
          />
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms}</p>
          )}
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Social Signup */}
      <SocialButtonsGroup
        onGoogleClick={() => handleSocialSignup("google")}
        onGithubClick={() => handleSocialSignup("github")}
        onTwitterClick={() => handleSocialSignup("twitter")}
        loading={socialLoading}
      />

      {/* Sign in link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
