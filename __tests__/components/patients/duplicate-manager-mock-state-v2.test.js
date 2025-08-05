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
// Define mocks BEFORE any imports
var mockSetState = jest.fn();
var mockUseState = jest.fn(function (initialValue) { return [initialValue, mockSetState]; });
// Mock React with our custom useState
jest.mock("react", function () { return (__assign(__assign({}, jest.requireActual("react")), { useState: mockUseState })); });
// Now import after mocking
var react_1 = require("@testing-library/react");
var duplicate_manager_hook_minimal_1 = require("../../../components/patients/duplicate-manager-hook-minimal");
describe("DuplicateManagerHookMinimal - Mocked State V2", function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it("renders without crashing with mocked useState", function () {
        var mockDuplicates = [
            {
                id: "1",
                confidence: 0.9,
                patient1: {
                    id: "pat1",
                    name: "John Doe",
                    email: "john@example.com",
                },
                patient2: {
                    id: "pat2",
                    name: "Jonathan Doe",
                    email: "jonathan@example.com",
                },
            },
        ];
        // This should work with our mocked useState
        (0, react_1.render)(<duplicate_manager_hook_minimal_1.default duplicates={mockDuplicates}/>);
        expect(mockUseState).toHaveBeenCalled();
    });
});
