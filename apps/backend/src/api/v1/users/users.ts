import { Elysia, t } from "elysia";
import { config } from "../../../config.js";
import { authGuard } from "../../../middleware/auth.js";
import { createUser, deleteUser, getUserById, getUserByUsername, getUsers, updateUserPassword, updateUserUsername } from "../../../services/user.js";
import { sanitiseUser } from "../../../services/sanitise.js";
import { respondSuccess, respond, respondAsync, AppErr } from "@unraid-vm-cp/shared-types";
import { deleteUserVMPermissionsAll, deleteVMsAll } from "../../../services/vm.js";
import { err, ok } from "neverthrow";

export const userRoutes = new Elysia({ prefix: "/api/v1/users" })
  .use(authGuard)
  .get("/", async ({ user }) => {
    if (user.isUnraidUser) {
      const allUsersRes = getUsers();
      if (allUsersRes.isErr()) return respond(err(allUsersRes.error));
      const sanitisedUsers = allUsersRes.value.map((u) => sanitiseUser(u));
      return respondSuccess({
        user: { id: user.id, isUnraidUser: user.isUnraidUser },
        users: sanitisedUsers,
      });
    }
    const uRes = getUserById(user.id);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Unable to find user')));
    return respondSuccess({ user: sanitiseUser(uRes.value) });
  })
  .get("/:userId", async ({ user, params }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users are allowed')));
    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Unable to find user')));
    return respondSuccess(sanitiseUser(uRes.value));
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
  })
  .post("/", async ({ user, body }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Must be logged in as unraid user')));
    const { username, password } = body;

    if (username === config.unraid.username) {
      return respond(err(AppErr.conflict('Cannot use a username that an unraid user has')));
    }

    const existingRes = getUserByUsername(username);
    if (existingRes.isErr()) return respond(err(existingRes.error));
    if (existingRes.value) return respond(err(AppErr.conflict('A user already exists with this username')));

    const newUserRes = await createUser(username, password);
    return respond(newUserRes.map(sanitiseUser));
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 16 }),
      password: t.String({ minLength: 6, maxLength: 255 }),
    }),
  })
  .put("/:userId/username", async ({ user, params, body }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users are allowed')));

    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Unable to find user')));

    const existingRes = getUserByUsername(body.username);
    if (existingRes.isErr()) return respond(err(existingRes.error));
    if (existingRes.value) return respond(err(AppErr.conflict('A user already exists with this username')));

    const updatedRes = await updateUserUsername(params.userId, body.username);
    return respond(updatedRes.map(sanitiseUser));
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
    body: t.Object({ username: t.String({ minLength: 3, maxLength: 16 }) }),
  })
  .put("/:userId/password", async ({ user, params, body }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users are allowed')));

    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Unable to find user')));

    const updatedRes = await updateUserPassword(params.userId, body.password);
    return respond(updatedRes.map(sanitiseUser));
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
    body: t.Object({ password: t.String({ minLength: 6, maxLength: 255 }) }),
  })
  .delete("/:userId", async ({ user, params }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users are allowed')));

    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Unable to find user')));

    deleteVMsAll(params.userId);
    deleteUserVMPermissionsAll(params.userId);
    const deletedRes = deleteUser(params.userId);

    return respond(deletedRes.map(sanitiseUser));
  }, {
    params: t.Object({ userId: t.String({ format: "uuid" }) }),
  });
