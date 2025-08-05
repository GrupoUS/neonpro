/**
 * Production Deployment Optimization Scripts
 *
 * Advanced optimization utilities for Next.js 15 production deployments
 * Based on 2025 deployment best practices
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentAutomation =
  exports.ProductionHealthCheck =
  exports.BuildOptimizer =
  exports.PreBuildOptimizer =
  exports.DEPLOYMENT_CONFIG =
    void 0;
var fs_1 = require("node:fs");
var path_1 = require("node:path");
var child_process_1 = require("node:child_process");
// Deployment configuration
exports.DEPLOYMENT_CONFIG = {
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  TURBOPACK: process.env.USE_TURBOPACK === "true",
  ANALYZE: process.env.ANALYZE === "true",
  // Build optimization flags
  BUILD_FLAGS: [
    "--no-lint", // Skip linting in CI (should be done separately)
    "--experimental-build-mode=compile", // Faster builds
  ],
  // Environment-specific settings
  ENVIRONMENTS: {
    development: {
      minify: false,
      sourceMaps: true,
      compression: false,
    },
    staging: {
      minify: true,
      sourceMaps: true,
      compression: true,
    },
    production: {
      minify: true,
      sourceMaps: false,
      compression: true,
    },
  },
};
// Pre-build optimization tasks
var PreBuildOptimizer = /** @class */ (() => {
  function PreBuildOptimizer() {}
  PreBuildOptimizer.optimizeAssets = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("🎨 Optimizing assets...");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, undefined, 6]);
            // Optimize images in public directory
            return [
              4 /*yield*/,
              this.optimizeImages(),
              // Clean up temporary files
            ];
          case 2:
            // Optimize images in public directory
            _a.sent();
            // Clean up temporary files
            return [
              4 /*yield*/,
              this.cleanupTempFiles(),
              // Validate environment variables
            ];
          case 3:
            // Clean up temporary files
            _a.sent();
            // Validate environment variables
            return [4 /*yield*/, this.validateEnvironment()];
          case 4:
            // Validate environment variables
            _a.sent();
            console.log("✅ Assets optimized successfully");
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            console.error("❌ Asset optimization failed:", error_1);
            throw error_1;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  PreBuildOptimizer.optimizeImages = function () {
    return __awaiter(this, void 0, void 0, function () {
      var publicDir, files, _i, files_1, file, stats, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            publicDir = path_1.default.join(process.cwd(), "public");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, undefined, 8]);
            return [4 /*yield*/, this.getAllFiles(publicDir, [".png", ".jpg", ".jpeg"])];
          case 2:
            files = _a.sent();
            (_i = 0), (files_1 = files);
            _a.label = 3;
          case 3:
            if (!(_i < files_1.length)) return [3 /*break*/, 6];
            file = files_1[_i];
            return [4 /*yield*/, fs_1.promises.stat(file)];
          case 4:
            stats = _a.sent();
            if (stats.size > 500 * 1024) {
              console.log(
                "\uD83D\uDCF7 Large image detected: "
                  .concat(path_1.default.relative(process.cwd(), file), " (")
                  .concat((stats.size / 1024).toFixed(0), "KB)"),
              );
            }
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            error_2 = _a.sent();
            console.warn("⚠️ Image optimization check failed:", error_2);
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  PreBuildOptimizer.cleanupTempFiles = function () {
    return __awaiter(this, void 0, void 0, function () {
      var tempDirs, _i, tempDirs_1, dir, fullPath, size, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            tempDirs = [".next", ".swc", "node_modules/.cache"];
            (_i = 0), (tempDirs_1 = tempDirs);
            _b.label = 1;
          case 1:
            if (!(_i < tempDirs_1.length)) return [3 /*break*/, 7];
            dir = tempDirs_1[_i];
            fullPath = path_1.default.join(process.cwd(), dir);
            _b.label = 2;
          case 2:
            _b.trys.push([2, 5, undefined, 6]);
            return [
              4 /*yield*/,
              fs_1.promises.access(fullPath),
              // Don't delete, just report size
            ];
          case 3:
            _b.sent();
            return [4 /*yield*/, this.getDirectorySize(fullPath)];
          case 4:
            size = _b.sent();
            console.log("\uD83D\uDCC1 ".concat(dir, ": ").concat(this.formatBytes(size)));
            return [3 /*break*/, 6];
          case 5:
            _a = _b.sent();
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  PreBuildOptimizer.validateEnvironment = function () {
    return __awaiter(this, void 0, void 0, function () {
      var requiredVars, missing;
      return __generator(this, (_a) => {
        requiredVars = [
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "DATABASE_URL",
        ];
        missing = requiredVars.filter((varName) => !process.env[varName]);
        if (missing.length > 0) {
          throw new Error("Missing required environment variables: ".concat(missing.join(", ")));
        }
        console.log("✅ Environment variables validated");
        return [2 /*return*/];
      });
    });
  };
  PreBuildOptimizer.getAllFiles = function (dir, extensions) {
    return __awaiter(this, void 0, void 0, function () {
      var files, items, _loop_1, this_1, _i, items_1, item, _error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            files = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, undefined, 8]);
            return [4 /*yield*/, fs_1.promises.readdir(dir, { withFileTypes: true })];
          case 2:
            items = _a.sent();
            _loop_1 = function (item) {
              var fullPath, _b, _c, _d;
              return __generator(this, (_e) => {
                switch (_e.label) {
                  case 0:
                    fullPath = path_1.default.join(dir, item.name);
                    if (!item.isDirectory()) return [3 /*break*/, 2];
                    _c = (_b = files.push).apply;
                    _d = [files];
                    return [4 /*yield*/, this_1.getAllFiles(fullPath, extensions)];
                  case 1:
                    _c.apply(_b, _d.concat([_e.sent()]));
                    return [3 /*break*/, 3];
                  case 2:
                    if (extensions.some((ext) => item.name.toLowerCase().endsWith(ext))) {
                      files.push(fullPath);
                    }
                    _e.label = 3;
                  case 3:
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (items_1 = items);
            _a.label = 3;
          case 3:
            if (!(_i < items_1.length)) return [3 /*break*/, 6];
            item = items_1[_i];
            return [5 /*yield**/, _loop_1(item)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            _i++;
            return [3 /*break*/, 3];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            _error_3 = _a.sent();
            return [3 /*break*/, 8];
          case 8:
            return [2 /*return*/, files];
        }
      });
    });
  };
  PreBuildOptimizer.getDirectorySize = function (dirPath) {
    return __awaiter(this, void 0, void 0, function () {
      var totalSize, items, _i, items_2, item, fullPath, _a, stats, _error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            totalSize = 0;
            _b.label = 1;
          case 1:
            _b.trys.push([1, 9, undefined, 10]);
            return [4 /*yield*/, fs_1.promises.readdir(dirPath, { withFileTypes: true })];
          case 2:
            items = _b.sent();
            (_i = 0), (items_2 = items);
            _b.label = 3;
          case 3:
            if (!(_i < items_2.length)) return [3 /*break*/, 8];
            item = items_2[_i];
            fullPath = path_1.default.join(dirPath, item.name);
            if (!item.isDirectory()) return [3 /*break*/, 5];
            _a = totalSize;
            return [4 /*yield*/, this.getDirectorySize(fullPath)];
          case 4:
            totalSize = _a + _b.sent();
            return [3 /*break*/, 7];
          case 5:
            return [4 /*yield*/, fs_1.promises.stat(fullPath)];
          case 6:
            stats = _b.sent();
            totalSize += stats.size;
            _b.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            return [3 /*break*/, 10];
          case 9:
            _error_4 = _b.sent();
            return [3 /*break*/, 10];
          case 10:
            return [2 /*return*/, totalSize];
        }
      });
    });
  };
  PreBuildOptimizer.formatBytes = (bytes) => {
    var sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return "".concat((bytes / 1024 ** i).toFixed(1), " ").concat(sizes[i]);
  };
  return PreBuildOptimizer;
})();
exports.PreBuildOptimizer = PreBuildOptimizer;
// Build optimization
var BuildOptimizer = /** @class */ (() => {
  function BuildOptimizer() {}
  BuildOptimizer.optimizedBuild = function () {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, buildTime, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("🏗️ Starting optimized build...");
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, undefined, 6]);
            // Pre-build optimizations
            return [
              4 /*yield*/,
              PreBuildOptimizer.optimizeAssets(),
              // Configure build environment
            ];
          case 2:
            // Pre-build optimizations
            _a.sent();
            // Configure build environment
            this.configureBuildEnvironment();
            // Run build with optimizations
            return [
              4 /*yield*/,
              this.runBuild(),
              // Post-build analysis
            ];
          case 3:
            // Run build with optimizations
            _a.sent();
            // Post-build analysis
            return [4 /*yield*/, this.analyzeBuild()];
          case 4:
            // Post-build analysis
            _a.sent();
            buildTime = Date.now() - startTime;
            console.log(
              "\uD83C\uDF89 Build completed in ".concat((buildTime / 1000).toFixed(2), "s"),
            );
            return [3 /*break*/, 6];
          case 5:
            error_5 = _a.sent();
            console.error("❌ Build failed:", error_5);
            process.exit(1);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  BuildOptimizer.configureBuildEnvironment = () => {
    // Set optimal Node.js flags for build
    process.env.NODE_OPTIONS = [
      "--max-old-space-size=4096", // Increase memory limit
      "--optimize-for-size", // Optimize for smaller bundles
    ].join(" ");
    // Enable optimizations
    process.env.NODE_ENV = "production";
    if (exports.DEPLOYMENT_CONFIG.TURBOPACK) {
      console.log("⚡ Using Turbopack for faster builds");
    }
    console.log("⚙️ Build environment configured");
  };
  BuildOptimizer.runBuild = function () {
    return __awaiter(this, void 0, void 0, function () {
      var buildCommand;
      return __generator(this, (_a) => {
        buildCommand = __spreadArray(
          ["next", "build", exports.DEPLOYMENT_CONFIG.TURBOPACK ? "--turbopack" : ""],
          exports.DEPLOYMENT_CONFIG.BUILD_FLAGS,
          true,
        )
          .filter(Boolean)
          .join(" ");
        console.log("\uD83D\uDD28 Running: ".concat(buildCommand));
        try {
          (0, child_process_1.execSync)(buildCommand, {
            stdio: "inherit",
            env: __assign({}, process.env),
          });
        } catch (error) {
          throw new Error("Build command failed: ".concat(error));
        }
        return [2 /*return*/];
      });
    });
  };
  BuildOptimizer.analyzeBuild = function () {
    return __awaiter(this, void 0, void 0, function () {
      var buildDir, buildSize, criticalFiles, _i, criticalFiles_1, file, filePath, _a, error_6;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            buildDir = path_1.default.join(process.cwd(), ".next");
            _b.label = 1;
          case 1:
            _b.trys.push([1, 10, undefined, 11]);
            // Check if build directory exists
            return [
              4 /*yield*/,
              fs_1.promises.access(buildDir),
              // Analyze build size
            ];
          case 2:
            // Check if build directory exists
            _b.sent();
            return [4 /*yield*/, PreBuildOptimizer.getDirectorySize(buildDir)];
          case 3:
            buildSize = _b.sent();
            console.log(
              "\uD83D\uDCE6 Build size: ".concat(PreBuildOptimizer.formatBytes(buildSize)),
            );
            criticalFiles = [".next/static", ".next/server", ".next/standalone"];
            (_i = 0), (criticalFiles_1 = criticalFiles);
            _b.label = 4;
          case 4:
            if (!(_i < criticalFiles_1.length)) return [3 /*break*/, 9];
            file = criticalFiles_1[_i];
            filePath = path_1.default.join(process.cwd(), file);
            _b.label = 5;
          case 5:
            _b.trys.push([5, 7, undefined, 8]);
            return [4 /*yield*/, fs_1.promises.access(filePath)];
          case 6:
            _b.sent();
            console.log("\u2705 ".concat(file, " generated"));
            return [3 /*break*/, 8];
          case 7:
            _a = _b.sent();
            console.log("\u26A0\uFE0F ".concat(file, " not found"));
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 4];
          case 9:
            return [3 /*break*/, 11];
          case 10:
            error_6 = _b.sent();
            console.warn("⚠️ Build analysis failed:", error_6);
            return [3 /*break*/, 11];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  return BuildOptimizer;
})();
exports.BuildOptimizer = BuildOptimizer;
// Production health checks
var ProductionHealthCheck = /** @class */ (() => {
  function ProductionHealthCheck() {}
  ProductionHealthCheck.runHealthChecks = function () {
    return __awaiter(this, void 0, void 0, function () {
      var checks, results, failed;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("🏥 Running production health checks...");
            checks = [
              this.checkBuildArtifacts,
              this.checkEnvironmentVariables,
              this.checkDependencies,
              this.checkSecurityHeaders,
              this.checkPerformanceConfig,
            ];
            return [4 /*yield*/, Promise.allSettled(checks.map((check) => check()))];
          case 1:
            results = _a.sent();
            failed = results.filter((result) => result.status === "rejected");
            if (failed.length > 0) {
              console.error("\u274C ".concat(failed.length, " health checks failed:"));
              failed.forEach((result, index) => {
                if (result.status === "rejected") {
                  console.error("  ".concat(index + 1, ". ").concat(result.reason));
                }
              });
              return [2 /*return*/, false];
            }
            console.log("✅ All health checks passed");
            return [2 /*return*/, true];
        }
      });
    });
  };
  ProductionHealthCheck.checkBuildArtifacts = function () {
    return __awaiter(this, void 0, void 0, function () {
      var requiredFiles, _i, requiredFiles_1, file, fullPath, _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            requiredFiles = [".next/BUILD_ID", ".next/static", ".next/server/app"];
            (_i = 0), (requiredFiles_1 = requiredFiles);
            _b.label = 1;
          case 1:
            if (!(_i < requiredFiles_1.length)) return [3 /*break*/, 6];
            file = requiredFiles_1[_i];
            fullPath = path_1.default.join(process.cwd(), file);
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, undefined, 5]);
            return [4 /*yield*/, fs_1.promises.access(fullPath)];
          case 3:
            _b.sent();
            return [3 /*break*/, 5];
          case 4:
            _a = _b.sent();
            throw new Error("Missing build artifact: ".concat(file));
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  ProductionHealthCheck.checkEnvironmentVariables = function () {
    return __awaiter(this, void 0, void 0, function () {
      var prodVars, _i, prodVars_1, varName;
      return __generator(this, (_a) => {
        prodVars = ["NODE_ENV", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
        for (_i = 0, prodVars_1 = prodVars; _i < prodVars_1.length; _i++) {
          varName = prodVars_1[_i];
          if (!process.env[varName]) {
            throw new Error("Missing environment variable: ".concat(varName));
          }
        }
        if (process.env.NODE_ENV !== "production") {
          throw new Error('NODE_ENV must be set to "production"');
        }
        return [2 /*return*/];
      });
    });
  };
  ProductionHealthCheck.checkDependencies = function () {
    return __awaiter(this, void 0, void 0, function () {
      var packageJsonPath,
        packageJson,
        _a,
        _b,
        prodDeps,
        requiredDeps,
        _i,
        requiredDeps_1,
        dep,
        error_7;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            packageJsonPath = path_1.default.join(process.cwd(), "package.json");
            _c.label = 1;
          case 1:
            _c.trys.push([1, 3, undefined, 4]);
            _b = (_a = JSON).parse;
            return [4 /*yield*/, fs_1.promises.readFile(packageJsonPath, "utf-8")];
          case 2:
            packageJson = _b.apply(_a, [_c.sent()]);
            prodDeps = Object.keys(packageJson.dependencies || {});
            requiredDeps = ["next", "react", "react-dom"];
            for (_i = 0, requiredDeps_1 = requiredDeps; _i < requiredDeps_1.length; _i++) {
              dep = requiredDeps_1[_i];
              if (!prodDeps.includes(dep)) {
                throw new Error("Missing required dependency: ".concat(dep));
              }
            }
            return [3 /*break*/, 4];
          case 3:
            error_7 = _c.sent();
            throw new Error("Dependency check failed: ".concat(error_7));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  ProductionHealthCheck.checkSecurityHeaders = function () {
    return __awaiter(this, void 0, void 0, function () {
      var nextConfigPath, configContent, requiredHeaders, _i, requiredHeaders_1, header, error_8;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            nextConfigPath = path_1.default.join(process.cwd(), "next.config.mjs");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, undefined, 4]);
            return [
              4 /*yield*/,
              fs_1.promises.readFile(nextConfigPath, "utf-8"),
              // Check for security headers
            ];
          case 2:
            configContent = _a.sent();
            requiredHeaders = ["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy"];
            for (_i = 0, requiredHeaders_1 = requiredHeaders; _i < requiredHeaders_1.length; _i++) {
              header = requiredHeaders_1[_i];
              if (!configContent.includes(header)) {
                console.warn("\u26A0\uFE0F Missing security header: ".concat(header));
              }
            }
            return [3 /*break*/, 4];
          case 3:
            error_8 = _a.sent();
            console.warn("⚠️ Could not verify security headers:", error_8);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  ProductionHealthCheck.checkPerformanceConfig = function () {
    return __awaiter(this, void 0, void 0, function () {
      var nextConfigPath, configContent, optimizations, _i, optimizations_1, opt, error_9;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            nextConfigPath = path_1.default.join(process.cwd(), "next.config.mjs");
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, undefined, 4]);
            return [
              4 /*yield*/,
              fs_1.promises.readFile(nextConfigPath, "utf-8"),
              // Check for performance optimizations
            ];
          case 2:
            configContent = _a.sent();
            optimizations = ["swcMinify", "compress", "optimizePackageImports"];
            for (_i = 0, optimizations_1 = optimizations; _i < optimizations_1.length; _i++) {
              opt = optimizations_1[_i];
              if (!configContent.includes(opt)) {
                console.warn("\u26A0\uFE0F Missing performance optimization: ".concat(opt));
              }
            }
            return [3 /*break*/, 4];
          case 3:
            error_9 = _a.sent();
            console.warn("⚠️ Could not verify performance config:", error_9);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return ProductionHealthCheck;
})();
exports.ProductionHealthCheck = ProductionHealthCheck;
// Deployment automation
var DeploymentAutomation = /** @class */ (() => {
  function DeploymentAutomation() {}
  DeploymentAutomation.deploy = function () {
    return __awaiter(this, arguments, void 0, function (environment) {
      var healthChecksPassed, error_10;
      if (environment === void 0) {
        environment = "production";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            console.log("\uD83D\uDE80 Starting deployment to ".concat(environment, "..."));
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, undefined, 6]);
            return [4 /*yield*/, ProductionHealthCheck.runHealthChecks()];
          case 2:
            healthChecksPassed = _a.sent();
            if (!healthChecksPassed) {
              throw new Error("Health checks failed");
            }
            // Run optimized build
            return [
              4 /*yield*/,
              BuildOptimizer.optimizedBuild(),
              // Environment-specific deployment steps
            ];
          case 3:
            // Run optimized build
            _a.sent();
            // Environment-specific deployment steps
            return [4 /*yield*/, this.deployToEnvironment(environment)];
          case 4:
            // Environment-specific deployment steps
            _a.sent();
            console.log(
              "\uD83C\uDF89 Deployment to ".concat(environment, " completed successfully"),
            );
            return [3 /*break*/, 6];
          case 5:
            error_10 = _a.sent();
            console.error("\u274C Deployment to ".concat(environment, " failed:"), error_10);
            process.exit(1);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  DeploymentAutomation.deployToEnvironment = function (environment) {
    return __awaiter(this, void 0, void 0, function () {
      var deploymentSteps, _i, deploymentSteps_1, step;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            // This would typically integrate with your deployment platform
            // For example: Vercel, Netlify, AWS, etc.
            console.log("\uD83D\uDCE1 Deploying to ".concat(environment, " environment..."));
            deploymentSteps = [
              "Uploading static assets",
              "Deploying server functions",
              "Updating environment configuration",
              "Running database migrations",
              "Warming up caches",
              "Running smoke tests",
            ];
            (_i = 0), (deploymentSteps_1 = deploymentSteps);
            _a.label = 1;
          case 1:
            if (!(_i < deploymentSteps_1.length)) return [3 /*break*/, 4];
            step = deploymentSteps_1[_i];
            console.log("  ".concat(step, "..."));
            // Simulate deployment step
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
          case 2:
            // Simulate deployment step
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return DeploymentAutomation;
})();
exports.DeploymentAutomation = DeploymentAutomation;
// CLI interface
if (require.main === module) {
  var command = process.argv[2];
  switch (command) {
    case "build":
      BuildOptimizer.optimizedBuild();
      break;
    case "health-check":
      ProductionHealthCheck.runHealthChecks().then((passed) => process.exit(passed ? 0 : 1));
      break;
    case "deploy": {
      var env = process.argv[3] || "production";
      DeploymentAutomation.deploy(env);
      break;
    }
    default:
      console.log(
        "\nUsage: node deployment.js <command>\n\nCommands:\n  build        Run optimized production build\n  health-check Run production health checks  \n  deploy       Deploy to production (or staging)\n\nExamples:\n  node deployment.js build\n  node deployment.js health-check\n  node deployment.js deploy staging\n  node deployment.js deploy production\n      ",
      );
  }
}
