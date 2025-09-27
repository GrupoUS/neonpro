// Configuração ESLint como proxy para OxLint
// Para IDEs que não suportam OxLint nativamente

const { spawn } = require('child_process')
const path = require('path')

function runOxLint(filePath) {
  return new Promise((resolve, reject) => {
    const oxlintPath = path.join(__dirname, 'scripts', 'oxlint-ide.sh')
    const child = spawn(oxlintPath, [filePath], {
      cwd: __dirname,
      stdio: 'pipe',
    })

    let output = ''
    let error = ''

    child.stdout.on('data', data => {
      output += data.toString()
    })

    child.stderr.on('data', data => {
      error += data.toString()
    })

    child.on('close', code => {
      if (code === 0) {
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (e) {
          resolve({ diagnostics: [] })
        }
      } else {
        console.error('OxLint error:', error)
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
