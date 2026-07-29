import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { AppErr, type AppError, type IUser } from "@unraid-vm-cp/shared-types";
import { getCurrentTimestampInSeconds } from "@unraid-vm-cp/shared-utils";
import { ok, err, Result, ResultAsync, fromPromise } from "neverthrow";

export const createUser = (username: string, password: string): ResultAsync<IUser, AppError> => {
  return fromPromise(
    Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 }),
    (e) => AppErr.internal(e instanceof Error ? e.message : "Password hashing failed")
  ).andThen((hash) => {
    try {
      const now = getCurrentTimestampInSeconds();
      const newUser = db.insert(users).values({
        id: crypto.randomUUID(),
        username,
        password: hash,
        createdAt: now,
        updatedAt: now,
      }).returning().get();
      return ok(newUser as IUser);
    } catch (e) {
      return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
    }
  });
};

export const getUserByUsername = (username: string): Result<IUser | null, AppError> => {
  try {
    const user = db.select().from(users).where(eq(users.username, username)).get() ?? null;
    return ok(user as IUser | null);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const getUserById = (id: string): Result<IUser | null, AppError> => {
  try {
    const user = db.select().from(users).where(eq(users.id, id)).get() ?? null;
    return ok(user as IUser | null);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const getUsers = (): Result<IUser[], AppError> => {
  try {
    const allUsers = db.select().from(users).all();
    return ok(allUsers as IUser[]);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};

export const updateUserPassword = (id: string, password: string): ResultAsync<IUser, AppError> => {
  return getUserById(id).asyncAndThen((user) => {
    if (!user) return err(AppErr.notFound('Unable to find user'));
    return fromPromise(
      Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 }),
      (e) => AppErr.internal(e instanceof Error ? e.message : "Password hashing failed")
    ).andThen((hash) => {
      try {
        const now = getCurrentTimestampInSeconds();
        const updated = db.update(users)
          .set({ password: hash, updatedAt: now })
          .where(eq(users.id, id))
          .returning()
          .get();
        return ok(updated as IUser);
      } catch (e) {
        return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
      }
    });
  });
};

export const updateUserUsername = (id: string, username: string): ResultAsync<IUser, AppError> => {
  return getUserById(id).asyncAndThen((user) => {
    if (!user) return err(AppErr.notFound('Unable to find user'));
    try {
      const now = getCurrentTimestampInSeconds();
      const updated = db.update(users)
        .set({ username, updatedAt: now })
        .where(eq(users.id, id))
        .returning()
        .get();
      return ok(updated as IUser);
    } catch (e) {
      return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
    }
  });
};

export const deleteUser = (id: string): Result<IUser, AppError> => {
  const userRes = getUserById(id);
  if (userRes.isErr()) return err(userRes.error);
  const user = userRes.value;
  if (!user) return err(AppErr.notFound('Unable to find user'));

  try {
    db.delete(users).where(eq(users.id, id)).run();
    return ok(user);
  } catch (e) {
    return err(AppErr.db(e instanceof Error ? e.message : "Database error"));
  }
};
