"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cypress_1 = require("cypress");
exports.default = (0, cypress_1.defineConfig)({
    e2e: {
        setupNodeEvents: function (on, config) {
            // implement node event listeners here
        },
        baseUrl: 'http://localhost:3000',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
        specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    },
});
