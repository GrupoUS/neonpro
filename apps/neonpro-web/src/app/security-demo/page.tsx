import type { Metadata } from "next";
import React from "react";
import SessionSecurityDemo from "@/components/security/SessionSecurityDemo";

export const metadata: Metadata = {
  title: "Session Security Demo - NeonPro",
  description: "Demonstração das funcionalidades de segurança de sessão implementadas na Story 1.5",
};

/**
 * Security Demo Page
 * Página de demonstração das funcionalidades de segurança de sessão
 * implementadas na Story 1.5 - Session Management & Security
 */
export default function SecurityDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <SessionSecurityDemo />
      </div>
    </div>
  );
}
