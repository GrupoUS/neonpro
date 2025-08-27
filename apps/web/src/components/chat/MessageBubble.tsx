"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Clock,
  Shield,
  User,
  Activity,
  Heart,
  Stethoscope,
} from "lucide-react";
import type React from "react";
import type { ChatMessage } from "./ChatInterface";

interface MessageBubbleProps {
  message: ChatMessage;
  variant?: 'user' | 'ai' | 'system' | 'medical-alert';
  showTimestamp?: boolean;
  showConfidence?: boolean;
  className?: string;
}

export function MessageBubble({
  message,
  variant,
  showTimestamp = true,
  showConfidence = true,
  className,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isAI = message.role === "assistant";
  const isEmergency = message.emergencyDetected || variant === "medical-alert";

  // Determine message styling based on type and context
  const getMessageStyling = () => {
    if (isEmergency) {
      return {
        container: "flex-row-reverse",
        bubble: "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground border-destructive/20 border",
        avatar: "bg-destructive text-destructive-foreground",
        icon: AlertTriangle,
      };
    }

    if (isSystem) {
      return {
        container: "justify-center",
        bubble: "bg-gradient-to-r from-muted/80 to-muted/60 text-muted-foreground border border-border/50 max-w-md mx-auto text-center",
        avatar: "bg-primary/10 text-primary",
        icon: Shield,
      };
    }

    if (isUser) {
      return {
        container: "flex-row-reverse",
        bubble: "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto",
        avatar: "bg-primary text-primary-foreground",
        icon: User,
      };
    }

    // AI Assistant styling with healthcare context
    const healthcareSpecialty = message.healthcareContext?.specialty;
    const severity = message.healthcareContext?.severity || 'low';

    let aiStyling = {
      container: "",
      bubble: "bg-gradient-to-br from-muted/90 to-muted/70 text-foreground",
      avatar: "bg-primary/10 text-primary",
      icon: Bot,
    };

    // Specialty-specific styling
    switch (healthcareSpecialty) {
      case 'dermatology':
        aiStyling.avatar = "bg-gradient-to-br from-chart-1/20 to-chart-1/10 text-chart-1";
        aiStyling.icon = Activity;
        break;
      case 'aesthetics':
        aiStyling.avatar = "bg-gradient-to-br from-chart-3/20 to-chart-3/10 text-chart-3";
        aiStyling.icon = Heart;
        break;
      case 'plastic-surgery':
        aiStyling.avatar = "bg-gradient-to-br from-chart-2/20 to-chart-2/10 text-chart-2";
        aiStyling.icon = Stethoscope;
        break;
      default:
        aiStyling.avatar = "bg-primary/10 text-primary";
        aiStyling.icon = Bot;
    }

    // Severity-based styling
    if (severity === 'high' || severity === 'critical') {
      aiStyling.bubble = "bg-gradient-to-br from-chart-4/10 to-muted/70 text-foreground border border-chart-4/20";
    }

    return aiStyling;
  };

  const styling = getMessageStyling();

  // Healthcare context indicators
  const getHealthcareContextBadges = () => {
    const badges = [];
    const context = message.healthcareContext;

    if (context?.specialty) {
      badges.push(
        <Badge key="specialty" variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
          {getSpecialtyName(context.specialty)}
        </Badge>
      );
    }

    if (context?.severity && context.severity !== 'low') {
      const severityColor = context.severity === 'critical' ? 'destructive' : 
                            context.severity === 'high' ? 'chart-4' : 'chart-2';
      badges.push(
        <Badge key="severity" variant="outline" className={`text-xs border-${severityColor}/20`}>
          {getSeverityName(context.severity)}
        </Badge>
      );
    }

    if (context?.procedureType) {
      badges.push(
        <Badge key="procedure" variant="outline" className="text-xs bg-chart-3/5 text-chart-3 border-chart-3/20">
          {context.procedureType}
        </Badge>
      );
    }

    return badges;
  };

  const getSpecialtyName = (specialty: string): string => {
    switch (specialty) {
      case 'dermatology': return 'Dermatologia';
      case 'aesthetics': return 'Estética';
      case 'plastic-surgery': return 'Cirurgia Plástica';
      default: return 'Geral';
    }
  };

  const getSeverityName = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨 Crítico';
      case 'high': return '⚠️ Alto';
      case 'medium': return '📋 Médio';
      default: return '📝 Baixo';
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 healthcare-transition",
        styling.container,
        isSystem && "my-2",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
    >
      {/* Avatar */}
      {!isSystem && (
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full healthcare-transition",
            styling.avatar,
            isEmergency && "ring-2 ring-destructive/30 ring-offset-2",
            message.confidence !== undefined && message.confidence < 0.7 && "ring-2 ring-chart-4/30 ring-offset-1"
          )}
        >
          <styling.icon className="h-4 w-4" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex-1",
        isUser && "max-w-[80%]",
        isSystem && "max-w-full"
      )}>
        <div
          className={cn(
            "rounded-lg px-3 py-2 healthcare-transition shadow-sm",
            styling.bubble,
            isEmergency && "shadow-lg shadow-destructive/20 animate-pulse",
            message.confidence !== undefined && message.confidence < 0.7 && "border-l-4 border-chart-4"
          )}
        >
          {/* Emergency Header */}
          {isEmergency && (
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-destructive-foreground/20">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                SITUAÇÃO DE EMERGÊNCIA DETECTADA
              </span>
            </div>
          )}

          {/* Message Text */}
          <p className={cn(
            "whitespace-pre-wrap text-sm",
            isSystem && "text-center",
            isEmergency && "font-medium"
          )}>
            {message.content}
          </p>

          {/* Healthcare Context Badges */}
          {getHealthcareContextBadges().length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {getHealthcareContextBadges()}
            </div>
          )}
        </div>

        {/* Metadata Row */}
        {(showTimestamp || showConfidence || message.complianceFlags || message.escalationTriggered) && (
          <div
            className={cn(
              "mt-1 flex items-center gap-2 text-muted-foreground text-xs healthcare-transition",
              isUser && "justify-end",
              isSystem && "justify-center"
            )}
          >
            {/* Timestamp */}
            {showTimestamp && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {message.timestamp.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            {/* Confidence Score for AI messages */}
            {showConfidence && message.confidence !== undefined && !isUser && (
              <Badge 
                className={cn(
                  "text-xs",
                  message.confidence >= 0.9 ? "bg-chart-5/10 text-chart-5 border-chart-5/20" :
                  message.confidence >= 0.7 ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-chart-4/10 text-chart-4 border-chart-4/20"
                )} 
                variant="outline"
              >
                {Math.round(message.confidence * 100)}% confiança
              </Badge>
            )}

            {/* Emergency Detection Badge */}
            {message.emergencyDetected && (
              <Badge className="text-xs animate-pulse" variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Emergência
              </Badge>
            )}

            {/* Escalation Badge */}
            {message.escalationTriggered && (
              <Badge className="text-xs bg-chart-2/10 text-chart-2 border-chart-2/20" variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Escalado
              </Badge>
            )}

            {/* Compliance Flags */}
            {message.complianceFlags && message.complianceFlags.length > 0 && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20" variant="outline">
                <Shield className="mr-1 h-3 w-3" />
                {message.complianceFlags.length} flags LGPD
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MessageBubble;