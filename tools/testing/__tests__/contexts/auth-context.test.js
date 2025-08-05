"use strict";
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
var react_1 = require("react");
var react_2 = require("@testing-library/react");
require("@testing-library/jest-dom");
var auth_context_1 = require("@/contexts/auth-context");
// Mock Supabase
var mockSupabase = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithOAuth: jest.fn(),
    onAuthStateChange: jest.fn(function () {
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      };
    }),
  },
};
jest.mock("@/app/utils/supabase/client", function () {
  return {
    createClient: function () {
      return mockSupabase;
    },
  };
});
// Test component to access auth context
var TestComponent = function () {
  var _a = (0, auth_context_1.useAuth)(),
    user = _a.user,
    session = _a.session,
    loading = _a.loading,
    signIn = _a.signIn,
    signUp = _a.signUp,
    signOut = _a.signOut,
    signInWithGoogle = _a.signInWithGoogle;
  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <div data-testid="session">{session ? "has-session" : "no-session"}</div>

      <button
        onClick={function () {
          return signIn("test@example.com", "password");
        }}
        data-testid="signin-btn"
      >
        Sign In
      </button>

      <button
        onClick={function () {
          return signUp("test@example.com", "password", "Test User");
        }}
        data-testid="signup-btn"
      >
        Sign Up
      </button>

      <button
        onClick={function () {
          return signOut();
        }}
        data-testid="signout-btn"
      >
        Sign Out
      </button>

      <button
        onClick={function () {
          return signInWithGoogle();
        }}
        data-testid="google-signin-btn"
      >
        Sign In with Google
      </button>
    </div>
  );
};
describe("AuthProvider", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });
  it("provides auth context to children", function () {
    (0, react_2.render)(
      <auth_context_1.AuthProvider>
        <TestComponent />
      </auth_context_1.AuthProvider>,
    );
    expect(react_2.screen.getByTestId("loading")).toHaveTextContent("loading");
    expect(react_2.screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(react_2.screen.getByTestId("session")).toHaveTextContent("no-session");
  });
  it("initializes with session when available", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockSession;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSession = {
              access_token: "token",
              refresh_token: "refresh",
              user: {
                id: "user-1",
                email: "test@example.com",
                user_metadata: { name: "Test User" },
              },
            };
            mockSupabase.auth.getSession.mockResolvedValue({
              data: { session: mockSession },
              error: null,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(function () {
                expect(react_2.screen.getByTestId("loading")).toHaveTextContent("not-loading");
              }),
            ];
          case 1:
            _a.sent();
            expect(react_2.screen.getByTestId("user")).toHaveTextContent("test@example.com");
            expect(react_2.screen.getByTestId("session")).toHaveTextContent("has-session");
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles sign in successfully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockUser, signInBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockUser = {
              id: "user-1",
              email: "test@example.com",
              user_metadata: { name: "Test User" },
            };
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
              data: { user: mockUser, session: null },
              error: null,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            signInBtn = react_2.screen.getByTestId("signin-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(signInBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
              email: "test@example.com",
              password: "password",
            });
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles sign in error", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockError, signInBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockError = { message: "Invalid credentials", __isAuthError: true };
            mockSupabase.auth.signInWithPassword.mockResolvedValue({
              data: { user: null, session: null },
              error: mockError,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            signInBtn = react_2.screen.getByTestId("signin-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(signInBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles sign up successfully", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockUser, signUpBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockUser = {
              id: "user-1",
              email: "test@example.com",
              user_metadata: { name: "Test User" },
            };
            mockSupabase.auth.signUp.mockResolvedValue({
              data: { user: mockUser, session: null },
              error: null,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            signUpBtn = react_2.screen.getByTestId("signup-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(signUpBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
              email: "test@example.com",
              password: "password",
              options: {
                data: {
                  name: "Test User",
                },
              },
            });
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles sign up without name", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var TestSignUpWithoutName, signUpBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase.auth.signUp.mockResolvedValue({
              data: { user: null, session: null },
              error: null,
            });
            TestSignUpWithoutName = function () {
              var signUp = (0, auth_context_1.useAuth)().signUp;
              return (
                <button
                  onClick={function () {
                    return signUp("test@example.com", "password");
                  }}
                  data-testid="signup-no-name-btn"
                >
                  Sign Up No Name
                </button>
              );
            };
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestSignUpWithoutName />
              </auth_context_1.AuthProvider>,
            );
            signUpBtn = react_2.screen.getByTestId("signup-no-name-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(signUpBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
              email: "test@example.com",
              password: "password",
              options: {
                data: undefined,
              },
            });
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles sign out", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var signOutBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase.auth.signOut.mockResolvedValue({ error: null });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            signOutBtn = react_2.screen.getByTestId("signout-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(signOutBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signOut).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles Google OAuth", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockOpen, googleBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase.auth.signInWithOAuth.mockResolvedValue({
              data: { url: "https://oauth.url", provider: "google" },
              error: null,
            });
            mockOpen = jest.fn().mockReturnValue({
              closed: false,
              close: jest.fn(),
            });
            Object.defineProperty(window, "open", {
              value: mockOpen,
              writable: true,
            });
            Object.defineProperty(window, "screen", {
              value: { width: 1920, height: 1080 },
              writable: true,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            googleBtn = react_2.screen.getByTestId("google-signin-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(googleBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
              provider: "google",
              options: {
                redirectTo: expect.stringContaining("/auth/popup-callback"),
              },
            });
            expect(mockOpen).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles Google OAuth error", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockError, googleBtn;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockError = { message: "OAuth failed", __isAuthError: true };
            mockSupabase.auth.signInWithOAuth.mockResolvedValue({
              data: { url: null, provider: "google" },
              error: mockError,
            });
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            googleBtn = react_2.screen.getByTestId("google-signin-btn");
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(googleBtn);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  it("handles auth state changes", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var authStateCallback, mockSession;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockSupabase.auth.onAuthStateChange.mockImplementation(function (callback) {
              authStateCallback = callback;
              return {
                data: { subscription: { unsubscribe: jest.fn() } },
              };
            });
            mockSession = {
              access_token: "token",
              refresh_token: "refresh",
              user: {
                id: "user-1",
                email: "test@example.com",
                user_metadata: { name: "Test User" },
              },
            };
            (0, react_2.render)(
              <auth_context_1.AuthProvider>
                <TestComponent />
              </auth_context_1.AuthProvider>,
            );
            // Trigger auth state change
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    authStateCallback("SIGNED_IN", mockSession);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            // Trigger auth state change
            _a.sent();
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(function () {
                expect(react_2.screen.getByTestId("user")).toHaveTextContent("test@example.com");
                expect(react_2.screen.getByTestId("session")).toHaveTextContent("has-session");
              }),
            ];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  it("cleans up subscription on unmount", function () {
    var mockUnsubscribe = jest.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    var unmount = (0, react_2.render)(
      <auth_context_1.AuthProvider>
        <TestComponent />
      </auth_context_1.AuthProvider>,
    ).unmount;
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
describe("useAuth hook", function () {
  it("throws error when used outside AuthProvider", function () {
    // Suppress error boundary output for this test
    var spy = jest.spyOn(console, "error").mockImplementation(function () {});
    expect(function () {
      (0, react_2.render)(<TestComponent />);
    }).toThrow();
    spy.mockRestore();
  });
});
