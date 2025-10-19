import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const apiTitle = 'Udoy API';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: apiTitle,
    version: '0.1.0',
    description:
      'Auto-generated OpenAPI specification for the Udoy backend. Routes are documented via JSDoc annotations located alongside each module.',
  },
  servers: [
    {
      url: env.apiPrefix,
      description: 'Relative API prefix',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Use the issued JWT access token in the `Authorization: Bearer <token>` header to access protected routes.',
      },
      refreshToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-refresh-token',
        description:
          'Alternative mechanism for supplying a refresh token when the Authorization header is absent.',
      },
    },
  },
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerUiOptions = {
  explorer: true,
  customSiteTitle: `${apiTitle} Reference`,
  swaggerOptions: {
    persistAuthorization: true,
  },
};

export default {
  swaggerSpec,
  swaggerUiOptions,
};
