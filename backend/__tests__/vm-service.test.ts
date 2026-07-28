import { describe, it, expect, beforeAll, beforeEach, mock } from "bun:test";
import { Database } from "bun:sqlite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";

const testSqlite = new Database(":memory:");
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

mock.module("../src/db/index.js", () => ({
  default: testDb,
  db: testDb,
}));

import {
  getVMsByUserId,
  getLinkableVMs, checkIsVMLinkedToUser,
  linkVMToUser, unlinkVMFromUser,
  createUserVMPermissions, deleteUserVMPermissions,
  getUserVMPermissions, updateUserVMPermissions,
  deleteVMsAll, deleteUserVMPermissionsAll,
  getUserVMPermissionByUserIdAndVMId,
} from "../src/services/vm.js";
import type { UnraidClient } from "../src/services/UnraidClient.js";

const MOCK_VMS = [
  { id: "vm-uuid-1", name: "Test VM 1", state: "shutoff", graphics: "", memory: "1024M", cpus: "1", storage: "20G", os: "Linux", ips: [], osImg: "", isAutoStart: false, vnc: "" },
  { id: "vm-uuid-2", name: "Test VM 2", state: "running", graphics: "", memory: "2048M", cpus: "2", storage: "40G", os: "Windows", ips: [], osImg: "", isAutoStart: true, vnc: "" },
  { id: "vm-uuid-3", name: "Test VM 3", state: "shutoff", graphics: "", memory: "512M", cpus: "1", storage: "10G", os: "FreeBSD", ips: [], osImg: "", isAutoStart: false, vnc: "" },
];

const makeMockClient = (): UnraidClient => ({
  getVMsUnraid: () => Promise.resolve([...MOCK_VMS]),
  getVMsByIdsUnraid: (ids: string[]) => Promise.resolve(MOCK_VMS.filter(v => ids.includes(v.id))),
  getVMByIdUnraid: (id: string) => Promise.resolve(MOCK_VMS.find(v => v.id === id)),
} as unknown as UnraidClient);

let client: UnraidClient;

beforeAll(() => {
  client = makeMockClient();
});

beforeEach(() => {
  testDb.run(sql`DELETE FROM user_vm_permissions`);
  testDb.run(sql`DELETE FROM vms`);
});

