/**
 * Telemedicine Session Route
 * Individual consultation session interface with WebRTC video/audio
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
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
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/telemedicine/session/$sessionId')({
  component: TelemedicineSession,
});

function TelemedicineSession() {
  const { sessionId } = Route.useParams();
  
  // WebRTC and media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chat and notes state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Mock session data - will be replaced with real tRPC calls
  const sessionData = {
    id: sessionId,
    patient: {
      name: 'Maria Silva',
      age: 34,
      avatar: null,
      medicalRecord: 'MR-12345',
    },
    physician: {
      name: 'Dr. João Mendes',
      specialty: 'Cardiologia',
      crm: 'CRM-SP 123456',
    },
    startTime: new Date(),
    estimatedDuration: 30,
    type: 'follow-up',
    compliance: {
      cfm: true,
      lgpd: true,
      consent: true,
    }
  };

  // Session timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // TODO: Implement WebRTC video toggle
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // TODO: Implement WebRTC audio toggle
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // TODO: Implement audio output toggle
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // TODO: Implement screen sharing
  };

  const endSession = () => {
    // TODO: Implement session end logic
    console.log('Ending session...');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Session Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={sessionData.patient.avatar || undefined} />
            <AvatarFallback className="bg-blue-600">
              {getInitials(sessionData.patient.name)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold">{sessionData.patient.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>{sessionData.patient.age} anos</span>
              <span>•</span>
              <span>{sessionData.type}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(sessionDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm capitalize">{connectionStatus}</span>
          </div>

          {/* Compliance Indicators */}
          <div className="flex items-center space-x-1">
            {sessionData.compliance.cfm && (
              <Badge variant="outline" className="text-xs bg-green-900 text-green-300 border-green-700">
                CFM
              </Badge>
            )}
            {sessionData.compliance.lgpd && (
              <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300 border-blue-700">
                LGPD
              </Badge>
            )}
            {sessionData.compliance.consent && (
              <Badge variant="outline" className="text-xs bg-purple-900 text-purple-300 border-purple-700">
                Consent
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (Patient) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />

        {/* Local Video (Physician) - Picture-in-Picture */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <Button
              size="sm"
              variant={isVideoEnabled ? "default" : "destructive"}
              className="h-6 w-6 p-0"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Chat da Consulta</h3>
            </div>
            {/* Chat content would go here */}
            <div className="p-4 text-sm text-gray-300">
              Chat implementation will be added here...
            </div>
          </div>
        )}

        {/* Notes Panel */}
        {isNotesOpen && (
          <div className="absolute left-0 top-0 h-full w-80 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Notas da Consulta</h3>
            </div>
            {/* Notes content would go here */}
            <div className="p-4 text-sm text-gray-300">
              Notes implementation will be added here...
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isAudioEnabled ? "outline" : "destructive"}
              size="sm"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "outline" : "destructive"}
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={isSpeakerEnabled ? "outline" : "secondary"}
              size="sm"
              onClick={toggleSpeaker}
            >
              {isSpeakerEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="sm"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isChatOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Button
              variant={isNotesOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setIsNotesOpen(!isNotesOpen)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {formatDuration(sessionDuration)}
            </span>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={endSession}
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Issues Alert */}
      {connectionStatus !== 'connected' && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Alert className="bg-yellow-900 border-yellow-700 text-yellow-300">
            <Activity className="h-4 w-4" />
            <AlertDescription>
              {connectionStatus === 'connecting' 
                ? 'Estabelecendo conexão...' 
                : 'Reconectando... Verifique sua conexão com a internet.'
              }
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}