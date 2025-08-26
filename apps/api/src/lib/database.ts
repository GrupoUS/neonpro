export const db = {
  healthCheck() {
    // Mock database health check
    return {
      connected: true,
      status: 'healthy',
      latency: Math.random() * 10,
      timestamp: new Date().toISOString(),
    };
  },
};
