"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Bot, User, Users, Stethoscope, Activity, Heart } from "lucide-react";
import type React from "react";

interface TypingIndicatorProps {
  isVisible?: boolean;
  typingUser?: {
    name?: string;
    role?: 'user' | 'assistant' | 'staff';
    specialty?: 'dermatology' | 'aesthetics' | 'plastic-surgery' | 'general';
  };
  mode?: 'internal' | 'external' | 'emergency';
  message?: string;
  className?: string;
}

export function TypingIndicator({
  isVisible = false,
  typingUser = { name: "Assistente IA", role: "assistant" },
  mode = "external",
  message,
  className,
}: TypingIndicatorProps) {
  if (!isVisible) return null;

  // Get appropriate icon based on user type and specialty
  const getIcon = () => {
    if (typingUser.role === 'user') return User;
    if (typingUser.role === 'staff') return Users;
    
    // AI Assistant icons based on specialty
    switch (typingUser.specialty) {
      case 'dermatology':
        return Activity;
      case 'aesthetics':
        return Heart;
      case 'plastic-surgery':
        return Stethoscope;
      default:
        return Bot;
    }
  };

  const Icon = getIcon();

  // Get styling based on mode and user type
  const getStyling = () => {
    if (mode === 'emergency') {
      return {
        avatar: "bg-destructive/10 text-destructive",
        bubble: "bg-destructive/5 border border-destructive/20",
        dot: "bg-destructive",
      };
    }

    if (mode === 'internal') {
      return {
        avatar: "bg-chart-2/10 text-chart-2",
        bubble: "bg-chart-2/5 border border-chart-2/20",
        dot: "bg-chart-2",
      };
    }

    if (typingUser.role === 'user') {
      return {
        avatar: "bg-primary text-primary-foreground",
        bubble: "bg-primary/5 border border-primary/20",
        dot: "bg-primary",
      };
    }

    // AI Assistant default styling
    return {
      avatar: "bg-primary/10 text-primary",
      bubble: "bg-muted border border-border/50",
      dot: "bg-primary",
    };
  };

  const styling = getStyling();

  // Get typing message
  const getTypingMessage = (): string => {
    if (message) return message;
    
    const userName = typingUser.name || "Assistente IA";
    
    switch (mode) {
      case 'emergency':
        return `🚨 ${userName} analisando situação de emergência...`;
      case 'internal':
        return `💼 ${userName} processando consulta interna...`;
      default:
        if (typingUser.role === 'assistant') {
          return `🤖 ${userName} está digitando...`;
        }
        return `${userName} está digitando...`;
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 healthcare-transition", className)}
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
    >
      {/* Avatar with Pulse Animation */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: mode === 'emergency' ? [0, 5, -5, 0] : 0,
        }}
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full healthcare-transition",
          styling.avatar,
          mode === 'emergency' && "ring-2 ring-destructive/30 ring-offset-2"
        )}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>

      {/* Typing Bubble */}
      <div className="flex-1 max-w-[80%]">
        <motion.div
          animate={{ scale: [0.95, 1, 0.95] }}
          className={cn(
            "rounded-lg px-3 py-2 healthcare-transition shadow-sm",
            styling.bubble,
            mode === 'emergency' && "shadow-lg shadow-destructive/10"
          )}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Typing Message */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {getTypingMessage()}
            </span>

            {/* Animated Dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full healthcare-transition",
                    styling.dot
                  )}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar for Emergency Mode */}
          {mode === 'emergency' && (
            <div className="mt-2">
              <div className="w-full bg-destructive/20 rounded-full h-1">
                <motion.div
                  animate={{ width: ["0%", "100%"] }}
                  className="h-1 bg-destructive rounded-full"
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <p className="text-xs text-destructive/70 mt-1">
                Processando com prioridade máxima
              </p>
            </div>
          )}

          {/* Specialty Context for Healthcare Professionals */}
          {typingUser.specialty && typingUser.role === 'assistant' && (
            <div className="mt-1">
              <span className="text-xs text-primary/60">
                Especialista em {getSpecialtyName(typingUser.specialty)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Timestamp */}
        <div className="mt-1">
          <span className="text-muted-foreground text-xs">
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to get specialty display name
const getSpecialtyName = (specialty: string): string => {
  switch (specialty) {
    case 'dermatology':
      return 'Dermatologia';
    case 'aesthetics':
      return 'Medicina Estética';
    case 'plastic-surgery':
      return 'Cirurgia Plástica';
    default:
      return 'Saúde Geral';
  }
};

export default TypingIndicator;