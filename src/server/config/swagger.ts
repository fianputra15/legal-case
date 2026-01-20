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
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and session management'
      },
      {
        name: 'Cases',
        description: 'Legal case management operations'
      },
      {
        name: 'Documents',
        description: 'Document upload and management for legal cases'
      },
      {
        name: 'Messages',
        description: 'Communication and messaging within cases'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      }
    ],
    components: {
      securitySchemes: {
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session-id',
          description: 'HttpOnly session cookie set automatically after login'
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
              enum: ['CLIENT', 'LAWYER'],
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
        Document: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cldoc789xyz'
            },
            caseId: {
              type: 'string',
              example: 'clcase123abc'
            },
            originalName: {
              type: 'string',
              example: 'contract-v2.pdf',
              description: 'Original filename from user upload'
            },
            storedName: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
              description: 'UUID-based secure filename'
            },
            relativePath: {
              type: 'string',
              example: 'documents/cl/clcase123abc/uuid.pdf',
              description: 'Relative path from storage root'
            },
            size: {
              type: 'integer',
              example: 2048576,
              description: 'File size in bytes'
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf',
              description: 'Validated MIME type'
            },
            documentType: {
              type: 'string',
              enum: ['CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'LEGAL_BRIEF', 'COURT_FILING', 'IDENTIFICATION', 'FINANCIAL_RECORD', 'OTHER'],
              example: 'CONTRACT'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSED', 'ARCHIVED', 'DELETED'],
              example: 'PENDING'
            },
            checksum: {
              type: 'string',
              example: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
              description: 'SHA-256 hash for integrity verification'
            },
            uploadedById: {
              type: 'string',
              example: 'cluser123xyz'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-18T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-18T10:30:00.000Z'
            }
          },
          required: ['id', 'caseId', 'originalName', 'storedName', 'relativePath', 'size', 'mimeType', 'documentType', 'status', 'uploadedById', 'createdAt', 'updatedAt']
        },
        DocumentUpload: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Document file to upload (PDF, DOCX, PNG, JPEG)'
            },
            documentType: {
              type: 'string',
              enum: ['CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'LEGAL_BRIEF', 'COURT_FILING', 'IDENTIFICATION', 'FINANCIAL_RECORD', 'OTHER'],
              default: 'OTHER',
              description: 'Type of document being uploaded'
            }
          },
          required: ['file']
        },
        DocumentResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cldoc789xyz'
            },
            originalName: {
              type: 'string',
              example: 'contract-v2.pdf'
            },
            size: {
              type: 'integer',
              example: 2048576
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf'
            },
            documentType: {
              type: 'string',
              example: 'CONTRACT'
            },
            status: {
              type: 'string',
              example: 'PENDING'
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-18T10:30:00.000Z'
            },
            uploadedBy: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'user123'
                },
                name: {
                  type: 'string',
                  example: 'John Smith'
                }
              }
            }
          }
        },
        DocumentUploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/DocumentResponse'
            },
            message: {
              type: 'string',
              example: 'Document uploaded successfully'
            }
          }
        },
        Document: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cldoc789xyz'
            },
            caseId: {
              type: 'string',
              example: 'clcase123abc'
            },
            originalName: {
              type: 'string',
              example: 'contract-v2.pdf',
              description: 'Original filename from user upload'
            },
            storedName: {
              type: 'string',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf',
              description: 'UUID-based secure filename'
            },
            relativePath: {
              type: 'string',
              example: 'documents/cl/clcase123abc/uuid.pdf',
              description: 'Relative path from storage root'
            },
            size: {
              type: 'integer',
              example: 2048576,
              description: 'File size in bytes'
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf',
              description: 'Validated MIME type'
            },
            documentType: {
              type: 'string',
              enum: ['CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'LEGAL_BRIEF', 'COURT_FILING', 'IDENTIFICATION', 'FINANCIAL_RECORD', 'OTHER'],
              example: 'CONTRACT'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSED', 'ARCHIVED', 'DELETED'],
              example: 'PENDING'
            },
            checksum: {
              type: 'string',
              example: 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
              description: 'SHA-256 hash for integrity verification'
            },
            uploadedById: {
              type: 'string',
              example: 'cluser123xyz'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-18T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-18T10:30:00.000Z'
            }
          },
          required: ['id', 'caseId', 'originalName', 'storedName', 'relativePath', 'size', 'mimeType', 'documentType', 'status', 'uploadedById', 'createdAt', 'updatedAt']
        },
        // DocumentUpload: {
        //   type: 'object',
        //   properties: {
        //     file: {
        //       type: 'string',
        //       format: 'binary',
        //       description: 'Document file to upload (PDF, DOCX, PNG, JPEG)'
        //     },
        //     documentType: {
        //       type: 'string',
        //       enum: ['CONTRACT', 'EVIDENCE', 'CORRESPONDENCE', 'LEGAL_BRIEF', 'COURT_FILING', 'IDENTIFICATION', 'FINANCIAL_RECORD', 'OTHER'],
        //       default: 'OTHER',
        //       description: 'Type of document being uploaded'
        //     }
        //   },
        //   required: ['file']
        // },
        // DocumentResponse: {
        //   type: 'object',
        //   properties: {
        //     id: {
        //       type: 'string',
        //       example: 'cldoc789xyz'
        //     },
        //     originalName: {
        //       type: 'string',
        //       example: 'contract-v2.pdf'
        //     },
        //     size: {
        //       type: 'integer',
        //       example: 2048576
        //     },
        //     mimeType: {
        //       type: 'string',
        //       example: 'application/pdf'
        //     },
        //     documentType: {
        //       type: 'string',
        //       example: 'CONTRACT'
        //     },
        //     status: {
        //       type: 'string',
        //       example: 'PENDING'
        //     },
        //     uploadedAt: {
        //       type: 'string',
        //       format: 'date-time',
        //       example: '2026-01-18T10:30:00.000Z'
        //     },
        //     uploadedBy: {
        //       type: 'object',
        //       properties: {
        //         id: {
        //           type: 'string',
        //           example: 'user123'
        //         },
        //         name: {
        //           type: 'string',
        //           example: 'John Smith'
        //         }
        //       }
        //     }
        //   }
        // },
        // DocumentUploadResponse: {
        //   type: 'object',
        //   properties: {
        //     success: {
        //       type: 'boolean',
        //       example: true
        //     },
        //     data: {
        //       $ref: '#/components/schemas/DocumentResponse'
        //     },
        //     message: {
        //       type: 'string',
        //       example: 'Document uploaded successfully'
        //     }
        //   }
        // },
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
        },
        DocumentUploadError: {
          description: 'Document upload validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                invalid_file_type: {
                  summary: 'Invalid file type',
                  value: {
                    success: false,
                    error: {
                      code: 'BAD_REQUEST',
                      message: "File type 'application/exe' not allowed. Supported types: PDF, DOCX, PNG, JPEG"
                    }
                  }
                },
                file_too_large: {
                  summary: 'File too large',
                  value: {
                    success: false,
                    error: {
                      code: 'BAD_REQUEST',
                      message: 'File size 30MB exceeds maximum allowed size of 25MB'
                    }
                  }
                },
                no_file_provided: {
                  summary: 'No file provided',
                  value: {
                    success: false,
                    error: {
                      code: 'BAD_REQUEST',
                      message: 'No file provided - field name must be "file"'
                    }
                  }
                },
                case_access_denied: {
                  summary: 'Case access denied',
                  value: {
                    success: false,
                    error: {
                      code: 'NOT_FOUND',
                      message: 'Case not found or access denied'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        CookieAuth: []
      }
    ]
  },
  apis: ['./app/api/**/*.ts', './src/server/examples/*.ts'], // Path to API files for JSDoc comments
};

export const swaggerSpec = swaggerJSDoc(options);