import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { routes } from '../routes/index.js';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Udoy LMS API',
      version: '0.1.0',
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
      },
    ],
  },
  apis: ['src/modules/**/*.js'],
});

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(morgan('combined', { stream: { write: (message) => logger.info({ msg: message.trim() }) } }));

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/api', routes);

  app.use(errorHandler);
  return app;
};
