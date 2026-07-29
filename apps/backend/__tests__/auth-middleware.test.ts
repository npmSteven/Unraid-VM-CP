import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const TEST_SECRET = "test-auth-middleware-secret15+";

const makeApp = () => {
  return new Elysia()
    .use(jwt({ name: "jwt", secret: TEST_SECRET }))
    .guard({
      beforeHandle: async ({ jwt, headers, set }) => {
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
    })
    .get("/protected", ({ user }) => {
      return { success: true, user };
    });
};

describe('Auth Middleware', () => {
  it('rejects requests without Authorization header', async () => {
    const app = makeApp();
    const res = await app.handle(new Request("http://localhost/protected"));
    expect(res.status).toBe(401);
  });

  it('rejects requests with non-Bearer auth', async () => {
    const app = makeApp();
    const res = await app.handle(
      new Request("http://localhost/protected", {
        headers: { Authorization: "Basic dGVzdDp0ZXN0" },
      })
    );
    expect(res.status).toBe(401);
  });

  it('rejects invalid JWT tokens', async () => {
    const app = makeApp();
    const res = await app.handle(
      new Request("http://localhost/protected", {
        headers: { Authorization: "Bearer invalid.token.here" },
      })
    );
    expect(res.status).toBe(401);
  });

  it('accepts valid token and resolves user from payload', async () => {
    const app = makeApp();

    const signerApp = new Elysia()
      .use(jwt({ name: "jwt", secret: TEST_SECRET, exp: "30d" }))
      .get("/sign", async ({ jwt }) => {
        return await jwt.sign({ id: "user-abc", isUnraidUser: true });
      });

    const signRes = await signerApp.handle(new Request("http://localhost/sign"));
    const token = await signRes.text();

    const res = await app.handle(
      new Request("http://localhost/protected", {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.id).toBe("user-abc");
    expect(body.user.isUnraidUser).toBe(true);
  });

  it('resolves non-Unraid user correctly', async () => {
    const app = makeApp();

    const signerApp = new Elysia()
      .use(jwt({ name: "jwt", secret: TEST_SECRET, exp: "30d" }))
      .get("/sign", async ({ jwt }) => {
        return await jwt.sign({ id: "local-user-1", isUnraidUser: false });
      });

    const signRes = await signerApp.handle(new Request("http://localhost/sign"));
    const token = await signRes.text();

    const res = await app.handle(
      new Request("http://localhost/protected", {
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.id).toBe("local-user-1");
    expect(body.user.isUnraidUser).toBe(false);
  });

  it('rejects tampered tokens (malformed base64)', async () => {
    const app = makeApp();
    const res = await app.handle(
      new Request("http://localhost/protected", {
        headers: { Authorization: "Bearer header.!@#$%&.signature" },
      })
    );
    expect(res.status).toBe(401);
  });
});
