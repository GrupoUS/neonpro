"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Stethoscope, Shield } from "lucide-react";
import { Card, CardContent, Progress } from "@neonpro/ui";

interface HealthcareLoadingProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

const iconVariants = {
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function HealthcareLoading({
  message = "Carregando sistema de saúde...",
  progress,
  showProgress = false,
}: HealthcareLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="w-96 p-8">
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Medical Icons Animation */}
          <div className="relative">
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="absolute inset-0 bg-blue-100 rounded-full w-24 h-24"
            />
            <motion.div
              variants={iconVariants}
              animate="animate"
              className="relative z-10 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <Heart className="h-12 w-12 text-white" />
            </motion.div>
          </div>

          {/* Floating Medical Icons */}
          <div className="flex space-x-4">
            <motion.div
              animate={{
                y: [-10, 10, -10],
                transition: { duration: 2, repeat: Infinity, delay: 0 },
              }}
              className="text-green-600"
            >
              <Activity className="h-6 w-6" />
            </motion.div>
            <motion.div
              animate={{
                y: [-10, 10, -10],
                transition: { duration: 2, repeat: Infinity, delay: 0.5 },
              }}
              className="text-blue-600"
            >
              <Stethoscope className="h-6 w-6" />
            </motion.div>
            <motion.div
              animate={{
                y: [-10, 10, -10],
                transition: { duration: 2, repeat: Infinity, delay: 1 },
              }}
              className="text-purple-600"
            >
              <Shield className="h-6 w-6" />
            </motion.div>
          </div>

          {/* Loading Message */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sistema NeonPro Health</h3>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Progress Bar */}
          {showProgress && typeof progress === "number" && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">{progress.toFixed(0)}% concluído</p>
            </div>
          )}

          {/* Animated Dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="w-2 h-2 bg-blue-600 rounded-full"
              />
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Conexão segura e compatível com LGPD</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
