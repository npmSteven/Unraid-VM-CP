import express, { Response } from 'express';
import { Model } from 'sequelize';

import { config } from '../../../config.js';

// Validation
import { validateReq } from '../../../middleware/validateReq.js';
import { checkPassword, checkUsername, checkUUID } from '../../../validation/validation.js';

// Middleware
import { authCheck } from '../../../middleware/authCheck.js';

// Types
import { IRequestAuth } from '../../../types/IRequestAuth.js';
import { IUser } from '../../../types/IUser.js';

// Services
import { createUser, deleteUser, getUserById, getUserByUsername, getUsers, updateUserPassword, updateUserUsername } from '../../../services/user.js';
import { sanitiseUser } from '../../../services/sanitise.js';
import { respondSuccess } from '../../../services/responses.js';
import { ConflictRequestError, errorHandler, ForbiddenError, NotFoundError } from '../../../services/ErrorHandler.js';
import { deleteUserVMPermissionsAll, deleteVMsAll } from '../../../services/vm.js';

const router = express.Router();

router.get('/',
  [
    authCheck,
  ], async (req: IRequestAuth, res: Response) => {
    try {
      if (req.user.isUnraidUser) {
        const users = await getUsers();
        const sanitisedUsers = users.map((u: Model<IUser, IUser>) => sanitiseUser(u.dataValues))
        return res.json(respondSuccess({ user: { id: req.user.id, isUnraidUser: req.user.isUnraidUser }, users: sanitisedUsers }));
      }

      const user = await getUserById(req.user.id);
      if (!user) throw new NotFoundError('Unable to find user');

      return res.json(respondSuccess({ user: sanitiseUser(user.dataValues) }));
    } catch (error) {
      console.error('ERROR - /users', error);
      return errorHandler(res, error);
    }
  }
)

router.get(
  '/:userId',
  [
    authCheck,
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      // Check if the user exists
      const user = await getUserById(req.params.userId);
      if (!user) throw new NotFoundError('Unable to find user');

      return res.json(respondSuccess(sanitiseUser(user.dataValues)));
    } catch (error) {
      console.error('ERROR - /:userId get', error);
      return errorHandler(res, error);
    }
  }
)

type IUserCreateBody = {
  username: string
  password: string
}

/**
 * Create a user
 */
router.post('/',
  [
    authCheck,
    checkUsername,
    checkPassword,
    validateReq,
  ], async (req: IRequestAuth<IUserCreateBody>, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('You must be logged in as an unraid user, to call this endpoint');
      }

      const { username, password } = req.body;
      const { unraid } = config;

      // Check if username is unraid username
      if (username === unraid.username) {
        throw new ConflictRequestError('Cannot use a username that an unraid user has')
      }

      // Check if username is already taken
      const user = await getUserByUsername(username);
      if (user) throw new ConflictRequestError('A user already exists with this username')
      
      const newUser = await createUser(username, password);

      return res.json(respondSuccess({ user: sanitiseUser(newUser.dataValues) }))
    } catch (error) {
      console.error('ERROR - /users', error);
      return errorHandler(res, error);
    }
  }
)

/**
 * Update username
 */
router.put(
  '/:userId/username',
  [
    authCheck,
    checkUUID('userId'),
    checkUsername,
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      // Check if the user exists
      const user = await getUserById(req.params.userId);
      if (!user) throw new NotFoundError('Unable to find user');

      // Check if the username is already taken
      const userWithUsername = await getUserByUsername(req.body.username);
      if (userWithUsername) throw new ConflictRequestError('A user already exists with this username');

      // Update user username
      const updatedUser = await updateUserUsername(req.params.userId, req.body.username);

      return res.json(respondSuccess(sanitiseUser(updatedUser.dataValues)));
    } catch (error) {
      console.error('ERROR - /:userId/username put', error);
      return errorHandler(res, error);
    }
  }
)

/**
 * Update password
 */
router.put(
  '/:userId/password',
  [
    authCheck,
    checkUUID('userId'),
    checkPassword,
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      // Check if the user exists
      const user = await getUserById(req.params.userId);
      if (!user) throw new NotFoundError('Unable to find user');

      // Update user password
      const updatedUser = await updateUserPassword(req.params.userId, req.body.password);

      return res.json(respondSuccess(sanitiseUser(updatedUser.dataValues)));
    } catch (error) {
      console.error('ERROR - /:userId/password put', error);
      return errorHandler(res, error);
    }
  }
)

/**
 * Delete user
 */
router.delete(
  '/:userId',
  [
    authCheck,
    checkUUID('userId'),
    validateReq,
  ],
  async (req: IRequestAuth, res: Response) => {
    try {
      // Check is Unraid user
      if (!req?.user?.isUnraidUser) {
        throw new ForbiddenError('Only unraid users are allowed to use this endpoint');
      }

      // Check if the user exists
      const user = await getUserById(req.params.userId);
      if (!user) throw new NotFoundError('Unable to find user');

      // Delete vms
      await deleteVMsAll(req.params.userId);

      // Delete permissions
      await deleteUserVMPermissionsAll(req.params.userId)

      // Delete user
      const deletedUser = await deleteUser(req.params.userId);

      return res.json(respondSuccess(sanitiseUser(deletedUser.dataValues)));
    } catch (error) {
      console.error('ERROR - /:userId delete', error);
      return errorHandler(res, error);
    }
  }
)

export default router;
