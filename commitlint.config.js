// 🛡️ NEONPRO COMMITLINT CONFIGURATION
// Enforces Conventional Commits standard for better change tracking

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce conventional commit types
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nova funcionalidade
        "fix", // Correção de bug
        "docs", // Documentação
        "style", // Formatação (não afeta lógica)
        "refactor", // Refatoração
        "perf", // Melhoria de performance
        "test", // Testes
        "build", // Sistema de build
        "ci", // Integração contínua
        "chore", // Tarefas de manutenção
        "revert", // Reverter commit
        "wip", // Work in progress
        "hotfix", // Correção urgente em produção
      ],
    ],
    // Subject requirements
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 100],
    "subject-min-length": [2, "always", 10],

    // Header requirements
    "header-max-length": [2, "always", 120],

    // Body requirements
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 120],

    // Footer requirements
    "footer-leading-blank": [2, "always"],
  },

  // Custom parser for Portuguese commits
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
};
