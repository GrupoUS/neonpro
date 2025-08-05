function generateInsightsCSV(data) {
    if (!data.correlations && !data.anomalies) {
        throw new Error('Invalid insights data structure');
    }
    var csv = '';
    // Correlations section
    if (data.correlations) {
        csv += 'CORRELATIONS\n';
        csv += 'Metric 1,Metric 2,Correlation,Significance,Strength\n';
        data.correlations.forEach(function (corr) {
            var row = [
                corr.metric1,
                corr.metric2,
                corr.correlation,
                corr.significance,
                corr.strength
            ];
            csv += row.join(',') + '\n';
        });
        csv += '\n';
    }
    // Anomalies section
    if (data.anomalies) {
        csv += 'ANOMALIES\n';
        csv += 'Metric,Timestamp,Value,Expected Value,Deviation,Severity\n';
        data.anomalies.forEach(function (anomaly) {
            var row = [
                anomaly.metric,
                anomaly.timestamp,
                anomaly.value,
                anomaly.expectedValue,
                anomaly.deviation,
                anomaly.severity
            ];
            csv += row.join(',') + '\n';
        });
    }
    return csv;
}
function generateDashboardCSV(data) {
    if (!data.kpis) {
        throw new Error('Invalid dashboard data structure');
    }
    var headers = ['Metric', 'Value', 'Change', 'Trend'];
    var csv = headers.join(',') + '\n';
    Object.entries(data.kpis).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        var row = [
            key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); }),
            typeof value === 'number' ? value.toString() : value,
            '', // TODO: Add change calculation
            '' // TODO: Add trend calculation
        ];
        csv += row.join(',') + '\n';
    });
    return csv;
}
function generateRealtimeCSV(data) {
    if (!data.metrics) {
        throw new Error('Invalid realtime data structure');
    }
    var headers = ['Timestamp', 'Active Subscriptions', 'MRR', 'Trial Conversions', 'Churn Rate', 'New Signups'];
    var csv = headers.join(',') + '\n';
    var timestamp = new Date().toISOString();
    var row = [
        timestamp,
        data.metrics.activeSubscriptions,
        data.metrics.monthlyRecurringRevenue,
        data.metrics.trialConversions,
        data.metrics.churnRate,
        data.metrics.newSignups
    ];
    csv += row.join(',') + '\n';
    return csv;
}
// Excel Generation Functions
function addCohortSheetsToWorkbook(workbook, data, options) {
    // Cohort Overview Sheet
    var overviewData = [
        ['Cohort Analysis Report'],
        ['Generated:', new Date().toISOString()],
        [''],
        ['Cohort', 'Period', 'Users', 'Retention Rate', 'Revenue', 'Churn Rate']
    ];
    if (data.metrics) {
        data.metrics.forEach(function (metric) {
            overviewData.push([
                metric.cohortId,
                metric.period,
                metric.totalUsers,
                metric.retentionRate / 100, // Excel percentage format
                metric.revenue,
                metric.churnRate / 100
            ]);
        });
    }
    var overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    // Format columns
    overviewSheet['!cols'] = [
        { width: 15 }, // Cohort
        { width: 10 }, // Period
        { width: 10 }, // Users
        { width: 15 }, // Retention Rate
        { width: 15 }, // Revenue
        { width: 15 } // Churn Rate
    ];
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Cohort Overview');
    // Retention Heatmap Sheet (if heatmap data available)
    if (data.heatmapData) {
        var heatmapSheet = XLSX.utils.json_to_sheet(data.heatmapData);
        XLSX.utils.book_append_sheet(workbook, heatmapSheet, 'Retention Heatmap');
    }
    // Statistics Sheet (if statistics available)
    if (data.statistics) {
        var statsData = [
            ['Statistical Analysis'],
            [''],
            ['Metric', 'Value'],
            ['Average Retention Rate', data.statistics.averageRetention || 'N/A'],
            ['Best Performing Cohort', data.statistics.bestCohort || 'N/A'],
            ['Worst Performing Cohort', data.statistics.worstCohort || 'N/A'],
            ['Retention Trend', data.statistics.trend || 'N/A']
        ];
        var statsSheet = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }
}
function addForecastSheetsToWorkbook(workbook, data, options) {
    // Forecast Data Sheet
    var forecastData = [
        ['Forecast Report'],
        ['Generated:', new Date().toISOString()],
        ['Model:', data.model || 'Unknown'],
        [''],
        ['Date', 'Prediction', 'Lower Bound', 'Upper Bound', 'Confidence']
    ];
    if (data.predictions) {
        data.predictions.forEach(function (prediction) {
            forecastData.push([
                prediction.date,
                prediction.value,
                prediction.lowerBound || '',
                prediction.upperBound || '',
                prediction.confidence || ''
            ]);
        });
    }
    var forecastSheet = XLSX.utils.aoa_to_sheet(forecastData);
    XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast Data');
    // Model Evaluation Sheet (if evaluation data available)
    if (data.evaluation) {
        var evalData = [
            ['Model Evaluation'],
            [''],
            ['Metric', 'Value'],
            ['MAPE', data.evaluation.mape || 'N/A'],
            ['RMSE', data.evaluation.rmse || 'N/A'],
            ['R²', data.evaluation.r2 || 'N/A'],
            ['Accuracy', data.evaluation.accuracy || 'N/A']
        ];
        var evalSheet = XLSX.utils.aoa_to_sheet(evalData);
        XLSX.utils.book_append_sheet(workbook, evalSheet, 'Model Evaluation');
    }
    // Scenarios Sheet (if scenario data available)
    if (data.scenarios) {
        var scenarioData_1 = [
            ['Scenario Analysis'],
            [''],
            ['Scenario', 'Description', 'Impact', 'Probability']
        ];
        Object.entries(data.scenarios).forEach(function (_a) {
            var name = _a[0], scenario = _a[1];
            scenarioData_1.push([
                name,
                scenario.description || '',
                scenario.impact || '',
                scenario.probability || ''
            ]);
        });
        var scenarioSheet = XLSX.utils.aoa_to_sheet(scenarioData_1);
        XLSX.utils.book_append_sheet(workbook, scenarioSheet, 'Scenarios');
    }
}
function addInsightsSheetsToWorkbook(workbook, data, options) {
    // Correlations Sheet
    if (data.correlations) {
        var corrData_1 = [
            ['Correlation Analysis'],
            ['Generated:', new Date().toISOString()],
            [''],
            ['Metric 1', 'Metric 2', 'Correlation', 'Significance', 'Strength', 'Interpretation']
        ];
        data.correlations.forEach(function (corr) {
            corrData_1.push([
                corr.metric1,
                corr.metric2,
                corr.correlation,
                corr.significance,
                corr.strength,
                corr.interpretation || ''
            ]);
        });
        var corrSheet = XLSX.utils.aoa_to_sheet(corrData_1);
        XLSX.utils.book_append_sheet(workbook, corrSheet, 'Correlations');
    }
    // Anomalies Sheet
    if (data.anomalies) {
        var anomalyData_1 = [
            ['Anomaly Detection'],
            [''],
            ['Metric', 'Timestamp', 'Value', 'Expected Value', 'Deviation', 'Severity', 'Explanation']
        ];
        data.anomalies.forEach(function (anomaly) {
            anomalyData_1.push([
                anomaly.metric,
                anomaly.timestamp,
                anomaly.value,
                anomaly.expectedValue,
                anomaly.deviation,
                anomaly.severity,
                anomaly.explanation || ''
            ]);
        });
        var anomalySheet = XLSX.utils.aoa_to_sheet(anomalyData_1);
        XLSX.utils.book_append_sheet(workbook, anomalySheet, 'Anomalies');
    }
    // Predictions Sheet
    if (data.predictions) {
        var predData_1 = [
            ['Predictive Insights'],
            [''],
            ['Metric', 'Prediction', 'Confidence', 'Timeframe', 'Factors', 'Reasoning']
        ];
        data.predictions.forEach(function (pred) {
            predData_1.push([
                pred.metric,
                pred.prediction,
                pred.confidence,
                pred.timeframe,
                Array.isArray(pred.factors) ? pred.factors.join(', ') : pred.factors || '',
                pred.reasoning || ''
            ]);
        });
        var predSheet = XLSX.utils.aoa_to_sheet(predData_1);
        XLSX.utils.book_append_sheet(workbook, predSheet, 'Predictions');
    }
    // Recommendations Sheet
    if (data.recommendations) {
        var recData_1 = [
            ['Recommendations'],
            [''],
            ['Priority', 'Recommendation', 'Impact', 'Effort']
        ];
        data.recommendations.forEach(function (rec, index) {
            recData_1.push([
                "Priority ".concat(index + 1),
                typeof rec === 'string' ? rec : rec.text || rec.recommendation || '',
                rec.impact || 'Medium',
                rec.effort || 'Medium'
            ]);
        });
        var recSheet = XLSX.utils.aoa_to_sheet(recData_1);
        XLSX.utils.book_append_sheet(workbook, recSheet, 'Recommendations');
    }
}
function addDashboardSheetsToWorkbook(workbook, data, options) {
    // KPIs Sheet
    var kpiData = [
        ['Analytics Dashboard'],
        ['Generated:', new Date().toISOString()],
        [''],
        ['Key Performance Indicators'],
        ['Metric', 'Current Value', 'Change', 'Trend']
    ];
    if (data.kpis) {
        Object.entries(data.kpis).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            kpiData.push([
                key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); }),
                typeof value === 'number' ? value : (value === null || value === void 0 ? void 0 : value.toString()) || 'N/A',
                '', // TODO: Add change calculation
                '' // TODO: Add trend calculation
            ]);
        });
    }
    var kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');
    // Include other data if available
    if (data.cohorts) {
        var cohortSheet = XLSX.utils.json_to_sheet(data.cohorts);
        XLSX.utils.book_append_sheet(workbook, cohortSheet, 'Cohort Data');
    }
    if (data.forecasts) {
        var forecastSheet = XLSX.utils.json_to_sheet(data.forecasts);
        XLSX.utils.book_append_sheet(workbook, forecastSheet, 'Forecast Data');
    }
    if (data.insights) {
        var insightData_1 = [
            ['Key Insights'],
            ['']
        ];
        data.insights.forEach(function (insight, index) {
            insightData_1.push(["".concat(index + 1, "."), typeof insight === 'string' ? insight : insight.text || '']);
        });
        var insightSheet = XLSX.utils.aoa_to_sheet(insightData_1);
        XLSX.utils.book_append_sheet(workbook, insightSheet, 'Insights');
    }
}
