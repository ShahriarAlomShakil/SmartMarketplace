const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Marketplace API',
      version: '1.0.0',
      description: 'AI-powered marketplace for buying and selling products with intelligent negotiation features',
      termsOfService: 'https://smartmarketplace.com/terms',
      contact: {
        name: 'Smart Marketplace API Support',
        url: 'https://smartmarketplace.com/support',
        email: 'api-support@smartmarketplace.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization header using the Bearer scheme'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the user',
              example: '60d0fe4f5311236168a109ca'
            },
            username: {
              type: 'string',
              description: 'Unique username',
              example: 'johndoe123'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com'
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
              example: '/uploads/avatars/user123.jpg'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true
            },
            profile: {
              type: 'object',
              properties: {
                bio: {
                  type: 'string',
                  description: 'User biography',
                  example: 'Passionate about technology and innovation'
                },
                location: {
                  type: 'object',
                  properties: {
                    city: { type: 'string', example: 'New York' },
                    state: { type: 'string', example: 'NY' },
                    country: { type: 'string', example: 'United States' }
                  }
                },
                rating: {
                  type: 'object',
                  properties: {
                    average: { type: 'number', example: 4.5 },
                    count: { type: 'number', example: 25 }
                  }
                }
              }
            },
            stats: {
              type: 'object',
              properties: {
                totalProducts: { type: 'number', example: 10 },
                totalSales: { type: 'number', example: 5 },
                totalPurchases: { type: 'number', example: 3 },
                successfulNegotiations: { type: 'number', example: 8 }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['title', 'description', 'basePrice', 'minPrice', 'category'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the product',
              example: '60d0fe4f5311236168a109cb'
            },
            title: {
              type: 'string',
              description: 'Product title',
              example: 'iPhone 13 Pro Max'
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Brand new iPhone 13 Pro Max in excellent condition'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of image URLs',
              example: ['/uploads/products/iphone1.jpg', '/uploads/products/iphone2.jpg']
            },
            basePrice: {
              type: 'number',
              description: 'Starting price for negotiations',
              example: 1000
            },
            minPrice: {
              type: 'number',
              description: 'Minimum acceptable price',
              example: 850
            },
            category: {
              type: 'string',
              enum: ['electronics', 'clothing', 'home_garden', 'automotive', 'sports', 'books', 'toys_games', 'health_beauty', 'jewelry', 'art_collectibles', 'musical_instruments', 'other'],
              description: 'Product category',
              example: 'electronics'
            },
            condition: {
              type: 'string',
              enum: ['new', 'like_new', 'excellent', 'good', 'fair', 'poor', 'for_parts'],
              description: 'Product condition',
              example: 'like_new'
            },
            status: {
              type: 'string',
              enum: ['active', 'sold', 'expired', 'draft'],
              description: 'Product listing status',
              example: 'active'
            },
            seller: {
              type: 'string',
              description: 'Seller user ID',
              example: '60d0fe4f5311236168a109ca'
            },
            views: {
              type: 'number',
              description: 'Number of views',
              example: 45
            },
            isFeatured: {
              type: 'boolean',
              description: 'Featured product status',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation timestamp'
            }
          }
        },
        Negotiation: {
          type: 'object',
          required: ['product', 'buyer'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the negotiation',
              example: '60d0fe4f5311236168a109cc'
            },
            product: {
              type: 'string',
              description: 'Product ID being negotiated',
              example: '60d0fe4f5311236168a109cb'
            },
            buyer: {
              type: 'string',
              description: 'Buyer user ID',
              example: '60d0fe4f5311236168a109ca'
            },
            seller: {
              type: 'string',
              description: 'Seller user ID',
              example: '60d0fe4f5311236168a109cd'
            },
            status: {
              type: 'string',
              enum: ['initiated', 'in_progress', 'accepted', 'rejected', 'expired', 'cancelled'],
              description: 'Negotiation status',
              example: 'in_progress'
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sender: { type: 'string', enum: ['buyer', 'seller', 'ai'], example: 'buyer' },
                  message: { type: 'string', example: 'Would you accept $900?' },
                  priceOffer: { type: 'number', example: 900 },
                  timestamp: { type: 'string', format: 'date-time' },
                  isRead: { type: 'boolean', example: false }
                }
              }
            },
            currentOffer: {
              type: 'number',
              description: 'Current price offer',
              example: 900
            },
            finalPrice: {
              type: 'number',
              description: 'Final agreed price',
              example: 920
            },
            round: {
              type: 'number',
              description: 'Current negotiation round',
              example: 3
            },
            maxRounds: {
              type: 'number',
              description: 'Maximum allowed rounds',
              example: 5
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Negotiation creation timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'No token provided, authorization denied'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Access forbidden: insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Please provide a valid email',
                    value: 'invalid-email'
                  }
                ]
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Server Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User management and profiles'
      },
      {
        name: 'Products',
        description: 'Product listings and management'
      },
      {
        name: 'Negotiations',
        description: 'AI-powered negotiation system'
      },
      {
        name: 'System',
        description: 'System health and utilities'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './server.js'
  ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Custom CSS for Swagger UI
const customCss = `
  .swagger-ui .topbar {
    background-color: #2563eb;
  }
  .swagger-ui .topbar .download-url-wrapper {
    display: none;
  }
  .swagger-ui .info {
    margin: 50px 0;
  }
  .swagger-ui .info .title {
    color: #1e40af;
  }
  .swagger-ui .scheme-container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
`;

// Swagger UI options
const swaggerUiOptions = {
  customCss,
  customSiteTitle: 'Smart Marketplace API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
