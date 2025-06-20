"use client";

import { GlassCheckbox, GlassInput } from "@/components/auth/glass-input";
import { SocialButtonsGroup } from "@/components/auth/social-buttons";
import { TwoFactorInput, TwoFactorStatus } from "@/components/auth/two-factor";
import { NeonProLogo } from "@/components/ui/neonpro-logo";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
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
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        {/* Logo Container with Enhanced Styling */}
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative inline-block"
          >
            <NeonProLogo size="lg" animated={true} />
            {/* Subtle glow effect around logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-grupous-secondary/20 blur-xl opacity-50 -z-10" />
          </motion.div>
        </div>

        {/* Brand Identity */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-br from-grupous-primary via-primary to-grupous-secondary bg-clip-text text-transparent">
              NeonPro
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-base font-medium text-gray-600 dark:text-gray-400"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span>Bem-vindo de volta</span>
            <Shield className="w-4 h-4 text-primary" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed"
          >
            A plataforma profissional que revoluciona a gestão de projetos
          </motion.p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "credentials" ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Enhanced Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative"
            >
              {/* Enhanced glass card with better styling */}
              <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl shadow-black/10 dark:shadow-black/30">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-primary/5 dark:from-gray-800/20 dark:to-primary/10" />

                {/* Content */}
                <div className="relative p-8 space-y-6">
                  {/* Form Header */}
                  <div className="text-center space-y-3">
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
                    >
                      Entrar na sua conta
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="text-gray-600 dark:text-gray-400 text-sm"
                    >
                      Continue sua jornada profissional
                    </motion.p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <GlassInput
                        label="Seu email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        error={errors.email}
                        icon={<Mail className="w-4 h-4 text-primary" />}
                        autoComplete="email"
                        placeholder="exemplo@neonpro.com"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <GlassInput
                        label="Sua senha"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        error={errors.password}
                        icon={<Lock className="w-4 h-4 text-primary" />}
                        autoComplete="current-password"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </motion.div>

                    {/* Remember & Forgot */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center justify-between"
                    >
                      <GlassCheckbox
                        label="Lembrar de mim"
                        checked={formData.rememberMe}
                        onChange={(checked) =>
                          setFormData({ ...formData, rememberMe: checked })
                        }
                      />

                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                      >
                        Esqueceu a senha?
                      </Link>
                    </motion.div>

                    {/* Login Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={cn(
                          "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl",
                          "bg-gradient-to-r from-grupous-primary via-primary to-grupous-secondary",
                          "text-white font-semibold text-lg",
                          "shadow-[0_8px_30px_rgba(172,148,105,0.3)]",
                          "hover:shadow-[0_12px_40px_rgba(172,148,105,0.4)]",
                          "transition-all duration-300",
                          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                          "relative overflow-hidden group"
                        )}
                      >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Entrando...</span>
                          </>
                        ) : (
                          <>
                            <span>Entrar no NeonPro</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Social Login Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <SocialButtonsGroup
                onGoogleClick={() => handleSocialLogin("google")}
                onGithubClick={() => handleSocialLogin("github")}
                onTwitterClick={() => handleSocialLogin("twitter")}
                loading={socialLoading}
              />
            </motion.div>

            {/* Enhanced Sign up link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center space-y-4"
            >
              {/* Elegant divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-sm font-medium text-gray-500 dark:text-gray-400 rounded-full">
                    Novo no NeonPro?
                  </span>
                </div>
              </div>

              {/* Call to action */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-grupous-secondary/10 border border-primary/20 text-primary hover:text-primary/80 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar conta gratuita
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="two-factor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Back button */}
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => setStep("credentials")}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              ← Voltar ao login
            </motion.button>

            <div className="card-glass space-y-6">
              {/* 2FA Header */}
              <div className="text-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-grupous-secondary/20 blur-lg" />
                  <div className="relative bg-gradient-to-br from-primary to-grupous-secondary p-3 rounded-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Autenticação de Dois Fatores
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
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
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perdeu seu dispositivo?{" "}
                  <Link
                    href="/auth/recovery"
                    className="text-primary hover:text-primary/80 font-medium hover:underline"
                  >
                    Usar código de recuperação
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
