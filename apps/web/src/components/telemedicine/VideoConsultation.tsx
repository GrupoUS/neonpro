/**
 * Enhanced Video Consultation Component
 * Integrates with WebRTC infrastructure for real-time video/audio calls
 * Features CFM compliance, LGPD privacy controls, and session recording
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor, MonitorOff,
  Settings, Volume2, VolumeX, Maximize, Minimize, Record, Square,
  Users, MessageSquare, FileText, Shield, Activity, AlertTriangle,
  Camera, CameraOff, Wifi, WifiOff, Clock, Heart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import { 
  useTelemedicineSession, 
  useVideoCall, 
  useRealTimeChat, 
  useSessionRecording,
  useSessionConsent,
  useEmergencyEscalation
} from '@/hooks/use-telemedicine';

interface VideoConsultationProps {
  sessionId: string;
  onSessionEnd?: () => void;
  className?: string;
}

interface ParticipantInfo {
  id: string;
  name: string;
  role: 'patient' | 'physician' | 'observer';
  avatar?: string;
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
}

export function VideoConsultation({ 
  sessionId, 
  onSessionEnd,
  className = '' 
}: VideoConsultationProps) {
  // Hooks
  const { session, updateSession, endSession, isEnding } = useTelemedicineSession({ sessionId });
  const { callState, localVideoRef, remoteVideoRef, initializeCall, toggleMute, toggleVideo, startScreenShare, endCall } = useVideoCall(sessionId);
  const { messages, sendMessage, isSending } = useRealTimeChat({ sessionId, enableAI: true });
  const { isRecording, startRecording, stopRecording } = useSessionRecording(sessionId);
  const { consent, updateConsent } = useSessionConsent(sessionId);
  const { escalateEmergency } = useEmergencyEscalation(sessionId);

  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor' | 'critical'>('excellent');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);

  // Refs
  const sessionStartTime = useRef<Date>(new Date());
  const durationInterval = useRef<NodeJS.Timeout>();
  const chatMessageRef = useRef<HTMLInputElement>(null);

  // Initialize video call when component mounts
  useEffect(() => {
    if (sessionId) {
      initializeCall();
    }

    return () => {
      endCall();
    };
  }, [sessionId, initializeCall, endCall]);

  // Session duration timer
  useEffect(() => {
    durationInterval.current = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000));
    }, 1000);

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    if (callState.connectionQuality) {
      setNetworkQuality(callState.connectionQuality);
    }
  }, [callState.connectionQuality]);

  // Update participants list
  useEffect(() => {
    if (session) {
      const participantsList: ParticipantInfo[] = [
        {
          id: session.patientId,
          name: session.metadata.patientName,
          role: 'patient',
          isConnected: callState.isConnected,
          connectionQuality: callState.connectionQuality,
        },
        {
          id: session.professionalId,
          name: session.metadata.professionalName,
          role: 'physician',
          isConnected: callState.isConnected,
          connectionQuality: callState.connectionQuality,
        }
      ];
      setParticipants(participantsList);
    }
  }, [session, callState.isConnected, callState.connectionQuality]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get connection quality color
  const getQualityColor = useCallback((quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, []);

  // Handle session end
  const handleEndSession = useCallback(async () => {
    try {
      await endSession('normal_completion');
      endCall();
      onSessionEnd?.();
      toast.success('Sessão finalizada com sucesso');
    } catch (error) {
      toast.error('Erro ao finalizar sessão');
    }
  }, [endSession, endCall, onSessionEnd]);

  // Handle emergency escalation
  const handleEmergencyEscalation = useCallback(async (emergencyType: 'medical' | 'technical') => {
    try {
      await escalateEmergency({
        emergencyType,
        severity: 'high',
        description: `Emergency escalated during telemedicine session ${sessionId}`,
      });
      toast.success('Emergência escalada com sucesso');
      setShowEmergencyDialog(false);
    } catch (error) {
      toast.error('Erro ao escalar emergência');
    }
  }, [escalateEmergency, sessionId]);

  // Handle screen sharing
  const handleScreenShare = useCallback(async () => {
    try {
      await startScreenShare();
      toast.success(callState.isScreenSharing ? 'Compartilhamento de tela interrompido' : 'Compartilhamento de tela iniciado');
    } catch (error) {
      toast.error('Erro no compartilhamento de tela');
    }
  }, [startScreenShare, callState.isScreenSharing]);

  // Handle recording toggle
  const handleRecordingToggle = useCallback(async () => {
    try {
      if (isRecording) {
        await stopRecording();
        toast.success('Gravação finalizada');
      } else {
        await startRecording();
        toast.success('Gravação iniciada');
      }
    } catch (error) {
      toast.error('Erro na gravação');
    }
  }, [isRecording, startRecording, stopRecording]);

  // Handle chat message send
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      await sendMessage(content);
      if (chatMessageRef.current) {
        chatMessageRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  }, [sendMessage]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gray-900 text-white ${className}`}>
      {/* Session Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.metadata.patientName} />
            <AvatarFallback className="bg-blue-600">
              {session.metadata.patientName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold">{session.metadata.patientName}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>{session.sessionType}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(sessionDuration)}</span>
              </div>
              <span>•</span>
              <div className={`flex items-center space-x-1 ${getQualityColor(networkQuality)}`}>
                <Wifi className="h-3 w-3" />
                <span className="capitalize">{networkQuality}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Compliance Indicators */}
          <div className="flex items-center space-x-1">
            {session.cfmCompliant && (
              <Badge variant="outline" className="text-xs bg-green-900 text-green-300 border-green-700">
                CFM
              </Badge>
            )}
            {session.lgpdCompliant && (
              <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300 border-blue-700">
                LGPD
              </Badge>
            )}
            {session.consentGiven && (
              <Badge variant="outline" className="text-xs bg-purple-900 text-purple-300 border-purple-700">
                Consent
              </Badge>
            )}
            {isRecording && (
              <Badge variant="outline" className="text-xs bg-red-900 text-red-300 border-red-700 animate-pulse">
                REC
              </Badge>
            )}
          </div>

          {/* Participants Count */}
          <div className="flex items-center space-x-1 text-sm text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants.filter(p => p.isConnected).length}/{participants.length}</span>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Patient) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover bg-gray-800"
          autoPlay
          playsInline
        />

        {/* Local Video (Physician) - Picture-in-Picture */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Local Video Controls */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button
              size="sm"
              variant={callState.isVideoEnabled ? "default" : "destructive"}
              className="h-6 w-6 p-0"
              onClick={toggleVideo}
            >
              {callState.isVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Participants List */}
        <div className="absolute top-4 left-4 space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2 bg-gray-800/80 backdrop-blur-sm rounded-lg p-2">
              <div className={`w-2 h-2 rounded-full ${participant.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">{participant.name}</span>
              <Badge variant="outline" className="text-xs">
                {participant.role}
              </Badge>
            </div>
          ))}
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Chat da Consulta</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderType === 'professional' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-lg p-3 ${
                      message.senderType === 'professional' 
                        ? 'bg-blue-600 text-white' 
                        : message.senderType === 'ai_assistant'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={chatMessageRef}
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(e.currentTarget.value);
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (chatMessageRef.current?.value) {
                      handleSendMessage(chatMessageRef.current.value);
                    }
                  }}
                  disabled={isSending}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Connection Issues Alert */}
        {!callState.isConnected && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Alert className="bg-yellow-900 border-yellow-700 text-yellow-300">
              <Activity className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Estabelecendo conexão... Verifique sua internet.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Network Quality Warning */}
        {networkQuality === 'poor' || networkQuality === 'critical' && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
            <Alert className="bg-orange-900 border-orange-700 text-orange-300">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                Qualidade da conexão baixa. A experiência pode ser comprometida.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
          {/* Left Controls - Media */}
          <div className="flex items-center space-x-2">
            <Button
              variant={callState.isMuted ? "destructive" : "outline"}
              size="sm"
              onClick={toggleMute}
              title={callState.isMuted ? "Ligar microfone" : "Desligar microfone"}
            >
              {callState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={callState.isVideoEnabled ? "outline" : "destructive"}
              size="sm"
              onClick={toggleVideo}
              title={callState.isVideoEnabled ? "Desligar câmera" : "Ligar câmera"}
            >
              {callState.isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={callState.isScreenSharing ? "default" : "outline"}
              size="sm"
              onClick={handleScreenShare}
              title="Compartilhar tela"
            >
              {callState.isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            </Button>
          </div>

          {/* Center Controls - Features */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isChatOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Chat"
            >
              <MessageSquare className="h-4 w-4" />
              {messages.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {messages.length}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={handleRecordingToggle}
              title={isRecording ? "Parar gravação" : "Iniciar gravação"}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Record className="h-4 w-4" />}
            </Button>

            <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" title="Emergência">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Escalar Emergência</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-300">
                    Selecione o tipo de emergência para escalar adequadamente:
                  </p>
                  <div className="flex space-x-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleEmergencyEscalation('medical')}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Emergência Médica
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleEmergencyEscalation('technical')}
                      className="flex-1"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Problema Técnico
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Tela cheia"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>

          {/* Right Controls - Session */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(sessionDuration)}</span>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndSession}
              disabled={isEnding}
              title="Encerrar consulta"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              {isEnding ? 'Encerrando...' : 'Encerrar'}
            </Button>
          </div>
        </div>

        {/* Connection Quality Indicator */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <div className="flex space-x-1">
              <div className={`w-1 h-3 rounded ${networkQuality === 'critical' ? 'bg-red-500' : 'bg-gray-600'}`} />
              <div className={`w-1 h-3 rounded ${['poor', 'good', 'excellent'].includes(networkQuality) ? 'bg-yellow-500' : 'bg-gray-600'}`} />
              <div className={`w-1 h-3 rounded ${['good', 'excellent'].includes(networkQuality) ? 'bg-green-500' : 'bg-gray-600'}`} />
              <div className={`w-1 h-3 rounded ${networkQuality === 'excellent' ? 'bg-green-500' : 'bg-gray-600'}`} />
            </div>
            <span>Qualidade: {networkQuality}</span>
            {callState.bandwidth > 0 && (
              <>
                <span>•</span>
                <span>{Math.round(callState.bandwidth / 1000)} kbps</span>
              </>
            )}
            {callState.rtt > 0 && (
              <>
                <span>•</span>
                <span>{callState.rtt}ms</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoConsultation;