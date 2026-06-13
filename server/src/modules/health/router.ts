import { publicProcedure, router } from '../../trpc/init.js';
import { healthStatusSchema } from './schema.js';
import { getHealthStatus } from './service.js';

export const healthRouter = router({
  check: publicProcedure.output(healthStatusSchema).query(() => getHealthStatus()),
});
