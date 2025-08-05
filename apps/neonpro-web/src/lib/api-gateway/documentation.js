/**
 * NeonPro - API Gateway Documentation System
 * Automatic OpenAPI documentation generation and management
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationRouteBuilder =
  exports.DocumentationMiddleware =
  exports.OpenApiDocumentationGenerator =
    void 0;
/**
 * OpenAPI Documentation Generator
 * Generates comprehensive API documentation from route definitions
 */
var OpenApiDocumentationGenerator = /** @class */ (() => {
  function OpenApiDocumentationGenerator(config) {
    this.customSchemas = new Map();
    this.customExamples = new Map();
    this.config = config;
    this.setupDefaultSchemas();
  }
  /**
   * Setup default schemas for common data types
   */
  OpenApiDocumentationGenerator.prototype.setupDefaultSchemas = function () {
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
  };
  /**
   * Generate complete OpenAPI documentation
   */
  OpenApiDocumentationGenerator.prototype.generateDocumentation = function (routes) {
    return __awaiter(this, void 0, void 0, function () {
      var paths, components, tags, security;
      return __generator(this, function (_a) {
        paths = this.generatePaths(routes);
        components = this.generateComponents();
        tags = this.generateTags(routes);
        security = this.generateSecurity();
        return [
          2 /*return*/,
          {
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
            paths: paths,
            components: components,
            security: security,
            tags: tags,
            externalDocs: {
              description: "NeonPro Documentation",
              url: "https://docs.neonpro.com.br",
            },
          },
        ];
      });
    });
  };
  /**
   * Generate API description
   */
  OpenApiDocumentationGenerator.prototype.generateApiDescription = () =>
    "\n# NeonPro Healthcare Management API\n\nA comprehensive API for managing healthcare operations including:\n\n- **Patient Management**: Complete patient lifecycle management\n- **Appointment Scheduling**: Advanced scheduling with availability management\n- **Doctor Management**: Doctor profiles, specialties, and availability\n- **Clinic Operations**: Multi-clinic support with location-based services\n- **Payment Processing**: Integrated payment processing with Stripe\n- **Communication**: WhatsApp integration for patient communication\n- **Calendar Integration**: Google Calendar synchronization\n- **Analytics & Reporting**: Comprehensive analytics and reporting\n\n## Authentication\n\nThis API uses API Key authentication. Include your API key in the `X-API-Key` header:\n\n```\nX-API-Key: your-api-key-here\n```\n\n## Rate Limiting\n\nAPI requests are rate limited to ensure fair usage:\n\n- **Free tier**: 100 requests per hour\n- **Pro tier**: 1,000 requests per hour\n- **Enterprise tier**: 10,000 requests per hour\n\n## Error Handling\n\nThe API uses standard HTTP status codes and returns detailed error information:\n\n- **400**: Bad Request - Invalid request parameters\n- **401**: Unauthorized - Invalid or missing API key\n- **403**: Forbidden - Insufficient permissions\n- **404**: Not Found - Resource not found\n- **429**: Too Many Requests - Rate limit exceeded\n- **500**: Internal Server Error - Server error\n\n## Pagination\n\nList endpoints support pagination using `page` and `limit` parameters:\n\n- `page`: Page number (default: 1)\n- `limit`: Items per page (default: 20, max: 100)\n\n## Webhooks\n\nThe API supports webhooks for real-time notifications. Configure webhook endpoints in your dashboard.\n    ".trim();
  /**
   * Generate servers configuration
   */
  OpenApiDocumentationGenerator.prototype.generateServers = function () {
    var servers = [
      {
        url: this.config.baseUrl,
        description: "".concat(this.config.environment, " server"),
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
  };
  /**
   * Generate paths from routes
   */
  OpenApiDocumentationGenerator.prototype.generatePaths = function (routes) {
    var paths = {};
    for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
      var route = routes_1[_i];
      var pathKey = this.convertPathToOpenApi(route.path);
      var methodKey = route.method.toLowerCase();
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }
      paths[pathKey][methodKey] = this.generatePathOperation(route);
    }
    return paths;
  };
  /**
   * Convert path parameters to OpenAPI format
   */
  OpenApiDocumentationGenerator.prototype.convertPathToOpenApi = (path) =>
    path.replace(/:([^/]+)/g, "{$1}");
  /**
   * Generate path operation for a route
   */
  OpenApiDocumentationGenerator.prototype.generatePathOperation = function (route) {
    var operation = {
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
  };
  /**
   * Generate operation ID
   */
  OpenApiDocumentationGenerator.prototype.generateOperationId = function (route) {
    var method = route.method.toLowerCase();
    var pathParts = route.path.split("/").filter((part) => part && !part.startsWith(":"));
    var resource = pathParts[pathParts.length - 1] || "root";
    return "".concat(method).concat(this.capitalize(resource));
  };
  /**
   * Generate parameters
   */
  OpenApiDocumentationGenerator.prototype.generateParameters = (parameters) =>
    parameters.map((param) => ({
      name: param.name,
      in: param.in,
      description: param.description,
      required: param.required,
      schema: param.schema,
      example: param.example,
    }));
  /**
   * Generate request body
   */
  OpenApiDocumentationGenerator.prototype.generateRequestBody = (route) => {
    var requestBodyParam = route.documentation.parameters.find((p) => p.in === "body");
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
  };
  /**
   * Generate responses
   */
  OpenApiDocumentationGenerator.prototype.generateResponses = (responses) => {
    var formattedResponses = {};
    for (var _i = 0, responses_1 = responses; _i < responses_1.length; _i++) {
      var response = responses_1[_i];
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
  };
  /**
   * Generate components
   */
  OpenApiDocumentationGenerator.prototype.generateComponents = function () {
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
  };
  /**
   * Generate tags from routes
   */
  OpenApiDocumentationGenerator.prototype.generateTags = function (routes) {
    var tagMap = new Map();
    // Collect unique tags
    for (var _i = 0, routes_2 = routes; _i < routes_2.length; _i++) {
      var route = routes_2[_i];
      for (var _a = 0, _b = route.documentation.tags; _a < _b.length; _a++) {
        var tag = _b[_a];
        if (!tagMap.has(tag)) {
          tagMap.set(tag, this.generateTagDescription(tag));
        }
      }
    }
    return Array.from(tagMap.entries()).map((_a) => {
      var name = _a[0],
        description = _a[1];
      return {
        name: name,
        description: description,
      };
    });
  };
  /**
   * Generate tag description
   */
  OpenApiDocumentationGenerator.prototype.generateTagDescription = function (tag) {
    var descriptions = {
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
    return descriptions[tag.toLowerCase()] || "".concat(this.capitalize(tag), " operations");
  };
  /**
   * Generate security schemes
   */
  OpenApiDocumentationGenerator.prototype.generateSecurity = () => [{ ApiKeyAuth: [] }];
  /**
   * Format examples
   */
  OpenApiDocumentationGenerator.prototype.formatExamples = (examples) => {
    var formatted = {};
    for (var _i = 0, examples_1 = examples; _i < examples_1.length; _i++) {
      var example = examples_1[_i];
      formatted[example.name] = {
        summary: example.summary,
        description: example.description,
        value: example.value,
      };
    }
    return formatted;
  };
  /**
   * Add custom schema
   */
  OpenApiDocumentationGenerator.prototype.addSchema = function (name, schema) {
    this.customSchemas.set(name, schema);
  };
  /**
   * Add custom example
   */
  OpenApiDocumentationGenerator.prototype.addExample = function (name, example) {
    this.customExamples.set(name, example);
  };
  /**
   * Capitalize string
   */
  OpenApiDocumentationGenerator.prototype.capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);
  return OpenApiDocumentationGenerator;
})();
exports.OpenApiDocumentationGenerator = OpenApiDocumentationGenerator;
/**
 * Documentation Middleware
 * Automatically generates documentation for routes
 */
var DocumentationMiddleware = /** @class */ (() => {
  function DocumentationMiddleware(config) {
    this.routes = [];
    this.generator = new OpenApiDocumentationGenerator(config);
  }
  /**
   * Register route for documentation
   */
  DocumentationMiddleware.prototype.registerRoute = function (route) {
    this.routes.push(route);
  };
  /**
   * Generate documentation
   */
  DocumentationMiddleware.prototype.generateDocumentation = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.generator.generateDocumentation(this.routes)];
      });
    });
  };
  /**
   * Get documentation as JSON
   */
  DocumentationMiddleware.prototype.getDocumentationJson = function () {
    return __awaiter(this, void 0, void 0, function () {
      var documentation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.generateDocumentation()];
          case 1:
            documentation = _a.sent();
            return [2 /*return*/, JSON.stringify(documentation, null, 2)];
        }
      });
    });
  };
  /**
   * Get documentation as YAML
   */
  DocumentationMiddleware.prototype.getDocumentationYaml = function () {
    return __awaiter(this, void 0, void 0, function () {
      var documentation;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.generateDocumentation()];
          case 1:
            documentation = _a.sent();
            return [2 /*return*/, this.jsonToYaml(documentation)];
        }
      });
    });
  };
  /**
   * Simple JSON to YAML converter
   */
  DocumentationMiddleware.prototype.jsonToYaml = function (obj, indent) {
    if (indent === void 0) {
      indent = 0;
    }
    var spaces = "  ".repeat(indent);
    var yaml = "";
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      if (value === null || value === undefined) {
        yaml += "".concat(spaces).concat(key, ": null\n");
      } else if (typeof value === "object" && !Array.isArray(value)) {
        yaml += "".concat(spaces).concat(key, ":\n");
        yaml += this.jsonToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += "".concat(spaces).concat(key, ":\n");
        for (var _c = 0, value_1 = value; _c < value_1.length; _c++) {
          var item = value_1[_c];
          if (typeof item === "object") {
            yaml += "".concat(spaces, "  -\n");
            yaml += this.jsonToYaml(item, indent + 2);
          } else {
            yaml += "".concat(spaces, "  - ").concat(item, "\n");
          }
        }
      } else if (typeof value === "string") {
        yaml += "".concat(spaces).concat(key, ': "').concat(value, '"\n');
      } else {
        yaml += "".concat(spaces).concat(key, ": ").concat(value, "\n");
      }
    }
    return yaml;
  };
  return DocumentationMiddleware;
})();
exports.DocumentationMiddleware = DocumentationMiddleware;
/**
 * Documentation Route Builder
 * Helper for building route documentation
 */
