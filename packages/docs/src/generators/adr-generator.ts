/**
 * @fileoverview ADR (Architecture Decision Record) Generator
 * Automated generation and management of Architecture Decision Records for NeonPro
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ora from "ora";

export interface ADRMetadata {
  number: number;
  title: string;
  status: "Proposed" | "Accepted" | "Rejected" | "Deprecated" | "Superseded";
  author: string;
  date: string;
  supersededBy?: number;
  relatedADRs?: number[];
}

export interface ADRContent {
  metadata: ADRMetadata;
  context: string;
  decision: string;
  consequences: string;
  alternatives: string;
  implementation?: string;
  healthcareCompliance?: string;
  securityImplications?: string;
  performanceImpact?: string;
}

export interface ADRAnswers {
  title: string;
  status: string;
  author: string;
  context?: string;
  decision?: string;
  consequences?: string;
  alternatives?: string;
  hasImplementation?: boolean;
  implementation?: string;
  hasHealthcare?: boolean;
  healthcareCompliance?: string;
  hasSecurity?: boolean;
  securityImplications?: string;
  hasPerformance?: boolean;
  performanceImpact?: string;
}

export class ADRGenerator {
  private readonly adrDirectory: string;
  private readonly templatePath: string;
  private readonly spinner: ReturnType<typeof ora>;

  constructor(adrDirectory = "./docs/adrs") {
    this.adrDirectory = adrDirectory;
    this.templatePath = join(adrDirectory, "template.md");
    this.spinner = ora("Processing...");
  }

  /**
   * Create a new ADR interactively
   */
  async createADR(): Promise<void> {
    this.spinner.start("Creating new ADR...");

    try {
      // Get next ADR number
      const nextNumber = this.getNextADRNumber();
      this.spinner.succeed(`Next ADR number: ${nextNumber}`);

      // Interactive prompts
      const answers = await inquirer.prompt<ADRAnswers>([
        {
          type: "input",
          name: "title",
          message: "ADR Title:",
          validate: (input: string) => input.length > 0 || "Title is required",
        },
        {
          type: "list",
          name: "status",
          message: "Initial Status:",
          choices: ["Proposed", "Accepted"],
          default: "Proposed",
        },
        {
          type: "input",
          name: "author",
          message: "Author name:",
          validate: (input: string) => input.length > 0 || "Author is required",
        },
        {
          type: "editor",
          name: "context",
          message: "Context (forces at play, background):",
        },
        {
          type: "editor",
          name: "decision",
          message: "Decision (what we decided to do):",
        },
        {
          type: "editor",
          name: "consequences",
          message: "Consequences (positive, negative, neutral):",
        },
        {
          type: "editor",
          name: "alternatives",
          message: "Alternatives considered:",
        },
        {
          type: "confirm",
          name: "hasImplementation",
          message: "Include implementation notes?",
          default: false,
        },
        {
          type: "editor",
          name: "implementation",
          message: "Implementation notes:",
          when: (answers: ADRAnswers) => answers.hasImplementation,
        },
        {
          type: "confirm",
          name: "hasHealthcare",
          message: "Include healthcare compliance notes?",
          default: false,
        },
        {
          type: "editor",
          name: "healthcareCompliance",
          message: "Healthcare compliance considerations:",
          when: (answers: ADRAnswers) => answers.hasHealthcare,
        },
        {
          type: "confirm",
          name: "hasSecurity",
          message: "Include security implications?",
          default: false,
        },
        {
          type: "editor",
          name: "securityImplications",
          message: "Security implications:",
          when: (answers: ADRAnswers) => answers.hasSecurity,
        },
        {
          type: "confirm",
          name: "hasPerformance",
          message: "Include performance impact?",
          default: false,
        },
        {
          type: "editor",
          name: "performanceImpact",
          message: "Performance impact:",
          when: (answers: ADRAnswers) => answers.hasPerformance,
        },
      ]);

      // Create ADR content
      const adrContent: ADRContent = {
        metadata: {
          number: nextNumber,
          title: String(answers.title || "Untitled"),
          status: (answers.status || "Proposed") as ADRMetadata["status"],
          author: String(answers.author || "Unknown"),
          date:
            new Date().toISOString().split("T")[0] ||
            new Date().toISOString().slice(0, 10),
        },
        context: (answers.context || "") as string,
        decision: (answers.decision || "") as string,
        consequences: (answers.consequences || "") as string,
        alternatives: (answers.alternatives || "") as string,
        implementation: (answers.implementation || "") as string,
        healthcareCompliance: (answers.healthcareCompliance || "") as string,
        securityImplications: (answers.securityImplications || "") as string,
        performanceImpact: (answers.performanceImpact || "") as string,
      };

      // Generate and save ADR
      const _filename = this.generateADRFile(adrContent);
    } catch (error) {
      this.spinner.fail(`Failed to create ADR: ${error}`);
      throw error;
    }
  }

  /**
   * Update ADR status
   */
  async updateADRStatus(
    adrNumber: number,
    newStatus: ADRMetadata["status"],
    supersededBy?: number,
  ): Promise<void> {
    this.spinner.start(`Updating ADR ${adrNumber} status...`);

    try {
      const filename = this.getADRFilename(adrNumber);
      const filepath = join(this.adrDirectory, filename);

      if (!existsSync(filepath)) {
        throw new Error(`ADR ${adrNumber} not found`);
      }

      const content = readFileSync(filepath, "utf8");
      let updatedContent = content;

      // Update status
      updatedContent = updatedContent.replace(
        /^## Status\n\[.*?\]/m,
        `## Status\n[${newStatus}]`,
      );

      // Add superseded information if applicable
      if (newStatus === "Superseded" && supersededBy) {
        updatedContent = updatedContent.replace(
          /^## Status\n\[Superseded\]/m,
          `## Status\n[Superseded by ADR-${supersededBy.toString().padStart(3, "0")}]`,
        );
      }

      writeFileSync(filepath, updatedContent);
      this.spinner.succeed(`Updated ADR ${adrNumber} status to: ${newStatus}`);
    } catch (error) {
      this.spinner.fail(`Failed to update ADR status: ${error}`);
      throw error;
    }
  }

  /**
   * List all ADRs with their status
   */
  listADRs(): void {
    const adrs = this.getAllADRs();

    if (adrs.length === 0) {
      return;
    }

    adrs.forEach((adr) => {
      const _statusColor = this.getStatusColor(adr.status);

      if (adr.supersededBy) {
      }
    });
  }

  /**
   * Generate ADR index/table of contents
   */
  generateIndex(): void {
    this.spinner.start("Generating ADR index...");

    try {
      const adrs = this.getAllADRs();
      let indexContent = "# Architecture Decision Records\n\n";

      indexContent +=
        "This directory contains all Architecture Decision Records (ADRs) for the NeonPro project.\n\n";
      indexContent += "## What are ADRs?\n\n";
      indexContent +=
        "Architecture Decision Records (ADRs) are documents that capture important architectural decisions made along with their context and consequences.\n\n";
      indexContent += "## Index\n\n";
      indexContent += "| Number | Title | Status | Date | Author |\n";
      indexContent += "|--------|-------|--------|------|--------|\n";

      adrs.forEach((adr) => {
        const link = `[ADR-${adr.number.toString().padStart(3, "0")}](${this.getADRFilename(
          adr.number,
        )})`;
        const status = adr.supersededBy
          ? `Superseded by ADR-${adr.supersededBy}`
          : adr.status;
        indexContent += `| ${link} | ${adr.title} | ${status} | ${adr.date} | ${adr.author} |\n`;
      });

      indexContent += "\n## Status Legend\n\n";
      indexContent += "- **Proposed**: Under discussion\n";
      indexContent += "- **Accepted**: Decision approved and implemented\n";
      indexContent += "- **Rejected**: Decision rejected\n";
      indexContent += "- **Deprecated**: No longer relevant\n";
      indexContent += "- **Superseded**: Replaced by newer decision\n";

      const indexPath = join(this.adrDirectory, "README.md");
      writeFileSync(indexPath, indexContent);

      this.spinner.succeed("ADR index generated successfully!");
    } catch (error) {
      this.spinner.fail(`Failed to generate ADR index: ${error}`);
      throw error;
    }
  }

  /**
   * Get the next ADR number
   */
  private getNextADRNumber(): number {
    const adrs = this.getAllADRs();
    return adrs.length > 0 ? Math.max(...adrs.map((adr) => adr.number)) + 1 : 1;
  }

  /**
   * Get all ADRs metadata
   */
  private getAllADRs(): ADRMetadata[] {
    if (!existsSync(this.adrDirectory)) {
      return [];
    }

    const files = readdirSync(this.adrDirectory)
      .filter((file) => file.match(/^adr-\d{3}-.*\.md$/))
      .sort();

    return files
      .map((file) => this.parseADRMetadata(file))
      .filter(Boolean) as ADRMetadata[];
  }

  /**
   * Parse ADR metadata from filename and content
   */
  private parseADRMetadata(filename: string): ADRMetadata | null {
    const match = filename.match(/^adr-(\d{3})-(.*)\.md$/);
    if (!match) {
      return null;
    }

    const [, numberStr, titleSlug] = match;
    const safeTitleSlug = titleSlug || "";
    const number = Number.parseInt(numberStr || "0", 10);

    try {
      const filepath = join(this.adrDirectory, filename);
      const content = readFileSync(filepath, "utf8");

      // Extract metadata from content
      const extractedTitle = this.extractTitle(content);
      const title =
        extractedTitle ??
        (safeTitleSlug
          ? String(safeTitleSlug).replaceAll("-", " ")
          : "Untitled");
      const status =
        (this.extractStatus(content) as ADRMetadata["status"]) || "Proposed";
      const date = this.extractDate(content) ?? "1970-01-01";
      const author = this.extractAuthor(content) ?? "Unknown";
      const supersededBy = this.extractSupersededBy(content);

      return {
        number,
        title,
        status,
        author: author || "Unknown",
        date,
        supersededBy: supersededBy || undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract title from ADR content
   */
  private extractTitle(content: string): string | null {
    const match = content.match(/^# ADR-\d{3}: (.+)$/m);
    return match?.[1] ?? null;
  }

  /**
   * Extract status from ADR content
   */
  private extractStatus(content: string): string {
    const match = content.match(/^## Status\n\[([^\]]+)\]/m);
    return match?.[1]?.split(" by ")[0] ?? "Proposed";
  }

  /**
   * Extract date from ADR content
   */
  private extractDate(content: string): string | null {
    const match = content.match(/\*\*Date\*\*: (.+)$/m);
    return match?.[1] ? match[1] : null;
  }

  /**
   * Extract author from ADR content
   */
  private extractAuthor(content: string): string | null {
    const match = content.match(/\*\*Author\(s\)\*\*: (.+)$/m);
    return match?.[1] ? match[1] : null;
  }

  /**
   * Extract superseded by information
   */
  private extractSupersededBy(content: string): number | undefined {
    const match = content.match(/Superseded by ADR-(\d{3})/m);
    return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
  }

  /**
   * Get ADR filename from number
   */
  private getADRFilename(adrNumber: number): string {
    const files = readdirSync(this.adrDirectory);
    const pattern = new RegExp(
      `^adr-${adrNumber.toString().padStart(3, "0")}-.*\\.md$`,
    );
    const found = files.find((file) => pattern.test(file));

    if (!found) {
      throw new Error(`ADR ${adrNumber} not found`);
    }

    return found;
  }

  /**
   * Generate ADR file from content
   */
  private generateADRFile(content: ADRContent): string {
    const template = existsSync(this.templatePath)
      ? readFileSync(this.templatePath, "utf8")
      : this.getDefaultTemplate();

    let adrContent = template
      .replaceAll(
        "ADR-XXX",
        `ADR-${content.metadata.number.toString().padStart(3, "0")}`,
      )
      .replaceAll(
        String.raw`\[Short Title of Decision\]`,
        content.metadata.title,
      )
      .replaceAll(
        String.raw`\[Proposed \| Accepted \| Rejected \| Deprecated \| Superseded by ADR-YYY\]`,
        content.metadata.status,
      )
      .replaceAll(/\[Describe the forces at play[\s\S]*?\]/g, content.context)
      .replaceAll(
        /\[Describe our response to these forces[\s\S]*?\]/g,
        content.decision,
      )
      .replaceAll(
        /\[Describe the resulting context[\s\S]*?\]/g,
        content.consequences,
      )
      .replaceAll(
        /\[List the alternative solutions[\s\S]*?\]/g,
        content.alternatives,
      )
      .replaceAll(String.raw`\[YYYY-MM-DD\]`, content.metadata.date)
      .replaceAll(String.raw`\[Names and roles\]`, content.metadata.author);

    // Add optional sections
    if (content.implementation) {
      adrContent = adrContent.replaceAll(
        /\[Optional: Include specific implementation details[\s\S]*?\]/g,
        content.implementation,
      );
    }

    if (content.healthcareCompliance) {
      adrContent = adrContent.replaceAll(
        /\[If applicable: Include any healthcare-specific compliance[\s\S]*?\]/g,
        content.healthcareCompliance,
      );
    }

    if (content.securityImplications) {
      adrContent = adrContent.replaceAll(
        /\[If applicable: Include security considerations[\s\S]*?\]/g,
        content.securityImplications,
      );
    }

    if (content.performanceImpact) {
      adrContent = adrContent.replaceAll(
        /\[If applicable: Include performance implications[\s\S]*?\]/g,
        content.performanceImpact,
      );
    }

    // Generate filename
    const titleSlug = content.metadata.title
      .toLowerCase()
      .replaceAll(/[^a-z0-9\s]/g, "")
      .replaceAll(/\s+/g, "-");

    const filename = `adr-${content.metadata.number.toString().padStart(3, "0")}-${titleSlug}.md`;
    const filepath = join(this.adrDirectory, filename);

    writeFileSync(filepath, adrContent);
    return filename;
  }

  /**
   * Get color for status display
   */
  private getStatusColor(status: string): (text: string) => string {
    switch (status) {
      case "Accepted": {
        return chalk.green;
      }
      case "Proposed": {
        return chalk.yellow;
      }
      case "Rejected": {
        return chalk.red;
      }
      case "Deprecated": {
        return chalk.gray;
      }
      case "Superseded": {
        return chalk.magenta;
      }
      default: {
        return chalk.white;
      }
    }
  }

  /**
   * Default template if template.md doesn't exist
   */
  private getDefaultTemplate(): string {
    return `# ADR-XXX: [Short Title of Decision]

## Status
[Proposed | Accepted | Rejected | Deprecated | Superseded by ADR-YYY]

## Context
[Describe the forces at play, including technological, political, social, and project local. These forces are probably in tension, and should be called out as such.]

## Decision
[Describe our response to these forces. State the decision in full sentences, with active voice.]

## Consequences
[Describe the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones.]

## Alternatives Considered
[List the alternative solutions that were considered and why they were rejected.]

---

**Date**: [YYYY-MM-DD]
**Author(s)**: [Names and roles]`;
  }
}

// CLI Commands
if (require.main === module) {
  const generator = new ADRGenerator();

  const command = process.argv[2];

  switch (command) {
    case "create": {
      generator.createADR().catch(console.error);
      break;
    }
    case "list": {
      generator.listADRs();
      break;
    }
    case "index": {
      generator.generateIndex();
      break;
    }
    case "update": {
      const adrNumber = process.argv[3]
        ? Number.parseInt(process.argv[3], 10)
        : 0;
      const newStatus = process.argv[4] as ADRMetadata["status"];
      const supersededBy = process.argv[5]
        ? Number.parseInt(process.argv[5], 10)
        : undefined;
      generator
        .updateADRStatus(adrNumber, newStatus, supersededBy)
        .catch(console.error);
      break;
    }
    default:
  }
}
