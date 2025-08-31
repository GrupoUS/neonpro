const fs = require("node:fs");
const path = require("node:path");
fs.writeFileSync(path.join(process.cwd(), "node_test_output.txt"), "Node.js is working!\n");
