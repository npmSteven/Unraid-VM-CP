import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { vms, userVmPermissions } from "../db/schema.js";
import { AppErr, type AppError, type IVM, type IVMPermissions } from "@unraid-vm-cp/shared-types";
import type { UnraidClient } from "@unraid-vm-cp/unraid-client";
import { ok, err, Result, ResultAsync, fromPromise } from "neverthrow";

const getLinkedVMEntry = (unraidVMId: string, userId: string) => {
  return db.select().from(vms).where(
    and(eq(vms.unraidVMId, unraidVMId), eq(vms.userId, userId))
  ).get();
};

export const getVMsByUserId = (userId: string, client: UnraidClient): ResultAsync<IVM[], AppError> => {
  return fromPromise(
    (async () => {
      const userVMs = db.select().from(vms).where(eq(vms.userId, userId)).all();
      const vmIds = userVMs.map((vm) => vm.unraidVMId);
      const unraidVMs = await client.getVMsByIdsUnraid(vmIds);
      const permissionsRes = getUserVMPermissions(userId);
      if (permissionsRes.isErr()) throw new Error(permissionsRes.error.message);
      const userVMPermissions = permissionsRes.value;

      const unraidVMsWithPermissions = unraidVMs.filter((unraidVM) => {
        const linkedVM = userVMs.find((vm) => vm.unraidVMId === unraidVM.id);
        if (!linkedVM) return false;
        const permissions = userVMPermissions.find((p) => p.vmId === linkedVM.id);
        if (!permissions) return false;
        unraidVM.permissions = permissions;
        return true;
      });

      return unraidVMsWithPermissions;
    })(),
    (e) => AppErr.unraid(e instanceof Error ? e.message : "Error fetching VMs")
  );
};

export const getVMByUserIdAndUnraidVMId = (
  userId: string,
  unraidVMId: string,
  client: UnraidClient
): ResultAsync<IVM, AppError> => {
  return fromPromise(
    (async () => {
      const unraidVM = await client.getVMByIdUnraid(unraidVMId);
      if (!unraidVM) throw new Error("VM not found");
      const userVM = getLinkedVMEntry(unraidVMId, userId);
      if (!userVM) throw new Error("VM not linked");
      const permRes = getUserVMPermissionByUserIdAndVMId(userId, userVM.id);
      if (permRes.isErr()) throw new Error(permRes.error.message);
      unraidVM.permissions = permRes.value ?? undefined;
      return unraidVM;
    })(),
    (e) => AppErr.unraid(e instanceof Error ? e.message : "Error fetching VM")
  );
};

export const getLinkableVMs = (userId: string, client: UnraidClient): ResultAsync<IVM[], AppError> => {
  return fromPromise(
    (async () => {
      const userVMs = db.select().from(vms).where(eq(vms.userId, userId)).all();
      const vmIds = userVMs.map((vm) => vm.unraidVMId);
      const unraidVMs = await client.getVMsUnraid();
      return unraidVMs.filter((unraidVM) => !vmIds.includes(unraidVM.id));
    })(),
    (e) => AppErr.unraid(e instanceof Error ? e.message : "Error fetching linkable VMs")
  );
};

export const checkIsVMLinkedToUser = (unraidVMId: string, userId: string): Result<boolean, AppError> => {
  try {
    return ok(!!getLinkedVMEntry(unraidVMId, userId));
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const linkVMToUser = (
  unraidVMId: string,
  userId: string
): Result<{ id: string; unraidVMId: string; userId: string; createdAt: number; updatedAt: number }, AppError> => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const created = db.insert(vms).values({
      id: crypto.randomUUID(),
      unraidVMId,
      userId,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
    return ok(created);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const getVMByUserIdAndUnraidVMIdNoPermissions = (
  unraidVMId: string,
  userId: string
): Result<{ id: string; unraidVMId: string; userId: string; createdAt: number; updatedAt: number }, AppError> => {
  try {
    const vm = getLinkedVMEntry(unraidVMId, userId);
    if (!vm) {
      return err(AppErr.notFound('Cannot find linked vm'));
    }
    return ok(vm);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const unlinkVMFromUser = (
  unraidVMId: string,
  userId: string
): Result<{ id: string; unraidVMId: string; userId: string; createdAt: number; updatedAt: number }, AppError> => {
  try {
    const vm = getLinkedVMEntry(unraidVMId, userId);
    if (!vm) {
      return err(AppErr.notFound('Cannot find linked vm, unable to delete'));
    }
    db.delete(vms).where(eq(vms.id, vm.id)).run();
    return ok(vm);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const createUserVMPermissions = (vmId: string, userId: string): Result<IVMPermissions, AppError> => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const created = db.insert(userVmPermissions).values({
      id: crypto.randomUUID(),
      vmId,
      userId,
      canStart: true,
      canStop: true,
      canRestart: true,
      canRemoveVM: false,
      canRemoveVMAndDisks: false,
      canForceStop: false,
      canPause: false,
      canHibernate: false,
      canResume: false,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
    return ok(created as IVMPermissions);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const deleteUserVMPermissions = (vmId: string, userId: string): Result<IVMPermissions, AppError> => {
  try {
    const permissions = db.select().from(userVmPermissions).where(
      and(eq(userVmPermissions.vmId, vmId), eq(userVmPermissions.userId, userId))
    ).get();

    if (!permissions) {
      return err(AppErr.notFound('Cannot find permissions for the vm and user, unable to delete'));
    }

    db.delete(userVmPermissions).where(eq(userVmPermissions.id, permissions.id)).run();
    return ok(permissions as IVMPermissions);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const getUserVMPermissionByUserIdAndVMId = (
  userId: string,
  vmId: string
): Result<IVMPermissions | null, AppError> => {
  try {
    const perm = db.select().from(userVmPermissions).where(
      and(eq(userVmPermissions.userId, userId), eq(userVmPermissions.vmId, vmId))
    ).get() ?? null;
    return ok(perm as IVMPermissions | null);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const getUserVMPermissions = (userId: string): Result<IVMPermissions[], AppError> => {
  try {
    const perms = db.select().from(userVmPermissions).where(eq(userVmPermissions.userId, userId)).all();
    return ok(perms as IVMPermissions[]);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const deleteVMsAll = (userId: string): Result<number, AppError> => {
  try {
    const changes = db.delete(vms).where(eq(vms.userId, userId)).run().changes;
    return ok(changes);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const updateUserVMPermissions = (
  vmId: string,
  userId: string,
  data: Record<string, boolean>
): Result<IVMPermissions, AppError> => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const updated = db.update(userVmPermissions)
      .set({ ...data, updatedAt: now })
      .where(and(eq(userVmPermissions.vmId, vmId), eq(userVmPermissions.userId, userId)))
      .returning()
      .get();
    return ok(updated as IVMPermissions);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const deleteUserVMPermissionsAll = (userId: string): Result<number, AppError> => {
  try {
    const changes = db.delete(userVmPermissions).where(eq(userVmPermissions.userId, userId)).run().changes;
    return ok(changes);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};
