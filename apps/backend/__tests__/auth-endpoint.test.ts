import { describe, it, expect } from "bun:test";
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema.js";

const TEST_SECRET = "test-auth-secret-16char+";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite);
db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
)`);

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: TEST_SECRET, exp: "30d" }))
  .post("/api/v1/auth/login", async ({ jwt, body }) => {
    const { username, password } = body;

    const user = db.select().from(users).where(eq(users.username, username)).get();
    if (!user) {
      return Response.json({ success: false, payload: ["Username or password is incorrect"] }, { status: 401 });
    }
    const isMatch = await Bun.password.verify(password, user.password);
    if (!isMatch) {
      return Response.json({ success: false, payload: ["Username or password is incorrect"] }, { status: 401 });
    }
    const accessToken = await jwt.sign({ isUnraidUser: false, id: user.id });
    return { success: true, payload: { accessToken } };
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 16 }),
      password: t.String({ minLength: 6, maxLength: 255 }),
    }),
  });

describe('Auth Endpoint', () => {
  it('rejects invalid credentials', async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "nobody", password: "wrongpassword" }),
      })
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('authenticates existing user with bcrypt password', async () => {
    const now = Math.floor(Date.now() / 1000);
    const hash = await Bun.password.hash("correct-horse-battery", { algorithm: "bcrypt", cost: 4 });
    const userId = crypto.randomUUID();

    db.insert(users).values({
      id: userId,
      username: "testuser",
      password: hash,
      createdAt: now,
      updatedAt: now,
    }).run();

    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "correct-horse-battery" }),
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.payload.accessToken).toBe("string");

    const parts = body.payload.accessToken.split(".");
    expect(parts).toHaveLength(3);
    const payload = JSON.parse(atob(parts[1]));
    expect(payload.id).toBe(userId);
    expect(payload.isUnraidUser).toBe(false);
  });
});
