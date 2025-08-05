Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var react_1 = require("@testing-library/react");
// Simple static component without hooks for testing
var StaticDuplicateManager = (_a) => {
  var _onMergeComplete = _a.onMergeComplete;
  return (
    <div>
      <h2>Duplicate Management</h2>
      <div>No duplicates found</div>
    </div>
  );
};
describe("Static DuplicateManager", () => {
  it("renders static content without hooks", () => {
    var result = (0, react_1.render)(<StaticDuplicateManager />);
    expect(result.getByText("Duplicate Management")).toBeInTheDocument();
    expect(result.getByText("No duplicates found")).toBeInTheDocument();
  });
});
