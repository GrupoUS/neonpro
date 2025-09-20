/**
 * OpenAPI types for healthcare applications
 * Provides the missing OpenAPIV3_1 types
 */

// Document interface
export interface OpenAPIDocument {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}

// Info Object
export interface InfoObject {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}

// Contact Object
export interface ContactObject {
  name?: string;
  url?: string;
  email?: string;
}

// License Object
export interface LicenseObject {
  name: string;
  url?: string;
}

// Server Object
export interface ServerObject {
  url: string;
  description?: string;
  variables?: ServerVariableObject;
}

// Server Variable Object
export interface ServerVariableObject {
  enum?: string[];
  default: string;
  description?: string;
}

// Paths Object
export interface PathsObject {
  [path: string]: PathItemObject | undefined;
}

// Path Item Object
export interface PathItemObject {
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: ParameterObject[] | ReferenceObject;
}

// Operation Object
export interface OperationObject {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: ParameterObject[] | ReferenceObject;
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: ResponsesObject;
  callbacks?: CallbacksObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}

// External Documentation Object
export interface ExternalDocumentationObject {
  description?: string;
  url: string;
}

// Parameter Object
export interface ParameterObject {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema: SchemaObject | ReferenceObject;
  example?: any;
  examples?: ExampleObject[] | ReferenceObject;
  content?: ContentObject;
}

// Request Body Object
export interface RequestBodyObject {
  description?: string;
  content: ContentObject;
  required?: boolean;
}

// Content Object
export interface ContentObject {
  [mediaType: string]: MediaTypeObject;
}

// Media Type Object
export interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject;
  example?: any;
  examples?: ExampleObject[] | ReferenceObject;
  encoding?: EncodingObject;
}

// Encoding Object
export interface EncodingObject {
  contentType?: string;
  headers?: HeaderObject[] | ReferenceObject;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
}

// Responses Object
export interface ResponsesObject {
  [responseCode: string]: ResponseObject | ReferenceObject;
}

// Response Object
export interface ResponseObject {
  description: string;
  headers?: HeaderObject[] | ReferenceObject;
  content?: ContentObject;
  links?: LinkObject[] | ReferenceObject;
}

// Header Object
export interface HeaderObject {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema: SchemaObject | ReferenceObject;
  example?: any;
  examples?: ExampleObject[] | ReferenceObject;
}

// Example Object
export interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
}

// Link Object
export interface LinkObject {
  operationRef?: string;
  operationId?: string;
  parameters?: LinkParametersObject;
  requestBody?: any | string;
  description?: string;
  server?: ServerObject;
}

// Link Parameters Object
export interface LinkParametersObject {
  [parameter: string]: any | string;
}

// Callback Object
export interface CallbackObject {
  [expression: string]: PathItemObject | ReferenceObject;
}

// Callbacks Object
export interface CallbacksObject {
  [callbackName: string]: CallbackObject | ReferenceObject;
}

// Security Requirement Object
export interface SecurityRequirementObject {
  [securitySchemeName: string]: string[];
}

// Components Object
export interface ComponentsObject {
  schemas?: SchemasObject;
  responses?: ResponsesObject;
  parameters?: ParametersObject;
  examples?: ExamplesObject;
  requestBodies?: RequestBodiesObject;
  headers?: HeadersObject;
  securitySchemes?: SecuritySchemesObject;
  links?: LinksObject;
  callbacks?: CallbacksObject;
}

// Schemas Object
export interface SchemasObject {
  [schemaName: string]: SchemaObject | ReferenceObject;
}

// Responses Object (for components)
export interface ComponentsResponsesObject {
  [responseName: string]: ResponseObject | ReferenceObject;
}

// Parameters Object (for components)
export interface ParametersObject {
  [parameterName: string]: ParameterObject | ReferenceObject;
}

// Examples Object (for components)
export interface ExamplesObject {
  [exampleName: string]: ExampleObject | ReferenceObject;
}

// Request Bodies Object (for components)
export interface RequestBodiesObject {
  [requestBodyName: string]: RequestBodyObject | ReferenceObject;
}

