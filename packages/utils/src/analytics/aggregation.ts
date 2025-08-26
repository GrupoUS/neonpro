/**
 * @file Data aggregation utilities for analytics
 */

const ZERO = 0;
const ONE = 1;
const TWO = 2;

interface AnalyticsData {
  metadata?: Record<string, unknown>;
  metric: string;
  timestamp: Date;
  value: number;
}

/**
 * Aggregate analytics data by time period
 * @param {AnalyticsData[]} data Array of analytics data
 * @param {"day" | "week" | "month"} period Time period for aggregation
 * @returns {Record<string, number>} Aggregated data by period
 */
const aggregateByPeriod = (
  data: AnalyticsData[],
  period: "day" | "week" | "month",
): Record<string, number> => {
  const aggregated: Record<string, number> = {};

  data.forEach((item) => {
    let key = "";
    const date = new Date(item.timestamp);

    switch (period) {
      case "day": {
        const [datePart] = date.toISOString().split("T");
        key = datePart;
        break;
      }
      case "week": {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const [datePart] = weekStart.toISOString().split("T");
        key = datePart;
        break;
      }
      case "month": {
        key = `${date.getFullYear()}-${String(date.getMonth() + ONE).padStart(TWO, "0")}`;
        break;
      }
    }

    aggregated[key] = (aggregated[key] || ZERO) + item.value;
  });

  return aggregated;
};

export {
  type AnalyticsData,
  aggregateByPeriod,
};