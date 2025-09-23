/**
 * Tests for CRUD Intent Parser + Arg Extraction (T019)
 * Tests natural language parsing, intent classification, and argument extraction
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  CrudIntentParser,
  createCrudIntentParser,
  type CrudIntent,
  type ParsedIntent,
  type EntityArgument,
  type FilterArgument,
  type SortArgument,
  type LimitArgument,
} from "./crud.js";

describe("CrudIntentParser", () => {
  let parser: CrudIntentParser;

  beforeEach(() => {
    parser = createCrudIntentParser();
  });

  describe("Intent Classification", () => {
    it("should identify CREATE intents", () => {
      const inputs = [
        "create a new patient record for John Doe",
        "add new appointment for tomorrow",
        "insert user with email john@example.com",
        "make a new clinic entry",
      ];

      inputs.forEach((input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("CREATE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it("should identify READ intents", () => {
      const inputs = [
        "get all patients",
        "find user by email",
        "show me appointments for today",
        "list clinics in São Paulo",
        "retrieve patient records",
        "search for doctors",
      ];

      inputs.forEach((input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("READ");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it("should identify UPDATE intents", () => {
      const inputs = [
        "update patient status to active",
        "modify appointment time to 3pm",
        "change user email to new@example.com",
        "edit clinic address",
      ];

      inputs.forEach((input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("UPDATE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it("should identify DELETE intents", () => {
      const inputs = [
        "delete patient record",
        "remove appointment",
        "cancel booking for tomorrow",
        "eliminate user account",
      ];

      inputs.forEach((input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("DELETE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe("Entity Extraction", () => {
    it("should extract entities from CREATE commands", () => {
      const input = "create a new patient record for John Doe";
      const result = parser.parseIntent(input);

      expect(result.entities).toHaveLength(2);
      expect(result.entities[0]).toEqual({
        type: "entity_type",
        value: "patient",
        confidence: expect.any(Number),
      });
      expect(result.entities[1]).toEqual({
        type: "entity_name",
        value: "John Doe",
        confidence: expect.any(Number),
      });
    });

    it("should extract entities from READ commands with filters", () => {
      const input = "find patients by age greater than 30 in São Paulo";
      const result = parser.parseIntent(input);

      expect(result.entities).toContainEqual({
        type: "entity_type",
        value: "patients",
        confidence: expect.any(Number),
      });
      expect(result.filters).toContainEqual({
        field: "age",
        operator: "greater_than",
        value: "30",
        confidence: expect.any(Number),
      });
      expect(result.filters).toContainEqual({
        field: "location",
        operator: "equals",
        value: "São Paulo",
        confidence: expect.any(Number),
      });
    });
  });

  describe("Filter Argument Extraction", () => {
    it("should extract comparison filters", () => {
      const inputs = [
        { text: "age greater than 30", expected: { field: "age", operator: "greater_than", value: "30" } },
        { text: "price less than 100", expected: { field: "price", operator: "less_than", value: "100" } },
        { text: "status equals active", expected: { field: "status", operator: "equals", value: "active" } },
      ];

      inputs.forEach(({ text, expected }) => {
        const result = parser.parseIntent(`find patients where ${text}`);
        expect(result.filters).toContainEqual(expect.objectContaining(expected));
      });
    });

    it("should extract date range filters", () => {
      const input = "appointments between 2024-01-01 and 2024-12-31";
      const result = parser.parseIntent(input);

      expect(result.filters).toContainEqual({
        field: "date",
        operator: "between",
        value: "2024-01-01,2024-12-31",
        confidence: expect.any(Number),
      });
    });
  });

  describe("Sort Argument Extraction", () => {
    it("should extract sort arguments", () => {
      const inputs = [
        { text: "sort by name ascending", expected: { field: "name", direction: "asc" } },
        { text: "order by date descending", expected: { field: "date", direction: "desc" } },
        { text: "sort by age", expected: { field: "age", direction: "asc" } },
      ];

      inputs.forEach(({ text, expected }) => {
        const result = parser.parseIntent(`get patients ${text}`);
        expect(result.sort).toEqual(expect.objectContaining(expected));
      });
    });
  });

  describe("Limit Argument Extraction", () => {
    it("should extract limit arguments", () => {
      const inputs = [
        "get first 10 patients",
        "show me top 5 doctors",
        "limit to 20 results",
      ];

      const expected = [10, 5, 20];

      inputs.forEach((input, index) => {
        const result = parser.parseIntent(input);
        expect(result.limit).toEqual({
          value: expected[index],
          confidence: expect.any(Number),
        });
      });
    });
  });

  describe("Complex Query Parsing", () => {
    it("should parse complex queries with multiple arguments", () => {
      const input = "find patients by age greater than 30 in São Paulo, sort by name ascending, limit to 10";
      const result = parser.parseIntent(input);

      expect(result.intent).toBe("READ");
      expect(result.entities).toContainEqual(expect.objectContaining({
        type: "entity_type",
        value: "patients",
      }));
      expect(result.filters).toContainEqual(expect.objectContaining({
        field: "age",
        operator: "greater_than",
        value: "30",
      }));
      expect(result.filters).toContainEqual(expect.objectContaining({
        field: "location",
        operator: "equals",
        value: "São Paulo",
      }));
      expect(result.sort).toEqual(expect.objectContaining({
        field: "name",
        direction: "asc",
      }));
      expect(result.limit).toEqual(expect.objectContaining({
        value: 10,
      }));
    });

    it("should handle healthcare-specific terminology", () => {
      const input = "create appointment for patient ID 12345 with Dr. Silva on 2024-12-25";
      const result = parser.parseIntent(input);

      expect(result.intent).toBe("CREATE");
      expect(result.entities).toContainEqual(expect.objectContaining({
        type: "entity_type",
        value: "appointment",
      }));
      expect(result.entities).toContainEqual(expect.objectContaining({
        type: "patient_id",
        value: "12345",
      }));
      expect(result.entities).toContainEqual(expect.objectContaining({
        type: "doctor_name",
        value: "Dr. Silva",
      }));
      expect(result.entities).toContainEqual(expect.objectContaining({
        type: "date",
        value: "2024-12-25",
      }));
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", () => {
      const result = parser.parseIntent("");
      expect(result.intent).toBe("UNKNOWN");
      expect(result.confidence).toBeLessThan(0.5);
    });

    it("should handle ambiguous input", () => {
      const result = parser.parseIntent("something");
      expect(result.intent).toBe("UNKNOWN");
      expect(result.confidence).toBeLessThan(0.5);
    });

    it("should handle input with special characters", () => {
      const input = "find patients with email containing '@healthcare.com.br'";
      const result = parser.parseIntent(input);

      expect(result.intent).toBe("READ");
      expect(result.filters).toContainEqual(expect.objectContaining({
        field: "email",
        operator: "contains",
        value: "@healthcare.com.br",
      }));
    });
  });
});