import express, { Response } from 'express';

// Middleware
import { authCheck } from '../../../middleware/authCheck.js';
import { validateReq } from '../../../middleware/validateReq.js';

// Services
import { ConflictRequestError, errorHandler, ForbiddenError, NotFoundError } from '../../../services/ErrorHandler.js';
import { respondSuccess } from '../../../services/responses.js';
import { getVMByIdUnraid, getVMsUnraid } from '../../../services/unraid.js';
import { getUserById } from '../../../services/user.js';
import { checkIsVMLinkedToUser, createUserVMPermissions, deleteUserVMPermissions, getLinkableVMs, getVMsByUserId, linkVMToUser, unlinkVMFromUser } from '../../../services/vm.js';

// Types
import { IRequestAuth } from '../../../types/IRequestAuth.js';

// Validation
import { checkUUID } from '../../../validation/validation.js';

const router = express.Router();

/**
 * Get VMs
 */
router.get('/',
  [
    authCheck,
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (req?.user?.isUnraidUser) {
        const vms = await getVMsUnraid()
        return res.json(respondSuccess(vms));
      }

      const vms = await getVMsByUserId(req.user.id);
      return res.json(respondSuccess(vms));
    } catch (error) {
      console.error('ERROR - /vms', error);
      return errorHandler(res, error);
    }
  }
);

/**
 * Get linked VMs of a specific user
 */
router.get('/users/:userId',
  [
    authCheck,
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      const { userId } = req.params;

      // Check if the userId is valid
      const user = await getUserById(userId);
      if (!user) throw new NotFoundError('Provided user id does not exist');

      const vms = await getVMsByUserId(userId);
      return res.json(respondSuccess(vms));
    } catch (error) {
      console.error('ERROR - /vms/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

/**
 * Get VMs that haven't been linked yet
 */
router.get('/users/:userId/linkable',
  [
    authCheck,
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      const { userId } = req.params;

      // Check if the userId is valid
      const user = await getUserById(userId);
      if (!user) throw new NotFoundError('Provided user id does not exist');

      const vms = await getLinkableVMs(userId);
      return res.json(respondSuccess(vms));
    } catch (error) {
      console.error('ERROR - /vms/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

/**
 * Link a VM to a user
 */
router.post('/:unraidVMId/users/:userId',
  [
    authCheck,
    checkUUID('unraidVMId'),
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      const { userId, unraidVMId } = req.params;

      // Check if provided user id exists
      const user = await getUserById(userId);
      if (!user) throw new NotFoundError('Provided user id does not exist');

      // Check if unraidVMId exists
      const vm = await getVMByIdUnraid(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');

      // Check if the vm is already linked to the user
      const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, userId);
      if (isVMLinkedToUser) {
        throw new ConflictRequestError('VM is already linked to this user');
      }

      const vmLink = await linkVMToUser(unraidVMId, userId);

      const permissions = await createUserVMPermissions(vmLink.dataValues.id, userId);

      return res.json(respondSuccess({ ...vmLink.dataValues, permissions: permissions.dataValues }));
    } catch (error) {
      console.error('ERROR - /:vmId/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

/**
 * Unlink a VM from a user
 */
router.delete('/:unraidVMId/users/:userId',
  [
    authCheck,
    checkUUID('unraidVMId'),
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      const { userId, unraidVMId } = req.params;

      // Check if the vm is already linked to the user
      const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isVMLinkedToUser) {
        throw new NotFoundError('VM is not linked to a user');
      }

      const vmLink = await unlinkVMFromUser(unraidVMId, userId);

      const permissions = await deleteUserVMPermissions(vmLink.dataValues.id, userId);

      return res.json(respondSuccess({ ...vmLink.dataValues, permissions: permissions.dataValues }));
    } catch (error) {
      console.error('ERROR - /:vmId/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

export default router;
