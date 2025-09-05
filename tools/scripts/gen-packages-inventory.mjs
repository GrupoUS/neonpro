import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function listDirs(root) {
  return readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => join(root, d.name));
}

function dirSizeHuman(p) {
  try {
    return execSync(`du -sh ${p}`).toString().split("\t")[0].trim();
  } catch {
    return "n/a";
  }
}

function readPkg(p) {
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const apps = listDirs("apps");
const packages = listDirs("packages");

const rows = [];

for (const appPath of apps) {
  const pkgPath = join(appPath, "package.json");
  const pkg = readPkg(pkgPath);
  rows.push({
    kind: "app",
    path: appPath,
    size: dirSizeHuman(appPath),
    name: pkg?.name ?? appPath.split("/").pop(),
    version: pkg?.version ?? "workspace",
    private: pkg?.private ?? true,
    main: pkg?.main ?? null,
    module: pkg?.module ?? null,
    types: pkg?.types ?? null,
    exports: pkg?.exports
      ? (typeof pkg.exports === "string" ? 1 : Object.keys(pkg.exports).length)
      : 0,
    scripts: pkg?.scripts ? Object.keys(pkg.scripts).length : 0,
    bin: pkg?.bin ? (typeof pkg.bin === "string" ? 1 : Object.keys(pkg.bin).length) : 0,
  });
}

for (const pkgDir of packages) {
  const pkgPath = join(pkgDir, "package.json");
  const pkg = readPkg(pkgPath);
  rows.push({
    kind: "package",
    path: pkgDir,
    size: dirSizeHuman(pkgDir),
    name: pkg?.name ?? pkgDir.split("/").pop(),
    version: pkg?.version ?? "workspace",
    private: pkg?.private ?? false,
    main: pkg?.main ?? null,
    module: pkg?.module ?? null,
    types: pkg?.types ?? null,
    exports: pkg?.exports
      ? (typeof pkg.exports === "string" ? 1 : Object.keys(pkg.exports).length)
      : 0,
    scripts: pkg?.scripts ? Object.keys(pkg.scripts).length : 0,
    bin: pkg?.bin ? (typeof pkg.bin === "string" ? 1 : Object.keys(pkg.bin).length) : 0,
  });
}

const outJson = { generatedAt: new Date().toISOString(), total: rows.length, rows };
writeFileSync("tools/reports/packages-inventory.json", JSON.stringify(outJson, null, 2));

function mdCell(v) {
  return v === null ? "-" : String(v);
}
const header = [
  "kind",
  "name",
  "path",
  "private",
  "size",
  "main",
  "module",
  "types",
  "exports",
  "scripts",
  "bin",
];
let md = "# Packages Inventory — Detailed\n\n";
md += "| " + header.join(" | ") + " |\n";
md += "| " + header.map(() => "---").join(" | ") + " |\n";
for (const r of rows) {
  md += "| "
    + [
      r.kind,
      r.name,
      r.path,
      r.private,
      r.size,
      mdCell(r.main),
      mdCell(r.module),
      mdCell(r.types),
      r.exports,
      r.scripts,
      r.bin,
    ].join(" | ") + " |\n";
}
writeFileSync("tools/reports/packages-inventory.md", md);

console.log(`Generated inventory for ${rows.length} entries.`);
