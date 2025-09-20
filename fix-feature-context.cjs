const fs = require('fs');

// Read the test file
const filePath = '/home/vibecode/neonpro/tools/orchestration/__tests__/execution-pattern-selector.test.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace patterns that are missing description and acceptance
content = content.replace(
  /(feature: \{[\s\S]*?name: "[^"]*",)\s*(domain: \[)/g,
  '$1\n          description: "A test feature for orchestration patterns",\n          $2'
);

content = content.replace(
  /(requirements: \[[^\]]*\],)\s*(healthcareCompliance: )/g,
  '$1\n          acceptance: ["Feature works as expected", "Quality standards met"],\n          $2'
);

// Write the file back
fs.writeFileSync(filePath, content);
console.log('Fixed FeatureContext properties');