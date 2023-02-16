import express, { Response } from 'express';
import { Model } from 'sequelize';

import { config } from '../../../config.js';

// Validation
import { validateReq } from '../../../middleware/validateReq.js';
import { checkPassword, checkUsername } from '../../../validation/validation.js';

// Middlware
import { authCheck } from '../../../middleware/authCheck.js';

// Types
import { IRequestAuth } from '../../../types/IRequestAuth.js';
import { IUser } from '../../../types/IUser.js';

// Services
import { createUser, getUserById, getUserByUsername, getUsers } from '../../../services/user.js';
import { sanitiseUser } from '../../../services/sanitise.js';
import { respondSuccess } from '../../../services/responses.js';
import { ConflictRequestError, errorHandler, ForbiddenError, NotFoundError } from '../../../services/ErrorHandler.js';

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

export default router;