var DocumentationRouteBuilder = /** @class */ (() => {
  function DocumentationRouteBuilder() {
    this.route = {
      documentation: {
        summary: "",
        description: "",
        tags: [],
        parameters: [],
        responses: [],
        examples: [],
      },
    };
  }
  /**
   * Set route basic info
   */
  DocumentationRouteBuilder.prototype.setRoute = function (id, path, method) {
    this.route.id = id;
    this.route.path = path;
    this.route.method = method;
    return this;
  };
  /**
   * Set summary
   */
  DocumentationRouteBuilder.prototype.setSummary = function (summary) {
    this.route.documentation.summary = summary;
    return this;
  };
  /**
   * Set description
   */
  DocumentationRouteBuilder.prototype.setDescription = function (description) {
    this.route.documentation.description = description;
    return this;
  };
  /**
   * Add tag
   */
  DocumentationRouteBuilder.prototype.addTag = function (tag) {
    this.route.documentation.tags.push(tag);
    return this;
  };
  /**
   * Add parameter
   */
  DocumentationRouteBuilder.prototype.addParameter = function (parameter) {
    this.route.documentation.parameters.push(parameter);
    return this;
  };
  /**
   * Add response
   */
  DocumentationRouteBuilder.prototype.addResponse = function (response) {
    this.route.documentation.responses.push(response);
    return this;
  };
  /**
   * Add example
   */
  DocumentationRouteBuilder.prototype.addExample = function (example) {
    this.route.documentation.examples.push(example);
    return this;
  };
  /**
   * Set authentication requirements
   */
  DocumentationRouteBuilder.prototype.setAuthentication = function (required, roles, permissions) {
    this.route.authentication = {
      required: required,
      roles: roles || [],
      permissions: permissions || [],
    };
    return this;
  };
  /**
   * Set rate limiting
   */
  DocumentationRouteBuilder.prototype.setRateLimit = function (maxRequests, windowMs) {
    this.route.rateLimit = {
      maxRequests: maxRequests,
      windowMs: windowMs,
    };
    return this;
  };
  /**
   * Build the route
   */
  DocumentationRouteBuilder.prototype.build = function () {
    if (!this.route.id || !this.route.path || !this.route.method) {
      throw new Error("Route id, path, and method are required");
    }
    return this.route;
  };
  return DocumentationRouteBuilder;
})();
exports.DocumentationRouteBuilder = DocumentationRouteBuilder;
