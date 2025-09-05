"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ConnectivityLevel, RegionalSettings } from "../types";

interface ResponsiveLayoutProps {
  children: ReactNode;
  connectivity?: ConnectivityLevel;
  regional?: RegionalSettings;
  emergencyMode?: boolean;
  className?: string;
}

export function ResponsiveLayout({
  children,
  connectivity,
  regional,
  emergencyMode = false,
  className = "",
}: ResponsiveLayoutProps) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<string>("unknown");

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth: width } = window;
      if (width < 768) {
        setViewport("mobile");
      } else if (width < 1024) {
        setViewport("tablet");
      } else {
        setViewport("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Monitor connectivity for Brazilian network conditions
  useEffect(() => {
    if (connectivity) {
      const isSlow = connectivity.type === "2G"
        || (connectivity.type === "3G" && connectivity.strength === "weak")
        || (connectivity.latency && connectivity.latency > 1000);

      setIsLowBandwidth(isSlow);
      setConnectionSpeed(`${connectivity.type} - ${connectivity.strength}`);
    }
  }, [connectivity]);

  // Apply regional settings
  useEffect(() => {
    if (regional) {
      document.documentElement.lang = regional.language;
      document.documentElement.dir = regional.textDirection || "ltr";
    }
  }, [regional]);

  const layoutClasses = [
    "responsive-layout",
    `viewport-${viewport}`,
    isLowBandwidth && "low-bandwidth",
    emergencyMode && "emergency-mode",
    regional?.highContrast && "high-contrast",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layoutClasses}>
      {/* Connectivity Status Bar */}
      {connectivity && (
        <div className="connectivity-status">
          <div className="connectivity-indicator">
            <span className={`signal-strength signal-${connectivity.strength}`}>
              📶
            </span>
            <span className="connection-type">{connectivity.type}</span>
            {connectivity.latency && <span className="latency">{connectivity.latency}ms</span>}
          </div>

          {isLowBandwidth && (
            <div className="bandwidth-warning">
              ⚠️ Conexão lenta detectada - Modo otimizado ativado
            </div>
          )}
        </div>
      )}

      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="emergency-banner" role="alert" aria-live="assertive">
          <div className="emergency-content">
            <span className="emergency-icon">🚨</span>
            <span className="emergency-text">MODO DE EMERGÊNCIA ATIVO</span>
            <span className="emergency-time">
              {new Date().toLocaleTimeString("pt-BR")}
            </span>
          </div>
        </div>
      )}

      {/* Regional Settings Indicator */}
      {regional && (
        <div className="regional-settings">
          <div className="region-info">
            <span className="region-flag">{regional.flag}</span>
            <span className="region-name">{regional.region}</span>
            <span className="timezone">{regional.timezone}</span>
          </div>

          {regional.accessibility && (
            <div className="accessibility-features">
              {regional.accessibility.screenReader && (
                <span className="a11y-feature" title="Leitor de tela ativo">
                  🔊
                </span>
              )}
              {regional.accessibility.highContrast && (
                <span className="a11y-feature" title="Alto contraste ativo">
                  🎨
                </span>
              )}
              {regional.accessibility.largeText && (
                <span className="a11y-feature" title="Texto ampliado ativo">
                  🔍
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main className="layout-content">
        {children}
      </main>

      {/* Performance Optimization for Low Bandwidth */}
      {isLowBandwidth && (
        <div className="performance-optimizations">
          <style jsx>
            {`
            .responsive-layout.low-bandwidth {
              /* Reduce animations */
              * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
              }
              
              /* Optimize images */
              img {
                image-rendering: optimizeSpeed;
              }
              
              /* Reduce shadows and effects */
              .shadow,
              .shadow-lg,
              .shadow-xl {
                box-shadow: none !important;
              }
            }
          `}
          </style>
        </div>
      )}

      {/* Viewport-specific Optimizations */}
      <style jsx>
        {`
        .responsive-layout.viewport-mobile {
          /* Mobile-first optimizations */
          font-size: 16px; /* Prevent zoom on iOS */
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        
        .responsive-layout.viewport-tablet {
          /* Tablet optimizations */
          touch-action: manipulation;
        }
        
        .responsive-layout.emergency-mode {
          /* Emergency mode styling */
          --primary-color: #dc2626;
          --background-color: #fef2f2;
          --text-color: #991b1b;
        }
        
        .responsive-layout.high-contrast {
          /* High contrast mode */
          --primary-color: #000000;
          --background-color: #ffffff;
          --text-color: #000000;
          filter: contrast(150%);
        }
      `}
      </style>

      {/* Brazilian Healthcare Specific Styles */}
      <style jsx>
        {`
        .connectivity-status {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.5rem;
          border-radius: 0 0 0 0.5rem;
          font-size: 0.75rem;
        }
        
        .emergency-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1001;
          background: #dc2626;
          color: white;
          padding: 1rem;
          text-align: center;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        
        .regional-settings {
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 999;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.5rem;
          border-radius: 0.5rem 0 0 0;
          font-size: 0.75rem;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}
      </style>
    </div>
  );
}
