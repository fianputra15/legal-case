/**
 * OpenAPI/Swagger Configuration
 * 
 * Defines the API specification for the Legal Case Management System
 */

import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Legal Case Management API',
      version: '1.0.0',
      description: 'REST API for managing legal cases with role-based access control',
      contact: {
        name: 'API Support',
        email: 'support@legalcase.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.legalcase.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth-token',
          description: 'HttpOnly cookie set automatically after login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx123abc456'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            role: {
              type: 'string',
              enum: ['CLIENT', 'LAWYER', 'ADMIN'],
              example: 'CLIENT'
            }
          },
          required: ['id', 'email', 'firstName', 'lastName', 'role']
        },
        Case: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx789def012'
            },
            title: {
              type: 'string',
              example: 'Contract Dispute - ABC Corp'
            },
            description: {
              type: 'string',
              example: 'Client needs assistance with contract dispute regarding service delivery terms.'
            },
            category: {
              type: 'string',
              enum: [
                'CRIMINAL_LAW',
                'CIVIL_LAW', 
                'CORPORATE_LAW',
                'FAMILY_LAW',
                'IMMIGRATION_LAW',
                'INTELLECTUAL_PROPERTY',
                'LABOR_LAW',
                'REAL_ESTATE',
                'TAX_LAW',
                'OTHER'
              ],
              example: 'CORPORATE_LAW'
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_CLIENT', 'CLOSED', 'ARCHIVED'],
              example: 'OPEN'
            },
            priority: {
              type: 'integer',
              minimum: 1,
              maximum: 4,
              example: 3,
              description: '1=Low, 2=Medium, 3=High, 4=Urgent'
            },
            ownerId: {
              type: 'string',
              example: 'clx123abc456'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-16T14:20:00Z'
            }
          },
          required: ['id', 'title', 'category', 'status', 'priority', 'ownerId', 'createdAt', 'updatedAt']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'client@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'client123'
            }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Login successful'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            data: {
              type: 'object'
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Authentication required'
            },
            message: {
              type: 'string',
              example: 'Please login to access this resource'
            }
          },
          required: ['success', 'error']
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required - missing or invalid token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: 'Authentication required',
                message: 'Please login to access this resource'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions for this action',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: 'Insufficient permissions',
                message: 'You do not have permission to perform this action'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found or access denied',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: 'Resource not found',
                message: 'The requested resource was not found'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                error: 'Internal server error',
                message: 'An unexpected error occurred'
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      },
      {
        CookieAuth: []
      }
    ]
  },
  apis: ['./app/api/**/*.ts', './src/server/examples/*.ts'], // Path to API files for JSDoc comments
};

export const swaggerSpec = swaggerJSDoc(options);