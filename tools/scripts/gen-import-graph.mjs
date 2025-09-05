import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOTS = ["apps", "packages"];
const IGNORE_DIRS = new Set(["node_modules", "dist", ".next", "coverage", "build"]);
const EXT_OK = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (EXT_OK.has(p.slice(p.lastIndexOf(".")))) files.push(p);
  }
  return files;
}

function findPkgJsonDir(path) {
  let d = dirname(path);
  while (d !== "/" && d.length > 1) {
    try {
      const pkg = JSON.parse(readFileSync(join(d, "package.json"), "utf8"));
      if (pkg.name) return { dir: d, name: pkg.name };
    } catch {}
    d = dirname(d);
  }
  return null;
}

const files = [];
for (const root of ROOTS) {
  try {
    statSync(root);
    files.push(...walk(root));
  } catch {}
}

const edges = new Map(); // key: src -> Map(dst -> count)
const inbound = new Map();
const outbound = new Map();

for (const f of files) {
  let text;
  try {
    text = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const srcPkg = findPkgJsonDir(f);
  if (!srcPkg) continue;
  const re = /from\s+['"](@neonpro\/[A-Za-z0-9_-]+)['"]/g;
  let m;
  while ((m = re.exec(text))) {
    const dst = m[1];
    if (dst === srcPkg.name) continue; // self-import
    if (!edges.has(srcPkg.name)) edges.set(srcPkg.name, new Map());
    const m2 = edges.get(srcPkg.name);
    m2.set(dst, (m2.get(dst) || 0) + 1);
    outbound.set(srcPkg.name, (outbound.get(srcPkg.name) || 0) + 1);
    inbound.set(dst, (inbound.get(dst) || 0) + 1);
  }
}

const nodes = Array.from(new Set([...Array.from(edges.keys()), ...Array.from(inbound.keys())]));
const graph = {
  generatedAt: new Date().toISOString(),
  nodes,
  edges: Array.from(edges.entries()).map(([src, m]) => ({
    src,
    deps: Array.from(m.entries()).map(([dst, count]) => ({ dst, count })),
  })),
  inbound: Object.fromEntries(inbound.entries()),
  outbound: Object.fromEntries(outbound.entries()),
};

writeFileSync("tools/reports/package-dep-graph.json", JSON.stringify(graph, null, 2));

let mmd = "graph LR\n";
for (const [src, m] of edges.entries()) {
  for (const [dst, count] of m.entries()) {
    mmd += `${src.replaceAll("@", "").replaceAll("/", "__")}-->${
      dst.replaceAll("@", "").replaceAll("/", "__")
    }\n`;
  }
}
writeFileSync("tools/reports/package-dep-graph.mmd", mmd);

console.log(
  `Analyzed ${files.length} files. Nodes: ${nodes.length}. Edges: ${
    Array.from(edges.values()).reduce((a, b) => a + b.size, 0)
  }.`,
);
