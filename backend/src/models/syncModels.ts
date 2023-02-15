import { UserModel } from "./UserModel.js";
import { UserVMActionsModel } from "./UserVMActionsModel.js";
import { UserVMPermissionsModel } from "./UserVMPermissionsModel.js";

export const syncModels = () => {
  try {
    UserModel.sync();
    UserVMActionsModel.sync();
    UserVMPermissionsModel.sync();
  } catch (error) {
    console.error('ERROR - syncModels():', error);
    throw error;
  }
}
