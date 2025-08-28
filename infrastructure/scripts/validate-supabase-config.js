/**
 * VIBECODE V1.0 - Supabase Configuration Validator
 * Ensures NeonPro always uses the correct Supabase project
 * Project: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt
 */

const fs = require("node:fs");
const path = require("node:path");
// Target Supabase project configuration
const TARGET_CONFIG = {
  project_id: "gfkskrkbnawkuppazkpt",
  url: "https://gfkskrkbnawkuppazkpt.supabase.co",
  dashboard: "https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt",
  anon_key:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdma3NrcmtibmF3a3VwcGF6a3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NTExMzUsImV4cCI6MjA2MzUyNzEzNX0.hpJNATAkIwxQt_Z2Q-hxcxHX4wXszvc7eV24Sfs30ic",
};

// Files to validate
const FILES_TO_CHECK = [
  {
    path: ".env.local",
    type: "env",
    required_vars: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ],
  },
  {
    path: "supabase-url-config.json",
    type: "json",
    check_urls: true,
  },
  {
    path: "app/utils/supabase/client.ts",
    type: "typescript",
    check_env_vars: true,
  },
  {
    path: "app/utils/supabase/server.ts",
    type: "typescript",
    check_env_vars: true,
  },
];

class SupabaseConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = process.cwd();
  }

  log(_message, type = "info") {
    const timestamp = new Date().toISOString();
    switch (type) {
      case "success":
        break;
      case "error":
        break;
      case "warning":
        break;
      default:
        break;
    }
  }

  async validateEnvFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      this.errors.push(`Environment file ${filePath} not found`);
      return false;
    }

    const content = fs.readFileSync(fullPath, "utf8");

    // Check SUPABASE_URL
    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    if (!urlMatch || urlMatch[1] !== TARGET_CONFIG.url) {
      this.errors.push(
        `Incorrect SUPABASE_URL in ${filePath}. Expected: ${TARGET_CONFIG.url}`,
      );
      return false;
    }

    // Check ANON_KEY
    const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
    if (!keyMatch || keyMatch[1] !== TARGET_CONFIG.anon_key) {
      this.errors.push(`Incorrect SUPABASE_ANON_KEY in ${filePath}`);
      return false;
    }

    this.log(`Environment file ${filePath} is correctly configured`, "success");
    return true;
  }

  async validateJsonConfig(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      this.warnings.push(`Config file ${filePath} not found (optional)`);
      return true; // Optional file
    }

    try {
      const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));

      // Check if URLs contain correct project ID
      const checkUrls = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === "string" && value.includes("supabase.co")) {
            if (!value.includes(TARGET_CONFIG.project_id)) {
              this.warnings.push(
                `URL in ${filePath}.${key} may be incorrect: ${value}`,
              );
            }
          } else if (typeof value === "object" && value !== null) {
            checkUrls(value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => {
              if (
                typeof item === "string"
                && item.includes("supabase.co")
                && !item.includes(TARGET_CONFIG.project_id)
              ) {
                this.warnings.push(
                  `URL in ${filePath} array may be incorrect: ${item}`,
                );
              }
            });
          }
        }
      };

      checkUrls(content);
      this.log(`JSON config ${filePath} validated`, "success");
      return true;
    } catch (error) {
      this.errors.push(`Failed to parse JSON in ${filePath}: ${error.message}`);
      return false;
    }
  }

  async validateTypeScriptFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      this.errors.push(`TypeScript file ${filePath} not found`);
      return false;
    }

    const content = fs.readFileSync(fullPath, "utf8");

    // Check for correct environment variable usage
    if (!content.includes("process.env.NEXT_PUBLIC_SUPABASE_URL")) {
      this.errors.push(
        `${filePath} not using NEXT_PUBLIC_SUPABASE_URL environment variable`,
      );
      return false;
    }

    if (!content.includes("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
      this.errors.push(
        `${filePath} not using NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable`,
      );
      return false;
    }

    this.log(`TypeScript file ${filePath} is correctly configured`, "success");
    return true;
  }

  async validateAll() {
    this.log("Starting Supabase configuration validation...");
    this.log(`Target Project: ${TARGET_CONFIG.project_id}`);
    this.log(`Target URL: ${TARGET_CONFIG.url}`);

    for (const fileConfig of FILES_TO_CHECK) {
      switch (fileConfig.type) {
        case "env":
          await this.validateEnvFile(fileConfig.path);
          break;
        case "json":
          await this.validateJsonConfig(fileConfig.path);
          break;
        case "typescript":
          await this.validateTypeScriptFile(fileConfig.path);
          break;
      }
    }
  }

  generateReport() {
    if (this.errors.length === 0) {
      this.log("All configurations are CORRECT! ✅", "success");
    } else {
      this.log(`Found ${this.errors.length} error(s):`, "error");
      this.errors.forEach((_error) => {});
    }

    if (this.warnings.length > 0) {
      this.log(`Found ${this.warnings.length} warning(s):`, "warning");
      this.warnings.forEach((_warning) => {});
    }
    return this.errors.length === 0;
  }

  async fixConfiguration() {
    if (this.errors.length === 0) {
      this.log(
        "No fixes needed - configuration is already correct!",
        "success",
      );
      return;
    }

    this.log("Attempting to fix configuration issues...", "info");

    // Fix .env.local if it exists and has issues
    const envPath = path.join(this.projectRoot, ".env.local");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf8");

      // Update SUPABASE_URL
      content = content.replace(
        /NEXT_PUBLIC_SUPABASE_URL=.+/,
        `NEXT_PUBLIC_SUPABASE_URL=${TARGET_CONFIG.url}`,
      );

      // Update ANON_KEY
      content = content.replace(
        /NEXT_PUBLIC_SUPABASE_ANON_KEY=.+/,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${TARGET_CONFIG.anon_key}`,
      );

      fs.writeFileSync(envPath, content);
      this.log("Fixed .env.local configuration", "success");
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const validator = new SupabaseConfigValidator();

  await validator.validateAll();
  const isValid = validator.generateReport();

  if (args.includes("--fix") && !isValid) {
    await validator.fixConfiguration();

    // Revalidate after fix
    const validator2 = new SupabaseConfigValidator();
    await validator2.validateAll();
    validator2.generateReport();
  }

  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SupabaseConfigValidator;
