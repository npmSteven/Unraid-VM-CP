import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq } from "drizzle-orm";
import { users } from "../src/db/schema.js";

let db: ReturnType<typeof drizzle>;
let sqlite: Database;

beforeAll(() => {
  sqlite = new Database(":memory:");
  db = drizzle(sqlite);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  )`);
});

afterAll(() => {
  sqlite.close();
});

describe('User Service', () => {
  it('creates and retrieves a user', async () => {
    const now = Math.floor(Date.now() / 1000);
    const id = crypto.randomUUID();
    const hash = await Bun.password.hash('testpass123', { algorithm: "bcrypt", cost: 4 });

    db.insert(users).values({
      id,
      username: 'testuser',
      password: hash,
      createdAt: now,
      updatedAt: now,
    }).run();

    const result = db.select().from(users).where(eq(users.username, 'testuser')).get();
    expect(result).toBeTruthy();
    expect(result!.username).toBe('testuser');
    expect(result!.id).toBe(id);
  });

  it('verifies a bcrypt password with Bun.password', async () => {
    const hash = await Bun.password.hash('securepass', { algorithm: "bcrypt", cost: 4 });
    const isValid = await Bun.password.verify('securepass', hash);
    expect(isValid).toBe(true);

    const isInvalid = await Bun.password.verify('wrongpass', hash);
    expect(isInvalid).toBe(false);
  });

  it('Bun.password bcrypt produces valid bcrypt hash format', async () => {
    const hash = await Bun.password.hash('legacy-test', { algorithm: "bcrypt", cost: 4 });
    expect(hash).toMatch(/^\$2[aby]\$/);
    const isValid = await Bun.password.verify('legacy-test', hash);
    expect(isValid).toBe(true);
  });

  it('prevents duplicate usernames', async () => {
    const now = Math.floor(Date.now() / 1000);
    const hash = await Bun.password.hash('test', { algorithm: "bcrypt", cost: 4 });

    db.insert(users).values({
      id: crypto.randomUUID(),
      username: 'dupeuser',
      password: hash,
      createdAt: now,
      updatedAt: now,
    }).run();

    expect(() => {
      db.insert(users).values({
        id: crypto.randomUUID(),
        username: 'dupeuser',
        password: hash,
        createdAt: now,
        updatedAt: now,
      }).run();
    }).toThrow();
  });
});
