"use strict";
// useSSO Hook Tests
// Story 1.3: SSO Integration - React Hook Testing
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
var react_1 = require("@testing-library/react");
var use_sso_1 = require("@/hooks/use-sso");
// Mock fetch
global.fetch = jest.fn();
// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    assign: jest.fn(),
  },
  writable: true,
});
describe("useSSO", function () {
  var mockProviders = [
    {
      id: "google",
      name: "Google",
      type: "oauth2",
      enabled: true,
      config: {
        clientId: "google_client_id",
        clientSecret: "google_client_secret",
        redirectUri: "http://localhost:3000/auth/callback",
        scopes: ["openid", "email", "profile"],
        enabled: true,
        supportsRefreshToken: true,
        supportsIdToken: true,
        supportsPKCE: false,
      },
      metadata: {
        displayName: "Google",
        description: "Sign in with Google",
        iconUrl: "/icons/google.svg",
        buttonColor: "#4285f4",
        textColor: "#ffffff",
        supportedDomains: ["gmail.com", "googlemail.com"],
      },
    },
  ];
  beforeEach(function () {
    jest.clearAllMocks();
    fetch.mockClear();
  });
  describe("getProviders", function () {
    it("should fetch and set providers", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [2 /*return*/, { providers: mockProviders }];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, use_sso_1.useSSO)();
              }).result;
              expect(result.current.isLoading).toBe(false);
              expect(result.current.providers).toEqual([]);
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.getProviders()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(fetch).toHaveBeenCalledWith("/api/auth/sso/providers?enabled_only=true");
              expect(result.current.providers).toEqual(mockProviders);
              expect(result.current.isLoading).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle fetch error", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(function () {
                return (0, use_sso_1.useSSO)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.getProviders()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Failed to load SSO providers");
              expect(result.current.providers).toEqual([]);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("login", function () {
    it("should redirect to authorization URL", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockAuthUrl, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockAuthUrl = "https://accounts.google.com/oauth/authorize?...";
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [2 /*return*/, { authUrl: mockAuthUrl }];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, use_sso_1.useSSO)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.login("google")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(fetch).toHaveBeenCalledWith(
                "/api/auth/sso/authorize?provider=google&prompt=select_account",
              );
              expect(window.location.assign).toHaveBeenCalledWith(mockAuthUrl);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("logout", function () {
    it("should logout and redirect", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockResolvedValueOnce({
                ok: true,
                json: function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      return [
                        2 /*return*/,
                        {
                          success: true,
                          redirectUrl: "/auth/login?logout=success",
                        },
                      ];
                    });
                  });
                },
              });
              result = (0, react_1.renderHook)(function () {
                return (0, use_sso_1.useSSO)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.logout()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(fetch).toHaveBeenCalledWith("/api/auth/sso/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revoke_tokens: true }),
              });
              expect(window.location.assign).toHaveBeenCalledWith("/auth/login?logout=success");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle logout error", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              fetch.mockRejectedValueOnce(new Error("Logout failed"));
              result = (0, react_1.renderHook)(function () {
                return (0, use_sso_1.useSSO)();
              }).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.logout()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              expect(result.current.error).toBe("Failed to logout");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("session management", function () {
    it("should update session state", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          result = (0, react_1.renderHook)(function () {
            return (0, use_sso_1.useSSO)();
          }).result;
          (0, react_1.act)(function () {
            result.current.updateSession({
              id: "session_123",
              userId: "user_123",
              provider: "google",
              status: "active",
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 3600000).toISOString(),
            });
          });
          expect(result.current.session).toMatchObject({
            id: "session_123",
            provider: "google",
            status: "active",
          });
          expect(result.current.isAuthenticated).toBe(true);
          return [2 /*return*/];
        });
      });
    });
  });
});
