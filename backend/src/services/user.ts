import { Model } from 'sequelize';

import { UserModel } from "../models/UserModel.js";
import { IUser } from '../types/IUser.js';

export const createUser = async (username: string, password: string): Promise<Model<IUser, IUser>> => {
  try {
    const newUser = await UserModel.create({
      username,
      password,
    });
    return newUser;
  } catch (error) {
    console.error('ERROR - createUser():', error);
    throw error;
  }
}