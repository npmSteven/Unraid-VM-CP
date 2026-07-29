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

describe('E2E Flow Tests', () => {
  let mockUnraid: MockUnraidServer;
  let app: Elysia;

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
    mockUnraid.clearActions();
    for (const vm of mockUnraid.getVMs()) {
      if (vm.name.includes('Ubuntu')) {
        mockUnraid.setVMState(vm.id, 'shutoff');
      } else {
        mockUnraid.setVMState(vm.id, 'running');
      }
    }
  });

  test('Flow 1: Admin login -> List VMs -> Start VM -> Verify mock action log', async () => {
    // 1. Admin Login
    const loginRes = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'root', password: 'password' }),
      })
    );
    const token = (await loginRes.json()).payload.accessToken;

    // 2. List VMs
    const vmsRes = await app.handle(
      new Request('http://localhost/api/v1/vms', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    );
    const vms = (await vmsRes.json()).payload;
    const shutoffVm = vms.find((v: { state: string }) => v.state === 'shutoff');

    // 3. Start VM
    const startRes = await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    );
    expect(startRes.status).toBe(200);

    // 4. Verify mock action log
    const actions = mockUnraid.getActions();
    expect(actions.some((a) => a.action === 'start' && a.vmId === shutoffVm.id)).toBe(true);
  });

  test('Flow 2: Admin creates user -> links VM -> sets perms -> User login -> User starts VM', async () => {
    // 1. Admin login
    const adminLogin = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'root', password: 'password' }),
      })
    );
    const adminToken = (await adminLogin.json()).payload.accessToken;

    // 2. Create User
    const createUserRes = await app.handle(
      new Request('http://localhost/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ username: 'restricted_user', password: 'userpass123' }),
      })
    );
    const userId = (await createUserRes.json()).payload.id;

    // 3. Get VM list to find unraidVMId
    const vmsRes = await app.handle(
      new Request('http://localhost/api/v1/vms', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      })
    );
    const shutoffVm = (await vmsRes.json()).payload.find((v: { state: string }) => v.state === 'shutoff');

    // 4. Link VM to user
    const linkRes = await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/users/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      })
    );
    expect(linkRes.status).toBe(200);

    // 5. User Login
    const userLogin = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'restricted_user', password: 'userpass123' }),
      })
    );
    const userToken = (await userLogin.json()).payload.accessToken;

    // 6. User lists their VMs
    const userVmsRes = await app.handle(
      new Request('http://localhost/api/v1/vms', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${userToken}` },
      })
    );
    const userVms = (await userVmsRes.json()).payload;
    expect(userVms.length).toBe(1);
    expect(userVms[0].id).toBe(shutoffVm.id);

    // 7. User starts their VM
    const startRes = await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
      })
    );
    expect(startRes.status).toBe(200);
  });

  test('Permission deny: User without canStart permission gets 403', async () => {
    // Admin login
    const adminLogin = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'root', password: 'password' }),
      })
    );
    const adminToken = (await adminLogin.json()).payload.accessToken;

    // Create User
    const createUserRes = await app.handle(
      new Request('http://localhost/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ username: 'noperm_user', password: 'userpass123' }),
      })
    );
    const userId = (await createUserRes.json()).payload.id;

    // Get VM
    const vmsRes = await app.handle(
      new Request('http://localhost/api/v1/vms', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      })
    );
    const shutoffVm = (await vmsRes.json()).payload.find((v: { state: string }) => v.state === 'shutoff');

    // Link VM
    await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/users/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      })
    );

    // Disable canStart permission
    await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          canStart: false,
          canStop: false,
          canRemoveVM: false,
          canRemoveVMAndDisks: false,
          canForceStop: false,
          canRestart: false,
          canPause: false,
          canHibernate: false,
          canResume: false,
        }),
      })
    );

    // User Login
    const userLogin = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'noperm_user', password: 'userpass123' }),
      })
    );
    const userToken = (await userLogin.json()).payload.accessToken;

    // User tries to start VM -> 403 Forbidden
    const startRes = await app.handle(
      new Request(`http://localhost/api/v1/vms/${shutoffVm.id}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
      })
    );
    expect(startRes.status).toBe(403);
  });
});
