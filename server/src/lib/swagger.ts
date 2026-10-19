import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'One Million Coders API',
      version: '1.0.0',
      description: 'Learning aggregation platform API — bringing Coursera, Google, Microsoft, NVIDIA and TVET into one place.',
      contact: {
        name: 'One Million Coders',
        url: 'https://onemillioncoders.io',
        email: 'api@onemillioncoders.io',
      },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://api.onemillioncoders.io', description: 'Production' },
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
