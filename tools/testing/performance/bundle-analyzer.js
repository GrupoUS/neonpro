"use strict";
/**
 * Bundle Analysis Utilities
 *
 * Advanced bundle optimization and analysis tools for Next.js 15
 * Based on 2025 performance best practices
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUNDLE_THRESHOLDS = void 0;
exports.analyzeBundleStats = analyzeBundleStats;
exports.formatBytes = formatBytes;
exports.generateBundleReport = generateBundleReport;
exports.runBundleAnalysis = runBundleAnalysis;
var fs_1 = require("fs");
var path_1 = require("path");
// Bundle size thresholds (in bytes)
exports.BUNDLE_THRESHOLDS = {
    CRITICAL: 50 * 1024, // 50KB - critical resources
    WARNING: 100 * 1024, // 100KB - warning threshold
    ERROR: 250 * 1024, // 250KB - error threshold
    TOTAL_WARNING: 1024 * 1024, // 1MB - total bundle warning
    TOTAL_ERROR: 2 * 1024 * 1024, // 2MB - total bundle error
};
// Analyze webpack bundle stats
function analyzeBundleStats(statsPath) {
    return __awaiter(this, void 0, void 0, function () {
        var statsContent, stats, analysis, _i, _a, chunk, chunkSize, chunkStatus, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_1.promises.readFile(statsPath, 'utf-8')];
                case 1:
                    statsContent = _d.sent();
                    stats = JSON.parse(statsContent);
                    analysis = {
                        totalSize: 0,
                        gzippedSize: 0,
                        chunks: [],
                        duplicates: [],
                        largeModules: [],
                        recommendations: []
                    };
                    // Analyze chunks
                    if (stats.chunks) {
                        for (_i = 0, _a = stats.chunks; _i < _a.length; _i++) {
                            chunk = _a[_i];
                            chunkSize = chunk.size || 0;
                            chunkStatus = getChunkStatus(chunkSize);
                            analysis.chunks.push({
                                name: ((_b = chunk.names) === null || _b === void 0 ? void 0 : _b[0]) || chunk.id,
                                size: chunkSize,
                                gzippedSize: Math.round(chunkSize * 0.3), // Estimated gzip ratio
                                modules: ((_c = chunk.modules) === null || _c === void 0 ? void 0 : _c.map(function (m) { return m.name; })) || [],
                                status: chunkStatus
                            });
                            analysis.totalSize += chunkSize;
                        }
                    }
                    // Analyze modules for duplicates and large modules
                    if (stats.modules) {
                        analyzeModules(stats.modules, analysis);
                    }
                    // Generate recommendations
                    analysis.recommendations = generateRecommendations(analysis);
                    return [2 /*return*/, analysis];
                case 2:
                    error_1 = _d.sent();
                    console.error('Bundle analysis failed:', error_1);
                    throw new Error('Failed to analyze bundle stats');
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Determine chunk status based on size
function getChunkStatus(size) {
    if (size > exports.BUNDLE_THRESHOLDS.ERROR)
        return 'error';
    if (size > exports.BUNDLE_THRESHOLDS.WARNING)
        return 'warning';
    return 'good';
}
// Analyze modules for optimization opportunities  
function analyzeModules(modules, analysis) {
    var _a, _b;
    var moduleMap = new Map();
    for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
        var module_1 = modules_1[_i];
        var moduleName = cleanModuleName(module_1.name);
        var moduleSize = module_1.size || 0;
        // Track module usage across chunks
        if (!moduleMap.has(moduleName)) {
            moduleMap.set(moduleName, []);
        }
        moduleMap.get(moduleName).push({
            chunk: ((_a = module_1.chunks) === null || _a === void 0 ? void 0 : _a[0]) || 'unknown',
            size: moduleSize
        });
        // Identify large modules
        if (moduleSize > exports.BUNDLE_THRESHOLDS.WARNING) {
            analysis.largeModules.push({
                name: moduleName,
                size: moduleSize,
                chunk: ((_b = module_1.chunks) === null || _b === void 0 ? void 0 : _b[0]) || 'unknown'
            });
        }
    }
    // Find duplicate modules
    for (var _c = 0, moduleMap_1 = moduleMap; _c < moduleMap_1.length; _c++) {
        var _d = moduleMap_1[_c], moduleName = _d[0], occurrences = _d[1];
        if (occurrences.length > 1) {
            var totalWasted = occurrences.reduce(function (sum, occ) { return sum + occ.size; }, 0) - Math.max.apply(Math, occurrences.map(function (occ) { return occ.size; }));
            if (totalWasted > 1024) { // Only report if > 1KB wasted
                analysis.duplicates.push({
                    module: moduleName,
                    chunks: occurrences.map(function (occ) { return occ.chunk; }),
                    wastedBytes: totalWasted
                });
            }
        }
    }
    // Sort by impact
    analysis.largeModules.sort(function (a, b) { return b.size - a.size; });
    analysis.duplicates.sort(function (a, b) { return b.wastedBytes - a.wastedBytes; });
}
// Clean module names for better readability
function cleanModuleName(name) {
    if (!name)
        return 'unknown';
    // Remove webpack loader syntax
    name = name.replace(/^.*!/, '');
    // Simplify node_modules paths
    name = name.replace(/.*node_modules\//, '');
    // Remove query parameters
    name = name.replace(/\?.*$/, '');
    return name;
}
// Generate optimization recommendations
function generateRecommendations(analysis) {
    var recommendations = [];
    // Bundle size recommendations
    if (analysis.totalSize > exports.BUNDLE_THRESHOLDS.TOTAL_ERROR) {
        recommendations.push('🚨 Total bundle size exceeds 2MB - implement aggressive code splitting');
    }
    else if (analysis.totalSize > exports.BUNDLE_THRESHOLDS.TOTAL_WARNING) {
        recommendations.push('⚠️ Total bundle size exceeds 1MB - consider code splitting');
    }
    // Large chunk recommendations
    var largeChunks = analysis.chunks.filter(function (chunk) { return chunk.status === 'error'; });
    if (largeChunks.length > 0) {
        recommendations.push("\uD83D\uDD04 ".concat(largeChunks.length, " chunks exceed 250KB - split into smaller chunks"));
    }
    // Duplicate module recommendations
    if (analysis.duplicates.length > 0) {
        var totalWasted = analysis.duplicates.reduce(function (sum, dup) { return sum + dup.wastedBytes; }, 0);
        recommendations.push("\uD83D\uDCE6 ".concat(analysis.duplicates.length, " duplicate modules waste ").concat(formatBytes(totalWasted), " - optimize imports"));
    }
    // Large module recommendations
    if (analysis.largeModules.length > 0) {
        recommendations.push("\uD83C\uDFAF ".concat(analysis.largeModules.length, " large modules found - consider lazy loading"));
    }
    // Specific library recommendations
    var recharts = analysis.largeModules.find(function (m) { return m.name.includes('recharts'); });
    if (recharts) {
        recommendations.push('📊 Recharts detected - use selective imports: import { LineChart } from "recharts"');
    }
    var lodash = analysis.largeModules.find(function (m) { return m.name.includes('lodash'); });
    if (lodash) {
        recommendations.push('🛠️ Lodash detected - use individual imports: import debounce from "lodash/debounce"');
    }
    return recommendations;
}
// Format bytes for human readability
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
// Generate bundle report
function generateBundleReport(analysis) {
    var report = '# Bundle Analysis Report\n\n';
    // Summary
    report += "## Summary\n";
    report += "- **Total Size**: ".concat(formatBytes(analysis.totalSize), "\n");
    report += "- **Estimated Gzipped**: ".concat(formatBytes(analysis.gzippedSize), "\n");
    report += "- **Chunks**: ".concat(analysis.chunks.length, "\n");
    report += "- **Large Modules**: ".concat(analysis.largeModules.length, "\n");
    report += "- **Duplicates**: ".concat(analysis.duplicates.length, "\n\n");
    // Recommendations
    if (analysis.recommendations.length > 0) {
        report += "## Recommendations\n";
        analysis.recommendations.forEach(function (rec) {
            report += "- ".concat(rec, "\n");
        });
        report += '\n';
    }
    // Chunk details
    report += "## Chunks\n";
    analysis.chunks.forEach(function (chunk) {
        var status = chunk.status === 'error' ? '🚨' :
            chunk.status === 'warning' ? '⚠️' : '✅';
        report += "- ".concat(status, " **").concat(chunk.name, "**: ").concat(formatBytes(chunk.size), "\n");
    });
    report += '\n';
    // Large modules
    if (analysis.largeModules.length > 0) {
        report += "## Large Modules (>".concat(formatBytes(exports.BUNDLE_THRESHOLDS.WARNING), ")\n");
        analysis.largeModules.slice(0, 10).forEach(function (module) {
            report += "- **".concat(module.name, "**: ").concat(formatBytes(module.size), " (").concat(module.chunk, ")\n");
        });
        report += '\n';
    }
    // Duplicates
    if (analysis.duplicates.length > 0) {
        report += "## Duplicate Modules\n";
        analysis.duplicates.slice(0, 10).forEach(function (dup) {
            report += "- **".concat(dup.module, "**: ").concat(formatBytes(dup.wastedBytes), " wasted across ").concat(dup.chunks.length, " chunks\n");
        });
    }
    return report;
}
// CLI utility for bundle analysis
function runBundleAnalysis(statsPath) {
    return __awaiter(this, void 0, void 0, function () {
        var defaultStatsPath, finalStatsPath, analysis, reportPath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultStatsPath = path_1.default.join(process.cwd(), '.next', 'analyze', 'stats.json');
                    finalStatsPath = statsPath || defaultStatsPath;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log('🔍 Analyzing bundle...');
                    return [4 /*yield*/, analyzeBundleStats(finalStatsPath)];
                case 2:
                    analysis = _a.sent();
                    console.log('\n' + generateBundleReport(analysis));
                    reportPath = path_1.default.join(process.cwd(), 'bundle-analysis-report.md');
                    return [4 /*yield*/, fs_1.promises.writeFile(reportPath, generateBundleReport(analysis))];
                case 3:
                    _a.sent();
                    console.log("\uD83D\uDCC4 Report saved to: ".concat(reportPath));
                    return [2 /*return*/, analysis];
                case 4:
                    error_2 = _a.sent();
                    console.error('❌ Bundle analysis failed:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
