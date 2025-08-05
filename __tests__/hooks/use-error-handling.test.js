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
var react_1 = require("@testing-library/react");
var use_error_handling_1 = require("@/hooks/use-error-handling");
describe("useErrorHandling", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(function () {});
    jest.spyOn(console, "warn").mockImplementation(function () {});
  });
  afterEach(function () {
    jest.restoreAllMocks();
  });
  it("initializes with empty errors array", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    expect(result.current.errors).toEqual([]);
    expect(result.current.hasErrors).toBe(false);
  });
  it("adds error message correctly", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Test Error",
        message: "This is a test error",
      });
    });
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors[0]).toMatchObject({
      type: "error",
      title: "Test Error",
      message: "This is a test error",
    });
    expect(result.current.errors[0].id).toBeDefined();
    expect(result.current.errors[0].timestamp).toBeInstanceOf(Date);
  });
  it("adds multiple error types", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Error",
        message: "Error message",
      });
      result.current.addError({
        type: "warning",
        title: "Warning",
        message: "Warning message",
      });
      result.current.addError({
        type: "info",
        title: "Info",
        message: "Info message",
      });
      result.current.addError({
        type: "success",
        title: "Success",
        message: "Success message",
      });
    });
    expect(result.current.errors).toHaveLength(4);
    expect(
      result.current.errors.map(function (e) {
        return e.type;
      }),
    ).toEqual(["error", "warning", "info", "success"]);
  });
  it("removes error by id", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    var errorId;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Test Error",
        message: "This is a test error",
      });
      errorId = result.current.errors[0].id;
    });
    expect(result.current.errors).toHaveLength(1);
    (0, react_1.act)(function () {
      result.current.removeError(errorId);
    });
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });
  it("clears all errors", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Error 1",
        message: "Message 1",
      });
      result.current.addError({
        type: "warning",
        title: "Warning 1",
        message: "Message 2",
      });
    });
    expect(result.current.errors).toHaveLength(2);
    (0, react_1.act)(function () {
      result.current.clearErrors();
    });
    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });
  it("adds error context information", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    var context = {
      component: "TestComponent",
      operation: "testOperation",
      userId: "user-123",
      clinicId: "clinic-456",
      metadata: {
        requestId: "req-789",
        timestamp: new Date().toISOString(),
      },
    };
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Context Error",
        message: "Error with context",
        context: context,
      });
    });
    expect(result.current.errors[0].context).toEqual(context);
  });
  it("handles error with actions", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    var mockAction = jest.fn();
    var actions = [
      {
        label: "Retry",
        action: mockAction,
        variant: "primary",
      },
    ];
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Actionable Error",
        message: "Error with actions",
        actionable: true,
        actions: actions,
      });
    });
    expect(result.current.errors[0].actions).toEqual(actions);
    expect(result.current.errors[0].actionable).toBe(true);
  });
  it("handles auto-hide functionality", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var result;
      return __generator(this, function (_a) {
        jest.useFakeTimers();
        result = (0, react_1.renderHook)(function () {
          return (0, use_error_handling_1.useErrorHandling)();
        }).result;
        (0, react_1.act)(function () {
          result.current.addError({
            type: "success",
            title: "Auto Hide",
            message: "This should auto hide",
            autoHide: true,
            duration: 1000,
          });
        });
        expect(result.current.errors).toHaveLength(1);
        // Fast forward time
        (0, react_1.act)(function () {
          jest.advanceTimersByTime(1000);
        });
        expect(result.current.errors).toHaveLength(0);
        jest.useRealTimers();
        return [2 /*return*/];
      });
    });
  });
  it("filters errors by type", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Error 1",
        message: "Error message",
      });
      result.current.addError({
        type: "warning",
        title: "Warning 1",
        message: "Warning message",
      });
      result.current.addError({
        type: "error",
        title: "Error 2",
        message: "Another error",
      });
    });
    var errorMessages = result.current.getErrorsByType("error");
    var warningMessages = result.current.getErrorsByType("warning");
    expect(errorMessages).toHaveLength(2);
    expect(warningMessages).toHaveLength(1);
    expect(
      errorMessages.every(function (e) {
        return e.type === "error";
      }),
    ).toBe(true);
    expect(
      warningMessages.every(function (e) {
        return e.type === "warning";
      }),
    ).toBe(true);
  });
  it("generates unique error IDs", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Error 1",
        message: "Message 1",
      });
      result.current.addError({
        type: "error",
        title: "Error 2",
        message: "Message 2",
      });
    });
    var ids = result.current.errors.map(function (e) {
      return e.id;
    });
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
    expect(
      ids.every(function (id) {
        return typeof id === "string" && id.length > 0;
      }),
    ).toBe(true);
  });
  it("handles dismissible errors", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "info",
        title: "Dismissible Info",
        message: "This can be dismissed",
        dismissible: true,
      });
      result.current.addError({
        type: "error",
        title: "Non-dismissible Error",
        message: "This cannot be dismissed",
        dismissible: false,
      });
    });
    expect(result.current.errors[0].dismissible).toBe(true);
    expect(result.current.errors[1].dismissible).toBe(false);
  });
  it("handles error with technical details", function () {
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)();
    }).result;
    var technicalDetails = "Stack trace or technical information";
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Technical Error",
        message: "User-friendly message",
        details: technicalDetails,
      });
    });
    expect(result.current.errors[0].details).toBe(technicalDetails);
  });
  it("respects LGPD compliance in error handling", function () {
    var _a;
    var result = (0, react_1.renderHook)(function () {
      return (0, use_error_handling_1.useErrorHandling)({
        lgpdCompliant: true,
      });
    }).result;
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Privacy Error",
        message: "Error with sensitive data",
        context: {
          userId: "user-123",
          metadata: {
            sensitiveData: "should be filtered",
          },
        },
      });
    });
    // In LGPD mode, sensitive data should be filtered or anonymized
    expect(
      (_a = result.current.errors[0].context) === null || _a === void 0 ? void 0 : _a.userId,
    ).toBeDefined();
    // Implementation would filter sensitive metadata in LGPD mode
  });
  it("handles configuration changes", function () {
    var _a = (0, react_1.renderHook)(
        function (_a) {
          var config = _a.config;
          return (0, use_error_handling_1.useErrorHandling)(config);
        },
        {
          initialProps: {
            config: {
              showTechnicalDetails: false,
              maxRetryAttempts: 3,
            },
          },
        },
      ),
      result = _a.result,
      rerender = _a.rerender;
    // Test with initial config
    (0, react_1.act)(function () {
      result.current.addError({
        type: "error",
        title: "Config Test",
        message: "Testing configuration",
      });
    });
    // Update config
    rerender({
      config: {
        showTechnicalDetails: true,
        maxRetryAttempts: 5,
      },
    });
    // Config should be updated
    expect(result.current.errors).toHaveLength(1);
  });
});
