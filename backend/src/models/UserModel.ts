import { ModelStatic, Model, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import bcryptjs from 'bcryptjs';

import { sequelize } from "../services/db.js";
import { getCurrentTimestampInSeconds } from '../services/time.js';
import { IUser } from '../types/IUser.js';

export const UserModel: ModelStatic<Model<IUser, IUser>> = sequelize.define('users', {
  id: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
    primaryKey: true,
    defaultValue: () => v4(),
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
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
    beforeCreate: async (record) => {
      const hash = await bcryptjs.hash(record.dataValues.password, 10);
      record.dataValues.password = hash;
    },
    beforeUpdate: (record) => {
      record.dataValues.updatedAt = getCurrentTimestampInSeconds();
    }
  }
});

