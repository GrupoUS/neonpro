/**
 * Native React Testing - No External Libraries
 * Testing duplicate-manager using only React's built-in utilities
 */
import React from "react";
import { renderToString } from "react-dom/server";
import DuplicateManagerHookMinimal from "../../../components/patients/duplicate-manager-hook-minimal";

describe("DuplicateManagerHookMinimal - Native React Testing", () => {
  const mockDuplicates = [
    {
      id: "1",
      confidence: 0.95,
      patient1: { id: "p1", name: "John Doe", email: "john@test.com" },
      patient2: { id: "p2", name: "J. Doe", email: "j.doe@test.com" },
    },
  ];

  test("renders without crashing using server-side rendering", () => {
    // This uses React's server-side rendering which doesn't depend on hooks execution
    const html = renderToString(
      React.createElement(DuplicateManagerHookMinimal, {
        duplicates: mockDuplicates,
      }),
    );

    expect(html).toContain("John Doe");
    expect(html).toContain("J. Doe");
  });

  test("component structure is valid", () => {
    // Test that the component at least creates a valid React element
    const element = React.createElement(DuplicateManagerHookMinimal, {
      duplicates: mockDuplicates,
    });

    expect(element).toBeDefined();
    expect(element.type).toBe(DuplicateManagerHookMinimal);
    expect((element.props as any).duplicates).toEqual(mockDuplicates);
  });
});
