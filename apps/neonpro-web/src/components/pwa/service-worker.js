// NeonPro - PWA Service Worker Registration
// VIBECODE V1.0 - Healthcare PWA Excellence Standards
// Purpose: Register and manage Service Worker with healthcare-specific configurations
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PWAServiceWorker = PWAServiceWorker;
exports.PWAInstallPrompt = PWAInstallPrompt;
var react_1 = require("react");
var sonner_1 = require("sonner");
function PWAServiceWorker() {
  var _this = this;
  var _a = (0, react_1.useState)({
      isSupported: false,
      isRegistered: false,
      isInstalling: false,
      isWaitingUpdate: false,
      registration: null,
    }),
    state = _a[0],
    setState = _a[1];
  (0, react_1.useEffect)(function () {
    // Check if Service Worker is supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return;
    }
    setState(function (prev) {
      return __assign(__assign({}, prev), { isSupported: true });
    });
    // Register Service Worker
    var registerServiceWorker = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var registration_1, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              setState(function (prev) {
                return __assign(__assign({}, prev), { isInstalling: true });
              });
              return [
                4 /*yield*/,
                navigator.serviceWorker.register("/sw.js", {
                  scope: "/",
                  updateViaCache: "none", // Always check for updates
                }),
              ];
            case 1:
              registration_1 = _a.sent();
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  isRegistered: true,
                  isInstalling: false,
                  registration: registration_1,
                });
              });
              console.log("✅ NeonPro Service Worker registered:", registration_1.scope);
              // Check for updates
              registration_1.addEventListener("updatefound", function () {
                var newWorker = registration_1.installing;
                if (newWorker) {
                  newWorker.addEventListener("statechange", function () {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                      // New version available
                      setState(function (prev) {
                        return __assign(__assign({}, prev), { isWaitingUpdate: true });
                      });
                      sonner_1.toast.info("Nova versão disponível", {
                        description: "Clique para atualizar o aplicativo",
                        action: {
                          label: "Atualizar",
                          onClick: function () {
                            newWorker.postMessage({ action: "SKIP_WAITING" });
                            window.location.reload();
                          },
                        },
                        duration: 10000,
                      });
                    }
                  });
                }
              });
              // Listen for controlling Service Worker change
              navigator.serviceWorker.addEventListener("controllerchange", function () {
                console.log("🔄 Service Worker controller changed - reloading page");
                window.location.reload();
              });
              // Background sync event listeners
              navigator.serviceWorker.addEventListener("message", function (event) {
                if (event.data && event.data.type === "BACKGROUND_SYNC") {
                  var _a = event.data,
                    success = _a.success,
                    failed = _a.failed,
                    total = _a.total;
                  if (success > 0) {
                    sonner_1.toast.success(
                      "".concat(success, " a\u00E7\u00F5es sincronizadas com sucesso"),
                    );
                  }
                  if (failed > 0) {
                    sonner_1.toast.error(
                      "".concat(failed, " a\u00E7\u00F5es falharam na sincroniza\u00E7\u00E3o"),
                    );
                  }
                  console.log(
                    "\uD83D\uDCE1 Background sync completed: "
                      .concat(success, "/")
                      .concat(total, " successful"),
                  );
                }
              });
              // Manual update check on page load
              if (registration_1.waiting) {
                setState(function (prev) {
                  return __assign(__assign({}, prev), { isWaitingUpdate: true });
                });
              }
              // Check for updates every 5 minutes
              setInterval(
                function () {
                  registration_1.update().catch(console.warn);
                },
                5 * 60 * 1000,
              );
              return [3 /*break*/, 3];
            case 2:
              error_1 = _a.sent();
              console.error("❌ Service Worker registration failed:", error_1);
              setState(function (prev) {
                return __assign(__assign({}, prev), { isInstalling: false });
              });
              sonner_1.toast.error("Erro ao carregar funcionalidades offline", {
                description: "Algumas funcionalidades podem não estar disponíveis",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    };
    // Register when page loads
    registerServiceWorker();
    // Register on page visibility change (for mobile app switching)
    var handleVisibilityChange = function () {
      if (!document.hidden && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then(function (registration) {
          if (registration) {
            registration.update().catch(console.warn);
          }
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return function () {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  // This component only handles registration, no UI
  return null;
}
// Install prompt component
function PWAInstallPrompt() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    installPrompt = _a[0],
    setInstallPrompt = _a[1];
  var _b = (0, react_1.useState)(false),
    isInstalled = _b[0],
    setIsInstalled = _b[1];
  (0, react_1.useEffect)(
    function () {
      // Check if already installed
      var checkInstalled = function () {
        var isInstalled =
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone === true;
        setIsInstalled(isInstalled);
      };
      checkInstalled();
      // Listen for install prompt
      var handleBeforeInstallPrompt = function (e) {
        e.preventDefault();
        setInstallPrompt(e);
        // Show install prompt after 30 seconds
        setTimeout(function () {
          if (!isInstalled) {
            sonner_1.toast.info("Instalar NeonPro", {
              description: "Adicione o NeonPro à sua tela inicial para acesso rápido",
              action: {
                label: "Instalar",
                onClick: handleInstall,
              },
              duration: 15000,
            });
          }
        }, 30000);
      };
      var handleInstall = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var outcome, error_2;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                if (!installPrompt) return [2 /*return*/];
                _a.label = 1;
              case 1:
                _a.trys.push([1, 3, , 4]);
                installPrompt.prompt();
                return [4 /*yield*/, installPrompt.userChoice];
              case 2:
                outcome = _a.sent().outcome;
                if (outcome === "accepted") {
                  sonner_1.toast.success("NeonPro instalado com sucesso!");
                  setIsInstalled(true);
                }
                setInstallPrompt(null);
                return [3 /*break*/, 4];
              case 3:
                error_2 = _a.sent();
                console.error("Install prompt failed:", error_2);
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        });
      };
      // Listen for app installed
      var handleAppInstalled = function () {
        sonner_1.toast.success("NeonPro foi adicionado à sua tela inicial!");
        setIsInstalled(true);
        setInstallPrompt(null);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
      return function () {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    },
    [installPrompt, isInstalled],
  );
  return null;
}
