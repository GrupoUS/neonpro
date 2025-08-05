'use client';
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalOptimizationConfig = exports.TESTING_CONFIG = exports.DEVELOPMENT_CONFIG = exports.PRODUCTION_CONFIG = exports.DEFAULT_OPTIMIZATION_CONFIG = void 0;
exports.useOptimizationConfig = useOptimizationConfig;
exports.useFeatureFlag = useFeatureFlag;
exports.createOptimizedConfig = createOptimizedConfig;
exports.validateConfig = validateConfig;
exports.getOptimalConfigForDevice = getOptimalConfigForDevice;
// =====================================================================================
// DEFAULT CONFIGURATION
// =====================================================================================
exports.DEFAULT_OPTIMIZATION_CONFIG = {
    performance: {
        enabled: true,
        samplingInterval: 1000, // 1 second
        alertThresholds: {
            fps: 30,
            memory: 100 * 1024 * 1024, // 100MB
            domNodes: 5000,
            eventListeners: 1000
        },
        autoOptimize: true
    },
    memory: {
        enabled: true,
        samplingInterval: 5000, // 5 seconds
        alertThreshold: 80, // 80% memory usage
        leakDetectionWindow: 60000, // 1 minute
        maxSnapshots: 100,
        enableAutoCleanup: true,
        enableDetailedTracking: true
    },
    bundle: {
        enabled: true,
        enableCodeSplitting: true,
        enableTreeShaking: true,
        enableCompression: true,
        enablePreloading: true,
        chunkSizeLimit: 250000, // 250KB
        preloadThreshold: 0.8,
        cacheStrategy: 'aggressive'
    },
    lazyLoading: {
        enabled: true,
        minLoadingTime: 200,
        retryable: true,
        preloadOnHover: true,
        intersectionThreshold: 0.1,
        rootMargin: '50px'
    },
    cache: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes
        maxSize: 100,
        enablePersistence: true,
        strategies: {
            api: { ttl: 300000, maxSize: 50 }, // 5 minutes, 50 items
            user: { ttl: 3600000, maxSize: 20 }, // 1 hour, 20 items
            static: { ttl: 86400000, maxSize: 100 } // 24 hours, 100 items
        }
    },
    errorHandling: {
        enabled: true,
        enableBoundaries: true,
        enableRetry: true,
        maxRetries: 3,
        enableLogging: true,
        enableReporting: true
    },
    notifications: {
        enabled: true,
        maxVisible: 5,
        defaultDuration: 5000,
        enablePersistence: true,
        enableSound: false,
        position: 'top-right'
    },
    development: {
        enableDebugMode: process.env.NODE_ENV === 'development',
        enablePerformanceLogs: process.env.NODE_ENV === 'development',
        enableMemoryLogs: process.env.NODE_ENV === 'development',
        enableBundleLogs: process.env.NODE_ENV === 'development',
        showOptimizationHints: process.env.NODE_ENV === 'development'
    }
};
// =====================================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// =====================================================================================
exports.PRODUCTION_CONFIG = {
    performance: {
        enabled: true,
        samplingInterval: 5000, // Less frequent in production
        alertThresholds: {
            fps: 30,
            memory: 150 * 1024 * 1024, // 150MB
            domNodes: 8000,
            eventListeners: 1500
        },
        autoOptimize: true
    },
    memory: {
        enabled: true,
        samplingInterval: 10000, // 10 seconds
        alertThreshold: 85,
        enableDetailedTracking: false // Reduce overhead
    },
    development: {
        enableDebugMode: false,
        enablePerformanceLogs: false,
        enableMemoryLogs: false,
        enableBundleLogs: false,
        showOptimizationHints: false
    }
};
exports.DEVELOPMENT_CONFIG = {
    performance: {
        enabled: true,
        samplingInterval: 1000,
        autoOptimize: false // Manual control in development
    },
    memory: {
        enabled: true,
        samplingInterval: 2000, // More frequent monitoring
        alertThreshold: 70, // Lower threshold for early detection
        enableDetailedTracking: true
    },
    development: {
        enableDebugMode: true,
        enablePerformanceLogs: true,
        enableMemoryLogs: true,
        enableBundleLogs: true,
        showOptimizationHints: true
    }
};
exports.TESTING_CONFIG = {
    performance: {
        enabled: false // Disable during tests
    },
    memory: {
        enabled: false
    },
    bundle: {
        enabled: false
    },
    lazyLoading: {
        enabled: false,
        minLoadingTime: 0 // No delays in tests
    },
    cache: {
        enabled: false // Fresh state for each test
    },
    notifications: {
        enabled: false
    }
};
// =====================================================================================
// CONFIGURATION MANAGER
// =====================================================================================
var OptimizationConfigManager = /** @class */ (function () {
    function OptimizationConfigManager(initialConfig) {
        this.observers = new Set();
        this.config = this.mergeConfigs(exports.DEFAULT_OPTIMIZATION_CONFIG, initialConfig);
        this.loadEnvironmentConfig();
    }
    OptimizationConfigManager.prototype.mergeConfigs = function (base, override) {
        if (!override)
            return __assign({}, base);
        var merged = __assign({}, base);
        Object.keys(override).forEach(function (key) {
            var typedKey = key;
            if (typeof override[typedKey] === 'object' && !Array.isArray(override[typedKey])) {
                merged[typedKey] = __assign(__assign({}, merged[typedKey]), override[typedKey]);
            }
            else {
                merged[typedKey] = override[typedKey];
            }
        });
        return merged;
    };
    OptimizationConfigManager.prototype.loadEnvironmentConfig = function () {
        var env = process.env.NODE_ENV;
        switch (env) {
            case 'production':
                this.config = this.mergeConfigs(this.config, exports.PRODUCTION_CONFIG);
                break;
            case 'development':
                this.config = this.mergeConfigs(this.config, exports.DEVELOPMENT_CONFIG);
                break;
            case 'test':
                this.config = this.mergeConfigs(this.config, exports.TESTING_CONFIG);
                break;
        }
        // Load from localStorage if available
        if (typeof window !== 'undefined') {
            var savedConfig = localStorage.getItem('neonpro-optimization-config');
            if (savedConfig) {
                try {
                    var parsed = JSON.parse(savedConfig);
                    this.config = this.mergeConfigs(this.config, parsed);
                }
                catch (error) {
                    console.warn('Failed to load saved optimization config:', error);
                }
            }
        }
    };
    OptimizationConfigManager.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    OptimizationConfigManager.prototype.updateConfig = function (updates) {
        this.config = this.mergeConfigs(this.config, updates);
        this.saveConfig();
        this.notifyObservers();
    };
    OptimizationConfigManager.prototype.resetConfig = function () {
        this.config = __assign({}, exports.DEFAULT_OPTIMIZATION_CONFIG);
        this.loadEnvironmentConfig();
        this.saveConfig();
        this.notifyObservers();
    };
    OptimizationConfigManager.prototype.subscribe = function (observer) {
        var _this = this;
        this.observers.add(observer);
        return function () { return _this.observers.delete(observer); };
    };
    OptimizationConfigManager.prototype.saveConfig = function () {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('neonpro-optimization-config', JSON.stringify(this.config));
            }
            catch (error) {
                console.warn('Failed to save optimization config:', error);
            }
        }
    };
    OptimizationConfigManager.prototype.notifyObservers = function () {
        var _this = this;
        this.observers.forEach(function (observer) { return observer(_this.config); });
    };
    // Specific getters for different modules
    OptimizationConfigManager.prototype.getPerformanceConfig = function () {
        return this.config.performance;
    };
    OptimizationConfigManager.prototype.getMemoryConfig = function () {
        return this.config.memory;
    };
    OptimizationConfigManager.prototype.getBundleConfig = function () {
        return this.config.bundle;
    };
    OptimizationConfigManager.prototype.getLazyLoadingConfig = function () {
        return this.config.lazyLoading;
    };
    OptimizationConfigManager.prototype.getCacheConfig = function () {
        return this.config.cache;
    };
    OptimizationConfigManager.prototype.getErrorHandlingConfig = function () {
        return this.config.errorHandling;
    };
    OptimizationConfigManager.prototype.getNotificationsConfig = function () {
        return this.config.notifications;
    };
    OptimizationConfigManager.prototype.getDevelopmentConfig = function () {
        return this.config.development;
    };
    // Feature flags
    OptimizationConfigManager.prototype.isFeatureEnabled = function (feature) {
        var _a, _b;
        return (_b = (_a = this.config[feature]) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
    };
    OptimizationConfigManager.prototype.enableFeature = function (feature) {
        if (this.config[feature] && typeof this.config[feature] === 'object') {
            this.config[feature].enabled = true;
            this.saveConfig();
            this.notifyObservers();
        }
    };
    OptimizationConfigManager.prototype.disableFeature = function (feature) {
        if (this.config[feature] && typeof this.config[feature] === 'object') {
            this.config[feature].enabled = false;
            this.saveConfig();
            this.notifyObservers();
        }
    };
    return OptimizationConfigManager;
}());
// =====================================================================================
// REACT HOOKS
// =====================================================================================
var react_1 = require("react");
function useOptimizationConfig(initialConfig) {
    var manager = (0, react_1.useState)(function () { return new OptimizationConfigManager(initialConfig); })[0];
    var _a = (0, react_1.useState)(manager.getConfig()), config = _a[0], setConfig = _a[1];
    (0, react_1.useEffect)(function () {
        var unsubscribe = manager.subscribe(setConfig);
        return unsubscribe;
    }, [manager]);
    var updateConfig = (0, react_1.useCallback)(function (updates) {
        manager.updateConfig(updates);
    }, [manager]);
    var resetConfig = (0, react_1.useCallback)(function () {
        manager.resetConfig();
    }, [manager]);
    var isFeatureEnabled = (0, react_1.useCallback)(function (feature) {
        return manager.isFeatureEnabled(feature);
    }, [manager]);
    var enableFeature = (0, react_1.useCallback)(function (feature) {
        manager.enableFeature(feature);
    }, [manager]);
    var disableFeature = (0, react_1.useCallback)(function (feature) {
        manager.disableFeature(feature);
    }, [manager]);
    return {
        config: config,
        updateConfig: updateConfig,
        resetConfig: resetConfig,
        isFeatureEnabled: isFeatureEnabled,
        enableFeature: enableFeature,
        disableFeature: disableFeature,
        // Specific config getters
        performance: config.performance,
        memory: config.memory,
        bundle: config.bundle,
        lazyLoading: config.lazyLoading,
        cache: config.cache,
        errorHandling: config.errorHandling,
        notifications: config.notifications,
        development: config.development
    };
}
function useFeatureFlag(feature) {
    var _a = useOptimizationConfig(), isFeatureEnabled = _a.isFeatureEnabled, enableFeature = _a.enableFeature, disableFeature = _a.disableFeature;
    return {
        enabled: isFeatureEnabled(feature),
        enable: function () { return enableFeature(feature); },
        disable: function () { return disableFeature(feature); },
        toggle: function () {
            if (isFeatureEnabled(feature)) {
                disableFeature(feature);
            }
            else {
                enableFeature(feature);
            }
        }
    };
}
// =====================================================================================
// GLOBAL INSTANCE
// =====================================================================================
exports.globalOptimizationConfig = new OptimizationConfigManager();
// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
function createOptimizedConfig(overrides) {
    var manager = new OptimizationConfigManager(overrides);
    return manager.getConfig();
}
function validateConfig(config) {
    var _a, _b, _c;
    try {
        // Basic validation
        if (((_a = config.performance) === null || _a === void 0 ? void 0 : _a.samplingInterval) && config.performance.samplingInterval < 100) {
            console.warn('Performance sampling interval too low, minimum is 100ms');
            return false;
        }
        if (((_b = config.memory) === null || _b === void 0 ? void 0 : _b.alertThreshold) && (config.memory.alertThreshold < 0 || config.memory.alertThreshold > 100)) {
            console.warn('Memory alert threshold must be between 0 and 100');
            return false;
        }
        if (((_c = config.bundle) === null || _c === void 0 ? void 0 : _c.chunkSizeLimit) && config.bundle.chunkSizeLimit < 10000) {
            console.warn('Bundle chunk size limit too low, minimum is 10KB');
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Config validation error:', error);
        return false;
    }
}
function getOptimalConfigForDevice() {
    if (typeof window === 'undefined')
        return {};
    var memory = navigator.deviceMemory || 4; // Default to 4GB
    var cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
    var connection = navigator.connection;
    var config = {};
    // Adjust based on device memory
    if (memory <= 2) {
        // Low memory device
        config.memory = {
            enabled: true,
            alertThreshold: 70,
            enableDetailedTracking: false,
            maxSnapshots: 50
        };
        config.performance = {
            enabled: true,
            samplingInterval: 2000,
            autoOptimize: true
        };
    }
    else if (memory >= 8) {
        // High memory device
        config.memory = {
            enabled: true,
            alertThreshold: 90,
            enableDetailedTracking: true,
            maxSnapshots: 200
        };
        config.performance = {
            enabled: true,
            samplingInterval: 500,
            autoOptimize: false
        };
    }
    // Adjust based on connection
    if (connection) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            config.bundle = {
                enabled: true,
                enablePreloading: false,
                chunkSizeLimit: 100000 // 100KB
            };
            config.lazyLoading = {
                enabled: true,
                preloadOnHover: false
            };
        }
        else if (connection.effectiveType === '4g') {
            config.bundle = {
                enabled: true,
                enablePreloading: true,
                chunkSizeLimit: 500000 // 500KB
            };
            config.lazyLoading = {
                enabled: true,
                preloadOnHover: true
            };
        }
    }
    return config;
}
exports.default = OptimizationConfigManager;
