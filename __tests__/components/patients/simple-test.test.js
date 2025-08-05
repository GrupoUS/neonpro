"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var react_2 = require("react");
// Componente de teste simples
function SimpleComponent() {
  var _a = (0, react_2.useState)(0),
    count = _a[0],
    setCount = _a[1];
  return <div>Count: {count}</div>;
}
describe("React useState Test", function () {
  it("deve conseguir usar useState", function () {
    var getByText = (0, react_1.render)(<SimpleComponent />).getByText;
    expect(getByText("Count: 0")).toBeInTheDocument();
  });
});
