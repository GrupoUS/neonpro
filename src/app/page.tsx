"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Command,
  Database,
  Globe,
  Layers,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Next.js 15 PPR for blazing performance",
      gradient: "from-yellow-400 via-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption & authentication",
      gradient: "from-blue-400 via-purple-500 to-pink-500",
    },
    {
      icon: Database,
      title: "Powerful Database",
      description: "Drizzle ORM with Supabase Postgres",
      gradient: "from-green-400 via-teal-500 to-blue-500",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Built-in AI capabilities for smart features",
      gradient: "from-purple-400 via-pink-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Edge runtime for worldwide deployment",
      gradient: "from-cyan-400 via-blue-500 to-indigo-500",
    },
    {
      icon: Layers,
      title: "Modular Design",
      description: "Component-based architecture",
      gradient: "from-pink-400 via-purple-500 to-indigo-500",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime SLA", icon: TrendingUp },
    { value: "50ms", label: "Avg Response", icon: Zap },
    { value: "10k+", label: "Active Users", icon: Users },
    { value: "4.9/5", label: "User Rating", icon: Star },
  ];

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-primary/30 to-grupous-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-l from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-grupous-secondary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">
                  NEONPRO
                </span>
              </motion.div>

              <div className="hidden md:flex items-center gap-6">
                {["Features", "Pricing", "Docs", "Blog"].map((item, i) => (
                  <motion.a
                    key={item}
                    href="#"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden md:block px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-grupous-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/25"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-8"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">
              Trusted by 10,000+ developers worldwide
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="block text-white mb-2">Build Faster.</span>
            <span className="block gradient-text">Ship Smarter.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            The ultimate Next.js 15 boilerplate with enterprise-grade features.
            PPR, Drizzle ORM, Supabase, and stunning UI components out of the
            box.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-primary to-grupous-secondary text-white rounded-xl font-medium shadow-xl shadow-primary/25 flex items-center gap-2"
              >
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass-strong text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              View Demo
            </motion.button>
          </div>

          {/* Quick Start Command */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 glass-subtle rounded-xl"
          >
            <Command className="w-5 h-5 text-gray-400" />
            <code className="text-sm text-gray-300">
              npx create-neonpro-app my-app
            </code>
            <button className="ml-2 text-primary hover:text-primary/80 transition-colors">
              Copy
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-strong rounded-2xl p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Production-ready features to accelerate your development
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-2xl glass-subtle p-8 hover:bg-white/5 transition-all"
              >
                {/* Gradient Background */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                    "bg-gradient-to-br",
                    feature.gradient
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl mb-4 flex items-center justify-center",
                    "bg-gradient-to-br",
                    feature.gradient
                  )}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>

                {/* Hover Arrow */}
                <ArrowRight className="absolute bottom-8 right-8 w-5 h-5 text-gray-600 group-hover:text-primary transition-colors transform translate-x-10 group-hover:translate-x-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative overflow-hidden rounded-3xl glass-strong p-12">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-grupous-secondary/20" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to accelerate your development?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers building the future with NEONPRO.
                Start your project in minutes, not days.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-gray-900 rounded-xl font-medium shadow-xl hover:bg-gray-100 transition-colors"
                  >
                    Start Free Trial
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass-subtle text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Schedule Demo
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
                <span className="text-sm text-gray-400">
                  Trusted by teams at
                </span>
                <span className="text-white font-medium">Microsoft</span>
                <span className="text-white font-medium">Google</span>
                <span className="text-white font-medium">Meta</span>
                <span className="text-white font-medium">Amazon</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-gray-400">
              © 2024 NEONPRO. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
