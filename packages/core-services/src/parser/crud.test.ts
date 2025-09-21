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

describe(_"CrudIntentParser",_() => {
  let parser: CrudIntentParser;

  beforeEach(_() => {
    parser = createCrudIntentParser();
  });

  describe(_"Intent Classification",_() => {
    it(_"should identify CREATE intents",_() => {
      const inputs = [
        "create a new patient record for John Doe",
        "add new appointment for tomorrow",
        "insert user with email john@example.com",
        "make a new clinic entry",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("CREATE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it(_"should identify READ intents",_() => {
      const inputs = [
        "get all patients",
        "find user by email",
        "show me appointments for today",
        "list clinics in São Paulo",
        "retrieve patient records",
        "search for doctors",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("READ");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it(_"should identify UPDATE intents",_() => {
      const inputs = [
        "update patient status to active",
        "modify appointment time to 3pm",
        "change user email to new@example.com",
        "edit clinic address",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("UPDATE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it(_"should identify DELETE intents",_() => {
      const inputs = [
        "delete patient record",
        "remove appointment for tomorrow",
        "cancel user account",
        "drop clinic from database",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("DELETE");
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it(_"should handle unknown intents with low confidence",_() => {
      const inputs = [
        "what is the weather today?",
        "hello world",
        "random text without intent",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("UNKNOWN");
        expect(result.confidence).toBeLessThan(0.5);
      });
    });
  });

  describe(_"Entity Extraction",_() => {
    it(_"should extract entities from CREATE intents",_() => {
      const input =
        "create a new patient record for John Doe with email john@doe.com";
      const result = parser.parseIntent(input);

      expect(result.entities.length).toBeGreaterThan(0);
      expect(_result.entities.some(
          (e) => e.type === "PERSON" && e.value === "John Doe",
        ),
      ).toBe(true);
      expect(_result.entities.some(
          (e) => e.type === "EMAIL" && e.value === "john@doe.com",
        ),
      ).toBe(true);
      expect(_result.entities.some(
          (e) => e.type === "ENTITY_TYPE" && e.value === "patient",
        ),
      ).toBe(true);
    });

    it(_"should extract entities from READ intents with filters",_() => {
      const input =
        "get all patients where status equals active and age is greater than 18";
      const result = parser.parseIntent(input);

      expect(_result.entities.some(
          (e) => e.type === "ENTITY_TYPE" && e.value === "patients",
        ),
      ).toBe(true);
      expect(_result.entities.some((e) => e.type === "FIELD" && e.value === "status"),
      ).toBe(true);
      expect(_result.entities.some((e) => e.type === "VALUE" && e.value === "active"),
      ).toBe(true);
      expect(_result.entities.some((e) => e.type === "FIELD" && e.value === "age"),
      ).toBe(true);
      expect(_result.entities.some((e) => e.type === "VALUE" && e.value === "18"),
      ).toBe(true);
    });

    it(_"should extract date entities",_() => {
      const inputs = [
        "show appointments for today",
        "get patients created on 2024-01-15",
        "find records from last week",
        "appointments for tomorrow",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(_result.entities.some((e) => e.type === "DATE")).toBe(true);
      });
    });

    it(_"should extract email and phone entities",_() => {
      const input =
        "find patient with email admin@clinic.com or phone +5511999887766";
      const result = parser.parseIntent(input);

      expect(_result.entities.some(
          (e) => e.type === "EMAIL" && e.value === "admin@clinic.com",
        ),
      ).toBe(true);
      expect(_result.entities.some(
          (e) => e.type === "PHONE" && e.value === "+5511999887766",
        ),
      ).toBe(true);
    });
  });

  describe(_"Argument Extraction",_() => {
    it(_"should extract filter arguments from WHERE clauses",_() => {
      const input =
        "get patients where status equals active and age greater than 25";
      const result = parser.parseIntent(input);

      expect(result.arguments.filters.length).toBe(2);

      const statusFilter = result.arguments.filters.find(_(f) => f.field === "status",
      );
      expect(statusFilter).toBeDefined();
      expect(statusFilter?.operator).toBe("equals");
      expect(statusFilter?.value).toBe("active");

      const ageFilter = result.arguments.filters.find(_(f) => f.field === "age");
      expect(ageFilter).toBeDefined();
      expect(ageFilter?.operator).toBe("greater_than");
      expect(ageFilter?.value).toBe("25");
    });

    it(_"should extract sort arguments from ORDER BY clauses",_() => {
      const input = "get all patients ordered by created_at descending";
      const result = parser.parseIntent(input);

      expect(result.arguments.sort).toBeDefined();
      expect(result.arguments.sort?.field).toBe("created_at");
      expect(result.arguments.sort?.direction).toBe("desc");
    });

    it(_"should extract limit arguments",_() => {
      const inputs = [
        { text: "get first 10 patients", limit: 10 },
        { text: "show top 5 appointments", limit: 5 },
        { text: "list 20 users maximum", limit: 20 },
      ];

      inputs.forEach(_({ text,_limit }) => {
        const result = parser.parseIntent(text);
        expect(result.arguments.limit).toBeDefined();
        expect(result.arguments.limit?.count).toBe(limit);
      });
    });

    it(_"should extract pagination arguments",_() => {
      const input = "get patients page 2 with 10 per page";
      const result = parser.parseIntent(input);

      expect(result.arguments.limit).toBeDefined();
      expect(result.arguments.limit?.count).toBe(10);
      expect(result.arguments.limit?.offset).toBe(10); // page 2 * 10 per page - 10
    });
  });

  describe(_"Complex Query Parsing",_() => {
    it(_"should parse complex multi-filter queries",_() => {
      const input =
        "find active patients with age between 25 and 65, created after 2024-01-01, ordered by name ascending, limit 50";
      const result = parser.parseIntent(input);

      expect(result.intent).toBe("READ");
      expect(_result.entities.some(
          (e) => e.type === "ENTITY_TYPE" && e.value === "patients",
        ),
      ).toBe(true);

      // Check filters
      expect(result.arguments.filters.length).toBeGreaterThan(0);
      expect(_result.arguments.filters.some(
          (f) => f.field === "status" && f.value === "active",
        ),
      ).toBe(true);

      // Check sort
      expect(result.arguments.sort?.field).toBe("name");
      expect(result.arguments.sort?.direction).toBe("asc");

      // Check limit
      expect(result.arguments.limit?.count).toBe(50);
    });

    it(_"should handle Brazilian Portuguese input",_() => {
      const inputs = [
        "criar novo paciente João Silva",
        "buscar todos os agendamentos de hoje",
        "atualizar status do paciente para ativo",
        "deletar consulta de amanhã",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).not.toBe("UNKNOWN");
        expect(result.confidence).toBeGreaterThan(0.6);
      });
    });
  });

  describe(_"Edge Cases and Error Handling",_() => {
    it(_"should handle empty or null input",_() => {
      expect(_() => parser.parseIntent("")).not.toThrow();
      expect(parser.parseIntent("").intent).toBe("UNKNOWN");
    });

    it(_"should handle very long input text",_() => {
      const longInput = "get patients ".repeat(100);
      const result = parser.parseIntent(longInput);
      expect(result.intent).toBe("READ");
    });

    it(_"should normalize case sensitivity",_() => {
      const inputs = [
        "GET ALL PATIENTS",
        "get all patients",
        "Get All Patients",
      ];

      inputs.forEach(_(input) => {
        const result = parser.parseIntent(input);
        expect(result.intent).toBe("READ");
      });
    });

    it(_"should handle special characters and punctuation",_() => {
      const input =
        "get patients where email = 'test@example.com' and status != 'inactive'!";
      const result = parser.parseIntent(input);
      expect(result.intent).toBe("READ");
    });
  });

  describe(_"Configuration and Customization",_() => {
    it(_"should allow custom confidence threshold",_() => {
      const customParser = createCrudIntentParser({ confidenceThreshold: 0.9 });
      const borderlineInput = "maybe show some data";

      const result = customParser.parseIntent(borderlineInput);
      expect(result.intent).toBe("UNKNOWN"); // High threshold should reject borderline cases
    });

    it(_"should support entity type customization",_() => {
      const customParser = createCrudIntentParser({
        customEntityTypes: ["CLINIC", "PROCEDURE", "APPOINTMENT"],
      });

      const input = "get all procedures for clinic São Paulo";
      const result = customParser.parseIntent(input);

      expect(_result.entities.some((e) => e.type === "PROCEDURE")).toBe(true);
      expect(_result.entities.some((e) => e.type === "CLINIC")).toBe(true);
    });
  });
});