// Headers Object (for components)
export interface HeadersObject {
  [headerName: string]: HeaderObject | ReferenceObject;
}

// Security Schemes Object
export interface SecuritySchemesObject {
  [securitySchemeName: string]: SecuritySchemeObject | ReferenceObject;
}

// Links Object (for components)
export interface LinksObject {
  [linkName: string]: LinkObject | ReferenceObject;
}

// Callbacks Object (for components)
export interface ComponentsCallbacksObject {
  [callbackName: string]: CallbackObject | ReferenceObject;
}

// Schema Object
export interface SchemaObject {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean;
  minimum?: number;
  exclusiveMinimum?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  type?: string | string[];
  allOf?: SchemaObject[] | ReferenceObject[];
  anyOf?: SchemaObject[] | ReferenceObject[];
  oneOf?: SchemaObject[] | ReferenceObject[];
  not?: SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  properties?: PropertiesObject;
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  description?: string;
  format?: string;
  default?: any;
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XmlObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  deprecated?: boolean;
}

// Properties Object
export interface PropertiesObject {
  [propertyName: string]: SchemaObject | ReferenceObject;
}

// Discriminator Object
export interface DiscriminatorObject {
  propertyName: string;
  mapping?: MappingObject;
}

// Mapping Object
export interface MappingObject {
  [name: string]: string;
}

// XML Object
export interface XmlObject {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}

// Security Scheme Object
export interface SecuritySchemeObject {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect' | 'mutualTLS';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

// OAuth Flows Object
export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

// OAuth Flow Object
export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: ScopesObject;
}

// Scopes Object
export interface ScopesObject {
  [scopeName: string]: string;
}

// Tag Object
export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

// Reference Object
export interface ReferenceObject {
  $ref: string;
  summary?: string;
  description?: string;
}

// Export namespace for OpenAPI v3.1
export const OpenAPIV3_1 = {
  Document: {} as OpenAPIDocument,
  Info: {} as InfoObject,
  Contact: {} as ContactObject,
  License: {} as LicenseObject,
  Server: {} as ServerObject,
  ServerVariable: {} as ServerVariableObject,
  Paths: {} as PathsObject,
  PathItem: {} as PathItemObject,
  Operation: {} as OperationObject,
  ExternalDocumentation: {} as ExternalDocumentationObject,
  Parameter: {} as ParameterObject,
  RequestBody: {} as RequestBodyObject,
  Content: {} as ContentObject,
  MediaType: {} as MediaTypeObject,
  Encoding: {} as EncodingObject,
  Responses: {} as ResponsesObject,
  Response: {} as ResponseObject,
  Header: {} as HeaderObject,
  Example: {} as ExampleObject,
  Link: {} as LinkObject,
  LinkParameters: {} as LinkParametersObject,
  Callback: {} as CallbackObject,
  SecurityRequirement: {} as SecurityRequirementObject,
  Components: {} as ComponentsObject,
  Schemas: {} as SchemasObject,
  ComponentsResponses: {} as ComponentsResponsesObject,
  ComponentsParameters: {} as ParametersObject,
  ComponentsExamples: {} as ExamplesObject,
  ComponentsRequestBodies: {} as RequestBodiesObject,
  ComponentsHeaders: {} as HeadersObject,
  SecuritySchemes: {} as SecuritySchemesObject,
  ComponentsLinks: {} as LinksObject,
  ComponentsCallbacks: {} as ComponentsCallbacksObject,
  Schema: {} as SchemaObject,
  Properties: {} as PropertiesObject,
  Discriminator: {} as DiscriminatorObject,
  Mapping: {} as MappingObject,
  Xml: {} as XmlObject,
  SecurityScheme: {} as SecuritySchemeObject,
  OAuthFlows: {} as OAuthFlowsObject,
  OAuthFlow: {} as OAuthFlowObject,
  Scopes: {} as ScopesObject,
  Tag: {} as TagObject,
  Reference: {} as ReferenceObject,
};
