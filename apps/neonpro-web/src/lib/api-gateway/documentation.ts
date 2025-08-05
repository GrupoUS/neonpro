/**
 * NeonPro - API Gateway Documentation System
 * Automatic OpenAPI documentation generation and management
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type {
  ApiDocumentation,
  ApiExample,
  ApiGatewayConfig,
  ApiParameter,
  ApiResponse,
  ApiRoute,
} from "./types";

/**
 * OpenAPI Documentation Generator
 * Generates comprehensive API documentation from route definitions
 */
export class OpenApiDocumentationGenerator {
  private config: ApiGatewayConfig;
  private customSchemas: Map<string, any> = new Map();
  private customExamples: Map<string, ApiExample> = new Map();

  constructor(config: ApiGatewayConfig) {
    this.config = config;
    this.setupDefaultSchemas();
  }

  /**
   * Setup default schemas for common data types
   */
  private setupDefaultSchemas(): void {
    // Error response schema
    this.customSchemas.set("ErrorResponse", {
      type: "object",
      properties: {
        error: {
          type: "object",
          properties: {
            code: { type: "string", description: "Error code" },
            message: { type: "string", description: "Error message" },
            details: { type: "object", description: "Additional error details" },
            timestamp: { type: "string", format: "date-time", description: "Error timestamp" },
            requestId: { type: "string", description: "Request ID for tracking" },
          },
          required: ["code", "message", "timestamp"],
        },
      },
      required: ["error"],
    });

    // Success response schema
    this.customSchemas.set("SuccessResponse", {
      type: "object",
      properties: {
        success: { type: "boolean", description: "Operation success status" },
        data: { type: "object", description: "Response data" },
        meta: {
          type: "object",
          properties: {
            timestamp: { type: "string", format: "date-time" },
            requestId: { type: "string" },
            version: { type: "string" },
          },
        },
      },
      required: ["success"],
    });

    // Pagination schema
    this.customSchemas.set("PaginationMeta", {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, description: "Current page number" },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Items per page" },
        total: { type: "integer", minimum: 0, description: "Total number of items" },
        totalPages: { type: "integer", minimum: 0, description: "Total number of pages" },
        hasNext: { type: "boolean", description: "Whether there is a next page" },
        hasPrev: { type: "boolean", description: "Whether there is a previous page" },
      },
      required: ["page", "limit", "total", "totalPages", "hasNext", "hasPrev"],
    });

    // Patient schema (NeonPro specific)
    this.customSchemas.set("Patient", {
      type: "object",
      properties: {
        id: { type: "string", description: "Patient unique identifier" },
        name: { type: "string", description: "Patient full name" },
        email: { type: "string", format: "email", description: "Patient email address" },
        phone: { type: "string", description: "Patient phone number" },
        cpf: { type: "string", pattern: "^\\d{11}$", description: "Patient CPF (11 digits)" },
        birthDate: { type: "string", format: "date", description: "Patient birth date" },
        gender: { type: "string", enum: ["M", "F", "O"], description: "Patient gender" },
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            number: { type: "string" },
            complement: { type: "string" },
            neighborhood: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            zipCode: { type: "string", pattern: "^\\d{8}$" },
          },
          required: ["street", "city", "state", "zipCode"],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["id", "name", "email", "phone", "cpf", "birthDate"],
    });

    // Appointment schema (NeonPro specific)
    this.customSchemas.set("Appointment", {
      type: "object",
      properties: {
        id: { type: "string", description: "Appointment unique identifier" },
        patientId: { type: "string", description: "Patient ID" },
        doctorId: { type: "string", description: "Doctor ID" },
        clinicId: { type: "string", description: "Clinic ID" },
        serviceId: { type: "string", description: "Service ID" },
        scheduledAt: {
          type: "string",
          format: "date-time",
          description: "Appointment date and time",
        },
        duration: { type: "integer", minimum: 15, description: "Appointment duration in minutes" },
        status: {
          type: "string",
          enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
          description: "Appointment status",
        },
        notes: { type: "string", description: "Appointment notes" },
        price: { type: "number", minimum: 0, description: "Appointment price" },
        paymentStatus: {
          type: "string",
          enum: ["pending", "paid", "cancelled", "refunded"],
          description: "Payment status",
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: [
        "id",
        "patientId",
        "doctorId",
        "clinicId",
        "serviceId",
        "scheduledAt",
        "duration",
        "status",
      ],
    });

    // Doctor schema (NeonPro specific)
    this.customSchemas.set("Doctor", {
      type: "object",
      properties: {
        id: { type: "string", description: "Doctor unique identifier" },
        name: { type: "string", description: "Doctor full name" },
        email: { type: "string", format: "email", description: "Doctor email address" },
        phone: { type: "string", description: "Doctor phone number" },
        crm: { type: "string", description: "Doctor CRM number" },
        specialties: {
          type: "array",
          items: { type: "string" },
          description: "Doctor specialties",
        },
        clinics: {
          type: "array",
          items: { type: "string" },
          description: "Clinic IDs where doctor works",
        },
        availability: {
          type: "object",
          description: "Doctor availability schedule",
        },
        active: { type: "boolean", description: "Whether doctor is active" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["id", "name", "email", "crm", "specialties", "active"],
    });
  }

  /**
   * Generate complete OpenAPI documentation
   */
  async generateDocumentation(routes: ApiRoute[]): Promise<ApiDocumentation> {
    const paths = this.generatePaths(routes);
    const components = this.generateComponents();
    const tags = this.generateTags(routes);
    const security = this.generateSecurity();

    return {
      openapi: "3.0.3",
      info: {
        title: "NeonPro API",
        description: this.generateApiDescription(),
        version: this.config.version,
        contact: {
          name: "NeonPro Support Team",
          email: "support@neonpro.com.br",
          url: "https://neonpro.com.br/support",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        termsOfService: "https://neonpro.com.br/terms",
      },
      servers: this.generateServers(),
      paths,
      components,
      security,
      tags,
      externalDocs: {
        description: "NeonPro Documentation",
        url: "https://docs.neonpro.com.br",
      },
    };
  }

  /**
   * Generate API description
   */
  private generateApiDescription(): string {
    return `
# NeonPro Healthcare Management API

A comprehensive API for managing healthcare operations including:

- **Patient Management**: Complete patient lifecycle management
- **Appointment Scheduling**: Advanced scheduling with availability management
- **Doctor Management**: Doctor profiles, specialties, and availability
- **Clinic Operations**: Multi-clinic support with location-based services
- **Payment Processing**: Integrated payment processing with Stripe
- **Communication**: WhatsApp integration for patient communication
- **Calendar Integration**: Google Calendar synchronization
- **Analytics & Reporting**: Comprehensive analytics and reporting

## Authentication

This API uses API Key authentication. Include your API key in the \`X-API-Key\` header:

\`\`\`
X-API-Key: your-api-key-here
\`\`\`

## Rate Limiting

API requests are rate limited to ensure fair usage:

- **Free tier**: 100 requests per hour
- **Pro tier**: 1,000 requests per hour
- **Enterprise tier**: 10,000 requests per hour

## Error Handling

The API uses standard HTTP status codes and returns detailed error information:

- **400**: Bad Request - Invalid request parameters
- **401**: Unauthorized - Invalid or missing API key
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error

## Pagination

List endpoints support pagination using \`page\` and \`limit\` parameters:

- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

## Webhooks

The API supports webhooks for real-time notifications. Configure webhook endpoints in your dashboard.
    `.trim();
  }

  /**
   * Generate servers configuration
   */
  private generateServers(): Array<{ url: string; description: string }> {
    const servers = [
      {
        url: this.config.baseUrl,
        description: `${this.config.environment} server`,
      },
    ];

    // Add additional servers based on environment
    if (this.config.environment === "development") {
      servers.push({
        url: "http://localhost:3000/api",
        description: "Local development server",
      });
    }

    if (this.config.environment === "staging") {
      servers.push({
        url: "https://staging-api.neonpro.com.br",
        description: "Staging server",
      });
    }

    return servers;
  }

  /**
   * Generate paths from routes
   */
  private generatePaths(routes: ApiRoute[]): Record<string, any> {
    const paths: Record<string, any> = {};

    for (const route of routes) {
      const pathKey = this.convertPathToOpenApi(route.path);
      const methodKey = route.method.toLowerCase();

      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }

      paths[pathKey][methodKey] = this.generatePathOperation(route);
    }

    return paths;
  }

  /**
   * Convert path parameters to OpenAPI format
   */
  private convertPathToOpenApi(path: string): string {
    return path.replace(/:([^/]+)/g, "{$1}");
  }

  /**
   * Generate path operation for a route
   */
  private generatePathOperation(route: ApiRoute): any {
    const operation: any = {
      summary: route.documentation.summary,
      description: route.documentation.description,
      operationId: this.generateOperationId(route),
      tags: route.documentation.tags,
      parameters: this.generateParameters(route.documentation.parameters),
      responses: this.generateResponses(route.documentation.responses),
      security: route.authentication.required ? [{ ApiKeyAuth: [] }] : [],
    };

    // Add request body for POST/PUT/PATCH methods
    if (["post", "put", "patch"].includes(route.method.toLowerCase())) {
      operation.requestBody = this.generateRequestBody(route);
    }

    // Add examples
    if (route.documentation.examples && route.documentation.examples.length > 0) {
      operation.examples = this.formatExamples(route.documentation.examples);
    }

    return operation;
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(route: ApiRoute): string {
    const method = route.method.toLowerCase();
    const pathParts = route.path.split("/").filter((part) => part && !part.startsWith(":"));
    const resource = pathParts[pathParts.length - 1] || "root";

    return `${method}${this.capitalize(resource)}`;
  }

  /**
   * Generate parameters
   */
  private generateParameters(parameters: ApiParameter[]): any[] {
    return parameters.map((param) => ({
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.required,
      schema: param.schema,
      example: param.example,
    }));
  }

  /**
   * Generate request body
   */
  private generateRequestBody(route: ApiRoute): any {
    const requestBodyParam = route.documentation.parameters.find((p) => p.in === "body");

    if (!requestBodyParam) {
      return {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              description: "Request body",
            },
          },
        },
      };
    }

    return {
      description: requestBodyParam.description,
      required: requestBodyParam.required,
      content: {
        "application/json": {
          schema: requestBodyParam.schema,
          example: requestBodyParam.example,
        },
      },
    };
  }

  /**
   * Generate responses
   */
  private generateResponses(responses: ApiResponse[]): Record<string, any> {
    const formattedResponses: Record<string, any> = {};

    for (const response of responses) {
      formattedResponses[response.statusCode.toString()] = {
        description: response.description,
        content: response.schema
          ? {
              "application/json": {
                schema: response.schema,
                example: response.example,
              },
            }
          : undefined,
        headers: response.headers,
      };
    }

    // Add default error responses if not present
    if (!formattedResponses["400"]) {
      formattedResponses["400"] = {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      };
    }

    if (!formattedResponses["401"]) {
      formattedResponses["401"] = {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      };
    }

    if (!formattedResponses["500"]) {
      formattedResponses["500"] = {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      };
    }

    return formattedResponses;
  }

  /**
   * Generate components
   */
  private generateComponents(): any {
    return {
      schemas: Object.fromEntries(this.customSchemas),
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for authentication",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token for authentication",
        },
      },
      parameters: {
        PageParam: {
          name: "page",
          in: "query",
          description: "Page number for pagination",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: "limit",
          in: "query",
          description: "Number of items per page",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
        SortParam: {
          name: "sort",
          in: "query",
          description: "Sort field and direction (e.g., name:asc, createdAt:desc)",
          required: false,
          schema: {
            type: "string",
            pattern: "^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$",
          },
        },
      },
      responses: {
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Unauthorized: {
          description: "Authentication required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        RateLimitExceeded: {
          description: "Rate limit exceeded",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
          headers: {
            "X-RateLimit-Limit": {
              description: "Request limit per time window",
              schema: { type: "integer" },
            },
            "X-RateLimit-Remaining": {
              description: "Remaining requests in current window",
              schema: { type: "integer" },
            },
            "X-RateLimit-Reset": {
              description: "Time when rate limit resets",
              schema: { type: "integer" },
            },
          },
        },
      },
      examples: Object.fromEntries(this.customExamples),
    };
  }

  /**
   * Generate tags from routes
   */
  private generateTags(routes: ApiRoute[]): Array<{ name: string; description: string }> {
    const tagMap = new Map<string, string>();

    // Collect unique tags
    for (const route of routes) {
      for (const tag of route.documentation.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, this.generateTagDescription(tag));
        }
      }
    }

    return Array.from(tagMap.entries()).map(([name, description]) => ({
      name,
      description,
    }));
  }

  /**
   * Generate tag description
   */
  private generateTagDescription(tag: string): string {
    const descriptions: Record<string, string> = {
      patients: "Patient management operations",
      appointments: "Appointment scheduling and management",
      doctors: "Doctor profile and availability management",
      clinics: "Clinic and location management",
      services: "Medical service definitions",
      payments: "Payment processing and billing",
      communications: "Patient communication and notifications",
      integrations: "Third-party integrations",
      analytics: "Analytics and reporting",
      admin: "Administrative operations",
      auth: "Authentication and authorization",
      webhooks: "Webhook management",
      health: "System health and monitoring",
    };

    return descriptions[tag.toLowerCase()] || `${this.capitalize(tag)} operations`;
  }

  /**
   * Generate security schemes
   */
  private generateSecurity(): any[] {
    return [{ ApiKeyAuth: [] }];
  }

  /**
   * Format examples
   */
  private formatExamples(examples: ApiExample[]): Record<string, any> {
    const formatted: Record<string, any> = {};

    for (const example of examples) {
      formatted[example.name] = {
        summary: example.summary,
        description: example.description,
        value: example.value,
      };
    }

    return formatted;
  }

  /**
   * Add custom schema
   */
  addSchema(name: string, schema: any): void {
    this.customSchemas.set(name, schema);
  }

  /**
   * Add custom example
   */
  addExample(name: string, example: ApiExample): void {
    this.customExamples.set(name, example);
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Documentation Middleware
 * Automatically generates documentation for routes
 */
export class DocumentationMiddleware {
  private generator: OpenApiDocumentationGenerator;
  private routes: ApiRoute[] = [];

  constructor(config: ApiGatewayConfig) {
    this.generator = new OpenApiDocumentationGenerator(config);
  }

  /**
   * Register route for documentation
   */
  registerRoute(route: ApiRoute): void {
    this.routes.push(route);
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(): Promise<ApiDocumentation> {
    return this.generator.generateDocumentation(this.routes);
  }

  /**
   * Get documentation as JSON
   */
  async getDocumentationJson(): Promise<string> {
    const documentation = await this.generateDocumentation();
    return JSON.stringify(documentation, null, 2);
  }

  /**
   * Get documentation as YAML
   */
  async getDocumentationYaml(): Promise<string> {
    const documentation = await this.generateDocumentation();
    return this.jsonToYaml(documentation);
  }

  /**
   * Simple JSON to YAML converter
   */
  private jsonToYaml(obj: any, indent = 0): string {
    const spaces = "  ".repeat(indent);
    let yaml = "";

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === "object" && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.jsonToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === "object") {
            yaml += `${spaces}  -\n`;
            yaml += this.jsonToYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else if (typeof value === "string") {
        yaml += `${spaces}${key}: "${value}"\n`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }
}

/**
 * Documentation Route Builder
 * Helper for building route documentation
 */
export class DocumentationRouteBuilder {
  private route: Partial<ApiRoute> = {
    documentation: {
      summary: "",
      description: "",
      tags: [],
      parameters: [],
      responses: [],
      examples: [],
    },
  };

  /**
   * Set route basic info
   */
  setRoute(id: string, path: string, method: string): this {
    this.route.id = id;
    this.route.path = path;
    this.route.method = method;
    return this;
  }

  /**
   * Set summary
   */
  setSummary(summary: string): this {
    this.route.documentation!.summary = summary;
    return this;
  }

  /**
   * Set description
   */
  setDescription(description: string): this {
    this.route.documentation!.description = description;
    return this;
  }

  /**
   * Add tag
   */
  addTag(tag: string): this {
    this.route.documentation!.tags.push(tag);
    return this;
  }

  /**
   * Add parameter
   */
  addParameter(parameter: ApiParameter): this {
    this.route.documentation!.parameters.push(parameter);
    return this;
  }

  /**
   * Add response
   */
  addResponse(response: ApiResponse): this {
    this.route.documentation!.responses.push(response);
    return this;
  }

  /**
   * Add example
   */
  addExample(example: ApiExample): this {
    this.route.documentation!.examples.push(example);
    return this;
  }

  /**
   * Set authentication requirements
   */
  setAuthentication(required: boolean, roles?: string[], permissions?: string[]): this {
    this.route.authentication = {
      required,
      roles: roles || [],
      permissions: permissions || [],
    };
    return this;
  }

  /**
   * Set rate limiting
   */
  setRateLimit(maxRequests: number, windowMs: number): this {
    this.route.rateLimit = {
      maxRequests,
      windowMs,
    };
    return this;
  }

  /**
   * Build the route
   */
  build(): ApiRoute {
    if (!this.route.id || !this.route.path || !this.route.method) {
      throw new Error("Route id, path, and method are required");
    }

    return this.route as ApiRoute;
  }
}
