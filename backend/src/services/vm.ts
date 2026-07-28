import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { vms, userVmPermissions } from "../db/schema.js";
import { NotFoundError } from "./ErrorHandler.js";
import { getVMByIdUnraid, getVMsByIdsUnraid, getVMsUnraid } from "./unraid.js";

export const getVMsByUserId = async (userId: string) => {
  try {
    const userVMs = db.select().from(vms).where(eq(vms.userId, userId)).all();
    const vmIds = userVMs.map((vm) => vm.unraidVMId);
    const unraidVMs = await getVMsByIdsUnraid(vmIds);
    const userVMPermissions = getUserVMPermissions(userId);

    const unraidVMsWithPermissions = unraidVMs.filter((unraidVM) => {
      const linkedVM = userVMs.find((vm) => vm.unraidVMId === unraidVM.id);
      if (!linkedVM) return false;
      const permissions = userVMPermissions.find((p) => p.vmId === linkedVM.id);
      if (!permissions) return false;
      unraidVM.permissions = permissions;
      return unraidVM;
    });

    return unraidVMsWithPermissions;
  } catch (error) {
    console.error('ERROR - getVMsByUserId()', error);
    throw error;
  }
}

export const getVMByUserIdAndUnraidVMId = async (userId: string, unraidVMId: string) => {
  try {
    const unraidVM = await getVMByIdUnraid(unraidVMId);
    const userVM = db.select().from(vms).where(
      and(eq(vms.userId, userId), eq(vms.unraidVMId, unraidVMId))
    ).get();
    const userVMPermissions = getUserVMPermissionByUserIdAndVMId(userId, userVM!.id);
    unraidVM!.permissions = userVMPermissions;
    return unraidVM;
  } catch (error) {
    console.error('ERROR - getVMByUserIdAndUnraidVMId()', error);
    throw error;
  }
}

export const getLinkableVMs = async (userId: string) => {
  try {
    const userVMs = db.select().from(vms).where(eq(vms.userId, userId)).all();
    const vmIds = userVMs.map((vm) => vm.unraidVMId);
    const unraidVMs = await getVMsUnraid();
    return unraidVMs.filter((unraidVM) => !vmIds.includes(unraidVM.id));
  } catch (error) {
    console.error('ERROR - getLinkableVMs():', error);
    throw error;
  }
}

export const checkIsVMLinkedToUser = (unraidVMId: string, userId: string): boolean => {
  try {
    const vm = db.select().from(vms).where(
      and(eq(vms.unraidVMId, unraidVMId), eq(vms.userId, userId))
    ).get();
    return !!vm;
  } catch (error) {
    console.error('ERROR - checkIsVMLinkedToUser():', error);
    throw error;
  }
}

export const linkVMToUser = (unraidVMId: string, userId: string) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(vms).values({
      id: crypto.randomUUID(),
      unraidVMId,
      userId,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
  } catch (error) {
    console.error('ERROR - linkVMToUser():', error);
    throw error;
  }
}

export const getVMByUserIdAndUnraidVMIdNoPermissions = (unraidVMId: string, userId: string) => {
  try {
    const vm = db.select().from(vms).where(
      and(eq(vms.unraidVMId, unraidVMId), eq(vms.userId, userId))
    ).get();
    if (!vm) {
      throw new NotFoundError('Cannot find linked vm, unable to delete');
    }
    return vm;
  } catch (error) {
    console.error('ERROR - getVMByUserIdAndUnraidVMIdNoPermissions():', error);
    throw error;
  }
}

export const unlinkVMFromUser = (unraidVMId: string, userId: string) => {
  try {
    const vm = db.select().from(vms).where(
      and(eq(vms.unraidVMId, unraidVMId), eq(vms.userId, userId))
    ).get();
    if (!vm) {
      throw new NotFoundError('Cannot find linked vm, unable to delete');
    }
    db.delete(vms).where(eq(vms.id, vm.id)).run();
    return vm;
  } catch (error) {
    console.error('ERROR - unlinkVMFromUser():', error);
    throw error;
  }
}

export const createUserVMPermissions = (vmId: string, userId: string) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    return db.insert(userVmPermissions).values({
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
  } catch (error) {
    console.error('ERROR - createUserVMPermissions():', error);
    throw error;
  }
};

export const deleteUserVMPermissions = (vmId: string, userId: string) => {
  try {
    const permissions = db.select().from(userVmPermissions).where(
      and(eq(userVmPermissions.vmId, vmId), eq(userVmPermissions.userId, userId))
    ).get();

    if (!permissions) {
      throw new NotFoundError('Cannot find permissions for the vm and user, unable to delete');
    }

    db.delete(userVmPermissions).where(eq(userVmPermissions.id, permissions.id)).run();
    return permissions;
  } catch (error) {
    console.error('ERROR - deleteUserVMPermissions():', error);
    throw error;
  }
};

export const getUserVMPermissionByUserIdAndVMId = (userId: string, vmId: string) => {
  try {
    return db.select().from(userVmPermissions).where(
      and(eq(userVmPermissions.userId, userId), eq(userVmPermissions.vmId, vmId))
    ).get() ?? null;
  } catch (error) {
    console.error('ERROR - getUserVMPermissionByUserIdAndVMId():', error);
    throw error;
  }
};

export const getUserVMPermissions = (userId: string) => {
  try {
    return db.select().from(userVmPermissions).where(eq(userVmPermissions.userId, userId)).all();
  } catch (error) {
    console.error('ERROR - getUserVMPermissions():', error);
    throw error;
  }
};

export const deleteVMsAll = (userId: string) => {
  try {
    return db.delete(vms).where(eq(vms.userId, userId)).run().changes;
  } catch (error) {
    console.error('ERROR - deleteVMsAll():', error);
    throw error;
  }
}

export const updateUserVMPermissions = (vmId: string, userId: string, data: Record<string, boolean>) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    return db.update(userVmPermissions)
      .set({ ...data, updatedAt: now })
      .where(and(eq(userVmPermissions.vmId, vmId), eq(userVmPermissions.userId, userId)))
      .returning()
      .get();
  } catch (error) {
    console.error('ERROR - updateUserVMPermissions():', error);
    throw error;
  }
};

export const deleteUserVMPermissionsAll = (userId: string) => {
  try {
    return db.delete(userVmPermissions).where(eq(userVmPermissions.userId, userId)).run().changes;
  } catch (error) {
    console.error('ERROR - deleteUserVMPermissionsAll():', error);
    throw error;
  }
}
