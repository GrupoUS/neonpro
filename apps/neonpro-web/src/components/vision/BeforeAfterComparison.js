"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeforeAfterComparison = BeforeAfterComparison;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var slider_1 = require("@/components/ui/slider");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function BeforeAfterComparison(_a) {
  var beforeImageUrl = _a.beforeImageUrl,
    afterImageUrl = _a.afterImageUrl,
    analysisResult = _a.analysisResult,
    measurementResult = _a.measurementResult,
    onMeasurementClick = _a.onMeasurementClick,
    className = _a.className;
  // State management
  var _b = (0, react_1.useState)("split"),
    viewMode = _b[0],
    setViewMode = _b[1];
  var _c = (0, react_1.useState)("view"),
    annotationMode = _c[0],
    setAnnotationMode = _c[1];
  var _d = (0, react_1.useState)([50]),
    sliderPosition = _d[0],
    setSliderPosition = _d[1];
  var _e = (0, react_1.useState)(100),
    zoom = _e[0],
    setZoom = _e[1];
  var _f = (0, react_1.useState)({ x: 0, y: 0 }),
    pan = _f[0],
    setPan = _f[1];
  var _g = (0, react_1.useState)(true),
    showAnnotations = _g[0],
    setShowAnnotations = _g[1];
  var _h = (0, react_1.useState)(true),
    showMeasurements = _h[0],
    setShowMeasurements = _h[1];
  var _j = (0, react_1.useState)(false),
    showGrid = _j[0],
    setShowGrid = _j[1];
  var _k = (0, react_1.useState)(null),
    selectedAnnotation = _k[0],
    setSelectedAnnotation = _k[1];
  var _l = (0, react_1.useState)(false),
    isFullscreen = _l[0],
    setIsFullscreen = _l[1];
  var _m = (0, react_1.useState)(false),
    isDragging = _m[0],
    setIsDragging = _m[1];
  var _o = (0, react_1.useState)({ x: 0, y: 0 }),
    dragStart = _o[0],
    setDragStart = _o[1];
  var _p = (0, react_1.useState)(null),
    flickerInterval = _p[0],
    setFlickerInterval = _p[1];
  var _q = (0, react_1.useState)("before"),
    flickerState = _q[0],
    setFlickerState = _q[1];
  // Refs
  var containerRef = (0, react_1.useRef)(null);
  var beforeImageRef = (0, react_1.useRef)(null);
  var afterImageRef = (0, react_1.useRef)(null);
  // Cleanup flicker interval on unmount
  (0, react_1.useEffect)(
    function () {
      return function () {
        if (flickerInterval) {
          clearInterval(flickerInterval);
        }
      };
    },
    [flickerInterval],
  );
  // Handle view mode changes
  (0, react_1.useEffect)(
    function () {
      if (viewMode === "flicker") {
        var interval = setInterval(function () {
          setFlickerState(function (prev) {
            return prev === "before" ? "after" : "before";
          });
        }, 1000); // 1 second intervals
        setFlickerInterval(interval);
      } else {
        if (flickerInterval) {
          clearInterval(flickerInterval);
          setFlickerInterval(null);
        }
      }
    },
    [viewMode],
  );
  // Mouse event handlers
  var handleMouseDown = (0, react_1.useCallback)(
    function (e) {
      var _a;
      if (annotationMode === "measure" && onMeasurementClick) {
        var rect =
          (_a = containerRef.current) === null || _a === void 0
            ? void 0
            : _a.getBoundingClientRect();
        if (rect) {
          var x = ((e.clientX - rect.left - pan.x) / zoom) * 100;
          var y = ((e.clientY - rect.top - pan.y) / zoom) * 100;
          onMeasurementClick({ x: x, y: y });
        }
        return;
      }
      if (annotationMode === "view") {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [annotationMode, onMeasurementClick, pan, zoom],
  );
  var handleMouseMove = (0, react_1.useCallback)(
    function (e) {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );
  var handleMouseUp = (0, react_1.useCallback)(function () {
    setIsDragging(false);
  }, []);
  // Zoom controls
  var handleZoomIn = function () {
    return setZoom(function (prev) {
      return Math.min(prev + 25, 400);
    });
  };
  var handleZoomOut = function () {
    return setZoom(function (prev) {
      return Math.max(prev - 25, 25);
    });
  };
  var handleResetView = function () {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };
  // Fullscreen toggle
  var toggleFullscreen = function () {
    var _a;
    if (!document.fullscreenElement) {
      (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  // Export functionality
  var handleExport = function () {
    // Create canvas for export
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;
    // Draw comparison based on current view mode
    // This would be implemented based on the specific export requirements
    // Download the canvas as image
    var link = document.createElement("a");
    link.download = "comparison-".concat(Date.now(), ".png");
    link.href = canvas.toDataURL();
    link.click();
  };
  // Render annotations overlay
  var renderAnnotations = function () {
    if (
      !showAnnotations ||
      !(analysisResult === null || analysisResult === void 0 ? void 0 : analysisResult.annotations)
    )
      return null;
    return (
      <div className="absolute inset-0 pointer-events-none">
        {analysisResult.annotations.map(function (annotation) {
          return (
            <div
              key={annotation.id}
              className={(0, utils_1.cn)(
                "absolute border-2 rounded pointer-events-auto cursor-pointer transition-all",
                selectedAnnotation === annotation.id
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20",
              )}
              style={{
                left: "".concat((annotation.coordinates.x * zoom) / 100 + pan.x, "px"),
                top: "".concat((annotation.coordinates.y * zoom) / 100 + pan.y, "px"),
                width: "".concat((annotation.coordinates.width * zoom) / 100, "px"),
                height: "".concat((annotation.coordinates.height * zoom) / 100, "px"),
              }}
              onClick={function () {
                return setSelectedAnnotation(
                  selectedAnnotation === annotation.id ? null : annotation.id,
                );
              }}
            >
              <div className="absolute -top-6 left-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {annotation.description}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  // Render measurements overlay
  var renderMeasurements = function () {
    if (
      !showMeasurements ||
      !(measurementResult === null || measurementResult === void 0
        ? void 0
        : measurementResult.measurements)
    )
      return null;
    return (
      <div className="absolute inset-0 pointer-events-none">
        {measurementResult.measurements.map(function (measurement) {
          return (
            <div
              key={measurement.id}
              className="absolute pointer-events-auto"
              style={{
                left: "".concat((measurement.coordinates.region.x * zoom) / 100 + pan.x, "px"),
                top: "".concat((measurement.coordinates.region.y * zoom) / 100 + pan.y, "px"),
              }}
            >
              {/* Measurement point */}
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />

              {/* Measurement label */}
              <div className="absolute -top-8 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {measurement.type}: {measurement.afterValue.toFixed(1)}
                {measurement.unit}
                {measurement.changePercentage !== 0 && (
                  <span
                    className={(0, utils_1.cn)(
                      "ml-1",
                      measurement.changePercentage > 0 ? "text-green-200" : "text-red-200",
                    )}
                  >
                    ({measurement.changePercentage > 0 ? "+" : ""}
                    {measurement.changePercentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  // Render grid overlay
  var renderGrid = function () {
    if (!showGrid) return null;
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
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
  var renderComparison = function () {
    var imageStyle = {
      transform: "scale("
        .concat(zoom / 100, ") translate(")
        .concat(pan.x, "px, ")
        .concat(pan.y, "px)"),
      transformOrigin: "top left",
    };
    switch (viewMode) {
      case "split":
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
      case "overlay":
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
              style={__assign(__assign({}, imageStyle), { opacity: 0.5 })}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Sobreposição
            </div>
          </div>
        );
      case "slider":
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
              style={{ clipPath: "inset(0 ".concat(100 - sliderPosition[0], "% 0 0)") }}
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
              style={{ left: "".concat(sliderPosition[0], "%") }}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Antes
            </div>
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Depois
            </div>
          </div>
        );
      case "grid":
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
      case "flicker":
        return (
          <div className="relative h-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={flickerState === "before" ? beforeImageUrl : afterImageUrl}
              alt={flickerState === "before" ? "Antes" : "Depois"}
              className="w-full h-full object-contain transition-opacity duration-200"
              style={imageStyle}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {flickerState === "before" ? "Antes" : "Depois"}
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
    <div className={(0, utils_1.cn)("space-y-4", className)}>
      {/* Controls Header */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="text-lg">Comparação Antes/Depois</card_1.CardTitle>
            <div className="flex items-center gap-2">
              <button_1.Button variant="outline" size="sm" onClick={handleExport}>
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Exportar
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <lucide_react_1.Maximize2 className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* View Mode Tabs */}
          <tabs_1.Tabs
            value={viewMode}
            onValueChange={function (value) {
              return setViewMode(value);
            }}
          >
            <tabs_1.TabsList className="grid w-full grid-cols-5">
              <tabs_1.TabsTrigger value="split">Dividido</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="overlay">Sobreposição</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="slider">Deslizante</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="grid">Grade</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="flicker">Alternância</tabs_1.TabsTrigger>
            </tabs_1.TabsList>
          </tabs_1.Tabs>

          {/* Controls Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button_1.Button variant="outline" size="sm" onClick={handleZoomOut}>
                <lucide_react_1.ZoomOut className="h-4 w-4" />
              </button_1.Button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <button_1.Button variant="outline" size="sm" onClick={handleZoomIn}>
                <lucide_react_1.ZoomIn className="h-4 w-4" />
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={handleResetView}>
                <lucide_react_1.RotateCcw className="h-4 w-4" />
              </button_1.Button>
            </div>

            {/* Annotation Mode */}
            <div className="flex items-center gap-2">
              <button_1.Button
                variant={annotationMode === "view" ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setAnnotationMode("view");
                }}
              >
                <lucide_react_1.Move className="h-4 w-4 mr-2" />
                Navegar
              </button_1.Button>
              <button_1.Button
                variant={annotationMode === "measure" ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setAnnotationMode("measure");
                }}
              >
                <lucide_react_1.Ruler className="h-4 w-4 mr-2" />
                Medir
              </button_1.Button>
              <button_1.Button
                variant={annotationMode === "annotate" ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setAnnotationMode("annotate");
                }}
              >
                <lucide_react_1.MousePointer2 className="h-4 w-4 mr-2" />
                Anotar
              </button_1.Button>
            </div>

            {/* Overlay Toggles */}
            <div className="flex items-center gap-2">
              <button_1.Button
                variant={showAnnotations ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setShowAnnotations(!showAnnotations);
                }}
              >
                {showAnnotations
                  ? <lucide_react_1.Eye className="h-4 w-4" />
                  : <lucide_react_1.EyeOff className="h-4 w-4" />}
                <span className="ml-2">Anotações</span>
              </button_1.Button>
              <button_1.Button
                variant={showMeasurements ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setShowMeasurements(!showMeasurements);
                }}
              >
                {showMeasurements
                  ? <lucide_react_1.Eye className="h-4 w-4" />
                  : <lucide_react_1.EyeOff className="h-4 w-4" />}
                <span className="ml-2">Medições</span>
              </button_1.Button>
              <button_1.Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return setShowGrid(!showGrid);
                }}
              >
                <lucide_react_1.Grid3X3 className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>

          {/* Slider Control for Slider Mode */}
          {viewMode === "slider" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Posição do Divisor</label>
              <slider_1.Slider
                value={sliderPosition}
                onValueChange={setSliderPosition}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Comparison View */}
      <card_1.Card>
        <card_1.CardContent className="p-0">
          <div
            ref={containerRef}
            className={(0, utils_1.cn)(
              "relative h-[600px] cursor-grab active:cursor-grabbing",
              annotationMode === "measure" && "cursor-crosshair",
              annotationMode === "annotate" && "cursor-pointer",
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderComparison()}
            {viewMode !== "grid" && renderAnnotations()}
            {viewMode !== "grid" && renderMeasurements()}
            {renderGrid()}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Analysis Summary */}
      {analysisResult && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-base">Resumo da Análise</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
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
                  {(measurementResult === null || measurementResult === void 0
                    ? void 0
                    : measurementResult.measurements.length) || 0}
                </div>
                <div className="text-sm text-gray-600">Medições</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
exports.default = BeforeAfterComparison;
