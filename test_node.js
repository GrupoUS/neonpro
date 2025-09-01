import fs from "node:fs";
import path from "node:path";

fs.writeFileSync(path.join(process.cwd(), "node_test_output.txt"), "Node.js is working!\n");