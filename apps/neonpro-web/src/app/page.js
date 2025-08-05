"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
/**
 * NEONPROV1 - Home Page
 * Redirects to dashboard for authenticated users
 */
var navigation_1 = require("next/navigation");
function HomePage() {
  // Redirect to dashboard - main entry point for NEONPROV1
  (0, navigation_1.redirect)("/dashboard");
}
