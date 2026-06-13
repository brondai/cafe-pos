import { z } from 'zod';

export const authHeaderSchema = z
  .string()
  .regex(/^Bearer\s+\S+$/i)
  .optional();

export type AuthContext = {
  token: string | null;
};

export function createAuthContext(authorization: string | undefined): AuthContext {
  const parsedAuthorization = authHeaderSchema.safeParse(authorization);

  if (!parsedAuthorization.success || !parsedAuthorization.data) {
    return { token: null };
  }

  return {
    token: parsedAuthorization.data.replace(/^Bearer\s+/i, ''),
  };
}
