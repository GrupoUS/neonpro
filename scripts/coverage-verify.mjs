#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// Minimal coverage verification: ensure coverage-final.json exists and meets thresholds if set
const root = process.cwd();
const coverageJsonPath = path.join(root, "coverage", "coverage-final.json");

if (!fs.existsSync(coverageJsonPath)) {
  console.error("coverage-final.json not found. Run unit tests with coverage first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(coverageJsonPath, "utf8"));

// Optional simple thresholds via env (defaults reasonable for MVP)
const BRANCH = Number(process.env.COV_BRANCH || 60);
const FUNC = Number(process.env.COV_FUNC || 70);
const LINE = Number(process.env.COV_LINE || 70);
const STAT = Number(process.env.COV_STAT || 70);

let totalStatements = 0, coveredStatements = 0;
let totalFunctions = 0, coveredFunctions = 0;
let totalBranches = 0, coveredBranches = 0;
let totalLines = 0, coveredLines = 0;

for (const file of Object.keys(data)) {
  const m = data[file];
  // Skip declaration files
  if (file.endsWith(".d.ts")) continue;
  if (!m) continue;
  // Statements
  if (m.s) {
    totalStatements += Object.keys(m.s).length;
    coveredStatements += Object.values(m.s).filter((v) => v > 0).length;
  }
  // Functions
  if (m.f) {
    totalFunctions += Object.keys(m.f).length;
    coveredFunctions += Object.values(m.f).filter((v) => v > 0).length;
  }
  // Branches
  if (m.b) {
    totalBranches += Object.values(m.b).reduce((acc, arr) => acc + arr.length, 0);
    coveredBranches += Object.values(m.b).reduce(
      (acc, arr) => acc + arr.filter((v) => v > 0).length,
      0,
    );
  }
  // Lines (approx using statement map fallback)
  if (m.l) {
    totalLines += Object.keys(m.l).length;
    coveredLines += Object.values(m.l).filter((v) => v > 0).length;
  } else if (m.s) {
    totalLines += Object.keys(m.s).length;
    coveredLines += Object.values(m.s).filter((v) => v > 0).length;
  }
}

const statements = totalStatements ? (coveredStatements / totalStatements) * 100 : 100;
const functions = totalFunctions ? (coveredFunctions / totalFunctions) * 100 : 100;
const branches = totalBranches ? (coveredBranches / totalBranches) * 100 : 100;
const lines = totalLines ? (coveredLines / totalLines) * 100 : 100;

console.log(`Coverage Summary (global):`);
console.log(`  Statements: ${statements.toFixed(2)}% (>= ${STAT}%)`);
console.log(`  Branches:   ${branches.toFixed(2)}% (>= ${BRANCH}%)`);
console.log(`  Functions:  ${functions.toFixed(2)}% (>= ${FUNC}%)`);
console.log(`  Lines:      ${lines.toFixed(2)}% (>= ${LINE}%)`);

const ok = statements >= STAT && branches >= BRANCH && functions >= FUNC && lines >= LINE;
if (!ok) {
  console.error("Coverage verification failed.");
  process.exit(2);
}

console.log("Coverage verification passed.");
