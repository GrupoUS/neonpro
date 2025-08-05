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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var duplicate_manager_hook_minimal_1 = require("../../../components/patients/duplicate-manager-hook-minimal");
// Mock useState specifically for React 19 compatibility
var mockSetState = jest.fn();
var mockUseState = jest.fn(function (initialValue) {
  return [initialValue, mockSetState];
});
jest.mock("react", function () {
  return __assign(__assign({}, jest.requireActual("react")), { useState: mockUseState });
});
describe("DuplicateManagerHookMinimal - Mocked State", function () {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("renders without crashing with mocked useState", function () {
    var mockDuplicates = [
      {
        id: "dup1",
        confidence: 0.95,
        patient1: {
          id: "p1",
          name: "John Doe",
          email: "john@example.com",
        },
        patient2: {
          id: "p2",
          name: "Jon Doe",
          email: "jon@example.com",
        },
      },
    ];
    expect(function () {
      (0, react_1.render)(<duplicate_manager_hook_minimal_1.default duplicates={mockDuplicates} />);
    }).not.toThrow();
    // Verify useState was called
    expect(mockUseState).toHaveBeenCalledWith(null);
  });
  it("component structure is valid", function () {
    var mockDuplicates = [
      {
        id: "dup1",
        confidence: 0.95,
        patient1: {
          id: "p1",
          name: "John Doe",
          email: "john@example.com",
        },
        patient2: {
          id: "p2",
          name: "Jon Doe",
          email: "jon@example.com",
        },
      },
    ];
    var container = (0, react_1.render)(
      <duplicate_manager_hook_minimal_1.default duplicates={mockDuplicates} />,
    ).container;
    // Check if the component renders with expected structure
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelector(".space-y-4")).toBeTruthy();
  });
});
