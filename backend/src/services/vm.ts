import { Model } from "sequelize";

import { UserVMPermissionsModel } from "../models/UserVMPermissionsModel.js";
import { VMModel } from "../models/VMModel.js";
import { IUserVMPermissions } from "../types/IUserVMPermissions.js";
import { IVM } from "../types/IVM.js";
import { NotFoundError } from "./ErrorHandler.js";
import { getVMByIdUnraid, getVMsByIdsUnraid, getVMsUnraid } from "./unraid.js";

export const getVMsByUserId = async (id: string) => {
  try {
    // Get VMs for the user
    const userVMs = await VMModel.findAll({ where: { userId: id } });

    const vmIds = userVMs.map((userVM: Model<IVM>) => userVM.dataValues.unraidVMId);
    const unraidVMs = await getVMsByIdsUnraid(vmIds);

    // Get the permissions for each VM
    const userVMPermissions = await getUserVMPermissions(id);

    const unraidVMsWithPermissions = unraidVMs.filter(unraidVM => {
      const id = userVMs.find(userVM => userVM?.dataValues?.unraidVMId === unraidVM.id)?.dataValues?.id;
      if (!id) return false;
      const permissions = userVMPermissions.find((userVMPermission) => userVMPermission?.dataValues?.vmId == id);
      if (!permissions) return false;
      unraidVM.permissions = permissions.dataValues;
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
    const userVM = await VMModel.findOne({ where: { userId, unraidVMId } });
    const userVMPermissions = await getUserVMPermissionByUserIdAndVMId(userId, userVM.dataValues.id);
    unraidVM.permissions = userVMPermissions.dataValues;
    return unraidVM;
  } catch (error) {
    console.error('ERROR - getVMsByUserId()', error);
    throw error;
  }
}

export const getLinkableVMs = async (userId: string) => {
  try {
    // Get all of the ids of the VM that have already been linked
    const userVMs = await VMModel.findAll({ where: { userId } });
    const vmIds = userVMs.map((userVM: Model<IVM>) => userVM.dataValues.unraidVMId);

    // Get unraid vms and filter out the ids we got already and return filtered vms
    const unraidVMs = await getVMsUnraid();
    const linkableUnraidVMs = unraidVMs.filter(unraidVM => !vmIds.includes(unraidVM.id));

    return linkableUnraidVMs;
  } catch (error) {
    console.error('ERROR - getLinkableVMs():', error);
    throw error;
  }
}

export const checkIsVMLinkedToUser = async (unraidVMId: string, userId: string): Promise<Boolean> => {
  try {
    const vm = await VMModel.findOne({ where: { unraidVMId, userId } });
    return !!vm;
  } catch (error) {
    console.error('ERROR - isVMLinkedToUser():', error);
    throw error;
  }
}

export const linkVMToUser = async (unraidVMId: string, userId: string): Promise<Model<IVM, IVM>> => {
  try {
    const vm = await VMModel.create({
      unraidVMId,
      userId,
    });

    return vm;
  } catch (error) {
    console.error('ERROR - linkVMToUser():', error);
    throw error;
  }
}

export const unlinkVMFromUser = async (unraidVMId: string, userId: string): Promise<Model<IVM, IVM>> => {
  try {
    const vm = await VMModel.findOne({ where: { unraidVMId, userId } });
    if (!vm) {
      throw new NotFoundError('Cannot find linked vm, unable to delete');
    }

    await vm.destroy();
    return vm;
  } catch (error) {
    console.error('ERROR - linkVMToUser():', error);
    throw error;
  }
}

export const createUserVMPermissions = async (vmId: string, userId: string): Promise<Model<IUserVMPermissions, IUserVMPermissions>> => {
  try {
    const userVMPermissions = await UserVMPermissionsModel.create({
      vmId,
      userId,
      canStart: true,
      canStop: true,
      canRestart: true,
    });

    return userVMPermissions;
  } catch (error) {
    console.error('ERROR - createVMUserPermissions():', error);
    throw error;
  }
};

export const deleteUserVMPermissions = async (vmId: string, userId: string): Promise<Model<IUserVMPermissions, IUserVMPermissions>> => {
  try {
    const userVMPermissions = await UserVMPermissionsModel.findOne({
      where: {
        vmId,
        userId,
      }
    });

    if (!userVMPermissions) {
      throw new NotFoundError('Cannot find permissions for the vm and user, unable to delete');
    }

    await userVMPermissions.destroy();

    return userVMPermissions;
  } catch (error) {
    console.error('ERROR - deleteUserVMPermissions():', error);
    throw error;
  }
};

export const getUserVMPermissionByUserIdAndVMId = async (userId: string, vmId: string): Promise<Model<IUserVMPermissions, IUserVMPermissions>> => {
  try {
    const vmPermissions = await UserVMPermissionsModel.findOne({ where: { userId, vmId } });
    return vmPermissions;
  } catch (error) {
    console.error('ERROR - deleteUserVMPermissions():', error);
    throw error;
  }
};

export const getUserVMPermissions = async (userId: string): Promise<Model<IUserVMPermissions, IUserVMPermissions>[]> => {
  try {
    const vmPermissions = await UserVMPermissionsModel.findAll({ where: { userId } });
    return vmPermissions;
  } catch (error) {
    console.error('ERROR - deleteUserVMPermissions():', error);
    throw error;
  }
};
