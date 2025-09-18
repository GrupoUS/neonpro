'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Avatar component not available, will use User icon instead
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Users, 
  Video, 
  Phone, 
  Mic, 
  MicOff, 
  VideoOff,
  User,
  Calendar,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  WifiOff,
  Wifi
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Types for waiting room data
export interface QueuedPatient {
  id: string;
  name: string;
  avatar?: string;
  appointmentTime: Date;
  estimatedWaitTime: number; // minutes
  status: 'waiting' | 'preparing' | 'ready' | 'in-consultation' | 'technical-issues';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  hasInsurance: boolean;
  isNewPatient: boolean;
  consultationType: 'routine' | 'follow-up' | 'urgent' | 'specialist';
}

export interface ProfessionalStatus {
  id: string;
  name: string;
  avatar?: string;
  status: 'available' | 'busy' | 'in-consultation' | 'break' | 'offline';
  currentPatientName?: string;
  nextAvailable?: Date;
  specialization: string;
  totalPatients: number;
  completedToday: number;
}

export interface WaitingRoomProps {
  /** Current user/patient information */
  currentPatient: {
    id: string;
    name: string;
    appointmentTime: Date;
    estimatedWaitTime: number;
  };
  /** List of all patients in queue */
  queuedPatients: QueuedPatient[];
  /** Professional/doctor status */
  professional: ProfessionalStatus;
  /** Technical readiness check */
  isConnected: boolean;
  /** Microphone status */
  isMicEnabled: boolean;
  /** Camera status */
  isCameraEnabled: boolean;
  /** Queue position for current patient */
  queuePosition: number;
  /** Total estimated wait time */
  totalWaitTime: number;
  /** Callback when patient is ready to join */
  onJoinConsultation?: () => void;
  /** Callback for technical test */
  onTechnicalTest?: () => void;
  /** Callback for mic toggle */
  onToggleMic?: () => void;
  /** Callback for camera toggle */
  onToggleCamera?: () => void;
  /** Callback for messaging */
  onSendMessage?: (message: string) => void;
  /** Real-time updates enabled */
  realTimeUpdates?: boolean;
  /** Current time for display */
  currentTime?: Date;
}

