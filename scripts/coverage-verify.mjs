#!/usr/bin/env node
/*
  Coverage Verify Script
  - Reads coverage numbers from coverage/coverage-summary.json (preferred),
    falling back to coverage/clover.xml or coverage/coverage-final.json
  - Compares against thresholds (env-overridable)
  - Exits non-zero if thresholds not met (for CI gating)

  Env vars:
    MIN_STATEMENTS, MIN_LINES, MIN_BRANCHES, MIN_FUNCTIONS  → numeric thresholds
    COVERAGE_SUMMARY_PATH → override default summary file path
    COVERAGE_FAIL_ON_MISS → 'true' (default) to exit 1 on failure; 'false' to just warn
*/

import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const summaryPathEnv = process.env.COVERAGE_SUMMARY_PATH;
const unitSummaryPath = path.join(cwd, "coverage", "unit", "coverage-summary.json");
const integrationSummaryPath = path.join(cwd, "coverage", "integration", "coverage-summary.json");
const rootSummaryPath = path.join(cwd, "coverage", "coverage-summary.json");
const cloverPath = path.join(cwd, "coverage", "clover.xml");
const v8FinalPath = path.join(cwd, "coverage", "coverage-final.json");

const envNum = (name, def) => {
  const v = process.env[name];
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

// Optional coarse path filters for v8 coverage-final.json aggregation
// Use simple substring matching for reliability without extra deps
const includeHints = String(process.env.COVERAGE_INCLUDE || "apps/web|packages/|apps/api/src")
  .split("|").filter(Boolean);
const excludeHints = String(
  process.env.COVERAGE_EXCLUDE
    || "standalone-deployment/lib|tools/e2e|tools/testing/reports|public/",
).split("|").filter(Boolean);
const matchesInclude = (fp) =>
  (includeHints.length === 0) || includeHints.some((h) => fp.includes(h));
const matchesExclude = (fp) => excludeHints.some((h) => fp.includes(h));

// Defaults aligned with vitest.config.ts (unit: 85/85/80/85; integration: 80/80/70/75)
// We use the LOWER integration defaults by default, but allow scope-specific strictness.
const scope = String(process.env.COVERAGE_SCOPE || "").toUpperCase();
const thresholds = scope === "UNIT"
  ? {
    statements: envNum("MIN_STATEMENTS", 85),
    lines: envNum("MIN_LINES", 85),
    branches: envNum("MIN_BRANCHES", 80),
    functions: envNum("MIN_FUNCTIONS", 85),
  }
  : {
    statements: envNum("MIN_STATEMENTS", 80),
    lines: envNum("MIN_LINES", 80),
    branches: envNum("MIN_BRANCHES", 70),
    functions: envNum("MIN_FUNCTIONS", 75),
  };

const failOnMiss = String(process.env.COVERAGE_FAIL_ON_MISS || "true") === "true";

function readJSON(p) {
  try {
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function parseCoverageSummaryJson(p) {
  const data = readJSON(p);
  if (!data) return null;
  // Vitest/Istanbul summary shape: total: { lines: { pct }, statements: { pct }, branches: { pct }, functions: { pct } }
  const total = data.total || data["/"] || null;
  if (!total) return null;
  return {
    statements: total.statements?.pct ?? null,
    lines: total.lines?.pct ?? null,
    branches: total.branches?.pct ?? null,
    functions: total.functions?.pct ?? null,
    source: "coverage-summary.json",
  };
}

function parseCloverXml(p) {
  try {
    const xml = fs.readFileSync(p, "utf8");
    // Very small quick parse: extract metrics from <coverage ...><project ...><metrics statements=".." coveredstatements=".." .../></project></coverage>
    const m = xml.match(
      /<metrics[^>]*statements="(\d+)"[^>]*coveredstatements="(\d+)"[^>]*conditionals="(\d+)"[^>]*coveredconditionals="(\d+)"[^>]*methods="(\d+)"[^>]*coveredmethods="(\d+)"/,
    );
    if (!m) return null;
    const [
      _,
      statements,
      coveredStatements,
      conditionals,
      coveredConditionals,
      methods,
      coveredMethods,
    ] = m.map(Number);
    const pct = (cov, tot) => (tot > 0 ? (cov / tot) * 100 : 100);
    return {
      statements: pct(coveredStatements, statements),
      lines: null, // Clover doesn't give lines directly in this quick parse
      branches: pct(coveredConditionals, conditionals),
      functions: pct(coveredMethods, methods),
      source: "clover.xml",
    };
  } catch {
    return null;
  }
}

function parseCoverageFinalJson(p) {
  const data = readJSON(p);
  if (!data) return null;
  // Aggregate totals across files, applying include/exclude hints
  let statements = { covered: 0, total: 0 };
  let lines = { covered: 0, total: 0 };
  let branches = { covered: 0, total: 0 };
  let functions = { covered: 0, total: 0 };

  for (const [filePath, file] of Object.entries(data)) {
    const fp = String(filePath);
    if (matchesExclude(fp)) continue;
    if (!matchesInclude(fp)) continue;

    const s = file.s || {}; // statements hits by id
    const b = file.b || {}; // branches array of arrays
    const f = file.f || {}; // functions hits by id
    const l = file.l || {}; // lines hits by line number

    // statements
    const sTotals = Object.values(s);
    statements.total += sTotals.length;
    statements.covered += sTotals.filter((x) => x > 0).length;

    // functions
    const fTotals = Object.values(f);
    functions.total += fTotals.length;
    functions.covered += fTotals.filter((x) => x > 0).length;

    // branches
    for (const arr of Object.values(b)) {
      const arrA = Array.isArray(arr) ? arr : [];
      branches.total += arrA.length;
      branches.covered += arrA.filter((x) => x > 0).length;
    }

    // lines
    const lTotals = Object.values(l);
    lines.total += lTotals.length;
    lines.covered += lTotals.filter((x) => x > 0).length;
  }

  const pct = (cov, tot) => (tot > 0 ? (cov / tot) * 100 : 100);
  return {
    statements: pct(statements.covered, statements.total),
    lines: pct(lines.covered, lines.total),
    branches: pct(branches.covered, branches.total),
    functions: pct(functions.covered, functions.total),
    source: "coverage-final.json",
  };
}

function pickFirstAvailable() {
  // 1) Explicit env override
  if (summaryPathEnv && fs.existsSync(summaryPathEnv)) {
    const s = parseCoverageSummaryJson(summaryPathEnv);
    if (s) return s;
  }
  // 2) Optional scope: UNIT or INTEGRATION
  const scope = String(process.env.COVERAGE_SCOPE || "").toUpperCase();
  if (scope === "UNIT" && fs.existsSync(unitSummaryPath)) {
    const s = parseCoverageSummaryJson(unitSummaryPath);
    if (s) return s;
  }
  if (scope === "INTEGRATION" && fs.existsSync(integrationSummaryPath)) {
    const s = parseCoverageSummaryJson(integrationSummaryPath);
    if (s) return s;
  }
  // 3) Auto-prefer unit → integration → root
  if (fs.existsSync(unitSummaryPath)) {
    const s = parseCoverageSummaryJson(unitSummaryPath);
    if (s) return s;
  }
  if (fs.existsSync(integrationSummaryPath)) {
    const s = parseCoverageSummaryJson(integrationSummaryPath);
    if (s) return s;
  }
  if (fs.existsSync(rootSummaryPath)) {
    const s = parseCoverageSummaryJson(rootSummaryPath);
    if (s) return s;
  }
  // 4) Fallbacks (prefer v8 JSON over clover for more accurate lines/functions)
  if (fs.existsSync(v8FinalPath)) {
    const f = parseCoverageFinalJson(v8FinalPath);
    if (f) return f;
  }
  if (fs.existsSync(cloverPath)) {
    const c = parseCloverXml(cloverPath);
    if (c) return c;
  }
  return null;
}

function formatPct(n) {
  return n == null ? "n/a" : `${n.toFixed(2)}%`;
}

function main() {
  const cov = pickFirstAvailable();
  if (!cov) {
    console.error(
      "Coverage files not found. Expected one of: coverage-summary.json, clover.xml, coverage-final.json",
    );
    process.exit(failOnMiss ? 1 : 0);
  }

  const res = {
    statements: cov.statements ?? 100,
    lines: cov.lines ?? 100, // if n/a default to 100 so it doesn't fail purely due to missing metric
    branches: cov.branches ?? 100,
    functions: cov.functions ?? 100,
  };

  const misses = [];
  if (res.statements < thresholds.statements) {
    misses.push(`statements ${formatPct(res.statements)} < ${thresholds.statements}%`);
  }
  if (res.lines < thresholds.lines) {
    misses.push(`lines ${formatPct(res.lines)} < ${thresholds.lines}%`);
  }
  if (res.branches < thresholds.branches) {
    misses.push(`branches ${formatPct(res.branches)} < ${thresholds.branches}%`);
  }
  if (res.functions < thresholds.functions) {
    misses.push(`functions ${formatPct(res.functions)} < ${thresholds.functions}%`);
  }

  const summary = `Coverage (${cov.source}) → statements=${formatPct(res.statements)}, lines=${
    formatPct(res.lines)
  }, branches=${formatPct(res.branches)}, functions=${formatPct(res.functions)}`;
  if (misses.length) {
    console.error(summary);
    console.error("Thresholds not met:", misses.join("; "));
    process.exit(failOnMiss ? 1 : 0);
  } else {
    console.log(summary);
    console.log("Coverage thresholds met.");
    process.exit(0);
  }
}

main();
