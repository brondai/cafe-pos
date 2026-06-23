import { router } from './init.js';
import { healthRouter } from '../modules/health/router.js';
import { orderRouter } from '../modules/order/router.js';

export const appRouter = router({
  health: healthRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
