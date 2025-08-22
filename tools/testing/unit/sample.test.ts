import { describe, expect, it } from "vitest";

describe("Sample Unit Test", () => {
	it("should pass basic assertion", () => {
		expect(1 + 1).toBe(2);
	});

	it("should test string operations", () => {
		const message = "Hello NeonPro";
		expect(message).toContain("NeonPro");
		expect(message.length).toBeGreaterThan(0);
	});

	it("should test array operations", () => {
		const items = ["unit", "test", "vitest"];
		expect(items).toHaveLength(3);
		expect(items).toContain("vitest");
	});

	it("should test object properties", () => {
		const config = {
			name: "NeonPro",
			version: "2.0.0",
			testing: true,
		};

		expect(config).toHaveProperty("name", "NeonPro");
		expect(config.testing).toBe(true);
	});
});
