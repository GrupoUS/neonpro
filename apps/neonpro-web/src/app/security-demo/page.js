"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = SecurityDemoPage;
var react_1 = require("react");
var SessionSecurityDemo_1 = require("@/components/security/SessionSecurityDemo");
exports.metadata = {
  title: "Session Security Demo - NeonPro",
  description: "Demonstração das funcionalidades de segurança de sessão implementadas na Story 1.5",
};
/**
 * Security Demo Page
 * Página de demonstração das funcionalidades de segurança de sessão
 * implementadas na Story 1.5 - Session Management & Security
 */
function SecurityDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <SessionSecurityDemo_1.default />
      </div>
    </div>
  );
}