describe('VM Service', () => {
  const USER_ID = "user-test-123";

  describe('linkVMToUser', () => {
    it('links a VM to a user and returns the entry', () => {
      const result = linkVMToUser("vm-uuid-1", USER_ID);
      expect(result).toBeTruthy();
      expect(result.unraidVMId).toBe("vm-uuid-1");
      expect(result.userId).toBe(USER_ID);
      expect(result.id).toBeTruthy();
    });
  });

  describe('checkIsVMLinkedToUser', () => {
    it('returns false when VM is not linked', () => {
      const result = checkIsVMLinkedToUser("vm-uuid-1", USER_ID);
      expect(result).toBe(false);
    });

    it('returns true when VM is linked', () => {
      linkVMToUser("vm-uuid-1", USER_ID);
      const result = checkIsVMLinkedToUser("vm-uuid-1", USER_ID);
      expect(result).toBe(true);
    });
  });

  describe('unlinkVMFromUser', () => {
    it('unlinks a linked VM', () => {
      linkVMToUser("vm-uuid-1", USER_ID);
      const result = unlinkVMFromUser("vm-uuid-1", USER_ID);
      expect(result.unraidVMId).toBe("vm-uuid-1");
      expect(checkIsVMLinkedToUser("vm-uuid-1", USER_ID)).toBe(false);
    });

    it('throws when VM is not linked', () => {
      expect(() => unlinkVMFromUser("vm-uuid-nonexistent", USER_ID))
        .toThrow('Cannot find linked vm, unable to delete');
    });
  });

  describe('createUserVMPermissions', () => {
    it('creates default permissions for a linked VM', () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      const perms = createUserVMPermissions(vmLink.id, USER_ID);

      expect(perms.canStart).toBe(true);
      expect(perms.canStop).toBe(true);
      expect(perms.canRestart).toBe(true);
      expect(perms.canPause).toBe(false);
      expect(perms.canHibernate).toBe(false);
      expect(perms.canRemoveVM).toBe(false);
    });
  });

  describe('getUserVMPermissions', () => {
    it('returns all permissions for a user', () => {
      const vmLink1 = linkVMToUser("vm-uuid-1", USER_ID);
      const vmLink2 = linkVMToUser("vm-uuid-2", USER_ID);
      createUserVMPermissions(vmLink1.id, USER_ID);
      createUserVMPermissions(vmLink2.id, USER_ID);

      const perms = getUserVMPermissions(USER_ID);
      expect(perms).toHaveLength(2);
    });

    it('returns empty array when user has no VMs', () => {
      const perms = getUserVMPermissions(USER_ID);
      expect(perms).toHaveLength(0);
    });
  });

  describe('updateUserVMPermissions', () => {
    it('updates specific permissions', () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      createUserVMPermissions(vmLink.id, USER_ID);

      const updated = updateUserVMPermissions(vmLink.id, USER_ID, { canPause: true, canForceStop: true });
      expect(updated.canPause).toBe(true);
      expect(updated.canForceStop).toBe(true);
      expect(updated.canStart).toBe(true);
    });
  });

  describe('getUserVMPermissionByUserIdAndVMId', () => {
    it('returns permissions for a specific VM', () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      createUserVMPermissions(vmLink.id, USER_ID);

      const perms = getUserVMPermissionByUserIdAndVMId(USER_ID, vmLink.id);
      expect(perms).toBeTruthy();
      expect(perms!.vmId).toBe(vmLink.id);
    });

    it('returns null when no permissions exist', () => {
      const perms = getUserVMPermissionByUserIdAndVMId(USER_ID, "nonexistent");
      expect(perms).toBeNull();
    });
  });

  describe('deleteUserVMPermissions', () => {
    it('deletes permissions and returns them', () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      createUserVMPermissions(vmLink.id, USER_ID);

      const deleted = deleteUserVMPermissions(vmLink.id, USER_ID);
      expect(deleted.vmId).toBe(vmLink.id);

      const remaining = getUserVMPermissionByUserIdAndVMId(USER_ID, vmLink.id);
      expect(remaining).toBeNull();
    });
  });

  describe('getVMsByUserId', () => {
    it('returns linked VMs with permissions and Unraid data', async () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      createUserVMPermissions(vmLink.id, USER_ID);

      const vms = await getVMsByUserId(USER_ID, client);
      expect(vms).toHaveLength(1);
      expect(vms[0].id).toBe("vm-uuid-1");
      expect(vms[0].permissions).toBeTruthy();
      expect(vms[0].permissions!.canStart).toBe(true);
    });

    it('returns empty array when user has no VMs', async () => {
      const vms = await getVMsByUserId(USER_ID, client);
      expect(vms).toHaveLength(0);
    });
  });

  describe('getLinkableVMs', () => {
    it('lists Unraid VMs not yet linked to a user', async () => {
      linkVMToUser("vm-uuid-1", USER_ID);

      const linkable = await getLinkableVMs(USER_ID, client);
      expect(linkable).toHaveLength(2);
      const ids = linkable.map((v: { id: string }) => v.id);
      expect(ids).not.toContain("vm-uuid-1");
      expect(ids).toContain("vm-uuid-2");
      expect(ids).toContain("vm-uuid-3");
    });

    it('returns all Unraid VMs when none are linked', async () => {
      const linkable = await getLinkableVMs(USER_ID, client);
      expect(linkable).toHaveLength(3);
    });
  });

  describe('deleteVMsAll', () => {
    it('deletes all VMs for a user', () => {
      linkVMToUser("vm-uuid-1", USER_ID);
      linkVMToUser("vm-uuid-2", USER_ID);

      const changes = deleteVMsAll(USER_ID);
      expect(changes).toBe(2);
      expect(checkIsVMLinkedToUser("vm-uuid-1", USER_ID)).toBe(false);
    });
  });

  describe('deleteUserVMPermissionsAll', () => {
    it('deletes all permissions for a user', () => {
      const vmLink = linkVMToUser("vm-uuid-1", USER_ID);
      createUserVMPermissions(vmLink.id, USER_ID);

      const changes = deleteUserVMPermissionsAll(USER_ID);
      expect(changes).toBe(1);
    });
  });
});
