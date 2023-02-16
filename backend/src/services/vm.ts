import { Model } from "sequelize";
import { VMModel } from "../models/VMModel.js";
import { IVM } from "../types/IVM.js";
import { getVMsByIds } from "./unraid.js";

export const getVMsByUserId = async (id: string) => {
  try {
    const userVMs = await VMModel.findAll({ where: { userId: id } });
    const vmIds = userVMs.map((userVM: Model<IVM>) => userVM.dataValues.unraidVMId);
    const vms = await getVMsByIds(vmIds);
    return vms;
  } catch (error) {
    console.error('ERROR - getVMsByUserId()', error);
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