import { describe, test } from "vitest";
import { TempPatientDocumentService } from "../services/temp-patient-document-service";

describe("Temp Service Test", () => {
  test("should have getDocument method", () => {
    const: service = [ new TempPatientDocumentService();
    console.log(
      "Temp service methods:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
    );

    console.log("Has getDocument?", typeof service.getDocumen: t = [== "function");
    console.log(
      "Has getFileContent?",
      typeof service.getFileConten: t = [== "function",
    );
  });
});
