"use client";

import {
  AnimatedChart,
  Heatmap,
  MultiProgressRing,
  ProgressRing,
  Timeline,
  type ChartDataset,
  type HeatmapData,
  type TimelineEvent,
} from "@/components/charts";
import { ExportDashboard } from "@/components/dashboard/export-dashboard";
import { motion } from "framer-motion";
import { useRef } from "react";

// Generate sample data
const generateHeatmapData = (): HeatmapData[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data: HeatmapData[] = [];

  days.forEach((day) => {
    hours.forEach((hour) => {
      data.push({
        x: day,
        y: hour,
        value: Math.floor(Math.random() * 100),
      });
    });
  });

  return data;
};

const generateTimelineEvents = (): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    {
      id: "1",
      title: "Project Kickoff",
      description: "Initial project planning and setup",
      date: new Date("2024-01-15"),
      type: "milestone",
    },
    {
      id: "2",
      title: "Phase 1 Complete",
      description: "Core infrastructure implemented",
      date: new Date("2024-02-20"),
      type: "milestone",
    },
    {
      id: "3",
      title: "Security Review",
      description: "Comprehensive security audit",
      date: new Date("2024-03-10"),
      type: "event",
    },
    {
      id: "4",
      title: "Beta Launch",
      description: "Limited release to beta testers",
      date: new Date("2024-04-05"),
      type: "task",
    },
    {
      id: "5",
      title: "Critical Bug Found",
      description: "Major issue discovered in production",
      date: new Date("2024-04-20"),
      type: "alert",
    },
    {
      id: "6",
      title: "Public Launch",
      description: "Full public release",
      date: new Date("2024-05-01"),
      type: "milestone",
    },
  ];

  return events;
};

const generateChartData = (): ChartDataset[] => {
  const now = new Date();
  const datasets: ChartDataset[] = [
    {
      id: "revenue",
      name: "Revenue",
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        value: 50000 + Math.random() * 20000 + i * 1000,
      })),
      color: "rgb(172, 148, 105)",
    },
    {
      id: "users",
      name: "Active Users",
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        value: 1000 + Math.random() * 500 + i * 50,
      })),
      color: "rgb(59, 130, 246)",
    },
    {
      id: "conversion",
      name: "Conversion Rate",
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000),
        value: 2 + Math.random() * 3,
      })),
      color: "rgb(34, 197, 94)",
    },
  ];

  return datasets;
};

export default function VisualizationsPage() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const heatmapData = generateHeatmapData();
  const timelineEvents = generateTimelineEvents();
  const chartData = generateChartData();

  return (
    <div
      ref={dashboardRef}
      id="visualizations-dashboard"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Advanced Visualizations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive charts and data visualization components
          </p>
        </div>
        <ExportDashboard
          targetRef={dashboardRef}
          filename="visualizations-dashboard"
          title="Export Visualizations"
        />
      </div>

      {/* Progress Rings Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Performance Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-6 rounded-xl bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md">
            <ProgressRing value={78} label="Revenue Target" color="gold" />
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md">
            <ProgressRing value={92} label="User Satisfaction" color="green" />
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md">
            <ProgressRing value={65} label="System Health" color="blue" />
          </div>

          <div className="flex flex-col items-center p-6 rounded-xl bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md">
            <MultiProgressRing
              rings={[
                { value: 85, label: "CPU", color: "blue" },
                { value: 72, label: "Memory", color: "purple" },
                { value: 93, label: "Storage", color: "green" },
              ]}
            />
          </div>
        </div>
      </motion.section>

      {/* Animated Chart Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedChart
          datasets={chartData}
          title="30-Day Performance Overview"
          yAxisLabel="Value"
          xAxisLabel="Date"
          height={400}
        />
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Timeline
          events={timelineEvents}
          title="Project Timeline"
          onEventClick={(event) => {
            console.log("Clicked event:", event);
          }}
        />
      </motion.section>

      {/* Heatmap Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Heatmap
          data={heatmapData.slice(0, 84)} // 7 days × 12 hours
          title="Weekly Activity Heatmap"
          colorScheme="blue"
          onCellClick={(cell) => {
            console.log("Clicked cell:", cell);
          }}
        />

        <Heatmap
          data={heatmapData.slice(84)} // Another set
          title="System Load Distribution"
          colorScheme="gold"
          onCellClick={(cell) => {
            console.log("Clicked cell:", cell);
          }}
        />
      </motion.section>

      {/* Real-time Update Demo */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl bg-glass-light/50 dark:bg-glass-dark/50 backdrop-blur-md"
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🎨 Glass Morphism Design
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All components feature beautiful glass morphism effects with theme
              support
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🚀 Smooth Animations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              D3.js powered animations with Framer Motion for fluid interactions
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              📊 Export Capabilities
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export individual charts or entire dashboard as PNG or PDF
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              🔍 Interactive Zoom
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Timeline supports zoom and pan for detailed data exploration
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              📱 Responsive Design
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All visualizations adapt seamlessly to different screen sizes
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              ⚡ Real-time Updates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Charts support real-time data updates with smooth transitions
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
