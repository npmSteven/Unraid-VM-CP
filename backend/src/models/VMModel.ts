import { DataTypes, Model, ModelStatic } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from "../services/db.js";
import { getCurrentTimestampInSeconds } from '../services/time.js';
import { IVM } from '../types/IVM.js';

export const VMModel: ModelStatic<Model<IVM, IVM>> = sequelize.define('vms', {
  id: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    }
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
