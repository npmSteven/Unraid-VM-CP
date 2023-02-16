import express, { Response } from 'express';
import { authCheck } from '../../../middleware/authCheck.js';
import { ConflictRequestError, errorHandler, ForbiddenError, NotFoundError } from '../../../services/ErrorHandler.js';
import { respondSuccess } from '../../../services/responses.js';
import { getVMById, getVMByUnraidVMId, getVMs } from '../../../services/unraid.js';
import { getUserById } from '../../../services/user.js';
import { checkIsVMLinkedToUser, getVMsByUserId, linkVMToUser } from '../../../services/vm.js';
import { IRequestAuth } from '../../../types/IRequestAuth.js';
import { checkUUID } from '../../../validation/validation.js';

const router = express.Router();

router.get('/', authCheck,
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (req?.user?.isUnraidUser) {
        const vms = await getVMs()
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

router.post('/:unraidVMId/users/:userId',
  [
    authCheck,
    checkUUID('unraidVMId'),
    checkUUID('userId'),
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
      const vm = await getVMByUnraidVMId(unraidVMId);
      if (!vm) throw new NotFoundError('Provided vm id does not exist');

      // Check if the vm is allready linked to the user
      const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, userId);
      if (isVMLinkedToUser) {
        throw new ConflictRequestError('VM is already linked to this user');
      }

      const vmLink = await linkVMToUser(unraidVMId, userId);
      return res.json(respondSuccess(vmLink));
    } catch (error) {
      console.error('ERROR - /:vmId/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

export default router;
