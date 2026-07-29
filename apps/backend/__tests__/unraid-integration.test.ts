process.env.JWT_SECRET = 'test-jwt-secret-12345';
process.env.UNRAID_USERNAME = 'root';
process.env.UNRAID_PASSWORD = 'password';
process.env.UNRAID_IP = '127.0.0.1';

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { createMockUnraid, type MockUnraidServer } from '@unraid-vm-cp/mock-unraid';
import { UnraidClient } from '@unraid-vm-cp/unraid-client';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from '../src/api/v1/auth/auth.js';
import { configRoutes } from '../src/api/v1/config/config.js';
import { userRoutes } from '../src/api/v1/users/users.js';
import { vmRoutes } from '../src/api/v1/vms/vms.js';

const testSqlite = new Database(':memory:');
const testDb = drizzle(testSqlite);

testDb.run(sql`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL
  )
`);
testDb.run(sql`
  CREATE TABLE IF NOT EXISTS vms (
    id TEXT PRIMARY KEY, unraidVMId TEXT NOT NULL, userId TEXT NOT NULL,
    createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL
  )
`);
testDb.run(sql`
  CREATE TABLE IF NOT EXISTS user_vm_permissions (
    id TEXT PRIMARY KEY, vmId TEXT NOT NULL, userId TEXT NOT NULL,
    canStart INTEGER DEFAULT 0, canStop INTEGER DEFAULT 0,
    canRemoveVM INTEGER DEFAULT 0, canRemoveVMAndDisks INTEGER DEFAULT 0,
    canForceStop INTEGER DEFAULT 0, canRestart INTEGER DEFAULT 0,
    canPause INTEGER DEFAULT 0, canHibernate INTEGER DEFAULT 0,
    canResume INTEGER DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL
  )
`);

import { mock } from 'bun:test';
mock.module('../src/db/index.js', () => ({
  default: testDb,
  db: testDb,
}));

describe('Integration Tests: API Endpoints', () => {
  let mockUnraid: MockUnraidServer;
  let app: Elysia;
  let adminToken: string;

  beforeAll(async () => {
    mockUnraid = await createMockUnraid({
      port: 0,
      username: 'root',
      password: 'password',
    });

    const parsedUrl = new URL(mockUnraid.url);
    const unraidClient = new UnraidClient({
      ip: parsedUrl.hostname,
      port: parsedUrl.port,
      isHTTPS: false,
      username: 'root',
      password: 'password',
      baseUrl: mockUnraid.url,
    });

    app = new Elysia()
      .decorate('unraidClient', unraidClient)
      .use(cors())
      .use(authRoutes)
      .use(configRoutes)
      .use(userRoutes)
      .use(vmRoutes);
  });

  afterAll(async () => {
    if (mockUnraid) {
      await mockUnraid.stop();
    }
  });

  beforeEach(() => {
    testDb.run(sql`DELETE FROM user_vm_permissions`);
    testDb.run(sql`DELETE FROM vms`);
    testDb.run(sql`DELETE FROM users`);
  });

  describe('Auth API', () => {
    test('POST /api/v1/auth/login as Unraid admin', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'root', password: 'password' }),
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.payload.accessToken).toBeDefined();
      adminToken = json.payload.accessToken;
    });

    test('POST /api/v1/auth/login with wrong credentials returns 401', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'root', password: 'wrongpassword' }),
        })
      );
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('User API', () => {
    test('Admin can create, update, list, and delete a user', async () => {
      const loginRes = await app.handle(
        new Request('http://localhost/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'root', password: 'password' }),
        })
      );
      const { payload } = await loginRes.json();
      const token = payload.accessToken;

      // 1. Create user
      const createRes = await app.handle(
        new Request('http://localhost/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ username: 'testuser1', password: 'userpassword123' }),
        })
      );
      expect(createRes.status).toBe(200);
      const createdJson = await createRes.json();
      expect(createdJson.success).toBe(true);
      const userId = createdJson.payload.id;

      // 2. Get user list
      const listRes = await app.handle(
        new Request('http://localhost/api/v1/users', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json();
      expect(listJson.payload.users.length).toBe(1);

      // 3. Update username
      const updateRes = await app.handle(
        new Request(`http://localhost/api/v1/users/${userId}/username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ username: 'updateduser1' }),
        })
      );
      expect(updateRes.status).toBe(200);
      const updateJson = await updateRes.json();
      expect(updateJson.payload.username).toBe('updateduser1');

      // 4. Delete user
      const deleteRes = await app.handle(
        new Request(`http://localhost/api/v1/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      expect(deleteRes.status).toBe(200);
    });
  });

  describe('VM Listing & Actions API', () => {
    test('Admin can view all VMs and control VM state', async () => {
      const loginRes = await app.handle(
        new Request('http://localhost/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'root', password: 'password' }),
        })
      );
      const { payload } = await loginRes.json();
      const token = payload.accessToken;

      // List VMs
      const vmsRes = await app.handle(
        new Request('http://localhost/api/v1/vms', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      expect(vmsRes.status).toBe(200);
      const vmsJson = await vmsRes.json();
      expect(vmsJson.payload.length).toBe(2);

      const shutoffVm = vmsJson.payload.find((v: { state: string }) => v.state === 'shutoff');
      expect(shutoffVm).toBeDefined();

      // Start VM
      const startRes = await app.handle(
        new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/start`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        })
      );
      expect(startRes.status).toBe(200);
      const startJson = await startRes.json();
      expect(startJson.success).toBe(true);
    });
  });
});
