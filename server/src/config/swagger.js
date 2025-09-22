import swaggerJSDoc from 'swagger-jsdoc';

import { env } from './env.js';

const normalizeBaseUrl = (value) => {
  const fallback = 'http://localhost:3000';
  const resolved = value && typeof value === 'string' ? value : fallback;
  return resolved.replace(/\/$/, '');
};

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Udoy API',
    version: '1.0.0',
    description: 'API documentation for the Udoy platform.'
  },
  servers: [
    {
      url: `${normalizeBaseUrl(env.app.baseUrl)}/api`,
      description: 'Application base URL'
    },
    {
      url: `http://localhost:${env.port}/api`,
      description: 'Local development'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};

const options = {
  definition,
  apis: ['src/modules/**/*.routes.js']
};

export const swaggerSpec = swaggerJSDoc(options);
