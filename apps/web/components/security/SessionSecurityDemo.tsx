'use client';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  activeSessions: number;
  suspiciousActivity: number;
  lastSecurityScan: string;
  mfaEnabled: boolean;
}

export default function SessionSecurityDemo() {
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      id: '1',
      device: 'Windows Desktop',
      location: 'São Paulo, Brazil',
      lastActive: 'Active now',
      current: true,
      riskLevel: 'low',
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'São Paulo, Brazil',
      lastActive: '2 hours ago',
      current: false,
      riskLevel: 'low',
    },
    {
      id: '3',
      device: 'Chrome Browser',
      location: 'Unknown Location',
      lastActive: '1 day ago',
      current: false,
      riskLevel: 'high',
    },
  ]);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    activeSessions: 3,
    suspiciousActivity: 1,
    lastSecurityScan: '5 minutes ago',
    mfaEnabled: true,
  });

  const [scanning, setScanning] = useState(false);

  const handleSecurityScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setMetrics((prev) => ({
        ...prev,
        lastSecurityScan: 'Just now',
        suspiciousActivity: Math.max(0, prev.suspiciousActivity - 1),
      }));
    }, 3000);
  };

  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    setMetrics((prev) => ({
      ...prev,
      activeSessions: prev.activeSessions - 1,
    }));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.activeSessions}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Sessions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {metrics.suspiciousActivity}
              </div>
              <div className="text-sm text-muted-foreground">
                Suspicious Activity
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.mfaEnabled ? (
                  <CheckCircle className="h-8 w-8 mx-auto" />
                ) : (
                  <AlertTriangle className="h-8 w-8 mx-auto" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">MFA Status</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">
                {metrics.lastSecurityScan}
              </div>
              <div className="text-sm text-muted-foreground">Last Scan</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleSecurityScan}
              disabled={scanning}
              className="flex items-center gap-2"
            >
              {scanning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {scanning ? 'Scanning...' : 'Run Security Scan'}
            </Button>
          </div>

          {metrics.suspiciousActivity > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Suspicious activity detected. Review your active sessions and
                terminate any unrecognized devices.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.device)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRiskColor(session.riskLevel) as any}>
                    {session.riskLevel} risk
                  </Badge>
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => terminateSession(session.id)}
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
