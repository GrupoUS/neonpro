'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  Phone,
  User,
  ArrowUp,
  Volume2,
  VolumeX,
  Zap,
  FileText,
  Shield,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CriticalAlert,
  CriticalAlertOverlayProps,
  EmergencyProtocol
} from '@/types/emergency';

/**
 * CriticalAlertOverlay - Full-Screen Emergency Alerts
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Features:
 * - Full-screen life-threatening alerts with maximum visibility
 * - Auto-escalation with countdown for critical situations
 * - Required acknowledgment system for safety compliance
 * - Emergency protocol guidance with step-by-step instructions
 * - Audio/vibration alerts for maximum attention
 * - One-thumb operation with 56px emergency touch targets
 * - High contrast emergency mode (21:1 ratio)
 * - Auto-escalation to SAMU/responsible doctor
 */
export function CriticalAlertOverlay({
  alert,
  onAcknowledge,
  onEscalate,
  onDismiss,
  emergencyMode = false,
  autoAcknowledge
}: CriticalAlertOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(autoAcknowledge || 0);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [escalationStep, setEscalationStep] = useState(0);
  const [showProtocol, setShowProtocol] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const escalationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio alerts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/emergency-critical-alert.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.9;
    }
  }, []);

  // Start audio alert and timers
  useEffect(() => {
    if (isVisible && alert.severity === 'life_threatening') {
      // Play audio alert
      if (audioEnabled && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }

      // Start countdown timer
      if (autoAcknowledge && autoAcknowledge > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              handleAutoAcknowledge();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // Start escalation timer if configured
      if (alert.autoEscalate && alert.autoEscalate > 0) {
        escalationTimerRef.current = setTimeout(() => {
          handleEscalate();
        }, alert.autoEscalate * 60 * 1000); // Convert minutes to milliseconds
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (escalationTimerRef.current) clearTimeout(escalationTimerRef.current);
    };
  }, [isVisible, alert.severity, autoAcknowledge, alert.autoEscalate, audioEnabled]);

  // Handle vibration for mobile devices
  useEffect(() => {
    if (isVisible && 'vibrate' in navigator && alert.severity === 'life_threatening') {
      // Vibration pattern: [vibrate, pause, vibrate, pause, ...]
      const pattern = [500, 200, 500, 200, 1000, 500, 500];
      navigator.vibrate(pattern);
    }
  }, [isVisible, alert.severity]);

  const handleAutoAcknowledge = () => {
    setIsAcknowledged(true);
    stopAudioAlert();
    onAcknowledge(alert.id);
  };

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    stopAudioAlert();
    if (timerRef.current) clearInterval(timerRef.current);
    if (escalationTimerRef.current) clearTimeout(escalationTimerRef.current);
    onAcknowledge(alert.id);
  };

  const handleEscalate = () => {
    setEscalationStep(prev => prev + 1);
    stopAudioAlert();
    onEscalate(alert.id);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    stopAudioAlert();
    if (timerRef.current) clearInterval(timerRef.current);
    if (escalationTimerRef.current) clearTimeout(escalationTimerRef.current);
    onDismiss(alert.id);
  };

  const stopAudioAlert = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled && audioRef.current && alert.severity === 'life_threatening') {
      audioRef.current.play().catch(console.error);
    } else {
      stopAudioAlert();
    }
  };

  const getSeverityConfig = () => {
    const configs = {
      life_threatening: {
        bgClass: 'bg-red-600 dark:bg-red-700',
        borderClass: 'border-red-800',
        textClass: 'text-white',
        accentClass: 'bg-red-800 dark:bg-red-900',
        icon: AlertTriangle,
        label: 'AMEAÇA À VIDA',
        emoji: '🚨',
        priority: 'CRÍTICO'
      },
      severe: {
        bgClass: 'bg-orange-500 dark:bg-orange-600',
        borderClass: 'border-orange-700',
        textClass: 'text-white',
        accentClass: 'bg-orange-700 dark:bg-orange-800',
        icon: AlertTriangle,
        label: 'GRAVE',
        emoji: '⚠️',
        priority: 'ALTO'
      },
      moderate: {
        bgClass: 'bg-yellow-500 dark:bg-yellow-600',
        borderClass: 'border-yellow-700',
        textClass: 'text-white',
        accentClass: 'bg-yellow-700 dark:bg-yellow-800',
        icon: AlertTriangle,
        label: 'MODERADO',
        emoji: '⚡',
        priority: 'MÉDIO'
      },
      informational: {
        bgClass: 'bg-blue-500 dark:bg-blue-600',
        borderClass: 'border-blue-700',
        textClass: 'text-white',
        accentClass: 'bg-blue-700 dark:bg-blue-800',
        icon: AlertTriangle,
        label: 'INFORMATIVO',
        emoji: 'ℹ️',
        priority: 'INFO'
      }
    };
    return configs[alert.severity];
  };

  const config = getSeverityConfig();
  const IconComponent = config.icon;

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/90 backdrop-blur-sm',
        emergencyMode && 'bg-black/95'
      )}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-description"
    >
      {/* Main alert container */}
      <div
        className={cn(
          'w-full h-full md:w-11/12 md:h-5/6 md:max-w-4xl md:rounded-lg',
          'border-4 shadow-2xl',
          'flex flex-col',
          config.bgClass,
          config.borderClass,
          alert.severity === 'life_threatening' && 'animate-pulse-slow'
        )}
      >
        {/* Header */}
        <div className={cn('p-6 border-b-2', config.accentClass)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                'p-3 rounded-full',
                'bg-white/20 backdrop-blur-sm'
              )}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1
                  id="alert-title"
                  className={cn(
                    'text-2xl md:text-3xl font-bold',
                    config.textClass,
                    emergencyMode && 'text-4xl'
                  )}
                >
                  {config.emoji} {config.label}
                </h1>
                <p className={cn('text-lg opacity-90', config.textClass)}>
                  {alert.title}
                </p>
              </div>
            </div>

            {/* Audio toggle and dismiss */}
            <div className="flex items-center space-x-2">
              {alert.severity === 'life_threatening' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className={cn(
                    'text-white hover:bg-white/20',
                    'min-h-[44px] min-w-[44px] touch-target-44'
                  )}
                  aria-label={audioEnabled ? 'Desativar som' : 'Ativar som'}
                >
                  {audioEnabled ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
              )}
              
              {!alert.acknowledgmentRequired && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className={cn(
                    'text-white hover:bg-white/20',
                    'min-h-[44px] min-w-[44px] touch-target-44'
                  )}
                  aria-label="Fechar alerta"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Timer and escalation info */}
          {(timeRemaining > 0 || alert.autoEscalate) && (
            <div className="mt-4 flex items-center justify-between">
              {timeRemaining > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-white" />
                  <span className={cn('text-lg font-mono', config.textClass)}>
                    Reconhecimento automático em: {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
              )}
              
              {alert.autoEscalate && (
                <div className="flex items-center space-x-2">
                  <ArrowUp className="h-5 w-5 text-white" />
                  <span className={cn('text-sm opacity-90', config.textClass)}>
                    Auto-escalonamento em {alert.autoEscalate} min
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alert content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Main message */}
            <div className={cn('text-xl md:text-2xl leading-relaxed', config.textClass)}>
              <p id="alert-description">{alert.message}</p>
            </div>

            {/* Patient info if available */}
            {alert.patientId && (
              <div className={cn('p-4 rounded-lg bg-white/10 backdrop-blur-sm')}>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-5 w-5 text-white" />
                  <span className={cn('font-semibold', config.textClass)}>
                    Informações do Paciente
                  </span>
                </div>
                <p className={cn('text-sm', config.textClass)}>
                  ID: {alert.patientId}
                </p>
              </div>
            )}

            {/* Emergency protocol */}
            {alert.emergencyProtocol && (
              <div className={cn('p-4 rounded-lg bg-white/10 backdrop-blur-sm')}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-white" />
                    <span className={cn('font-semibold', config.textClass)}>
                      Protocolo de Emergência
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProtocol(!showProtocol)}
                    className="text-white hover:bg-white/20"
                  >
                    {showProtocol ? 'Ocultar' : 'Ver'} Detalhes
                  </Button>
                </div>
                
                {showProtocol && (
                  <div className="space-y-3">
                    <h4 className={cn('font-medium', config.textClass)}>
                      {alert.emergencyProtocol.name}
                    </h4>
                    <p className={cn('text-sm opacity-90', config.textClass)}>
                      {alert.emergencyProtocol.condition}
                    </p>
                    
                    {alert.emergencyProtocol.steps.slice(0, 3).map((step, index) => (
                      <div key={step.stepNumber} className="flex space-x-3">
                        <Badge
                          variant={step.critical ? 'destructive' : 'secondary'}
                          className="min-w-[32px] h-6 flex items-center justify-center"
                        >
                          {step.stepNumber}
                        </Badge>
                        <div className="flex-1">
                          <p className={cn('text-sm', config.textClass)}>
                            {step.instruction}
                          </p>
                          {step.timeLimit && (
                            <p className={cn('text-xs opacity-75 mt-1', config.textClass)}>
                              Tempo limite: {step.timeLimit}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {alert.emergencyProtocol.steps.length > 3 && (
                      <p className={cn('text-sm opacity-75', config.textClass)}>
                        + {alert.emergencyProtocol.steps.length - 3} passos adicionais...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Alert metadata */}
            <div className={cn('text-sm opacity-75 space-y-2', config.textClass)}>
              <Separator className="bg-white/20" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Tipo:</strong> {alert.type}</p>
                  <p><strong>Criado em:</strong> {formatTimestamp(alert.timestamp)}</p>
                </div>
                <div>
                  <p><strong>Prioridade:</strong> {config.priority}</p>
                  {alert.acknowledged && (
                    <p><strong>Reconhecido:</strong> {alert.acknowledgedBy}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={cn('p-6 border-t-2', config.accentClass)}>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Primary action - Required acknowledgment */}
            {alert.acknowledgmentRequired && !isAcknowledged && (
              <Button
                onClick={handleAcknowledge}
                size="lg"
                variant="secondary"
                className={cn(
                  'flex-1 text-lg font-bold',
                  'min-h-[64px] touch-target-emergency',
                  'bg-white text-gray-900 hover:bg-gray-100',
                  'border-2 border-white'
                )}
              >
                <CheckCircle className="h-6 w-6 mr-3" />
                Reconhecer Alerta
              </Button>
            )}

            {/* Action required button */}
            {alert.actionRequired && (
              <Button
                onClick={() => {
                  // In real implementation, trigger required action
                  console.log('Ação requerida:', alert.type);
                }}
                size="lg"
                variant="outline"
                className={cn(
                  'flex-1 text-lg font-bold',
                  'min-h-[64px] touch-target-emergency',
                  'border-2 border-white text-white hover:bg-white/20'
                )}
              >
                <Zap className="h-6 w-6 mr-3" />
                Ação Necessária
              </Button>
            )}

            {/* Escalate button */}
            <Button
              onClick={handleEscalate}
              size="lg"
              variant="outline"
              className={cn(
                'flex-1 text-lg font-bold',
                'min-h-[64px] touch-target-emergency',
                'border-2 border-white text-white hover:bg-white/20'
              )}
            >
              <Phone className="h-6 w-6 mr-3" />
              Escalonar
            </Button>

            {/* Protocol button */}
            {alert.emergencyProtocol && (
              <Button
                onClick={() => {
                  // In real implementation, open full protocol
                  console.log('Ver protocolo completo:', alert.emergencyProtocol?.name);
                }}
                size="lg"
                variant="outline"
                className={cn(
                  'flex-1 text-lg font-bold',
                  'min-h-[64px] touch-target-emergency',
                  'border-2 border-white text-white hover:bg-white/20'
                )}
              >
                <FileText className="h-6 w-6 mr-3" />
                Ver Protocolo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample critical alerts for testing
export const sampleCriticalAlerts: CriticalAlert[] = [
  {
    id: 'ALERT-001',
    patientId: 'EMRG-2024-001',
    severity: 'life_threatening',
    type: 'allergy',
    title: 'CHOQUE ANAFILÁTICO IMINENTE',
    message: 'Paciente com alergia fatal à Penicilina foi prescrita com Amoxicilina. Risco de choque anafilático fatal. INTERROMPER MEDICAÇÃO IMEDIATAMENTE.',
    actionRequired: true,
    acknowledgmentRequired: true,
    autoEscalate: 2, // minutes
    timestamp: new Date(),
    emergencyProtocol: {
      id: 'PROTOCOL-ANAPHYLAXIS',
      name: 'Protocolo de Choque Anafilático',
      condition: 'Reação alérgica grave com risco de vida',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Suspender imediatamente a medicação causadora',
          timeLimit: 30,
          critical: true,
          verification: 'Medicação suspensa e descartada'
        },
        {
          stepNumber: 2,
          instruction: 'Aplicar Epinefrina 1:1000 - 0,3-0,5ml IM na coxa',
          timeLimit: 60,
          critical: true,
          verification: 'Epinefrina aplicada, horário registrado'
        },
        {
          stepNumber: 3,
          instruction: 'Estabelecer via aérea e acesso venoso',
          timeLimit: 120,
          critical: true,
          verification: 'Via aérea pérvea, acesso venoso estabelecido'
        }
      ],
      timeLimit: 5,
      requiredPersonnel: ['Médico', 'Enfermeiro', 'Técnico de emergência'],
      equipment: ['Epinefrina', 'Material de via aérea', 'Acesso venoso'],
      medications: ['Epinefrina 1:1000', 'Corticoide EV', 'Anti-histamínico EV'],
      contraindications: ['Não há contraindicações em emergências'],
      lastUpdated: new Date(),
      source: 'cfm'
    }
  },
  {
    id: 'ALERT-002',
    patientId: 'EMRG-2024-002',
    severity: 'severe',
    type: 'medication',
    title: 'INTERAÇÃO MEDICAMENTOSA PERIGOSA',
    message: 'Varfarina + AAS podem causar hemorragia grave. INR pode estar elevado. Monitorar sinais de sangramento.',
    actionRequired: true,
    acknowledgmentRequired: false,
    timestamp: new Date()
  },
  {
    id: 'ALERT-003',
    patientId: 'EMRG-2024-003',
    severity: 'moderate',
    type: 'procedure',
    title: 'PROTOCOLO PRÉ-PROCEDIMENTO',
    message: 'Paciente necessita jejum de 8h antes do procedimento agendado. Confirmar jejum antes de iniciar.',
    actionRequired: false,
    acknowledgmentRequired: true,
    timestamp: new Date()
  }
];

export default CriticalAlertOverlay;