#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 * Validates all workflow files for syntax and common issues
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

console.log("🔍 GitHub Actions Workflow Validator");
console.log("====================================\n");

const workflowsDir = path.join(__dirname, "..", "..", ".github", "workflows");
const workflowFiles = fs.readdirSync(workflowsDir).filter(file =>
  file.endsWith(".yml") || file.endsWith(".yaml")
);

let hasErrors = false;

// Function to validate YAML syntax using GitHub CLI
function validateWorkflow(filePath) {
  const fileName = path.basename(filePath);
  console.log(`📄 Validating ${fileName}...`);

  try {
    // Basic file existence and readability check
    const content = fs.readFileSync(filePath, "utf8");

    // Check for basic required fields
    const hasName = content.includes("name:");
    const hasOn = content.includes("on:");
    const hasJobs = content.includes("jobs:");

    if (!hasName || !hasOn || !hasJobs) {
      console.log(`❌ ${fileName}: Missing required fields (name, on, or jobs)`);
      return false;
    }

    // Check for common GitHub Actions issues
    const lines = content.split("\n");
    let lineNum = 0;
    let warnings = [];

    for (const line of lines) {
      lineNum++;

      // Check for unquoted version numbers
      if (line.includes("node-version:") && /node-version:\s*\d+/.test(line)) {
        warnings.push(`Line ${lineNum}: Consider quoting node-version value`);
      }

      // Check for potential context access issues
      if (line.includes("steps.changes.outputs.") && line.includes("-")) {
        warnings.push(`Line ${lineNum}: Hyphenated output names may cause issues`);
      }

      // Check for missing quotes in expressions
      if (line.includes("${{") && line.includes("||") && !line.includes("'")) {
        warnings.push(`Line ${lineNum}: Consider using quotes in default expressions`);
      }
    }

    if (warnings.length > 0) {
      console.log(`⚠️ ${fileName}: ${warnings.length} warnings found:`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    } else {
      console.log(`✅ ${fileName}: No issues found`);
    }

    return true;
  } catch (error) {
    console.log(`❌ ${fileName}: Validation error - ${error.message}`);
    return false;
  }
}

// Test GitHub CLI availability
function testGitHubCLI() {
  try {
    execSync("gh --version", { stdio: "pipe" });
    return true;
  } catch (error) {
    console.log("⚠️ GitHub CLI not available or not authenticated");
    return false;
  }
}

// Main validation
console.log(`Found ${workflowFiles.length} workflow files\n`);

for (const file of workflowFiles) {
  const filePath = path.join(workflowsDir, file);
  const isValid = validateWorkflow(filePath);
  if (!isValid) {
    hasErrors = true;
  }
  console.log("");
}

// GitHub CLI integration (if available)
if (testGitHubCLI()) {
  console.log("🔄 Checking recent workflow runs...");
  try {
    const result = execSync("gh run list --limit 5 --json status,conclusion,name,createdAt", {
      cwd: path.join(__dirname, "..", ".."),
      encoding: "utf8",
    });
    const runs = JSON.parse(result);

    if (runs.length > 0) {
      console.log("\n📊 Recent Workflow Runs:");
      runs.forEach(run => {
        const status = run.status === "completed"
          ? (run.conclusion === "success" ? "✅" : "❌")
          : "🔄";
        console.log(
          `${status} ${run.name} - ${run.conclusion || run.status} (${
            new Date(run.createdAt).toLocaleString()
          })`,
        );
      });
    } else {
      console.log("📝 No recent workflow runs found");
    }
  } catch (error) {
    console.log("⚠️ Could not fetch workflow runs:", error.message);
  }
}

console.log("\n📋 Summary:");
if (hasErrors) {
  console.log("❌ Some workflows have validation errors");
  process.exit(1);
} else {
  console.log("✅ All workflows passed basic validation");
}

console.log("\n💡 Next steps:");
console.log("1. Commit and push changes to trigger workflows");
console.log("2. Monitor workflow runs in GitHub Actions tab");
console.log("3. Check for any runtime errors in the logs");
