"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var duplicate_manager_static_1 = require("../../../components/patients/duplicate-manager-static");
describe("DuplicateManagerStatic", function () {
  it("renders duplicate detection UI", function () {
    (0, react_1.render)(<duplicate_manager_static_1.default />);
    expect(react_1.screen.getByText("Possíveis Duplicatas Detectadas")).toBeInTheDocument();
    expect(react_1.screen.getByText("Possível Duplicata")).toBeInTheDocument();
    expect(react_1.screen.getByText("João Silva")).toBeInTheDocument();
    expect(react_1.screen.getByText("João da Silva")).toBeInTheDocument();
    expect(react_1.screen.getByText("Unificar pacientes")).toBeInTheDocument();
    expect(react_1.screen.getByText("Não é duplicata")).toBeInTheDocument();
  });
  it("shows confidence percentage", function () {
    (0, react_1.render)(<duplicate_manager_static_1.default />);
    expect(react_1.screen.getByText("95% confiança")).toBeInTheDocument();
  });
  it("displays patient information", function () {
    (0, react_1.render)(<duplicate_manager_static_1.default />);
    expect(react_1.screen.getByText("joao@email.com")).toBeInTheDocument();
    expect(react_1.screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    expect(react_1.screen.getByText("Rua A, 123")).toBeInTheDocument();
  });
});
