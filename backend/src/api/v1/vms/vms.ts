import { Elysia, t } from "elysia";
import { authGuard } from "../../../middleware/auth.js";
import { ConflictRequestError, ForbiddenError, NotFoundError } from "../../../services/ErrorHandler.js";
import { respondSuccess } from "../../../services/responses.js";
import { getVMByIdUnraid, getVMsUnraid, startVMUnraid, stopVMUnraid, restartVMUnraid, pauseVMUnraid, resumeVMUnraid, hibernateVMUnraid, forceStopVMUnraid, removeVMUnraid, removeVMAndDisksVMUnraid } from "../../../services/unraid.js";
import { getUserById } from "../../../services/user.js";
import { checkIsVMLinkedToUser, createUserVMPermissions, deleteUserVMPermissions, getLinkableVMs, getVMByUserIdAndUnraidVMId, getVMsByUserId, linkVMToUser, unlinkVMFromUser, getUserVMPermissionByUserIdAndVMId, getVMByUserIdAndUnraidVMIdNoPermissions, updateUserVMPermissions } from "../../../services/vm.js";

const vmAction = (
  permission: string,
  fn: (id: string) => Promise<unknown>,
) => async ({ params, user }: { params: { unraidVMId: string }; user: { id: string; isUnraidUser: boolean } }) => {
  try {
    const { unraidVMId } = params;
    const vmUnraid = await getVMByIdUnraid(unraidVMId);
    if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

    if (!user.isUnraidUser) {
      const isLinked = checkIsVMLinkedToUser(unraidVMId, user.id);
      if (!isLinked) throw new ConflictRequestError('VM not linked');
      const vm = await getVMByUserIdAndUnraidVMId(user.id, vmUnraid.id);
      if (!(vm!.permissions as Record<string, boolean>)[permission]) {
        throw new ForbiddenError('You do not have the permissions');
      }
    }

    const data = await fn(unraidVMId);
    return respondSuccess(data);
  } catch (error) {
    return handleError(error as Error);
  }
};

function handleError(error: Error & { statusCode?: number }): Response {
  if (error instanceof NotFoundError) {
    return Response.json({ success: false, payload: [error.message] }, { status: 404 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json({ success: false, payload: [error.message] }, { status: 403 });
  }
  if (error instanceof ConflictRequestError) {
    return Response.json({ success: false, payload: [error.message] }, { status: 409 });
  }
  console.error('ERROR', error);
  return Response.json({ success: false, payload: ["Internal server error"] }, { status: 500 });
}

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

  // GET /vms — list VMs for current user (or all for unraid user)
  .get("/", async ({ user }) => {
    try {
      if (user.isUnraidUser) {
        const vms = await getVMsUnraid();
        return respondSuccess(vms);
      }
      const vms = await getVMsByUserId(user.id);
      return respondSuccess(vms);
    } catch (error) {
      return handleError(error as Error);
    }
  })

  // GET /vms/users/:userId — linked VMs for a specific user
  .get("/users/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vms = await getVMsByUserId(params.userId);
      return respondSuccess(vms);
    } catch (error) {
      return handleError(error as Error);
    }
  }, { params: userIdParam })

  // GET /vms/users/:userId/linkable — unlinked VMs
  .get("/users/:userId/linkable", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const u = getUserById(params.userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vms = await getLinkableVMs(params.userId);
      return respondSuccess(vms);
    } catch (error) {
      return handleError(error as Error);
    }
  }, { params: userIdParam })

  // GET /vms/:unraidVMId/users/:userId — single linked VM
  .get("/:unraidVMId/users/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vm = await getVMByIdUnraid(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isLinked) throw new ForbiddenError('VM is not linked to this user');
      const unraidVM = await getVMByUserIdAndUnraidVMId(userId, unraidVMId);
      return respondSuccess(unraidVM);
    } catch (error) {
      return handleError(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  // POST /vms/:unraidVMId/users/:userId — link VM to user
  .post("/:unraidVMId/users/:userId", async ({ user, params }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vm = await getVMByIdUnraid(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (isLinked) throw new ConflictRequestError('VM is already linked to this user');
      const vmLink = linkVMToUser(unraidVMId, userId);
      const permissions = createUserVMPermissions(vmLink.id, userId);
      return respondSuccess({ ...vmLink, permissions });
    } catch (error) {
      return handleError(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  // DELETE /vms/:unraidVMId/users/:userId — unlink VM
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
      return handleError(error as Error);
    }
  }, { params: unraidVMUserIdParam })

  // PUT /vms/:unraidVMId/users/:userId/permissions
  .put("/:unraidVMId/users/:userId/permissions", async ({ user, params, body }) => {
    try {
      if (!user.isUnraidUser) throw new ForbiddenError('Only unraid users allowed');
      const { userId, unraidVMId } = params;
      const u = getUserById(userId);
      if (!u) throw new NotFoundError('Provided user id does not exist');
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');
      const isLinked = checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isLinked) throw new NotFoundError('VM not linked to user');
      const vm = getVMByUserIdAndUnraidVMIdNoPermissions(unraidVMId, userId);
      const updated = updateUserVMPermissions(vm.id, userId, body as Record<string, boolean>);
      return respondSuccess(updated);
    } catch (error) {
      return handleError(error as Error);
    }
  }, { params: unraidVMUserIdParam, body: vmPermissionsBody })

  // VM actions using the withVMAction helper
  .post("/:unraidVMId/start", vmAction("canStart", startVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/stop", vmAction("canStop", stopVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/restart", vmAction("canRestart", restartVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/pause", vmAction("canPause", pauseVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/resume", vmAction("canResume", resumeVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/hibernate", vmAction("canHibernate", hibernateVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/force-stop", vmAction("canForceStop", forceStopVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/remove-vm", vmAction("canRemoveVM", removeVMUnraid), { params: uuidParam })
  .post("/:unraidVMId/remove-vm-and-disks", vmAction("canRemoveVMAndDisks", removeVMAndDisksVMUnraid), { params: uuidParam });
