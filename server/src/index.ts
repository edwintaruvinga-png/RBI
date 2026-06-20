import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'market-intel-server',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);

// 404 + centralised error handling (must be registered last).
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
