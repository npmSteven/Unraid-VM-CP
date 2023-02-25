import { Model } from 'sequelize';
import bcryptjs from 'bcryptjs';
import { UserModel } from "../models/UserModel.js";
import { IUser } from '../types/IUser.js';
import { NotFoundError } from './ErrorHandler.js';

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

export const updateUserPassword = async (id: string, password: string): Promise<Model<IUser, IUser>> => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundError('Unable to find user');
    const hash = await bcryptjs.hash(password, 10);
    const updatedUser = await user.update({ password: hash });
    return updatedUser;
  } catch (error) {
    console.error('ERROR - updateUserPassword():', error);
    throw error;
  }
}

export const updateUserUsername = async (id: string, username: string): Promise<Model<IUser, IUser>> => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundError('Unable to find user');
    const updatedUser = await user.update({ username });
    return updatedUser;
  } catch (error) {
    console.error('ERROR - updateUserUsername():', error);
    throw error;
  }
}

export const deleteUser = async (id: string): Promise<Model<IUser, IUser>> => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) throw new NotFoundError('Unable to find user');
    await user.destroy();
    return user;
  } catch (error) {
    console.error('ERROR - deleteUser():', error);
    throw error;
  }
}
