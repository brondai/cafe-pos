import { router } from './init.js';
import { healthRouter } from '../modules/health/router.js';

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
