#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const exts = ['.ts','.tsx','.js','.jsx','.mjs','.cjs'];
function walk(dir, files=[]) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === '.git' || name.name === 'dist') continue;
      walk(path.join(dir, name.name), files);
    } else {
      const p = path.join(dir, name.name);
      if (exts.includes(path.extname(p))) files.push(p);
    }
  }
  return files;
}
function findPackageRoot(start) {
  let cur = path.dirname(start);
  while (cur && cur !== path.parse(cur).root) {
    if (fs.existsSync(path.join(cur,'package.json'))) return cur;
    cur = path.dirname(cur);
  }
  return null;
}
function tryResolveCandidates(baseDir, rel) {
  const candidates = [];
  const withExts = exts.concat(exts.map(e=>path.join('', 'index'+e)));
  for (const e of exts) candidates.push(baseDir + e);
  for (const e of exts) candidates.push(path.join(baseDir, 'index'+e));
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // check directory
  if (fs.existsSync(baseDir) && fs.statSync(baseDir).isDirectory()) return baseDir;
  return null;
}

const files = walk(path.join(root,'apps'));
const importRegex = /(?:import(?:["'\s]*[\w\{\}\*,\s]*from\s*)?|export\s+.*\s+from\s+|require\()\s*['"]([^'"]+)['"]/g;
const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

const results = [];

for (const f of files) {
  const txt = fs.readFileSync(f,'utf8');
  const set = new Set();
  let m;
  while ((m = importRegex.exec(txt))) set.add(m[1]);
  while ((m = dynamicImportRegex.exec(txt))) set.add(m[1]);
  if (set.size===0) continue;
  for (const spec of set) {
    // skip relative imports
    if (spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/')) continue;
    const entry = { file: path.relative(root,f), specifier: spec, resolved: false, resolvedPath: null };
    // resolve @/ -> package src
    if (spec.startsWith('@/')) {
      const pkgRoot = findPackageRoot(f) || path.dirname(f);
      const relPath = spec.replace(/^@\//,'');
      const base = path.join(pkgRoot, 'src', relPath);
      const resolved = tryResolveCandidates(base);
      if (resolved) { entry.resolved = true; entry.resolvedPath = path.relative(root,resolved); }
    } else if (spec.startsWith('@neonpro/')) {
      const parts = spec.split('/');
      const pkg = parts[1];
      const rest = parts.slice(2).join('/');
      const base = path.join(root, 'packages', pkg, 'src', rest || '');
      const resolved = tryResolveCandidates(base);
      if (resolved) { entry.resolved = true; entry.resolvedPath = path.relative(root,resolved); }
    } else {
      // not an internal alias; attempt to check monorepo packages top-level match
      if (spec.startsWith('@')) {
        const parts = spec.split('/');
        const scope = parts[0].replace('@','');
        const pkg = parts[1] || '';
        const base = path.join(root, 'packages', pkg, 'src', parts.slice(2).join('/') || '');
        const resolved = tryResolveCandidates(base);
        if (resolved) { entry.resolved = true; entry.resolvedPath = path.relative(root,resolved); }
      }
    }
    results.push(entry);
  }
}

fs.writeFileSync(path.join(root,'import-specs.json'), JSON.stringify(results, null, 2));
console.log(`scan complete: ${results.length} non-relative specifiers found. Wrote import-specs.json`);
// print summary top 30
const summary = results.slice(0,200);
console.log(JSON.stringify(summary, null, 2));
