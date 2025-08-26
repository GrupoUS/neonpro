/**
 * @fileoverview OpenAPI Documentation Generator
 * Enterprise-grade API documentation generator for NeonPro healthcare platform
 * Automatically generates OpenAPI 3.0 specifications from TypeScript interfaces and route handlers
 */

import { glob } from "glob";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import ora from "ora";
import yaml from "yaml";

export type OpenAPIConfig = {
	title: string;
	version: string;
	description: string;
	servers: Array<{
		url: string;
		description: string;
	}>;
	basePath: string;
	outputPath: string;
	includePatterns: string[];
	excludePatterns?: string[];
	securitySchemes?: Record<string, any>;
	healthcare?: {
		hipaaCompliant: boolean;
		lgpdCompliant: boolean;
		anvisaCompliant: boolean;
	};
};

export class OpenAPIGenerator {
	private readonly config: OpenAPIConfig;
	private readonly spinner: ReturnType<typeof ora>;

	constructor(config: OpenAPIConfig) {
		this.config = config;
		this.spinner = ora("Initializing OpenAPI Generator");
	}

	/**
	 * Generate complete OpenAPI documentation
	 */
	async generate(): Promise<void> {
		this.spinner.start("Generating OpenAPI documentation...");

		try {
			// 1. Scan for API routes and types
			const apiFiles = await this.scanApiFiles();
			this.spinner.text = `Found ${apiFiles.length} API files`;

			// 2. Extract OpenAPI components
			const components = await this.extractComponents(apiFiles);
			this.spinner.text = "Extracted API components";

			// 3. Generate OpenAPI specification
			const spec = this.generateSpec(components);
			this.spinner.text = "Generated OpenAPI specification";

			// 4. Validate specification
			await this.validateSpec(spec);
			this.spinner.text = "Validated specification";

			// 5. Write output files
			await this.writeOutputFiles(spec);

			this.spinner.succeed("OpenAPI documentation generated successfully!");
			this.logSummary(spec);
		} catch (error) {
			this.spinner.fail(`Failed to generate OpenAPI documentation: ${error}`);
			throw error;
		}
	}

	/**
	 * Scan for API files based on patterns
	 */
	private async scanApiFiles(): Promise<string[]> {
		const files: string[] = [];

		for (const pattern of this.config.includePatterns) {
			const matches = await glob(pattern, {
				cwd: this.config.basePath,
				absolute: true,
				ignore: this.config.excludePatterns || [],
			});
			files.push(...matches);
		}

		return [...new Set(files)]; // Remove duplicates
	}

	/**
	 * Extract OpenAPI components from TypeScript files
	 */
	private async extractComponents(files: string[]): Promise<any> {
		const components = {
			schemas: {},
			parameters: {},
			responses: {},
			examples: {},
			requestBodies: {},
			headers: {},
			securitySchemes: this.config.securitySchemes || {},
		};

		for (const file of files) {
			try {
				const content = readFileSync(file, "utf-8");

				// Extract JSDoc comments for OpenAPI
				const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || [];

				for (const jsdoc of jsdocMatches) {
					this.parseJSDocForOpenAPI(jsdoc, components);
				}

				// Extract TypeScript interfaces for schemas
				this.extractTypeScriptSchemas(content, components.schemas);
			} catch (_error) {}
		}

		return components;
	}

	/**
	 * Parse JSDoc comments for OpenAPI annotations
	 */
	private parseJSDocForOpenAPI(jsdoc: string, components: any): void {
		// Extract @swagger or @openapi annotations
		const swaggerMatch = jsdoc.match(/@swagger\s+([\s\S]*?)(?=\*\/|\* @)/)?.[1];
		const openapiMatch = jsdoc.match(/@openapi\s+([\s\S]*?)(?=\*\/|\* @)/)?.[1];

		const yamlContent = swaggerMatch || openapiMatch;
		if (yamlContent) {
			try {
				const parsed = yaml.parse(yamlContent.replace(/\* ?/g, ""));

				// Merge components
				if (parsed.components) {
					Object.keys(parsed.components).forEach((componentType) => {
						if (components[componentType]) {
							Object.assign(
								components[componentType],
								parsed.components[componentType],
							);
						}
					});
				}
			} catch (_error) {}
		}
	}

