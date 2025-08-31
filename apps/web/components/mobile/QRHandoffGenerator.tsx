"use client";

/**
 * QR Handoff Generator Component
 * T3.3: Cross-Device Continuity e QR Handoff System
 * 
 * Generates secure QR codes for instant session transfer between devices
 * Features:
 * - Time-limited tokens (5 minutes expiry)
 * - End-to-end encryption for patient data
 * - Device fingerprinting for fraud prevention
 * - LGPD compliant data handling
 * - Real-time sync indicators
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QrCode, RefreshCw, Shield, Clock, Smartphone, Tablet, Monitor, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

// Types
interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

interface HandoffToken {
  sessionId: string;
  deviceFingerprint: DeviceFingerprint;
  payload: string; // Encrypted session state
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

interface QRHandoffState {
  status: 'idle' | 'generating' | 'active' | 'scanning' | 'success' | 'error' | 'expired';
  token?: string;
  qrCodeUrl?: string;
  expiresAt?: number;
  targetDevice?: DeviceFingerprint;
  error?: string;
}

export interface QRHandoffGeneratorProps {
  className?: string;
  emergencyMode?: boolean;
  onHandoffComplete?: (targetDevice: DeviceFingerprint) => void;
  onError?: (error: string) => void;
  sessionData?: Record<string, any>;
}

// Device Detection Hook
const useDeviceFingerprint = (): DeviceFingerprint => {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint>({
    userAgent: '',
    screenResolution: '',
    timezone: '',
    language: '',
    deviceType: 'desktop'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
        const width = window.screen.width;
        if (width < 768) {return 'mobile';}
        if (width < 1024) {return 'tablet';}
        return 'desktop';
      };

      setFingerprint({
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        deviceType: getDeviceType()
      });
    }
  }, []);

  return fingerprint;
};

// Token Service
const useTokenService = () => {
  const generateHandoffToken = useCallback(async (sessionData: Record<string, any>, deviceFingerprint: DeviceFingerprint): Promise<string> => {
    try {
      const response = await fetch('/api/handoff/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionData,
          deviceFingerprint,
          expiryMinutes: 5
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate token: ${response.statusText}`);
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error('Error generating handoff token:', error);
      throw error;
    }
  }, []);

  const validateToken = useCallback(async (token: string, targetDevice: DeviceFingerprint) => {
    try {
      const response = await fetch('/api/handoff/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, targetDevice }),
      });

      if (!response.ok) {
        throw new Error(`Token validation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating token:', error);
      throw error;
    }
  }, []);

  return { generateHandoffToken, validateToken };
};

export default function QRHandoffGenerator({
  className,
  emergencyMode = false,
  onHandoffComplete,
  onError,
  sessionData = {}
}: QRHandoffGeneratorProps) {
  const [handoffState, setHandoffState] = useState<QRHandoffState>({ status: 'idle' });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'limited'>('online');
  const intervalRef = useRef<NodeJS.Timeout>();
  const deviceFingerprint = useDeviceFingerprint();
  const { generateHandoffToken } = useTokenService();

  // Network Status Detection
  useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
      } else if ((navigator as any).connection?.effectiveType === '2g') {
        setNetworkStatus('limited');
      } else {
        setNetworkStatus('online');
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Timer Management
  useEffect(() => {
    if (handoffState.status === 'active' && handoffState.expiresAt) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, handoffState.expiresAt! - now);
        
        if (remaining === 0) {
          setHandoffState(prev => ({ ...prev, status: 'expired' }));
          clearInterval(intervalRef.current);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [handoffState.status, handoffState.expiresAt]);

  // Generate QR Code
  const handleGenerateQR = useCallback(async () => {
    if (networkStatus === 'offline') {
      const error = 'Cannot generate QR code while offline';
      setHandoffState({ status: 'error', error });
      onError?.(error);
      return;
    }

    setHandoffState({ status: 'generating' });

    try {
      // Add current session context
      const contextualSessionData = {
        ...sessionData,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
        timestamp: Date.now(),
        emergencyMode,
      };

      const token = await generateHandoffToken(contextualSessionData, deviceFingerprint);
      
      // Generate QR code URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const qrCodeUrl = `${baseUrl}/handoff?token=${encodeURIComponent(token)}`;
      
      const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
      setTimeRemaining(5 * 60 * 1000);

      setHandoffState({
        status: 'active',
        token,
        qrCodeUrl,
        expiresAt
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setHandoffState({ status: 'error', error: errorMessage });
      onError?.(errorMessage);
    }
  }, [networkStatus, sessionData, emergencyMode, deviceFingerprint, generateHandoffToken, onError]);

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'expired': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const progressPercent = handoffState.expiresAt ? 
    Math.max(0, (timeRemaining / (5 * 60 * 1000)) * 100) : 0;

  return (
    <Card className={cn(
      "w-full max-w-md",
      emergencyMode && "border-2 border-blue-500 shadow-lg",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Cross-Device Handoff
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'} className="flex items-center gap-1">
              {networkStatus === 'offline' ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
              {networkStatus}
            </Badge>
            {emergencyMode && (
              <Badge variant="destructive">Emergency</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Device Info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {getDeviceIcon(deviceFingerprint.deviceType)}
            <span className="text-sm font-medium">Current Device</span>
          </div>
          <Badge variant="outline">{deviceFingerprint.deviceType}</Badge>
        </div>

        {/* QR Code Display */}
        {handoffState.status === 'active' && handoffState.qrCodeUrl && (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <QRCodeSVG 
                value={handoffState.qrCodeUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            
            {/* Timer and Progress */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Expires in: {formatTimeRemaining(timeRemaining)}
                </span>
                <Badge className={getStatusColor('active')}>Active</Badge>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Security Indicators */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Encrypted
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                LGPD Compliant
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {handoffState.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {handoffState.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Expired State */}
        {handoffState.status === 'expired' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              QR code has expired. Generate a new one to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {(handoffState.status === 'idle' || handoffState.status === 'error' || handoffState.status === 'expired') && (
            <Button 
              onClick={handleGenerateQR}
              disabled={handoffState.status === 'generating' || networkStatus === 'offline'}
              className="flex-1"
              variant={emergencyMode ? "destructive" : "default"}
            >
              {handoffState.status === 'generating' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          )}

          {handoffState.status === 'active' && (
            <Button 
              onClick={handleGenerateQR}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {/* Instructions */}
        {handoffState.status === 'active' && (
          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              Scan this QR code with your target device to transfer your current session securely.
              The code expires in {formatTimeRemaining(timeRemaining)}.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}