import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import registerModules from './modules/index.js';
import env from './config/env.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.js';

function createApp() {
  const app = express();

  const corsOptions = {
    origin: env.corsAllowedOrigins,
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json());
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => {
          logger.http?.(message.trim()) || logger.info(message.trim());
        },
      },
    })
  );

  const docsRouter = express.Router();

  docsRouter.use(cors(corsOptions));
  docsRouter.use((req, res, next) => {
    logger.info('Swagger docs accessed', {
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    });
    next();
  });
  docsRouter.get('/swagger.json', (req, res) => {
    res.json(swaggerSpec);
  });
  docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  app.use('/docs', docsRouter);

  registerModules(app, env.apiPrefix);

  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Udoy server is running' });
  });

  app.use(errorHandler);

  return app;
}

export default createApp;
