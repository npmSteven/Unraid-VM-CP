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

export const getUserByUsername = async (username: string): Promise<Model<IUser, IUser>> => {
  try {
    const user = await UserModel.findOne({ where: { username } });
    return user;
  } catch (error) {
    console.error('ERROR - getUserByUsername():', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<Model<IUser, IUser>> => {
  try {
    const user = await UserModel.findByPk(id);
    return user;
  } catch (error) {
    console.error('ERROR - getUserById():', error);
    throw error;
  }
};

export const getUsers = async (): Promise<Model<IUser, IUser>[]> => {
  try {
    const users = await UserModel.findAll();
    return users;
  } catch (error) {
    console.error('ERROR - getUsers():', error);
    throw error;
  }
}
