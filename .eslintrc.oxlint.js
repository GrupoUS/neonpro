// Configuração ESLint como proxy para OxLint
// Para IDEs que não suportam OxLint nativamente

const { spawn } = require('node:child_process')
const path = require('node:path')

function _runOxLint(filePath) {
  return new Promise((resolve, _reject) => {
    const oxlintPath = path.join(__dirname, 'scripts', 'oxlint-ide.sh')
    const child = spawn(oxlintPath, [filePath], {
      cwd: __dirname,
      stdio: 'pipe',
    })

    let output = ''
    let _error = ''

    child.stdout.on('data', data => {
      output += data.toString()
    })

    child.stderr.on('data', data => {
      _error += data.toString()
    })

    child.on('close', code => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (_e) {
          resolve({ diagnostics: [] })
        }
      } else {
        resolve({ diagnostics: [] })
      }
    })
  })
}

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Regra customizada que executa OxLint
    'oxlint-proxy/run-oxlint': 'error',
  },
  plugins: ['oxlint-proxy'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      processor: 'oxlint-proxy/oxlint-processor',
    },
  ],
  settings: {
    'oxlint-proxy': {
      command: './scripts/oxlint-ide.sh',
    },
  },
}
