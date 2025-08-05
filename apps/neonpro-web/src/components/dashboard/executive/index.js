"use strict";
/**
 * Executive Dashboard Components
 *
 * Centralized exports for all executive dashboard components
 * and related utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorDefault =
  exports.ReportGenerator =
  exports.AlertPanelDefault =
  exports.AlertPanel =
  exports.ChartWidgetDefault =
  exports.ChartWidget =
  exports.KPICardDefault =
  exports.KPICard =
  exports.ExecutiveDashboardDefault =
  exports.ExecutiveDashboard =
    void 0;
// Main Dashboard Component
var ExecutiveDashboard_1 = require("./ExecutiveDashboard");
Object.defineProperty(exports, "ExecutiveDashboard", {
  enumerable: true,
  get: function () {
    return ExecutiveDashboard_1.ExecutiveDashboard;
  },
});
var ExecutiveDashboard_2 = require("./ExecutiveDashboard");
Object.defineProperty(exports, "ExecutiveDashboardDefault", {
  enumerable: true,
  get: function () {
    return ExecutiveDashboard_2.default;
  },
});
// Individual Components
var KPICard_1 = require("./KPICard");
Object.defineProperty(exports, "KPICard", {
  enumerable: true,
  get: function () {
    return KPICard_1.KPICard;
  },
});
var KPICard_2 = require("./KPICard");
Object.defineProperty(exports, "KPICardDefault", {
  enumerable: true,
  get: function () {
    return KPICard_2.default;
  },
});
var ChartWidget_1 = require("./ChartWidget");
Object.defineProperty(exports, "ChartWidget", {
  enumerable: true,
  get: function () {
    return ChartWidget_1.ChartWidget;
  },
});
var ChartWidget_2 = require("./ChartWidget");
Object.defineProperty(exports, "ChartWidgetDefault", {
  enumerable: true,
  get: function () {
    return ChartWidget_2.default;
  },
});
var AlertPanel_1 = require("./AlertPanel");
Object.defineProperty(exports, "AlertPanel", {
  enumerable: true,
  get: function () {
    return AlertPanel_1.AlertPanel;
  },
});
var AlertPanel_2 = require("./AlertPanel");
Object.defineProperty(exports, "AlertPanelDefault", {
  enumerable: true,
  get: function () {
    return AlertPanel_2.default;
  },
});
var ReportGenerator_1 = require("./ReportGenerator");
Object.defineProperty(exports, "ReportGenerator", {
  enumerable: true,
  get: function () {
    return ReportGenerator_1.ReportGenerator;
  },
});
var ReportGenerator_2 = require("./ReportGenerator");
Object.defineProperty(exports, "ReportGeneratorDefault", {
  enumerable: true,
  get: function () {
    return ReportGenerator_2.default;
  },
});
