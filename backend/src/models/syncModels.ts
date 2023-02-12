import { UserModel } from "./UserModel.js";
import { UserVMActionsModel } from "./UserVMActionsModel.js";
import { UserVMPermissionsModel } from "./UserVMPermissionsModel.js";
import { VMSModel } from "./VMSModel.js";

export const syncModels = () => {
  try {
    UserModel.sync({ alter: true });
    UserVMActionsModel.sync({ alter: true });
    UserVMPermissionsModel.sync({ alter: true });
    VMSModel.sync({ alter: true });
  } catch (error) {
    console.error('ERROR - syncModels():', error);
    throw error;
  }
}
