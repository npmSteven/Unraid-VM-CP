import express, { Response } from 'express';

// Middleware
import { authCheck } from '../../../middleware/authCheck.js';
import { validateReq } from '../../../middleware/validateReq.js';

// Services
import { ConflictRequestError, errorHandler, ForbiddenError, NotFoundError } from '../../../services/ErrorHandler.js';
import { respondSuccess } from '../../../services/responses.js';
import { getVMByIdUnraid, getVMsUnraid, startVMUnraid, stopVMUnraid, restartVMUnraid, pauseVMUnraid, resumeVMUnraid, hibernateVMUnraid, forceStopVMUnraid, removeVMUnraid, removeVMAndDisksVMUnraid } from '../../../services/unraid.js';
import { getUserById } from '../../../services/user.js';
import { checkIsVMLinkedToUser, createUserVMPermissions, deleteUserVMPermissions, getLinkableVMs, getVMByUserIdAndUnraidVMId, getVMsByUserId, linkVMToUser, unlinkVMFromUser, getUserVMPermissionByUserIdAndVMId, getVMByUserIdAndUnraidVMIdNoPermissions } from '../../../services/vm.js';

// Types
import { IRequestAuth } from '../../../types/IRequestAuth.js';

// Validation
import { checkUUID, checkVMPermissions } from '../../../validation/validation.js';

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
 * Get a single VM of a user
 */
router.get('/:unraidVMId/users/:userId',
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


      // Check if the vm is linked to the user
      const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isVMLinkedToUser) {
        throw new ForbiddenError('VM is not linked to this user');
      }

      const unraidVM = await getVMByUserIdAndUnraidVMId(userId, unraidVMId);

      return res.json(respondSuccess(unraidVM));
    } catch (error) {
      console.error('ERROR - /:vmId/users/:userId', error);
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

type IUpdatePermissionsBody = {
  canStart: boolean
  canStop: boolean
  canRemoveVM: boolean
  canRemoveVMAndDisks: boolean
  canForceStop: boolean
  canRestart: boolean
  canPause: boolean
  canHibernate: boolean
  canResume: boolean
}

/**
 * Update permissions for a VM
 */
router.put('/:unraidVMId/users/:userId/permissions',
  [
    authCheck,
    checkUUID('unraidVMId'),
    checkUUID('userId'),
    checkVMPermissions(),
    validateReq,
  ],
  async (req: IRequestAuth<IUpdatePermissionsBody>, res: Response) => {
    try {
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      const { userId, unraidVMId } = req.params;

      // Check if provided user id exists
      const user = await getUserById(userId);
      if (!user) throw new NotFoundError('Provided user id does not exist');

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      // Check if the vm is already linked to the user
      const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, userId);
      if (!isVMLinkedToUser) {
        throw new NotFoundError('Unable to update the permissions of a VM that is not linked to a user');
      }

      const {
        canStart,
        canStop,
        canRemoveVM,
        canRemoveVMAndDisks,
        canForceStop,
        canRestart,
        canPause,
        canHibernate,
        canResume,
      } = req.body;
      
      const vm = await getVMByUserIdAndUnraidVMIdNoPermissions(unraidVMId, userId);
      const vmPermissions = await getUserVMPermissionByUserIdAndVMId(userId, vm.dataValues.id);

      const updatedVMPermissions = await vmPermissions.update({
        canStart,
        canStop,
        canRemoveVM,
        canRemoveVMAndDisks,
        canForceStop,
        canRestart,
        canPause,
        canHibernate,
        canResume,
      });

      return res.json(respondSuccess(updatedVMPermissions.dataValues));
    } catch (error) {
      console.error('ERROR - /:vmId/users/:userId', error);
      return errorHandler(res, error);
    }
  }
);

router.post('/:unraidVMId/start',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canStart) throw new ForbiddenError('You do not have the permissions'); 
      }

      const data = await startVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/start', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/stop',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canStop) throw new ForbiddenError('You do not have the permissions');  
      }

      const data = await stopVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/stop', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/restart',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canRestart) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await restartVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/restart', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/pause',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canPause) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await pauseVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/pause', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/resume',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canResume) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await resumeVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/resume', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/hibernate',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canHibernate) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await hibernateVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/hibernate', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/force-stop',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canForceStop) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await forceStopVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/force-stop', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/remove-vm',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canRemoveVM) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await removeVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/remove-vm', error);
      return errorHandler(res, error);
    }
  }
)

router.post('/:unraidVMId/remove-vm-and-disks',
  [
    authCheck,
    checkUUID('unraidVMId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      const { unraidVMId } = req.params;

      // Check if unraidVMId exists
      const vmUnraid = await getVMByIdUnraid(unraidVMId);
      if (!vmUnraid) throw new NotFoundError('Provided vm id does not exist');

      if (!req.user.isUnraidUser) {
        // Check if the vm is already linked to the user
        const isVMLinkedToUser = await checkIsVMLinkedToUser(unraidVMId, req.user.id);
        if (!isVMLinkedToUser) {
          throw new ConflictRequestError('VM not linked');
        }
        const vm = await getVMByUserIdAndUnraidVMId(req.user.id, vmUnraid.id);
        if (!vm.permissions.canRemoveVMAndDisks) throw new ForbiddenError('You do not have the permissions');   
      }

      const data = await removeVMAndDisksVMUnraid(unraidVMId);

      return res.json(respondSuccess(data));
    } catch (error) {
      console.error('ERROR - /:unraidVMId/remove-vm-and-disks', error);
      return errorHandler(res, error);
    }
  }
)

export default router;
