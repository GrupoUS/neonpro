"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var duplicate_manager_classic_1 = require("@/components/patients/duplicate-manager-classic");
require("@testing-library/jest-dom");
var react_1 = require("@testing-library/react");
var mockDuplicates = [
  {
    id: "group-1",
    confidence: 0.85,
    patients: [
      {
        id: "patient-1",
        name: "John Doe",
        birthDate: "1990-01-01",
        email: "john@example.com",
        phone: "555-0123",
      },
      {
        id: "patient-2",
        name: "Jon Doe",
        birthDate: "1990-01-01",
        email: "jon@example.com",
        phone: "555-0124",
      },
    ],
    suggestedPrimary: "patient-1",
  },
];
describe("DuplicateManagerClassic", function () {
  var mockOnMerge = jest.fn();
  var mockOnDismiss = jest.fn();
  beforeEach(function () {
    mockOnMerge.mockClear();
    mockOnDismiss.mockClear();
  });
  test("renders duplicate detection UI", function () {
    (0, react_1.render)(
      <duplicate_manager_classic_1.default
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />,
    );
    expect(react_1.screen.getByText("Found 1 potential duplicate")).toBeInTheDocument();
    expect(react_1.screen.getByText("85% confidence")).toBeInTheDocument();
  });
  test("shows confidence percentage", function () {
    (0, react_1.render)(
      <duplicate_manager_classic_1.default
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />,
    );
    expect(react_1.screen.getByText("85% confidence")).toBeInTheDocument();
  });
  test("displays patient information", function () {
    (0, react_1.render)(
      <duplicate_manager_classic_1.default
        duplicates={mockDuplicates}
        onMerge={mockOnMerge}
        onDismiss={mockOnDismiss}
      />,
    );
    expect(react_1.screen.getByText("John Doe")).toBeInTheDocument();
    expect(react_1.screen.getByText("Jon Doe")).toBeInTheDocument();
    expect(react_1.screen.getByText("Birth Date: 1990-01-01")).toBeInTheDocument();
  });
});
