"use client";
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
exports.ServiceWorkerRegistration = ServiceWorkerRegistration;
exports.useIsInstalled = useIsInstalled;
exports.useServiceWorker = useServiceWorker;
var react_1 = require("react");
var sonner_1 = require("sonner");
function ServiceWorkerRegistration() {
  var _a = (0, react_1.useState)(false),
    isSupported = _a[0],
    setIsSupported = _a[1];
  var _b = (0, react_1.useState)(false),
    isRegistered = _b[0],
    setIsRegistered = _b[1];
  (0, react_1.useEffect)(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      setIsSupported(true);
      registerSW();
    } else {
      console.warn("Service Workers not supported in this browser");
    }
  }, []);
  var registerSW = () =>
    __awaiter(this, void 0, void 0, function () {
      var registration_1, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              navigator.serviceWorker.register("/sw.js", {
                scope: "/",
              }),
            ];
          case 1:
            registration_1 = _a.sent();
            setIsRegistered(true);
            console.log("Service Worker registered successfully:", registration_1);
            // Handle service worker updates
            registration_1.addEventListener("updatefound", () => {
              var newWorker = registration_1.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      // New service worker available, prompt user to refresh
                      sonner_1.toast.info("Uma nova versão do aplicativo está disponível", {
                        description: "Recarregue a página para usar a versão mais recente",
                        duration: 10000,
                        action: {
                          label: "Recarregar",
                          onClick: () => window.location.reload(),
                        },
                      });
                    } else {
                      // First time install
                      console.log("Service Worker installed for the first time");
                    }
                  }
                });
              }
            });
            // Handle service worker controller change
            navigator.serviceWorker.addEventListener("controllerchange", () => {
              console.log("Service Worker controller changed");
              // Optionally reload the page to ensure consistency
              // window.location.reload()
            });
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener("message", (event) => {
              console.log("Message from Service Worker:", event.data);
              var _a = event.data,
                type = _a.type,
                data = _a.data;
              switch (type) {
                case "CACHE_UPDATED":
                  sonner_1.toast.success("Aplicativo atualizado", {
                    description: "Nova versão carregada com sucesso",
                  });
                  break;
                case "OFFLINE_MODE":
                  sonner_1.toast.info("Modo offline ativado", {
                    description: "Você está navegando offline",
                  });
                  break;
                case "ONLINE_MODE":
                  sonner_1.toast.success("Conectado novamente", {
                    description: "Conexão com internet restaurada",
                  });
                  break;
              }
            });
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Service Worker registration failed:", error_1);
            setIsRegistered(false);
            sonner_1.toast.error("Erro ao registrar Service Worker", {
              description: "Algumas funcionalidades offline podem não funcionar",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var updateServiceWorker = () =>
    __awaiter(this, void 0, void 0, function () {
      var registration, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
          case 1:
            registration = _a.sent();
            if (!registration) return [3 /*break*/, 3];
            return [4 /*yield*/, registration.update()];
          case 2:
            _a.sent();
            sonner_1.toast.success("Service Worker atualizado");
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error updating service worker:", error_2);
            sonner_1.toast.error("Erro ao atualizar Service Worker");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var unregisterServiceWorker = () =>
    __awaiter(this, void 0, void 0, function () {
      var registration, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
          case 1:
            registration = _a.sent();
            if (!registration) return [3 /*break*/, 3];
            return [4 /*yield*/, registration.unregister()];
          case 2:
            _a.sent();
            setIsRegistered(false);
            sonner_1.toast.success("Service Worker removido");
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error unregistering service worker:", error_3);
            sonner_1.toast.error("Erro ao remover Service Worker");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Skip waiting for new service worker
  var skipWaiting = () =>
    __awaiter(this, void 0, void 0, function () {
      var registration, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
          case 1:
            registration = _a.sent();
            if (registration === null || registration === void 0 ? void 0 : registration.waiting) {
              registration.waiting.postMessage({ type: "SKIP_WAITING" });
              sonner_1.toast.success("Atualizando aplicativo...");
            }
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error skipping waiting:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  // Check for service worker updates manually
  var checkForUpdates = () =>
    __awaiter(this, void 0, void 0, function () {
      var registration, error_5;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
          case 1:
            registration = _a.sent();
            if (!registration) return [3 /*break*/, 3];
            return [4 /*yield*/, registration.update()];
          case 2:
            _a.sent();
            if (registration.waiting) {
              sonner_1.toast.info("Nova versão disponível", {
                description: "Clique para atualizar o aplicativo",
                duration: 10000,
                action: {
                  label: "Atualizar",
                  onClick: skipWaiting,
                },
              });
            } else {
              sonner_1.toast.success("Aplicativo já está atualizado");
            }
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_5 = _a.sent();
            console.error("Error checking for updates:", error_5);
            sonner_1.toast.error("Erro ao verificar atualizações");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // This component doesn't render anything visible
  // It just handles service worker registration and updates
  return null;
}
// Hook to check if app is running as PWA
function useIsInstalled() {
  var _a = (0, react_1.useState)(false),
    isInstalled = _a[0],
    setIsInstalled = _a[1];
  (0, react_1.useEffect)(() => {
    var checkInstalled = () => {
      // Check various indicators that suggest the app is installed as PWA
      var isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      var isInApp = window.navigator.standalone === true;
      var hasMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches;
      setIsInstalled(isStandalone || isInApp || hasMinimalUI);
    };
    checkInstalled();
    // Listen for display mode changes
    var mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addListener(checkInstalled);
    return () => mediaQuery.removeListener(checkInstalled);
  }, []);
  return isInstalled;
}
// Hook to check if service worker is supported and registered
function useServiceWorker() {
  var _a = (0, react_1.useState)(false),
    isSupported = _a[0],
    setIsSupported = _a[1];
  var _b = (0, react_1.useState)(false),
    isRegistered = _b[0],
    setIsRegistered = _b[1];
  var _c = (0, react_1.useState)(null),
    registration = _c[0],
    setRegistration = _c[1];
  (0, react_1.useEffect)(() => {
    var checkSupport = () =>
      __awaiter(this, void 0, void 0, function () {
        var reg, error_6;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!(typeof window !== "undefined" && "serviceWorker" in navigator))
                return [3 /*break*/, 4];
              setIsSupported(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
            case 2:
              reg = _a.sent();
              if (reg) {
                setIsRegistered(true);
                setRegistration(reg);
              }
              return [3 /*break*/, 4];
            case 3:
              error_6 = _a.sent();
              console.error("Error checking service worker registration:", error_6);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    checkSupport();
  }, []);
  return {
    isSupported: isSupported,
    isRegistered: isRegistered,
    registration: registration,
    updateServiceWorker: () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!registration) return [3 /*break*/, 2];
              return [4 /*yield*/, registration.update()];
            case 1:
              _a.sent();
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      }),
    unregisterServiceWorker: () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!registration) return [3 /*break*/, 2];
              return [4 /*yield*/, registration.unregister()];
            case 1:
              _a.sent();
              setIsRegistered(false);
              setRegistration(null);
              _a.label = 2;
            case 2:
              return [2 /*return*/];
          }
        });
      }),
  };
}
