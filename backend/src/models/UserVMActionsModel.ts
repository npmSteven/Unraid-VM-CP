import { DataTypes, Model, ModelStatic } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from "../services/db.js";
import { getCurrentTimestampInSeconds } from '../services/time.js';
import { IUserVMActions } from '../types/IUserVMActions.js';

export const UserVMActionsModel: ModelStatic<Model<IUserVMActions, IUserVMActions>> = sequelize.define('user_vm_actions', {
  id: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: () => v4(),
  },

  // References
  vmId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },

  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Timestamps
  createdAt: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => getCurrentTimestampInSeconds()
  },
  updatedAt: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => getCurrentTimestampInSeconds()
  },
}, {
  freezeTableName: true,
  hooks: {
    beforeUpdate: (record) => {
      record.dataValues.updatedAt = getCurrentTimestampInSeconds();
    }
  },
});
