import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const TEST_SECRET = "test-config-secret-16char";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: TEST_SECRET }))
  .get("/sign", async ({ jwt }) => {
    return await jwt.sign({ id: "test-user", isUnraidUser: true });
  })
  .guard({
    beforeHandle: async ({ jwt, headers, set }) => {
      const auth = headers.authorization;
      if (!auth?.startsWith("Bearer ")) {
        set.status = 401;
        return { success: false, payload: ["Unauthorized"] };
      }
      const token = auth.slice(7);
      const payload = await jwt.verify(token);
      if (!payload) {
        set.status = 401;
        return { success: false, payload: ["Invalid token"] };
      }
    },
    resolve: ({ headers }) => {
      const token = headers.authorization!.slice(7);
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));
      return {
        user: { id: payload.id as string, isUnraidUser: payload.isUnraidUser as boolean },
      };
    },
  })
  .get("/api/v1/config", ({ user }) => {
    return { success: true, payload: { unraidBaseUrl: "http://test-unraid:80", userId: user.id } };
  });

describe('Config Endpoint', () => {
  it('rejects requests without Authorization header', async () => {
    const res = await app.handle(new Request("http://localhost/api/v1/config"));
    expect(res.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/config", {
        headers: { Authorization: "Bearer invalid-token" },
      })
    );
    expect(res.status).toBe(401);
  });

  it('accepts valid Bearer token and returns config with user context', async () => {
    const signRes = await app.handle(new Request("http://localhost/sign"));
    const token = await signRes.text();

    const res = await app.handle(
      new Request("http://localhost/api/v1/config", {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.payload.unraidBaseUrl).toBe("http://test-unraid:80");
    expect(body.payload.userId).toBe("test-user");
  });
});
