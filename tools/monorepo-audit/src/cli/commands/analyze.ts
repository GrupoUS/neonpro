import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import { DependencyAnalyzer } from "../../services/DependencyAnalyzer.js";
import { FileScanner } from "../../services/FileScanner.js";

export const analyzeCommand = new Command("analyze")
  .description("Analyze dependencies and relationships")
  .argument("[path]", "Path to analyze", process.cwd())
  .option("-o, --output <file>", "Output file path")
  .option("-f, --format <type>", "Output format (json|text)", "json")
  .option("--include <patterns>", "Include patterns", "apps/**,packages/**")
  .option(
    "--exclude <patterns>",
    "Exclude patterns",
    "**/*.test.ts,**/node_modules/**",
  )
  .option("--max-depth <number>", "Maximum transitive dependency depth", "10")
  .option("--circular", "Detect circular dependencies")
  .option("--unused", "Find unused assets")
  .option("--importance", "Calculate importance scores")
  .option("--graph-viz", "Generate GraphViz DOT output")
  .option("-v, --verbose", "Enable verbose output", false)
  .action(async (path: string, options: any) => {
    const spinner = ora("Analyzing dependencies...").start();

    try {
      // First, scan files
      spinner.text = "Scanning files...";
      const scanner = new FileScanner();
      const includePatterns = options.include
        .split(",")
        .map((p: string) => p.trim());
      const excludePatterns = options.exclude
        .split(",")
        .map((p: string) => p.trim());

      const scanResult = await scanner.scan(path, {
        includePatterns,
        excludePatterns,
        followSymlinks: false,
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 50000,
        scanContent: true,
        extractMetadata: true,
      });

      // Analyze dependencies
      spinner.text = "Building dependency graph...";
      const analyzer = new DependencyAnalyzer();

      const analyzeOptions = {
        followDynamicImports: true,
        includeTypeImports: false,
        maxTransitiveDepth: parseInt(options.maxDepth, 10) || 10,
        detectCircularDependencies: options.circular,
        supportedExtensions: [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"],
      };

      const dependencyGraph = await analyzer.buildGraph(
        scanResult.assets,
        analyzeOptions,
      );

      // Analyze specific aspects
      const results: any = {
        summary: {
          totalNodes: dependencyGraph.nodes.size,
          totalEdges: dependencyGraph.edges.length,
          analyzedAt: new Date(),
        },
        graph: {
          nodes: Array.from(dependencyGraph.nodes.values()),
          edges: dependencyGraph.edges,
        },
      };

      // Circular dependencies
      if (options.circular) {
        spinner.text = "Detecting circular dependencies...";
        const circular = analyzer.detectCircularDependencies(dependencyGraph);
        results.circularDependencies = circular;
      }

      // Unused assets
      if (options.unused) {
        spinner.text = "Finding unused assets...";
        const unused = analyzer.findUnusedAssets(dependencyGraph);
        results.unusedAssets = unused;
      }

      // Importance scores
      if (options.importance) {
        spinner.text = "Calculating importance scores...";
        const scoredGraph = analyzer.calculateImportanceScores(dependencyGraph);
        results.importanceScores = Array.from(scoredGraph.nodes.entries())
          .map(([id, node]) => ({
            assetPath: id,
            score: node.importanceScore,
            dependents: node.dependents.length,
          }))
          .sort((a, b) => b.score - a.score);
      }

      spinner.succeed("Dependency analysis completed");

      // Display summary
      console.log(chalk.blue("\nDependency Analysis Summary:"));
      console.log(`  Assets: ${chalk.green(results.summary.totalNodes)}`);
      console.log(`  Dependencies: ${chalk.green(results.summary.totalEdges)}`);

      if (results.circularDependencies) {
        console.log(
          `  Circular dependencies: ${chalk.red(results.circularDependencies.length)}`,
        );
        if (results.circularDependencies.length > 0) {
          console.log(chalk.red("\n  Circular Dependencies:"));
          results.circularDependencies
            .slice(0, 5)
            .forEach((cycle: any, i: number) => {
              console.log(`    ${i + 1}. ${cycle.cycle.join(" → ")}`);
            });
          if (results.circularDependencies.length > 5) {
            console.log(
              `    ... and ${results.circularDependencies.length - 5} more`,
            );
          }
        }
      }

      if (results.unusedAssets) {
        console.log(
          `  Unused assets: ${chalk.yellow(results.unusedAssets.length)}`,
        );
        if (results.unusedAssets.length > 0 && options.verbose) {
          console.log(chalk.yellow("\n  Unused Assets:"));
          results.unusedAssets.slice(0, 10).forEach((asset: string) => {
            console.log(`    • ${asset}`);
          });
          if (results.unusedAssets.length > 10) {
            console.log(`    ... and ${results.unusedAssets.length - 10} more`);
          }
        }
      }

      if (results.importanceScores) {
        console.log(chalk.blue("\n  Most Important Assets:"));
        results.importanceScores
          .slice(0, 10)
          .forEach((item: any, i: number) => {
            console.log(
              `    ${i + 1}. ${item.assetPath} (score: ${item.score.toFixed(4)})`,
            );
          });
      }

      // Output to file
      if (options.output) {
        const outputData =
          options.format === "json"
            ? JSON.stringify(results, null, 2)
            : generateTextOutput(results);

        const fs = await import("fs/promises");
        await fs.writeFile(options.output, outputData, "utf-8");
        console.log(chalk.green(`\nOutput saved to: ${options.output}`));
      }

      // Generate GraphViz if requested
      if (options.graphViz) {
        const dotOutput = generateGraphVizOutput(results.graph);
        const dotPath = options.output
          ? options.output.replace(/\.[^/.]+$/, "") + ".dot"
          : "dependency-graph.dot";

        const fs = await import("fs/promises");
        await fs.writeFile(dotPath, dotOutput, "utf-8");
        console.log(chalk.green(`GraphViz DOT file saved to: ${dotPath}`));
        console.log(
          chalk.gray(
            "Generate SVG with: dot -Tsvg " + dotPath + " -o graph.svg",
          ),
        );
      }
    } catch (error) {
      spinner.fail("Dependency analysis failed");
      console.error(
        chalk.red("Error:"),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  });

function generateTextOutput(results: any): string {
  let output = `Dependency Analysis Results\n${"=".repeat(50)}\n\n`;

  output += `Summary:\n`;
  output += `  Total assets: ${results.summary.totalNodes}\n`;
  output += `  Total dependencies: ${results.summary.totalEdges}\n`;
  output += `  Analysis date: ${results.summary.analyzedAt}\n\n`;

  if (results.circularDependencies) {
    output += `Circular Dependencies (${results.circularDependencies.length}):\n`;
    results.circularDependencies.forEach((cycle: any, i: number) => {
      output += `  ${i + 1}. ${cycle.cycle.join(" → ")}\n`;
    });
    output += "\n";
  }

  if (results.unusedAssets) {
    output += `Unused Assets (${results.unusedAssets.length}):\n`;
    results.unusedAssets.forEach((asset: string) => {
      output += `  • ${asset}\n`;
    });
    output += "\n";
  }

  if (results.importanceScores) {
    output += `Top 20 Most Important Assets:\n`;
    results.importanceScores.slice(0, 20).forEach((item: any, i: number) => {
      output += `  ${(i + 1).toString().padStart(2)}. ${item.assetPath} (${item.score.toFixed(
        4,
      )})\n`;
    });
  }

  return output;
}

function generateGraphVizOutput(graph: any): string {
  let dot = "digraph dependencies {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=filled, fillcolor=lightblue];\n";
  dot += "  edge [color=gray];\n\n";

  // Add nodes
  graph.nodes.forEach((node: any) => {
    const label = node.name || node.id.split("/").pop() || node.id;
    const fillColor = node.importanceScore > 0.1 ? "orange" : "lightblue";
    dot += `  "${node.id}" [label="${label}", fillcolor="${fillColor}"];\n`;
  });

  dot += "\n";

  // Add edges
  graph.edges.forEach((edge: any) => {
    dot += `  "${edge.source}" -> "${edge.target}";\n`;
  });

  dot += "}\n";

  return dot;
}

export default analyzeCommand;
