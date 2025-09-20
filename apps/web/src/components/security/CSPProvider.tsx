/**
 * Healthcare CSP Provider Component
 * T006: React provider for Content Security Policy management
 *
 * Features:
 * - CSP nonce management for React components
 * - Healthcare-specific security monitoring
 * - LGPD compliance for client-side operations
 * - Automatic nonce generation and management
 *
 * @version 1.0.0
 * @compliance LGPD, ANVISA, CFM
 * @healthcare-platform NeonPro
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ClientCSPManager,
  useHealthcareCSP,
} from "../../lib/security/csp-client";

// CSP Context Interface
interface CSPContextType {
  nonce: string | null;
  violationCount: number;
  isSupported: boolean;
  resetViolations: () => void;
  loadScript: (src: string, options?: any) => Promise<HTMLScriptElement>;
  loadStyle: (href: string, options?: any) => Promise<HTMLLinkElement>;
  utils: {
    isResourceAllowed: (
      resourceUrl: string,
      resourceType: "script" | "style" | "img" | "media",
    ) => boolean;
    sanitizeHTML: (html: string) => string;
    validateHealthcareURL: (url: string) => boolean;
  };
}

// Create CSP Context
const CSPContext = createContext<CSPContextType | undefined>(undefined);

// CSP Provider Props
interface CSPProviderProps {
  children: React.ReactNode;
  config?: {
    reportOnly?: boolean;
    enableLogging?: boolean;
    maxViolations?: number;
  };
}

/**
 * Healthcare CSP Provider Component
 *
 * Provides CSP nonce management and security monitoring for React components.
 * Designed specifically for healthcare applications with LGPD compliance.
 */
export function CSPProvider({
  children,
  config,
}: CSPProviderProps): React.ReactElement {
  const {
    nonce,
    violationCount,
    isSupported,
    resetViolations,
    loadScript,
    loadStyle,
    utils,
  } = useHealthcareCSP();

  const [manager] = useState(() => new ClientCSPManager());

  useEffect(() => {
    // Initialize client-side CSP management
    if (typeof window !== "undefined") {
      // Set CSP nonce meta tag
      if (nonce) {
        const meta = document.createElement("meta");
        meta.setAttribute("name", "csp-nonce");
        meta.setAttribute("content", nonce);
        document.head.appendChild(meta);
      }

      // Log CSP support status
      if (config?.enableLogging !== false) {
        console.info("CSP Support:", isSupported ? "Enabled" : "Not Supported");
        console.info("CSP Nonce:", nonce ? "Present" : "Not Available");
      }
    }
  }, [nonce, isSupported, config?.enableLogging]);

  // Context value
  const contextValue: CSPContextType = {
    nonce,
    violationCount,
    isSupported,
    resetViolations,
    loadScript,
    loadStyle,
    utils,
  };

  return (
    <CSPContext.Provider value={contextValue}>{children}</CSPContext.Provider>
  );
}

/**
 * Hook to use CSP context
 */
export function useCSP(): CSPContextType {
  const context = useContext(CSPContext);
  if (context === undefined) {
    throw new Error("useCSP must be used within a CSPProvider");
  }
  return context;
}

/**
 * Higher-order component for CSP-aware components
 */
export function withCSP<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P> {
  return function CSPWrappedComponent(props: P): React.ReactElement {
    const csp = useCSP();
    return <Component {...props} csp={csp} />;
  };
}

/**
 * CSP Script Component
 *
 * Securely loads scripts with CSP nonce for healthcare applications
 */
export interface CSPScriptProps {
  src: string;
  async?: boolean;
  defer?: boolean;
  integrity?: string;
  crossOrigin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export function CSPScript({
  src,
  async,
  defer,
  integrity,
  crossOrigin,
  onLoad,
  onError,
  children,
}: CSPScriptProps): React.ReactElement {
  const { nonce, loadScript } = useCSP();

  useEffect(() => {
    if (!src) return;

    loadScript(src, { nonce, async, defer, integrity, crossOrigin })
      .then(() => onLoad?.())
      .catch(onError);
  }, [
    src,
    nonce,
    async,
    defer,
    integrity,
    crossOrigin,
    loadScript,
    onLoad,
    onError,
  ]);

  // Fallback to traditional script tag for development
  if (process.env.NODE_ENV === "development" && !nonce) {
    return (
      <script
        nonce={nonce || undefined}
        src={src}
        async={async}
        defer={defer}
        integrity={integrity}
        crossOrigin={crossOrigin}
        onLoad={onLoad}
        onError={onError}
      >
        {children}
      </script>
    );
  }

  return <>{children}</>;
}

/**
 * CSP Style Component
 *
 * Securely loads stylesheets with CSP nonce for healthcare applications
 */
export interface CSPStyleProps {
  href: string;
  integrity?: string;
  crossOrigin?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}

export function CSPStyle({
  href,
  integrity,
  crossOrigin,
  onLoad,
  onError,
  children,
}: CSPStyleProps): React.ReactElement {
  const { nonce, loadStyle } = useCSP();

  useEffect(() => {
    if (!href) return;

    loadStyle(href, { nonce, integrity, crossOrigin })
      .then(() => onLoad?.())
      .catch(onError);
  }, [href, nonce, integrity, crossOrigin, loadStyle, onLoad, onError]);

  // Fallback to traditional link tag for development
  if (process.env.NODE_ENV === "development" && !nonce) {
    return (
      <>
        <link
          nonce={nonce || undefined}
          rel="stylesheet"
          href={href}
          integrity={integrity}
          crossOrigin={crossOrigin}
          onLoad={onLoad}
          onError={onError}
        />
        {children}
      </>
    );
  }

  return <>{children}</>;
}

/**
 * CSP Security Monitor Component
 *
 * Displays CSP violation status for healthcare security monitoring
 */
export interface CSPSecurityMonitorProps {
  showViolations?: boolean;
  maxDisplayViolations?: number;
}

export function CSPSecurityMonitor({
  showViolations = false,
  maxDisplayViolations = 5,
}: CSPSecurityMonitorProps): React.ReactElement | null {
  const { violationCount, isSupported, resetViolations } = useCSP();

  // Only show in development
  if (process.env.NODE_ENV !== "production" && showViolations) {
    return (
      <div className="csp-monitor fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div>
            <strong>CSP Monitor:</strong>
            <span className="ml-2">
              {isSupported ? "✓ Supported" : "✗ Not Supported"}
            </span>
            {violationCount > 0 && (
              <span className="ml-2 text-red-600">
                {violationCount} violations
              </span>
            )}
          </div>
          <button
            onClick={resetViolations}
            className="ml-4 bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default CSPProvider;
