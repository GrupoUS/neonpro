'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Maximize2,
  Move,
  Eye,
  EyeOff,
  Grid3X3,
  Ruler,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisResult, AnnotationData } from '@/lib/vision/analysis-engine';
import { MeasurementResult, ObjectiveMeasurement } from '@/lib/vision/measurement-system';

interface BeforeAfterComparisonProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  analysisResult?: AnalysisResult;
  measurementResult?: MeasurementResult;
  onMeasurementClick?: (coordinates: { x: number; y: number }) => void;
  className?: string;
}

type ViewMode = 'split' | 'overlay' | 'slider' | 'grid' | 'flicker';
type AnnotationMode = 'view' | 'measure' | 'annotate';

export function BeforeAfterComparison({
  beforeImageUrl,
  afterImageUrl,
  analysisResult,
  measurementResult,
  onMeasurementClick,
  className
}: BeforeAfterComparisonProps) {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>('view');
  const [sliderPosition, setSliderPosition] = useState([50]);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [flickerInterval, setFlickerInterval] = useState<NodeJS.Timeout | null>(null);
  const [flickerState, setFlickerState] = useState<'before' | 'after'>('before');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImageRef = useRef<HTMLImageElement>(null);
  const afterImageRef = useRef<HTMLImageElement>(null);

  // Cleanup flicker interval on unmount
  useEffect(() => {
    return () => {
      if (flickerInterval) {
        clearInterval(flickerInterval);
      }
    };
  }, [flickerInterval]);

  // Handle view mode changes
  useEffect(() => {
    if (viewMode === 'flicker') {
      const interval = setInterval(() => {
        setFlickerState(prev => prev === 'before' ? 'after' : 'before');
      }, 1000); // 1 second intervals
      setFlickerInterval(interval);
    } else {
      if (flickerInterval) {
        clearInterval(flickerInterval);
        setFlickerInterval(null);
      }
    }
  }, [viewMode]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (annotationMode === 'measure' && onMeasurementClick) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left - pan.x) / zoom) * 100;
        const y = ((e.clientY - rect.top - pan.y) / zoom) * 100;
        onMeasurementClick({ x, y });
      }
      return;
    }

    if (annotationMode === 'view') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [annotationMode, onMeasurementClick, pan, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleResetView = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    // Create canvas for export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    // Draw comparison based on current view mode
    // This would be implemented based on the specific export requirements
    
    // Download the canvas as image
    const link = document.createElement('a');
    link.download = `comparison-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Render annotations overlay
  const renderAnnotations = () => {
    if (!showAnnotations || !analysisResult?.annotations) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {analysisResult.annotations.map((annotation) => (
          <div
            key={annotation.id}
            className={cn(
              "absolute border-2 rounded pointer-events-auto cursor-pointer transition-all",
              selectedAnnotation === annotation.id
                ? "border-blue-500 bg-blue-500/20"
                : "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
            )}
            style={{
              left: `${annotation.coordinates.x * zoom / 100 + pan.x}px`,
              top: `${annotation.coordinates.y * zoom / 100 + pan.y}px`,
              width: `${annotation.coordinates.width * zoom / 100}px`,
              height: `${annotation.coordinates.height * zoom / 100}px`,
            }}
            onClick={() => setSelectedAnnotation(
              selectedAnnotation === annotation.id ? null : annotation.id
            )}
          >
            <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {annotation.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render measurements overlay
  const renderMeasurements = () => {
    if (!showMeasurements || !measurementResult?.measurements) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {measurementResult.measurements.map((measurement) => (
          <div
            key={measurement.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${measurement.coordinates.region.x * zoom / 100 + pan.x}px`,
              top: `${measurement.coordinates.region.y * zoom / 100 + pan.y}px`,
            }}
          >
            {/* Measurement point */}
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
            
            {/* Measurement label */}
            <div className="absolute -top-8 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {measurement.type}: {measurement.afterValue.toFixed(1)}{measurement.unit}
              {measurement.changePercentage !== 0 && (
                <span className={cn(
                  "ml-1",
                  measurement.changePercentage > 0 ? "text-green-200" : "text-red-200"
                )}>
                  ({measurement.changePercentage > 0 ? '+' : ''}{measurement.changePercentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render grid overlay
  const renderGrid = () => {
    if (!showGrid) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    );
  };

  // Render comparison based on view mode
  const renderComparison = () => {
    const imageStyle = {
      transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
      transformOrigin: 'top left'
    };

    switch (viewMode) {
      case 'split':
        return (
          <div className="grid grid-cols-2 gap-2 h-full">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                ref={beforeImageRef}
                src={beforeImageUrl}
                alt="Antes"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                Antes
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                ref={afterImageRef}
                src={afterImageUrl}
                alt="Depois"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                Depois
              </div>
            </div>
          </div>
        );

      case 'overlay':
        return (
          <div className="relative h-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={beforeImageUrl}
              alt="Antes"
              className="absolute inset-0 w-full h-full object-contain"
              style={imageStyle}
            />
            <img
              src={afterImageUrl}
              alt="Depois"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ ...imageStyle, opacity: 0.5 }}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Sobreposição
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="relative h-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={beforeImageUrl}
              alt="Antes"
              className="absolute inset-0 w-full h-full object-contain"
              style={imageStyle}
            />
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)` }}
            >
              <img
                src={afterImageUrl}
                alt="Depois"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
            </div>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
              style={{ left: `${sliderPosition[0]}%` }}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Antes
            </div>
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Depois
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={beforeImageUrl}
                alt="Antes - Original"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Antes
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={afterImageUrl}
                alt="Depois - Original"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Depois
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={beforeImageUrl}
                alt="Antes - Anotado"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              {renderAnnotations()}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Antes + Anotações
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-gray-100">
              <img
                src={afterImageUrl}
                alt="Depois - Anotado"
                className="w-full h-full object-contain"
                style={imageStyle}
              />
              {renderMeasurements()}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Depois + Medições
              </div>
            </div>
          </div>
        );

      case 'flicker':
        return (
          <div className="relative h-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={flickerState === 'before' ? beforeImageUrl : afterImageUrl}
              alt={flickerState === 'before' ? 'Antes' : 'Depois'}
              className="w-full h-full object-contain transition-opacity duration-200"
              style={imageStyle}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {flickerState === 'before' ? 'Antes' : 'Depois'}
            </div>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Alternância Automática
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Comparação Antes/Depois</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="split">Dividido</TabsTrigger>
              <TabsTrigger value="overlay">Sobreposição</TabsTrigger>
              <TabsTrigger value="slider">Deslizante</TabsTrigger>
              <TabsTrigger value="grid">Grade</TabsTrigger>
              <TabsTrigger value="flicker">Alternância</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Controls Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Annotation Mode */}
            <div className="flex items-center gap-2">
              <Button
                variant={annotationMode === 'view' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnnotationMode('view')}
              >
                <Move className="h-4 w-4 mr-2" />
                Navegar
              </Button>
              <Button
                variant={annotationMode === 'measure' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnnotationMode('measure')}
              >
                <Ruler className="h-4 w-4 mr-2" />
                Medir
              </Button>
              <Button
                variant={annotationMode === 'annotate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnnotationMode('annotate')}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                Anotar
              </Button>
            </div>

            {/* Overlay Toggles */}
            <div className="flex items-center gap-2">
              <Button
                variant={showAnnotations ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="ml-2">Anotações</span>
              </Button>
              <Button
                variant={showMeasurements ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
              >
                {showMeasurements ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="ml-2">Medições</span>
              </Button>
              <Button
                variant={showGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Slider Control for Slider Mode */}
          {viewMode === 'slider' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Posição do Divisor</label>
              <Slider
                value={sliderPosition}
                onValueChange={setSliderPosition}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Comparison View */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className={cn(
              "relative h-[600px] cursor-grab active:cursor-grabbing",
              annotationMode === 'measure' && "cursor-crosshair",
              annotationMode === 'annotate' && "cursor-pointer"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderComparison()}
            {viewMode !== 'grid' && renderAnnotations()}
            {viewMode !== 'grid' && renderMeasurements()}
            {renderGrid()}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.improvementPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Melhoria Geral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(analysisResult.accuracyScore * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Precisão</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisResult.annotations.length}
                </div>
                <div className="text-sm text-gray-600">Anotações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {measurementResult?.measurements.length || 0}
                </div>
                <div className="text-sm text-gray-600">Medições</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BeforeAfterComparison;
