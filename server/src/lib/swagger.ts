import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GSDAP API',
      version: '1.0.0',
      description: 'Learning aggregation platform API — bringing Coursera, Google, Microsoft, NVIDIA and TVET into one place.',
      contact: {
        name: 'GSDAP',
        url: 'https://gsdap.org',
        email: 'api@gsdap.org',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.gsdap.org', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.ts', './src/routes/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
