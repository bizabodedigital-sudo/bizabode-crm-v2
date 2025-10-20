import { z } from 'zod'

// API endpoint documentation
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters?: {
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }
  responses: {
    [statusCode: number]: {
      description: string
      schema?: any
    }
  }
  examples?: {
    request?: any
    response?: any
  }
  security?: {
    required: boolean
    type: 'bearer' | 'api-key' | 'none'
  }
}

// API documentation generator
export class ApiDocumentation {
  private static instance: ApiDocumentation
  private endpoints: Map<string, ApiEndpoint> = new Map()
  
  static getInstance(): ApiDocumentation {
    if (!ApiDocumentation.instance) {
      ApiDocumentation.instance = new ApiDocumentation()
    }
    return ApiDocumentation.instance
  }
  
  addEndpoint(endpoint: ApiEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`
    this.endpoints.set(key, endpoint)
  }
  
  getEndpoint(method: string, path: string): ApiEndpoint | undefined {
    const key = `${method}:${path}`
    return this.endpoints.get(key)
  }
  
  getAllEndpoints(): ApiEndpoint[] {
    return Array.from(this.endpoints.values())
  }
  
  generateOpenAPISpec(): any {
    const endpoints = this.getAllEndpoints()
    
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Bizabode CRM API',
        version: '1.0.0',
        description: 'Comprehensive CRM and inventory management API'
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string', example: 'Error message' },
              errors: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } }
            }
          },
          Success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    }
    
    // Group endpoints by path
    const pathGroups: Record<string, any> = {}
    
    for (const endpoint of endpoints) {
      if (!pathGroups[endpoint.path]) {
        pathGroups[endpoint.path] = {}
      }
      
      pathGroups[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        parameters: this.generateParameters(endpoint),
        requestBody: this.generateRequestBody(endpoint),
        responses: this.generateResponses(endpoint),
        security: this.generateSecurity(endpoint)
      }
    }
    
    spec.paths = pathGroups
    
    return spec
  }
  
  private generateParameters(endpoint: ApiEndpoint): any[] {
    const parameters: any[] = []
    
    if (endpoint.parameters?.query) {
      for (const [name, schema] of Object.entries(endpoint.parameters.query)) {
        parameters.push({
          name,
          in: 'query',
          required: schema.required || false,
          schema: this.zodToOpenAPI(schema)
        })
      }
    }
    
    return parameters
  }
  
  private generateRequestBody(endpoint: ApiEndpoint): any {
    if (!endpoint.parameters?.body) {
      return undefined
    }
    
    return {
      required: true,
      content: {
        'application/json': {
          schema: this.zodToOpenAPI(endpoint.parameters.body)
        }
      }
    }
  }
  
  private generateResponses(endpoint: ApiEndpoint): any {
    const responses: any = {}
    
    for (const [statusCode, response] of Object.entries(endpoint.responses)) {
      responses[statusCode] = {
        description: response.description,
        content: response.schema ? {
          'application/json': {
            schema: this.zodToOpenAPI(response.schema)
          }
        } : undefined
      }
    }
    
    return responses
  }
  
  private generateSecurity(endpoint: ApiEndpoint): any[] {
    if (!endpoint.security?.required) {
      return []
    }
    
    return [{
      bearerAuth: endpoint.security.type === 'bearer' ? [] : undefined,
      apiKey: endpoint.security.type === 'api-key' ? [] : undefined
    }]
  }
  
  private zodToOpenAPI(schema: any): any {
    if (schema instanceof z.ZodSchema) {
      // Convert Zod schema to OpenAPI schema
      return this.convertZodToOpenAPI(schema)
    }
    
    return schema
  }
  
  private convertZodToOpenAPI(schema: any): any {
    // Basic Zod to OpenAPI conversion
    if (schema._def.typeName === 'ZodString') {
      return { type: 'string' }
    }
    
    if (schema._def.typeName === 'ZodNumber') {
      return { type: 'number' }
    }
    
    if (schema._def.typeName === 'ZodBoolean') {
      return { type: 'boolean' }
    }
    
    if (schema._def.typeName === 'ZodArray') {
      return {
        type: 'array',
        items: this.convertZodToOpenAPI(schema._def.type)
      }
    }
    
    if (schema._def.typeName === 'ZodObject') {
      const properties: any = {}
      const required: string[] = []
      
      for (const [key, value] of Object.entries(schema._def.shape())) {
        properties[key] = this.convertZodToOpenAPI(value)
        if (value._def.required !== false) {
          required.push(key)
        }
      }
      
      return {
        type: 'object',
        properties,
        required
      }
    }
    
    return { type: 'string' }
  }
  
  generateMarkdown(): string {
    const endpoints = this.getAllEndpoints()
    
    let markdown = '# Bizabode CRM API Documentation\n\n'
    
    // Group by module
    const modules: Record<string, ApiEndpoint[]> = {}
    
    for (const endpoint of endpoints) {
      const module = endpoint.path.split('/')[2] || 'general'
      if (!modules[module]) {
        modules[module] = []
      }
      modules[module].push(endpoint)
    }
    
    for (const [module, moduleEndpoints] of Object.entries(modules)) {
      markdown += `## ${module.charAt(0).toUpperCase() + module.slice(1)} Module\n\n`
      
      for (const endpoint of moduleEndpoints) {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`
        markdown += `${endpoint.description}\n\n`
        
        if (endpoint.parameters?.query) {
          markdown += '**Query Parameters:**\n'
          for (const [name, schema] of Object.entries(endpoint.parameters.query)) {
            markdown += `- \`${name}\`: ${schema.description || 'No description'}\n`
          }
          markdown += '\n'
        }
        
