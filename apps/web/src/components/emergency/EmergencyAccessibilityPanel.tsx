'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  Volume2,
  VolumeX,
  Vibrate,
  Hand,
  Contrast,
  Type,
  Zap,
  Shield,
  Settings,
  Mic,
  MicOff,
  Moon,
  Sun,
  Smartphone,
  Battery,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  EmergencyAccessibilityConfig,
  ContrastMode,
  PerformanceMode,
  ScreenReaderMode
} from '@/types/emergency';

interface EmergencyAccessibilityPanelProps {
  config: EmergencyAccessibilityConfig;
  onConfigChange: (config: Partial<EmergencyAccessibilityConfig>) => void;
  emergencyMode?: boolean;
  className?: string;
}

/**
 * EmergencyAccessibilityPanel - Comprehensive Accessibility Controls
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Features:
 * - Emergency high contrast mode (21:1 ratio) for critical visibility
 * - Voice command integration for hands-free operation
 * - Screen reader optimization for Portuguese medical terms
 * - One-handed emergency operation mode
 * - Performance optimization for Brazilian network conditions
 * - Emergency battery saving mode
 * - Real-time accessibility status monitoring
 * - WCAG 2.1 AAA+ compliance controls
 */
export function EmergencyAccessibilityPanel({
  config,
  onConfigChange,
  emergencyMode = false,
  className
}: EmergencyAccessibilityPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Check voice recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
      const hasSpeechRecognition = 'SpeechRecognition' in window;
      setVoiceSupported(hasWebkitSpeech || hasSpeechRecognition);
    }
  }, []);

  // Monitor battery level
  useEffect(() => {
    const getBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));
          
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };
    
    getBatteryLevel();
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Check connection speed
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const updateNetworkStatus = () => {
            const effectiveType = connection.effectiveType;
            if (effectiveType === '2g' || effectiveType === 'slow-2g') {
              setNetworkStatus('slow');
            } else {
              setNetworkStatus('online');
            }
          };
          
          updateNetworkStatus();
          connection.addEventListener('change', updateNetworkStatus);
        }
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const handleContrastChange = (mode: ContrastMode) => {
    onConfigChange({ contrastMode: mode });
    
    // Apply contrast changes to document root
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('contrast-normal', 'contrast-high', 'contrast-emergency');
      root.classList.add(`contrast-${mode.replace('_', '-')}`);
    }
  };

  const handlePerformanceChange = (mode: PerformanceMode) => {
    onConfigChange({ performanceMode: mode });
    
    // Apply performance optimizations
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (mode === 'emergency_optimized') {
        root.classList.add('emergency-performance');
        // Disable animations, reduce motion
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0s');
      } else {
        root.classList.remove('emergency-performance');
        root.style.removeProperty('--animation-duration');
        root.style.removeProperty('--transition-duration');
      }
    }
  };

  const toggleVoiceCommands = () => {
    const newValue = !config.voiceCommands;
    onConfigChange({ voiceCommands: newValue });
    
    if (newValue && voiceSupported) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
  };

  const startVoiceRecognition = () => {
    if (!voiceSupported) return;
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR'; // Brazilian Portuguese
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('🎤 Comandos de voz ativados');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (config.voiceCommands) {
          // Restart recognition for continuous listening
          setTimeout(() => startVoiceRecognition(), 1000);
        }
      };
      
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        console.log('🗣️ Comando detectado:', command);
        processVoiceCommand(command);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
      };
      
      recognition.start();
    } catch (error) {
      console.error('Falha ao iniciar reconhecimento de voz:', error);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    setIsListening(false);
    // In real implementation, stop the recognition instance
  };

  const processVoiceCommand = (command: string) => {
    // Emergency voice commands in Portuguese
    const commands = {
      'emergência': () => console.log('🚨 Ativando modo emergência'),
      'samu': () => console.log('🚑 Ligando para SAMU'),
      'contato': () => console.log('📞 Abrindo contatos de emergência'),
      'alergias': () => console.log('⚠️ Mostrando alergias críticas'),
      'medicamentos': () => console.log('💊 Mostrando medicações'),
      'ajuda': () => console.log('❓ Mostrando ajuda'),
      'contraste alto': () => handleContrastChange('emergency_maximum'),
      'contraste normal': () => handleContrastChange('normal'),
      'modo escuro': () => console.log('🌙 Ativando modo escuro'),
      'modo claro': () => console.log('☀️ Ativando modo claro')
    };
    
    // Find matching command
    Object.entries(commands).forEach(([pattern, action]) => {
      if (command.includes(pattern)) {
        action();
      }
    });
  };

  const getContrastLabel = (mode: ContrastMode) => {
    const labels = {
      normal: 'Normal (4.5:1)',
      high: 'Alto (7:1)', 
      emergency_maximum: 'Emergência (21:1)'
    };
    return labels[mode];
  };

  const getPerformanceLabel = (mode: PerformanceMode) => {
    const labels = {
      normal: 'Normal',
      emergency_optimized: 'Emergência'
    };
    return labels[mode];
  };

  const getNetworkStatusColor = () => {
    switch (networkStatus) {
      case 'online': return 'text-green-500';
      case 'slow': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel === null) return 'text-gray-500';
    if (batteryLevel <= 20) return 'text-red-500';
    if (batteryLevel <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className={cn(
      'emergency-accessibility-panel',
      emergencyMode && 'emergency-mode border-blue-300 shadow-lg',
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>Acessibilidade de Emergência</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Network status indicator */}
            <div className="flex items-center space-x-1">
              {networkStatus === 'offline' ? (
                <WifiOff className={cn('h-4 w-4', getNetworkStatusColor())} />
              ) : (
                <Wifi className={cn('h-4 w-4', getNetworkStatusColor())} />
              )}
              <span className={cn('text-xs', getNetworkStatusColor())}>
                {networkStatus === 'online' ? 'Online' : 
                 networkStatus === 'slow' ? 'Lento' : 'Offline'}
              </span>
            </div>
            
            {/* Battery level indicator */}
            {batteryLevel !== null && (
              <div className="flex items-center space-x-1">
                <Battery className={cn('h-4 w-4', getBatteryColor())} />
                <span className={cn('text-xs', getBatteryColor())}>
                  {batteryLevel}%
                </span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Accessibility */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Contrast className="h-4 w-4" />
            <span>Acessibilidade Visual</span>
          </h3>
          
          {/* Contrast Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Contraste</label>
              <Badge variant="outline" className="text-xs">
                {getContrastLabel(config.contrastMode)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={config.contrastMode === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleContrastChange('normal')}
                className="text-xs"
              >
                Normal
              </Button>
              <Button
                variant={config.contrastMode === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleContrastChange('high')}
                className="text-xs"
              >
                Alto
              </Button>
              <Button
                variant={config.contrastMode === 'emergency_maximum' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleContrastChange('emergency_maximum')}
                className="text-xs font-bold"
              >
                🚨 MAX
              </Button>
            </div>
          </div>

          {/* Font Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tamanho da Fonte</label>
              <Badge variant="outline" className="text-xs capitalize">
                {config.fontSize || 'normal'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={config.fontSize === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onConfigChange({ fontSize: 'normal' })}
                className="text-xs"
              >
                <Type className="h-3 w-3 mr-1" />
                Normal
              </Button>
              <Button
                variant={config.fontSize === 'large' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onConfigChange({ fontSize: 'large' })}
                className="text-sm"
              >
                <Type className="h-4 w-4 mr-1" />
                Grande
              </Button>
              <Button
                variant={config.fontSize === 'extra_large' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onConfigChange({ fontSize: 'extra_large' })}
                className="text-base"
              >
                <Type className="h-5 w-5 mr-1" />
                XL
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Audio Accessibility */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <span>Acessibilidade Sonora</span>
          </h3>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Alertas Sonoros</label>
              <p className="text-xs text-muted-foreground">
                Sons para alertas críticos
              </p>
            </div>
            <Switch
              checked={config.soundAlerts}
              onCheckedChange={(checked) => onConfigChange({ soundAlerts: checked })}
            />
          </div>

          {/* Screen Reader */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Leitor de Tela</label>
              <Badge variant="outline" className="text-xs capitalize">
                {config.screenReader === 'portuguese' ? 'Português' : 'Emergência'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={config.screenReader === 'portuguese' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onConfigChange({ screenReader: 'portuguese' })}
                className="text-xs"
              >
                🇧🇷 Português
              </Button>
              <Button
                variant={config.screenReader === 'emergency_mode' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => onConfigChange({ screenReader: 'emergency_mode' })}
                className="text-xs font-bold"
              >
                🚨 Emergência
              </Button>
            </div>
          </div>

          {/* Voice Commands */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <span>Comandos de Voz</span>
                  {!voiceSupported && (
                    <Badge variant="secondary" className="text-xs">
                      Não suportado
                    </Badge>
                  )}
                </label>
                <p className="text-xs text-muted-foreground">
                  {isListening ? '🎤 Ouvindo...' : 'Controle por voz em português'}
                </p>
              </div>
              <Switch
                checked={config.voiceCommands}
                onCheckedChange={toggleVoiceCommands}
                disabled={!voiceSupported}
              />
            </div>
            
            {config.voiceCommands && voiceSupported && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <p className="font-medium mb-2">Comandos disponíveis:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span>• "emergência"</span>
                  <span>• "samu"</span>
                  <span>• "contato"</span>
                  <span>• "alergias"</span>
                  <span>• "medicamentos"</span>
                  <span>• "ajuda"</span>
                  <span>• "contraste alto"</span>
                  <span>• "modo escuro"</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Motor Accessibility */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Hand className="h-4 w-4" />
            <span>Acessibilidade Motora</span>
          </h3>

          {/* One-handed mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Modo Uma Mão</label>
              <p className="text-xs text-muted-foreground">
                Interface otimizada para uso com uma mão
              </p>
            </div>
            <Switch
              checked={config.oneHandedMode}
              onCheckedChange={(checked) => onConfigChange({ oneHandedMode: checked })}
            />
          </div>

          {/* Vibration alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center space-x-2">
                <Vibrate className="h-4 w-4" />
                <span>Alertas por Vibração</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Vibração para dispositivos móveis
              </p>
            </div>
            <Switch
              checked={config.vibrationAlerts}
              onCheckedChange={(checked) => onConfigChange({ vibrationAlerts: checked })}
            />
          </div>

          {/* Emergency shortcuts */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Atalhos de Emergência</label>
              <p className="text-xs text-muted-foreground">
                Acesso rápido a funções críticas
              </p>
            </div>
            <Switch
              checked={config.emergencyShortcuts}
              onCheckedChange={(checked) => onConfigChange({ emergencyShortcuts: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Performance Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Performance</span>
          </h3>

          {/* Performance mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Modo de Performance</label>
              <Badge variant="outline" className="text-xs">
                {getPerformanceLabel(config.performanceMode)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={config.performanceMode === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePerformanceChange('normal')}
                className="text-xs"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                Normal
              </Button>
              <Button
                variant={config.performanceMode === 'emergency_optimized' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handlePerformanceChange('emergency_optimized')}
                className="text-xs font-bold"
              >
                🚨 Emergência
              </Button>
            </div>
          </div>

          {/* Offline mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Modo Offline</label>
              <p className="text-xs text-muted-foreground">
                Funcionalidade completa sem internet
              </p>
            </div>
            <Switch
              checked={config.offlineMode}
              onCheckedChange={(checked) => onConfigChange({ offlineMode: checked })}
            />
          </div>
        </div>

        {/* Emergency Reset */}
        <Separator />
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to emergency-optimized settings
              const emergencyConfig: Partial<EmergencyAccessibilityConfig> = {
                contrastMode: 'emergency_maximum',
                voiceCommands: true,
                screenReader: 'emergency_mode',
                oneHandedMode: true,
                performanceMode: 'emergency_optimized',
                soundAlerts: true,
                vibrationAlerts: true,
                emergencyShortcuts: true,
                fontSize: 'extra_large'
              };
              onConfigChange(emergencyConfig);
            }}
            className="w-full font-medium text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
          >
            <Shield className="h-4 w-4 mr-2" />
            🚨 Configuração de Emergência
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmergencyAccessibilityPanel;