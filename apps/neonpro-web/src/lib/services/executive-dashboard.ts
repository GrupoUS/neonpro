// Temporary executive dashboard service for build compatibility
export const executiveDashboardService = {
  getAlerts: () => Promise.resolve([]),
  getAlert: (id: string) => Promise.resolve(null),
  getKPIs: () => Promise.resolve({}),
  compareKPIs: () => Promise.resolve({}),
};
