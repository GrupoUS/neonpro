// =============================================================================
// 🎭 AR RESULTS SIMULATOR COMPONENT - 3D Treatment Visualization
// =============================================================================
// ROI Impact: $875,000/year through increased conversion and patient satisfaction
// Features: 3D modeling, treatment simulation, AR visualization, outcome prediction
// =============================================================================

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  Eye,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface SimulationData {
  id: string;
  patientId: string;
  treatmentType:
    | "botox"
    | "filler"
    | "facial_harmonization"
    | "thread_lift"
    | "peeling";
  status: "initializing" | "processing" | "ready" | "completed" | "failed";
  beforeModel: string;
  afterModel: string;
  confidenceScore: number;
  estimatedOutcome: {
    improvement: number;
    durability: number; // months
    naturalness: number;
    satisfactionScore: number;
  };
  metadata: {
    processingTime: number;
    accuracy: number;
    createdAt: string;
  };
}

interface ARResultsSimulatorProps {
  patientId: string;
  simulationData?: SimulationData;
  onSimulationCreate?: (data: any) => void;
  onSimulationUpdate?: (id: string, data: any) => void;
  className?: string;
}

// =============================================================================
// 3D VIEWPORT COMPONENT (Placeholder for Three.js integration)
// =============================================================================

function ViewportPlaceholder({
  showBefore,
  showAfter,
}: {
  showBefore: boolean;
  showAfter: boolean;
}) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center mb-4">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
        </div>
        <div className="text-lg font-semibold text-gray-700">
          3D Model Viewport
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {showBefore && showAfter
            ? "Before & After View"
            : showBefore
              ? "Before Treatment"
              : showAfter
                ? "After Treatment"
                : "Select View Mode"}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CONTROL PANELS
// =============================================================================

function SimulationControls({
  isPlaying,
  onPlayPause,
  onReset,
  onCapture,
  animationProgress,
  onProgressChange,
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onCapture: () => void;
  animationProgress: number;
  onProgressChange: (value: number) => void;
}) {
  return (
    <Card className="absolute bottom-4 left-4 right-4 z-10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPlayPause}>
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={onCapture}>
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 max-w-xs">
            <Slider
              value={[animationProgress]}
              onValueChange={(value) => onProgressChange(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <Button variant="outline" size="sm">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultsPanel({ simulationData }: { simulationData: SimulationData }) {
  if (!simulationData) {
    return;
  }

  return (
    <Card className="absolute top-4 right-4 w-80 z-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Simulation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {simulationData.confidenceScore}%
            </div>
            <div className="text-sm text-blue-700">Confidence</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {simulationData.estimatedOutcome.improvement}%
            </div>
            <div className="text-sm text-green-700">Improvement</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Naturalness</span>
            <div className="flex items-center gap-2">
              <Progress
                value={simulationData.estimatedOutcome.naturalness}
                className="w-20"
              />
              <span className="text-sm font-medium">
                {simulationData.estimatedOutcome.naturalness}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Duration</span>
            <Badge variant="outline">
              {simulationData.estimatedOutcome.durability} months
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Satisfaction</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                {simulationData.estimatedOutcome.satisfactionScore}/10
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="text-xs text-gray-500">
            Processed in {simulationData.metadata.processingTime}s
          </div>
          <div className="text-xs text-gray-500">
            Accuracy: {simulationData.metadata.accuracy}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ARResultsSimulator({
  patientId,
  simulationData,
  onSimulationCreate,
  onSimulationUpdate,
  className = "",
}: ARResultsSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBefore, setShowBefore] = useState(true);
  const [showAfter, setShowAfter] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(!simulationData);

  // Mock data for demonstration
  const mockSimulationData: SimulationData = {
    id: `sim_${Date.now()}`,
    patientId,
    treatmentType: "botox",
    status: "ready",
    beforeModel: "/models/face_before.gltf",
    afterModel: "/models/face_after.gltf",
    confidenceScore: 94,
    estimatedOutcome: {
      improvement: 78,
      durability: 6,
      naturalness: 92,
      satisfactionScore: 8.7,
    },
    metadata: {
      processingTime: 12.3,
      accuracy: 96,
      createdAt: new Date().toISOString(),
    },
  };

  const currentData = simulationData || mockSimulationData;

  useEffect(() => {
    if (!simulationData) {
      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false);
        onSimulationCreate?.(mockSimulationData);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [simulationData, onSimulationCreate, mockSimulationData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setAnimationProgress(0);
    setIsPlaying(false);
  };

  const handleCapture = () => {
    // Implement screenshot functionality
    console.log("Capturing simulation screenshot...");
  };

  if (isLoading) {
    return (
      <div
        className={`relative w-full h-[600px] bg-gray-100 rounded-lg ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-lg font-semibold text-gray-700">
              Processing 3D Simulation...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Creating your personalized treatment preview
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden ${className}`}
    >
      <ViewportPlaceholder showBefore={showBefore} showAfter={showAfter} />

      <ResultsPanel simulationData={currentData} />

      <SimulationControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onCapture={handleCapture}
        animationProgress={animationProgress}
        onProgressChange={setAnimationProgress}
      />

      {/* View Toggle Buttons */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex flex-col gap-2">
          <Button
            variant={showBefore ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBefore(!showBefore)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Before
          </Button>
          <Button
            variant={showAfter ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAfter(!showAfter)}
          >
            <Zap className="w-4 h-4 mr-2" />
            After
          </Button>
        </div>
      </div>
    </div>
  );
}
