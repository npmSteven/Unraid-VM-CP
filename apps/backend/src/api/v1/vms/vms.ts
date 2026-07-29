import { Elysia, t } from "elysia";
import { authGuard } from "../../../middleware/auth.js";
import { respondSuccess, respond, respondAsync, AppErr, type VMPermissionKey } from "@unraid-vm-cp/shared-types";
import type { UnraidClient } from "@unraid-vm-cp/unraid-client";
import { getUserById } from "../../../services/user.js";
import {
  checkIsVMLinkedToUser,
  createUserVMPermissions,
  deleteUserVMPermissions,
  getLinkableVMs,
  getVMByUserIdAndUnraidVMId,
  getVMsByUserId,
  linkVMToUser,
  unlinkVMFromUser,
  getVMByUserIdAndUnraidVMIdNoPermissions,
  updateUserVMPermissions,
} from "../../../services/vm.js";
import { err, ok } from "neverthrow";

const vmAction = (
  permission: VMPermissionKey,
  fn: (unraidVMId: string, unraidClient: UnraidClient) => Promise<unknown>,
) => async ({ params, user, unraidClient }: {
  params: { unraidVMId: string };
  user: { id: string; isUnraidUser: boolean };
  unraidClient: UnraidClient;
}) => {
  const { unraidVMId } = params;
  try {
    const vmUnraid = await unraidClient.getVMByIdUnraid(unraidVMId);
    if (!vmUnraid) return respond(err(AppErr.notFound('Provided vm id does not exist')));

    if (!user.isUnraidUser) {
      const isLinkedRes = checkIsVMLinkedToUser(unraidVMId, user.id);
      if (isLinkedRes.isErr()) return respond(err(isLinkedRes.error));
      if (!isLinkedRes.value) return respond(err(AppErr.conflict('VM not linked')));

      const vmRes = await getVMByUserIdAndUnraidVMId(user.id, vmUnraid.id, unraidClient);
      if (vmRes.isErr()) return respond(err(vmRes.error));
      if (!vmRes.value?.permissions?.[permission]) {
        return respond(err(AppErr.forbidden('You do not have the permissions')));
      }
    }

    const data = await fn(unraidVMId, unraidClient);
    return respondSuccess(data);
  } catch (error) {
    return respond(err(AppErr.unraid(error instanceof Error ? error.message : 'VM action failed')));
  }
};

const uuidParam = t.Object({ unraidVMId: t.String({ format: "uuid" }) });
const userIdParam = t.Object({ userId: t.String({ format: "uuid" }) });
const unraidVMUserIdParam = t.Object({
  unraidVMId: t.String({ format: "uuid" }),
  userId: t.String({ format: "uuid" }),
});

const vmPermissionsBody = t.Object({
  canStart: t.Boolean(),
  canStop: t.Boolean(),
  canRemoveVM: t.Boolean(),
  canRemoveVMAndDisks: t.Boolean(),
  canForceStop: t.Boolean(),
  canRestart: t.Boolean(),
  canPause: t.Boolean(),
  canHibernate: t.Boolean(),
  canResume: t.Boolean(),
});

