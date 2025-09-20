/**
 * Telemedicine Session Route
 * Individual consultation session interface with WebRTC video/audio
 * Enhanced with real tRPC integration, WebRTC infrastructure, and compliance features
 */

import { RealTimeChat } from "@/components/telemedicine/RealTimeChat";
import { SessionConsent } from "@/components/telemedicine/SessionConsent";
import { VideoConsultation } from "@/components/telemedicine/VideoConsultation";
import { WaitingRoom } from "@/components/telemedicine/WaitingRoom";
import { useSignalingClient } from "@/hooks/use-signaling-client";
import {
  useRealTimeChat,
  useTelemedicineSession,
} from "@/hooks/use-telemedicine";
import { useWebRTC } from "@/hooks/use-webrtc";
import { trpc } from "@/lib/trpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Maximize,
  MessageSquare,
  Mic,
  MicOff,
  Minimize,
  Monitor,
  MoreVertical,
  Pause,
  Phone,
  PhoneOff,
  Play,
  Record,
  Settings,
  Share,
  Shield,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import type {
  MediaSettings,
  ParticipantInfo,
  SessionDetails,
  SessionStatus,
} from "@neonpro/types";

/**
 * Telemedicine Session Component
 * Manages individual video consultation sessions with real-time WebRTC communication
 */
function TelemedicineSession() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();

  // Loading state
  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Show enhanced VideoConsultation component with WebRTC integration
  return (
    <VideoConsultation
      sessionId={sessionId}
      onSessionEnd={() => navigate({ to: "/telemedicine" })}
      className="h-screen"
    />
  );
}

export const Route = createFileRoute("/telemedicine/session/$sessionId")({
  component: TelemedicineSession,
});

export default TelemedicineSession;
