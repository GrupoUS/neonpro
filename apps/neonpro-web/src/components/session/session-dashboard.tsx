/**
 * Session Dashboard Component
 * Comprehensive session management interface with security monitoring
 */

"use client";

import React, { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Progress } from "@/components/ui/progress";
import type { Separator } from "@/components/ui/separator";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Shield,
  Clock,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw,
  LogOut,
  Plus,
  Eye,
  EyeOff,
  MapPin,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { useSession, useSessionSecurity, useDeviceManagement } from "@/hooks/use-session";
import type {
  UserSession,
  SessionSecurityEvent,
  DeviceRegistration,
  SecuritySeverity,
  DeviceType,
} from "@/types/session";
import type { formatDistanceToNow, format } from "date-fns";
import type { toast } from "sonner";

interface SessionDashboardProps {
  className?: string;
}

export function SessionDashboard({ className }: SessionDashboardProps) {
  const {
    session,
    isLoading,
    error,
    refresh,
    terminate,
    extend,
    getActiveSessions,
    terminateSession,
  } = useSession();

  const { securityEvents } = useSessionSecurity();
  const { devices, trustDevice, revokeDevice } = useDeviceManagement();

  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      setIsRefreshing(true);
      const sessions = await getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      toast.error("Failed to load active sessions");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadActiveSessions();
    }
  }, [session]);

  // Calculate session health score
  const calculateHealthScore = (sessionData: UserSession): number => {
    let score = 100;

    // Deduct points for security issues
    const recentEvents = securityEvents.filter(
      (event) =>
        event.session_id === sessionData.id &&
        new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
    );

    score -= recentEvents.length * 10;

    // Deduct points for old sessions
    const sessionAge = Date.now() - new Date(sessionData.created_at).getTime();
    const hoursOld = sessionAge / (1000 * 60 * 60);
    if (hoursOld > 24) score -= 20;
    if (hoursOld > 48) score -= 30;

    // Deduct points for suspicious activity
    if (sessionData.security_flags && sessionData.security_flags.length > 0) {
      score -= sessionData.security_flags.length * 15;
    }

    return Math.max(0, Math.min(100, score));
  };

  // Get device icon
  const getDeviceIcon = (deviceType: DeviceType) => {
    switch (deviceType) {
      case DeviceType.MOBILE:
        return <Smartphone className="h-4 w-4" />;
      case DeviceType.TABLET:
        return <Smartphone className="h-4 w-4" />;
      case DeviceType.DESKTOP:
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get security severity color
  const getSeverityColor = (severity: SecuritySeverity) => {
    switch (severity) {
      case SecuritySeverity.LOW:
        return "text-green-600 bg-green-100";
      case SecuritySeverity.MEDIUM:
        return "text-yellow-600 bg-yellow-100";
      case SecuritySeverity.HIGH:
        return "text-red-600 bg-red-100";
      case SecuritySeverity.CRITICAL:
        return "text-red-800 bg-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading session data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load session data: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!session) {
    return (
      <Alert className="m-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription>No active session found. Please log in to continue.</AlertDescription>
      </Alert>
    );
  }

  const healthScore = calculateHealthScore(session);
  const timeUntilExpiry = new Date(session.expires_at).getTime() - Date.now();
  const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Session Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Session
              </CardTitle>
              <CardDescription>Session ID: {session.id}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  healthScore >= 80 ? "default" : healthScore >= 60 ? "secondary" : "destructive"
                }
              >
                Health: {healthScore}%
              </Badge>
              <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Session Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Started {formatDistanceToNow(new Date(session.created_at))} ago
              </p>
            </div>

            {/* Time Until Expiry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {minutesUntilExpiry > 0 ? `${minutesUntilExpiry}m remaining` : "Expired"}
                </span>
              </div>
              <Progress
                value={Math.max(0, (minutesUntilExpiry / (session.timeout_minutes || 30)) * 100)}
                className="h-2"
              />
            </div>

            {/* Device Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getDeviceIcon(session.device_type)}
                <span className="text-sm font-medium">{session.device_name}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {session.ip_address}
              </div>
            </div>
          </div>

          <Separator />

          {/* Session Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => extend(30)}>
              <Plus className="h-4 w-4 mr-1" />
              Extend 30min
            </Button>
            <Button variant="outline" size="sm" onClick={() => extend(60)}>
              <Plus className="h-4 w-4 mr-1" />
              Extend 1hr
            </Button>
            <Button variant="destructive" size="sm" onClick={terminate}>
              <LogOut className="h-4 w-4 mr-1" />
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="devices">Trusted Devices</TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Active Sessions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadActiveSessions}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((activeSession) => (
                    <TableRow key={activeSession.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(activeSession.device_type)}
                          <div>
                            <p className="font-medium">{activeSession.device_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {activeSession.user_agent?.split(" ")[0]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{activeSession.ip_address}</span>
                        </div>
                        {activeSession.location && (
                          <p className="text-xs text-muted-foreground">{activeSession.location}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {format(new Date(activeSession.created_at), "MMM dd, HH:mm")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activeSession.created_at))} ago
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {activeSession.id === session.id ? (
                            <Badge variant="default">Current</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                          {activeSession.is_trusted && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedSession(activeSession)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {activeSession.id !== session.id && (
                              <DropdownMenuItem
                                onClick={() => terminateSession(activeSession.id)}
                                className="text-red-600"
                              >
                                <LogOut className="h-4 w-4 mr-2" />
                                Terminate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Security events from the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 ${
                        event.severity === SecuritySeverity.HIGH ||
                        event.severity === SecuritySeverity.CRITICAL
                          ? "text-red-600"
                          : event.severity === SecuritySeverity.MEDIUM
                            ? "text-yellow-600"
                            : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.event_type}</p>
                        <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2" />
                    <p>No security events recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trusted Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trusted Devices</CardTitle>
              <CardDescription>Manage devices that can access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device_type)}
                      <div>
                        <p className="font-medium">{device.device_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last seen: {formatDistanceToNow(new Date(device.last_seen))} ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.is_trusted ? (
                        <Badge variant="default">Trusted</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!device.is_trusted && (
                            <DropdownMenuItem onClick={() => trustDevice(device.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Trust Device
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => revokeDevice(device.id)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {devices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Smartphone className="h-8 w-8 mx-auto mb-2" />
                    <p>No trusted devices found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Details Dialog */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
              <DialogDescription>
                Detailed information about session {selectedSession.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session ID</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Device</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.device_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm text-muted-foreground">{selectedSession.ip_address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedSession.created_at), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedSession.expires_at), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
              </div>
              {selectedSession.user_agent && (
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="text-sm text-muted-foreground break-all">
                    {selectedSession.user_agent}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
