import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../config.js";

export const authGuard = (app: Elysia) =>
  app
    .use(jwt({
      name: "jwt",
      secret: config.jwt.secret,
    }))
    .guard({
      beforeHandle: async ({ jwt, headers, set, unraidClient }) => {
        const auth = headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
          set.status = 401;
          return { success: false, payload: ["Bearer token not provided in Authorization header"] };
        }
        const token = auth.slice(7);
        const payload = await jwt.verify(token);
        if (!payload) {
          set.status = 401;
          return { success: false, payload: ["Token has expired or is invalid"] };
        }
        try { await unraidClient.login(); } catch { /* Unraid unreachable, proceed anyway */ }
      },
      resolve: ({ headers }) => {
        const auth = headers.authorization!;
        const token = auth.slice(7);
        const parts = token.split(".");
        const payload = JSON.parse(atob(parts[1]));
        return {
          user: { id: payload.id as string, isUnraidUser: payload.isUnraidUser as boolean },
        };
      },
    });
