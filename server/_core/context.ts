import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Development mode: bypass authentication
  if (process.env.NODE_ENV === 'development') {
    const { getUser } = await import('../db');
    const devUser = await getUser('default-owner-openid');
    if (devUser) {
      console.log('[Auth] Using development user:', devUser.email);
      return {
        req: opts.req,
        res: opts.res,
        user: devUser,
      };
    }
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
