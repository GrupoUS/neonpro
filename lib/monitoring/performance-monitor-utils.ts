  /**
   * 📈 Generate performance trends
   */
  private generateTrends(metrics: PerformanceMetric[], buckets: number = 10): any[] {
    if (metrics.length === 0) return [];

    const sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const bucketSize = Math.ceil(sorted.length / buckets);
    const trends = [];

    for (let i = 0; i < buckets; i++) {
      const bucketStart = i * bucketSize;
      const bucketEnd = Math.min((i + 1) * bucketSize, sorted.length);
      const bucketMetrics = sorted.slice(bucketStart, bucketEnd);

      if (bucketMetrics.length > 0) {
        const avgValue = bucketMetrics.reduce((sum, m) => sum + m.value, 0) / bucketMetrics.length;
        const timestamp = bucketMetrics[Math.floor(bucketMetrics.length / 2)].timestamp;
        
        trends.push({
          timestamp,
          value: Math.round(avgValue),
          count: bucketMetrics.length,
        });
      }
    }

    return trends;
  }

  /**
   * 🔢 Aggregate metrics with statistical functions
   */
  private aggregateMetrics(metrics: PerformanceMetric[]) {
    if (metrics.length === 0) {
      return { count: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avg: Math.round(sum / metrics.length),
      p50: this.percentile(values, 50),
      p90: this.percentile(values, 90),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      min: values[0],
      max: values[values.length - 1],
    };
  }