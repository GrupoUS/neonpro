// Healthcare Critical: React 19 + Next.js 15 Upgrade for Patient Safety
const fs = require("node:fs");
const _path = require("node:path");

const packagePath = "./package.json";

try {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Healthcare Critical Updates for Patient Safety
  if (pkg.dependencies) {
    if (pkg.dependencies.react) {
      pkg.dependencies.react = "^19.0.0";
    }
    if (pkg.dependencies["react-dom"]) {
      pkg.dependencies["react-dom"] = "^19.0.0";
    }
    if (pkg.dependencies.next) {
      pkg.dependencies.next = "^15.0.0";
    }
  }

  if (pkg.devDependencies) {
    if (pkg.devDependencies["@types/react"]) {
      pkg.devDependencies["@types/react"] = "^19.0.0";
    }
    if (pkg.devDependencies["@types/react-dom"]) {
      pkg.devDependencies["@types/react-dom"] = "^19.0.0";
    }
  }

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
} catch (_error) {}
