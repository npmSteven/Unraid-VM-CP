import { Model } from "sequelize";
import { VMModel } from "../models/VMModel.js";
import { IVM } from "../types/IVM.js";
import { getVMsByIds } from "./unraid.js";

export const getVMsByUserId = async (id: string) => {
  try {
    const userVMs = await VMModel.findAll({ where: { userId: id } });
    const vmIds = userVMs.map((userVM: Model<IVM>) => userVM.dataValues.id);
    const vms = await getVMsByIds(vmIds);
    return vms;
  } catch (error) {
    console.error('ERROR - getVMsByUserId()', error);
    throw error;
  }
}

export const linkVMToUser = async (vmId: string, userId: string): Promise<Model<IVM, IVM>> => {
  try {
    const vm = await VMModel.create({
      id: vmId,
      userId,
    });
    return vm;
  } catch (error) {
    console.error('ERROR - linkVMToUser():', error);
    throw error;
  }
}