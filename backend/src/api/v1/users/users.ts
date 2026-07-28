import { Elysia, t } from "elysia";
import { config } from "../../../config.js";
import { authGuard } from "../../../middleware/auth.js";
import { createUser, deleteUser, getUserById, getUserByUsername, getUsers, updateUserPassword, updateUserUsername } from "../../../services/user.js";
import { sanitiseUser } from "../../../services/sanitise.js";
import { respondSuccess } from "../../../services/responses.js";
import { ConflictRequestError, ForbiddenError, NotFoundError, errorHandler } from "../../../services/ErrorHandler.js";
import { deleteUserVMPermissionsAll, deleteVMsAll } from "../../../services/vm.js";

export const userRoutes = new Elysia({ prefix: "/api/v1/users" })
  .use(authGuard)
  .get("/", async ({ user }) => {
    try {
      if (user.isUnraidUser) {
        const allUsers = getUsers();
        const sanitisedUsers = allUsers.map((u) => sanitiseUser(u));
        return respondSuccess({
          user: { id: user.id, isUnraidUser: user.isUnraidUser },
          users: sanitisedUsers,
        });
      }
      const u = getUserById(user.id);
      if (!u) throw new NotFoundError('Unable to find user');
      return respondSuccess({ user: sanitiseUser(u) });
    } catch (error) {
      return errorHandler(error as Error);
    }
  })
  .get("/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users are allowed');
      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Unable to find user');
      return respondSuccess(sanitiseUser(u));
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
  })
  .post("/", async ({ user, body }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Must be logged in as unraid user');
      const { username, password } = body;

      if (username === config.unraid.username) {
        throw new ConflictRequestError('Cannot use a username that an unraid user has');
      }

      const existing = getUserByUsername(username);
      if (existing) throw new ConflictRequestError('A user already exists with this username');

      const newUser = await createUser(username, password);
      return respondSuccess({ user: sanitiseUser(newUser) });
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 16 }),
      password: t.String({ minLength: 6, maxLength: 255 }),
    }),
  })
  .put("/:userId/username", async ({ user, params, body }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users are allowed');

      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Unable to find user');

      const existing = getUserByUsername(body.username);
      if (existing) throw new ConflictRequestError('A user already exists with this username');

      const updated = updateUserUsername(params.userId, body.username);
      return respondSuccess(sanitiseUser(updated));
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
    body: t.Object({ username: t.String({ minLength: 3, maxLength: 16 }) }),
  })
  .put("/:userId/password", async ({ user, params, body }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users are allowed');

      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Unable to find user');

      const updated = await updateUserPassword(params.userId, body.password);
      return respondSuccess(sanitiseUser(updated));
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
    body: t.Object({ password: t.String({ minLength: 6, maxLength: 255 }) }),
  })
  .delete("/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users are allowed');

      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Unable to find user');

      deleteVMsAll(params.userId);
      deleteUserVMPermissionsAll(params.userId);
      const deleted = deleteUser(params.userId);

      return respondSuccess(sanitiseUser(deleted));
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
  });

