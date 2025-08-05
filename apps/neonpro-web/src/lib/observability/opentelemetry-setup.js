"use strict";
/**
 * 🔭 OpenTelemetry Integration (Opcional)
 *
 * Setup minimalista de OpenTelemetry para observability avançada
 * Ativa apenas se ENABLE_OTEL=true no ambiente
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SimpleTelemetry = void 0;
var telemetryInitialized = false;
var SimpleTelemetry = /** @class */ (function () {
    function SimpleTelemetry() {
    }
    /**
     * 🚀 Initialize telemetry (only if enabled)
     */
    SimpleTelemetry.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var NodeSDK, getNodeAutoInstrumentations, OTLPTraceExporter, sdk, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.enabled || telemetryInitialized) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/sdk-node'); })];
                    case 2:
                        NodeSDK = (_a.sent()).NodeSDK;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/auto-instrumentations-node'); })];
                    case 3:
                        getNodeAutoInstrumentations = (_a.sent()).getNodeAutoInstrumentations;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-otlp-http'); })];
                    case 4:
                        OTLPTraceExporter = (_a.sent()).OTLPTraceExporter;
                        sdk = new NodeSDK({
                            serviceName: this.config.serviceName,
                            environment: this.config.environment,
                            traceExporter: this.config.exporterEndpoint
                                ? new OTLPTraceExporter({ url: this.config.exporterEndpoint })
                                : undefined,
                            instrumentations: [
                                getNodeAutoInstrumentations({
                                    // Disable noisy instrumentations
                                    '@opentelemetry/instrumentation-fs': { enabled: false },
                                    '@opentelemetry/instrumentation-dns': { enabled: false },
                                }),
                            ],
                        });
                        sdk.start();
                        telemetryInitialized = true;
                        console.log('📡 OpenTelemetry initialized successfully');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.warn('⚠️ OpenTelemetry initialization failed:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 📊 Simple trace creation (fallback to console if not enabled)
     */
    SimpleTelemetry.createTrace = function (name, fn) {
        if (!this.config.enabled) {
            // Fallback: just execute function
            return fn();
        }
        var startTime = Date.now();
        return fn()
            .then(function (result) {
            var duration = Date.now() - startTime;
            console.log("\uD83D\uDD0D Trace: ".concat(name, " completed in ").concat(duration, "ms"));
            return result;
        })
            .catch(function (error) {
            var duration = Date.now() - startTime;
            console.error("\uD83D\uDD0D Trace: ".concat(name, " failed in ").concat(duration, "ms:"), error);
            throw error;
        });
    };
    /**
     * 📈 Add custom attribute (no-op if disabled)
     */
    SimpleTelemetry.addAttribute = function (key, value) {
        if (!this.config.enabled)
            return;
        // Simple logging fallback
        console.log("\uD83D\uDCCB Attribute: ".concat(key, " = ").concat(value));
    };
    /**
     * ⚙️ Get current configuration
     */
    SimpleTelemetry.getConfig = function () {
        return __assign({}, this.config);
    };
    SimpleTelemetry.config = {
        enabled: process.env.ENABLE_OTEL === 'true',
        serviceName: 'neonpro-clinic',
        environment: process.env.NODE_ENV || 'development',
        exporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    };
    return SimpleTelemetry;
}());
exports.SimpleTelemetry = SimpleTelemetry;
