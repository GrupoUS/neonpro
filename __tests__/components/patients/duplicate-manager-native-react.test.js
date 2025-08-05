"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Native React Testing - No External Libraries
 * Testing duplicate-manager using only React's built-in utilities
 */
var react_1 = require("react");
var server_1 = require("react-dom/server");
var duplicate_manager_hook_minimal_1 = require("../../../components/patients/duplicate-manager-hook-minimal");
describe("DuplicateManagerHookMinimal - Native React Testing", function () {
    var mockDuplicates = [
        {
            id: "1",
            confidence: 0.95,
            patient1: { id: "p1", name: "John Doe", email: "john@test.com" },
            patient2: { id: "p2", name: "J. Doe", email: "j.doe@test.com" },
        },
    ];
    test("renders without crashing using server-side rendering", function () {
        // This uses React's server-side rendering which doesn't depend on hooks execution
        var html = (0, server_1.renderToString)(react_1.default.createElement(duplicate_manager_hook_minimal_1.default, {
            duplicates: mockDuplicates,
        }));
        expect(html).toContain("John Doe");
        expect(html).toContain("J. Doe");
    });
    test("component structure is valid", function () {
        // Test that the component at least creates a valid React element
        var element = react_1.default.createElement(duplicate_manager_hook_minimal_1.default, {
            duplicates: mockDuplicates,
        });
        expect(element).toBeDefined();
        expect(element.type).toBe(duplicate_manager_hook_minimal_1.default);
        expect(element.props.duplicates).toEqual(mockDuplicates);
    });
});
