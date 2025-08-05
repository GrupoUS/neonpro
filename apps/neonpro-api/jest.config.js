module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts", // Arquivo principal de inicialização
    "!src/**/__tests__/**",
    "!src/**/tests/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 30000, // 30 segundos para testes de integração

  // Configurações específicas para sistema de saúde
  globalSetup: "<rootDir>/tests/global-setup.ts",
  globalTeardown: "<rootDir>/tests/global-teardown.ts",

  // Mocking automático para dependências externas
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Configurações para testes paralelos (importante para performance)
  maxWorkers: "50%", // Usar 50% dos cores disponíveis

  // Configurações para monitoramento LGPD/ANVISA
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true,
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: "test-results/html",
        filename: "index.html",
        expand: true,
        hideIcon: false,
        pageTitle: "NeonPro Healthcare API Tests",
        logoImgPath: undefined,
        inlineSource: false,
      },
    ],
  ],

  // Configurações para testes de conformidade
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

  // Configurações para debugging
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
};
