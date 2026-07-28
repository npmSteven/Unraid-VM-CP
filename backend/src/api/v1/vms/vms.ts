import { Elysia, t } from "elysia";
import { authGuard } from "../../../middleware/auth.js";
import { ConflictRequestError, ForbiddenError, NotFoundError, errorHandler } from "../../../services/ErrorHandler.js";
import { respondSuccess } from "../../../services/responses.js";
import type { UnraidClient } from "../../../services/UnraidClient.js";
import type { VMActionPermission } from "../../../types/IUserVMPermissions.js";
import { getUserById } from "../../../services/user.js";
import { checkIsVMLinkedToUser, createUserVMPermissions, deleteUserVMPermissions, getLinkableVMs, getVMByUserIdAndUnraidVMId, getVMsByUserId, linkVMToUser, unlinkVMFromUser, getVMByUserIdAndUnraidVMIdNoPermissions, updateUserVMPermissions } from "../../../services/vm.js";

const vmAction = (
  permission: VMActionPermission,
  fn: (unraidVMId: string, unraidClient: UnraidClient) => Promise<unknown>,
) => async ({ params, user, unraidClient }: {
  params: { unraidVMId: string };
  user: { id: string; isUnraidUser: boolean };
  unraidClient: UnraidClient;
}) => {
  try {
    const { unraidVMId } = params;
    const vmUnraid = await unraidClient.getVMByIdUnraid(unraidVMId);
    if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

    if (!user.isUnraidUser) {
      const isLinked = checkIsVMLinkedToUser(unraidVMId, user.id);
      if (!isLinked) throw new ConflictRequestError('VM not linked');
      const vm = await getVMByUserIdAndUnraidVMId(user.id, vmUnraid.id, unraidClient);
      if (!vm?.permissions?.[permission]) {
        throw new ForbiddenError('You do not have the permissions');
      }
    }

    const data = await fn(unraidVMId, unraidClient);
    return respondSuccess(data);
  } catch (error) {
    return errorHandler(error as Error);
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
    try {
      if (user.isUnraidUser) {
        const vms = await unraidClient.getVMsUnraid();
        return respondSuccess(vms);
      }
      const vms = await getVMsByUserId(user.id, unraidClient);
      return respondSuccess(vms);
    } catch (error) {
      return errorHandler(error as Error);
    }
  })

  .get("/users/:userId", async ({ user, params, unraidClient }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vms = await getVMsByUserId(params.userId, unraidClient);
      return respondSuccess(vms);
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, { params: userIdParam })

  .get("/users/:userId/linkable", async ({ user, params, unraidClient }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vms = await getLinkableVMs(params.userId, unraidClient);
      return respondSuccess(vms);
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, { params: userIdParam })

  .get("/:unraidVMId/users/:userId", async ({ user, params, unraidClient }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vm = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isLinked) throw new ForbiddenError('VM is not linked to this user');
      const unraidVM = await getVMByUserIdAndUnraidVMId(userId, unraidVMId, unraidClient);
      return respondSuccess(unraidVM);
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  .post("/:unraidVMId/users/:userId", async ({ user, params, unraidClient }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vm = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (isLinked) throw new ConflictRequestError('VM is already linked to this user');
      const vmLink = linkVMToUser(unraidVMId, userId);
      const permissions = createUserVMPermissions(vmLink.id, userId);
      return respondSuccess({ ...vmLink, permissions });
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  .delete("/:unraidVMId/users/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isLinked) throw new NotFoundError('VM is not linked to a user');
      const vmLink = unlinkVMFromUser(unraidVMId, userId);
      const permissions = deleteUserVMPermissions(vmLink.id, userId);
      return respondSuccess({ ...vmLink, permissions });
    } catch (error) {
      return errorHandler(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  .put("/:unraidVMId/users/:userId/permissions", async ({ user, params, body, unraidClient }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vmUnraid = await unraidClient.getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isLinked) throw new NotFoundError('VM not linked to user');
      const vm = getVMByUserIdAndUnraidVMIdNoPermissions(unraidVMId, userId);
      const updated = updateUserVMPermissions(vm.id, userId, body as Record<string, boolean>);
      return respondSuccess(updated);
    } catch (error) {
      return errorHandler(error as Error);
    }
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
