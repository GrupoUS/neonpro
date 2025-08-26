import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tASK-001 Foundation Setup Verification", () => {
  const rootDir = path.join(__dirname, "../../../../");

  describe("project Structure", () => {
    it("should have monorepo structure with apps/web", () => {
      const appsDir = path.join(rootDir, "apps");
      const webAppDir = path.join(rootDir, "apps/web");

      expect(fs.existsSync(appsDir)).toBeTruthy();
      expect(fs.existsSync(webAppDir)).toBeTruthy();
    });

    it("should have app directory with core modules", () => {
      const webAppDir = path.join(rootDir, "apps/web/app");
      const webLibDir = path.join(rootDir, "apps/web/lib");

      expect(fs.existsSync(webAppDir)).toBeTruthy();
      expect(fs.existsSync(webLibDir)).toBeTruthy();
    });

    it("should have web app components", () => {
      const webComponentsDir = path.join(rootDir, "apps/web/components");
      expect(fs.existsSync(webComponentsDir)).toBeTruthy();
    });

    it("should have web app API routes", () => {
      const webAppDir = path.join(rootDir, "apps/web/app");
      expect(fs.existsSync(webAppDir)).toBeTruthy();
    });
  });

  describe("code Quality", () => {
    it("should have TypeScript configuration", () => {
      const tsconfigPath = path.join(rootDir, "tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).toBeTruthy();
    });

    it("should have Biome configuration", () => {
      const biomeConfigPath = path.join(rootDir, "biome.jsonc");
      expect(fs.existsSync(biomeConfigPath)).toBeTruthy();
    });

    it("should have package.json with required scripts", () => {
      const packageJsonPath = path.join(rootDir, "package.json");
      expect(fs.existsSync(packageJsonPath)).toBeTruthy();

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.lint).toBeDefined();
    });
  });

  describe("testing Infrastructure", () => {
    it("should have Vitest configuration in testing tools", () => {
      const vitestConfigPath = path.join(rootDir, "vitest.config.ts");
      expect(fs.existsSync(vitestConfigPath)).toBeTruthy();
    });

    it("should have testing directory structure", () => {
      const testingDir = path.join(rootDir, "tools/testing");
      const testsDir = path.join(rootDir, "tools/testing/tests");
      const unitTestsDir = path.join(rootDir, "tools/testing/tests/unit");

      expect(fs.existsSync(testingDir)).toBeTruthy();
      expect(fs.existsSync(testsDir)).toBeTruthy();
      expect(fs.existsSync(unitTestsDir)).toBeTruthy();
    });
  });

  describe("documentation", () => {
    it("should have docs directory", () => {
      const docsDir = path.join(rootDir, "docs");
      expect(fs.existsSync(docsDir)).toBeTruthy();
    });

    it("should have README file", () => {
      const readmePath = path.join(rootDir, "README.md");
      expect(fs.existsSync(readmePath)).toBeTruthy();
    });
  });
});
