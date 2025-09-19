/**
 * Telemedicine Session Route
 * Individual consultation session interface with WebRTC video/audio
 * Enhanced with real tRPC integration, WebRTC infrastructure, and compliance features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/router';
import { VideoConsultation } from '@/components/telemedicine/VideoConsultation';
import { WaitingRoom } from '@/components/telemedicine/WaitingRoom';
import { RealTimeChat } from '@/components/telemedicine/RealTimeChat';
import { SessionConsent } from '@/components/telemedicine/SessionConsent';
import { useWebRTC } from '@/hooks/use-webrtc';
import { useSignalingClient } from '@/hooks/use-signaling-client';
import { 
  useTelemedicineSession, 
  useRealTimeChat
} from '@/hooks/use-telemedicine';
import { trpc } from '@/lib/trpc';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  MessageSquare,
  FileText,
  Camera,
  Monitor,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Shield,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Record,
  Pause,
  Play,
  Download,
  Share,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

import type { SessionDetails, SessionStatus, MediaSettings, ParticipantInfo } from '@neonpro/types';

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
      onSessionEnd={() => navigate({ to: '/telemedicine' })}
      className="h-screen"
    />
  );
}

export const Route = createFileRoute('/telemedicine/session/$sessionId')({
  component: TelemedicineSession,
});

export default TelemedicineSession;