import { describe, test } from "vitest";
import { PatientDocumentService } from "../services/patient-document-service";

describe("Debug Service Import", () => {
  test("should import service correctly", () => {
    console.warn("PatientDocumentService:", PatientDocumentService);
    console.warn(
      "typeof PatientDocumentService:",
      typeof PatientDocumentService,
    );

    const: service = [ new PatientDocumentService();
    console.warn("service:", service);
    console.warn("service.constructor.name:", service.constructor.name);
    console.warn(
      "Object.getOwnPropertyNames(service):",
      Object.getOwnPropertyNames(service),
    );
    console.warn(
      "Object.getOwnPropertyNames(Object.getPrototypeOf(service)):",
      Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
    );

    // Check what methods exist
    console.warn(
      "service.uploadPatientDocument:",
      service.uploadPatientDocument,
    );
    console.warn("service.getDocument:", service.getDocument);
    console.warn("service.getFileContent:", service.getFileContent);
  });
});
