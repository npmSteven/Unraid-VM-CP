import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { NotFoundError } from './ErrorHandler.js';
import { getCurrentTimestampInSeconds } from './time.js';

export const createUser = async (username: string, password: string) => {
  try {
    const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
    const now = getCurrentTimestampInSeconds();
    const newUser = db.insert(users).values({
      id: crypto.randomUUID(),
      username,
      password: hash,
      createdAt: now,
      updatedAt: now,
    }).returning().get();
    return newUser;
  } catch (error) {
    console.error('ERROR - createUser():', error);
    throw error;
  }
}

export const getUserByUsername = (username: string) => {
  try {
    return db.select().from(users).where(eq(users.username, username)).get() ?? null;
  } catch (error) {
    console.error('ERROR - getUserByUsername():', error);
    throw error;
  }
};

export const getUserById = (id: string) => {
  try {
    return db.select().from(users).where(eq(users.id, id)).get() ?? null;
  } catch (error) {
    console.error('ERROR - getUserById():', error);
    throw error;
  }
};

export const getUsers = () => {
  try {
    return db.select().from(users).all();
  } catch (error) {
    console.error('ERROR - getUsers():', error);
    throw error;
  }
}

export const updateUserPassword = async (id: string, password: string) => {
  try {
    const user = getUserById(id);
    if (!user) throw new NotFoundError('Unable to find user');
    const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
    const now = getCurrentTimestampInSeconds();
    return db.update(users)
      .set({ password: hash, updatedAt: now })
      .where(eq(users.id, id))
      .returning()
      .get();
  } catch (error) {
    console.error('ERROR - updateUserPassword():', error);
    throw error;
  }
}

export const updateUserUsername = (id: string, username: string) => {
  try {
    const user = getUserById(id);
    if (!user) throw new NotFoundError('Unable to find user');
    const now = getCurrentTimestampInSeconds();
    return db.update(users)
      .set({ username, updatedAt: now })
      .where(eq(users.id, id))
      .returning()
      .get();
  } catch (error) {
    console.error('ERROR - updateUserUsername():', error);
    throw error;
  }
}

export const deleteUser = (id: string) => {
  try {
    const user = getUserById(id);
    if (!user) throw new NotFoundError('Unable to find user');
    db.delete(users).where(eq(users.id, id)).run();
    return user;
  } catch (error) {
    console.error('ERROR - deleteUser():', error);
    throw error;
  }
}
