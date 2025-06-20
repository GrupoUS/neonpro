"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import * as d3 from "d3";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

interface HeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme?: "blue" | "green" | "purple" | "red" | "gold";
  enableTooltip?: boolean;
  enableExport?: boolean;
  onCellClick?: (data: HeatmapData) => void;
  className?: string;
  title?: string;
}

export function Heatmap({
  data,
  width = 600,
  height = 400,
  margin = { top: 30, right: 30, bottom: 60, left: 60 },
  colorScheme = "blue",
  enableTooltip = true,
  enableExport = true,
  onCellClick,
  className,
  title,
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();

  // Color schemes that work with glass morphism
  const colorSchemes = {
    blue: ["rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.8)"],
    green: ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.8)"],
    purple: ["rgba(139, 92, 246, 0.1)", "rgba(139, 92, 246, 0.8)"],
    red: ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.8)"],
    gold: ["rgba(172, 148, 105, 0.1)", "rgba(172, 148, 105, 0.8)"],
  };

  const colors = useMemo(() => colorSchemes[colorScheme], [colorScheme]);

  // Process data to get unique x and y values
  const { xDomain, yDomain, valueExtent } = useMemo(() => {
    const xValues = [...new Set(data.map((d) => d.x))];
    const yValues = [...new Set(data.map((d) => d.y))];
    const values = data.map((d) => d.value);

    return {
      xDomain: xValues,
      yDomain: yValues,
      valueExtent: d3.extent(values) as [number, number],
    };
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Adjusted dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(yDomain)
      .range([innerHeight, 0])
      .padding(0.05);

    const colorScale = d3
      .scaleLinear<string>()
      .domain(valueExtent)
      .range(colors);

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add cells
    const cells = g
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.x) || 0)
      .attr("y", (d) => yScale(d.y) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.value))
      .attr(
        "stroke",
        theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
      )
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .style("cursor", onCellClick ? "pointer" : "default")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

    // Add hover effects
    cells
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)")
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");

        setHoveredCell(d);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1)")
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");

        setHoveredCell(null);
      })
      .on("click", function (event, d) {
        if (onCellClick) {
          onCellClick(d);
        }
      });

    // Add X axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .style("color", theme === "dark" ? "#9ca3af" : "#4b5563");

    xAxis
      .selectAll(".tick text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", theme === "dark" ? "#9ca3af" : "#4b5563");

    // Add grid lines with glass effect
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => "")
      )
      .style(
        "stroke",
        theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
      )
      .style("stroke-dasharray", "2,2");

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .style(
        "stroke",
        theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
      )
      .style("stroke-dasharray", "2,2");
  }, [
    data,
    width,
    height,
    margin,
    colors,
    theme,
    xDomain,
    yDomain,
    valueExtent,
    onCellClick,
  ]);

  // Export functionality
  const exportAsImage = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `heatmap-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to export heatmap:", error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative p-6 rounded-xl",
        "glass-card",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {title || "Heatmap Visualization"}
        </h3>
        <div className="flex items-center gap-2">
          {enableExport && (
            <>
              <button
                onClick={exportAsImage}
                className="p-2 rounded-lg glass-subtle hover:glass transition-all"
                title="Export as image"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg glass-subtle hover:glass transition-all"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{ maxWidth: "100%" }}
        />

        {/* Tooltip */}
        {enableTooltip && hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none z-10 p-3 rounded-lg glass-card text-sm"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="font-semibold">
              {hoveredCell.x} × {hoveredCell.y}
            </div>
            <div className="text-muted-foreground">
              Value: {hoveredCell.value}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Low</span>
          <div
            className="h-4 w-32 rounded"
            style={{
              background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
            }}
          />
          <span className="text-sm text-muted-foreground">High</span>
        </div>
      </div>
    </motion.div>
  );
}