// Mock data generator for development
export const generateMockWaitingRoomData = (): Omit<WaitingRoomProps, 'currentPatient'> => {
  const now = new Date();
  
  return {
    queuedPatients: [
      {
        id: '1',
        name: 'Maria Silva',
        appointmentTime: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
        estimatedWaitTime: 15,
        status: 'in-consultation',
        priority: 'normal',
        hasInsurance: true,
        isNewPatient: false,
        consultationType: 'routine'
      },
      {
        id: '2',
        name: 'João Santos',
        appointmentTime: new Date(now.getTime() + 5 * 60000), // 5 minutes from now
        estimatedWaitTime: 5,
        status: 'preparing',
        priority: 'high',
        hasInsurance: true,
        isNewPatient: true,
        consultationType: 'specialist'
      },
      {
        id: '3',
        name: 'Ana Costa',
        appointmentTime: new Date(now.getTime() + 15 * 60000), // 15 minutes from now
        estimatedWaitTime: 20,
        status: 'waiting',
        priority: 'normal',
        hasInsurance: false,
        isNewPatient: false,
        consultationType: 'follow-up'
      }
    ],
    professional: {
      id: 'dr-1',
      name: 'Dr. Carlos Oliveira',
      status: 'in-consultation',
      currentPatientName: 'Maria Silva',
      nextAvailable: new Date(now.getTime() + 12 * 60000),
      specialization: 'Cardiologia',
      totalPatients: 8,
      completedToday: 5
    },
    isConnected: true,
    isMicEnabled: true,
    isCameraEnabled: true,
    queuePosition: 2,
    totalWaitTime: 20,
    realTimeUpdates: true,
    currentTime: now
  };
};export function WaitingRoom({
  currentPatient,
  queuedPatients,
  professional,
  isConnected,
  isMicEnabled,
  isCameraEnabled,
  queuePosition,
  totalWaitTime,
  onJoinConsultation,
  onTechnicalTest,
  onToggleMic,
  onToggleCamera,
  onSendMessage,
  realTimeUpdates = true,
  currentTime = new Date()
}: WaitingRoomProps) {
  const [currentDisplayTime, setCurrentDisplayTime] = useState(currentTime);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Update current time every minute if real-time updates are enabled
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const timer = setInterval(() => {
      setCurrentDisplayTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [realTimeUpdates]);

  // Simulate connection quality monitoring
  useEffect(() => {
    const checkConnection = () => {
      if (!isConnected) {
        setConnectionQuality('poor');
        return;
      }
      
      // Simulate varying connection quality
      const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    };

    const timer = setInterval(checkConnection, 30000); // Check every 30 seconds
    checkConnection(); // Initial check

    return () => clearInterval(timer);
  }, [isConnected]);

  // Calculate wait time status
  const waitTimeStatus = useMemo(() => {
    if (totalWaitTime <= 5) return 'excellent';
    if (totalWaitTime <= 15) return 'good';
    if (totalWaitTime <= 30) return 'fair';
    return 'concerning';
  }, [totalWaitTime]);  // Status badge color mapping
  const getStatusColor = (status: QueuedPatient['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-consultation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'technical-issues': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority badge color mapping
  const getPriorityColor = (priority: QueuedPatient['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600';
      case 'normal': return 'bg-blue-100 text-blue-600';
      case 'high': return 'bg-orange-100 text-orange-600';
      case 'urgent': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Connection quality indicator
  const getConnectionIcon = () => {
    if (!isConnected) return <WifiOff className="h-4 w-4 text-red-500" />;
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getConnectionText = () => {
    if (!isConnected) return 'Disconnected';
    return `Connection: ${connectionQuality}`;
  };  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Waiting Room</h1>
          <p className="text-gray-600">
            {currentDisplayTime.toLocaleString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {getConnectionIcon()}
          <span className="text-sm text-gray-600">{getConnectionText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Patient Status */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Appointment
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{currentPatient.name}</h3>
                    <p className="text-gray-600">
                      Scheduled: {currentPatient.appointmentTime.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Position #{queuePosition}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated wait time</span>
                    <span className={cn(
                      "font-semibold",
                      waitTimeStatus === 'excellent' && "text-green-600",
                      waitTimeStatus === 'good' && "text-blue-600",
                      waitTimeStatus === 'fair' && "text-orange-600",
                      waitTimeStatus === 'concerning' && "text-red-600"
                    )}>
                      {totalWaitTime} minutes
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (totalWaitTime / 60) * 100)} 
                    className="h-2"
                  />
                </div>

                {queuePosition <= 1 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">
                      You're next! Please prepare for your consultation.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>          {/* Technical Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Technical Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    isConnected ? "bg-green-100" : "bg-red-100"
                  )}>
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connection</p>
                    <p className="text-xs text-gray-600">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMic}
                    className={cn(
                      "p-2",
                      isMicEnabled ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
                    )}
                  >
                    {isMicEnabled ? (
                      <Mic className="h-4 w-4 text-green-600" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-600" />
                    )}
                  </Button>                  <div>
                    <p className="text-sm font-medium">Microphone</p>
                    <p className="text-xs text-gray-600">
                      {isMicEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCamera}
                    className={cn(
                      "p-2",
                      isCameraEnabled ? "bg-green-100 hover:bg-green-200" : "bg-red-100 hover:bg-red-200"
                    )}
                  >
                    {isCameraEnabled ? (
                      <Video className="h-4 w-4 text-green-600" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-red-600" />
                    )}
                  </Button>
                  <div>
                    <p className="text-sm font-medium">Camera</p>
                    <p className="text-xs text-gray-600">
                      {isCameraEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={onTechnicalTest}>
                  <Video className="h-4 w-4 mr-2" />
                  Test Audio/Video
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>          {/* Queue Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Queue Status ({queuedPatients.length} patients)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queuedPatients.map((patient, index) => (
                  <div 
                    key={patient.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      patient.id === currentPatient.id ? "border-blue-300 bg-blue-50" : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 font-mono">
                        #{index + 1}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {patient.id === currentPatient.id ? 'You' : patient.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>
                            {patient.appointmentTime.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(patient.priority)}
                      {getStatusBadge(patient.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Technical Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connection Quality */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Connection Quality</label>
                  <div className="flex items-center gap-3">
                    {getConnectionIcon(connectionQuality)}
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">
                        {connectionQuality.type === 'excellent' && 'Excellent connection'}
                        {connectionQuality.type === 'good' && 'Good connection'}
                        {connectionQuality.type === 'fair' && 'Fair connection - may affect call quality'}
                        {connectionQuality.type === 'poor' && 'Poor connection - consider improving internet'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {connectionQuality.speed} Mbps • Latency: {connectionQuality.latency}ms
                      </div>
                    </div>
                  </div>
                </div>                {/* Camera & Microphone Test */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Camera & Audio</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                      className={cn(
                        "flex items-center gap-2",
                        isCameraEnabled ? "text-green-600 border-green-300" : "text-red-600 border-red-300"
                      )}
                    >
                      {isCameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                      {isCameraEnabled ? 'Camera On' : 'Camera Off'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMicrophoneEnabled(!isMicrophoneEnabled)}
                      className={cn(
                        "flex items-center gap-2",
                        isMicrophoneEnabled ? "text-green-600 border-green-300" : "text-red-600 border-red-300"
                      )}
                    >
                      {isMicrophoneEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      {isMicrophoneEnabled ? 'Mic On' : 'Mic Off'}
                    </Button>
                  </div>
                  
                  {/* Video Preview */}
                  {isCameraEnabled && (
                    <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Camera preview would appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Right Column - Professional Info & Actions */}
        <div className="space-y-6">
          {/* Professional Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Dr. {professionalStatus.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {professionalStatus.isOnline ? (
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  )}
                  <span className="text-sm">
                    {professionalStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                {professionalStatus.currentActivity && (
                  <div className="text-sm text-gray-600">
                    <p>{professionalStatus.currentActivity}</p>
                  </div>
                )}
                
                {professionalStatus.estimatedCallTime && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated call time: {professionalStatus.estimatedCallTime}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => console.log('Updating availability...')}
                >
                  <Clock className="h-4 w-4" />
                  Update Availability
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => console.log('Testing connection...')}
                >
                  <Wifi className="h-4 w-4" />
                  Test Connection
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => console.log('Reviewing notes...')}
                >
                  <FileText className="h-4 w-4" />
                  Review Patient Notes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Emergency</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full flex items-center gap-2"
                onClick={() => console.log('Emergency protocols...')}
              >
                <AlertTriangle className="h-4 w-4" />
                Emergency Protocols
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};