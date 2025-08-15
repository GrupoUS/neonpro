function _generateInsightsCSV(data: any): string {
  if (!(data.correlations || data.anomalies)) {
    throw new Error('Invalid insights data structure');
  }

  let csv = '';

  // Correlations section
  if (data.correlations) {
    csv += 'CORRELATIONS\n';
    csv += 'Metric 1,Metric 2,Correlation,Significance,Strength\n';

    data.correlations.forEach((corr: any) => {
      const row = [
        corr.metric1,
        corr.metric2,
        corr.correlation,
        corr.significance,
        corr.strength,
      ];
      csv += `${row.join(',')}\n`;
    });
    csv += '\n';
  }

  // Anomalies section
  if (data.anomalies) {
    csv += 'ANOMALIES\n';
    csv += 'Metric,Timestamp,Value,Expected Value,Deviation,Severity\n';

    data.anomalies.forEach((anomaly: any) => {
      const row = [
        anomaly.metric,
        anomaly.timestamp,
        anomaly.value,
        anomaly.expectedValue,
        anomaly.deviation,
        anomaly.severity,
      ];
      csv += `${row.join(',')}\n`;
    });
  }

  return csv;
}

function _generateDashboardCSV(data: any): string {
  if (!data.kpis) {
    throw new Error('Invalid dashboard data structure');
  }

  const headers = ['Metric', 'Value', 'Change', 'Trend'];
  let csv = `${headers.join(',')}\n`;

  Object.entries(data.kpis).forEach(([key, value]: [string, any]) => {
    const row = [
      key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      typeof value === 'number' ? value.toString() : value,
      '', // TODO: Add change calculation
      '', // TODO: Add trend calculation
    ];
    csv += `${row.join(',')}\n`;
  });

  return csv;
}

function _generateRealtimeCSV(data: any): string {
  if (!data.metrics) {
    throw new Error('Invalid realtime data structure');
  }

  const headers = [
    'Timestamp',
    'Active Subscriptions',
    'MRR',
    'Trial Conversions',
    'Churn Rate',
    'New Signups',
  ];
  let csv = `${headers.join(',')}\n`;

  const timestamp = new Date().toISOString();
  const row = [
    timestamp,
    data.metrics.activeSubscriptions,
    data.metrics.monthlyRecurringRevenue,
    data.metrics.trialConversions,
    data.metrics.churnRate,
    data.metrics.newSignups,
  ];
  csv += `${row.join(',')}\n`;

  return csv;
}

// Excel Generation Functions
function _addCohortSheetsToWorkbook(workbook: any, data: any, _options: any) {
  // Cohort Overview Sheet
  const overviewData = [
    ['Cohort Analysis Report'],
    ['Generated:', new Date().toISOString()],
    [''],
    ['Cohort', 'Period', 'Users', 'Retention Rate', 'Revenue', 'Churn Rate'],
  ];

  if (data.metrics) {
    data.metrics.forEach((metric: any) => {
      overviewData.push([
        metric.cohortId,
        metric.period,
        metric.totalUsers,
        metric.retentionRate / 100, // Excel percentage format
        metric.revenue,
        metric.churnRate / 100,
      ]);
    });
  }

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);

  // Format columns
  overviewSheet['!cols'] = [
    { width: 15 }, // Cohort
    { width: 10 }, // Period
    { width: 10 }, // Users
    { width: 15 }, // Retention Rate
    { width: 15 }, // Revenue
    { width: 15 }, // Churn Rate
  ];

  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Cohort Overview');

  // Retention Heatmap Sheet (if heatmap data available)
  if (data.heatmapData) {
    const heatmapSheet = XLSX.utils.json_to_sheet(data.heatmapData);
    XLSX.utils.book_append_sheet(workbook, heatmapSheet, 'Retention Heatmap');
  }

  // Statistics Sheet (if statistics available)
  if (data.statistics) {
    const statsData = [
      ['Statistical Analysis'],
      [''],
      ['Metric', 'Value'],
      ['Average Retention Rate', data.statistics.averageRetention || 'N/A'],
      ['Best Performing Cohort', data.statistics.bestCohort || 'N/A'],
      ['Worst Performing Cohort', data.statistics.worstCohort || 'N/A'],
      ['Retention Trend', data.statistics.trend || 'N/A'],
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
  }
}

function _addForecastSheetsToWorkbook(workbook: any, data: any, _options: any) {
  // Forecast Data Sheet
  const forecastData = [
    ['Forecast Report'],
    ['Generated:', new Date().toISOString()],
    ['Model:', data.model || 'Unknown'],
    [''],
    ['Date', 'Prediction', 'Lower Bound', 'Upper Bound', 'Confidence'],
  ];

  if (data.predictions) {
    data.predictions.forEach((prediction: any) => {
      forecastData.push([
        prediction.date,
        prediction.value,
        prediction.lowerBound || '',
        prediction.upperBound || '',
        prediction.confidence || '',
      ]);
    });
  }

  const forecastSheet = XLSX.utils.aoa_to_sheet(forecastData);
  XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast Data');

  // Model Evaluation Sheet (if evaluation data available)
  if (data.evaluation) {
    const evalData = [
      ['Model Evaluation'],
      [''],
      ['Metric', 'Value'],
      ['MAPE', data.evaluation.mape || 'N/A'],
      ['RMSE', data.evaluation.rmse || 'N/A'],
      ['R²', data.evaluation.r2 || 'N/A'],
      ['Accuracy', data.evaluation.accuracy || 'N/A'],
    ];

    const evalSheet = XLSX.utils.aoa_to_sheet(evalData);
    XLSX.utils.book_append_sheet(workbook, evalSheet, 'Model Evaluation');
  }

  // Scenarios Sheet (if scenario data available)
  if (data.scenarios) {
    const scenarioData = [
      ['Scenario Analysis'],
      [''],
      ['Scenario', 'Description', 'Impact', 'Probability'],
    ];

    Object.entries(data.scenarios).forEach(
      ([name, scenario]: [string, any]) => {
        scenarioData.push([
          name,
          scenario.description || '',
          scenario.impact || '',
          scenario.probability || '',
        ]);
      }
    );

    const scenarioSheet = XLSX.utils.aoa_to_sheet(scenarioData);
    XLSX.utils.book_append_sheet(workbook, scenarioSheet, 'Scenarios');
  }
}

