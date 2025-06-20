"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import * as d3 from "d3";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Download, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartDataset {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  strokeWidth?: number;
}

interface AnimatedChartProps {
  datasets: ChartDataset[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  type?: "line" | "area" | "both";
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  enableAnimation?: boolean;
  enableExport?: boolean;
  className?: string;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export function AnimatedChart({
  datasets,
  width = 800,
  height = 400,
  margin = { top: 20, right: 80, bottom: 50, left: 70 },
  type = "both",
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  enableAnimation = true,
  enableExport = true,
  className,
  title,
  yAxisLabel,
  xAxisLabel,
}: AnimatedChartProps) {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    dataset: string;
    point: ChartDataPoint;
    x: number;
    y: number;
  } | null>(null);
  const [selectedDatasets, setSelectedDatasets] = useState<Set<string>>(
    new Set(datasets.map((d) => d.id))
  );

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const defaultColors = [
    "rgb(59, 130, 246)", // blue
    "rgb(34, 197, 94)", // green
    "rgb(168, 85, 247)", // purple
    "rgb(239, 68, 68)", // red
    "rgb(172, 148, 105)", // gold
  ];

  // Calculate trends
  const trends = useMemo(() => {
    return datasets.map((dataset) => {
      const values = dataset.data.map((d) => d.value);
      const firstValue = values[0] || 0;
      const lastValue = values[values.length - 1] || 0;
      const change = ((lastValue - firstValue) / firstValue) * 100;
      return {
        id: dataset.id,
        change,
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      };
    });
  }, [datasets]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter active datasets
    const activeDatasets = datasets.filter((d) => selectedDatasets.has(d.id));
    if (activeDatasets.length === 0) return;

    // Scales
    const xExtent = d3.extent(
      activeDatasets.flatMap((d) => d.data.map((p) => p.date))
    ) as [Date, Date];

    const yExtent = [
      0,
      (d3.max(
        activeDatasets.flatMap((d) => d.data.map((p) => p.value))
      ) as number) * 1.1,
    ];

    const xScale = d3.scaleTime().domain(xExtent).range([0, chartWidth]);

    const yScale = d3.scaleLinear().domain(yExtent).range([chartHeight, 0]);

    // Grid
    if (showGrid) {
      // X Grid
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickSize(-chartHeight)
            .tickFormat(() => "")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3)
        .style("stroke", theme === "dark" ? "#374151" : "#e5e7eb");

      // Y Grid
      g.append("g")
        .attr("class", "grid")
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-chartWidth)
            .tickFormat(() => "")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3)
        .style("stroke", theme === "dark" ? "#374151" : "#e5e7eb");
    }

    // Axes
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => d3.timeFormat("%b %d")(d as Date))
      )
      .style("color", theme === "dark" ? "#9ca3af" : "#6b7280");

    const yAxis = g
      .append("g")
      .call(
        d3.axisLeft(yScale).tickFormat((d) => d3.format(".0f")(d as number))
      )
      .style("color", theme === "dark" ? "#9ca3af" : "#6b7280");

    // Axis labels
    if (xAxisLabel) {
      g.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
        .style("text-anchor", "middle")
        .style("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
        .style("font-size", "12px")
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", theme === "dark" ? "#9ca3af" : "#6b7280")
        .style("font-size", "12px")
        .text(yAxisLabel);
    }

    // Line generator
    const line = d3
      .line<ChartDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Area generator
    const area = d3
      .area<ChartDataPoint>()
      .x((d) => xScale(d.date))
      .y0(chartHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw datasets
    activeDatasets.forEach((dataset, index) => {
      const color =
        dataset.color || defaultColors[index % defaultColors.length];

      // Area
      if (type === "area" || type === "both") {
        const areaPath = g
          .append("path")
          .datum(dataset.data)
          .attr("fill", color)
          .attr("fill-opacity", 0.1)
          .attr("d", area);

        if (enableAnimation) {
          const totalLength = (
            areaPath.node() as SVGPathElement
          ).getTotalLength();
          areaPath
            .attr("opacity", 0)
            .transition()
            .duration(1500)
            .delay(index * 200)
            .attr("opacity", 1);
        }
      }

      // Line
      const linePath = g
        .append("path")
        .datum(dataset.data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", dataset.strokeWidth || 2)
        .attr("d", line)
        .style("filter", "drop-shadow(0 0 4px rgba(0,0,0,0.2))");

      if (enableAnimation) {
        const totalLength = (
          linePath.node() as SVGPathElement
        ).getTotalLength();
        linePath
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1500)
          .delay(index * 200)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }

      // Data points
      const points = g
        .selectAll(`.point-${dataset.id}`)
        .data(dataset.data)
        .enter()
        .append("circle")
        .attr("class", `point-${dataset.id}`)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 0)
        .attr("fill", color)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          if (showTooltip) {
            const [x, y] = d3.pointer(event, svg.node());
            setHoveredPoint({
              dataset: dataset.name,
              point: d,
              x: x,
              y: y,
            });
          }
          d3.select(this).transition().duration(200).attr("r", 6);
        })
        .on("mouseleave", function () {
          setHoveredPoint(null);
          d3.select(this).transition().duration(200).attr("r", 4);
        });

      if (enableAnimation) {
        points
          .transition()
          .duration(300)
          .delay((d, i) => index * 200 + i * 50)
          .attr("r", 4);
      } else {
        points.attr("r", 4);
      }
    });
  }, [
    datasets,
    selectedDatasets,
    theme,
    chartWidth,
    chartHeight,
    margin,
    type,
    showGrid,
    enableAnimation,
    showTooltip,
  ]);

  const handleExport = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `chart-${new Date().getTime()}.png`;
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const toggleDataset = (datasetId: string) => {
    setSelectedDatasets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datasetId)) {
        newSet.delete(datasetId);
      } else {
        newSet.add(datasetId);
      }
      return newSet;
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative p-6 rounded-2xl",
        "bg-glass-light/50 dark:bg-glass-dark/50",
        "backdrop-blur-md border border-white/20",
        "shadow-glass-light dark:shadow-glass-dark",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableExport && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Chart */}
      <svg ref={svgRef} width={width} height={height} className="w-full" />

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4">
          {datasets.map((dataset, index) => {
            const trend = trends.find((t) => t.id === dataset.id);
            const color =
              dataset.color || defaultColors[index % defaultColors.length];
            const isActive = selectedDatasets.has(dataset.id);

            return (
              <motion.button
                key={dataset.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleDataset(dataset.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                  "border border-white/20",
                  isActive
                    ? "bg-white/10 dark:bg-white/5"
                    : "bg-white/5 dark:bg-white/5 opacity-50"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {dataset.name}
                </span>
                {trend && (
                  <div className="flex items-center gap-1">
                    {trend.trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {trend.trend === "down" && (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    {trend.trend === "neutral" && (
                      <Minus className="w-3 h-3 text-gray-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        trend.trend === "up" && "text-green-500",
                        trend.trend === "down" && "text-red-500",
                        trend.trend === "neutral" && "text-gray-500"
                      )}
                    >
                      {Math.abs(trend.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute z-10 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          style={{
            left: hoveredPoint.x,
            top: hoveredPoint.y - 60,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {hoveredPoint.dataset}
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {hoveredPoint.point.value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {d3.timeFormat("%b %d, %Y")(hoveredPoint.point.date)}
          </div>
        </motion.div>
      )}
    </div>
  );
}
