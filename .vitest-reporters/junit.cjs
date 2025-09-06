const fs = require('node:fs');

class SimpleJUnitReporter {
  constructor() {
    this.results = [];
  }
  onTestPass(test) {
    this.results.push({ name: test.name, status: 'passed', duration: test.duration || 0 });
  }
  onTestFail(test) {
    this.results.push({ name: test.name, status: 'failed', duration: test.duration || 0, error: (test.errors && test.errors[0] && test.errors[0].message) || 'error' });
  }
  onTestSkip(test) {
    this.results.push({ name: test.name, status: 'skipped', duration: test.duration || 0 });
  }
  onFinished(files, errors) {
    const suites = this.results.map(r => `    <testcase name="${r.name}" time="${(r.duration/1000).toFixed(3)}">${r.status==='failed'?`\n      <failure message="${(r.error||'').toString().replace(/\"/g,'&quot;')}"></failure>`:''}\n    </testcase>`).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="vitest">\n${suites}\n</testsuite>\n`;
    fs.writeFileSync('junit.xml', xml);
  }
}

module.exports = SimpleJUnitReporter;