function _addInsightsSheetsToWorkbook(workbook: any, data: any, _options: any) {
  // Correlations Sheet
  if (data.correlations) {
    const corrData = [
      ['Correlation Analysis'],
      ['Generated:', new Date().toISOString()],
      [''],
      [
        'Metric 1',
        'Metric 2',
        'Correlation',
        'Significance',
        'Strength',
        'Interpretation',
      ],
    ];

    data.correlations.forEach((corr: any) => {
      corrData.push([
        corr.metric1,
        corr.metric2,
        corr.correlation,
        corr.significance,
        corr.strength,
        corr.interpretation || '',
      ]);
    });

    const corrSheet = XLSX.utils.aoa_to_sheet(corrData);
    XLSX.utils.book_append_sheet(workbook, corrSheet, 'Correlations');
  }

  // Anomalies Sheet
  if (data.anomalies) {
    const anomalyData = [
      ['Anomaly Detection'],
      [''],
      [
        'Metric',
        'Timestamp',
        'Value',
        'Expected Value',
        'Deviation',
        'Severity',
        'Explanation',
      ],
    ];

    data.anomalies.forEach((anomaly: any) => {
      anomalyData.push([
        anomaly.metric,
        anomaly.timestamp,
        anomaly.value,
        anomaly.expectedValue,
        anomaly.deviation,
        anomaly.severity,
        anomaly.explanation || '',
      ]);
    });

    const anomalySheet = XLSX.utils.aoa_to_sheet(anomalyData);
    XLSX.utils.book_append_sheet(workbook, anomalySheet, 'Anomalies');
  }

  // Predictions Sheet
  if (data.predictions) {
    const predData = [
      ['Predictive Insights'],
      [''],
      [
        'Metric',
        'Prediction',
        'Confidence',
        'Timeframe',
        'Factors',
        'Reasoning',
      ],
    ];

    data.predictions.forEach((pred: any) => {
      predData.push([
        pred.metric,
        pred.prediction,
        pred.confidence,
        pred.timeframe,
        Array.isArray(pred.factors)
          ? pred.factors.join(', ')
          : pred.factors || '',
        pred.reasoning || '',
      ]);
    });

    const predSheet = XLSX.utils.aoa_to_sheet(predData);
    XLSX.utils.book_append_sheet(workbook, predSheet, 'Predictions');
  }

  // Recommendations Sheet
  if (data.recommendations) {
    const recData = [
      ['Recommendations'],
      [''],
      ['Priority', 'Recommendation', 'Impact', 'Effort'],
    ];

    data.recommendations.forEach((rec: any, index: number) => {
      recData.push([
        `Priority ${index + 1}`,
        typeof rec === 'string' ? rec : rec.text || rec.recommendation || '',
        rec.impact || 'Medium',
        rec.effort || 'Medium',
      ]);
    });

    const recSheet = XLSX.utils.aoa_to_sheet(recData);
    XLSX.utils.book_append_sheet(workbook, recSheet, 'Recommendations');
  }
}

function _addDashboardSheetsToWorkbook(
  workbook: any,
  data: any,
  _options: any
) {
  // KPIs Sheet
  const kpiData = [
    ['Analytics Dashboard'],
    ['Generated:', new Date().toISOString()],
    [''],
    ['Key Performance Indicators'],
    ['Metric', 'Current Value', 'Change', 'Trend'],
  ];

  if (data.kpis) {
    Object.entries(data.kpis).forEach(([key, value]: [string, any]) => {
      kpiData.push([
        key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
        typeof value === 'number' ? value : value?.toString() || 'N/A',
        '', // TODO: Add change calculation
        '', // TODO: Add trend calculation
      ]);
    });
  }

  const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');

  // Include other data if available
  if (data.cohorts) {
    const cohortSheet = XLSX.utils.json_to_sheet(data.cohorts);
    XLSX.utils.book_append_sheet(workbook, cohortSheet, 'Cohort Data');
  }

  if (data.forecasts) {
    const forecastSheet = XLSX.utils.json_to_sheet(data.forecasts);
    XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast Data');
  }

  if (data.insights) {
    const insightData = [['Key Insights'], ['']];

    data.insights.forEach((insight: any, index: number) => {
      insightData.push([
        `${index + 1}.`,
        typeof insight === 'string' ? insight : insight.text || '',
      ]);
    });

    const insightSheet = XLSX.utils.aoa_to_sheet(insightData);
    XLSX.utils.book_append_sheet(workbook, insightSheet, 'Insights');
  }
}