export const vmRoutes = new Elysia({ prefix: "/api/v1/vms" })
  .use(authGuard)

  .get("/", async ({ user, unraidClient }) => {
    if (user.isUnraidUser) {
      try {
        const vms = await unraidClient.getVMsUnraid();
        return respondSuccess(vms);
      } catch (e) {
        return respond(err(AppErr.unraid(e instanceof Error ? e.message : 'Failed to fetch VMs')));
      }
    }
    const res = await getVMsByUserId(user.id, unraidClient);
    return respond(res);
  })

  .get("/users/:userId", async ({ user, params, unraidClient }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Provided user id does not exist')));

    const res = await getVMsByUserId(params.userId, unraidClient);
    return respond(res);
  }, { params: userIdParam })

  .get("/users/:userId/linkable", async ({ user, params, unraidClient }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const uRes = getUserById(params.userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Provided user id does not exist')));

    const res = await getLinkableVMs(params.userId, unraidClient);
    return respond(res);
  }, { params: userIdParam })

  .get("/:unraidVMId/users/:userId", async ({ user, params, unraidClient }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const { userId, unraidVMId } = params;
    const uRes = getUserById(userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Provided user id does not exist')));

    try {
      const vm = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vm) return respond(err(AppErr.notFound('Provided vm id does not exist')));
    } catch (e) {
      return respond(err(AppErr.unraid(e instanceof Error ? e.message : 'Error checking VM')));
    }

    const isLinkedRes = checkIsVMLinkedToUser(unraidVMId, userId);
    if (isLinkedRes.isErr()) return respond(err(isLinkedRes.error));
    if (!isLinkedRes.value) return respond(err(AppErr.forbidden('VM is not linked to this user')));

    const res = await getVMByUserIdAndUnraidVMId(userId, unraidVMId, unraidClient);
    return respond(res);
  }, { params: unraidVMUserIdParam })

  .post("/:unraidVMId/users/:userId", async ({ user, params, unraidClient }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const { userId, unraidVMId } = params;
    const uRes = getUserById(userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Provided user id does not exist')));

    try {
      const vm = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vm) return respond(err(AppErr.notFound('Provided vm id does not exist')));
    } catch (e) {
      return respond(err(AppErr.unraid(e instanceof Error ? e.message : 'Error checking VM')));
    }

    const isLinkedRes = checkIsVMLinkedToUser(unraidVMId, userId);
    if (isLinkedRes.isErr()) return respond(err(isLinkedRes.error));
    if (isLinkedRes.value) return respond(err(AppErr.conflict('VM is already linked to this user')));

    const linkRes = linkVMToUser(unraidVMId, userId);
    if (linkRes.isErr()) return respond(err(linkRes.error));
    const vmLink = linkRes.value;

    const permRes = createUserVMPermissions(vmLink.id, userId);
    if (permRes.isErr()) return respond(err(permRes.error));

    return respondSuccess({ ...vmLink, permissions: permRes.value });
  }, { params: unraidVMUserIdParam })

  .delete("/:unraidVMId/users/:userId", async ({ user, params }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const { userId, unraidVMId } = params;

    const isLinkedRes = checkIsVMLinkedToUser(unraidVMId, userId);
    if (isLinkedRes.isErr()) return respond(err(isLinkedRes.error));
    if (!isLinkedRes.value) return respond(err(AppErr.notFound('VM is not linked to a user')));

    const unlinkRes = unlinkVMFromUser(unraidVMId, userId);
    if (unlinkRes.isErr()) return respond(err(unlinkRes.error));
    const vmLink = unlinkRes.value;

    const permRes = deleteUserVMPermissions(vmLink.id, userId);
    if (permRes.isErr()) return respond(err(permRes.error));

    return respondSuccess({ ...vmLink, permissions: permRes.value });
  }, { params: unraidVMUserIdParam })

  .put("/:unraidVMId/users/:userId/permissions", async ({ user, params, body, unraidClient }) => {
    if (!user.isUnraidUser) return respond(err(AppErr.forbidden('Only unraid users allowed')));
    const { userId, unraidVMId } = params;

    const uRes = getUserById(userId);
    if (uRes.isErr()) return respond(err(uRes.error));
    if (!uRes.value) return respond(err(AppErr.notFound('Provided user id does not exist')));

    try {
      const vmUnraid = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) return respond(err(AppErr.notFound('Provided vm id does not exist')));
    } catch (e) {
      return respond(err(AppErr.unraid(e instanceof Error ? e.message : 'Error checking VM')));
    }

    const isLinkedRes = checkIsVMLinkedToUser(unraidVMId, userId);
    if (isLinkedRes.isErr()) return respond(err(isLinkedRes.error));
    if (!isLinkedRes.value) return respond(err(AppErr.notFound('VM not linked to user')));

    const vmRes = getVMByUserIdAndUnraidVMIdNoPermissions(unraidVMId, userId);
    if (vmRes.isErr()) return respond(err(vmRes.error));

    const updatedRes = updateUserVMPermissions(vmRes.value.id, userId, body as Record<string, boolean>);
    return respond(updatedRes);
  }, { params: unraidVMUserIdParam, body: vmPermissionsBody })

  .post("/:unraidVMId/start", vmAction("canStart", (id, c) => c.startVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/stop", vmAction("canStop", (id, c) => c.stopVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/restart", vmAction("canRestart", (id, c) => c.restartVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/pause", vmAction("canPause", (id, c) => c.pauseVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/resume", vmAction("canResume", (id, c) => c.resumeVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/hibernate", vmAction("canHibernate", (id, c) => c.hibernateVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/force-stop", vmAction("canForceStop", (id, c) => c.forceStopVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/remove-vm", vmAction("canRemoveVM", (id, c) => c.removeVMUnraid(id)), { params: uuidParam })
  .post("/:unraidVMId/remove-vm-and-disks", vmAction("canRemoveVMAndDisks", (id, c) => c.removeVMAndDisksUnraid(id)), { params: uuidParam });
