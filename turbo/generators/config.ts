import type { PlopTypes } from "@turbo/gen";

// Regex patterns for validation (defined at top level for performance)
const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9-]*$/;

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	// Healthcare Component Generator
	plop.setGenerator("healthcare-component", {
		description: "Generate a new healthcare UI component with LGPD compliance",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Component name:",
				validate: (input) => {
					if (!input) {
						return "Component name is required";
					}
					if (!PASCAL_CASE_REGEX.test(input)) {
						return "Component name must be PascalCase";
					}
					return true;
				},
			},
			{
				type: "confirm",
				name: "lgpdCompliant",
				message:
					"Should this component handle patient data (LGPD compliance required)?",
				default: false,
			},
		],
		actions: [
			{
				type: "add",
				path: "packages/ui/src/components/{{kebabCase name}}/{{pascalCase name}}.tsx",
				templateFile: "turbo/generators/templates/healthcare-component.hbs",
			},
			{
				type: "add",
				path: "packages/ui/src/components/{{kebabCase name}}/index.ts",
				template:
					"export { {{pascalCase name}} } from './{{pascalCase name}}';\n",
			},
			{
				type: "modify",
				path: "packages/ui/src/components/index.ts",
				pattern: /(\/\/ Components exports)/gi,
				template: "$1\nexport * from './{{kebabCase name}}';",
			},
		],
	});

	// API Endpoint Generator
	plop.setGenerator("api-endpoint", {
		description: "Generate a LGPD-compliant API endpoint",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "API endpoint name:",
				validate: (input) => {
					if (!input) {
						return "Endpoint name is required";
					}
					return true;
				},
			},
			{
				type: "list",
				name: "method",
				message: "HTTP method:",
				choices: ["GET", "POST", "PUT", "DELETE"],
				default: "GET",
			},
			{
				type: "confirm",
				name: "patientData",
				message: "Will this endpoint handle patient data?",
				default: false,
			},
		],
		actions: [
			{
				type: "add",
				path: "apps/web/app/api/{{kebabCase name}}/route.ts",
				templateFile: "turbo/generators/templates/api-endpoint.hbs",
			},
		],
	});

	// Package Generator
	plop.setGenerator("package", {
		description: "Generate a new package for the monorepo",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Package name:",
				validate: (input) => {
					if (!input) {
						return "Package name is required";
					}
					if (!KEBAB_CASE_REGEX.test(input)) {
						return "Package name must be kebab-case";
					}
					return true;
				},
			},
			{
				type: "input",
				name: "description",
				message: "Package description:",
				default: "",
			},
			{
				type: "confirm",
				name: "healthcare",
				message: "Is this a healthcare-specific package?",
				default: false,
			},
		],
		actions: [
			{
				type: "add",
				path: "packages/{{kebabCase name}}/package.json",
				templateFile: "turbo/generators/templates/package.json.hbs",
			},
			{
				type: "add",
				path: "packages/{{kebabCase name}}/src/index.ts",
				template: "// {{titleCase name}} package\nexport {};\n",
			},
			{
				type: "add",
				path: "packages/{{kebabCase name}}/tsconfig.json",
				templateFile: "turbo/generators/templates/tsconfig.json.hbs",
			},
			{
				type: "add",
				path: "packages/{{kebabCase name}}/turbo.json",
				templateFile: "turbo/generators/templates/turbo.json.hbs",
			},
		],
	});

	// Database Migration Generator
	plop.setGenerator("migration", {
		description: "Generate a new database migration for healthcare compliance",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Migration name:",
				validate: (input) => {
					if (!input) {
						return "Migration name is required";
					}
					return true;
				},
			},
			{
				type: "list",
				name: "type",
				message: "Migration type:",
				choices: [
					"create_table",
					"alter_table",
					"create_function",
					"create_policy",
					"lgpd_compliance",
					"anvisa_compliance",
				],
				default: "create_table",
			},
		],
		actions: [
			{
				type: "add",
				path: "infrastructure/database/migrations/{{timestamp}}_{{snakeCase name}}.sql",
				templateFile: "turbo/generators/templates/migration.sql.hbs",
			},
		],
	});

	// Add timestamp helper
	plop.setHelper("timestamp", () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");
		const hour = String(now.getHours()).padStart(2, "0");
		const minute = String(now.getMinutes()).padStart(2, "0");
		const second = String(now.getSeconds()).padStart(2, "0");
		return `${year}${month}${day}${hour}${minute}${second}`;
	});
}
