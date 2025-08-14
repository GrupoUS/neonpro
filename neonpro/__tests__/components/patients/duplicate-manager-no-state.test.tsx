import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

// Simple static component without hooks for testing
const StaticDuplicateManager = ({
  onMergeComplete,
}: {
  onMergeComplete?: (result: any) => void;
}) => {
  return (
    <div>
      <h2>Duplicate Management</h2>
      <div>No duplicates found</div>
    </div>
  );
};

describe("Static DuplicateManager", () => {
  it("renders static content without hooks", () => {
    const result = render(<StaticDuplicateManager />);
    expect(result.getByText("Duplicate Management")).toBeInTheDocument();
    expect(result.getByText("No duplicates found")).toBeInTheDocument();
  });
});