	/**
	 * Extract TypeScript interfaces as OpenAPI schemas
	 */
	private extractTypeScriptSchemas(
		content: string,
		schemas: Record<string, any>,
	): void {
		// Simple regex to extract interface definitions
		const interfaceRegex = /export\s+interface\s+(\w+)\s*{([^}]*)}/g;
		let match;

		while ((match = interfaceRegex.exec(content)) !== null) {
			const [, interfaceName, interfaceBody] = match;

			if (!(interfaceName && interfaceBody)) {
				continue;
			}

			try {
				const schema = this.parseInterfaceToSchema(interfaceBody);
				schemas[interfaceName] = {
					type: "object",
					properties: schema.properties,
					required: schema.required || [],
					description: `Generated from ${interfaceName} interface`,
				};
			} catch (_error) {}
		}
	}

	/**
	 * Parse TypeScript interface body to OpenAPI schema
	 */
	private parseInterfaceToSchema(interfaceBody: string): any {
		const properties: Record<string, any> = {};
		const required: string[] = [];

		// Simple property extraction (property: type;)
		const propertyRegex = /(\w+)(\?)?:\s*([^;]+);?/g;
		let match;

		while ((match = propertyRegex.exec(interfaceBody)) !== null) {
			const [, propName, optional, propType] = match;

			if (!(propName && propType)) {
				continue;
			}

			if (!optional) {
				required.push(propName);
			}

			properties[propName] = this.typeScriptTypeToOpenAPIType(propType.trim());
		}

		return { properties, required };
	}

	/**
	 * Convert TypeScript type to OpenAPI type
	 */
	private typeScriptTypeToOpenAPIType(tsType: string): any {
		// Basic type mappings
		const typeMap: Record<string, any> = {
			string: { type: "string" },
			number: { type: "number" },
			boolean: { type: "boolean" },
			Date: { type: "string", format: "date-time" },
			object: { type: "object" },
			any: {
				type: "object",
				description: "Any type (consider improving type safety)",
			},
		};

		// Array types
		if (tsType.endsWith("[]")) {
			const itemType = tsType.slice(0, -2);
			return {
				type: "array",
				items: this.typeScriptTypeToOpenAPIType(itemType),
			};
		}

		// Union types (basic support)
		if (tsType.includes("|")) {
			return {
				oneOf: tsType
					.split("|")
					.map((t) => this.typeScriptTypeToOpenAPIType(t.trim())),
			};
		}

		return typeMap[tsType] || { $ref: `#/components/schemas/${tsType}` };
	}

	/**
	 * Generate OpenAPI specification
	 */
	private generateSpec(components: any): any {
		const spec = {
			openapi: "3.0.3",
			info: {
				title: this.config.title,
				version: this.config.version,
				description: this.config.description,
				contact: {
					name: "GrupoUS Development Team",
					email: "dev@grupous.com",
					url: "https://grupous.com",
				},
				license: {
					name: "MIT",
					url: "https://opensource.org/licenses/MIT",
				},
			},
			servers: this.config.servers,
			components,
			paths: {},
			tags: [
				{
					name: "Authentication",
					description: "User authentication and authorization endpoints",
				},
				{
					name: "Healthcare",
					description: "Healthcare-specific endpoints (HIPAA/LGPD compliant)",
				},
				{
					name: "Monitoring",
					description: "System monitoring and health check endpoints",
				},
			],
		};

		// Add healthcare compliance information
		if (this.config.healthcare) {
			spec.info.description += "\n\n## Healthcare Compliance\n";
			if (this.config.healthcare.hipaaCompliant) {
				spec.info.description += "- ✅ HIPAA Compliant\n";
			}
			if (this.config.healthcare.lgpdCompliant) {
				spec.info.description += "- ✅ LGPD Compliant\n";
			}
			if (this.config.healthcare.anvisaCompliant) {
				spec.info.description += "- ✅ ANVISA Compliant\n";
			}
		}

		return spec;
	}

	/**
	 * Validate OpenAPI specification
	 */
	private async validateSpec(spec: any): Promise<void> {
		// Basic validation
		if (!(spec.openapi && spec.info && spec.paths)) {
			throw new Error("Invalid OpenAPI specification structure");
		}

		// Healthcare-specific validations
		if (this.config.healthcare) {
			this.validateHealthcareCompliance(spec);
		}
	}

	/**
	 * Validate healthcare compliance requirements
	 */
	private validateHealthcareCompliance(spec: any): void {
		const warnings: string[] = [];

		// Check for security schemes
		if (!spec.components?.securitySchemes) {
			warnings.push(
				"No security schemes defined - required for healthcare compliance",
			);
		}

		// Check for required healthcare tags
		const healthcareTags = spec.tags?.some((tag: any) =>
			tag.name.toLowerCase().includes("healthcare"),
		);
		if (!healthcareTags) {
			warnings.push("No healthcare-specific tags found");
		}

		if (warnings.length > 0) {
			warnings.forEach((_warning) => {});
		}
	}

	/**
	 * Write output files (JSON and YAML)
	 */
	private async writeOutputFiles(spec: any): Promise<void> {
		const outputDir = dirname(this.config.outputPath);

		// Ensure output directory exists
		if (!existsSync(outputDir)) {
			throw new Error(`Output directory does not exist: ${outputDir}`);
		}

		// Write JSON specification
		const jsonPath = this.config.outputPath.replace(/\.ya?ml$/, ".json");
		writeFileSync(jsonPath, JSON.stringify(spec, null, 2));

		// Write YAML specification
		const yamlPath = this.config.outputPath.replace(/\.json$/, ".yaml");
		writeFileSync(yamlPath, yaml.stringify(spec));
	}

	/**
	 * Log generation summary
	 */
	private logSummary(spec: any): void {
		const _pathCount = Object.keys(spec.paths || {}).length;
		const _schemaCount = Object.keys(spec.components?.schemas || {}).length;
		const _tagCount = (spec.tags || []).length;

		if (this.config.healthcare) {
		}
	}
}

