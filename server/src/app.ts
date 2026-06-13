import cors from 'cors';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { getHealthStatus } from './modules/health/service.js';
import { createContext } from './trpc/context.js';
import { appRouter } from './trpc/router.js';
import { env } from './env.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json(getHealthStatus());
  });

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}
