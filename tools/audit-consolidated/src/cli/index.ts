import { Command } from "commander";
import { createAuditCommand } from "./audit.js";

export function createCli(): Command {
  const program = new Command();
  program
    .name("neonpro-audit")
    .description("NeonPro minimal audit tool")
    .version("2.0.0");

  program.addCommand(createAuditCommand());

  return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = createCli();
  await program.parseAsync(argv);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
