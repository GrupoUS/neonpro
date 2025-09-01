"use client";

/**
 * Cross-Device Continuity Demo System
 * T3.3: Cross-Device Continuity e QR Handoff System
 *
 * Comprehensive demo showcasing all cross-device features
 * Features:
 * - QR code generation and scanning simulation
 * - Real-time session synchronization display
 * - Conflict resolution scenarios
 * - Offline queue management simulation
 * - Multi-device dashboard
 * - Healthcare-specific use cases
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Monitor,
  Pill,
  QrCode,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// Import our cross-device components
import ConflictResolver from "./ConflictResolver";
import OfflineQueueManager from "./OfflineQueueManager";
import QRHandoffGenerator from "./QRHandoffGenerator";
import SessionSyncManager from "./SessionSyncManager";

// Demo Types
interface DemoDevice {
  id: string;
  name: string;
  type: "mobile" | "tablet" | "desktop";
  isActive: boolean;
  lastSeen: number;
  location?: string;
  currentPage: string;
  batteryLevel?: number;
}

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  steps: DemoStep[];
  category: "handoff" | "sync" | "conflict" | "offline";
}

interface DemoStep {
  id: string;
  title: string;
  description: string;
  action?: () => Promise<void>;
  completed: boolean;
}

export interface CrossDeviceDemoProps {
  className?: string;
  emergencyMode?: boolean;
  demoUserId?: string;
}

// Mock demo data
const mockDevices: DemoDevice[] = [
  {
    id: "device-1",
    name: "Dr. Silva - iPhone",
    type: "mobile",
    isActive: true,
    lastSeen: Date.now() - 30_000,
    location: "Emergency Room",
    currentPage: "/patients/123",
    batteryLevel: 78,
  },
  {
    id: "device-2",
    name: "Nurse Station - iPad",
    type: "tablet",
    isActive: true,
    lastSeen: Date.now() - 120_000,
    location: "Ward 2A",
    currentPage: "/medications",
    batteryLevel: 45,
  },
  {
    id: "device-3",
    name: "Reception Desk",
    type: "desktop",
    isActive: false,
    lastSeen: Date.now() - 600_000,
    location: "Main Reception",
    currentPage: "/appointments",
  },
];

const demoScenarios: DemoScenario[] = [
  {
    id: "emergency-handoff",
    name: "Emergency Patient Handoff",
    description: "Transfer critical patient data from mobile to desktop during emergency",
    category: "handoff",
    steps: [
      {
        id: "1",
        title: "Generate QR Code",
        description: "Doctor generates QR on mobile with patient data",
        completed: false,
      },
      {
        id: "2",
        title: "Scan on Desktop",
        description: "Reception desk scans QR code",
        completed: false,
      },
      {
        id: "3",
        title: "Transfer Session",
        description: "Patient context transferred securely",
        completed: false,
      },
      {
        id: "4",
        title: "Continue Workflow",
        description: "Desktop continues from exact same state",
        completed: false,
      },
    ],
  },
  {
    id: "medication-sync",
    name: "Medication List Sync",
    description: "Real-time medication updates across all devices",
    category: "sync",
    steps: [
      {
        id: "1",
        title: "Update on Mobile",
        description: "Doctor adds new medication on mobile",
        completed: false,
      },
      {
        id: "2",
        title: "Real-time Sync",
        description: "Change propagated to all connected devices",
        completed: false,
      },
      {
        id: "3",
        title: "Notification",
        description: "Nurses receive medication update notification",
        completed: false,
      },
      {
        id: "4",
        title: "Verification",
        description: "All devices show consistent medication list",
        completed: false,
      },
    ],
  },
  {
    id: "concurrent-conflict",
    name: "Concurrent Edit Conflict",
    description: "Handle simultaneous edits to patient record",
    category: "conflict",
    steps: [
      {
        id: "1",
        title: "Simultaneous Edits",
        description: "Two devices edit same patient field",
        completed: false,
      },
      {
        id: "2",
        title: "Conflict Detection",
        description: "System detects conflicting changes",
        completed: false,
      },
      {
        id: "3",
        title: "Resolution Options",
        description: "Present merge/overwrite options",
        completed: false,
      },
      {
        id: "4",
        title: "Apply Resolution",
        description: "User resolves conflict, sync to all devices",
        completed: false,
      },
    ],
  },
  {
    id: "offline-queue",
    name: "Offline Action Queue",
    description: "Queue actions while offline, sync when connected",
    category: "offline",
    steps: [
      {
        id: "1",
        title: "Go Offline",
        description: "Mobile device loses connection",
        completed: false,
      },
      {
        id: "2",
        title: "Queue Actions",
        description: "Continue working, actions queued locally",
        completed: false,
      },
      {
        id: "3",
        title: "Reconnect",
        description: "Device regains internet connection",
        completed: false,
      },
      {
        id: "4",
        title: "Sync Queue",
        description: "All queued actions processed and synced",
        completed: false,
      },
    ],
  },
];

export default function CrossDeviceDemo({
  className,
  emergencyMode = false,
  demoUserId = "demo-user-123",
}: CrossDeviceDemoProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [devices, setDevices] = useState<DemoDevice[]>(mockDevices);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [demoSessionData, setDemoSessionData] = useState({
    patientId: "patient-123",
    patientName: "Maria Santos",
    currentDiagnosis: "Hypertension",
    currentPage: "/patients/123",
    formData: {
      bloodPressure: "140/90",
      heartRate: "78",
      temperature: "37.2°C",
    },
  });

  // Simulate device activity
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev =>
        prev.map(device => ({
          ...device,
          lastSeen: device.isActive ? Date.now() : device.lastSeen,
          batteryLevel: device.type === "mobile" && device.batteryLevel
            ? Math.max(device.batteryLevel - Math.random() * 2, 10)
            : device.batteryLevel,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get scenario icon
  const getScenarioIcon = (category: string) => {
    switch (category) {
      case "handoff":
        return <QrCode className="h-5 w-5" />;
      case "sync":
        return <RefreshCw className="h-5 w-5" />;
      case "conflict":
        return <AlertTriangle className="h-5 w-5" />;
      case "offline":
        return <Activity className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  // Run scenario simulation
  const runScenario = useCallback(async (scenario: DemoScenario) => {
    setIsRunning(true);
    setCurrentStep(0);

    for (let i = 0; i < scenario.steps.length; i++) {
      setCurrentStep(i);

      // Simulate step execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark step as completed
      scenario.steps[i].completed = true;

      // Simulate specific actions for each step
      if (scenario.category === "handoff" && i === 1) {
        // Simulate QR scan
        setDemoSessionData(prev => ({ ...prev, currentPage: "/reception/handoff" }));
      }
    }

    setIsRunning(false);
  }, []);

  // Reset scenario
  const resetScenario = useCallback((scenario: DemoScenario) => {
    scenario.steps.forEach(step => {
      step.completed = false;
    });
    setCurrentStep(0);
  }, []);

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {return `${seconds}s ago`;}
    if (minutes < 60) {return `${minutes}m ago`;}
    if (hours < 24) {return `${hours}h ago`;}
    return `${days}d ago`;
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card className={emergencyMode ? "border-2 border-blue-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Cross-Device Continuity Demo
            {emergencyMode && <Badge variant="destructive">Emergency Mode</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Experience seamless healthcare workflows across multiple devices with secure handoffs,
            real-time synchronization, and intelligent conflict resolution.
          </p>
        </CardContent>
      </Card>

      {/* Main Demo Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls and Scenarios */}
        <div className="space-y-6">
          {/* Device Status Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.type)}
                    <div>
                      <div className="font-medium text-sm">{device.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {device.location} • {formatTimeAgo(device.lastSeen)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.batteryLevel && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(device.batteryLevel)}%
                      </Badge>
                    )}
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        device.isActive ? "bg-green-500" : "bg-gray-400",
                      )}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Demo Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Demo Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoScenarios.map((scenario) => (
                <div key={scenario.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getScenarioIcon(scenario.category)}
                      <div>
                        <h3 className="font-medium text-sm">{scenario.name}</h3>
                        <p className="text-xs text-muted-foreground">{scenario.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {scenario.category}
                    </Badge>
                  </div>

                  {/* Scenario Steps */}
                  <div className="space-y-2">
                    {scenario.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold",
                            step.completed
                              ? "bg-green-500 text-white"
                              : selectedScenario?.id === scenario.id && index === currentStep
                                  && isRunning
                              ? "bg-blue-500 text-white animate-pulse"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {step.completed ? "✓" : index + 1}
                        </div>
                        <span
                          className={step.completed ? "line-through text-muted-foreground" : ""}
                        >
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Scenario Controls */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedScenario(scenario);
                        runScenario(scenario);
                      }}
                      disabled={isRunning}
                      className="flex-1"
                    >
                      {isRunning && selectedScenario?.id === scenario.id
                        ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Running...
                          </>
                        )
                        : (
                          "Run Demo"
                        )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        resetScenario(scenario)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Components */}
        <div className="space-y-6">
          {/* Component Showcase */}
          <Tabs defaultValue="handoff" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="handoff">Handoff</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
            </TabsList>

            <TabsContent value="handoff" className="mt-4 space-y-4">
              <QRHandoffGenerator
                emergencyMode={emergencyMode}
                sessionData={demoSessionData}
                onHandoffComplete={(targetDevice) => {
                  console.log("Demo: Handoff completed to", targetDevice);
                }}
              />
            </TabsContent>

            <TabsContent value="sync" className="mt-4 space-y-4">
              <SessionSyncManager
                emergencyMode={emergencyMode}
                userId={demoUserId}
                realTimeEnabled={false} // Demo mode
                onSyncStatusChange={(stats) => {
                  console.log("Demo: Sync status changed", stats);
                }}
              />
            </TabsContent>

            <TabsContent value="conflicts" className="mt-4 space-y-4">
              <ConflictResolver
                emergencyMode={emergencyMode}
                userId={demoUserId}
                conflicts={[]} // Demo mode with mock conflicts
                autoResolveEnabled={false}
                onConflictResolved={(conflictId, resolution) => {
                  console.log("Demo: Conflict resolved", conflictId, resolution);
                }}
              />
            </TabsContent>

            <TabsContent value="queue" className="mt-4 space-y-4">
              <OfflineQueueManager
                emergencyMode={emergencyMode}
                userId={demoUserId}
                autoProcessEnabled={false} // Demo mode
                onQueueProcessed={(processed, failed) => {
                  console.log("Demo: Queue processed", processed, failed);
                }}
              />
            </TabsContent>
          </Tabs>

          {/* Current Session Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Current Session Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient:</span>
                  <div className="font-medium">{demoSessionData.patientName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Diagnosis:</span>
                  <div className="font-medium">{demoSessionData.currentDiagnosis}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Vital Signs:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span>BP: {demoSessionData.formData.bloodPressure}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-500" />
                    <span>HR: {demoSessionData.formData.heartRate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Temp: {demoSessionData.formData.temperature}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This is a demo environment. QR codes and sync actions are simulated. In production,
              these would connect to real Supabase backend services.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
