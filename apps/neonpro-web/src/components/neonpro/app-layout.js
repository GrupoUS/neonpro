/**
 * NEONPROV1 Design System - AppLayout Component
 * Main application layout with sidebar and header
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLayout = void 0;
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var app_sidebar_1 = require("./app-sidebar");
var app_header_1 = require("./app-header");
var AppLayout = function (_a) {
  var children = _a.children,
    className = _a.className;
  var _b = (0, react_1.useState)(false),
    sidebarOpen = _b[0],
    setSidebarOpen = _b[1];
  var toggleSidebar = function () {
    setSidebarOpen(!sidebarOpen);
  };
  var closeSidebar = function () {
    setSidebarOpen(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <app_sidebar_1.AppSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <app_header_1.AppHeader onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main
          className={(0, utils_1.cn)("flex-1 p-6", "animate-fade-in", className)}
          onClick={closeSidebar}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
exports.AppLayout = AppLayout;
