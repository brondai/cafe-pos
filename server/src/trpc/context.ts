import type * as trpcExpress from '@trpc/server/adapters/express';
import { createAuthContext } from '../auth/context.js';
import { prisma } from '../db/client.js';

export function createContext({ req, res }: trpcExpress.CreateExpressContextOptions) {
  return {
    auth: createAuthContext(req.headers.authorization),
    db: prisma,
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
