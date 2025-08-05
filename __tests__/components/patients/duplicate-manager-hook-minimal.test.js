"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var duplicate_manager_hook_minimal_1 = require("@/components/patients/duplicate-manager-hook-minimal");
var react_1 = require("@testing-library/react");
var mockDuplicates = [
  {
    id: "dup-1",
    confidence: 0.85,
    patient1: { id: "1", name: "John Doe", email: "john@example.com" },
    patient2: { id: "2", name: "Jon Doe", email: "jon@example.com" },
  },
];
describe("DuplicateManagerHookMinimal", function () {
  it("renders with hook state", function () {
    (0, react_1.render)(<duplicate_manager_hook_minimal_1.default duplicates={mockDuplicates} />);
    expect(react_1.screen.getByText("Hook Minimal Duplicate Manager")).toBeInTheDocument();
  });
  it("handles hook state changes", function () {
    (0, react_1.render)(<duplicate_manager_hook_minimal_1.default duplicates={mockDuplicates} />);
    var selectButton = react_1.screen.getByText("Select");
    expect(selectButton).toBeInTheDocument();
  });
});