        if (endpoint.parameters?.body) {
          markdown += '**Request Body:**\n'
          markdown += '```json\n'
          markdown += JSON.stringify(endpoint.examples?.request || {}, null, 2)
          markdown += '\n```\n\n'
        }
        
        markdown += '**Responses:**\n'
        for (const [statusCode, response] of Object.entries(endpoint.responses)) {
          markdown += `- \`${statusCode}\`: ${response.description}\n`
        }
        markdown += '\n'
        
        if (endpoint.examples?.response) {
          markdown += '**Example Response:**\n'
          markdown += '```json\n'
          markdown += JSON.stringify(endpoint.examples.response, null, 2)
          markdown += '\n```\n\n'
        }
        
        markdown += '---\n\n'
      }
    }
    
    return markdown
  }
}

// Predefined API endpoints
export const predefinedEndpoints: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user with email and password',
    parameters: {
      body: {
        email: { type: 'string', required: true, description: 'User email' },
        password: { type: 'string', required: true, description: 'User password' }
      }
    },
    responses: {
      200: { description: 'Login successful', schema: { type: 'object' } },
      400: { description: 'Invalid credentials', schema: { type: 'object' } },
      401: { description: 'Authentication failed', schema: { type: 'object' } }
    },
    examples: {
      request: { email: 'admin@example.com', password: 'password123' },
      response: { success: true, token: 'jwt-token', user: { id: '1', email: 'admin@example.com' } }
    },
    security: { required: false, type: 'none' }
  },
  {
    method: 'GET',
    path: '/api/leads',
    description: 'Get all leads with optional filtering',
    parameters: {
      query: {
        page: { type: 'number', required: false, description: 'Page number' },
        limit: { type: 'number', required: false, description: 'Items per page' },
        status: { type: 'string', required: false, description: 'Lead status filter' }
      }
    },
    responses: {
      200: { description: 'Leads retrieved successfully', schema: { type: 'array' } },
      401: { description: 'Unauthorized', schema: { type: 'object' } }
    },
    security: { required: true, type: 'bearer' }
  }
]

// Initialize documentation
export function initializeApiDocumentation(): void {
  const doc = ApiDocumentation.getInstance()
  
  for (const endpoint of predefinedEndpoints) {
    doc.addEndpoint(endpoint)
  }
}
