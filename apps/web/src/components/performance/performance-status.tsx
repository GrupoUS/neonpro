"use client";

import { useEffect, useState } from "react";
import { usePerformanceMonitor, usePerformanceMetrics } from "@/providers/performance-monitor-provider";

export function PerformanceStatus() {
  const { isInitialized, isMonitoringEnabled } = usePerformanceMonitor();
  const { metrics, loading } = usePerformanceMetrics();
  const [showDetails, setShowDetails] = useState(false);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-2 z-50 space-y-2">
      {/* Main Status Indicator */}
      <div 
        className={`text-xs px-2 py-1 rounded font-mono cursor-pointer transition-colors ${
          isMonitoringEnabled 
            ? "bg-green-900/20 text-green-400 hover:bg-green-900/40" 
            : "bg-red-900/20 text-red-400 hover:bg-red-900/40"
        }`}
        title={`Healthcare Performance Monitoring - ${isMonitoringEnabled ? 'Active' : 'Inactive'}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {isMonitoringEnabled ? "🏥 HPM ✅" : "🏥 HPM ❌"}
      </div>

      {/* Detailed Status (Development Only) */}
      {showDetails && (
        <div className="bg-black/90 text-green-400 p-3 rounded text-xs font-mono max-w-xs">
          <div className="space-y-1">
            <div>
              <strong>Status:</strong> {isInitialized ? "Initialized" : "Pending"}
            </div>
            <div>
              <strong>Monitoring:</strong> {isMonitoringEnabled ? "Active" : "Disabled"}
            </div>
            
            {loading && (
              <div className="text-yellow-400">Loading metrics...</div>
            )}
            
            {metrics && (
              <div className="mt-2 space-y-1">
                <div className="text-cyan-400 font-bold">Latest Metrics:</div>
                {metrics.webVitals && (
                  <div>Web Vitals: Active</div>
                )}
                {metrics.cacheMetrics && (
                  <div>Cache: Monitored</div>
                )}
                <div className="text-xs text-gray-400">
                  Updated: {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : "Never"}
                </div>
              </div>
            )}
            
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
              Click to toggle | Healthcare optimized
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for easy access to performance status in other components
export function usePerformanceStatus() {
  const { isInitialized, isMonitoringEnabled } = usePerformanceMonitor();
  
  return {
    isHealthcareMonitoringActive: isMonitoringEnabled,
    isSystemInitialized: isInitialized,
  };
}