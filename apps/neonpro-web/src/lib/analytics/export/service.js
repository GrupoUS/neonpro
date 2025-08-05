// Analytics Export Service - STORY-SUB-002 Task 7
// Created: 2025-01-22
// High-performance export service with PDF, Excel, and CSV generation
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createanalyticsExportService = exports.AnalyticsExportService = void 0;
var jspdf_1 = require("jspdf");
var XLSX = require("xlsx");
var service_1 = require("../service");
var server_1 = require("@/lib/supabase/server");
// ============================================================================
// EXPORT SERVICE CLASS
// ============================================================================
var AnalyticsExportService = /** @class */ (() => {
  function AnalyticsExportService() {
    this.analyticsService = new service_1.AnalyticsService();
    this.supabase = (0, server_1.createClient)();
  }
  // ========================================================================
  // MAIN EXPORT METHODS
  // ========================================================================
  /**
   * Generate export based on configuration
   */
  AnalyticsExportService.prototype.generateExport = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        data,
        fileBuffer,
        fileName,
        mimeType,
        _a,
        pdfOptions,
        excelOptions,
        csvOptions,
        downloadUrl,
        processingTime,
        response,
        error_1,
        response;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 20, , 22]);
            // Update status to processing
            return [
              4 /*yield*/,
              this.updateExportStatus(request.id, "processing", {
                percentage: 0,
                currentStep: "Fetching data",
                estimatedTimeRemaining: 30000,
              }),
              // Fetch analytics data
            ];
          case 2:
            // Update status to processing
            _b.sent();
            return [4 /*yield*/, this.fetchAnalyticsData(request.config)];
          case 3:
            data = _b.sent();
            return [
              4 /*yield*/,
              this.updateExportStatus(request.id, "processing", {
                percentage: 30,
                currentStep: "Processing data",
                estimatedTimeRemaining: 20000,
              }),
              // Generate file based on format
            ];
          case 4:
            _b.sent();
            fileBuffer = void 0;
            fileName = void 0;
            mimeType = void 0;
            _a = request.config.format;
            switch (_a) {
              case "pdf":
                return [3 /*break*/, 5];
              case "excel":
                return [3 /*break*/, 7];
              case "csv":
                return [3 /*break*/, 9];
              case "json":
                return [3 /*break*/, 11];
            }
            return [3 /*break*/, 12];
          case 5:
            pdfOptions = request.pdfOptions || DEFAULT_PDF_OPTIONS;
            return [4 /*yield*/, this.generatePDF(data, request.config, pdfOptions)];
          case 6:
            fileBuffer = _b.sent();
            fileName = "analytics-"
              .concat(request.config.reportType, "-")
              .concat(Date.now(), ".pdf");
            mimeType = "application/pdf";
            return [3 /*break*/, 13];
          case 7:
            excelOptions = request.excelOptions || DEFAULT_EXCEL_OPTIONS;
            return [4 /*yield*/, this.generateExcel(data, request.config, excelOptions)];
          case 8:
            fileBuffer = _b.sent();
            fileName = "analytics-"
              .concat(request.config.reportType, "-")
              .concat(Date.now(), ".xlsx");
            mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            return [3 /*break*/, 13];
          case 9:
            csvOptions = request.csvOptions || DEFAULT_CSV_OPTIONS;
            return [4 /*yield*/, this.generateCSV(data, request.config, csvOptions)];
          case 10:
            fileBuffer = _b.sent();
            fileName = "analytics-"
              .concat(request.config.reportType, "-")
              .concat(Date.now(), ".csv");
            mimeType = "text/csv";
            return [3 /*break*/, 13];
          case 11:
            fileBuffer = Buffer.from(JSON.stringify(data, null, 2));
            fileName = "analytics-"
              .concat(request.config.reportType, "-")
              .concat(Date.now(), ".json");
            mimeType = "application/json";
            return [3 /*break*/, 13];
          case 12:
            throw new Error("Unsupported export format: ".concat(request.config.format));
          case 13:
            return [
              4 /*yield*/,
              this.updateExportStatus(request.id, "processing", {
                percentage: 80,
                currentStep: "Uploading file",
                estimatedTimeRemaining: 5000,
              }),
              // Upload file to storage
            ];
          case 14:
            _b.sent();
            return [4 /*yield*/, this.uploadFile(fileName, fileBuffer, mimeType)];
          case 15:
            downloadUrl = _b.sent();
            processingTime = Date.now() - startTime;
            response = {
              id: request.id,
              status: "completed",
              downloadUrl: downloadUrl,
              fileName: fileName,
              fileSize: fileBuffer.length,
              createdAt: new Date(startTime),
              completedAt: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              progress: {
                percentage: 100,
                currentStep: "Completed",
                estimatedTimeRemaining: 0,
              },
            };
            return [
              4 /*yield*/,
              this.updateExportStatus(request.id, "completed"),
              // Send notification if requested
            ];
          case 16:
            _b.sent();
            if (!(request.notifyOnComplete && request.email)) return [3 /*break*/, 18];
            return [4 /*yield*/, this.sendCompletionNotification(request.email, response)];
          case 17:
            _b.sent();
            _b.label = 18;
          case 18:
            // Log export metrics
            return [4 /*yield*/, this.logExportMetrics(request, processingTime, fileBuffer.length)];
          case 19:
            // Log export metrics
            _b.sent();
            return [2 /*return*/, response];
          case 20:
            error_1 = _b.sent();
            return [4 /*yield*/, this.updateExportStatus(request.id, "failed")];
          case 21:
            _b.sent();
            response = {
              id: request.id,
              status: "failed",
              fileName: "",
              createdAt: new Date(startTime),
              expiresAt: new Date(),
              error: {
                code: "EXPORT_FAILED",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
                details: error_1,
              },
            };
            return [2 /*return*/, response];
          case 22:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // DATA FETCHING
  // ========================================================================
  AnalyticsExportService.prototype.fetchAnalyticsData = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var reportType,
        dateRange,
        filters,
        startDate,
        endDate,
        data,
        queryStart,
        _a,
        _b,
        _c,
        trialMetrics,
        _d,
        _e,
        _f,
        _g,
        _h,
        _j,
        error_2;
      return __generator(this, function (_k) {
        switch (_k.label) {
          case 0:
            (reportType = config.reportType),
              (dateRange = config.dateRange),
              (filters = config.filters);
            (startDate = dateRange.startDate), (endDate = dateRange.endDate);
            data = {
              metadata: {
                generatedAt: new Date(),
                period: "month", // Default period
                totalRecords: 0,
                dataFreshness: new Date(),
                queryExecutionTime: 0,
              },
            };
            queryStart = Date.now();
            _k.label = 1;
          case 1:
            _k.trys.push([1, 19, , 20]);
            _a = reportType;
            switch (_a) {
              case "revenue":
                return [3 /*break*/, 2];
              case "conversion":
                return [3 /*break*/, 4];
              case "trial":
                return [3 /*break*/, 6];
              case "cohort":
                return [3 /*break*/, 8];
              case "forecast":
                return [3 /*break*/, 10];
              case "comprehensive":
                return [3 /*break*/, 12];
            }
            return [3 /*break*/, 17];
          case 2:
            _b = data;
            return [
              4 /*yield*/,
              this.analyticsService.getRevenueAnalytics("month", startDate, endDate, filters),
            ];
          case 3:
            _b.revenue = _k.sent();
            return [3 /*break*/, 18];
          case 4:
            _c = data;
            return [
              4 /*yield*/,
              this.analyticsService.getConversionAnalytics("month", startDate, endDate, filters),
            ];
          case 5:
            _c.conversion = _k.sent();
            return [3 /*break*/, 18];
          case 6:
            return [
              4 /*yield*/,
              this.analyticsService.getTrialMetrics(startDate, endDate, filters),
            ];
          case 7:
            trialMetrics = _k.sent();
            data.trials = trialMetrics;
            return [3 /*break*/, 18];
          case 8:
            _d = data;
            return [
              4 /*yield*/,
              this.analyticsService.getCohortAnalysis(startDate, endDate, filters),
            ];
          case 9:
            _d.cohorts = _k.sent();
            return [3 /*break*/, 18];
          case 10:
            _e = data;
            return [
              4 /*yield*/,
              this.analyticsService.getRevenueForecasts(startDate, endDate, filters),
            ];
          case 11:
            _e.forecasts = _k.sent();
            return [3 /*break*/, 18];
          case 12:
            // Fetch all data types
            _f = data;
            return [
              4 /*yield*/,
              this.analyticsService.getRevenueAnalytics("month", startDate, endDate, filters),
            ];
          case 13:
            // Fetch all data types
            _f.revenue = _k.sent();
            _g = data;
            return [
              4 /*yield*/,
              this.analyticsService.getConversionAnalytics("month", startDate, endDate, filters),
            ];
          case 14:
            _g.conversion = _k.sent();
            _h = data;
            return [
              4 /*yield*/,
              this.analyticsService.getCohortAnalysis(startDate, endDate, filters),
            ];
          case 15:
            _h.cohorts = _k.sent();
            _j = data;
            return [
              4 /*yield*/,
              this.analyticsService.getRevenueForecasts(startDate, endDate, filters),
            ];
          case 16:
            _j.forecasts = _k.sent();
            return [3 /*break*/, 18];
          case 17:
            throw new Error("Unsupported report type: ".concat(reportType));
          case 18:
            data.metadata.queryExecutionTime = Date.now() - queryStart;
            data.metadata.totalRecords = this.calculateTotalRecords(data);
            return [2 /*return*/, data];
          case 19:
            error_2 = _k.sent();
            throw new Error(
              "Failed to fetch analytics data: ".concat(
                error_2 instanceof Error ? error_2.message : "Unknown error",
              ),
            );
          case 20:
            return [2 /*return*/];
        }
      });
    });
  };
  // ========================================================================
  // PDF GENERATION
  // ========================================================================
  AnalyticsExportService.prototype.generatePDF = function (data, config, options) {
    return __awaiter(this, void 0, void 0, function () {
      var doc, yPosition, title, pageHeight, footerY;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            doc = new jspdf_1.default({
              orientation: options.orientation,
              unit: "mm",
              format: options.pageSize.toLowerCase(),
            });
            // Set up styling
            doc.setFont(options.styling.fontFamily);
            doc.setFontSize(options.styling.fontSize);
            yPosition = options.margins.top;
            // Add header
            if (options.header) {
              doc.setFontSize(options.header.fontSize);
              doc.text(
                options.header.text,
                this.getXPosition(options.header.alignment, doc),
                yPosition,
              );
              yPosition += 15;
            }
            // Add title
            doc.setFontSize(18);
            doc.setTextColor(options.styling.primaryColor);
            title =
              ((_a = config.customization) === null || _a === void 0 ? void 0 : _a.title) ||
              "Analytics Report - ".concat(config.reportType.toUpperCase());
            doc.text(title, options.margins.left, yPosition);
            yPosition += 15;
            // Add subtitle
            if ((_b = config.customization) === null || _b === void 0 ? void 0 : _b.subtitle) {
              doc.setFontSize(12);
              doc.setTextColor(options.styling.secondaryColor);
              doc.text(config.customization.subtitle, options.margins.left, yPosition);
              yPosition += 10;
            }
            // Add metadata
            doc.setFontSize(10);
            doc.setTextColor("#666666");
            doc.text(
              "Generated: ".concat(data.metadata.generatedAt.toLocaleString()),
              options.margins.left,
              yPosition,
            );
            yPosition += 5;
            doc.text(
              "Period: "
                .concat(config.dateRange.startDate.toLocaleDateString(), " - ")
                .concat(config.dateRange.endDate.toLocaleDateString()),
              options.margins.left,
              yPosition,
            );
            yPosition += 15;
            return [
              4 /*yield*/,
              this.addPDFContent(doc, data, config, options, yPosition),
              // Add footer
            ];
          case 1:
            // Add content based on report type
            yPosition = _c.sent();
            // Add footer
            if (options.footer) {
              pageHeight = doc.internal.pageSize.height;
              footerY = pageHeight - options.margins.bottom;
              if (options.footer.includePageNumbers) {
                doc.text(
                  "Page 1",
                  doc.internal.pageSize.width - options.margins.right - 20,
                  footerY,
                );
              }
              if (options.footer.includeTimestamp) {
                doc.text(
                  "Generated: ".concat(new Date().toLocaleString()),
                  options.margins.left,
                  footerY,
                );
              }
              if (options.footer.customText) {
                doc.text(options.footer.customText, options.margins.left, footerY - 5);
              }
            }
            return [2 /*return*/, Buffer.from(doc.output("arraybuffer"))];
        }
      });
    });
  };
  AnalyticsExportService.prototype.addPDFContent = function (doc, data, config, options, startY) {
    return __awaiter(this, void 0, void 0, function () {
      var yPosition;
      return __generator(this, function (_a) {
        yPosition = startY;
        // Add summary section
        if (config.includeSummary) {
          doc.setFontSize(14);
          doc.setTextColor(options.styling.primaryColor);
          doc.text("Executive Summary", options.margins.left, yPosition);
          yPosition += 10;
          doc.setFontSize(10);
          doc.setTextColor("#333333");
          doc.text(
            "Total Records: ".concat(data.metadata.totalRecords),
            options.margins.left,
            yPosition,
          );
          yPosition += 5;
          doc.text(
            "Query Execution Time: ".concat(data.metadata.queryExecutionTime, "ms"),
            options.margins.left,
            yPosition,
          );
          yPosition += 15;
        }
        // Add data sections based on report type
        if (data.revenue) {
          yPosition = this.addRevenueSectionToPDF(doc, data.revenue, options, yPosition);
        }
        if (data.conversion) {
          yPosition = this.addConversionSectionToPDF(doc, data.conversion, options, yPosition);
        }
        if (data.cohorts) {
          yPosition = this.addCohortSectionToPDF(doc, data.cohorts, options, yPosition);
        }
        return [2 /*return*/, yPosition];
      });
    });
  };
  AnalyticsExportService.prototype.addRevenueSectionToPDF = (doc, revenue, options, startY) => {
    var yPosition = startY;
    doc.setFontSize(14);
    doc.setTextColor(options.styling.primaryColor);
    doc.text("Revenue Analytics", options.margins.left, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor("#333333");
    if (revenue.mrr) {
      doc.text(
        "MRR Total: $".concat(revenue.mrr.total.toLocaleString()),
        options.margins.left,
        yPosition,
      );
      yPosition += 5;
      doc.text(
        "MRR Growth: ".concat(revenue.mrr.growth.toFixed(2), "%"),
        options.margins.left,
        yPosition,
      );
      yPosition += 5;
    }
    if (revenue.arr) {
      doc.text(
        "ARR Total: $".concat(revenue.arr.total.toLocaleString()),
        options.margins.left,
        yPosition,
      );
      yPosition += 5;
      doc.text(
        "ARR Growth: ".concat(revenue.arr.growth.toFixed(2), "%"),
        options.margins.left,
        yPosition,
      );
      yPosition += 10;
    }
    return yPosition;
  };
  AnalyticsExportService.prototype.addConversionSectionToPDF = (
    doc,
    conversion,
    options,
    startY,
  ) => {
    var yPosition = startY;
    doc.setFontSize(14);
    doc.setTextColor(options.styling.primaryColor);
    doc.text("Conversion Analytics", options.margins.left, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor("#333333");
    if (conversion.trialToPayment) {
      doc.text(
        "Trial to Payment: ".concat(conversion.trialToPayment.average.toFixed(2), "%"),
        options.margins.left,
        yPosition,
      );
      yPosition += 5;
    }
    if (conversion.signupToTrial) {
      doc.text(
        "Signup to Trial: ".concat(conversion.signupToTrial.average.toFixed(2), "%"),
        options.margins.left,
        yPosition,
      );
      yPosition += 10;
    }
    return yPosition;
  };
  AnalyticsExportService.prototype.addCohortSectionToPDF = (doc, cohorts, options, startY) => {
    var yPosition = startY;
    doc.setFontSize(14);
    doc.setTextColor(options.styling.primaryColor);
    doc.text("Cohort Analysis", options.margins.left, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor("#333333");
    cohorts.slice(0, 5).forEach((cohort, index) => {
      doc.text(
        "Cohort "
          .concat(cohort.period, ": ")
          .concat(cohort.size, " users, ")
          .concat(cohort.churnRate.toFixed(2), "% churn"),
        options.margins.left,
        yPosition,
      );
      yPosition += 5;
    });
    return yPosition + 10;
  };
  AnalyticsExportService.prototype.getXPosition = (alignment, doc) => {
    var pageWidth = doc.internal.pageSize.width;
    var margins = 20; // Default margin
    switch (alignment) {
      case "left":
        return margins;
      case "center":
        return pageWidth / 2;
      case "right":
        return pageWidth - margins;
      default:
        return margins;
    }
  };
  // ========================================================================
  // EXCEL GENERATION
  // ========================================================================
  AnalyticsExportService.prototype.generateExcel = function (data, config, options) {
    return __awaiter(this, void 0, void 0, function () {
      var workbook,
        summaryData,
        summaryWS,
        revenueData,
        revenueWS,
        conversionData,
        conversionWS,
        cohortData,
        cohortWS,
        forecastData,
        forecastWS,
        rawWS;
      return __generator(this, function (_a) {
        workbook = XLSX.utils.book_new();
        // Summary worksheet
        if (options.worksheets.summary) {
          summaryData = this.prepareSummaryData(data, config);
          summaryWS = XLSX.utils.json_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(workbook, summaryWS, "Summary");
        }
        // Revenue worksheet
        if (options.worksheets.revenue && data.revenue) {
          revenueData = this.prepareRevenueData(data.revenue);
          revenueWS = XLSX.utils.json_to_sheet(revenueData);
          XLSX.utils.book_append_sheet(workbook, revenueWS, "Revenue");
        }
        // Conversion worksheet
        if (options.worksheets.conversion && data.conversion) {
          conversionData = this.prepareConversionData(data.conversion);
          conversionWS = XLSX.utils.json_to_sheet(conversionData);
          XLSX.utils.book_append_sheet(workbook, conversionWS, "Conversion");
        }
        // Cohorts worksheet
        if (options.worksheets.cohorts && data.cohorts) {
          cohortData = this.prepareCohortData(data.cohorts);
          cohortWS = XLSX.utils.json_to_sheet(cohortData);
          XLSX.utils.book_append_sheet(workbook, cohortWS, "Cohorts");
        }
        // Forecasts worksheet
        if (options.worksheets.forecasts && data.forecasts) {
          forecastData = this.prepareForecastData(data.forecasts);
          forecastWS = XLSX.utils.json_to_sheet(forecastData);
          XLSX.utils.book_append_sheet(workbook, forecastWS, "Forecasts");
        }
        // Raw data worksheet
        if (options.worksheets.rawData && data.rawMetrics) {
          rawWS = XLSX.utils.json_to_sheet(data.rawMetrics);
          XLSX.utils.book_append_sheet(workbook, rawWS, "Raw Data");
        }
        // Apply formatting if enabled
        if (options.formatting.autoWidth) {
          // Auto-width columns (simplified implementation)
          Object.keys(workbook.Sheets).forEach((sheetName) => {
            var sheet = workbook.Sheets[sheetName];
            var range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
            var colWidths = [];
            for (var C = range.s.c; C <= range.e.c; ++C) {
              var maxWidth = 10;
              for (var R = range.s.r; R <= range.e.r; ++R) {
                var cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                var cell = sheet[cellAddress];
                if (cell && cell.v) {
                  var cellLength = cell.v.toString().length;
                  maxWidth = Math.max(maxWidth, cellLength);
                }
              }
              colWidths[C] = { width: Math.min(maxWidth, 50) };
            }
            sheet["!cols"] = colWidths;
          });
        }
        return [
          2 /*return*/,
          Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })),
        ];
      });
    });
  };
  // ========================================================================
  // CSV GENERATION
  // ========================================================================
  AnalyticsExportService.prototype.generateCSV = function (data, config, options) {
    return __awaiter(this, void 0, void 0, function () {
      var csvContent, zlib;
      return __generator(this, function (_a) {
        csvContent = "";
        // Add header comment
        csvContent += "# Analytics Export - ".concat(config.reportType.toUpperCase(), "\n");
        csvContent += "# Generated: ".concat(data.metadata.generatedAt.toISOString(), "\n");
        csvContent += "# Period: "
          .concat(config.dateRange.startDate.toISOString(), " to ")
          .concat(config.dateRange.endDate.toISOString(), "\n");
        csvContent += "\n";
        // Generate CSV based on report type
        switch (config.reportType) {
          case "revenue":
            if (data.revenue) {
              csvContent += this.generateRevenueCSV(data.revenue, options);
            }
            break;
          case "conversion":
            if (data.conversion) {
              csvContent += this.generateConversionCSV(data.conversion, options);
            }
            break;
          case "cohort":
            if (data.cohorts) {
              csvContent += this.generateCohortCSV(data.cohorts, options);
            }
            break;
          case "comprehensive":
            csvContent += this.generateComprehensiveCSV(data, options);
            break;
          default:
            csvContent += this.generateGenericCSV(data, options);
        }
        // Apply compression if requested
        if (options.compression === "gzip") {
          zlib = require("zlib");
          return [2 /*return*/, Buffer.from(zlib.gzipSync(csvContent))];
        }
        return [2 /*return*/, Buffer.from(csvContent, options.encoding)];
      });
    });
  };
  AnalyticsExportService.prototype.generateRevenueCSV = (revenue, options) => {
    var csv = "";
    if (options.includeHeaders) {
      csv += ["Metric", "Total", "Average", "Growth", "Period"].join(options.delimiter) + "\n";
    }
    if (revenue.mrr) {
      csv +=
        [
          "MRR",
          revenue.mrr.total,
          revenue.mrr.average,
          revenue.mrr.growth,
          revenue.mrr.period,
        ].join(options.delimiter) + "\n";
    }
    if (revenue.arr) {
      csv +=
        [
          "ARR",
          revenue.arr.total,
          revenue.arr.average,
          revenue.arr.growth,
          revenue.arr.period,
        ].join(options.delimiter) + "\n";
    }
    if (revenue.churn) {
      csv +=
        [
          "Churn",
          revenue.churn.total,
          revenue.churn.average,
          revenue.churn.growth,
          revenue.churn.period,
        ].join(options.delimiter) + "\n";
    }
    return csv;
  };
  AnalyticsExportService.prototype.generateConversionCSV = (conversion, options) => {
    var csv = "";
    if (options.includeHeaders) {
      csv += ["Metric", "Rate", "Total", "Growth"].join(options.delimiter) + "\n";
    }
    if (conversion.trialToPayment) {
      csv +=
        [
          "Trial to Payment",
          conversion.trialToPayment.average,
          conversion.trialToPayment.total,
          conversion.trialToPayment.growth,
        ].join(options.delimiter) + "\n";
    }
    if (conversion.signupToTrial) {
      csv +=
        [
          "Signup to Trial",
          conversion.signupToTrial.average,
          conversion.signupToTrial.total,
          conversion.signupToTrial.growth,
        ].join(options.delimiter) + "\n";
    }
    return csv;
  };
  AnalyticsExportService.prototype.generateCohortCSV = (cohorts, options) => {
    var csv = "";
    if (options.includeHeaders) {
      csv +=
        ["Cohort ID", "Period", "Size", "Churn Rate", "Revenue Per User"].join(options.delimiter) +
        "\n";
    }
    cohorts.forEach((cohort) => {
      csv +=
        [
          cohort.cohortId,
          cohort.period,
          cohort.size,
          cohort.churnRate,
          cohort.revenuePerUser[0] || 0,
        ].join(options.delimiter) + "\n";
    });
    return csv;
  };
  AnalyticsExportService.prototype.generateComprehensiveCSV = function (data, options) {
    var csv = "";
    csv += "# REVENUE METRICS\n";
    if (data.revenue) {
      csv += this.generateRevenueCSV(data.revenue, options);
    }
    csv += "\n# CONVERSION METRICS\n";
    if (data.conversion) {
      csv += this.generateConversionCSV(data.conversion, options);
    }
    csv += "\n# COHORT ANALYSIS\n";
    if (data.cohorts) {
      csv += this.generateCohortCSV(data.cohorts, options);
    }
    return csv;
  };
  AnalyticsExportService.prototype.generateGenericCSV = (data, options) =>
    JSON.stringify(data, null, 2);
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  AnalyticsExportService.prototype.prepareSummaryData = (data, config) => [
    { Metric: "Report Type", Value: config.reportType },
    { Metric: "Generated At", Value: data.metadata.generatedAt.toISOString() },
    { Metric: "Total Records", Value: data.metadata.totalRecords },
    { Metric: "Query Time (ms)", Value: data.metadata.queryExecutionTime },
    { Metric: "Data Freshness", Value: data.metadata.dataFreshness.toISOString() },
  ];
  AnalyticsExportService.prototype.prepareRevenueData = (revenue) => {
    var data = [];
    if (revenue.mrr) {
      data.push({
        Metric: "MRR",
        Total: revenue.mrr.total,
        Average: revenue.mrr.average,
        Growth: revenue.mrr.growth,
      });
    }
    if (revenue.arr) {
      data.push({
        Metric: "ARR",
        Total: revenue.arr.total,
        Average: revenue.arr.average,
        Growth: revenue.arr.growth,
      });
    }
    return data;
  };
  AnalyticsExportService.prototype.prepareConversionData = (conversion) => {
    var data = [];
    if (conversion.trialToPayment) {
      data.push({
        Metric: "Trial to Payment",
        Rate: conversion.trialToPayment.average,
        Growth: conversion.trialToPayment.growth,
      });
    }
    return data;
  };
  AnalyticsExportService.prototype.prepareCohortData = (cohorts) =>
    cohorts.map((cohort) => ({
      "Cohort ID": cohort.cohortId,
      Period: cohort.period,
      Size: cohort.size,
      "Churn Rate": cohort.churnRate,
      "Revenue Per User": cohort.revenuePerUser[0] || 0,
    }));
  AnalyticsExportService.prototype.prepareForecastData = (forecasts) =>
    forecasts.map((forecast, index) => {
      var _a, _b;
      return {
        Period: index + 1,
        Predicted: ((_a = forecast.predicted) === null || _a === void 0 ? void 0 : _a[0]) || 0,
        Confidence: ((_b = forecast.confidence) === null || _b === void 0 ? void 0 : _b[0]) || 0,
        Accuracy: forecast.accuracy || 0,
      };
    });
  AnalyticsExportService.prototype.calculateTotalRecords = (data) => {
    var total = 0;
    if (data.cohorts) total += data.cohorts.length;
    if (data.forecasts) total += data.forecasts.length;
    if (data.trials) total += data.trials.length;
    if (data.rawMetrics) total += data.rawMetrics.length;
    return total;
  };
  AnalyticsExportService.prototype.uploadFile = function (fileName, buffer, mimeType) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, urlData;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.storage
                .from("analytics-exports")
                .upload("exports/".concat(fileName), buffer, {
                  contentType: mimeType,
                  cacheControl: "3600",
                }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to upload file: ".concat(error.message));
            }
            urlData = this.supabase.storage
              .from("analytics-exports")
              .getPublicUrl("exports/".concat(fileName)).data;
            return [2 /*return*/, urlData.publicUrl];
        }
      });
    });
  };
  AnalyticsExportService.prototype.updateExportStatus = function (exportId, status, progress) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            updateData = { status: status };
            if (progress) {
              updateData.progress = progress;
            }
            if (status === "completed") {
              updateData.completed_at = new Date().toISOString();
            }
            return [
              4 /*yield*/,
              this.supabase.from("export_requests").update(updateData).eq("id", exportId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to update export status:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  AnalyticsExportService.prototype.sendCompletionNotification = function (email, response) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation would depend on your email service
        // This is a placeholder for the notification system
        console.log(
          "Sending completion notification to ".concat(email, " for export ").concat(response.id),
        );
        return [2 /*return*/];
      });
    });
  };
  AnalyticsExportService.prototype.logExportMetrics = function (request, processingTime, fileSize) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("export_metrics").insert({
                export_id: request.id,
                user_id: request.userId,
                format: request.config.format,
                report_type: request.config.reportType,
                processing_time: processingTime,
                file_size: fileSize,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Failed to log export metrics:", error);
            }
            return [2 /*return*/];
        }
      });
    });
  };
  return AnalyticsExportService;
})();
exports.AnalyticsExportService = AnalyticsExportService;
// Export singleton instance
var createanalyticsExportService = () => new AnalyticsExportService();
exports.createanalyticsExportService = createanalyticsExportService;
