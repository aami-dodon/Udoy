import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { helloRoutes } from './modules/hello/hello.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/hello', helloRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(errorHandler);

export default app;
