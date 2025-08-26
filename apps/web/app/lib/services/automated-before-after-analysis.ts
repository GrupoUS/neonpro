// Automated Before/After Analysis Service stub
export const automatedBeforeAfterAnalysisService = {
  async getAnalysisSessions(_filters: any) {
    return [];
  },
  async createAnalysisSession(data: any) {
    return { id: "mock-session", ...data };
  },
  async updateAnalysisSession(id: string, updates: any) {
    return { id, ...updates };
  },
  async deleteAnalysisSession(_id: string) {
    return { success: true };
  },
};

export default automatedBeforeAfterAnalysisService;
