"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import * as d3 from "d3";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Calendar, Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type?: "milestone" | "event" | "task" | "alert";
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  enableZoom?: boolean;
  enableTooltip?: boolean;
  enableExport?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
  title?: string;
}

export function Timeline({
  events,
  width = 800,
  height = 300,
  margin = { top: 40, right: 40, bottom: 60, left: 40 },
  enableZoom = true,
  enableTooltip = true,
  enableExport = true,
  onEventClick,
  className,
  title,
}: TimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { theme } = useTheme();

  // Event type styling
  const eventStyles = {
    milestone: {
      symbol: d3.symbolDiamond,
      size: 200,
      color: "#AC9469",
    },
    event: {
      symbol: d3.symbolCircle,
      size: 150,
      color: "#3b82f6",
    },
    task: {
      symbol: d3.symbolSquare,
      size: 150,
      color: "#10b981",
    },
    alert: {
      symbol: d3.symbolTriangle,
      size: 180,
      color: "#ef4444",
    },
  };

  useEffect(() => {
    if (!svgRef.current || !events.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Adjusted dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const timeExtent = d3.extent(events, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(timeExtent).range([0, innerWidth]);

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([
        [-innerWidth, -innerHeight],
        [innerWidth * 2, innerHeight * 2],
      ])
      .on("zoom", (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);

        // Update x scale
        const newXScale = transform.rescaleX(xScale);

        // Update axis
        g.select(".x-axis").call(
          d3
            .axisBottom(newXScale)
            .tickFormat((d: any) => d3.timeFormat("%b %d")(d as Date))
        );

        // Update events
        g.selectAll(".event-group").attr(
          "transform",
          (d) =>
            `translate(${newXScale((d as TimelineEvent).date)}, ${
              innerHeight / 2
            })`
        );

        // Update timeline line
        g.select(".timeline-line")
          .attr("x1", newXScale.range()[0])
          .attr("x2", newXScale.range()[1]);
      });

    if (enableZoom) {
      svg.call(zoom);
    }

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add timeline line with glass effect
    g.append("line")
      .attr("class", "timeline-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr(
        "stroke",
        theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
      )
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    // Add X axis
    const xAxis = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight - 20})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d: any) => d3.timeFormat("%b %d")(d as Date))
      )
      .style("color", theme === "dark" ? "#9ca3af" : "#4b5563");

    // Style axis
    xAxis.select(".domain").remove();
    xAxis
      .selectAll(".tick line")
      .attr(
        "stroke",
        theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      );

    // Add events
    const eventGroups = g
      .selectAll(".event-group")
      .data(events)
      .enter()
      .append("g")
      .attr("class", "event-group")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.date)}, ${innerHeight / 2})`
      )
      .style("cursor", onEventClick ? "pointer" : "default");

    // Add event symbols
    eventGroups.each(function (d) {
      const group = d3.select(this);
      const style = eventStyles[d.type || "event"];

      // Add glow effect
      const defs = svg.append("defs");
      const filter = defs.append("filter").attr("id", `glow-${d.id}`);

      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");

      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Add symbol
      group
        .append("path")
        .attr("d", d3.symbol().type(style.symbol).size(style.size)())
        .attr("fill", d.color || style.color)
        .attr("fill-opacity", 0.8)
        .attr(
          "stroke",
          theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
        )
        .attr("stroke-width", 1)
        .style("filter", `url(#glow-${d.id})`)
        .on("mouseenter", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", "scale(1.2)")
            .attr("fill-opacity", 1);

          setHoveredEvent(d);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", "scale(1)")
            .attr("fill-opacity", 0.8);

          setHoveredEvent(null);
        })
        .on("click", () => {
          if (onEventClick) {
            onEventClick(d);
          }
        });

      // Add connecting line
      group
        .append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", d.type === "milestone" ? -40 : -30)
        .attr(
          "stroke",
          theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
        )
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");
    });

    // Reset zoom function
    const resetZoom = () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    // Store reset function
    if (containerRef.current) {
      (containerRef.current as any).resetZoom = resetZoom;
    }
  }, [events, width, height, margin, theme, enableZoom, onEventClick]);

  // Export functionality
  const exportAsImage = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `timeline-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to export timeline:", error);
    }
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5);
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.75);
  };

  const handleResetZoom = () => {
    if (containerRef.current && (containerRef.current as any).resetZoom) {
      (containerRef.current as any).resetZoom();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative p-6 rounded-xl", "glass-card", className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {title || "Timeline"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {enableZoom && (
            <>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg glass-subtle hover:glass transition-all"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg glass-subtle hover:glass transition-all"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-lg glass-subtle hover:glass transition-all"
                title="Reset zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
          {enableExport && (
            <button
              onClick={exportAsImage}
              className="p-2 rounded-lg glass-subtle hover:glass transition-all"
              title="Export as image"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative overflow-hidden rounded-lg">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ maxWidth: "100%", cursor: enableZoom ? "grab" : "default" }}
        />

        {/* Tooltip */}
        <AnimatePresence>
          {enableTooltip && hoveredEvent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute pointer-events-none z-10 p-3 rounded-lg glass-card max-w-xs"
              style={{
                left: "50%",
                top: "20%",
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-semibold">{hoveredEvent.title}</div>
              {hoveredEvent.description && (
                <div className="text-sm text-muted-foreground mt-1">
                  {hoveredEvent.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {hoveredEvent.date.toLocaleDateString()}
              </div>
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0
                border-l-[6px] border-l-transparent
                border-t-[6px] border-t-white/10
                border-r-[6px] border-r-transparent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        {Object.entries(eventStyles).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2">
            <svg width="20" height="20">
              <path
                d={d3.symbol().type(style.symbol).size(100)()!}
                fill={style.color}
                fillOpacity={0.8}
                transform="translate(10,10)"
              />
            </svg>
            <span className="text-sm text-muted-foreground capitalize">
              {type}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
