Object.defineProperty(exports, "__esModule", { value: true });
exports.executiveDashboardService = void 0;
// Temporary executive dashboard service for build compatibility
exports.executiveDashboardService = {
  getAlerts: () => Promise.resolve([]),
  getAlert: (id) => Promise.resolve(null),
  getKPIs: () => Promise.resolve({}),
  compareKPIs: () => Promise.resolve({}),
};
