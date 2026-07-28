import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const TEST_SECRET = "test-config-secret-16char";

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: TEST_SECRET }))
  .get("/api/v1/config", async ({ jwt, headers, set }) => {
    const auth = headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      set.status = 401;
      return { success: false, payload: ["Bearer token not provided"] };
    }
    const token = auth.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { success: false, payload: ["Token has expired or is invalid"] };
    }
    return { success: true, payload: { unraidBaseUrl: "http://test-unraid:80" } };
  })
  .get("/sign", async ({ jwt }) => {
    return await jwt.sign({ id: "test-user", isUnraidUser: true });
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

  it('accepts valid Bearer token and returns config', async () => {
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
  });
});
