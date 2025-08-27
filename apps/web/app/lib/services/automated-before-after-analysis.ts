// Automated Before/After Analysis Service stub
export const automatedBeforeAfterAnalysisService = {
  async getAnalysisSessions(_filters: unknown) {
    return [];
  },
  async createAnalysisSession(data: unknown) {
    return { id: "mock-session", ...data };
  },
  async updateAnalysisSession(id: string, updates: unknown) {
    return { id, ...updates };
  },
  async deleteAnalysisSession(_id: string) {
    return { success: true };
  },
};

export default automatedBeforeAfterAnalysisService;
