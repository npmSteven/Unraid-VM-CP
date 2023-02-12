import { DataTypes, Model, ModelStatic } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from "../services/db.js";
import { getCurrentTimestampInSeconds } from '../services/time.js';
import { IUserVMPermissions } from '../types/IUserVMPermissions.js';

export const UserVMPermissionsModel: ModelStatic<Model<IUserVMPermissions, IUserVMPermissions>> = sequelize.define('user_vm_permissions', {
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
    references: {
      model: 'vms',
      key: 'id',
    }
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  
  // Controls
  canStart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canStop: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canRemoveVM: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canRemoveVMAndDisks: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canForceStop: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canRestart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canPause: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canHibernate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  canResume: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
