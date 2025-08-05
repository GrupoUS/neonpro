/**
 * Barcode Scanner Component
 * Real-time barcode/QR code scanner with manual input fallback
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */

"use client";

import type {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Flashlight,
  FlashlightOff,
  Keyboard,
  RotateCw,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { useBarcode } from "@/hooks/inventory/use-barcode";
import type { BarcodeResult, ScannerError } from "@/lib/types/inventory";

interface BarcodeScannerProps {
  onScan: (result: BarcodeResult) => void;
  onError?: (error: ScannerError) => void;
  continuous?: boolean;
  showHistory?: boolean;
  showManualInput?: boolean;
  autoStart?: boolean;
  className?: string;
  style?: React.CSSProperties;

  // Scanner configuration
  beepOnScan?: boolean;
  vibrationOnScan?: boolean;
  preferredCameraFacing?: "user" | "environment";

  // UI Configuration
  height?: number;
  width?: number;
  borderRadius?: number;
  showControls?: boolean;
  showPreview?: boolean;
}

export function BarcodeScanner({
  onScan,
  onError,
  continuous = true,
  showHistory = true,
  showManualInput = true,
  autoStart = false,
  className = "",
  style,
  beepOnScan = true,
  vibrationOnScan = true,
  preferredCameraFacing = "environment",
  height = 300,
  width = 400,
  borderRadius = 8,
  showControls = true,
  showPreview = true,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);

  const {
    isScanning,
    isInitialized,
    hasPermission,
    error,
    lastResult,
    scanHistory,
    startScanning,
    stopScanning,
    toggleScanning,
    switchCamera,
    availableCameras,
    currentCamera,
    configuration,
    updateConfiguration,
    clearHistory,
    clearError,
    processManualInput,
  } = useBarcode({
    enableContinuousScanning: continuous,
    onScanSuccess: onScan,
    onScanError: onError,
    beepOnScan,
    vibrationOnScan,
  });

  // Initialize scanner configuration
  useEffect(() => {
    updateConfiguration({
      preferredCameraFacing,
    });
  }, [preferredCameraFacing, updateConfiguration]);

  // Auto-start scanner
  useEffect(() => {
    if (autoStart && isInitialized && hasPermission && videoRef.current) {
      startScanning(videoRef.current);
    }
  }, [autoStart, isInitialized, hasPermission, startScanning]);

  // Handle manual input submission
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      processManualInput(manualInput.trim());
      setManualInput("");
      setShowManualEntry(false);
    }
  };

  // Handle flashlight toggle
  const toggleFlashlight = async () => {
    if (isScanning && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      if (track && "torch" in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any],
          });
          setFlashlightOn(!flashlightOn);
        } catch (error) {
          console.warn("Flashlight not supported or failed:", error);
        }
      }
    }
  };

  // Start scanning with video element
  const handleStartScanning = () => {
    if (videoRef.current) {
      startScanning(videoRef.current);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`barcode-scanner ${className}`} style={style}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Barcode Scanner
            </span>

            {isScanning && (
              <Badge variant="secondary" className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Scanning
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                {error.message}
                <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Video Preview */}
          {showPreview && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border-2 border-dashed border-gray-300"
                style={{
                  height: `${height}px`,
                  maxWidth: `${width}px`,
                  borderRadius: `${borderRadius}px`,
                  objectFit: "cover",
                }}
              />

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-red-500 rounded-lg">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse mt-24" />
                    </div>
                  </div>
                </div>
              )}

              {/* Last Scan Result Overlay */}
              {lastResult && (
                <div className="absolute top-2 left-2 right-2">
                  <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium truncate">{lastResult.data}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          {showControls && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={isScanning ? stopScanning : handleStartScanning}
                variant={isScanning ? "destructive" : "default"}
                disabled={!isInitialized || !hasPermission}
              >
                {isScanning ? (
                  <>
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>

              {availableCameras.length > 1 && (
                <Button onClick={switchCamera} variant="outline" disabled={!isInitialized}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
              )}

              <Button onClick={toggleFlashlight} variant="outline" disabled={!isScanning}>
                {flashlightOn ? (
                  <>
                    <FlashlightOff className="h-4 w-4 mr-2" />
                    Flash Off
                  </>
                ) : (
                  <>
                    <Flashlight className="h-4 w-4 mr-2" />
                    Flash On
                  </>
                )}
              </Button>

              {showManualInput && (
                <Button onClick={() => setShowManualEntry(!showManualEntry)} variant="outline">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              )}

              {showHistory && scanHistory.length > 0 && (
                <Button onClick={clearHistory} variant="outline" size="sm">
                  Clear History
                </Button>
              )}
            </div>
          )}

          {/* Manual Input */}
          {showManualEntry && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter barcode manually..."
                    onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          {showHistory && scanHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Scans ({scanHistory.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scanHistory.slice(0, 10).map((scan, index) => (
                    <div
                      key={`${scan.timestamp}-${index}`}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {scan.format}
                        </Badge>
                        <span className="font-mono truncate max-w-48">{scan.data}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatTimestamp(scan.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Info */}
          {currentCamera && (
            <div className="text-xs text-gray-500 text-center">
              Camera: {currentCamera.label || "Unknown Camera"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BarcodeScanner;
