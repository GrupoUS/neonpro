#!/usr/bin/env node

// PNPM Wrapper Script - Elimina warnings NPM
// Para uso no projeto NeonPro Healthcare

const { spawn } = require("child_process");
const process = require("process");

// Configurações para eliminar warnings
process.env.NPM_CONFIG_FUND = "false";
process.env.NPM_CONFIG_AUDIT_LEVEL = "none";
process.env.NPM_CONFIG_LOGLEVEL = "silent";
process.env.NPM_CONFIG_UPDATE_NOTIFIER = "false";

// Executar PNPM via NPX sem warnings
const args = ["pnpm@latest", ...process.argv.slice(2)];
const child = spawn("pnpm", ["dlx", "pnpm@latest", ...args.slice(1)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code);
});
