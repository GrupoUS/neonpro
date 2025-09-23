import { Command } from "commander";
import { promises as fs } from "fs";
import path from "path";
import { runAudit } from "../auditRunner.js";
import { formatAuditReport } from "../core/reportGenerator.js";
import { AuditOptions } from "../types.js";

export function createAuditCommand(): Command {
  const command = new Command("audit");

  command
    .description("Run a lightweight audit across the repository")
    .option("-r, --root <path>", "Directory to audit", process.cwd())
    .option("-i, --include <patterns>", "Comma separated substrings to include")
    .option("-e, --exclude <patterns>", "Comma separated substrings to exclude")
    .option(
      "-d, --max-depth <number>",
      "Maximum directory depth to traverse",
      parseNumber,
    )
    .option("-o, --output <file>", "Write report to file")
    .option(
      "-f, --format <format>",
      "Output format (json|text)",
      toOutputFormat,
      "text",
    )
    .option("-v, --verbose", "Enable verbose logging", false)
    .action(async (rawOptions) => {
      const options = normaliseOptions(rawOptions);

      if (options.verbose) {
        console.log(`🏁 Starting audit in ${options.root}`);
      }

      try {
        const report = await runAudit(options);
        if (options.outputFormat === "json") {
          const json = JSON.stringify(report, null, 2);
          if (options.output) {
            await writeOutput(options.output, json);
            console.log(
              `✅ Audit complete. JSON report written to ${path.resolve(options.output)}`,
            );
          } else {
            console.log(json);
          }
        } else {
          const text = formatAuditReport(report);
          if (options.output) {
            await writeOutput(options.output, text);
            console.log(
              `✅ Audit complete. Text report written to ${path.resolve(options.output)}`,
            );
          } else {
            console.log(text);
          }
        }
      } catch (error) {
        console.error(
          "❌ Audit failed:",
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    });

  return command;
}

function normaliseOptions(raw: any): AuditOptions {
  const include =
    typeof raw.include === "string"
      ? raw.include
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean)
      : undefined;
  const exclude =
    typeof raw.exclude === "string"
      ? raw.exclude
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean)
      : undefined;

  return {
    root: path.resolve(raw.root ?? process.cwd()),
    include,
    exclude,
    maxDepth: typeof raw.maxDepth === "number" ? raw.maxDepth : undefined,
    outputFormat: raw.format,
    output: typeof raw.output === "string" ? raw.output : undefined,
    verbose: Boolean(raw.verbose),
  };
}

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

function toOutputFormat(value: string): "json" | "text" {
  return value === "json" ? "json" : "text";
}

async function writeOutput(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
}
