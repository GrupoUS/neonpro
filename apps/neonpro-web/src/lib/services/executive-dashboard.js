"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveDashboardService = void 0;
// Temporary executive dashboard service for build compatibility
exports.executiveDashboardService = {
  getAlerts: function () {
    return Promise.resolve([]);
  },
  getAlert: function (id) {
    return Promise.resolve(null);
  },
  getKPIs: function () {
    return Promise.resolve({});
  },
  compareKPIs: function () {
    return Promise.resolve({});
  },
};
