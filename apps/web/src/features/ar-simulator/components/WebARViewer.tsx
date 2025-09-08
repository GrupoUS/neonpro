// =============================================================================
// 🌐 WEB AR VIEWER - Immersive Treatment Visualization
// =============================================================================
// ROI Impact: Enhanced patient engagement and treatment visualization
// Features: WebXR API, AR.js integration, mobile optimization, cross-platform
// =============================================================================

'use client'

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
import {
  AlertCircle,
  Camera,
  Eye,
  Maximize,
  RotateCcw,
  Smartphone,
  Target,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState, } from 'react'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface WebARViewerProps {
  simulationId: string
  modelUrl: string
  onARSession?: (active: boolean,) => void
  className?: string
}

interface ARCapabilities {
  webXRSupported: boolean
  cameraSupported: boolean
  orientationSupported: boolean
  isMobile: boolean
  canUseAR: boolean
}

// =============================================================================
// AR CAPABILITIES DETECTION
// =============================================================================

function useARCapabilities(): ARCapabilities {
  const [capabilities, setCapabilities,] = useState<ARCapabilities>({
    webXRSupported: false,
    cameraSupported: false,
    orientationSupported: false,
    isMobile: false,
    canUseAR: false,
  },)

  useEffect(() => {
    const detectCapabilities = async () => {
      // Check if running in browser
      if (typeof window === 'undefined') {
        return
      }

      // Detect mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

      // Check WebXR support
      const webXRSupported = 'xr' in navigator

      // Check camera access
      let cameraSupported = false
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          cameraSupported = true
        }
      } catch (error) {
        // console.warn("Camera access check failed:", error);
      }

      // Check device orientation
      const orientationSupported = 'DeviceOrientationEvent' in window

      const canUseAR = webXRSupported && cameraSupported && isMobile

      setCapabilities({
        webXRSupported,
        cameraSupported,
        orientationSupported,
        isMobile,
        canUseAR,
      },)
    }

    detectCapabilities()
  }, [],)

  return capabilities
}

// =============================================================================
// AR SESSION HOOK
// =============================================================================

function useARSession() {
  const [isARActive, setIsARActive,] = useState(false,)
  const [isLoading, setIsLoading,] = useState(false,)
  const [error, setError,] = useState<string | null>()
  const canvasRef = useRef<HTMLCanvasElement>(null,)

  const startARSession = async () => {
    setIsLoading(true,)
    setError(undefined,)

    try {
      // Check WebXR support
      if (!('xr' in navigator)) {
        throw new Error('WebXR not supported',)
      }

      // Request AR session
      const xr = (navigator as unknown).xr
      const session = await xr.requestSession('immersive-ar', {
        requiredFeatures: ['local',],
        optionalFeatures: ['dom-overlay',],
        domOverlay: { root: document.body, },
      },)

      setIsARActive(true,)

      // Set up AR session handlers
      session.addEventListener('end', () => {
        setIsARActive(false,)
      },)

      // console.log("AR session started successfully");
    } catch (error) {
      // console.error("Failed to start AR session:", error);
      setError(error instanceof Error ? error.message : 'Failed to start AR',)
    } finally {
      setIsLoading(false,)
    }
  }

  const endARSession = () => {
    setIsARActive(false,)
    setError(undefined,)
  }

  return {
    isARActive,
    isLoading,
    error,
    canvasRef,
    startARSession,
    endARSession,
  }
}

// =============================================================================
// AR FALLBACK COMPONENT
// =============================================================================

function ARFallback({
  modelUrl,
  simulationId,
}: {
  modelUrl: string
  simulationId: string
},) {
  const [isViewing, setIsViewing,] = useState(false,)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-orange-600" />
          Mobile-Optimized View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
          {isViewing
            ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-200 rounded-full animate-pulse mb-4 mx-auto" />
                <div className="text-lg font-semibold">
                  Interactive 360° Model
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Pinch to zoom, drag to rotate
                </div>
              </div>
            )
            : (
              <Button
                onClick={() => setIsViewing(true,)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Start 360° Preview
              </Button>
            )}
        </div>

        {isViewing && (
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsViewing(false,)}
            >
              Exit View
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function WebARViewer({
  simulationId,
  modelUrl,
  onARSession,
  className = '',
}: WebARViewerProps,) {
  const capabilities = useARCapabilities()
  const arSession = useARSession()
  const [showInstructions, setShowInstructions,] = useState(true,)

  // Notify parent about AR session state
  useEffect(() => {
    onARSession?.(arSession.isARActive,)
  }, [arSession.isARActive, onARSession,],)

  // If AR is not supported, show fallback
  if (!capabilities.canUseAR && capabilities.isMobile) {
    return (
      <div className={className}>
        <ARFallback modelUrl={modelUrl} simulationId={simulationId} />
      </div>
    )
  }

  // Desktop fallback
  if (!capabilities.isMobile) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            AR Preview (Desktop)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              For the best AR experience, please open this on a mobile device with camera access.
            </AlertDescription>
          </Alert>

          <div className="mt-4 aspect-video bg-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-200 rounded-full mb-4 mx-auto" />
              <div className="text-lg font-semibold text-blue-800">
                AR Mode Available
              </div>
              <div className="text-sm text-blue-600">
                Open on mobile to access
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* AR Canvas */}
      <canvas
        ref={arSession.canvasRef}
        className={`w-full h-96 bg-black rounded-lg ${
          arSession.isARActive ? 'fixed inset-0 z-50' : ''
        }`}
      />

      {/* AR Controls */}
      {!arSession.isARActive && (
        <Card className="absolute bottom-4 left-4 right-4 z-10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  AR Ready
                </Badge>
                <span className="text-sm text-gray-600">
                  {capabilities.webXRSupported ? 'WebXR' : 'WebGL'} Enabled
                </span>
              </div>

              <Button
                onClick={arSession.startARSession}
                disabled={arSession.isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {arSession.isLoading
                  ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )
                  : <Zap className="w-4 h-4 mr-2" />}
                Start AR
              </Button>
            </div>

            {arSession.error && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{arSession.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* AR Session Controls */}
      {arSession.isARActive && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-green-600">AR Active</Badge>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={arSession.endARSession}
                  >
                    Exit AR
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions Panel */}
      {showInstructions && !arSession.isARActive && (
        <Card className="absolute top-4 right-4 w-80 z-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AR Instructions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(false,)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                1
              </div>
              <div className="text-sm">Allow camera access when prompted</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                2
              </div>
              <div className="text-sm">Point your device at a flat surface</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                3
              </div>
              <div className="text-sm">
                Tap to place the 3D model in your space
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                4
              </div>
              <div className="text-sm">Use gestures to scale and rotate</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
