import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import registerRoutes from './routes/index.js';
import env from './config/env.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

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

  registerRoutes(app, env.apiPrefix);

  app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Udoy server is running' });
  });

  app.use(errorHandler);

  return app;
}

export default createApp;
