import { UserModel } from "./UserModel.js";
import { UserVMActionsModel } from "./UserVMActionsModel.js";
import { UserVMPermissionsModel } from "./UserVMPermissionsModel.js";
import { VMModel } from "./VMModel.js";

export const syncModels = () => {
  try {
    UserModel.sync();
    UserVMActionsModel.sync();
    UserVMPermissionsModel.sync();
    VMModel.sync();
  } catch (error) {
    console.error('ERROR - syncModels():', error);
    throw error;
  }
}
