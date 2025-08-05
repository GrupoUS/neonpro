import jsPDF from "jspdf";
import "jspdf-autotable";

// Extend jsPDF interface to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFOptions {
  title?: string;
  includeCharts?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  orientation?: "portrait" | "landscape";
  format?: string;
}

export function generateCohortPDF(data: any, options: PDFOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || "landscape",
    format: options.format || "a4",
  });

  // Header
  if (options.includeHeader !== false) {
    addPDFHeader(doc, "Cohort Analysis Report");
  }

  let yPosition = 30;

  // Overview Section
  doc.setFontSize(16);
  doc.text("Cohort Overview", 14, yPosition);
  yPosition += 10;

  if (data.metrics && data.metrics.length > 0) {
    const tableData = data.metrics.map((metric: any) => [
      metric.cohortId || "N/A",
      metric.period || "N/A",
      metric.totalUsers?.toString() || "0",
      `${(metric.retentionRate || 0).toFixed(2)}%`,
      `$${(metric.revenue || 0).toLocaleString()}`,
      `${(metric.churnRate || 0).toFixed(2)}%`,
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Cohort", "Period", "Users", "Retention Rate", "Revenue", "Churn Rate"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [51, 51, 51] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Key Insights Section
  if (data.insights && data.insights.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Key Insights", 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    data.insights.forEach((insight: any, index: number) => {
      const text = typeof insight === "string" ? insight : insight.text || "";
      const lines = doc.splitTextToSize(`${index + 1}. ${text}`, 260);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 5 + 5;
    });
  }

  // Statistics Section
  if (data.statistics) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Statistical Summary", 14, yPosition);
    yPosition += 15;

    const statsData = [
      ["Average Retention Rate", `${(data.statistics.averageRetention || 0).toFixed(2)}%`],
      ["Best Performing Cohort", data.statistics.bestCohort || "N/A"],
      ["Worst Performing Cohort", data.statistics.worstCohort || "N/A"],
      ["Overall Trend", data.statistics.trend || "N/A"],
    ];

    doc.autoTable({
      startY: yPosition,
      body: statsData,
      theme: "striped",
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
  }

  // Footer
  if (options.includeFooter !== false) {
    addPDFFooter(doc);
  }

  return doc;
}

export function generateForecastPDF(data: any, options: PDFOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || "portrait",
    format: options.format || "a4",
  });

  // Header
  if (options.includeHeader !== false) {
    addPDFHeader(doc, "Forecast Analysis Report");
  }

  let yPosition = 30;

  // Model Information
  doc.setFontSize(16);
  doc.text("Forecast Model", 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.text(`Model: ${data.model || "Unknown"}`, 14, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
  yPosition += 15;

  // Predictions Table
  if (data.predictions && data.predictions.length > 0) {
    doc.setFontSize(16);
    doc.text("Predictions", 14, yPosition);
    yPosition += 10;

    const tableData = data.predictions
      .slice(0, 20)
      .map((prediction: any) => [
        new Date(prediction.date).toLocaleDateString(),
        prediction.value?.toFixed(2) || "N/A",
        prediction.lowerBound?.toFixed(2) || "",
        prediction.upperBound?.toFixed(2) || "",
        prediction.confidence ? `${(prediction.confidence * 100).toFixed(1)}%` : "",
      ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Date", "Prediction", "Lower Bound", "Upper Bound", "Confidence"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 51, 51] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Model Evaluation
  if (data.evaluation) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Model Evaluation", 14, yPosition);
    yPosition += 15;

    const evalData = [
      ["MAPE (Mean Absolute Percentage Error)", `${(data.evaluation.mape || 0).toFixed(4)}`],
      ["RMSE (Root Mean Square Error)", `${(data.evaluation.rmse || 0).toFixed(4)}`],
      ["R² (Coefficient of Determination)", `${(data.evaluation.r2 || 0).toFixed(4)}`],
      ["Accuracy", `${((data.evaluation.accuracy || 0) * 100).toFixed(2)}%`],
    ];

    doc.autoTable({
      startY: yPosition,
      body: evalData,
      theme: "striped",
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Scenarios
  if (data.scenarios) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Scenario Analysis", 14, yPosition);
    yPosition += 15;

    const scenarioData = Object.entries(data.scenarios).map(([name, scenario]: [string, any]) => [
      name,
      scenario.description || "",
      scenario.impact || "",
      scenario.probability ? `${(scenario.probability * 100).toFixed(1)}%` : "",
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Scenario", "Description", "Impact", "Probability"]],
      body: scenarioData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 51, 51] },
    });
  }

  // Footer
  if (options.includeFooter !== false) {
    addPDFFooter(doc);
  }

  return doc;
}

export function generateInsightsPDF(data: any, options: PDFOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || "portrait",
    format: options.format || "a4",
  });

  // Header
  if (options.includeHeader !== false) {
    addPDFHeader(doc, "Statistical Insights Report");
  }

  let yPosition = 30;

  // Correlations Section
  if (data.correlations && data.correlations.length > 0) {
    doc.setFontSize(16);
    doc.text("Correlation Analysis", 14, yPosition);
    yPosition += 15;

    const corrData = data.correlations.map((corr: any) => [
      corr.metric1 || "",
      corr.metric2 || "",
      (corr.correlation || 0).toFixed(3),
      corr.significance || "N/A",
      corr.strength || "N/A",
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Metric 1", "Metric 2", "Correlation", "Significance", "Strength"]],
      body: corrData,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [51, 51, 51] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Anomalies Section
  if (data.anomalies && data.anomalies.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Anomaly Detection", 14, yPosition);
    yPosition += 15;

    const anomalyData = data.anomalies
      .slice(0, 15)
      .map((anomaly: any) => [
        anomaly.metric || "",
        new Date(anomaly.timestamp).toLocaleDateString(),
        (anomaly.value || 0).toString(),
        (anomaly.expectedValue || 0).toString(),
        `${((anomaly.deviation || 0) * 100).toFixed(2)}%`,
        anomaly.severity || "Low",
      ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Metric", "Date", "Value", "Expected", "Deviation", "Severity"]],
      body: anomalyData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Predictions Section
  if (data.predictions && data.predictions.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Predictive Insights", 14, yPosition);
    yPosition += 15;

    data.predictions.slice(0, 10).forEach((pred: any, index: number) => {
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${pred.metric || "Unknown Metric"}`, 14, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.text(`Prediction: ${pred.prediction || "N/A"}`, 20, yPosition);
      yPosition += 5;
      doc.text(
        `Confidence: ${pred.confidence ? `${(pred.confidence * 100).toFixed(1)}%` : "N/A"}`,
        20,
        yPosition,
      );
      yPosition += 5;
      doc.text(`Timeframe: ${pred.timeframe || "N/A"}`, 20, yPosition);
      yPosition += 8;

      if (pred.reasoning) {
        const reasoningLines = doc.splitTextToSize(`Reasoning: ${pred.reasoning}`, 160);
        doc.text(reasoningLines, 20, yPosition);
        yPosition += reasoningLines.length * 5 + 5;
      }

      yPosition += 5; // Extra spacing between predictions
    });
  }

  // Recommendations Section
  if (data.recommendations && data.recommendations.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.text("Recommendations", 14, yPosition);
    yPosition += 15;

    data.recommendations.slice(0, 8).forEach((rec: any, index: number) => {
      const text = typeof rec === "string" ? rec : rec.text || rec.recommendation || "";
      const lines = doc.splitTextToSize(`${index + 1}. ${text}`, 170);

      doc.setFontSize(10);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 5 + 8;
    });
  }

  // Footer
  if (options.includeFooter !== false) {
    addPDFFooter(doc);
  }

  return doc;
}

export function generateDashboardPDF(data: any, options: PDFOptions = {}): jsPDF {
  const doc = new jsPDF({
    orientation: options.orientation || "landscape",
    format: options.format || "a4",
  });

  // Header
  if (options.includeHeader !== false) {
    addPDFHeader(doc, "Analytics Dashboard Report");
  }

  let yPosition = 30;

  // KPIs Section
  if (data.kpis) {
    doc.setFontSize(16);
    doc.text("Key Performance Indicators", 14, yPosition);
    yPosition += 15;

    const kpiData = Object.entries(data.kpis).map(([key, value]: [string, any]) => [
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      typeof value === "number" ? value.toLocaleString() : value?.toString() || "N/A",
    ]);

    doc.autoTable({
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: kpiData,
      theme: "striped",
      styles: { fontSize: 11 },
      headStyles: { fillColor: [51, 51, 51] },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 25;
  }

  // Summary sections for other data types
  const sections = [
    { key: "cohorts", title: "Cohort Summary", maxRows: 5 },
    { key: "forecasts", title: "Forecast Summary", maxRows: 5 },
    { key: "insights", title: "Key Insights", maxRows: 8 },
  ];

  sections.forEach((section) => {
    if (data[section.key] && data[section.key].length > 0) {
      if (yPosition > 150) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(section.title, 14, yPosition);
      yPosition += 10;

      if (section.key === "insights") {
        doc.setFontSize(10);
        data[section.key].slice(0, section.maxRows).forEach((insight: any, _index: number) => {
          const text = typeof insight === "string" ? insight : insight.text || "";
          const lines = doc.splitTextToSize(`• ${text}`, 260);
          doc.text(lines, 14, yPosition);
          yPosition += lines.length * 5 + 3;
        });
      } else {
        // For cohorts and forecasts, show basic summary table
        const summaryData = data[section.key]
          .slice(0, section.maxRows)
          .map((item: any, index: number) => [
            `Item ${index + 1}`,
            item.name || item.title || item.metric || "N/A",
            item.value?.toString() || item.prediction?.toString() || "N/A",
          ]);

        doc.autoTable({
          startY: yPosition,
          head: [["#", "Description", "Value"]],
          body: summaryData,
          theme: "grid",
          styles: { fontSize: 9 },
          headStyles: { fillColor: [51, 51, 51] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }
  });

  // Footer
  if (options.includeFooter !== false) {
    addPDFFooter(doc);
  }

  return doc;
}

// Helper functions
function addPDFHeader(doc: jsPDF, title: string) {
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  // Add a line under the header
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 28, doc.internal.pageSize.width - 14, 28);
}

function addPDFFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Add line above footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 15, doc.internal.pageSize.width - 14, pageHeight - 15);

    // Add footer text
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("NeonPro Analytics - Confidential", 14, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 50, pageHeight - 10);
  }
}