/**
 * Default configuration for NeonPro
 */
export const defaultConfig: OpenAPIConfig = {
	title: "NeonPro Healthcare API",
	version: "1.0.0",
	description:
		"Enterprise-grade healthcare platform API - HIPAA, LGPD, and ANVISA compliant",
	servers: [
		{
			url: "https://api.neonpro.com.br",
			description: "Production server",
		},
		{
			url: "https://staging-api.neonpro.com.br",
			description: "Staging server",
		},
		{
			url: "http://localhost:3000",
			description: "Development server",
		},
	],
	basePath: process.cwd(),
	outputPath: "./docs/openapi.yaml",
	includePatterns: ["apps/*/src/**/*.ts", "packages/*/src/**/*.ts"],
	excludePatterns: ["**/*.test.ts", "**/*.spec.ts", "**/node_modules/**"],
	securitySchemes: {
		BearerAuth: {
			type: "http",
			scheme: "bearer",
			bearerFormat: "JWT",
		},
		ApiKeyAuth: {
			type: "apiKey",
			in: "header",
			name: "X-API-Key",
		},
	},
	healthcare: {
		hipaaCompliant: true,
		lgpdCompliant: true,
		anvisaCompliant: true,
	},
};

// CLI execution
if (require.main === module) {
	const generator = new OpenAPIGenerator(defaultConfig);
	generator.generate().catch((_error) => {
		process.exit(1);
	});
}
