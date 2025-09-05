/**
 * Responsive Layout Component for Brazilian Healthcare Theme
 * Simplified for MVP build
 */

"use client";

import type React from "react";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className = "" }: ResponsiveLayoutProps) {
  return (
    <div className={`responsive-layout ${className}`}>
      {/* Main Content Area */}
      <main className="layout-content">
        {children}
      </main>

      {/* Basic Styles for Brazilian Healthcare Layout */}
      <style jsx>
        {`
        .responsive-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
        }
        
        .layout-content {
          flex: 1;
          padding: 1rem;
        }
        
        @media (min-width: 768px) {
          .layout-content {
            padding: 2rem;
          }
        }
      `}
      </style>
    </div>
  );
}

export default ResponsiveLayout;
